import { formatPressure, formatPressureDelta, formatPressureScale, pressureToDialAngle, type PressureUnit } from "../../lib/utils/pressure";
import type { DisplayMode } from "../../types/display";

type BarometerInstrumentProps = {
  currentPressureInHg?: number;
  previousPressureInHg?: number;
  pressure24hAgoInHg?: number;
  pressureChange12hInHg?: number;
  pressureChange24hInHg?: number;
  trend?: "rising" | "falling" | "steady" | "unknown";
  mode?: DisplayMode;
  pressureUnit?: PressureUnit;
};

const CENTER = { x: 150, y: 150 };
const MIN_PRESSURE = 28.8;
const MAX_PRESSURE = 31.1;

function polar(radius: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER.x + Math.cos(angle) * radius,
    y: CENTER.y + Math.sin(angle) * radius,
  };
}

function arcPath(radius: number, startAngle: number, endAngle: number) {
  const start = polar(radius, startAngle);
  const end = polar(radius, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function pressureAngle(pressure?: number) {
  return pressureToDialAngle(pressure ?? 29.92);
}

function needlePath(angle: number, length = 88) {
  const tip = polar(length, angle);
  const tail = polar(18, angle + 180);
  return `M ${tail.x.toFixed(1)} ${tail.y.toFixed(1)} L ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`;
}

function trendLabel(trend: BarometerInstrumentProps["trend"]) {
  if (!trend || trend === "unknown") return "Trend unknown";
  return trend.charAt(0).toUpperCase() + trend.slice(1);
}

export function BarometerInstrument({ currentPressureInHg, previousPressureInHg, pressure24hAgoInHg, pressureChange12hInHg, pressureChange24hInHg, trend = "unknown", mode = "fullscreen", pressureUnit = "inHg" }: BarometerInstrumentProps) {
  const currentAngle = pressureAngle(currentPressureInHg);
  const previousAngle = pressureAngle(previousPressureInHg ?? currentPressureInHg);
  const pressure24hAngle = pressureAngle(pressure24hAgoInHg ?? currentPressureInHg);
  const stroke = mode === "eink" ? 4 : 3;
  const pressures = [29.0, 29.5, 30.0, 30.5, 31.0];

  return (
    <div className="barometer-instrument">
      <div className="barometer-primary">
        <strong>{formatPressure(currentPressureInHg, pressureUnit)}</strong>
        <span>{trendLabel(trend)}</span>
      </div>

      <svg viewBox="0 0 300 178" role="img" aria-label="Barometer pressure gauge">
        <defs>
          <path id="barometer-rain-label-arc" d={arcPath(96, -128, -54)} />
          <path id="barometer-change-label-arc" d={arcPath(92, -36, 36)} />
          <path id="barometer-fair-label-arc" d={arcPath(96, 54, 128)} />
        </defs>
        <path className="barometer-zone rain-zone" d={arcPath(118, -130, -43)} />
        <path className="barometer-zone change-zone" d={arcPath(118, -43, 43)} />
        <path className="barometer-zone fair-zone" d={arcPath(118, 43, 130)} />
        <path className="barometer-arc" d={arcPath(118, -130, 130)} />
        <path className="barometer-inner-arc" d={arcPath(88, -130, 130)} />

        {pressures.map((pressure) => {
          const angle = pressureAngle(pressure);
          const outer = polar(126, angle);
          const inner = polar(98, angle);
          const label = polar(72, angle);
          return (
            <g key={pressure}>
              <line className="barometer-tick" strokeWidth={stroke} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} />
              <text className="barometer-scale-label" x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle">
                {formatPressureScale(pressure, pressureUnit)}
              </text>
            </g>
          );
        })}

        <text className="barometer-zone-label">
          <textPath href="#barometer-rain-label-arc" startOffset="50%" textAnchor="middle">RAIN</textPath>
        </text>
        <text className="barometer-zone-label">
          <textPath href="#barometer-change-label-arc" startOffset="50%" textAnchor="middle">CHANGE</textPath>
        </text>
        <text className="barometer-zone-label">
          <textPath href="#barometer-fair-label-arc" startOffset="50%" textAnchor="middle">FAIR</textPath>
        </text>

        {pressure24hAgoInHg ? <path className="barometer-ghost-needle barometer-ghost-24h" d={needlePath(pressure24hAngle, 62)} /> : null}
        {previousPressureInHg ? <path className="barometer-ghost-needle" d={needlePath(previousAngle, 82)} /> : null}
        <path className="barometer-needle" d={needlePath(currentAngle, 102)} />
        <circle className="barometer-hub" cx={CENTER.x} cy={CENTER.y} r="12" />
        <circle className="svg-fill" cx={CENTER.x} cy={CENTER.y} r="4" />
      </svg>

      <div className="barometer-readout">
        <span><b>12h</b> {formatPressureDelta(pressureChange12hInHg, pressureUnit, 12, false)}</span>
        <span className="barometer-readout-24h"><b>24h</b> {formatPressureDelta(pressureChange24hInHg, pressureUnit, 24, false)}</span>
      </div>
    </div>
  );
}
