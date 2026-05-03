import type { MarineDisplayData } from "../../types/display";
import type { DisplayProfile } from "../../types/profile";
import type { TimeFormat } from "../../lib/utils/time";
import { BarometerInstrument } from "../instruments/BarometerInstrument";
import { CurrentCurveInstrument } from "../instruments/CurrentCurveInstrument";
import { ForecastAlmanacInstrument } from "../instruments/ForecastAlmanacInstrument";
import { HourlyForecastStrip } from "../instruments/HourlyForecastStrip";
import { MoonPhaseInstrument } from "../instruments/MoonPhaseInstrument";
import { SeaStateInstrument } from "../instruments/SeaStateInstrument";
import { ThermometerInstrument } from "../instruments/ThermometerInstrument";
import { TideCurveInstrument } from "../instruments/TideCurveInstrument";
import { WindRoseInstrument } from "../instruments/WindRoseInstrument";
import { AlertsPlacard } from "../instruments/AlertsPlacard";
import { InstrumentPanel } from "./InstrumentPanel";

type FullscreenLayoutProps = {
  data: MarineDisplayData;
  timeFormat?: TimeFormat;
  pressureUnit?: DisplayProfile["units"]["pressure"];
};

export function FullscreenLayout({ data, timeFormat, pressureUnit }: FullscreenLayoutProps) {
  return (
    <main className="fullscreen-grid">
      <InstrumentPanel title="Tide Height" note={data.tide.stationName} area="tide">
        <TideCurveInstrument {...data.tide} mode="fullscreen" timeFormat={timeFormat} />
      </InstrumentPanel>
      <InstrumentPanel title="Current Velocity" note={data.current.stationName} area="current">
        <CurrentCurveInstrument {...data.current} mode="fullscreen" timeFormat={timeFormat} />
      </InstrumentPanel>
      <InstrumentPanel title="Wind" area="wind">
        <WindRoseInstrument
          directionDeg={data.weather.windDirectionDeg}
          directionText={data.weather.windDirectionText}
          speedKt={data.weather.windSpeedKt}
          gustKt={data.weather.windGustKt}
          mode="fullscreen"
        />
      </InstrumentPanel>
      <InstrumentPanel title="Barometer" area="barometer">
        <BarometerInstrument
          currentPressureInHg={data.weather.pressureInHg}
          previousPressureInHg={data.weather.pressure12hAgoInHg}
          pressure24hAgoInHg={data.weather.pressure24hAgoInHg}
          pressureChange12hInHg={data.weather.pressureChange12hInHg}
          pressureChange24hInHg={data.weather.pressureChange24hInHg}
          trend={data.weather.pressureTrend}
          mode="fullscreen"
          pressureUnit={pressureUnit}
        />
      </InstrumentPanel>
      <InstrumentPanel title="Sea State" note={data.seaState.observed?.stationName} area="sea">
        <SeaStateInstrument {...data.seaState} mode="fullscreen" />
      </InstrumentPanel>
      <InstrumentPanel title="Moon Phase" area="moon">
        <MoonPhaseInstrument {...data.moon} mode="fullscreen" timeFormat={timeFormat} />
      </InstrumentPanel>
      <InstrumentPanel title="Thermometer" area="thermometer">
        <ThermometerInstrument
          currentTempF={data.weather.currentTempF}
          feelsLikeF={data.weather.feelsLikeF}
          condition={data.weather.condition}
          mode="fullscreen"
        />
      </InstrumentPanel>
      <InstrumentPanel title="Active Alerts" area="alerts">
        <AlertsPlacard alerts={data.alerts} mode="fullscreen" />
      </InstrumentPanel>
      <InstrumentPanel title="Hourly Forecast" area="hourly">
        <HourlyForecastStrip points={data.hourlyForecast} mode="fullscreen" timeFormat={timeFormat} />
      </InstrumentPanel>
      <InstrumentPanel title="Daily Forecast" area="forecast">
        <ForecastAlmanacInstrument periods={data.dailyForecast} mode="fullscreen" />
      </InstrumentPanel>
    </main>
  );
}
