import type { DisplayMode } from "./display";

export type DisplayProfile = {
  id: string;
  name: string;
  location: {
    label: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  stations: {
    weatherObservationStation: "auto" | string;
    tideStationId: string;
    currentStationId?: string | null;
    buoyStationId?: string | null;
  };
  units: {
    temperature: "F";
    windSpeed: "kt";
    pressure: "inHg" | "hPa" | "mb" | "mmHg";
    tideHeight: "ft";
    currentSpeed: "kt";
    waveHeight: "ft";
  };
  display: {
    mode: DisplayMode;
    theme: "paper-chart" | "clean-marine" | "eink-almanac" | "instrument-panel";
    timeFormat: "12h" | "24h";
    refreshMinutes: number;
    resolution?: {
      width: number;
      height: number;
    };
  };
};
