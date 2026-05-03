export function cToF(celsius?: number | null) {
  return celsius === undefined || celsius === null ? undefined : Math.round((celsius * 9) / 5 + 32);
}

export function mpsToKt(mps?: number | null) {
  return mps === undefined || mps === null ? undefined : Math.round(mps * 1.94384);
}

export function speedToKt(value?: number | null, unitCode?: string) {
  if (value === undefined || value === null) return undefined;
  if (unitCode?.includes("km_h-1")) return Math.round(value * 0.539957);
  if (unitCode?.includes("mi_h-1")) return Math.round(value * 0.868976);
  if (unitCode?.includes("kt")) return Math.round(value);
  return mpsToKt(value);
}

export function metersToMiles(meters?: number | null) {
  return meters === undefined || meters === null ? undefined : Math.round((meters / 1609.344) * 10) / 10;
}

export function paToInHg(pa?: number | null) {
  return pa === undefined || pa === null ? undefined : Math.round((pa / 3386.389) * 100) / 100;
}

export function metersToFeet(meters?: number | null) {
  return meters === undefined || meters === null ? undefined : Math.round(meters * 3.28084 * 10) / 10;
}

export function parseNumber(value?: string) {
  if (!value || value === "MM" || value === "N/A") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
