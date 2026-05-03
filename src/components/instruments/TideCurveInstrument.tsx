import { buildLinePath, pointPosition } from "../../lib/utils/curves";
import { formatChartTime, formatDisplayTime } from "../../lib/utils/time";
import type { TimeFormat } from "../../lib/utils/time";
import { formatNumber } from "../../lib/utils/units";
import type { DisplayMode } from "../../types/display";
import type { TideData, TideEvent, TidePoint } from "../../types/tide";
import { UnavailableNotice } from "./UnavailableNotice";

type TideCurveInstrumentProps = TideData & { mode?: DisplayMode; timeFormat?: TimeFormat };

function labelX(x: number, width: number) {
  return Math.min(Math.max(x, 50), width - 50);
}

function peakLabelY(y: number) {
  return y < 42 ? y + 22 : y - 12;
}

function troughLabelY(y: number, height: number) {
  return y > height - 44 ? y - 16 : y + 24;
}

function visibleTideEvents(events: TideEvent[] | undefined, points: TidePoint[]) {
  if (!events?.length || !points.length) return [];
  const times = points.map((point) => new Date(point.time).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  return events.filter((event) => {
    const time = new Date(event.time).getTime();
    return time >= minTime && time <= maxTime;
  });
}

function tideEventLabel(event: TideEvent, timeFormat?: TimeFormat) {
  const prefix = event.type === "high" ? "H" : "L";
  return `${prefix} ${formatChartTime(event.time, timeFormat)} ${formatNumber(event.heightFt, "", 1)}`;
}

export function TideCurveInstrument({ currentHeightFt, state = "unknown", nextHigh, nextLow, events, points, mode = "fullscreen", timeFormat }: TideCurveInstrumentProps) {
  const width = 960;
  const height = mode === "eink" ? 210 : 250;
  const stroke = mode === "eink" ? 5 : 3;
  const padding = 10;
  const path = buildLinePath(points, (point) => point.heightFt, width, height, padding);
  const nowPoint = pointPosition(points, new Date().toISOString(), (point) => point.heightFt, width, height, padding);
  const chartEvents = visibleTideEvents(events || [nextHigh, nextLow].filter(Boolean) as TideEvent[], points);

  if (!path) {
    return <UnavailableNotice title="Tide data unavailable" detail="Check the configured NOAA tide station and network connection." />;
  }

  return (
    <div className="curve-instrument tide-instrument">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tide height curve">
        <rect className="svg-chart-wash" x="6" y="12" width={width - 12} height={height - 36} />
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line key={ratio} className="svg-grid" x1="6" x2={width - 6} y1={height * ratio} y2={height * ratio} />
        ))}
        <line className="svg-axis" x1="6" x2={width - 6} y1={height - 24} y2={height - 24} />
        {Array.from({ length: 7 }, (_, index) => {
          const x = 10 + (index / 6) * (width - 20);
          return <line key={index} className="svg-muted" x1={x} x2={x} y1={height - 30} y2={height - 18} />;
        })}
        <path className="svg-line" strokeWidth={stroke} d={path} fill="none" />
        {chartEvents.map((event) => {
          const eventPoint = pointPosition(points, event.time, (point) => point.heightFt, width, height, padding);
          if (!eventPoint) return null;
          return (
            <text key={`${event.type}-${event.time}`} className="svg-label chart-event-label" textAnchor="middle" x={labelX(eventPoint.x, width)} y={event.type === "high" ? peakLabelY(eventPoint.y) : troughLabelY(eventPoint.y, height)}>
              {tideEventLabel(event, timeFormat)}
            </text>
          );
        })}
        {nowPoint ? (
          <g>
            <line className="svg-line" strokeWidth={Math.max(1, stroke - 1)} x1={nowPoint.x} x2={nowPoint.x} y1="12" y2={height - 12} strokeDasharray="6 8" />
            <text className="svg-label" x={Math.min(nowPoint.x + 12, width - 42)} y="20">NOW</text>
          </g>
        ) : null}
      </svg>
      <div className="curve-summary">
        <strong>{formatNumber(currentHeightFt, " ft", 1)} - {state.replace("_", " ")}</strong>
        <span>HIGH {formatDisplayTime(nextHigh?.time, timeFormat)} {formatNumber(nextHigh?.heightFt, " ft", 1)}</span>
        <span>LOW {formatDisplayTime(nextLow?.time, timeFormat)} {formatNumber(nextLow?.heightFt, " ft", 1)}</span>
      </div>
    </div>
  );
}
