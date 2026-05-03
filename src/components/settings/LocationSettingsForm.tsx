import { useState, type ChangeEvent } from "react";
import { suggestStations, type StationSuggestion } from "../../lib/api/stations";
import { parseCoordinate, parseCoordinatePair } from "../../lib/utils/coordinates";
import type { DisplayProfile } from "../../types/profile";

type LocationSettingsFormProps = {
  profile: DisplayProfile;
  onChange: (profile: DisplayProfile) => void;
};

export function LocationSettingsForm({ profile, onChange }: LocationSettingsFormProps) {
  const [suggestions, setSuggestions] = useState<StationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [stationError, setStationError] = useState<string | undefined>();

  const updateLocation = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "latitude" || name === "longitude") {
      const pair = parseCoordinatePair(value);
      if (pair) {
        onChange({
          ...profile,
          location: { ...profile.location, latitude: pair.latitude, longitude: pair.longitude },
        });
        return;
      }

      const coordinate = parseCoordinate(value, name);
      if (coordinate === undefined) return;
      onChange({
        ...profile,
        location: { ...profile.location, [name]: coordinate },
      });
      return;
    }

    onChange({
      ...profile,
      location: { ...profile.location, [name]: value },
    });
  };

  const updateStations = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onChange({
      ...profile,
      stations: { ...profile.stations, [name]: value || null },
    });
  };

  const updateDisplay = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    onChange({
      ...profile,
      display: { ...profile.display, [name]: name === "refreshMinutes" ? Number(value) : value },
    });
  };

  const updateUnits = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    onChange({
      ...profile,
      units: { ...profile.units, [name]: value },
    });
  };

  const findStations = async () => {
    setIsSearching(true);
    setStationError(undefined);
    try {
      setSuggestions(await suggestStations(profile.location.latitude, profile.location.longitude));
    } catch (error) {
      setStationError(error instanceof Error ? error.message : "Station lookup failed");
    } finally {
      setIsSearching(false);
    }
  };

  const applyStation = (station: StationSuggestion) => {
    if (station.type === "tide") {
      onChange({ ...profile, stations: { ...profile.stations, tideStationId: station.id } });
      return;
    }
    if (station.type === "current") {
      onChange({ ...profile, stations: { ...profile.stations, currentStationId: station.id } });
      return;
    }
    onChange({ ...profile, stations: { ...profile.stations, buoyStationId: station.id } });
  };

  return (
    <>
      <form className="settings-form">
        <label>Location label<input name="label" value={profile.location.label} onChange={updateLocation} /></label>
        <label>Latitude<input name="latitude" inputMode="text" value={profile.location.latitude} onChange={updateLocation} placeholder={'27.6386 N or 27 38 18.9 N'} /></label>
        <label>Longitude<input name="longitude" inputMode="text" value={profile.location.longitude} onChange={updateLocation} placeholder={'80.3973 W or -80 23 50.3'} /></label>
        <label>Timezone<input name="timezone" value={profile.location.timezone} onChange={updateLocation} /></label>
        <label>Tide station ID<input name="tideStationId" value={profile.stations.tideStationId} onChange={updateStations} /></label>
        <label>Current station ID<input name="currentStationId" value={profile.stations.currentStationId || ""} onChange={updateStations} /></label>
        <label>Buoy station ID<input name="buoyStationId" value={profile.stations.buoyStationId || ""} onChange={updateStations} /></label>
        <label>Theme
          <select name="theme" value={profile.display.theme} onChange={updateDisplay}>
            <option value="paper-chart">paper-chart</option>
            <option value="clean-marine">clean-marine</option>
            <option value="eink-almanac">eink-almanac</option>
            <option value="instrument-panel">instrument-panel</option>
          </select>
        </label>
        <label>Time format
          <select name="timeFormat" value={profile.display.timeFormat} onChange={updateDisplay}>
            <option value="12h">12-hour</option>
            <option value="24h">24-hour</option>
          </select>
        </label>
        <label>Pressure units
          <select name="pressure" value={profile.units.pressure} onChange={updateUnits}>
            <option value="inHg">inHg</option>
            <option value="hPa">hPa</option>
            <option value="mb">mb</option>
            <option value="mmHg">mmHg</option>
          </select>
        </label>
        <label>Refresh minutes<input name="refreshMinutes" type="number" min="5" value={profile.display.refreshMinutes} onChange={updateDisplay} /></label>
      </form>
      <div className="station-lookup">
        <button type="button" className="text-button" onClick={findStations} disabled={isSearching}>
          {isSearching ? "Finding stations..." : "Suggest stations and buoys"}
        </button>
        {stationError ? <p className="quiet-note">{stationError}</p> : null}
        {suggestions.length ? (
          <div className="station-list">
            {suggestions.map((station) => (
              <button key={`${station.type}-${station.id}`} type="button" onClick={() => applyStation(station)}>
                <strong>{station.type}</strong>
                <span>{station.id} - {station.name}<small>{station.source}{station.detail ? ` - ${station.detail}` : ""}</small></span>
                <em>{station.distanceMiles?.toFixed(1)} mi</em>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
