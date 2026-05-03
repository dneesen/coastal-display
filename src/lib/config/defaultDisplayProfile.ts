import type { DisplayProfile } from "../../types/profile";

export const defaultDisplayProfile: DisplayProfile = {
  id: "default",
  name: "Default Coastal Display",
  location: {
    label: "Vero Beach, FL",
    latitude: 27.6386,
    longitude: -80.3973,
    timezone: "America/New_York",
  },
  stations: {
    weatherObservationStation: "auto",
    tideStationId: "8722125",
    currentStationId: "FPI0902",
    buoyStationId: "41113",
  },
  units: {
    temperature: "F",
    windSpeed: "kt",
    pressure: "inHg",
    tideHeight: "ft",
    currentSpeed: "kt",
    waveHeight: "ft",
  },
  display: {
    mode: "fullscreen",
    theme: "paper-chart",
    timeFormat: "12h",
    refreshMinutes: 30,
  },
};
