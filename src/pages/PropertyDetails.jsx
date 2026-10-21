import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { useAuth } from "../store/auth";
import { getImageURI } from "../utils/helper";
import { formatNumber } from "../utils/formatNumber";
import { sharePropertyOnWhatsApp } from "../utils/propertyShare";
import FormatPrice from "../components/FormatPrice";
import DownloadCSV from "../components/DownloadCSV";
import UpdateImagesForm from "../components/propertyForm/UpdateImagesForm";
import { uploadFileToS3 } from "../utils/s3Upload";
import propertyPicture from "../assets/propertyPicture.svg";
import {
  FaArrowLeft,
  FaEye,
  FaHeart,
  FaPhoneAlt,
  FaWhatsapp,
  FaShareAlt,
  FaEdit,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaFire,
  FaStar,
  FaShieldAlt,
  FaTrash,
  FaMapMarkerAlt,
  FaFilePdf,
  FaUpload,
  FaUserTie,
  FaRegClock,
  FaYoutube,
  FaInstagram,
  FaVideo,
} from "react-icons/fa";
import { BiMessageRoundedDots } from "react-icons/bi";
import { PiBuildingsFill } from "react-icons/pi";


const TABS = [
  { key: "overview", label: "Overview" },
  { key: "media", label: "Photos & Media" },
  { key: "seo", label: "SEO" },
  { key: "commission", label: "Commission" },
  { key: "location", label: "Location" },
  { key: "promotion", label: "Promotion" },
  { key: "assignment", label: "Assignment" },
  { key: "additional", label: "Additional Info" },
];

const IMAGE_FIELDS = [
  ["frontView", "Front View"],
  ["sideView", "Side View"],
  ["hallView", "Hall"],
  ["kitchenView", "Kitchen"],
  ["bedroomView", "Bedroom"],
  ["bathroomView", "Bathroom"],
  ["balconyView", "Balcony"],
  ["nearestLandmark", "Nearest Landmark"],
  ["developedAmenities", "Amenities"],
];

const FLAT_INFO_CATEGORIES = ["NewFlat", "CommercialFlat"];
const PLOT_INFO_CATEGORIES = ["NewPlot", "CommercialPlot"];

const FLAT_CSV_FORMAT = [
  {
    Mouza: "Nagpur",
    Khasra_No: "123/ABC",
    Wing: "A",
    Wing_Facing: "East",
    Floor_No: "3",
    Flat_No: "101",
    Flat_Facing: "East",
    BHK_Type: "2 BHK",
    Carpet_Area: 2200,
    Builtup_Area: 1800,
    Super_Builtup_Area: 1800,
    Additional_Area: 100,
    Payable_Area: 2000,
    SQFT_Price: 10000,
    Basic_Cost: "=M2*N2",
    Stamp_Duty: 10000,
    Registration: 30000,
    GST: 500000,
    GOV_Water_Charge: 10000,
    Maintenance: 50000,
    Advocate_Fee: 20000,
    Other_Charges: 50000,
    Total_Cost: "=O2+P2+Q2+R2+S2+T2+U2+V2",
  },
];

const PLOT_CSV_FORMAT = [
  {
    Mouza: "Nagpur",
    Khasra_No: "123/ABC",
    Plot_No: "3",
    Facing: "East",
    Plot_Size: "20 X 30",
    Plot_Area: 2200,
    SQFT_Price: 1000,
    Basic_Cost: 2200 * 1000,
    Stamp_Duty: 10000,
    Registration: 30000,
    GST: 500000,
    Maintenance: 50000,
    Advocate_Fee: 20000,
    Other_Charges: 50000,
    Total_Cost: 2200000 + 10000 + 30000 + 50000 + 50000 + 20000 + 50000,
  },
];

const parseImages = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#076300] focus:ring-2 focus:ring-[#076300]/20";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

/* ───────────────────────── small UI pieces ───────────────────────── */

function Badge({ tone = "gray", icon, children }) {
  const tones = {
    green: "bg-[#EAFBF1] text-[#0B8A01] border-[#BFEFD0]",
    red: "bg-[#FDECEC] text-[#D11A1A] border-[#F6C9C9]",
    blue: "bg-[#E9F2FF] text-[#0057D9] border-[#C8DCFB]",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {icon}
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
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
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
    dangerSolid: "bg-red-600 text-white hover:bg-red-700 border-red-600",
    blue: "bg-[#0057D9] text-white hover:bg-[#004BBA] border-[#0057D9]",
  };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, disabled, label, description, icon }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-gray-500">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#076300]" : "bg-gray-300"
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Detail({ label, value }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && !value.length)) {
    return null;
  }
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900 break-words">
        {Array.isArray(value) ? value.join(", ") : value}
      </dd>
    </div>
  );
}

