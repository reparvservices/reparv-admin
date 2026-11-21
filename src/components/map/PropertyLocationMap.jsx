import { MapContainer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SatelliteTileLayer, { SATELLITE_MAX_ZOOM } from "./SatelliteTileLayer";

// Same pin as the location picker in the property form
const markerIcon = new L.DivIcon({
  className: "custom-marker",
  html: `
    <div style="
      position: relative; width: 30px; height: 30px;
      background: #076300; border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg); border: 3px solid white;
      box-shadow: 0 2px 8px rgba(83,35,220,0.45);
    ">
      <div style="
        width: 12px; height: 12px; background: white;
        border-radius: 50%; position: absolute;
        top: 50%; left: 50%; transform: translate(-50%, -50%);
      "></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

/** Read-only satellite map with the property pinned (same Leaflet map as the property form). */
export default function PropertyLocationMap({ lat, lng, height = 320 }) {
  return (
    <div className="relative z-0 overflow-hidden rounded-xl border border-gray-200" style={{ height }}>
      <MapContainer
        key={`${lat},${lng}`}
        center={[lat, lng]}
        zoom={16}
        maxZoom={SATELLITE_MAX_ZOOM}
        style={{ height: "100%", width: "100%" }}
      >
        <SatelliteTileLayer />
        <Marker position={[lat, lng]} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}
