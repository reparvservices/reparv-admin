import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Do not assign CKEditor to a manual chunk: its graph has circular deps;
          // forcing one chunk causes "Cannot access 'X' before initialization" in production.
          if (id.includes("@ckeditor") || id.includes("ckeditor")) {
            return;
          }
          if (
            id.includes("leaflet") ||
            id.includes("maplibre") ||
            id.includes("react-map-gl") ||
            id.includes("@mapbox") ||
            id.includes("@react-google-maps") ||
            id.includes("osmbuildings")
          ) {
            return "maps";
          }
          // MUI + Emotion: same TDZ risk as CKEditor if forced into one chunk.
          if (id.includes("@mui") || id.includes("@emotion")) {
            return;
          }
          // Do not merge React/react-dom/router/scheduler into a manual chunk: it can
          // yield duplicate or mis-ordered modules and "Cannot set properties of undefined
          // (setting 'Children')" in production.
          if (
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react/") ||
            id.includes("react-router") ||
            id.includes("node_modules/scheduler/")
          ) {
            return;
          }
          if (id.includes("react-icons")) {
            return "icons";
          }
          if (id.includes("date-fns")) {
            return "date-fns";
          }
          if (id.includes("react-data-table")) {
            return "datatables";
          }
          if (id.includes("react-select")) {
            return "react-select";
          }
          if (id.includes("axios")) {
            return "axios";
          }
          return "vendor";
        },
      },
    },
  },
});
