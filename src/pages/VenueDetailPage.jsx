import { useMemo } from "react";
import { useAuth } from "../store/auth";
import { venueApi } from "../lib/venueApi";
import VenueDetailView from "../components/properties/VenueDetailView";

/** /properties/venue/:id : a Venue Booking property */
export default function VenueDetailPage() {
  const { URI } = useAuth();
  const api = useMemo(() => venueApi(URI), [URI]);
  return (
    <VenueDetailView
      api={api}
      mode="admin"
      basePath="/properties"
      editPath={(id) => `/properties/venue/${id}/edit`}
    />
  );
}
