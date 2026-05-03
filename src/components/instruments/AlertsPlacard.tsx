import type { DisplayMode } from "../../types/display";
import type { WeatherAlert } from "../../types/weather";

type AlertsPlacardProps = {
  alerts: WeatherAlert[];
  mode?: DisplayMode;
};

export function AlertsPlacard({ alerts, mode = "fullscreen" }: AlertsPlacardProps) {
  if (alerts.length === 0) {
    return (
      <div className="alerts-ticker quiet">
        <strong>Alerts</strong>
        <span>No active alerts</span>
      </div>
    );
  }

  const tickerText = alerts
    .map((alert) => `${alert.event}: ${alert.headline || alert.description || "Active alert"}`)
    .join("     |     ");

  return (
    <div className={`alerts-ticker active ${mode}`}>
      <strong>Active Alerts</strong>
      <div className="ticker-window">
        <span>{tickerText}</span>
      </div>
    </div>
  );
}
