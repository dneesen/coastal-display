import { fetchJson, fetchText } from "./http";
import { fetchNdbcLatest, type NdbcObservation } from "./ndbc";

export type StationSuggestion = {
  id: string;
  name: string;
  type: "tide" | "current" | "buoy";
  source: "NOAA CO-OPS" | "NDBC";
  distanceMiles?: number;
  detail?: string;
};

type CoopsStationList = {
  stations?: Array<{
    id: string;
    name: string;
    lat?: number;
    lng?: number;
    type?: string;
  }>;
};

type NdbcStation = {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
  owner?: string;
  pgm?: string;
  type?: string;
  met?: string;
  currents?: string;
};

export function distanceMiles(aLat: number, aLon: number, bLat?: number, bLon?: number) {
  if (bLat === undefined || bLon === undefined) return undefined;
  const radius = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function byDistance(a: StationSuggestion, b: StationSuggestion) {
  return (a.distanceMiles ?? Number.POSITIVE_INFINITY) - (b.distanceMiles ?? Number.POSITIVE_INFINITY);
}

function uniqueClosest(suggestions: StationSuggestion[]) {
  const byKey = new Map<string, StationSuggestion>();
  for (const suggestion of suggestions) {
    const key = `${suggestion.type}-${suggestion.id}`;
    const existing = byKey.get(key);
    if (!existing || byDistance(suggestion, existing) < 0) byKey.set(key, suggestion);
  }
  return Array.from(byKey.values()).sort(byDistance);
}

function attrValue(attributes: string, name: string) {
  return attributes.match(new RegExp(`${name}="([^"]*)"`))?.[1];
}

export function parseNdbcActiveStations(xml: string): NdbcStation[] {
  return Array.from(xml.matchAll(/<station\s+([^>]+?)\/>/g))
    .map((match) => {
      const attributes = match[1];
      return {
        id: attrValue(attributes, "id") || "",
        name: attrValue(attributes, "name") || "NDBC station",
        lat: Number(attrValue(attributes, "lat")),
        lon: Number(attrValue(attributes, "lon")),
        owner: attrValue(attributes, "owner"),
        pgm: attrValue(attributes, "pgm"),
        type: attrValue(attributes, "type"),
        met: attrValue(attributes, "met"),
        currents: attrValue(attributes, "currents"),
      };
    })
    .filter((station) => station.id && Number.isFinite(station.lat) && Number.isFinite(station.lon));
}

function coopsSuggestions(latitude: number, longitude: number, list: CoopsStationList, type: "tide" | "current"): StationSuggestion[] {
  return uniqueClosest((list.stations || [])
    .map((station) => ({
      id: station.id,
      name: station.name,
      type,
      source: "NOAA CO-OPS" as const,
      distanceMiles: distanceMiles(latitude, longitude, station.lat, station.lng),
      detail: type === "tide" ? "Tide predictions" : "Current predictions",
    }))
    .filter((station) => station.distanceMiles !== undefined))
    .slice(0, 5);
}

export function hasRecentSeaStateObservation(observation: NdbcObservation | undefined, now = Date.now(), maxAgeHours = 24) {
  const waveHeight = Number(observation?.WVHT);
  if (!Number.isFinite(waveHeight)) return false;
  const observedAt = observation?.updatedAt ? Date.parse(observation.updatedAt) : Number.NaN;
  if (!Number.isFinite(observedAt)) return false;
  return now - observedAt <= maxAgeHours * 60 * 60 * 1000;
}

async function ndbcSuggestions(latitude: number, longitude: number, stations: NdbcStation[], signal?: AbortSignal): Promise<StationSuggestion[]> {
  const candidates = uniqueClosest(stations
    .filter((station) => station.type === "buoy")
    .map((station) => ({
      id: station.id,
      name: station.name,
      type: "buoy" as const,
      source: "NDBC" as const,
      distanceMiles: distanceMiles(latitude, longitude, station.lat, station.lon),
      detail: [station.type, station.pgm].filter(Boolean).join(" - ") || "Active marine observations",
    }))
    .filter((station) => station.distanceMiles !== undefined))
    .slice(0, 24);

  const checked = await Promise.all(candidates.map(async (station) => {
    try {
      const observation = await fetchNdbcLatest(station.id, signal);
      return hasRecentSeaStateObservation(observation) ? station : undefined;
    } catch {
      return undefined;
    }
  }));

  return checked.filter((station): station is StationSuggestion => Boolean(station)).slice(0, 7);
}

export async function suggestStations(latitude: number, longitude: number, signal?: AbortSignal): Promise<StationSuggestion[]> {
  const [waterLevels, tidePredictions, currents, ndbcXml] = await Promise.all([
    fetchJson<CoopsStationList>("https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=waterlevels", signal),
    fetchJson<CoopsStationList>("https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions", signal).catch(() => ({ stations: [] })),
    fetchJson<CoopsStationList>("https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=currentpredictions", signal).catch(() => ({ stations: [] })),
    fetchText("/api/ndbc-active-stations", signal).catch(() => ""),
  ]);

  return [
    ...uniqueClosest([
      ...coopsSuggestions(latitude, longitude, waterLevels, "tide"),
      ...coopsSuggestions(latitude, longitude, tidePredictions, "tide"),
    ]).slice(0, 6),
    ...coopsSuggestions(latitude, longitude, currents, "current"),
    ...(await ndbcSuggestions(latitude, longitude, parseNdbcActiveStations(ndbcXml), signal)),
  ];
}

export const suggestCoopsStations = suggestStations;
