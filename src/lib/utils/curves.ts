type PointLike = { time: string };

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length < 3) {
    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  }

  const commands = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[Math.min(points.length - 1, index + 2)];
    const cp1 = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const cp2 = {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    };
    commands.push(`C ${cp1.x.toFixed(1)} ${cp1.y.toFixed(1)}, ${cp2.x.toFixed(1)} ${cp2.y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`);
  }
  return commands.join(" ");
}

export function buildLinePath<T extends PointLike>(
  points: T[],
  getValue: (point: T) => number,
  width: number,
  height: number,
  padding = 12,
): string {
  if (points.length === 0) return "";
  const values = points.map(getValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return smoothPath(
    points.map((point, index) => {
      const x = padding + (index / Math.max(1, points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((getValue(point) - min) / span) * (height - padding * 2);
      return { x, y };
    }),
  );
}

export function pointPosition<T extends PointLike>(
  points: T[],
  targetTime: string | undefined,
  getValue: (point: T) => number,
  width: number,
  height: number,
  padding = 12,
): { x: number; y: number } | null {
  if (!targetTime || points.length === 0) return null;
  const target = new Date(targetTime).getTime();
  const times = points.map((point) => new Date(point.time).getTime());
  const values = points.map(getValue);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const spanTime = maxTime - minTime || 1;
  const spanValue = maxValue - minValue || 1;
  const nearest = points.reduce((best, point) => {
    const distance = Math.abs(new Date(point.time).getTime() - target);
    return distance < best.distance ? { point, distance } : best;
  }, { point: points[0], distance: Number.POSITIVE_INFINITY });
  const ratio = Math.max(0, Math.min(1, (target - minTime) / spanTime));
  const x = padding + ratio * (width - padding * 2);
  const y = height - padding - ((getValue(nearest.point) - minValue) / spanValue) * (height - padding * 2);
  return { x, y };
}

export function buildSignedLinePath<T extends PointLike>(
  points: T[],
  getValue: (point: T) => number,
  width: number,
  height: number,
  padding = 12,
): string {
  if (points.length === 0) return "";
  const maxAbs = Math.max(0.1, ...points.map((point) => Math.abs(getValue(point))));
  return smoothPath(
    points.map((point, index) => {
      const x = padding + (index / Math.max(1, points.length - 1)) * (width - padding * 2);
      const y = height / 2 - (getValue(point) / maxAbs) * (height / 2 - padding);
      return { x, y };
    }),
  );
}

export function signedPointPosition<T extends PointLike>(
  points: T[],
  targetTime: string | undefined,
  getValue: (point: T) => number,
  width: number,
  height: number,
  padding = 12,
): { x: number; y: number } | null {
  if (!targetTime || points.length === 0) return null;
  const target = new Date(targetTime).getTime();
  const times = points.map((point) => new Date(point.time).getTime());
  const maxAbs = Math.max(0.1, ...points.map((point) => Math.abs(getValue(point))));
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const spanTime = maxTime - minTime || 1;
  const nearest = points.reduce((best, point) => {
    const distance = Math.abs(new Date(point.time).getTime() - target);
    return distance < best.distance ? { point, distance } : best;
  }, { point: points[0], distance: Number.POSITIVE_INFINITY });
  const ratio = Math.max(0, Math.min(1, (target - minTime) / spanTime));
  const x = padding + ratio * (width - padding * 2);
  const y = height / 2 - (getValue(nearest.point) / maxAbs) * (height / 2 - padding);
  return { x, y };
}
