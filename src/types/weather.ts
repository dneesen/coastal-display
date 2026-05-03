export type WeatherNow = {
  currentTempF?: number;
  feelsLikeF?: number;
  condition?: string;
  humidityPercent?: number;
  visibilityMiles?: number;
  windSpeedKt?: number;
  windGustKt?: number;
  windDirectionDeg?: number;
  windDirectionText?: string;
  pressureInHg?: number;
  pressureTrend?: "rising" | "falling" | "steady" | "unknown";
  pressureChange12hInHg?: number;
  pressureChange24hInHg?: number;
  pressure12hAgoInHg?: number;
  pressure24hAgoInHg?: number;
};

export type WeatherAlert = {
  id: string;
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

export type HourlyForecastPoint = {
  time: string;
  temperatureF?: number;
  condition?: string;
  precipitationChancePercent?: number;
  windSpeedKt?: number;
  windDirectionDeg?: number;
  windDirectionText?: string;
};

export type DailyForecastPeriod = {
  date: string;
  label: string;
  highTempF?: number;
  lowTempF?: number;
  condition?: string;
  precipitationChancePercent?: number;
  windSummary?: string;
  marineSummary?: string;
};
