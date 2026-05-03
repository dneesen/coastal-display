import type { CurrentData } from "./current";
import type { DisplayProfile } from "./profile";
import type { SeaStateData } from "./seaState";
import type { TideData } from "./tide";
import type { WeatherAlert, WeatherNow, DailyForecastPeriod, HourlyForecastPoint } from "./weather";

export type DisplayMode = "fullscreen" | "eink";

export type MarineDisplayData = {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  updatedAt: string;
  weather: WeatherNow;
  alerts: WeatherAlert[];
  hourlyForecast: HourlyForecastPoint[];
  dailyForecast: DailyForecastPeriod[];
  moon: {
    phaseName?: string;
    illuminationPercent?: number;
    moonrise?: string;
    moonset?: string;
  };
  tide: TideData;
  current: CurrentData;
  seaState: SeaStateData;
};

export type DisplayContext = {
  data: MarineDisplayData;
  profile: DisplayProfile;
  mode: DisplayMode;
};
