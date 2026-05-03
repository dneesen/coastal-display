import { useEffect, useState } from "react";
import { fetchDisplayData, type DisplayDataResult } from "../lib/api/displayData";
import { mockDisplayData } from "../lib/mock/mockDisplayData";
import type { DisplayProfile } from "../types/profile";

export function useDisplayData(profile: DisplayProfile) {
  const [result, setResult] = useState<DisplayDataResult>({ data: mockDisplayData, source: "mock", errors: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let activeController: AbortController | undefined;
    let refreshTimer: number | undefined;
    let isMounted = true;
    const refreshMs = Math.max(5, profile.display.refreshMinutes || 30) * 60 * 1000;

    const load = (showLoading: boolean) => {
      activeController?.abort();
      activeController = new AbortController();
      if (showLoading) setIsLoading(true);

      fetchDisplayData(profile, activeController.signal)
        .then((nextResult) => {
          if (isMounted) setResult(nextResult);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (!isMounted) return;
          setResult({
            data: {
              ...mockDisplayData,
              location: {
                name: profile.location.label,
                latitude: profile.location.latitude,
                longitude: profile.location.longitude,
                timezone: profile.location.timezone,
              },
              updatedAt: new Date().toISOString(),
            },
            source: "mock",
            errors: [error instanceof Error ? error.message : "Display data fetch failed"],
          });
        })
        .finally(() => {
          if (isMounted && !activeController?.signal.aborted) setIsLoading(false);
        });
    };

    load(true);
    refreshTimer = window.setInterval(() => load(false), refreshMs);

    return () => {
      isMounted = false;
      activeController?.abort();
      if (refreshTimer !== undefined) window.clearInterval(refreshTimer);
    };
  }, [profile]);

  return { ...result, isLoading };
}
