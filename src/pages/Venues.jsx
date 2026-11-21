import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { promptDialog } from "../components/ui/Dialogs.jsx";

const STATUS_STYLE = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-800",
  live: "bg-green-100 text-green-700",
  paused: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
  held: "bg-yellow-100 text-yellow-800",
};

const Badge = ({ value }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[value] || "bg-gray-100"}`}>
    {value}
  </span>
);

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Venues = () => {
  const { URI, setLoading } = useAuth();
  const [tab, setTab] = useState("listings");
  const [status, setStatus] = useState("pending");
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);

  const call = useCallback(
    async (path, options = {}) => {
      const res = await fetch(URI + path, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || "Request failed");
      return data;
    },
    [URI],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "listings") {
        const data = await call(`/admin/venues${status ? `?status=${status}` : ""}`);
        setListings(data.listings || []);
      } else {
        const data = await call("/admin/venues/bookings");
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [call, tab, status, setLoading]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (listing, action) => {
    let body = { action };
    if (action === "approve") {
      const c = (await promptDialog("Reparv commission % for this listing (0-50)", String(listing.commission_percent ?? 10)));
      if (c === null) return;
      body.commission_percent = Number(c);
    } else {
      const reason = (await promptDialog("Reason for rejecting (shown to the owner)"));
      if (!reason) return;
      body.reason = reason;
    }
    try {
      await call(`/admin/venues/${listing.id}/decision`, { method: "POST", body: JSON.stringify(body) });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const cancel = async (booking) => {
    const reason = (await promptDialog(
      `Cancel ${booking.booking_ref}? The customer is refunded ₹${booking.amount_paid} in full.\nReason:`,
    ));
    if (!reason) return;
    try {
      const data = await call(`/admin/venues/bookings/${booking.id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) });
      alert(`Cancelled. Refund: ₹${data.refund_amount} (${data.refund_status}).`);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">Venue Booking</h1>
        <div className="flex gap-2">
          {["listings", "bookings"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-[#0BB501] text-white" : "bg-white border"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "listings" && (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {["pending", "live", "paused", "rejected", "draft", ""].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setStatus(s)}
                className={`px-3 py-1 rounded-full text-sm capitalize border ${status === s ? "bg-black text-white" : "bg-white"}`}
              >
                {s || "all"}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto bg-white rounded-xl border">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3">Venue</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Guests</th>
                  <th className="p-3">Commission</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 && (
                  <tr><td colSpan={8} className="p-6 text-center text-gray-500">No venues in this view.</td></tr>
                )}
                {listings.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-3 font-medium">
                      {l.title}
                      <div className="text-xs text-gray-500">Partner #{l.owner_id}</div>
                      {l.reject_reason && <div className="text-xs text-red-600">Rejected: {l.reject_reason}</div>}
                    </td>
                    <td className="p-3 capitalize">{l.type === "other" && l.custom_type ? l.custom_type : l.type}</td>
                    <td className="p-3">{l.city}</td>
                    <td className="p-3">{rupees(l.base_price)} / {l.price_model}</td>
                    <td className="p-3">{l.capacity}</td>
                    <td className="p-3">{l.commission_percent}%</td>
                    <td className="p-3"><Badge value={l.status} /></td>
                    <td className="p-3 whitespace-nowrap">
                      {l.status === "pending" && (
                        <button onClick={() => decide(l, "approve")} className="mr-2 px-3 py-1 rounded bg-green-600 text-white">Approve</button>
                      )}
                      {["pending", "live", "paused"].includes(l.status) && (
                        <button onClick={() => decide(l, "reject")} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "bookings" && (
        <div className="overflow-x-auto bg-white rounded-xl border">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Ref</th>
                <th className="p-3">Venue</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Guests</th>
                <th className="p-3">Total</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Refunded</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr><td colSpan={9} className="p-6 text-center text-gray-500">No bookings yet.</td></tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3 font-mono">{b.booking_ref}</td>
                  <td className="p-3">{b.listing_title}</td>
                  <td className="p-3 whitespace-nowrap">
                    {b.start_date} → {b.end_date}
                    {b.slot !== "full" && <span className="ml-1 text-xs text-gray-500">({b.slot})</span>}
                  </td>
                  <td className="p-3">{b.guests}</td>
                  <td className="p-3">{rupees(b.total_amount)}</td>
                  <td className="p-3">{rupees(b.amount_paid)}</td>
                  <td className="p-3">{b.refund_amount ? rupees(b.refund_amount) : "—"}</td>
                  <td className="p-3"><Badge value={b.status} /></td>
                  <td className="p-3">
                    {["held", "confirmed"].includes(b.status) && (
                      <button onClick={() => cancel(b)} className="px-3 py-1 rounded bg-red-600 text-white">Cancel &amp; refund</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Venues;
