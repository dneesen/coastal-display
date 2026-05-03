import type { TideData, TideEvent, TidePoint } from "../../types/tide";
import type { CoopsPrediction } from "../api/coops";

function coopsTimeToIso(time: string) {
  return new Date(time.replace(" ", "T")).toISOString();
}

function parsePrediction(prediction: CoopsPrediction): TidePoint {
  return { time: coopsTimeToIso(prediction.t), heightFt: Number(prediction.v) };
}

export function normalizeTide(stationId: string, points: CoopsPrediction[], events: CoopsPrediction[]): TideData {
  const tidePoints = points.map(parsePrediction).filter((point) => Number.isFinite(point.heightFt));
  const now = Date.now();
  const eventList: TideEvent[] = events
    .map((event) => ({ type: event.type === "H" ? "high" as const : "low" as const, time: coopsTimeToIso(event.t), heightFt: Number(event.v) }))
    .filter((event) => Number.isFinite(event.heightFt))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const nextHigh = eventList.find((event) => event.type === "high" && new Date(event.time).getTime() >= now);
  const nextLow = eventList.find((event) => event.type === "low" && new Date(event.time).getTime() >= now);
  const nearestIndex = tidePoints.reduce((best, point, index) => {
    const distance = Math.abs(new Date(point.time).getTime() - now);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
  const current = tidePoints[nearestIndex];
  const previous = tidePoints[Math.max(0, nearestIndex - 1)];
  const state = current && previous ? (current.heightFt >= previous.heightFt ? "rising" : "falling") : "unknown";

  return {
    stationId,
    stationName: `NOAA Tide Station ${stationId}`,
    currentHeightFt: current?.heightFt,
    state,
    nextHigh,
    nextLow,
    events: eventList,
    points: tidePoints,
  };
}
