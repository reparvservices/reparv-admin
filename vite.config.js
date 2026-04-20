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
          if (id.includes("@ckeditor") || id.includes("ckeditor")) {
            return "ckeditor";
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
          if (id.includes("@mui") || id.includes("@emotion")) {
            return "mui";
          }
          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("react-router") ||
            id.includes("scheduler")
          ) {
            return "react-core";
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
