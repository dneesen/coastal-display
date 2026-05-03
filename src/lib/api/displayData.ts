import type { MarineDisplayData } from "../../types/display";
import type { DisplayProfile } from "../../types/profile";
import { fetchCurrentPredictions, fetchTidePredictions } from "./coops";
import { fetchNdbcLatest } from "./ndbc";
import { fetchNwsBundle } from "./nws";
import { profileToSearchParams } from "./profileParams";
import { normalizeCurrent } from "../normalize/normalizeCurrent";
import { normalizeNdbcSeaState } from "../normalize/normalizeSeaState";
import { normalizeTide } from "../normalize/normalizeTide";
import { normalizeNwsWeather } from "../normalize/normalizeWeather";
import { mockDisplayData } from "../mock/mockDisplayData";

export type DisplayDataResult = {
  data: MarineDisplayData;
  source: "live" | "partial" | "mock";
  errors: string[];
};

export async function buildDisplayData(profile: DisplayProfile, signal?: AbortSignal): Promise<DisplayDataResult> {
  const errors: string[] = [];
  const base: MarineDisplayData = {
    ...mockDisplayData,
    seaState: {},
    location: {
      name: profile.location.label,
      latitude: profile.location.latitude,
      longitude: profile.location.longitude,
      timezone: profile.location.timezone,
    },
    updatedAt: new Date().toISOString(),
  };

  const effectiveCurrentStationId = profile.stations.currentStationId || "FPI0902";

  const [weatherResult, tideResult, currentResult, seaStateResult] = await Promise.allSettled([
    fetchNwsBundle(profile.location.latitude, profile.location.longitude, profile.stations.weatherObservationStation, signal).then((bundle) => normalizeNwsWeather(bundle, base)),
    fetchTidePredictions(profile.stations.tideStationId, signal).then(({ points, events }) => normalizeTide(profile.stations.tideStationId, points, events)),
    fetchCurrentPredictions(effectiveCurrentStationId, signal).then(({ points, events }) => normalizeCurrent(effectiveCurrentStationId, points, events)),
    profile.stations.buoyStationId ? fetchNdbcLatest(profile.stations.buoyStationId, signal).then(normalizeNdbcSeaState) : Promise.resolve(undefined),
  ]);

  let data = base;
  if (weatherResult.status === "fulfilled") data = { ...data, ...weatherResult.value };
  else errors.push(`Weather: ${weatherResult.reason instanceof Error ? weatherResult.reason.message : "failed"}`);
  if (tideResult.status === "fulfilled") data = { ...data, tide: tideResult.value };
  else errors.push(`Tide: ${tideResult.reason instanceof Error ? tideResult.reason.message : "failed"}`);
  if (currentResult.status === "fulfilled") data = { ...data, current: currentResult.value };
  else errors.push(`Current: ${currentResult.reason instanceof Error ? currentResult.reason.message : "failed"}`);
  if (seaStateResult.status === "fulfilled" && seaStateResult.value) data = { ...data, seaState: seaStateResult.value };
  else if (seaStateResult.status === "rejected") errors.push(`Sea state: ${seaStateResult.reason instanceof Error ? seaStateResult.reason.message : "failed"}`);

  const requiredResults = [weatherResult, tideResult];
  const fulfilled = requiredResults.filter((result) => result.status === "fulfilled").length;
  return { data, source: fulfilled === 0 ? "mock" : errors.length ? "partial" : "live", errors };
}

export async function fetchDisplayData(profile: DisplayProfile, signal?: AbortSignal): Promise<DisplayDataResult> {
  if (import.meta.env.VITE_USE_API_PROXY === "true") {
    const response = await fetch(`/api/display-data?${profileToSearchParams(profile).toString()}`, { signal });
    if (!response.ok) throw new Error(`Display data API failed: ${response.status}`);
    return response.json() as Promise<DisplayDataResult>;
  }

  return buildDisplayData(profile, signal);
}
