import { useEffect, useState } from "react";
import { defaultDisplayProfile } from "../lib/config/defaultDisplayProfile";
import type { DisplayProfile } from "../types/profile";

const STORAGE_KEY = "tidal-display-profile";

function isDefaultVeroLocation(profile: DisplayProfile) {
  return Math.abs(profile.location.latitude - defaultDisplayProfile.location.latitude) < 0.01
    && Math.abs(profile.location.longitude - defaultDisplayProfile.location.longitude) < 0.01;
}

function mergeStoredProfile(stored: Partial<DisplayProfile>): DisplayProfile {
  const profile = {
    ...defaultDisplayProfile,
    ...stored,
    location: { ...defaultDisplayProfile.location, ...stored.location },
    stations: { ...defaultDisplayProfile.stations, ...stored.stations },
    units: { ...defaultDisplayProfile.units, ...stored.units },
    display: { ...defaultDisplayProfile.display, ...stored.display },
  };

  if (profile.stations.currentStationId === "FPI0901") {
    profile.stations.currentStationId = defaultDisplayProfile.stations.currentStationId;
  }

  if (!profile.stations.buoyStationId && isDefaultVeroLocation(profile)) {
    profile.stations.buoyStationId = defaultDisplayProfile.stations.buoyStationId;
  }

  return profile;
}

export function useLocalStorageProfile() {
  const [profile, setProfile] = useState<DisplayProfile>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? mergeStoredProfile(JSON.parse(stored) as Partial<DisplayProfile>) : defaultDisplayProfile;
    } catch {
      return defaultDisplayProfile;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  return { profile, setProfile };
}
