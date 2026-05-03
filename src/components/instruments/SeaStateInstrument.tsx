import { Waves } from "lucide-react";
import { formatNumber } from "../../lib/utils/units";
import type { DisplayMode } from "../../types/display";
import type { SeaStateData } from "../../types/seaState";
import { UnavailableNotice } from "./UnavailableNotice";

type SeaStateInstrumentProps = SeaStateData & { mode?: DisplayMode };

export function SeaStateInstrument({ observed, forecast, mode = "fullscreen" }: SeaStateInstrumentProps) {
  if (!observed) {
    return <UnavailableNotice title="Sea state unavailable" detail="Add an NDBC buoy station to show waves, swell, period, direction, and water temperature." />;
  }

  const hasPrimarySwell = observed.primarySwellHeightFt !== undefined;
  const hasSecondarySwell = observed.secondarySwellHeightFt !== undefined;

  return (
    <div className={`sea-state ${mode}`}>
      <div className="sea-state-summary">
        <div className="wave-mark" aria-hidden="true">
          <Waves size={34} strokeWidth={mode === "eink" ? 2.8 : 1.8} />
        </div>
        <strong>{formatNumber(observed.waveHeightFt, " ft", 1)}</strong>
        <span>{formatNumber(observed.dominantPeriodSec, "s")} from {observed.waveDirectionText || "UNK"}</span>
      </div>
      <dl>
        {hasPrimarySwell ? <div><dt>Swell</dt><dd>{formatNumber(observed.primarySwellHeightFt, " ft", 1)} - {formatNumber(observed.primarySwellPeriodSec, "s")} - {observed.primarySwellDirectionText || "UNK"}</dd></div> : null}
        {hasSecondarySwell ? <div><dt>Second</dt><dd>{formatNumber(observed.secondarySwellHeightFt, " ft", 1)} - {formatNumber(observed.secondarySwellPeriodSec, "s")} - {observed.secondarySwellDirectionText || "UNK"}</dd></div> : null}
        {observed.averagePeriodSec ? <div><dt>Average</dt><dd>{formatNumber(observed.averagePeriodSec, "s")} period</dd></div> : null}
        {observed.waterTempF ? <div><dt>Water</dt><dd>{formatNumber(observed.waterTempF, "F")}</dd></div> : null}
      </dl>
      {mode !== "eink" && forecast?.periods[0] ? <p className="quiet-note sea-forecast">{forecast.periods[0].label}: {forecast.periods[0].seasSummary}</p> : null}
    </div>
  );
}
