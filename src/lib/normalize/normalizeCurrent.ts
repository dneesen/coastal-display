import type { CurrentData, CurrentEvent, CurrentPoint } from "../../types/current";
import type { CoopsCurrentEvent, CoopsCurrentPrediction } from "../api/coops";

function coopsTimeToIso(time: string) {
  return new Date(time.replace(" ", "T")).toISOString();
}

function velocityFromPrediction(point: CoopsCurrentPrediction) {
  return cleanVelocity(Number(point.Velocity_Major ?? point.velocity ?? 0));
}

function eventVelocity(event: CoopsCurrentEvent) {
  return cleanVelocity(Number(event.Velocity_Major ?? event.Velocity ?? 0));
}

function cleanVelocity(value: number) {
  if (!Number.isFinite(value)) return value;
  return Math.abs(value) < 0.005 ? 0 : value;
}

function eventType(type?: string): CurrentEvent["type"] {
  const normalized = (type || "").toLowerCase();
  if (normalized.includes("flood")) return "max_flood";
  if (normalized.includes("ebb")) return "max_ebb";
  return "slack";
}

function stationName(stationId: string) {
  const known: Record<string, string> = {
    FPI0901: "Fort Pierce Inlet Entrance",
    FPI0902: "Inner Range, north of USCG station",
  };
  return known[stationId] || `NOAA Current Station ${stationId}`;
}

export function normalizeCurrent(stationId: string, points: CoopsCurrentPrediction[], events: CoopsCurrentEvent[]): CurrentData {
  const currentPoints: CurrentPoint[] = points
    .map((point) => ({ time: coopsTimeToIso(point.Time), velocityKt: velocityFromPrediction(point) }))
    .filter((point) => Number.isFinite(point.velocityKt));
  const now = Date.now();
  const normalizedEvents = events
    .map((event) => ({ type: eventType(event.Type), time: coopsTimeToIso(event.Time), velocityKt: eventVelocity(event) }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const nextSlack = normalizedEvents.find((event) => event.type === "slack" && new Date(event.time).getTime() >= now);
  const nextMaxFlood = normalizedEvents.find((event) => event.type === "max_flood" && new Date(event.time).getTime() >= now);
  const nextMaxEbb = normalizedEvents.find((event) => event.type === "max_ebb" && new Date(event.time).getTime() >= now);
  const nearest = currentPoints.reduce<CurrentPoint | undefined>((best, point) => {
    if (!best) return point;
    return Math.abs(new Date(point.time).getTime() - now) < Math.abs(new Date(best.time).getTime() - now) ? point : best;
  }, undefined);
  const velocityKt = nearest?.velocityKt;

  return {
    stationId,
    stationName: stationName(stationId),
    velocityKt,
    state: velocityKt === undefined ? "unknown" : Math.abs(velocityKt) < 0.1 ? "slack" : velocityKt > 0 ? "flood" : "ebb",
    nextSlack,
    nextMaxFlood,
    nextMaxEbb,
    events: normalizedEvents,
    points: currentPoints.length ? currentPoints : normalizedEvents.map((event) => ({ time: event.time, velocityKt: event.velocityKt || 0 })),
  };
}
