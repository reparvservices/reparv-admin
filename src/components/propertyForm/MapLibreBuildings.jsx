// src/components/propertyForm/MapLibreBuildings.jsx
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapLibreBuildings({
  lat = 20.5937,
  lon = 78.9629,
  zoom = 14,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=5i64mmiSFTPZQrK8hcyq`,
      center: [lon, lat],
      zoom,
      pitch: 60, // tilt for 3D effect
      bearing: -20, // rotate slightly
      antialias: true, // smoother edges
    });

    map.current.on("load", () => {
      // Add 3D buildings layer with better design
      map.current.addLayer({
        id: "3d-buildings",
        source: "openmaptiles",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          // Color changes with height
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "render_height"],
            0, "#d9d9d9",      // low buildings = light gray
            50, "#a3c4f3",     // mid height = soft blue
            150, "#5a91d6",    // tall = stronger blue
            300, "#2b5c99",    // skyscraper = dark blue
          ],
          // Smooth height scaling with zoom
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15, 0,
            16, ["get", "render_height"],
          ],
          "fill-extrusion-base": ["get", "render_min_height"],
          "fill-extrusion-opacity": 0.9, // less transparent
        },
      });
    });
  }, [lat, lon, zoom]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "300px", borderRadius: "10px" }}
    />
  );
}