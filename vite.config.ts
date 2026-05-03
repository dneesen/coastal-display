import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/ndbc-active-stations": {
        target: "https://www.ndbc.noaa.gov",
        changeOrigin: true,
        rewrite: () => "/activestations.xml",
      },
      "/api/ndbc-latest": {
        target: "https://www.ndbc.noaa.gov",
        changeOrigin: true,
        rewrite: (path) => {
          const station = decodeURIComponent(path.match(/[?&]station=([^&]+)/)?.[1] || "");
          return `/data/realtime2/${encodeURIComponent(station.toUpperCase())}.txt`;
        },
      },
    },
  },
});
