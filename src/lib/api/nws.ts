import { fetchJson } from "./http";

export type NwsPointResponse = {
  properties: {
    forecast: string;
    forecastHourly: string;
    observationStations?: string;
    relativeLocation?: {
      properties?: {
        city?: string;
        state?: string;
      };
    };
  };
};

export type NwsForecastResponse = {
  properties: {
    periods: Array<{
      number: number;
      name: string;
      startTime: string;
      endTime: string;
      isDaytime?: boolean;
      temperature?: number;
      temperatureUnit?: string;
      windSpeed?: string;
      windDirection?: string;
      shortForecast?: string;
      detailedForecast?: string;
      probabilityOfPrecipitation?: { value?: number | null };
    }>;
  };
};

export type NwsAlertsResponse = {
  features: Array<{
    id: string;
    properties: {
      event: string;
      headline?: string;
      description?: string;
      severity?: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
      urgency?: string;
      certainty?: string;
      effective?: string;
      expires?: string;
      instruction?: string;
    };
  }>;
};

export type NwsStationsResponse = {
  features: Array<{
    properties: {
      stationIdentifier: string;
      name: string;
    };
  }>;
};

export type NwsObservationResponse = {
  properties: {
    timestamp?: string;
    textDescription?: string;
    temperature?: { value?: number | null };
    heatIndex?: { value?: number | null };
    windChill?: { value?: number | null };
    relativeHumidity?: { value?: number | null };
    visibility?: { value?: number | null };
    windSpeed?: { value?: number | null; unitCode?: string };
    windGust?: { value?: number | null; unitCode?: string };
    windDirection?: { value?: number | null };
    barometricPressure?: { value?: number | null; unitCode?: string };
  };
};

export type NwsObservationCollectionResponse = {
  features: NwsObservationResponse[];
};

export async function fetchNwsBundle(latitude: number, longitude: number, observationStation: "auto" | string, signal?: AbortSignal) {
  const point = await fetchJson<NwsPointResponse>(`https://api.weather.gov/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`, signal);
  const [daily, hourly, alerts] = await Promise.all([
    fetchJson<NwsForecastResponse>(point.properties.forecast, signal),
    fetchJson<NwsForecastResponse>(point.properties.forecastHourly, signal),
    fetchJson<NwsAlertsResponse>(`https://api.weather.gov/alerts/active?point=${latitude.toFixed(4)},${longitude.toFixed(4)}`, signal),
  ]);

  let stationId = observationStation === "auto" ? undefined : observationStation;
  if (!stationId && point.properties.observationStations) {
    const stations = await fetchJson<NwsStationsResponse>(point.properties.observationStations, signal);
    stationId = stations.features[0]?.properties.stationIdentifier;
  }

  const observation = stationId
    ? await fetchJson<NwsObservationResponse>(`https://api.weather.gov/stations/${stationId}/observations/latest`, signal).catch(() => undefined)
    : undefined;
  const observationStart = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
  const observations = stationId
    ? await fetchJson<NwsObservationCollectionResponse>(`https://api.weather.gov/stations/${stationId}/observations?start=${encodeURIComponent(observationStart)}&limit=200`, signal).catch(() => undefined)
    : undefined;

  return { point, daily, hourly, alerts, observation, observations, stationId };
}
