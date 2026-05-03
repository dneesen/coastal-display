import { buildSignedLinePath, signedPointPosition } from "../../lib/utils/curves";
import { formatChartTime, formatDisplayTime } from "../../lib/utils/time";
import type { TimeFormat } from "../../lib/utils/time";
import { formatNumber, signedNumber } from "../../lib/utils/units";
import type { CurrentData, CurrentEvent, CurrentPoint } from "../../types/current";
import type { DisplayMode } from "../../types/display";
import { UnavailableNotice } from "./UnavailableNotice";

type CurrentCurveInstrumentProps = CurrentData & { mode?: DisplayMode; timeFormat?: TimeFormat };

function labelX(x: number, width: number) {
  return Math.min(Math.max(x, 62), width - 62);
}

function peakLabelY(y: number) {
  return y < 38 ? y + 22 : y - 12;
}

function troughLabelY(y: number, height: number) {
  return y > height - 42 ? y - 16 : y + 24;
}

function eventSpeed(event?: CurrentEvent, absolute = false) {
  if (event?.velocityKt === undefined) return "--";
  return formatNumber(absolute ? Math.abs(event.velocityKt) : event.velocityKt, " kt", 1);
}

function visibleCurrentEvents(events: CurrentEvent[] | undefined, points: CurrentPoint[]) {
  if (!events?.length || !points.length) return [];
  const times = points.map((point) => new Date(point.time).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  return events.filter((event) => {
    if (event.type === "slack") return false;
    const time = new Date(event.time).getTime();
    return time >= minTime && time <= maxTime;
  });
}

function currentEventLabel(event: CurrentEvent, timeFormat?: TimeFormat) {
  const prefix = event.type === "max_flood" ? "F" : "E";
  return `${prefix} ${formatChartTime(event.time, timeFormat)} ${formatNumber(Math.abs(event.velocityKt ?? 0), "", 1)}`;
}

function currentLabelY(event: CurrentEvent, y: number, height: number) {
  if (event.type === "max_flood") return peakLabelY(y);
  if (event.type === "max_ebb") return troughLabelY(y, height);
  return y < height / 2 ? y + 22 : y - 14;
}

export function CurrentCurveInstrument({ velocityKt, directionText, state = "unknown", nextSlack, nextMaxFlood, nextMaxEbb, events, points, mode = "fullscreen", timeFormat }: CurrentCurveInstrumentProps) {
  const width = 960;
  const height = 180;
  const stroke = mode === "eink" ? 5 : 3;
  const padding = 10;
  const path = buildSignedLinePath(points, (point) => point.velocityKt, width, height, padding);
  const nowPoint = signedPointPosition(points, new Date().toISOString(), (point) => point.velocityKt, width, height, padding);
  const chartEvents = visibleCurrentEvents(events || [nextSlack, nextMaxFlood, nextMaxEbb].filter(Boolean) as CurrentEvent[], points);

  if (!path) {
    return <UnavailableNotice title="Current station not configured" detail="Add a NOAA current station in Settings to show flood, ebb, max current, and slack." />;
  }

  return (
    <div className="curve-instrument compact">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tidal current velocity curve">
        <rect className="svg-chart-wash" x="6" y="14" width={width - 12} height={height - 28} />
        <line className="svg-grid" x1="6" x2={width - 6} y1="22" y2="22" />
        <line className="svg-grid strong" x1="6" x2={width - 6} y1={height / 2} y2={height / 2} />
        <line className="svg-grid" x1="6" x2={width - 6} y1={height - 22} y2={height - 22} />
        <text className="svg-label" x="22" y={height / 2 - 8}>FLOOD</text>
        <text className="svg-label" x="22" y={height / 2 + 18}>EBB</text>
        <path className="svg-line" strokeWidth={stroke} d={path} fill="none" />
        {chartEvents.map((event) => {
          const eventPoint = signedPointPosition(points, event.time, (point) => point.velocityKt, width, height, padding);
          if (!eventPoint) return null;
          return (
            <text key={`${event.type}-${event.time}`} className="svg-label chart-event-label" textAnchor="middle" x={labelX(eventPoint.x, width)} y={currentLabelY(event, eventPoint.y, height)}>
              {currentEventLabel(event, timeFormat)}
            </text>
          );
        })}
        {nowPoint ? (
          <g>
            <line className="svg-line" strokeWidth={Math.max(1, stroke - 1)} x1={nowPoint.x} x2={nowPoint.x} y1="12" y2={height - 12} strokeDasharray="6 8" />
            <text className="svg-label" x={Math.min(nowPoint.x + 12, width - 42)} y="18">NOW</text>
          </g>
        ) : null}
      </svg>
      <div className="curve-summary">
        <strong>{signedNumber(velocityKt, " kt", 1)} {state} {directionText ? `to ${directionText}` : ""}</strong>
        <span className="event-chip">SLACK {formatDisplayTime(nextSlack?.time, timeFormat)} {eventSpeed(nextSlack)}</span>
        <span className="event-chip">MAX FLOOD {formatDisplayTime(nextMaxFlood?.time, timeFormat)} {eventSpeed(nextMaxFlood)}</span>
        <span className="event-chip">MAX EBB {formatDisplayTime(nextMaxEbb?.time, timeFormat)} {eventSpeed(nextMaxEbb, true)}</span>
      </div>
    </div>
  );
}
