import { format, parseISO } from "date-fns";

export type TimeFormat = "12h" | "24h";

export function formatDisplayTime(iso?: string, timeFormat: TimeFormat = "12h"): string {
  if (!iso) return "--";
  return format(parseISO(iso), timeFormat === "24h" ? "HH:mm" : "h:mm a");
}

export function formatChartTime(iso?: string, timeFormat: TimeFormat = "12h"): string {
  if (!iso) return "--";
  return format(parseISO(iso), timeFormat === "24h" ? "HH:mm" : "h:mma").toLowerCase();
}

export function formatDisplayDate(iso?: string): string {
  if (!iso) return "--";
  return format(parseISO(iso), "EEE, MMM d");
}

export function formatUpdatedAt(iso?: string, timeFormat: TimeFormat = "12h"): string {
  if (!iso) return "Updated --";
  return `Updated ${formatDisplayTime(iso, timeFormat)}`;
}
