import { formatDisplayDate, formatUpdatedAt } from "../../lib/utils/time";
import type { MarineDisplayData } from "../../types/display";
import type { DisplayProfile } from "../../types/profile";
import { SettingsButton } from "../settings/SettingsButton";

type DisplayHeaderProps = {
  data: MarineDisplayData;
  profile: DisplayProfile;
  source?: "live" | "partial" | "mock";
  isLoading?: boolean;
  errors?: string[];
  showSettings?: boolean;
  onSettingsClick?: () => void;
};

export function DisplayHeader({ data, profile, source = "mock", isLoading, errors = [], showSettings, onSettingsClick }: DisplayHeaderProps) {
  const sourceLabel = isLoading ? "Loading" : source === "live" ? "Live" : source === "partial" ? "Partial" : "Mock";
  const latitude = profile.location.latitude.toFixed(4);
  const longitude = profile.location.longitude.toFixed(4);

  return (
    <header className="display-header">
      <div className="header-title-block">
        <h1>{profile.location.label || data.location.name}</h1>
        <p>{latitude}, {longitude}</p>
      </div>
      <div className="header-meta">
        <span>{formatDisplayDate(data.updatedAt)}</span>
        <span>{formatUpdatedAt(data.updatedAt, profile.display.timeFormat)}</span>
        <span className={`source-badge ${source}`}>{sourceLabel}</span>
        <span>Tide {profile.stations.tideStationId}</span>
        <span>Buoy {profile.stations.buoyStationId || "not set"}</span>
      </div>
      {errors.length ? <div className="source-warning" title={errors.join("; ")}>Data notes</div> : null}
      {showSettings && onSettingsClick ? <SettingsButton onClick={onSettingsClick} /> : null}
    </header>
  );
}
