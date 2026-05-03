# Production Readiness Notes

Cloudflare deployment is intentionally last. Before that, the app should be judged against these local production checks.

## Data

- The UI consumes only normalized `MarineDisplayData`.
- Browser mode fetches public NWS, NOAA CO-OPS, and NDBC sources directly unless `VITE_USE_API_PROXY=true`.
- The `/api/display-data` Pages Function scaffold exists for the future proxy/cache path.
- Missing optional stations should render intentional unavailable states, not mock data that looks live.
- `refreshMinutes` controls the live-data polling interval, with a minimum of five minutes.

## Visual QA

- The primary display is a 16:9 landscape canvas.
- `/eink` uses the same data model with higher contrast and no settings control.
- `npm run render:eink` captures `public/renders/latest-eink.png` at 1600x900 by default.
- Tide and current curves should remain legible in grayscale.
- Active alerts should stay visible without obscuring the entire outlook.

## Verification

Run before deployment work:

```txt
npm test
npm run build
npm run render:eink
```

Manual checks:

- `/` loads and shows live or partial-live status.
- `/eink` fits in 16:9 without scrolling on desktop/render viewports.
- Settings can update location, stations, theme, and refresh interval.
- Station suggestions do not block manual station entry.

## Deferred Until Cloudflare Pass

- Make `/api/display-data` the default production data path.
- Add Cloudflare Pages configuration and deployment documentation.
- Add cache observability and structured source error logs.
- Add scheduled/static image delivery workflow for e-ink devices.
