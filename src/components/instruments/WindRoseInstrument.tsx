import type { DisplayMode } from "../../types/display";
import { formatNumber } from "../../lib/utils/units";

type WindRoseInstrumentProps = {
  directionDeg?: number;
  directionText?: string;
  speedKt?: number;
  gustKt?: number;
  mode?: DisplayMode;
};

function compassPoint(angle: number, outer: number, inner: number, width: number) {
  return `
    M 90 ${90 - outer}
    L ${90 + width} ${90 - inner}
    L 90 ${90 - 18}
    L ${90 - width} ${90 - inner}
    Z
  `;
}

export function WindRoseInstrument({ directionDeg = 0, directionText = "UNK", speedKt, gustKt, mode = "fullscreen" }: WindRoseInstrumentProps) {
  const stroke = mode === "eink" ? 3.4 : 2;

  return (
    <div className="wind-instrument">
      <svg viewBox="-8 -8 196 196" role="img" aria-label="Wind compass rose">
        <circle className="compass-outer" cx="90" cy="90" r="78" />
        <circle className="compass-ring" cx="90" cy="90" r="63" />
        <circle className="svg-muted" strokeWidth="1" cx="90" cy="90" r="42" fill="none" />

        {Array.from({ length: 64 }, (_, index) => (
          <g key={index} transform={`translate(90 90) rotate(${index * 5.625})`}>
            <line className={index % 8 === 0 ? "svg-line" : "svg-muted"} strokeWidth={index % 8 === 0 ? stroke : 1} x1="0" y1="-72" x2="0" y2={index % 8 === 0 ? -61 : -66} />
          </g>
        ))}

        {[0, 90, 180, 270].map((angle) => (
          <path key={`major-${angle}`} className="compass-point major" d={compassPoint(angle, 70, 23, 9)} transform={`rotate(${angle} 90 90)`} />
        ))}
        {[45, 135, 225, 315].map((angle) => (
          <path key={`minor-${angle}`} className="compass-point minor" d={compassPoint(angle, 55, 22, 7)} transform={`rotate(${angle} 90 90)`} />
        ))}

        <circle className="compass-hub-outer" cx="90" cy="90" r="18" />
        <circle className="svg-paper" strokeWidth={stroke} cx="90" cy="90" r="9" />
        <circle className="svg-fill" cx="90" cy="90" r="4" />

        {[
          ["N", 90, 0],
          ["E", 180, 90],
          ["S", 90, 180],
          ["W", 0, 90],
          ["NE", 153, 27],
          ["SE", 153, 153],
          ["SW", 27, 153],
          ["NW", 27, 27],
        ].map(([label, x, y]) => (
          <text key={label} className={String(label).length === 1 ? "compass-cardinal" : "compass-intercardinal"} x={x} y={y} textAnchor="middle" dominantBaseline="middle">
            {label}
          </text>
        ))}

        <g transform={`translate(90 90) rotate(${directionDeg})`}>
          <path className="wind-arrow-head" d="M0 -76 L10 -48 L0 -55 L-10 -48 Z" />
          <line className="wind-arrow-stem" strokeWidth={stroke + 1} x1="0" y1="-52" x2="0" y2="52" />
        </g>
      </svg>
      <div className="wind-readout">
        <strong>{formatNumber(speedKt, " kt")}</strong>
        <span>From {directionText}</span>
        <small>Gust {formatNumber(gustKt, " kt")}</small>
      </div>
    </div>
  );
}
