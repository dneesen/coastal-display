import { DisplayFrame } from "../../components/layout/DisplayFrame";
import { DisplayHeader } from "../../components/layout/DisplayHeader";
import { EinkLayout } from "../../components/layout/EinkLayout";
import { useDisplayData } from "../../hooks/useDisplayData";
import type { DisplayProfile } from "../../types/profile";

type EinkDisplayProps = {
  profile: DisplayProfile;
};

export function EinkDisplay({ profile }: EinkDisplayProps) {
  const { data, source, errors, isLoading } = useDisplayData(profile);
  return (
    <DisplayFrame mode="eink">
      <DisplayHeader data={data} profile={{ ...profile, display: { ...profile.display, mode: "eink" } }} source={source} errors={errors} isLoading={isLoading} />
      <EinkLayout data={data} timeFormat={profile.display.timeFormat} pressureUnit={profile.units.pressure} />
    </DisplayFrame>
  );
}
