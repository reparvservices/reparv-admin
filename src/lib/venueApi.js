/**
 * Venue Booking API for the admin panel (a venue is a property type).
 * Every call throws an Error with the server's message on failure.
 */
export function venueApi(URI) {
  const call = async (path = "", options = {}) => {
    const res = await fetch(`${URI}/admin/venues${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Request failed");
    return data;
  };

  return {
    list: async (status) => (await call(status ? `?status=${encodeURIComponent(status)}` : "")).listings || [],
    get: async (id) => (await call(`/${id}`)).listing,
    bookings: async () => (await call("/bookings")).bookings || [],

    /** Create (id empty) for a project partner, or update */
    save: async (id, body, { ownerId, publish = false } = {}) => {
      const res = id
        ? await call(`/${id}`, { method: "PUT", body: JSON.stringify(body) })
        : await call("", { method: "POST", body: JSON.stringify({ ...body, owner_id: ownerId, publish }) });
      return res.listing;
    },

    decide: async (id, body) => (await call(`/${id}/decision`, { method: "POST", body: JSON.stringify(body) })).listing,
    cancelBooking: (bookingId, reason = "Cancelled by admin") =>
      call(`/bookings/${bookingId}/cancel`, { method: "POST", body: JSON.stringify({ reason }) }),
  };
}
