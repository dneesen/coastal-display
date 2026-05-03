export function parseCoordinate(value: string, kind?: "latitude" | "longitude"): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const direction = trimmed.match(/[NSEW]/i)?.[0].toUpperCase();
  const numbers = trimmed.match(/[-+]?\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (!numbers.length) return undefined;

  let coordinate = Math.abs(numbers[0]);
  if (numbers.length > 1) coordinate += Math.abs(numbers[1]) / 60;
  if (numbers.length > 2) coordinate += Math.abs(numbers[2]) / 3600;

  const hasExplicitSign = /^[-+]/.test(trimmed);
  if (hasExplicitSign && !direction) coordinate = Math.sign(numbers[0]) * coordinate;
  if (direction === "S" || direction === "W") coordinate *= -1;

  const limit = kind === "latitude" ? 90 : kind === "longitude" ? 180 : 180;
  if (!Number.isFinite(coordinate) || Math.abs(coordinate) > limit) return undefined;
  return coordinate;
}

export function parseCoordinatePair(value: string): { latitude: number; longitude: number } | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parts = trimmed.split(/[;,]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const latitude = parseCoordinate(parts[0], "latitude");
    const longitude = parseCoordinate(parts[1], "longitude");
    if (latitude !== undefined && longitude !== undefined) return { latitude, longitude };
  }

  const signedDecimalPair = trimmed.match(/[-+]?\d+(?:\.\d+)?/g);
  if (signedDecimalPair?.length === 2) {
    const latitude = parseCoordinate(signedDecimalPair[0], "latitude");
    const longitude = parseCoordinate(signedDecimalPair[1], "longitude");
    if (latitude !== undefined && longitude !== undefined) return { latitude, longitude };
  }

  const latitudeMatches = Array.from(trimmed.matchAll(/([NS])\s*([-+]?\d+(?:\.\d+)?(?:[^NSEW,;+\-\d]+[-+]?\d+(?:\.\d+)?){0,2})|([-+]?\d+(?:\.\d+)?(?:[^NSEW,;+\-\d]+[-+]?\d+(?:\.\d+)?){0,2})\s*([NS])/gi));
  const longitudeMatches = Array.from(trimmed.matchAll(/([EW])\s*([-+]?\d+(?:\.\d+)?(?:[^NSEW,;+\-\d]+[-+]?\d+(?:\.\d+)?){0,2})|([-+]?\d+(?:\.\d+)?(?:[^NSEW,;+\-\d]+[-+]?\d+(?:\.\d+)?){0,2})\s*([EW])/gi));
  const cardinalLat = latitudeMatches[0] ? parseCoordinate(latitudeMatches[0][0], "latitude") : undefined;
  const cardinalLon = longitudeMatches[0] ? parseCoordinate(longitudeMatches[0][0], "longitude") : undefined;
  if (cardinalLat !== undefined && cardinalLon !== undefined) return { latitude: cardinalLat, longitude: cardinalLon };

  return undefined;
}
