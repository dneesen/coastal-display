import type { DisplayProfile } from "../../types/profile";
import { LocationSettingsForm } from "./LocationSettingsForm";

type SettingsModalProps = {
  profile: DisplayProfile;
  onChange: (profile: DisplayProfile) => void;
  onClose: () => void;
};

export function SettingsModal({ profile, onChange, onClose }: SettingsModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="kicker">Display profile</p>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button type="button" className="text-button" onClick={onClose}>Close</button>
        </div>
        <LocationSettingsForm profile={profile} onChange={onChange} />
      </section>
    </div>
  );
}
