import { EinkDisplay } from "./routes/EinkDisplay";
import { FullscreenDisplay } from "./routes/FullscreenDisplay";
import { useDisplayProfile } from "../hooks/useDisplayProfile";

export function App() {
  const { profile, setProfile } = useDisplayProfile();
  const isEink = window.location.pathname === "/eink";

  return isEink ? <EinkDisplay profile={profile} /> : <FullscreenDisplay profile={profile} onProfileChange={setProfile} />;
}
