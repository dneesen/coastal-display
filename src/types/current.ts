export type CurrentEvent = {
  type: "slack" | "max_flood" | "max_ebb";
  time: string;
  velocityKt?: number;
  directionDeg?: number;
  directionText?: string;
};

export type CurrentPoint = {
  time: string;
  velocityKt: number;
  directionDeg?: number;
  directionText?: string;
};

export type CurrentData = {
  stationId?: string;
  stationName?: string;
  velocityKt?: number;
  directionDeg?: number;
  directionText?: string;
  state?: "flood" | "ebb" | "slack" | "unknown";
  nextSlack?: CurrentEvent;
  nextMaxFlood?: CurrentEvent;
  nextMaxEbb?: CurrentEvent;
  events?: CurrentEvent[];
  points: CurrentPoint[];
};