function ConfirmDialog({ dialog, onClose }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => setReason(dialog?.defaultReason || ""), [dialog]);
  if (!dialog) return null;

  const confirm = async () => {
    if (dialog.requireReason && !reason.trim()) return;
    setBusy(true);
    try {
      await dialog.onConfirm(reason.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900">{dialog.title}</h3>
        {dialog.message && <p className="mt-2 text-sm text-gray-600">{dialog.message}</p>}
        {dialog.requireReason && (
          <div className="mt-4">
            <label className={labelCls}>Reason (shown to the lister) *</label>
            <textarea
              rows={3}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Photos are blurry, please upload clear photos of the property"
              className={inputCls}
            />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Btn variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Btn>
          <Btn
            variant={dialog.danger ? "dangerSolid" : "primary"}
            onClick={confirm}
            disabled={busy || (dialog.requireReason && !reason.trim())}
          >
            {busy ? "Please wait..." : dialog.confirmLabel || "Confirm"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { URI, setShowUpdateImagesForm } = useAuth();

  const tab = TABS.some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") : "overview";
  const setTab = (key) => setSearchParams({ tab: key }, { replace: true });

  const [property, setProperty] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  // images form (shared component, controlled by the global store)
  const [imageData, setImageData] = useState({});
  const [imageFiles, setImageFiles] = useState(() =>
    Object.fromEntries(IMAGE_FIELDS.map(([f]) => [f, []])),
  );
  const [imagesPropertyId, setImagesPropertyId] = useState(id);

  const notify = (type, message) => {
    setToast({ type, message, at: Date.now() });
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${URI}/admin/properties/details/${id}`, { credentials: "include" });
      if (res.status === 404) throw new Error("This property doesn't exist or was deleted.");
      if (!res.ok) throw new Error("Could not load this property.");
      setProperty(await res.json());
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
    }
  }, [URI, id]);

  useEffect(() => {
    setProperty(null);
    load();
  }, [load]);

  /** PUT/POST/DELETE helper with toast feedback; returns true on success */
  const request = async (key, path, { method = "PUT", body, json, successMessage } = {}) => {
    setBusyAction(key);
    try {
      const res = await fetch(`${URI}/admin/properties/${path}`, {
        method,
        credentials: "include",
        ...(json ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) } : {}),
        ...(body ? { body } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Request failed");
      notify("success", successMessage || data?.message || "Saved");
      await load();
      return true;
    } catch (err) {
      notify("error", err.message || "Something went wrong");
      return false;
    } finally {
      setBusyAction("");
    }
  };

  const images = useMemo(() => {
    if (!property) return [];
    return IMAGE_FIELDS.flatMap(([field, label]) =>
      parseImages(property[field]).map((src) => ({ src: getImageURI(src), label })),
    );
  }, [property]);

  const openImagesForm = async (propertyId = id) => {
    try {
      const res = await fetch(`${URI}/admin/properties/${propertyId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load images");
      setImageData(await res.json());
      setImagesPropertyId(propertyId);
      setShowUpdateImagesForm(true);
    } catch (err) {
      notify("error", err.message);
    }
  };

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F4F6F8] p-6">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <PiBuildingsFill className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-semibold text-gray-900">{loadError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Btn variant="secondary" onClick={() => navigate("/properties")}>
              Back to Properties
            </Btn>
            <Btn onClick={load}>Try again</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
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

  const p = property;
  const isApproved = p.approve === "Approved";
  const isRejected = p.approve === "Rejected";
  const isActive = p.status === "Active";
  const cover = images[activeImage]?.src || images[0]?.src;
  const websiteUrl = p.seoSlug ? `https://www.reparv.in/property-info/${p.seoSlug}` : null;
  const seoFields = [p.seoSlug, p.seoTittle, p.seoDescription, p.propertyDescription];
  const seoComplete = seoFields.every((v) => String(v || "").trim());

  const confirmToggle = ({ key, path, title, message, confirmLabel, danger }) =>
    setDialog({
      title,
      message,
      confirmLabel,
      danger,
      onConfirm: () => request(key, path),
    });

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6F8] scrollbar-hide">
      <div className="mx-auto max-w-[1400px] space-y-5 p-4 pb-16 md:p-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/properties"))}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft /> Back to Properties
          </button>
          <p className="text-xs text-gray-500">
            ID #{p.propertyid}
            {p.propertycityid ? ` · ${p.propertycityid}` : ""}
            {p.updated_at ? ` · Updated ${p.updated_at}` : ""}
          </p>
        </div>

        {/* Approval banner */}
        {!isApproved && (
          <div
            className={`flex flex-col gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
              isRejected ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {isRejected ? (
                <FaTimesCircle className="mt-0.5 text-red-600" size={18} />
              ) : (
                <FaRegClock className="mt-0.5 text-[#0057D9]" size={18} />
              )}
              <div>
                <p className={`text-sm font-semibold ${isRejected ? "text-red-800" : "text-[#0047B3]"}`}>
                  {isRejected ? "This property was rejected" : "Waiting for approval"}
                </p>
                <p className={`text-xs ${isRejected ? "text-red-700" : "text-[#0057D9]"}`}>
                  {isRejected
                    ? `Reason: ${p.rejectreason || "No reason given"}`
                    : "It is hidden from the website until it is approved."}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Btn
                onClick={() =>
                  setDialog({
                    title: "Approve this property?",
                    message: "It will become visible on the website (if it is also Active).",
                    confirmLabel: "Approve",
                    onConfirm: () => request("approve", `approve/${id}`, { successMessage: "Property approved" }),
                  })
                }
                disabled={!!busyAction}
              >
                <FaCheckCircle /> Approve
              </Btn>
              {!isRejected && (
                <Btn
                  variant="danger"
                  onClick={() =>
                    setDialog({
                      title: "Reject this property?",
                      message: "The lister will see your reason.",
                      confirmLabel: "Reject",
                      danger: true,
                      requireReason: true,
                      onConfirm: (reason) =>
                        request("reject", `reject/${id}`, {
                          json: { rejectReason: reason },
                          successMessage: "Property rejected",
                        }),
                    })
                  }
                  disabled={!!busyAction}
                >
                  <FaTimesCircle /> Reject
                </Btn>
              )}
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Gallery */}
          <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
              <img
                src={cover || propertyPicture}
                alt={p.propertyName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = propertyPicture;
                }}
                className="h-full w-full object-cover"
              />
              {images[activeImage]?.label && (
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                  {images[activeImage].label}
                </span>
              )}
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                {images.length} photo{images.length === 1 ? "" : "s"}
              </span>
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={`${img.src}-${i}`}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                      i === activeImage ? "border-[#076300]" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={img.src} alt={img.label} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-2 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge tone={isApproved ? "green" : isRejected ? "red" : "blue"}>
                {p.approve}
              </Badge>
              <Badge tone={isActive ? "green" : "gray"}>{isActive ? "Active" : "Inactive"}</Badge>
              {p.hotDeal === "Active" && (
                <Badge tone="red" icon={<FaFire />}>
                  Hot Deal
                </Badge>
              )}
              {p.topPicksStatus === "Active" && (
                <Badge tone="amber" icon={<FaStar />}>
                  Top Pick
                </Badge>
              )}
              {p.reparvAssured === "Active" && (
                <Badge tone="green" icon={<FaShieldAlt />}>
                  Reparv Assured
                </Badge>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{p.propertyName}</h1>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-500">
                <FaMapMarkerAlt className="mt-0.5 shrink-0" />
                {[p.address, p.location, p.city, p.state].filter(Boolean).join(", ") || "No address"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {p.propertyCategory}
                {p.listingType ? ` · ${p.listingType}` : ""}
                {p.propertyKind ? ` · ${p.propertyKind}` : ""}
                {p.created_at ? ` · Listed ${p.created_at}` : ""}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Offer price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  <FormatPrice price={parseInt(p.totalOfferPrice) || 0} />
                </span>
                {Number(p.totalSalesPrice) > Number(p.totalOfferPrice) && (
                  <span className="text-sm text-gray-400 line-through">
                    <FormatPrice price={parseInt(p.totalSalesPrice) || 0} />
                  </span>
                )}
              </div>
            </div>

            {p.lister_name && (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAFBF1] text-[#076300]">
                  <FaUserTie />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{p.lister_name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {p.lister_type}
                    {p.lister_contact ? ` · ${p.lister_contact}` : ""}
                    {p.lister_city ? ` · ${p.lister_city}` : ""}
                  </p>
                </div>
                {p.lister_contact && (
                  <a
                    href={`tel:${p.lister_contact}`}
                    className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                    aria-label="Call lister"
                  >
                    <FaPhoneAlt size={12} />
                  </a>
                )}
              </div>
            )}

            <div className="mt-auto grid grid-cols-2 gap-2">
              <Btn onClick={() => navigate(`/properties/edit/${p.propertyid}`)}>
                <FaEdit /> Edit Details
              </Btn>
              <Btn variant="secondary" onClick={() => openImagesForm()}>
                <FaUpload /> Update Photos
              </Btn>
              <Btn
                variant="secondary"
                disabled={!websiteUrl}
                title={websiteUrl ? "" : "Add an SEO slug first"}
                onClick={() => window.open(websiteUrl, "_blank", "noopener")}
              >
                <FaExternalLinkAlt /> View on Website
              </Btn>
              <Btn
                variant="secondary"
                className="!text-[#128C3F]"
                onClick={() => sharePropertyOnWhatsApp(p)}
              >
                <FaWhatsapp /> Share
              </Btn>
            </div>
            {isApproved && (
              <button
                type="button"
                onClick={() =>
                  confirmToggle({
                    key: "approve",
                    path: `approve/${id}`,
                    title: "Unapprove this property?",
                    message: "It will be hidden from the website until approved again.",
                    confirmLabel: "Unapprove",
                    danger: true,
                  })
                }
                className="text-left text-xs font-semibold text-gray-500 hover:text-red-600"
              >
                Unapprove property
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {[
            { label: "Views", value: p.views, icon: <FaEye />, color: "text-gray-600" },
            { label: "Saved", value: p.likes, icon: <FaHeart />, color: "text-red-500" },
            { label: "Enquiries", value: p.enquiries, icon: <BiMessageRoundedDots />, color: "text-[#076300]" },
            { label: "Calls", value: p.calls, icon: <FaPhoneAlt />, color: "text-blue-500" },
            { label: "WhatsApp", value: p.whatsapp, icon: <FaWhatsapp />, color: "text-green-600" },
            { label: "Shares", value: p.shares, icon: <FaShareAlt />, color: "text-purple-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <p className={`flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
                {s.icon} {s.label}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">{formatNumber(s.value || 0)}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-20 -mx-4 bg-[#F4F6F8]/95 px-4 py-2 backdrop-blur md:-mx-6 md:px-6">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm scrollbar-hide">
            {TABS.filter(
              (t) =>
                t.key !== "additional" ||
                [...FLAT_INFO_CATEGORIES, ...PLOT_INFO_CATEGORIES].includes(p.propertyCategory),
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === t.key ? "bg-[#076300] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.label}
                {t.key === "seo" && !seoComplete && (
                  <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-500 align-middle" />
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === "overview" && <OverviewTab p={p} />}
        {tab === "media" && (
          <MediaTab p={p} images={images} id={id} URI={URI} request={request} busyAction={busyAction} openImagesForm={openImagesForm} setDialog={setDialog} notify={notify} />
        )}
        {tab === "seo" && <SeoTab p={p} id={id} request={request} busyAction={busyAction} />}
        {tab === "commission" && <CommissionTab p={p} id={id} request={request} busyAction={busyAction} />}
        {tab === "location" && <LocationTab p={p} id={id} request={request} busyAction={busyAction} />}
        {tab === "promotion" && (
          <PromotionTab p={p} id={id} request={request} busyAction={busyAction} confirmToggle={confirmToggle} notify={notify} />
        )}
        {tab === "assignment" && <AssignmentTab p={p} id={id} URI={URI} request={request} busyAction={busyAction} setDialog={setDialog} />}
        {tab === "additional" && <AdditionalInfoTab p={p} id={id} request={request} busyAction={busyAction} navigate={navigate} notify={notify} />}

        {/* Visibility & danger zone */}
        <Card title="Visibility & Danger Zone" subtitle="Status controls whether an approved property is shown on the website.">
          <div className="space-y-3">
            <Toggle
              icon={<FaEye />}
              label={isActive ? "Active" : "Inactive"}
              description={isActive ? "Shown on the website when approved." : "Hidden from the website."}
              checked={isActive}
              disabled={!!busyAction}
              onChange={() =>
                confirmToggle({
                  key: "status",
                  path: `status/${id}`,
                  title: isActive ? "Deactivate this property?" : "Activate this property?",
                  message: isActive
                    ? "It will be hidden from the website."
                    : "It will be shown on the website if it is approved.",
                  confirmLabel: isActive ? "Deactivate" : "Activate",
                  danger: isActive,
                })
              }
            />
            <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700">Delete property</p>
                <p className="text-xs text-red-600">Permanently removes the listing. This cannot be undone.</p>
              </div>
              <Btn
                variant="dangerSolid"
                disabled={!!busyAction}
                onClick={() =>
                  setDialog({
                    title: `Delete "${p.propertyName}"?`,
                    message: "This permanently deletes the property and cannot be undone.",
                    confirmLabel: "Delete permanently",
                    danger: true,
                    onConfirm: async () => {
                      setBusyAction("delete");
                      try {
                        const res = await fetch(`${URI}/admin/properties/delete/${id}`, {
                          method: "DELETE",
                          credentials: "include",
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) throw new Error(data?.message || "Delete failed");
                        navigate("/properties", { replace: true });
                      } catch (err) {
                        notify("error", err.message);
                      } finally {
                        setBusyAction("");
                      }
                    },
                  })
                }
              >
                <FaTrash /> Delete
              </Btn>
            </div>
          </div>
        </Card>
      </div>

      {/* Shared image manager */}
      <UpdateImagesForm
        fetchData={load}
        fetchImages={openImagesForm}
        propertyId={imagesPropertyId}
        setPropertyId={setImagesPropertyId}
        newProperty={imageData}
        setPropertyData={setImageData}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
      />

      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 px-4">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
              toast.type === "error" ? "bg-red-600" : "bg-[#076300]"
            }`}
          >
            {toast.type === "error" ? <FaTimesCircle /> : <FaCheckCircle />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── tabs ───────────────────────── */

function OverviewTab({ p }) {
  const priceRows = [
    ["Total Price", p.totalSalesPrice],
    ["Offer Price", p.totalOfferPrice],
    ["Stamp Duty", p.stampDuty],
    ["Registration Fee", p.registrationFee],
    ["GST", p.gst],
    ["Advocate Fee", p.advocateFee],
    ["MSEB / Water", p.msebWater],
    ["Maintenance", p.maintenance],
    ["Other", p.other],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "" && v !== "0");

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title="Property Details" className="lg:col-span-2">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
          <Detail label="Category" value={p.propertyCategory} />
          <Detail label="Listing Type" value={p.listingType} />
          <Detail label="Property Kind" value={p.propertyKind} />
          <Detail label="Configuration" value={p.propertyType} />
          <Detail label="Builder" value={p.company_name} />
          <Detail label="Project By" value={p.projectBy} />
          <Detail label="Carpet Area" value={p.carpetArea ? `${p.carpetArea}${/^\d+(\.\d+)?$/.test(p.carpetArea) ? " sq.ft" : ""}` : ""} />
          <Detail label="Built-up Area" value={p.builtUpArea ? `${p.builtUpArea}${/^\d+(\.\d+)?$/.test(p.builtUpArea) ? " sq.ft" : ""}` : ""} />
          <Detail label="Floor" value={p.floorNo && p.totalFloors ? `${p.floorNo} of ${p.totalFloors}` : p.floorNo || p.totalFloors} />
          <Detail label="Furnishing" value={p.furnishing} />
          <Detail label="Facing" value={p.propertyFacing} />
          <Detail label="Ownership" value={p.ownershipType} />
          <Detail label="Parking" value={p.parkingAvailability} />
          <Detail label="Water Supply" value={p.waterSupply} />
          <Detail label="Power Backup" value={p.powerBackup} />
          <Detail label="Built Year" value={p.builtYear} />
          <Detail label="Possession" value={p.possessionDate ? String(p.possessionDate).slice(0, 10) : ""} />
          <Detail label="Approved By" value={p.propertyApprovedBy} />
          <Detail label="RERA" value={p.reraRegistered} />
          <Detail label="Loan Available" value={p.loanAvailability} />
          <Detail label="Distance from City Centre" value={p.distanceFromCityCenter ? `${p.distanceFromCityCenter} km` : ""} />
          <Detail label="Pincode" value={p.pincode} />
        </dl>
        {p.propertyDescription && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="whitespace-pre-line text-sm text-gray-800">{p.propertyDescription}</p>
          </div>
        )}
      </Card>

      <div className="space-y-5">
        <Card title="Owner Contact">
          <dl className="space-y-3">
            <Detail label="Name" value={p.projectBy} />
            <Detail label="Phone" value={p.contact} />
            <Detail label="Email" value={p.email} />
          </dl>
          {!p.projectBy && !p.contact && !p.email && <p className="text-sm text-gray-500">No owner contact saved.</p>}
        </Card>
        <Card title="Pricing">
          {priceRows.length ? (
            <dl className="space-y-2">
              {priceRows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-semibold text-gray-900">
                    {/^\d+(\.\d+)?$/.test(String(value)) ? `₹${Number(value).toLocaleString("en-IN")}` : value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-gray-500">No pricing saved.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

// Same link shapes the server accepts (src/core/utils/videoLinks.js)
const YOUTUBE_REGEX =
  /^https?:\/\/(?:(?:www|m)\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([\w-]{11})(?:[?&#/].*)?$/i;
const INSTAGRAM_REEL_REGEX =
  /^https?:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(?:reel|reels|p|tv)\/([\w-]+)\/?(?:[?#].*)?$/i;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"];

function MediaTab({ p, images, id, URI, request, busyAction, openImagesForm, setDialog, notify }) {
  const [brochure, setBrochure] = useState(null);

  const saveBrochure = async () => {
    const form = new FormData();
    form.append("brochureFile", brochure);
    const ok = await request("brochure", `brochure/upload/${id}`, { body: form, successMessage: "Brochure saved" });
    if (ok) setBrochure(null);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card
        title="Photos"
        subtitle={`${images.length} photo${images.length === 1 ? "" : "s"} across all views`}
        action={
          <Btn onClick={() => openImagesForm()}>
            <FaUpload /> Manage Photos
          </Btn>
        }
        className="lg:col-span-2"
      >
        {images.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {images.map((img, i) => (
              <a
                key={`${img.src}-${i}`}
                href={img.src}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100"
              >
                <img src={img.src} alt={img.label} className="h-full w-full object-cover transition group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
                  {img.label}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500">
            No photos yet.
          </div>
        )}
      </Card>

      <Card title="Brochure" subtitle="Image or PDF buyers can download.">
        <div className="space-y-4">
          {p.brochureFile && !brochure && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <a
                href={getImageURI(p.brochureFile)}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#076300] hover:underline"
              >
                <FaFilePdf className="shrink-0" />
                <span className="truncate">Current brochure</span>
              </a>
              <button
                type="button"
                onClick={() =>
                  setDialog({
                    title: "Delete the brochure?",
                    confirmLabel: "Delete",
                    danger: true,
                    onConfirm: () =>
                      request("brochure", `brochure/delete/${id}`, { method: "DELETE", successMessage: "Brochure deleted" }),
                  })
                }
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          )}
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50">
            <span className="truncate">{brochure ? brochure.name : p.brochureFile ? "Replace brochure" : "Choose file"}</span>
            <FaUpload className="shrink-0 text-gray-400" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(f.type)) {
                  notify("error", "Only JPG, PNG, WEBP or PDF files are allowed");
                  return;
                }
                setBrochure(f);
              }}
            />
          </label>
          <Btn onClick={saveBrochure} disabled={!brochure || busyAction === "brochure"} className="w-full">
            {busyAction === "brochure" ? "Saving..." : "Save Brochure"}
          </Btn>
        </div>
      </Card>

      <VideosCard p={p} id={id} URI={URI} request={request} busyAction={busyAction} notify={notify} />
    </div>
  );
}

function VideosCard({ p, id, URI, request, busyAction, notify }) {
  const initial = {
    propertyVideo: p.propertyVideo || "",
    videoLink: p.videoLink || "",
    instagramReelLink: p.instagramReelLink || "",
  };
  const [form, setForm] = useState(initial);
  const [progress, setProgress] = useState(null); // null | 0-100
  const uploading = progress !== null;

  const youtubeId = form.videoLink.match(YOUTUBE_REGEX)?.[1];
  const reelCode = form.instagramReelLink.match(INSTAGRAM_REEL_REGEX)?.[1];
  const youtubeError = form.videoLink.trim() && !youtubeId ? "Enter a valid YouTube link (watch, shorts or youtu.be)" : "";
  const instagramError = form.instagramReelLink.trim() && !reelCode ? "Enter a valid Instagram reel link" : "";
  const dirty = Object.keys(initial).some((k) => form[k].trim() !== initial[k]);

  const pickVideo = async (file) => {
    if (!VIDEO_TYPES.includes(file.type)) {
      notify("error", "Upload an MP4, MOV or WEBM video");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      notify("error", "Video must be 200 MB or smaller");
      return;
    }
    setProgress(0);
    try {
      const url = await uploadFileToS3(URI, file, { folder: "uploads/videos", onProgress: setProgress });
      setForm((f) => ({ ...f, propertyVideo: url }));
      notify("success", "Video uploaded. Click Save Videos to publish it.");
    } catch (err) {
      notify("error", err.message);
    } finally {
      setProgress(null);
    }
  };

  const save = () =>
    request("videos", `media/${id}`, {
      json: {
        propertyVideo: form.propertyVideo.trim(),
        videoLink: form.videoLink.trim(),
        instagramReelLink: form.instagramReelLink.trim(),
      },
      successMessage: "Videos saved",
    });

  return (
    <Card
      title="Videos & Reels"
      subtitle="A walkthrough video, YouTube video and Instagram reel for the property page."
      className="lg:col-span-3"
      action={
        <Btn onClick={save} disabled={!dirty || uploading || !!youtubeError || !!instagramError || busyAction === "videos"}>
          {busyAction === "videos" ? "Saving..." : "Save Videos"}
        </Btn>
      }
    >
      <div className="grid gap-5 md:grid-cols-3">
        {/* Uploaded video */}
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FaVideo className="text-[#076300]" /> Property Video
          </p>
          <div className="aspect-video overflow-hidden rounded-xl bg-gray-100">
            {form.propertyVideo ? (
              <video key={form.propertyVideo} src={getImageURI(form.propertyVideo)} controls preload="metadata" className="h-full w-full bg-black object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">No video uploaded</div>
            )}
          </div>
          {uploading ? (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-[#076300] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-500">Uploading... {progress}%</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <FaUpload className="text-gray-400" />
                {form.propertyVideo ? "Replace video" : "Upload video"}
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) pickVideo(f);
                  }}
                />
              </label>
              {form.propertyVideo && (
                <Btn variant="danger" onClick={() => setForm((f) => ({ ...f, propertyVideo: "" }))}>
                  Remove
                </Btn>
              )}
            </div>
          )}
          <p className="text-[11px] text-gray-400">MP4, MOV or WEBM · up to 200 MB</p>
        </div>

        {/* YouTube */}
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FaYoutube className="text-red-600" /> YouTube Video
          </p>
          <div className="aspect-video overflow-hidden rounded-xl bg-gray-100">
            {youtubeId ? (
              <a href={form.videoLink} target="_blank" rel="noreferrer" className="relative block h-full">
                <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt="YouTube preview" className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <FaYoutube className="text-5xl text-red-600 drop-shadow" />
                </span>
              </a>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">No YouTube video</div>
            )}
          </div>
          <input
            type="url"
            value={form.videoLink}
            onChange={(e) => setForm((f) => ({ ...f, videoLink: e.target.value }))}
            placeholder="https://youtu.be/..."
            className={`${inputCls} ${youtubeError ? "!border-red-400" : ""}`}
          />
          {youtubeError && <p className="text-xs text-red-600">{youtubeError}</p>}
        </div>

        {/* Instagram */}
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FaInstagram className="text-pink-600" /> Instagram Reel
          </p>
          <div className="aspect-video overflow-hidden rounded-xl bg-gray-100">
            {reelCode ? (
              <iframe
                title="Instagram reel preview"
                src={`https://www.instagram.com/reel/${reelCode}/embed`}
                className="h-full w-full"
                loading="lazy"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">No Instagram reel</div>
            )}
          </div>
          <input
            type="url"
            value={form.instagramReelLink}
            onChange={(e) => setForm((f) => ({ ...f, instagramReelLink: e.target.value }))}
            placeholder="https://www.instagram.com/reel/..."
            className={`${inputCls} ${instagramError ? "!border-red-400" : ""}`}
          />
          {instagramError && <p className="text-xs text-red-600">{instagramError}</p>}
        </div>
      </div>
      {dirty && !uploading && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          You have unsaved video changes. Click Save Videos to publish them.
        </p>
      )}
    </Card>
  );
}

function CharCount({ value, max }) {
  const len = String(value || "").length;
  return <span className={`text-[11px] ${len > max ? "text-red-600" : "text-gray-400"}`}>{len}/{max}</span>;
}

function SeoTab({ p, id, request, busyAction }) {
  const [form, setForm] = useState({
    seoSlug: p.seoSlug || "",
    pageTitle: p.pageTitle || "",
    seoTittle: p.seoTittle || "",
    seoDescription: p.seoDescription || "",
    propertyDescription: p.propertyDescription || "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const missing = ["seoSlug", "pageTitle", "seoTittle", "seoDescription", "propertyDescription"].filter(
    (k) => !form[k].trim(),
  );

  const save = (e) => {
    e.preventDefault();
    request("seo", `seo/${id}`, {
      json: { ...form, seoSlug: form.seoSlug.trim().toLowerCase().replace(/\s+/g, "-") },
      successMessage: "SEO details saved",
    });
  };

  return (
    <Card
      title="SEO Details"
      subtitle="Controls the property's web address and how it appears on Google."
      action={missing.length ? <Badge tone="amber">{missing.length} field{missing.length > 1 ? "s" : ""} missing</Badge> : <Badge tone="green">Complete</Badge>}
    >
      <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelCls}>URL slug *</label>
          <div className="flex rounded-lg border border-gray-300 focus-within:border-[#076300] focus-within:ring-2 focus-within:ring-[#076300]/20">
            <span className="hidden items-center border-r border-gray-200 bg-gray-50 px-3 text-xs text-gray-500 sm:flex">/property-info/</span>
            <input required value={form.seoSlug} onChange={set("seoSlug")} className="w-full rounded-r-lg px-3 py-2.5 text-sm outline-none" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Page title *</label>
          <input required value={form.pageTitle} onChange={set("pageTitle")} className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-between">
            <label className={labelCls}>SEO title * (shown on Google)</label>
            <CharCount value={form.seoTittle} max={60} />
          </div>
          <input required value={form.seoTittle} onChange={set("seoTittle")} className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-between">
            <label className={labelCls}>SEO description *</label>
            <CharCount value={form.seoDescription} max={160} />
          </div>
          <textarea required rows={3} value={form.seoDescription} onChange={set("seoDescription")} className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Property description * (shown on the property page)</label>
          <textarea required rows={6} value={form.propertyDescription} onChange={set("propertyDescription")} className={inputCls} />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Btn type="submit" disabled={busyAction === "seo"}>
            {busyAction === "seo" ? "Saving..." : "Save SEO Details"}
          </Btn>
        </div>
      </form>
    </Card>
  );
}

function CommissionTab({ p, id, request, busyAction }) {
  const [form, setForm] = useState({
    commissionType: p.commissionType || "",
    commissionAmount: p.commissionAmount || "",
    commissionPercentage: p.commissionPercentage || "",
    commissionAmountPerSquareFeet: p.commissionAmountPerSquareFeet || "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const fieldFor = {
    Fixed: ["commissionAmount", "Commission amount (₹)"],
    Percentage: ["commissionPercentage", "Commission percentage (%)"],
    PerSquareFeet: ["commissionAmountPerSquareFeet", "Commission per sq.ft (₹)"],
  }[form.commissionType];

  const amount = Number(form.commissionAmount) || 0;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title="Commission" subtitle="What Reparv earns when this property is sold." className="lg:col-span-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            request("commission", `commission/${id}`, { json: form, successMessage: "Commission saved" });
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <div>
            <label className={labelCls}>Commission type *</label>
            <select required value={form.commissionType} onChange={set("commissionType")} className={inputCls}>
              <option value="" disabled>
                Select type
              </option>
              <option value="Fixed">Fixed amount</option>
              <option value="Percentage">Percentage</option>
              <option value="PerSquareFeet">Per square foot</option>
            </select>
          </div>
          {fieldFor && (
            <div>
              <label className={labelCls}>{fieldFor[1]} *</label>
              <input type="number" min="0" step="any" required value={form[fieldFor[0]]} onChange={set(fieldFor[0])} className={inputCls} />
            </div>
          )}
          <div className="md:col-span-2 flex justify-end">
            <Btn type="submit" disabled={busyAction === "commission"}>
              {busyAction === "commission" ? "Saving..." : "Save Commission"}
            </Btn>
          </div>
        </form>
      </Card>

      {form.commissionType === "Fixed" && amount > 0 && (
        <Card title="Commission Split">
          <dl className="space-y-2 text-sm">
            {[
              ["Reparv Commission (40%)", 0.4],
              ["Sales Commission (40%)", 0.4],
              ["Territory Commission (20%)", 0.2],
            ].map(([label, share]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-semibold">₹{Math.round(amount * share).toLocaleString("en-IN")}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}

function LocationTab({ p, id, request, busyAction }) {
  const [lat, setLat] = useState(p.latitude ?? "");
  const [lng, setLng] = useState(p.longitude ?? "");
  const valid =
    lat !== "" && lng !== "" && Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;

  // Accept a pasted Google Maps link or "lat, lng"
  const pasteCoords = (text) => {
    const m = String(text).match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/) || String(text).match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (m) {
      setLat(m[1]);
      setLng(m[2]);
      return true;
    }
    return false;
  };

  return (
    <Card title="Map Location" subtitle="Used for Map View and 'near me' search on the website.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelCls}>Paste a Google Maps link or coordinates</label>
          <input
            placeholder="e.g. https://maps.google.com/...@21.1458,79.0882 or 21.1458, 79.0882"
            onPaste={(e) => {
              if (pasteCoords(e.clipboardData.getData("text"))) e.preventDefault();
            }}
            onChange={(e) => pasteCoords(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Latitude</label>
          <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Longitude</label>
          <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} className={inputCls} />
        </div>
        {valid && (
          <div className="md:col-span-2 overflow-hidden rounded-xl border border-gray-200">
            <iframe
              title="Property location"
              src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
              className="h-[300px] w-full"
              loading="lazy"
            />
          </div>
        )}
        <div className="md:col-span-2 flex flex-wrap justify-between gap-3">
          {valid ? (
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#076300] hover:underline"
            >
              <FaExternalLinkAlt size={12} /> Open in Google Maps
            </a>
          ) : (
            <span className="text-sm text-gray-500">No valid location set.</span>
          )}
          <Btn
            disabled={!valid || busyAction === "location"}
            onClick={() =>
              request("location", `location/edit/${id}`, {
                json: { latitude: Number(lat), longitude: Number(lng) },
                successMessage: "Location saved",
              })
            }
          >
            {busyAction === "location" ? "Saving..." : "Save Location"}
          </Btn>
        </div>
      </div>
    </Card>
  );
}

function PromotionTab({ p, id, request, busyAction, confirmToggle, notify }) {
  const [topPicksStatus, setTopPicksStatus] = useState(p.topPicksStatus === "Active" ? "Active" : "Inactive");
  const [banner, setBanner] = useState(null);

  const saveTopPicks = () => {
    const form = new FormData();
    form.append("topPicksStatus", topPicksStatus);
    if (banner) form.append("topPicksBanner", banner);
    request("topPicks", `set/top-picks/${id}`, { body: form, successMessage: "Top Picks saved" }).then((ok) => ok && setBanner(null));
  };

  const bannerPreview = banner ? URL.createObjectURL(banner) : p.topPicksBanner ? getImageURI(p.topPicksBanner) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Badges" subtitle="Highlight the property across the website.">
        <div className="space-y-3">
          <Toggle
            icon={<FaFire className="text-red-500" />}
            label="Hot Deal"
            description="Shows a fire badge and boosts it in listings."
            checked={p.hotDeal === "Active"}
            disabled={!!busyAction}
            onChange={() =>
              confirmToggle({
                key: "hotdeal",
                path: `set/hotdeal/${id}`,
                title: p.hotDeal === "Active" ? "Remove Hot Deal?" : "Mark as Hot Deal?",
                confirmLabel: p.hotDeal === "Active" ? "Remove" : "Mark Hot Deal",
              })
            }
          />
          <Toggle
            icon={<FaShieldAlt className="text-[#076300]" />}
            label="Reparv Assured"
            description="Verified by the Reparv team."
            checked={p.reparvAssured === "Active"}
            disabled={!!busyAction}
            onChange={() =>
              confirmToggle({
                key: "assured",
                path: `reparv-assured/${id}`,
                title: p.reparvAssured === "Active" ? "Remove Reparv Assured?" : "Mark as Reparv Assured?",
                confirmLabel: p.reparvAssured === "Active" ? "Remove" : "Mark Assured",
              })
            }
          />
        </div>
      </Card>

      <Card title="Top Picks" subtitle="Featured in the home page New Launch showcase.">
        <div className="space-y-4">
          <div className="flex gap-2">
            {["Active", "Inactive"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTopPicksStatus(s)}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold ${
                  topPicksStatus === s
                    ? s === "Active"
                      ? "border-[#076300] bg-[#EAFBF1] text-[#076300]"
                      : "border-gray-400 bg-gray-100 text-gray-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {s === "Active" ? "Featured" : "Not featured"}
              </button>
            ))}
          </div>
          <div>
            <label className={labelCls}>Banner image (max 2 MB)</label>
            {bannerPreview && (
              <img src={bannerPreview} alt="Top picks banner" className="mb-2 aspect-[16/7] w-full rounded-lg border border-gray-200 object-cover" />
            )}
            <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50">
              <span className="truncate">{banner ? banner.name : p.topPicksBanner ? "Replace banner" : "Choose image"}</span>
              <FaUpload className="shrink-0 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  if (f.size > 2 * 1024 * 1024) {
                    notify("error", "Banner must be 2 MB or smaller");
                    return;
                  }
                  setBanner(f);
                }}
              />
            </label>
          </div>
          <Btn onClick={saveTopPicks} disabled={busyAction === "topPicks"} className="w-full">
            {busyAction === "topPicks" ? "Saving..." : "Save Top Picks"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function AssignmentTab({ p, id, URI, request, busyAction, setDialog }) {
  const [partners, setPartners] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${URI}/admin/projectpartner/active`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPartners(Array.isArray(data) ? data.filter((pp) => pp.status === "Active") : []))
      .catch(() => setPartners([]));
  }, [URI]);

  const options = partners.map((pp) => ({
    value: { projectPartnerId: pp.id, projectPartner: pp.fullname, projectPartnerContact: pp.contact },
    label: `${pp.fullname} · ${pp.contact}${pp.city ? ` · ${pp.city}` : ""}`,
  }));
  const current = partners.find((pp) => pp.id === p.projectpartnerid);

  return (
    <Card title="Project Partner" subtitle="The partner who handles enquiries and site visits for this property.">
      <div className="space-y-4">
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500">Currently assigned</p>
          <p className="text-sm font-semibold text-gray-900">
            {current ? `${current.fullname} · ${current.contact}` : p.lister_type === "Project Partner" ? p.lister_name : "Not assigned"}
          </p>
        </div>
        <div>
          <label className={labelCls}>Assign to</label>
          <Select options={options} value={selected} onChange={setSelected} placeholder="Search project partner..." isClearable />
        </div>
        <div className="flex justify-end">
          <Btn
            disabled={!selected || busyAction === "assign"}
            onClick={() =>
              setDialog({
                title: `Assign to ${selected.value.projectPartner}?`,
                message: "The property will move to this project partner.",
                confirmLabel: "Assign",
                onConfirm: async () => {
                  const ok = await request("assign", `assign/to/project-partner/${id}`, {
                    json: selected.value,
                    successMessage: "Project partner changed",
                  });
                  if (ok) setSelected(null);
                },
              })
            }
          >
            Assign Project Partner
          </Btn>
        </div>
      </div>
    </Card>
  );
}

function AdditionalInfoTab({ p, id, request, busyAction, navigate, notify }) {
  const [file, setFile] = useState(null);
  const isPlot = PLOT_INFO_CATEGORIES.includes(p.propertyCategory);

  const upload = async () => {
    if (!file) {
      notify("error", "Choose a CSV file first");
      return;
    }
    const form = new FormData();
    form.append("propertyid", id);
    form.append("csv", file);
    const ok = await request("csv", `additionalinfo/${isPlot ? "plot" : "flat"}/csv/add/${id}`, {
      method: "POST",
      body: form,
      successMessage: "Additional info uploaded",
    });
    if (ok) setFile(null);
  };

  return (
    <Card
      title={isPlot ? "Plot Inventory" : "Flat Inventory"}
      subtitle={`Upload every ${isPlot ? "plot" : "flat"} with its size and price as a CSV file.`}
      action={
        <Btn variant="secondary" onClick={() => navigate(`/property/additional-info/${id}`)}>
          View uploaded info
        </Btn>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900">1. Download the format</p>
          <p className="mb-3 text-xs text-gray-500">Fill one row per {isPlot ? "plot" : "flat"}. Keep the column names unchanged.</p>
          <div className="[&_.addButton]:rounded-lg">
            <DownloadCSV
              data={isPlot ? PLOT_CSV_FORMAT : FLAT_CSV_FORMAT}
              filename={isPlot ? "Plot_Additional_Info_File_Format.csv" : "Additional_Info_File_Format.csv"}
            />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900">2. Upload the filled CSV</p>
          <label className="mt-3 flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50">
            <span className="truncate">{file ? file.name : "Choose CSV file"}</span>
            <FaUpload className="shrink-0 text-gray-400" />
            <input type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <Btn onClick={upload} disabled={!file || busyAction === "csv"} className="mt-3 w-full">
            {busyAction === "csv" ? "Uploading..." : "Upload CSV"}
          </Btn>
        </div>
      </div>
    </Card>
  );
}
