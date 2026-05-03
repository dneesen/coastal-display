import type { SeaStateData } from "../../types/seaState";
import type { NdbcObservation } from "../api/ndbc";
import { degreesToCompass } from "../utils/direction";
import { metersToFeet, parseNumber } from "./units";

export function normalizeNdbcSeaState(observation: NdbcObservation | undefined): SeaStateData | undefined {
  if (!observation) return undefined;
  const waveDirection = parseNumber(observation.MWD);
  const primaryDirection = parseNumber(observation.S1DIR);
  const secondaryDirection = parseNumber(observation.S2DIR);
  const waveHeightFt = metersToFeet(parseNumber(observation.WVHT));
  if (waveHeightFt === undefined) return undefined;
  return {
    observed: {
      stationId: observation.stationId || "",
      stationName: `NDBC Buoy ${observation.stationId}`,
      updatedAt: observation.updatedAt,
      waveHeightFt,
      waveDirectionDeg: waveDirection,
      waveDirectionText: degreesToCompass(waveDirection),
      dominantPeriodSec: parseNumber(observation.DPD),
      averagePeriodSec: parseNumber(observation.APD),
      primarySwellHeightFt: metersToFeet(parseNumber(observation.S1HT)),
      primarySwellPeriodSec: parseNumber(observation.S1PD),
      primarySwellDirectionDeg: primaryDirection,
      primarySwellDirectionText: degreesToCompass(primaryDirection),
      secondarySwellHeightFt: metersToFeet(parseNumber(observation.S2HT)),
      secondarySwellPeriodSec: parseNumber(observation.S2PD),
      secondarySwellDirectionDeg: secondaryDirection,
      secondarySwellDirectionText: degreesToCompass(secondaryDirection),
      waterTempF: parseNumber(observation.WTMP) ? Math.round((parseNumber(observation.WTMP)! * 9) / 5 + 32) : undefined,
    },
  };
}
