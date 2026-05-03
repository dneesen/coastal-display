export function formatNumber(value?: number, suffix = "", digits = 0): string {
  if (value === undefined || Number.isNaN(value)) return "--";
  return `${value.toFixed(digits)}${suffix}`;
}

export function signedNumber(value?: number, suffix = "", digits = 1): string {
  if (value === undefined || Number.isNaN(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}${suffix}`;
}
