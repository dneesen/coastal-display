import type { MarineDisplayData } from "../../types/display";
import type { DailyForecastPeriod, HourlyForecastPoint, WeatherAlert, WeatherNow } from "../../types/weather";
import type { fetchNwsBundle } from "../api/nws";
import { degreesToCompass } from "../utils/direction";
import { cToF, metersToMiles, paToInHg, speedToKt } from "./units";

type NwsBundle = Awaited<ReturnType<typeof fetchNwsBundle>>;

function windSpeedTextToKt(text?: string) {
  if (!text) return undefined;
  const matches = text.match(/\d+/g);
  if (!matches?.length) return undefined;
  return Math.round(matches.map(Number).reduce((sum, value) => sum + value, 0) / matches.length * 0.868976);
}

function roundPressureDelta(current?: number, previous?: number) {
  return current !== undefined && previous !== undefined ? Math.round((current - previous) * 100) / 100 : undefined;
}

function pressureAtOffset(bundle: NwsBundle, hoursAgo: number) {
  const observationTime = bundle.observation?.properties.timestamp ? new Date(bundle.observation.properties.timestamp).getTime() : Date.now();
  const targetTime = observationTime - hoursAgo * 60 * 60 * 1000;
  return bundle.observations?.features.reduce<{ pressure?: number; distance: number }>((best, feature) => {
    const timestamp = feature.properties.timestamp;
    const pressure = paToInHg(feature.properties.barometricPressure?.value);
    if (!timestamp || pressure === undefined) return best;
    const distance = Math.abs(new Date(timestamp).getTime() - targetTime);
    return distance < best.distance ? { pressure, distance } : best;
  }, { pressure: undefined, distance: Number.POSITIVE_INFINITY }).pressure;
}

export function normalizeNwsWeather(bundle: NwsBundle, fallback: MarineDisplayData): Pick<MarineDisplayData, "weather" | "alerts" | "hourlyForecast" | "dailyForecast"> {
  const observation = bundle.observation?.properties;
  const firstHourly = bundle.hourly.properties.periods[0];
  const pressure = paToInHg(observation?.barometricPressure?.value);
  const fallbackPressure = fallback.weather.pressureInHg;
  const pressure12hAgo = pressureAtOffset(bundle, 12) ?? fallback.weather.pressure12hAgoInHg ?? fallbackPressure;
  const pressure24hAgo = pressureAtOffset(bundle, 24) ?? fallback.weather.pressure24hAgoInHg;
  const pressureChange12h = roundPressureDelta(pressure, pressure12hAgo);
  const pressureChange24h = roundPressureDelta(pressure, pressure24hAgo);
  const weather: WeatherNow = {
    currentTempF: cToF(observation?.temperature?.value) ?? firstHourly?.temperature,
    feelsLikeF: cToF(observation?.heatIndex?.value ?? observation?.windChill?.value),
    condition: observation?.textDescription || firstHourly?.shortForecast,
    humidityPercent: observation?.relativeHumidity?.value === null || observation?.relativeHumidity?.value === undefined ? undefined : Math.round(observation.relativeHumidity.value),
    visibilityMiles: metersToMiles(observation?.visibility?.value),
    windSpeedKt: speedToKt(observation?.windSpeed?.value, observation?.windSpeed?.unitCode) ?? windSpeedTextToKt(firstHourly?.windSpeed),
    windGustKt: speedToKt(observation?.windGust?.value, observation?.windGust?.unitCode),
    windDirectionDeg: observation?.windDirection?.value ?? undefined,
    windDirectionText: degreesToCompass(observation?.windDirection?.value ?? undefined) || firstHourly?.windDirection,
    pressureInHg: pressure,
    pressure12hAgoInHg: pressure12hAgo,
    pressure24hAgoInHg: pressure24hAgo,
    pressureChange12hInHg: pressureChange12h,
    pressureChange24hInHg: pressureChange24h,
    pressureTrend: pressureChange12h !== undefined ? (pressureChange12h > 0.02 ? "rising" : pressureChange12h < -0.02 ? "falling" : "steady") : "unknown",
  };

  const hourlyForecast: HourlyForecastPoint[] = bundle.hourly.properties.periods.slice(0, 12).map((period) => ({
    time: period.startTime,
    temperatureF: period.temperature,
    condition: period.shortForecast,
    precipitationChancePercent: period.probabilityOfPrecipitation?.value ?? undefined,
    windSpeedKt: windSpeedTextToKt(period.windSpeed),
    windDirectionText: period.windDirection,
  }));

  const byDate = new Map<string, DailyForecastPeriod>();
  for (const period of bundle.daily.properties.periods) {
    const date = period.startTime.slice(0, 10);
    const existing = byDate.get(date);
    const next: DailyForecastPeriod = existing || {
      date,
      label: new Date(period.startTime).toLocaleDateString(undefined, { weekday: "short" }),
      condition: period.shortForecast,
      precipitationChancePercent: period.probabilityOfPrecipitation?.value ?? undefined,
      windSummary: `${period.windDirection || ""} ${period.windSpeed || ""}`.trim(),
      marineSummary: period.shortForecast,
    };
    if (period.isDaytime) next.highTempF = period.temperature;
    else next.lowTempF = period.temperature;
    byDate.set(date, next);
  }

  const alerts: WeatherAlert[] = bundle.alerts.features.map((feature) => ({
    id: feature.id,
    event: feature.properties.event,
    headline: feature.properties.headline,
    description: feature.properties.description,
    severity: feature.properties.severity,
    urgency: feature.properties.urgency,
    certainty: feature.properties.certainty,
    effective: feature.properties.effective,
    expires: feature.properties.expires,
    instruction: feature.properties.instruction,
  }));

  return { weather, hourlyForecast, dailyForecast: Array.from(byDate.values()).slice(0, 5), alerts };
}
