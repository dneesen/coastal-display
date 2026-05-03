import { useId } from "react";
import type { DisplayMode } from "../../types/display";
import { formatDisplayTime } from "../../lib/utils/time";
import type { TimeFormat } from "../../lib/utils/time";
import { formatNumber } from "../../lib/utils/units";

type MoonPhaseInstrumentProps = {
  phaseName?: string;
  illuminationPercent?: number;
  moonrise?: string;
  moonset?: string;
  mode?: DisplayMode;
  timeFormat?: TimeFormat;
};

export function MoonPhaseInstrument({ phaseName, illuminationPercent, moonrise, moonset, mode = "fullscreen", timeFormat }: MoonPhaseInstrumentProps) {
  const clipId = `moon-${useId().replace(/:/g, "")}`;
  const illumination = Math.max(0, Math.min(100, illuminationPercent ?? 0));
  const litWidth = 76 * (illumination / 100);
  const isWaning = phaseName?.toLowerCase().includes("waning");
  const litX = isWaning ? 22 : 98 - litWidth;

  return (
    <div className="mini-instrument moon-card">
      <svg viewBox="0 0 120 120" aria-label="Moon phase graphic">
        <defs>
          <clipPath id={clipId}>
            <circle cx="60" cy="60" r="38" />
          </clipPath>
        </defs>
        <circle className="moon-disk-base" cx="60" cy="60" r="38" />
        <rect
          className="moon-disk-lit"
          x={litX}
          y="22"
          width={litWidth}
          height="76"
          clipPath={`url(#${clipId})`}
        />
        <circle className="svg-line" cx="60" cy="60" r="38" fill="none" strokeWidth={mode === "eink" ? 4 : 2} />
      </svg>
      <div className="instrument-readout">
        <strong>{phaseName || "Moon"}</strong>
        <span>{formatNumber(illuminationPercent, "%")} lit</span>
        <em>Rise {formatDisplayTime(moonrise, timeFormat)} / Set {formatDisplayTime(moonset, timeFormat)}</em>
      </div>
    </div>
  );
}
