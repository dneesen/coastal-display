import { fetchJson } from "./http";

export type CoopsPrediction = {
  t: string;
  v: string;
  type?: "H" | "L";
};

export type CoopsPredictionResponse = {
  predictions?: CoopsPrediction[];
  error?: { message?: string };
};

export type CoopsCurrentPrediction = {
  Time: string;
  Type?: string;
  Velocity_Major?: string;
  velocity?: string;
  meanFloodDir?: string;
  meanEbbDir?: string;
  Bin?: string;
};

export type CoopsCurrentEvent = {
  Time: string;
  Type?: string;
  Velocity_Major?: string;
  Velocity?: string;
  Bin?: string;
};

export type CoopsCurrentResponse = {
  current_predictions?: {
    cp?: CoopsCurrentPrediction[];
  };
  predictions?: CoopsCurrentEvent[];
  error?: { message?: string };
};

const COOPS = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

function yyyymmdd(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

export async function fetchTidePredictions(stationId: string, signal?: AbortSignal) {
  const begin = new Date();
  begin.setHours(begin.getHours() - 12);
  const end = new Date();
  end.setHours(end.getHours() + 36);
  const common = `station=${stationId}&units=english&time_zone=lst_ldt&format=json&datum=MLLW`;
  const [points, events] = await Promise.all([
    fetchJson<CoopsPredictionResponse>(`${COOPS}?product=predictions&interval=h&begin_date=${yyyymmdd(begin)}&end_date=${yyyymmdd(end)}&${common}`, signal),
    fetchJson<CoopsPredictionResponse>(`${COOPS}?product=predictions&interval=hilo&begin_date=${yyyymmdd(begin)}&end_date=${yyyymmdd(end)}&${common}`, signal),
  ]);
  if (points.error || events.error) throw new Error(points.error?.message || events.error?.message || "CO-OPS tide error");
  return { points: points.predictions || [], events: events.predictions || [] };
}

export async function fetchCurrentPredictions(stationId: string, signal?: AbortSignal) {
  const begin = new Date();
  begin.setHours(begin.getHours() - 12);
  const end = new Date();
  end.setHours(end.getHours() + 36);
  const common = `station=${stationId}&units=english&time_zone=lst_ldt&format=json`;
  const [points, events] = await Promise.all([
    fetchJson<CoopsCurrentResponse>(`${COOPS}?product=currents_predictions&begin_date=${yyyymmdd(begin)}&end_date=${yyyymmdd(end)}&${common}`, signal).catch(() => undefined),
    fetchJson<CoopsCurrentResponse>(`${COOPS}?product=currents_predictions&interval=max_slack&begin_date=${yyyymmdd(begin)}&end_date=${yyyymmdd(end)}&${common}`, signal).catch(() => undefined),
  ]);
  const pointList = points?.current_predictions?.cp || [];
  const eventList = events?.predictions || events?.current_predictions?.cp || [];
  if (pointList.length === 0 && eventList.length === 0) throw new Error("No current predictions available");
  return { points: pointList, events: eventList };
}
