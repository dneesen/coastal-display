import type { DisplayMode } from "../../types/display";
import type { DailyForecastPeriod } from "../../types/weather";
import { formatNumber } from "../../lib/utils/units";

type ForecastAlmanacInstrumentProps = {
  periods: DailyForecastPeriod[];
  mode?: DisplayMode;
};

export function ForecastAlmanacInstrument({ periods, mode = "fullscreen" }: ForecastAlmanacInstrumentProps) {
  return (
    <table className={`forecast-table ${mode}`}>
      <tbody>
        {periods.slice(0, 5).map((period) => (
          <tr key={period.date}>
            <th>{period.label}</th>
            <td>{formatNumber(period.highTempF, "F")}/{formatNumber(period.lowTempF, "F")}</td>
            <td>{period.windSummary}</td>
            <td>{period.marineSummary || period.condition}</td>
            <td>{formatNumber(period.precipitationChancePercent, "%")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
