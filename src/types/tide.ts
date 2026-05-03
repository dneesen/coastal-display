export type TideEvent = {
  type: "high" | "low";
  time: string;
  heightFt?: number;
};

export type TidePoint = {
  time: string;
  heightFt: number;
};

export type TideData = {
  stationId: string;
  stationName?: string;
  currentHeightFt?: number;
  state?: "rising" | "falling" | "near_high" | "near_low" | "unknown";
  nextHigh?: TideEvent;
  nextLow?: TideEvent;
  events?: TideEvent[];
  points: TidePoint[];
};
