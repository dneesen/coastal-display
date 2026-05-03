import { defaultDisplayProfile } from "../config/defaultDisplayProfile";
import { parseCoordinate } from "../utils/coordinates";
import type { DisplayProfile } from "../../types/profile";

function pressureUnit(value: string | null): DisplayProfile["units"]["pressure"] {
  if (value === "hPa" || value === "mb" || value === "mmHg") return value;
  return defaultDisplayProfile.units.pressure;
}

export function profileFromSearchParams(params: URLSearchParams): DisplayProfile {
  return {
    ...defaultDisplayProfile,
    location: {
      ...defaultDisplayProfile.location,
      label: params.get("label") || defaultDisplayProfile.location.label,
      latitude: parseCoordinate(params.get("lat") || "", "latitude") ?? defaultDisplayProfile.location.latitude,
      longitude: parseCoordinate(params.get("lon") || "", "longitude") ?? defaultDisplayProfile.location.longitude,
      timezone: params.get("tz") || defaultDisplayProfile.location.timezone,
    },
    stations: {
      ...defaultDisplayProfile.stations,
      weatherObservationStation: params.get("weatherStation") || defaultDisplayProfile.stations.weatherObservationStation,
      tideStationId: params.get("tideStation") || defaultDisplayProfile.stations.tideStationId,
      currentStationId: params.get("currentStation") || null,
      buoyStationId: params.get("buoyStation") || null,
    },
    units: {
      ...defaultDisplayProfile.units,
      pressure: pressureUnit(params.get("pressureUnit")),
    },
    display: {
      ...defaultDisplayProfile.display,
      timeFormat: params.get("timeFormat") === "24h" ? "24h" : defaultDisplayProfile.display.timeFormat,
      refreshMinutes: Number(params.get("refreshMinutes") || defaultDisplayProfile.display.refreshMinutes),
    },
  };
}

export function profileToSearchParams(profile: DisplayProfile): URLSearchParams {
  const params = new URLSearchParams();
  params.set("label", profile.location.label);
  params.set("lat", String(profile.location.latitude));
  params.set("lon", String(profile.location.longitude));
  params.set("tz", profile.location.timezone);
  params.set("weatherStation", profile.stations.weatherObservationStation);
  params.set("tideStation", profile.stations.tideStationId);
  if (profile.stations.currentStationId) params.set("currentStation", profile.stations.currentStationId);
  if (profile.stations.buoyStationId) params.set("buoyStation", profile.stations.buoyStationId);
  params.set("pressureUnit", profile.units.pressure);
  params.set("timeFormat", profile.display.timeFormat);
  params.set("refreshMinutes", String(profile.display.refreshMinutes));
  return params;
}
