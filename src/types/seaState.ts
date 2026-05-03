export type ObservedSeaState = {
  stationId: string;
  stationName?: string;
  updatedAt?: string;
  waveHeightFt?: number;
  waveDirectionDeg?: number;
  waveDirectionText?: string;
  dominantPeriodSec?: number;
  averagePeriodSec?: number;
  primarySwellHeightFt?: number;
  primarySwellPeriodSec?: number;
  primarySwellDirectionDeg?: number;
  primarySwellDirectionText?: string;
  secondarySwellHeightFt?: number;
  secondarySwellPeriodSec?: number;
  secondarySwellDirectionDeg?: number;
  secondarySwellDirectionText?: string;
  waterTempF?: number;
};

export type MarineForecastPeriod = {
  label: string;
  startTime?: string;
  endTime?: string;
  windSummary?: string;
  seasSummary?: string;
  text?: string;
};

export type SeaStateData = {
  observed?: ObservedSeaState;
  forecast?: {
    periods: MarineForecastPeriod[];
  };
};
