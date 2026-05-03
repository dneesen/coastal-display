import { formatDisplayTime } from "../../lib/utils/time";
import type { TimeFormat } from "../../lib/utils/time";
import { formatNumber } from "../../lib/utils/units";
import type { DisplayMode } from "../../types/display";
import type { HourlyForecastPoint } from "../../types/weather";

type HourlyForecastStripProps = {
  points: HourlyForecastPoint[];
  mode?: DisplayMode;
  timeFormat?: TimeFormat;
};

function shortCondition(condition?: string) {
  const normalized = (condition || "").toLowerCase();
  if (!normalized) return "--";
  if (normalized.includes("thunder")) return "Storms";
  if (normalized.includes("shower") || normalized.includes("rain")) return "Showers";
  if (normalized.includes("clear") || normalized.includes("sunny")) return "Clear";
  if (normalized.includes("cloud")) return "Cloudy";
  if (normalized.includes("fair")) return "Fair";
  if (normalized.includes("fog")) return "Fog";
  if (normalized.includes("wind")) return "Windy";
  return condition?.split(/\s+/).slice(0, 2).join(" ") || "--";
}

export function HourlyForecastStrip({ points, mode = "fullscreen", timeFormat }: HourlyForecastStripProps) {
  const shown = mode === "eink" ? points.slice(0, 8) : points.slice(0, 8);
  return (
    <div className={`hourly-strip ${mode}`}>
      {shown.map((point) => (
        <div className="hourly-cell" key={point.time}>
          <strong>{formatDisplayTime(point.time, timeFormat)}</strong>
          <span className="hourly-temp">{formatNumber(point.temperatureF, "F")}</span>
          <span className="hourly-condition">{shortCondition(point.condition)}</span>
          <span className="hourly-meta"><b>W</b> {point.windDirectionText || "UNK"} {formatNumber(point.windSpeedKt, " kt")}</span>
          <span className="hourly-meta"><b>R</b> {formatNumber(point.precipitationChancePercent, "%")}</span>
        </div>
      ))}
    </div>
  );
}
