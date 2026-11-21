import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegClock,
  FaTimesCircle,
  FaUserTie,
  FaUsers,
  FaBed,
  FaRupeeSign,
  FaCalendarCheck,
} from "react-icons/fa";
import { PiBuildingsFill } from "react-icons/pi";
import PropertyLocationMap from "../map/PropertyLocationMap";
import { confirmDialog, promptDialog } from "../ui/Dialogs.jsx";

/**
 * Venue Booking detail (a venue is a property type). One view for both panels:
 *   mode "partner": submit for approval, pause / resume, block dates
 *   mode "admin"  : approve / reject
 */

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "media", label: "Photos & Media" },
  { key: "pricing", label: "Pricing & Rules" },
  { key: "location", label: "Location" },
  { key: "availability", label: "Availability", partnerOnly: true },
  { key: "bookings", label: "Bookings" },
];

const STATUS = {
  draft: { label: "Draft", tone: "gray" },
  pending: { label: "Pending approval", tone: "blue" },
  live: { label: "Live", tone: "green" },
  paused: { label: "Paused", tone: "amber" },
  rejected: { label: "Rejected", tone: "red" },
};

const BOOKING_STATUS = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
  held: "bg-yellow-100 text-yellow-800",
};

const POLICY = {
  flexible: "Flexible: full refund until 2 days before",
  moderate: "Moderate: full refund until 7 days before",
  strict: "Strict: 50% refund until 14 days before",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

const parseList = (v, fallback) => {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") return v;
  try {
    return JSON.parse(v || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};
const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const formatNumber = (n) => Number(n || 0).toLocaleString("en-IN");
const per = (l) => (l.price_model === "night" ? "night" : "slot");
const typeName = (l) => (l.type === "other" && l.custom_type ? l.custom_type : l.type);

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ───────────────────────── small UI pieces ───────────────────────── */

function Badge({ tone = "gray", children }) {
  const tones = {
    green: "bg-[#EAFBF1] text-[#0B8A01] border-[#BFEFD0]",
    red: "bg-[#FDECEC] text-[#D11A1A] border-[#F6C9C9]",
    blue: "bg-[#E9F2FF] text-[#0057D9] border-[#C8DCFB]",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

function Btn({ variant = "primary", className = "", children, ...props }) {
  const variants = {
    primary: "bg-[#076300] text-white hover:bg-[#065400] border-[#076300]",
    secondary: "bg-white text-gray-800 hover:bg-gray-50 border-gray-300",
    danger: "bg-white text-red-600 hover:bg-red-50 border-red-300",
  };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Detail({ label, value }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && !value.length)) return null;
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-gray-900">{Array.isArray(value) ? value.join(", ") : value}</dd>
    </div>
  );
}

/* ───────────────────────── tabs ───────────────────────── */

function OverviewTab({ l, amenities }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title="Venue Details" className="lg:col-span-2">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
          <Detail label="Venue type" value={<span className="capitalize">{typeName(l)}</span>} />
          <Detail label="Capacity" value={l.capacity ? `${l.capacity} guests` : ""} />
          <Detail label="Bedrooms" value={l.bedrooms} />
          <Detail label="Pricing" value={`Per ${per(l)}`} />
          <Detail label="City" value={l.city} />
          <Detail label="State" value={l.state} />
        </dl>
        {l.description && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="mb-1 text-xs text-gray-500">Description</p>
            <p className="whitespace-pre-line text-sm text-gray-800">{l.description}</p>
          </div>
        )}
      </Card>

      <Card title="Amenities">
        {amenities.length ? (
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <span key={a} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">{a}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No amenities listed.</p>
        )}
      </Card>
    </div>
  );
}

function MediaTab({ images, videos, social }) {
  const links = Object.entries(social || {}).filter(([, v]) => v);
  return (
    <div className="space-y-5">
      <Card title="Photos" subtitle="The first photo is the cover">
        {images.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {images.map((src, i) => (
              <img key={`${src}-${i}`} src={src} alt={`Photo ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full rounded-xl bg-gray-100 object-cover" />
            ))}
          </div>
        )}
      </Card>
      <Card title="Videos & links">
        {videos.length === 0 && links.length === 0 ? (
          <p className="text-sm text-gray-500">No videos or links added.</p>
        ) : (
          <div className="space-y-4">
            {videos.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {videos.map((src) => (
                  <video key={src} src={src} controls className="aspect-video w-full rounded-xl bg-black" />
                ))}
              </div>
            )}
            {links.length > 0 && (
              <dl className="grid gap-3 md:grid-cols-2">
                {links.map(([key, url]) => (
                  <div key={key}>
                    <dt className="text-xs capitalize text-gray-500">{key}</dt>
                    <dd><a href={url} target="_blank" rel="noreferrer" className="break-all text-sm font-medium text-[#076300] hover:underline">{url}</a></dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function PricingTab({ l }) {
  const rows = [
    [`Base price (per ${per(l)})`, rupees(l.base_price)],
    l.weekend_price ? ["Weekend price (Fri/Sat)", rupees(l.weekend_price)] : null,
    Number(l.cleaning_fee) ? ["Cleaning fee", rupees(l.cleaning_fee)] : null,
    ["GST", `${Number(l.gst_percent ?? 18)}%`],
    ["Customer pays at booking", `${l.deposit_percent}%`],
    ["Reparv commission", `${Number(l.commission_percent ?? 10)}%`],
    l.price_model === "night" ? ["Minimum stay", `${l.min_nights} night${l.min_nights === 1 ? "" : "s"}`] : null,
    l.price_model === "night" ? ["Maximum stay", `${l.max_nights} nights`] : null,
  ].filter(Boolean);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title="Pricing" className="lg:col-span-1">
        <dl className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 text-sm">
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-semibold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <div className="space-y-5 lg:col-span-2">
        <Card title="Cancellation policy">
          <p className="text-sm text-gray-800">{POLICY[l.cancellation_policy] || l.cancellation_policy}</p>
        </Card>
        <Card title="House rules">
          {l.rules ? <p className="whitespace-pre-line text-sm text-gray-800">{l.rules}</p> : <p className="text-sm text-gray-500">No house rules added.</p>}
        </Card>
      </div>
    </div>
  );
}

function LocationTab({ l }) {
  const lat = Number(l.latitude);
  const lng = Number(l.longitude);
  const hasCoords = l.latitude != null && l.longitude != null && Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
  const address = [l.address, l.city, l.state].filter(Boolean).join(", ");
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title="Address" className="lg:col-span-1">
        <dl className="space-y-3">
          <Detail label="Address / landmark" value={l.address} />
          <Detail label="City" value={l.city} />
          <Detail label="State" value={l.state} />
          <Detail label="Latitude" value={hasCoords ? l.latitude : ""} />
          <Detail label="Longitude" value={hasCoords ? l.longitude : ""} />
        </dl>
        {address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hasCoords ? `${lat},${lng}` : address)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#076300] hover:underline"
          >
            <FaExternalLinkAlt size={12} /> Open in Google Maps
          </a>
        )}
      </Card>
      <Card title="Map" className="lg:col-span-2">
        {hasCoords ? (
          <PropertyLocationMap lat={lat} lng={lng} height={320} />
        ) : (
          <p className="py-16 text-center text-sm text-gray-500">No map pin saved for this venue.</p>
        )}
      </Card>
    </div>
  );
}

function AvailabilityTab({ l, api, onChanged }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [slot, setSlot] = useState("full");
  const [busy, setBusy] = useState(false);
  const canBlock = ["live", "paused"].includes(l.status);
  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#076300] focus:ring-2 focus:ring-[#076300]/20";

  const run = async (unblock) => {
    if (!from) return alert("Choose a from date.");
    setBusy(true);
    try {
      const body = { from, to: to || from, slot, ...(unblock ? {} : { reason: "Blocked by owner" }) };
      const data = unblock ? await api.unblock(l.id, body) : await api.block(l.id, body);
      alert(unblock ? `${data.unblocked} date(s) unblocked.` : `${data.blocked} date(s) blocked.`);
      onChanged?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Block or unblock dates" subtitle="Blocked dates can't be booked by customers (for your own use, maintenance, offline bookings)">
      {!canBlock ? (
        <p className="text-sm text-gray-500">Dates can be blocked once the venue is live.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">From</label>
            <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">To (inclusive)</label>
            <input type="date" className={inputCls} value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </div>
          {l.price_model === "slot" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Slot</label>
              <select className={inputCls} value={slot} onChange={(e) => setSlot(e.target.value)}>
                <option value="full">Full day</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          )}
          <div className="flex items-end gap-2">
            <Btn disabled={busy} onClick={() => run(false)}>Block</Btn>
            <Btn variant="secondary" disabled={busy} onClick={() => run(true)}>Unblock</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

function BookingsTab({ rows, loading, onCancel }) {
  return (
    <Card title="Bookings" subtitle="Reservations made for this venue">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="py-3 pr-5">Ref</th>
              <th className="py-3 pr-5">Dates</th>
              <th className="py-3 pr-5">Guest</th>
              <th className="py-3 pr-5">Guests</th>
              <th className="py-3 pr-5">Paid</th>
              <th className="py-3 pr-5">Status</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading bookings…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">No bookings for this venue yet.</td></tr>}
            {!loading &&
              rows.map((b) => (
                <tr key={b.id} className="hover:bg-[#F6F3FF]">
                  <td className="py-3 pr-5 font-mono">{b.booking_ref}</td>
                  <td className="whitespace-nowrap py-3 pr-5">{b.start_date} → {b.end_date}{b.slot !== "full" ? ` (${b.slot})` : ""}</td>
                  <td className="py-3 pr-5">{b.guest_name || "—"}<div className="text-xs text-gray-500">{b.guest_phone}</div></td>
                  <td className="py-3 pr-5">{b.guests}</td>
                  <td className="py-3 pr-5">{rupees(b.amount_paid)} <span className="text-xs text-gray-500">of {rupees(b.total_amount)}</span></td>
                  <td className="py-3 pr-5"><span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${BOOKING_STATUS[b.status] || "bg-gray-100"}`}>{b.status}</span></td>
                  <td className="py-3 text-right">
                    {b.status === "confirmed" && <Btn variant="danger" className="!px-3 !py-1" onClick={() => onCancel(b)}>Cancel</Btn>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function VenueDetailView({ api, mode = "partner", basePath = "/app/properties", editPath = (id) => `/app/property/venue/${id}/edit` }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = mode === "admin";

  const visibleTabs = TABS.filter((t) => !(t.partnerOnly && isAdmin));
  const tab = visibleTabs.some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") : "overview";
  const setTab = (key) => setSearchParams({ tab: key }, { replace: true });

  const [listing, setListing] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setListing(await api.get(id));
      setLoadError("");
    } catch (err) {
      setLoadError(err.message || "Could not load this venue.");
    }
  }, [api, id]);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const all = await api.bookings();
      setBookings(all.filter((b) => String(b.listing_id) === String(id)));
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    setListing(null);
    setActiveImage(0);
    load();
    loadBookings();
  }, [load, loadBookings]);

  const images = useMemo(() => (listing ? parseList(listing.images, []) : []), [listing]);
  const videos = useMemo(() => (listing ? parseList(listing.videos, []) : []), [listing]);
  const amenities = useMemo(() => (listing ? parseList(listing.amenities, []) : []), [listing]);
  const social = useMemo(() => (listing ? parseList(listing.social_links, {}) : {}), [listing]);

  const confirmedBookings = bookings.filter((b) => ["confirmed", "completed"].includes(b.status));
  const revenue = confirmedBookings.reduce((sum, b) => sum + Number(b.amount_paid || 0), 0);

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F4F6F8] p-6">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <PiBuildingsFill className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-semibold text-gray-900">{loadError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Btn variant="secondary" onClick={() => navigate(basePath)}>Back to Properties</Btn>
            <Btn onClick={load}>Try again</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="h-full overflow-y-auto bg-[#F4F6F8] p-4 md:p-6">
        <div className="mx-auto max-w-[1400px] space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  const l = listing;
  const st = STATUS[l.status] || { label: l.status, tone: "gray" };
  const cover = images[activeImage] || images[0];

  const decide = async (action) => {
    if (action === "approve") {
      const c = (await promptDialog("Reparv commission % for this listing (0-50)", String(l.commission_percent ?? 10)));
      if (c === null) return;
      run(() => api.decide(l.id, { action, commission_percent: Number(c) }));
    } else {
      const reason = (await promptDialog("Reason for rejecting (shown to the owner)"));
      if (!reason) return;
      run(() => api.decide(l.id, { action, reason }));
    }
  };

  const cancelBooking = async (b) => {
    if (!(await confirmDialog(`Cancel ${b.booking_ref}? The guest gets a full refund (${rupees(b.amount_paid)}).`))) return;
    try {
      const data = await api.cancelBooking(b.id);
      alert(`Cancelled. Refund: ₹${data.refund_amount} (${data.refund_status}).`);
      loadBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6F8]">
      <div className="mx-auto max-w-[1400px] space-y-5 p-4 pb-16 md:p-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => navigate(basePath)} className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            <FaArrowLeft /> Back to Properties
          </button>
          <p className="text-xs text-gray-500">
            Venue ID #{l.id}
            {l.updated_at ? ` · Updated ${formatDate(l.updated_at)}` : ""}
          </p>
        </div>

        {/* Status banner */}
        {["pending", "rejected", "draft", "paused"].includes(l.status) && (
          <div className={`flex flex-col gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
            l.status === "rejected" ? "border-red-200 bg-red-50" : l.status === "paused" ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"
          }`}>
            <div className="flex items-start gap-3">
              {l.status === "rejected" ? <FaTimesCircle className="mt-0.5 text-red-600" size={18} /> : <FaRegClock className="mt-0.5 text-[#0057D9]" size={18} />}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {l.status === "rejected" && "This venue was rejected"}
                  {l.status === "pending" && "Waiting for approval"}
                  {l.status === "draft" && "This venue is a draft"}
                  {l.status === "paused" && "This venue is paused"}
                </p>
                <p className="text-xs text-gray-600">
                  {l.status === "rejected" && `Reason: ${l.reject_reason || "No reason given"}. Edit it and submit again.`}
                  {l.status === "pending" && "It is hidden from customers until the Reparv team approves it."}
                  {l.status === "draft" && "Submit it for approval to make it bookable."}
                  {l.status === "paused" && "Customers can't book it until it is resumed."}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin && l.status === "pending" && (
                <>
                  <Btn disabled={busy} onClick={() => decide("approve")}><FaCheckCircle /> Approve</Btn>
                  <Btn variant="danger" disabled={busy} onClick={() => decide("reject")}><FaTimesCircle /> Reject</Btn>
                </>
              )}
              {!isAdmin && ["draft", "rejected"].includes(l.status) && (
                <Btn disabled={busy} onClick={() => run(() => api.action(l.id, "submit"))}>Submit for approval</Btn>
              )}
              {!isAdmin && l.status === "paused" && (
                <Btn disabled={busy} onClick={() => run(() => api.action(l.id, "resume"))}>Resume</Btn>
              )}
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:col-span-3">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
              <img
                src={cover || FALLBACK_IMG}
                alt={l.title}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                {images.length} photo{images.length === 1 ? "" : "s"}
              </span>
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button key={`${src}-${i}`} type="button" onClick={() => setActiveImage(i)}
                    className={`h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 ${i === activeImage ? "border-[#076300]" : "border-transparent opacity-80 hover:opacity-100"}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap gap-2">
              <Badge tone={st.tone}>{st.label}</Badge>
              <Badge tone="blue">Venue Booking</Badge>
              <Badge tone="gray"><span className="capitalize">{typeName(l)}</span></Badge>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{l.title}</h1>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-500">
                <FaMapMarkerAlt className="mt-0.5 shrink-0" />
                {[l.address, l.city, l.state].filter(Boolean).join(", ") || "No address"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <span className="capitalize">{typeName(l)}</span> · Venue Booking · Up to {l.capacity} guests
                {l.created_at ? ` · Listed ${formatDate(l.created_at)}` : ""}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{rupees(l.base_price)}</span>
                <span className="text-sm text-gray-500">per {per(l)}</span>
              </div>
              {l.weekend_price ? <p className="mt-0.5 text-xs text-gray-500">Weekend {rupees(l.weekend_price)}</p> : null}
            </div>

            {isAdmin && l.owner_name && (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAFBF1] text-[#076300]"><FaUserTie /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{l.owner_name}</p>
                  <p className="truncate text-xs text-gray-500">Project Partner{l.owner_contact ? ` · ${l.owner_contact}` : ""}{l.owner_city ? ` · ${l.owner_city}` : ""}</p>
                </div>
                {l.owner_contact && (
                  <a href={`tel:${l.owner_contact}`} className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50" aria-label="Call owner"><FaPhoneAlt size={12} /></a>
                )}
              </div>
            )}

            <div className="mt-auto grid grid-cols-2 gap-2">
              <Btn onClick={() => navigate(editPath(l.id))}><FaEdit /> Edit Details</Btn>
              {!isAdmin && l.status === "live" ? (
                <Btn variant="secondary" disabled={busy} onClick={() => run(() => api.action(l.id, "pause"))}>Pause venue</Btn>
              ) : (
                <Btn variant="secondary" onClick={() => setTab("pricing")}><FaRupeeSign /> Pricing &amp; Rules</Btn>
              )}
            </div>
            {isAdmin && l.status === "live" && (
              <button type="button" disabled={busy} onClick={() => decide("reject")} className="cursor-pointer text-left text-xs font-semibold text-gray-500 hover:text-red-600">
                Reject / unapprove venue
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {[
            { label: "Capacity", value: l.capacity, icon: <FaUsers />, color: "text-gray-600" },
            { label: "Bedrooms", value: l.bedrooms ?? "—", icon: <FaBed />, color: "text-[#076300]" },
            { label: "Bookings", value: bookingsLoading ? "—" : confirmedBookings.length, icon: <FaCalendarCheck />, color: "text-[#076300]" },
            { label: "Revenue", value: bookingsLoading ? "—" : rupees(revenue), icon: <FaRupeeSign />, color: "text-green-600" },
            { label: "Pay at booking", value: `${l.deposit_percent}%`, icon: <FaEye />, color: "text-blue-500" },
            { label: "Commission", value: `${Number(l.commission_percent ?? 10)}%`, icon: <FaRupeeSign />, color: "text-purple-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <p className={`flex items-center gap-1.5 text-xs font-medium ${s.color}`}>{s.icon} {s.label}</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                {typeof s.value === "number" ? formatNumber(s.value) : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-20 -mx-4 bg-[#F4F6F8]/95 px-4 py-2 backdrop-blur md:-mx-6 md:px-6">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {visibleTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`shrink-0 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t.key ? "bg-[#076300] text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {t.label}
                {t.key === "bookings" && !bookingsLoading && confirmedBookings.length > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${tab === t.key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"}`}>{confirmedBookings.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === "overview" && <OverviewTab l={l} amenities={amenities} />}
        {tab === "media" && <MediaTab images={images} videos={videos} social={social} />}
        {tab === "pricing" && <PricingTab l={l} />}
        {tab === "location" && <LocationTab l={l} />}
        {tab === "availability" && !isAdmin && <AvailabilityTab l={l} api={api} onChanged={loadBookings} />}
        {tab === "bookings" && <BookingsTab rows={bookings} loading={bookingsLoading} onCancel={cancelBooking} />}
      </div>
    </div>
  );
}
