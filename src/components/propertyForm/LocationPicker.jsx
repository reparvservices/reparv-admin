import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import SatelliteTileLayer, {
  SATELLITE_MAX_ZOOM,
} from "../map/SatelliteTileLayer";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../../store/auth";

// Custom Marker Icon
const markerIcon = new L.DivIcon({
  className: "custom-marker",
  html: `
    <div style="
      position: relative;
      width: 30px;
      height: 30px;
      background: #2563eb;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 14px;
        height: 14px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Cache for geocoding results
const geocodeCache = {};

// Smooth map movement
function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 12, { animate: true, duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

// Handles clicks + reverse geocoding
function LocationMarker({ onLocationSelect, URI }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      try {
        const cacheKey = `${lat},${lng}`;
        if (geocodeCache[cacheKey]) {
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            pincode: geocodeCache[cacheKey],
          });
          return;
        }

        // call backend reverse geocode API
        const res = await fetch(`${URI}/api/map/reverse?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const pincode = data?.address?.postcode || "";

        geocodeCache[cacheKey] = pincode;
        onLocationSelect({ latitude: lat, longitude: lng, pincode });
      } catch (err) {
        onLocationSelect({ latitude: lat, longitude: lng, pincode: "" });
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={markerIcon} />
  );
}

// Main Component
export default function LocationPicker({
  onChange,
  state,
  city,
  pincode,
  latitude,
  longitude,
}) {
  const { URI } = useAuth();
  const [coords, setCoords] = useState(null);
  const isFetching = useRef(false);

  // If lat/lon already present → set as initial marker
  useEffect(() => {
    if (latitude && longitude) {
      setCoords([parseFloat(latitude), parseFloat(longitude)]);
    }
  }, [latitude, longitude]);

  // If no coords, try geocoding from state/city/pincode
  useEffect(() => {
    if (coords || (!city && !state && !pincode)) return;

    const query = `${pincode ? pincode + "," : ""} ${city ? city + "," : ""} ${
      state ? state + "," : ""
    } India`.trim();

    if (geocodeCache[query]) {
      setCoords(geocodeCache[query]);
      return;
    }

    if (isFetching.current) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      isFetching.current = true;

      fetch(`${URI}/api/map/geocode?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const newCoords = [
              parseFloat(data[0].lat),
              parseFloat(data[0].lon),
            ];
            setCoords(newCoords);
            geocodeCache[query] = newCoords;
          }
        })
        .catch(() => {})
        .finally(() => {
          isFetching.current = false;
        });
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [city, state, pincode, URI, coords]);

  return (
    <div className="w-full">
      <div className="w-full h-[300px] rounded-lg overflow-hidden border">
        <MapContainer
          maxZoom={SATELLITE_MAX_ZOOM}
          center={coords || [20.5937, 78.9629]}
          zoom={coords ? 12 : 5}
          style={{ height: "100%", width: "100%", zIndex: 10, }}
        >
          <SatelliteTileLayer />


          {/* Other children */}
          <FlyToLocation coords={coords} />
          {coords && <Marker position={coords} icon={markerIcon} />}
          <LocationMarker onLocationSelect={onChange} URI={URI} />
        </MapContainer>
      </div>
    </div>
  );
}
