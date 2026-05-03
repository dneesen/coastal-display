import type { DisplayMode } from "../../types/display";
import { formatNumber } from "../../lib/utils/units";

type ThermometerInstrumentProps = {
  currentTempF?: number;
  feelsLikeF?: number;
  condition?: string;
  mode?: DisplayMode;
};

export function ThermometerInstrument({ currentTempF, feelsLikeF, condition, mode = "fullscreen" }: ThermometerInstrumentProps) {
  const fillHeight = Math.max(18, Math.min(88, ((currentTempF ?? 70) - 45) * 1.8));
  return (
    <div className="mini-instrument thermometer-card">
      <div className="instrument-readout">
        <strong>{formatNumber(currentTempF, "F")}</strong>
        <span>Feels {formatNumber(feelsLikeF, "F")}</span>
        <em>{condition || "--"}</em>
      </div>
      <svg viewBox="0 0 70 130" aria-label="Air temperature thermometer">
        <rect className="svg-line" x="29" y="12" width="12" height="86" rx="6" fill="none" strokeWidth={mode === "eink" ? 4 : 2} />
        <circle className="svg-line" cx="35" cy="104" r="17" fill="none" strokeWidth={mode === "eink" ? 4 : 2} />
        <rect className="svg-fill" x="31" y={98 - fillHeight} width="8" height={fillHeight + 8} rx="4" />
        <circle className="svg-fill" cx="35" cy="104" r="10" />
      </svg>
    </div>
  );
}
