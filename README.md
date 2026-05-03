# Coastal Display

Paper-style coastal conditions dashboard for weather, tides, currents, wave state, pressure, moon phase, and active alerts.

## Local Development

```bash
npm install
npm run dev
```

Primary routes:

- `/` fullscreen display
- `/eink` 16:9 e-ink layout

## Verification

```bash
npm test -- --run
npm run build
```

To render the e-ink screenshot:

```bash
npm run render:eink
```

## Cloudflare Pages

Build settings:

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Node version: 22 or newer

Production uses Cloudflare Pages Functions for external NOAA/NWS/NDBC data calls. The production env file sets:

```text
VITE_USE_API_PROXY=true
```

Pages Functions live in `functions/api`.
