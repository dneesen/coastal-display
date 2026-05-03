import { fetchText } from "./http";

export type NdbcObservation = Record<string, string | undefined>;

function isMeasured(value?: string) {
  return Boolean(value && value !== "MM");
}

function observationTime(record: NdbcObservation) {
  const year = Number(record.YY);
  const month = Number(record.MM);
  const day = Number(record.DD);
  const hour = Number(record.hh);
  const minute = Number(record.mm);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return undefined;
  return new Date(Date.UTC(year, month - 1, day, hour, minute)).toISOString();
}

export async function fetchNdbcLatest(stationId: string, signal?: AbortSignal): Promise<NdbcObservation | undefined> {
  const safeStationId = stationId.trim().toUpperCase();
  const url = typeof window === "undefined"
    ? `https://www.ndbc.noaa.gov/data/realtime2/${safeStationId}.txt`
    : `/api/ndbc-latest?station=${encodeURIComponent(safeStationId)}`;
  const text = await fetchText(url, signal);
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0]?.replace(/^#/, "").trim().split(/\s+/);
  const units = lines[1]?.replace(/^#/, "").trim().split(/\s+/);
  const observations = lines
    .filter((line) => !line.startsWith("#"))
    .map((line) => line.trim().split(/\s+/));
  const latest = observations.find((values) => isMeasured(values[headers?.indexOf("WVHT") ?? -1])) || observations[0];
  if (!headers || !latest) return undefined;
  const record = headers.reduce<NdbcObservation>((accumulator, header, index) => {
    accumulator[header] = latest[index];
    accumulator[`${header}_UNIT`] = units?.[index];
    return accumulator;
  }, { stationId });
  record.updatedAt = observationTime(record);
  return record;
}
