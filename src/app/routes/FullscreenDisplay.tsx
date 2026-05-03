import { useState } from "react";
import { DisplayFrame } from "../../components/layout/DisplayFrame";
import { DisplayHeader } from "../../components/layout/DisplayHeader";
import { FullscreenLayout } from "../../components/layout/FullscreenLayout";
import { SettingsModal } from "../../components/settings/SettingsModal";
import { useDisplayData } from "../../hooks/useDisplayData";
import type { DisplayProfile } from "../../types/profile";

type FullscreenDisplayProps = {
  profile: DisplayProfile;
  onProfileChange: (profile: DisplayProfile) => void;
};

export function FullscreenDisplay({ profile, onProfileChange }: FullscreenDisplayProps) {
  const { data, source, errors, isLoading } = useDisplayData(profile);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <DisplayFrame mode="fullscreen">
      <DisplayHeader data={data} profile={profile} source={source} errors={errors} isLoading={isLoading} showSettings onSettingsClick={() => setSettingsOpen(true)} />
      <FullscreenLayout data={data} timeFormat={profile.display.timeFormat} pressureUnit={profile.units.pressure} />
      {settingsOpen ? <SettingsModal profile={profile} onChange={onProfileChange} onClose={() => setSettingsOpen(false)} /> : null}
    </DisplayFrame>
  );
}
