import { TileLayer } from "react-leaflet";

// Google satellite imagery with road/place labels (lyrs=y = hybrid).
// Shared by every map in the panel so they all look the same.
export const SATELLITE_MAX_ZOOM = 20;

export default function SatelliteTileLayer() {
  return (
    <TileLayer
      attribution="© Google Maps"
      url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      subdomains={["mt0", "mt1", "mt2", "mt3"]}
      maxZoom={SATELLITE_MAX_ZOOM}
    />
  );
}
