import type { DisplayProfile } from "../../types/profile";

export type PressureUnit = DisplayProfile["units"]["pressure"];

export function pressureToDialAngle(pressure?: number): number {
  if (pressure === undefined) return 0;
  const min = 28.8;
  const max = 31.1;
  const clamped = Math.max(min, Math.min(max, pressure));
  return -130 + ((clamped - min) / (max - min)) * 260;
}

export function pressureUnitLabel(unit: PressureUnit) {
  return unit;
}

export function convertPressureFromInHg(value: number, unit: PressureUnit): number {
  if (unit === "hPa" || unit === "mb") return value * 33.8638866667;
  if (unit === "mmHg") return value * 25.4;
  return value;
}

export function formatPressure(value?: number, unit: PressureUnit = "inHg"): string {
  if (value === undefined || Number.isNaN(value)) return "--";
  const converted = convertPressureFromInHg(value, unit);
  const digits = unit === "inHg" ? 2 : unit === "mmHg" ? 0 : 0;
  return `${converted.toFixed(digits)} ${pressureUnitLabel(unit)}`;
}

export function formatPressureScale(value: number, unit: PressureUnit = "inHg"): string {
  const converted = convertPressureFromInHg(value, unit);
  if (unit === "inHg") return value.toFixed(value === 30 ? 0 : 1);
  if (unit === "mmHg") return converted.toFixed(0);
  return converted.toFixed(0);
}

export function formatPressureDelta(
  delta?: number,
  unit: PressureUnit = "inHg",
  hours = 12,
  includePeriod = true,
): string {
  if (delta === undefined) return "change unknown";
  const converted = convertPressureFromInHg(delta, unit);
  const sign = converted > 0 ? "+" : converted < 0 ? "-" : "";
  const digits = unit === "inHg" ? 2 : unit === "mmHg" ? 0 : 0;
  const amount = `${sign}${Math.abs(converted).toFixed(digits)} ${pressureUnitLabel(unit)}`;
  return includePeriod ? `${amount} / ${hours}h` : amount;
}
