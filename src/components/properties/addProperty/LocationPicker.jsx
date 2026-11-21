import React, { useState, useEffect, useRef } from "react";
import { MapContainer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FiCrosshair } from "react-icons/fi";
import { useAuth } from "../../../store/auth";
import SatelliteTileLayer, {
  SATELLITE_MAX_ZOOM,
} from "../../map/SatelliteTileLayer";

/* ── Custom green marker ─────────────────────────────────── */
const markerIcon = new L.DivIcon({
  className: "custom-marker",
  html: `
    <div style="
      position: relative; width: 30px; height: 30px;
      background: #16a34a; border-radius: 50% 50% 50% 0;
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
  popupAnchor: [0, -30],
});

const geocodeCache = {};

/* ── Fly to coords when they change ──────────────────────── */
function FlyToLocation({ coords, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, Math.max(zoom, map.getZoom()), { animate: true, duration: 1.2 });
  }, [coords, zoom, map]);
  return null;
}

/* ── Pin code for a point (cached), shared by map clicks and "use my location" ── */
async function reversePincode(lat, lng, URI) {
  try {
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (geocodeCache[key]) return geocodeCache[key];
    const res = await fetch(`${URI}/api/map/reverse?lat=${lat}&lon=${lng}`);
    const data = await res.json();
    const pin = data?.address?.postcode || "";
    geocodeCache[key] = pin;
    return pin;
  } catch {
    return "";
  }
}

/* ── Click handler — calls parent setter directly ─────────── */
function ClickHandler({ onPick, URI }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      onPick([lat, lng], await reversePincode(lat, lng, URI));
    },
  });
  return null;
}

/**
 * LocationPicker
 * Single marker — clicking moves the existing pin, never creates a second one.
 *
 * Props:
 *   onChange  : fn({ latitude, longitude, pincode })
 *   state, city, pincode : for auto-geocode
 *   latitude, longitude  : pre-set marker on edit
 */
export default function LocationPicker({
  onChange, state, city, pincode, latitude, longitude,
}) {
  const { URI }    = useAuth();
  const isFetching = useRef(false);

  /* Single source of truth for the marker position */
  const [coords, setCoords] = useState(
    latitude && longitude
      ? [parseFloat(latitude), parseFloat(longitude)]
      : null
  );

  /* Sync if parent passes lat/lng (edit mode) */
  useEffect(() => {
    if (latitude && longitude) {
      setCoords([parseFloat(latitude), parseFloat(longitude)]);
    }
  }, [latitude, longitude]);

  /* Auto-geocode from state/city/pincode */
  useEffect(() => {
    /* Skip if we already have a pinned location */
    if (coords) return;
    if (!city && !state && !pincode) return;

    const query = [pincode, city, state, "India"].filter(Boolean).join(", ");

    if (geocodeCache[query]) {
      setCoords(geocodeCache[query]);
      return;
    }

    if (isFetching.current) return;
    const timeoutId = setTimeout(() => {
      isFetching.current = true;
      fetch(`${URI}/api/map/geocode?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.length > 0) {
            const c = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            setCoords(c);
            geocodeCache[query] = c;
          }
        })
        .catch((e) => { if (e.name !== "AbortError") console.error("Geocode:", e); })
        .finally(() => { isFetching.current = false; });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [city, state, pincode, URI, coords]);

  /* Called when user clicks the map */
  const handlePick = ([lat, lng], pin) => {
    setCoords([lat, lng]);
    onChange({ latitude: lat, longitude: lng, pincode: pin });
  };

  /* Pin the device's current location */
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [flyZoom, setFlyZoom] = useState(13);

  const locate = () => {
    if (!navigator.geolocation) {
      setLocError("This browser can't share your location. Click the map to pin it instead.");
      return;
    }
    setLocError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: here }) => {
        const { latitude: lat, longitude: lng } = here;
        const pin = await reversePincode(lat, lng, URI);
        setFlyZoom(17);
        handlePick([lat, lng], pin);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocError(
          err.code === 1
            ? "Location permission was blocked. Allow it for this site in your browser, or click the map to pin the spot."
            : err.code === 3
              ? "Finding your location took too long. Try again, or click the map to pin the spot."
              : "Couldn't find your location. Click the map to pin the spot instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const pinned = coords
    ? { lat: coords[0].toFixed(5), lng: coords[1].toFixed(5) }
    : null;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-3 py-2 bg-green-50 border-b border-green-100 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-600 shrink-0" />
        <span className="text-xs font-medium text-green-700">
          {pinned ? "Click anywhere to move the pin" : "Click on the map to pin your property location"}
        </span>
      </div>

      {/* Map */}
      <div className="relative z-10! " style={{ height: 280 }}>
        <MapContainer
          center={coords || [20.5937, 78.9629]}
          zoom={coords ? 13 : 5}
          maxZoom={SATELLITE_MAX_ZOOM}
          style={{ height: "100%", width: "100%" }}
        >
          <SatelliteTileLayer />

          <FlyToLocation coords={coords} zoom={flyZoom} />

          {/* Single marker — moves on every click */}
          {coords && <Marker position={coords} icon={markerIcon} />}

          <ClickHandler onPick={handlePick} URI={URI} />
        </MapContainer>

        <button
          type="button"
          onClick={locate}
          disabled={locating}
          title="Pin my current location"
          className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-md ring-1 ring-black/10 hover:bg-gray-50 disabled:opacity-70 cursor-pointer"
        >
          <FiCrosshair size={14} className={locating ? "animate-spin" : ""} />
          {locating ? "Locating…" : "Use my location"}
        </button>
      </div>

      {locError && (
        <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{locError}</p>
      )}

      {/* Footer */}
      {pinned && (
        <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Pinned:</span>
          <span className="text-xs font-mono text-gray-600">
            {pinned.lat}, {pinned.lng}
          </span>
          {pincode && (
            <span className="ml-auto text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              📍 {pincode}
            </span>
          )}
          <button
            type="button"
            onClick={() => { setCoords(null); onChange({ latitude: "", longitude: "", pincode: "" }); }}
            className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Clear pin
          </button>
        </div>
      )}
    </div>
  );
}