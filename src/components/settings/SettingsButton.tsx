import { Wrench } from "lucide-react";

type SettingsButtonProps = {
  onClick: () => void;
};

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button className="settings-button" onClick={onClick} type="button" aria-label="Open settings">
      <Wrench size={18} strokeWidth={1.8} />
    </button>
  );
}
