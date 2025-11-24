import React from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

// Dummy city + properties data (same as your Leaflet example)
const cities = [
  {
    name: "Nagpur",
    lat: 21.1458,
    lng: 79.0882,
    properties: [
      { id: 1, title: "2 BHK Flat", price: "₹50L", lat: 21.149, lng: 79.09 },
      {
        id: 2,
        title: "3 BHK Villa",
        price: "₹1.2Cr",
        lat: 21.142,
        lng: 79.095,
      },
    ],
  },
  {
    name: "Pune",
    lat: 18.5204,
    lng: 73.8567,
    properties: [
      { id: 3, title: "1 BHK Studio", price: "₹30L", lat: 18.52, lng: 73.85 },
    ],
  },
];

export default function CityMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [selected, setSelected] = React.useState(null);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="h-[100%] w-full rounded-lg overflow-hidden shadow-md">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: 21.1458, lng: 79.0882 }} // default Nagpur
        zoom={12}
      >
        {/* Loop through cities and their properties */}
        {cities.map((city) =>
          city.properties.map((property) => (
            <Marker
              key={property.id}
              position={{ lat: property.lat, lng: property.lng }}
              onClick={() => setSelected({ ...property, city: city.name })}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: isLoaded
                  ? new window.google.maps.Size(25, 25)
                  : undefined,
              }}
            />
          ))
        )}

        {/* InfoWindow popup */}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <h2 className="font-semibold">{selected.title}</h2>
              <p>{selected.price}</p>
              <p>
                <b>City:</b> {selected.city}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
