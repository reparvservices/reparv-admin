import { useMemo, useState } from "react";
import {
  FaHome, FaBuilding, FaGlassCheers, FaTree, FaHotel, FaSeedling, FaPlus,
  FaYoutube, FaInstagram, FaFacebook, FaGlobe, FaLinkedin, FaCheck,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { uploadToS3 } from "../../../utils/s3";

const GRADIENT = "linear-gradient(110.73deg, #076300 0%, #0a7d04 97.17%)";
const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#076300] focus:ring-2 focus:ring-green-50 bg-white";
const MAX_VIDEO_MB = 100;

/** What each venue type needs. Everything adapts from this table. */
const STAY_AMENITIES = ["Wi-Fi", "Parking", "Pool", "AC", "Kitchen", "Garden", "TV", "Power backup", "Housekeeping", "BBQ", "Pet friendly"];
const EVENT_AMENITIES = ["Stage", "Sound system", "AC", "Parking", "Power backup", "Catering", "Green room", "Projector", "Decor", "Valet parking", "Generator"];
const TYPES = {
  villa: { label: "Villa", Icon: FaHome, hint: "Private stays", pricing: "night", bedrooms: true, capacity: "Max guests", amenities: STAY_AMENITIES },
  farmhouse: { label: "Farmhouse", Icon: FaSeedling, hint: "Stays & get-togethers", pricing: "night", bedrooms: true, capacity: "Max guests", amenities: [...STAY_AMENITIES, "Lawn"] },
  resort: { label: "Resort", Icon: FaHotel, hint: "Rooms & leisure", pricing: "night", bedrooms: true, capacity: "Max guests", amenities: [...STAY_AMENITIES, "Restaurant", "Spa"] },
  hall: { label: "Hall", Icon: FaBuilding, hint: "Indoor events", pricing: "slot", bedrooms: false, capacity: "Seating capacity", amenities: EVENT_AMENITIES },
  banquet: { label: "Banquet", Icon: FaGlassCheers, hint: "Weddings & parties", pricing: "slot", bedrooms: false, capacity: "Seating capacity", amenities: EVENT_AMENITIES },
  lawn: { label: "Lawn", Icon: FaTree, hint: "Outdoor events", pricing: "slot", bedrooms: false, capacity: "Guest capacity", amenities: [...EVENT_AMENITIES, "Garden"] },
  other: { label: "Other", Icon: FaPlus, hint: "Something else", pricing: "night", bedrooms: true, capacity: "Max guests", amenities: [...new Set([...STAY_AMENITIES, ...EVENT_AMENITIES])] },
};
const STEPS = ["Type", "Details", "Pricing", "Media", "Amenities"];
const SOCIALS = [
  { key: "youtube", label: "YouTube", Icon: FaYoutube, ph: "https://youtube.com/watch?v=..." },
  { key: "instagram", label: "Instagram", Icon: FaInstagram, ph: "https://instagram.com/yourvenue" },
  { key: "facebook", label: "Facebook", Icon: FaFacebook, ph: "https://facebook.com/yourvenue" },
  { key: "x", label: "X (Twitter)", Icon: FaXTwitter, ph: "https://x.com/yourvenue" },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedin, ph: "https://linkedin.com/company/..." },
  { key: "website", label: "Website", Icon: FaGlobe, ph: "https://yourvenue.com" },
];
const HOSTS = { youtube: ["youtube.com", "youtu.be"], instagram: ["instagram.com"], facebook: ["facebook.com", "fb.com", "fb.watch"], x: ["x.com", "twitter.com"], linkedin: ["linkedin.com"], website: null };

const EMPTY = {
  type: "", custom_type: "", title: "", description: "", city: "", state: "", address: "",
  capacity: "", bedrooms: "", price_model: "night", base_price: "", weekend_price: "", cleaning_fee: "",
  deposit_percent: 100, cancellation_policy: "moderate", min_nights: 1, max_nights: 30,
  images: [], videos: [], social_links: {}, amenities: [], rules: "",
};

const parseList = (v, fb) => {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") return v;
  try { return JSON.parse(v || JSON.stringify(fb)); } catch { return fb; }
};

function formFromListing(l) {
  if (!l) return { ...EMPTY };
  return {
    ...EMPTY, ...l,
    custom_type: l.custom_type || "",
    weekend_price: l.weekend_price ?? "", bedrooms: l.bedrooms ?? "", cleaning_fee: l.cleaning_fee ?? "",
    description: l.description || "", state: l.state || "", address: l.address || "", rules: l.rules || "",
    images: parseList(l.images, []), videos: parseList(l.videos, []),
    social_links: parseList(l.social_links, {}), amenities: parseList(l.amenities, []),
  };
}

const validLink = (key, value) => {
  if (!value) return true;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const allowed = HOSTS[key];
    return !allowed || allowed.some((h) => host === h || host.endsWith("." + h));
  } catch { return false; }
};

function Field({ label, hint, error, children, required }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-800 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

/** embedded: rendered inside the property page, which supplies the page header */
export default function VenueForm({
  initial,
  editing,
  onCancel,
  onSave,
  setBusy,
  embedded = false,
  submitLabel = "Save & submit for approval",
}) {
  const [form, setForm] = useState(() => formFromListing(initial));
  const [step, setStep] = useState(editing ? 1 : 0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");

  const cfg = TYPES[form.type] || TYPES.other;
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const pickType = (t) => {
    setForm((f) => ({
      ...f, type: t,
      price_model: editing ? f.price_model : TYPES[t].pricing,
      bedrooms: TYPES[t].bedrooms ? f.bedrooms : "",
    }));
    setErrors({});
  };

  const amenityChoices = useMemo(
    () => [...new Set([...cfg.amenities, ...form.amenities])],
    [cfg, form.amenities],
  );

  const validate = (s) => {
    const e = {};
    const n = (v) => Number(v);
    if (s === 0) {
      if (!form.type) e.type = "Choose what kind of venue this is.";
      if (form.type === "other" && form.custom_type.trim().length < 2) e.custom_type = "Tell us the type of venue.";
    }
    if (s === 1) {
      if (!form.title.trim()) e.title = "Give your venue a name.";
      if (!form.city.trim()) e.city = "City is required.";
      if (!(n(form.capacity) >= 1)) e.capacity = `${cfg.capacity} is required.`;
    }
    if (s === 2) {
      if (!(n(form.base_price) >= 100)) e.base_price = "Enter a price of at least ₹100.";
      if (form.weekend_price !== "" && !(n(form.weekend_price) >= 100)) e.weekend_price = "Enter a valid weekend price.";
      if (!(n(form.deposit_percent) >= 10 && n(form.deposit_percent) <= 100)) e.deposit_percent = "Between 10 and 100.";
      if (form.price_model === "night" && n(form.min_nights) > n(form.max_nights)) e.min_nights = "Minimum cannot exceed maximum.";
    }
    if (s === 3) {
      SOCIALS.forEach(({ key, label }) => {
        if (!validLink(key, form.social_links[key])) e[`social_${key}`] = `Enter a valid https ${label} link.`;
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep((s) => Math.min(STEPS.length - 1, s + 1)); };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const goTo = (i) => { if (i <= step || [...Array(i).keys()].every((s) => validate(s))) setStep(i); };

  const upload = async (files, kind) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (kind === "video") {
      const tooBig = list.find((f) => f.size > MAX_VIDEO_MB * 1024 * 1024);
      if (tooBig) { alert(`"${tooBig.name}" is larger than ${MAX_VIDEO_MB} MB. Please compress it or share a YouTube link instead.`); return; }
      if (form.videos.length + list.length > 3) { alert("You can add up to 3 videos."); return; }
    }
    setUploading(kind);
    setBusy?.(true);
    const urls = [];
    for (const f of list) {
      const url = await uploadToS3(f);
      if (url) urls.push(url);
    }
    setBusy?.(false);
    setUploading("");
    if (urls.length < list.length) alert("Some files could not be uploaded. Please try again.");
    if (kind === "video") set("videos", [...form.videos, ...urls].slice(0, 3));
    else set("images", [...form.images, ...urls].slice(0, 20));
  };

  const toggleAmenity = (a) =>
    set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);

  const addCustomAmenity = () => {
    const a = customAmenity.trim().slice(0, 40);
    if (a && !form.amenities.includes(a)) set("amenities", [...form.amenities, a]);
    setCustomAmenity("");
  };

  const buildBody = () => {
    const num = (v) => (v === "" || v === null ? null : Number(v));
    const social = Object.fromEntries(Object.entries(form.social_links).filter(([, v]) => v && v.trim()));
    return {
      title: form.title, type: form.type, custom_type: form.type === "other" ? form.custom_type : null,
      price_model: form.price_model, base_price: num(form.base_price), weekend_price: num(form.weekend_price),
      cleaning_fee: Number(form.cleaning_fee || 0), capacity: num(form.capacity),
      bedrooms: cfg.bedrooms ? num(form.bedrooms) : null, city: form.city, state: form.state, address: form.address,
      description: form.description, rules: form.rules, deposit_percent: Number(form.deposit_percent || 100),
      cancellation_policy: form.cancellation_policy, amenities: form.amenities,
      images: form.images, videos: form.videos, social_links: social,
      ...(form.price_model === "night" ? { min_nights: Number(form.min_nights), max_nights: Number(form.max_nights) } : {}),
    };
  };

  const save = async (submit) => {
    for (let s = 0; s < STEPS.length; s++) {
      if (!validate(s)) { setStep(s); return; }
    }
    if (submit && form.images.length === 0) { setStep(3); setErrors({ images: "Add at least one photo to submit for approval." }); return; }
    setSaving(true);
    try { await onSave(buildBody(), submit); } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  const typeName = form.type === "other" ? form.custom_type || "Venue" : cfg.label;

  return (
    <div className={embedded ? "" : "p-4 md:p-6 max-w-3xl mx-auto"}>
      {!embedded && (
        <>
          <button className="text-sm text-gray-600 mb-3" onClick={onCancel}>← Back to my venues</button>
          <h1 className="text-xl font-semibold mb-1">{editing ? "Edit venue" : "List a venue"}</h1>
          <p className="text-sm text-gray-500 mb-4">Villas, halls, farmhouses and event spaces, booked directly by customers.</p>
        </>
      )}

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-hide">
        {STEPS.map((label, i) => (
          <button key={label} type="button" onClick={() => goTo(i)} className="flex items-center gap-2 shrink-0">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
              i < step ? "bg-green-500 text-white" : i === step ? "text-white" : "bg-gray-200 text-gray-600"}`}
              style={i === step ? { background: GRADIENT } : undefined}>
              {i < step ? <FaCheck size={10} /> : i + 1}
            </span>
            <span className={`text-sm ${i === step ? "font-bold text-gray-900" : "text-gray-500"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="w-6 h-px bg-gray-300 mx-1" />}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5">
        {/* 1. Type */}
        {step === 0 && (
          <>
            <h2 className="font-semibold">What are you listing?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(TYPES).map(([key, t]) => (
                <button key={key} type="button" onClick={() => pickType(key)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition ${
                    form.type === key ? "border-[#076300] bg-green-50" : "border-gray-200 hover:border-green-300"}`}>
                  <t.Icon className={form.type === key ? "text-[#076300]" : "text-gray-500"} size={22} />
                  <span className="text-sm font-bold">{t.label}</span>
                  <span className="text-[11px] text-gray-500 leading-tight">{t.hint}</span>
                </button>
              ))}
            </div>
            {errors.type && <p className="text-xs text-red-600">{errors.type}</p>}
            {form.type === "other" && (
              <Field label="What type of venue is it?" required error={errors.custom_type} hint="Shown to customers, e.g. Rooftop party space, Conference room, Studio.">
                <input autoFocus className={inputCls} maxLength={60} value={form.custom_type} onChange={(e) => set("custom_type", e.target.value)} placeholder="e.g. Rooftop party space" />
              </Field>
            )}
          </>
        )}

        {/* 2. Details */}
        {step === 1 && (
          <>
            <h2 className="font-semibold">Tell us about your {typeName.toLowerCase()}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Field label="Name" required error={errors.title}>
                <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={`e.g. Lakeview ${typeName}`} />
              </Field></div>
              <Field label={cfg.capacity} required error={errors.capacity}>
                <input type="number" min={1} className={inputCls} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
              </Field>
              {cfg.bedrooms && (
                <Field label="Bedrooms">
                  <input type="number" min={0} className={inputCls} value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
                </Field>
              )}
              <Field label="City" required error={errors.city}>
                <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="State"><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
              <div className="md:col-span-2"><Field label="Address / landmark">
                <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} />
              </Field></div>
              <div className="md:col-span-2"><Field label="Description" hint="What makes it special? Rooms, surroundings, events you host.">
                <textarea rows={4} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field></div>
            </div>
          </>
        )}

        {/* 3. Pricing */}
        {step === 2 && (
          <>
            <h2 className="font-semibold">Pricing &amp; booking rules</h2>
            <div>
              <span className="block text-sm font-semibold text-gray-800 mb-2">How do you charge?</span>
              <div className="grid grid-cols-2 gap-3">
                {[["night", "Per night", "Guests stay overnight"], ["slot", "Per day / slot", "Full day, morning or evening"]].map(([k, t, h]) => (
                  <button key={k} type="button" onClick={() => set("price_model", k)}
                    className={`rounded-xl border-2 p-3 text-left ${form.price_model === k ? "border-[#076300] bg-green-50" : "border-gray-200"}`}>
                    <span className="block text-sm font-bold">{t}</span><span className="text-[11px] text-gray-500">{h}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={`Base price (₹ per ${form.price_model === "night" ? "night" : "slot"})`} required error={errors.base_price}>
                <input type="number" min={0} className={inputCls} value={form.base_price} onChange={(e) => set("base_price", e.target.value)} />
              </Field>
              <Field label="Weekend price (₹, Fri/Sat)" error={errors.weekend_price} hint="Optional. Leave blank to use the base price.">
                <input type="number" min={0} className={inputCls} value={form.weekend_price} onChange={(e) => set("weekend_price", e.target.value)} />
              </Field>
              <Field label="Cleaning fee (₹)" hint="One-time fee added to each booking.">
                <input type="number" min={0} className={inputCls} value={form.cleaning_fee} onChange={(e) => set("cleaning_fee", e.target.value)} />
              </Field>
              <Field label="Customer pays now (% of total)" error={errors.deposit_percent} hint="100 = full payment at booking. Lower = deposit, balance paid to you directly.">
                <input type="number" min={10} max={100} className={inputCls} value={form.deposit_percent} onChange={(e) => set("deposit_percent", e.target.value)} />
              </Field>
              {form.price_model === "night" && (
                <>
                  <Field label="Minimum nights" error={errors.min_nights}><input type="number" min={1} className={inputCls} value={form.min_nights} onChange={(e) => set("min_nights", e.target.value)} /></Field>
                  <Field label="Maximum nights"><input type="number" min={1} className={inputCls} value={form.max_nights} onChange={(e) => set("max_nights", e.target.value)} /></Field>
                </>
              )}
              <div className="md:col-span-2"><Field label="Cancellation policy">
                <select className={inputCls} value={form.cancellation_policy} onChange={(e) => set("cancellation_policy", e.target.value)}>
                  <option value="flexible">Flexible: full refund until 2 days before</option>
                  <option value="moderate">Moderate: full refund until 7 days before</option>
                  <option value="strict">Strict: 50% refund until 14 days before</option>
                </select>
              </Field></div>
            </div>
          </>
        )}

        {/* 4. Media */}
        {step === 3 && (
          <>
            <h2 className="font-semibold">Photos, videos &amp; links</h2>
            <div>
              <span className="block text-sm font-semibold mb-2">Photos <span className="text-gray-400 font-normal">(at least 1 to submit)</span></span>
              <div className="flex flex-wrap gap-3">
                {form.images.map((u, i) => (
                  <div key={u} className="relative">
                    <img src={u} alt="" className="h-24 w-32 object-cover rounded-lg border" />
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 rounded">Cover</span>}
                    <button type="button" onClick={() => set("images", form.images.filter((x) => x !== u))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
                  </div>
                ))}
                <label className="h-24 w-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-sm text-gray-500 cursor-pointer hover:border-green-400">
                  {uploading === "image" ? "Uploading…" : "+ Add photos"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { upload(e.target.files, "image"); e.target.value = ""; }} />
                </label>
              </div>
              {errors.images && <p className="text-xs text-red-600 mt-1">{errors.images}</p>}
            </div>

            <div>
              <span className="block text-sm font-semibold mb-2">Videos <span className="text-gray-400 font-normal">(optional, up to 3, max {MAX_VIDEO_MB} MB each)</span></span>
              <div className="flex flex-wrap gap-3">
                {form.videos.map((u) => (
                  <div key={u} className="relative">
                    <video src={u} className="h-24 w-40 rounded-lg border bg-black object-cover" muted />
                    <button type="button" onClick={() => set("videos", form.videos.filter((x) => x !== u))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
                  </div>
                ))}
                {form.videos.length < 3 && (
                  <label className="h-24 w-40 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-sm text-gray-500 cursor-pointer hover:border-green-400">
                    {uploading === "video" ? "Uploading… please wait" : "+ Upload video"}
                    <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => { upload(e.target.files, "video"); e.target.value = ""; }} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold mb-2">Social media &amp; website <span className="text-gray-400 font-normal">(optional)</span></span>
              <div className="grid gap-3 md:grid-cols-2">
                {SOCIALS.map(({ key, label, Icon, ph }) => (
                  <div key={key}>
                    <div className={`flex items-center gap-2 border rounded-xl px-3 bg-white ${errors[`social_${key}`] ? "border-red-400" : "border-gray-200"}`}>
                      <Icon className="text-gray-500 shrink-0" />
                      <input className="w-full py-2.5 text-sm outline-none bg-transparent" placeholder={ph} aria-label={label}
                        value={form.social_links[key] || ""} onChange={(e) => set("social_links", { ...form.social_links, [key]: e.target.value })} />
                    </div>
                    {errors[`social_${key}`] && <p className="text-xs text-red-600 mt-1">{errors[`social_${key}`]}</p>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 5. Amenities + review */}
        {step === 4 && (
          <>
            <h2 className="font-semibold">Amenities &amp; house rules</h2>
            <div className="flex flex-wrap gap-2">
              {amenityChoices.map((a) => {
                const on = form.amenities.includes(a);
                return (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1 rounded-full text-sm border ${on ? "bg-[#076300] text-white border-[#076300]" : "bg-white"}`}>{a}</button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Add another amenity" value={customAmenity} maxLength={40}
                onChange={(e) => setCustomAmenity(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }} />
              <button type="button" onClick={addCustomAmenity} className="px-4 rounded-xl border text-sm font-semibold">Add</button>
            </div>
            <Field label="House rules" hint="Check-in times, noise limits, pets, decorations...">
              <textarea rows={3} className={inputCls} value={form.rules} onChange={(e) => set("rules", e.target.value)} />
            </Field>

            <div className="rounded-xl bg-green-50/60 border border-green-100 p-4 text-sm space-y-1">
              <p className="font-bold mb-1">Review</p>
              <p><b>{form.title || "—"}</b> · {typeName} · {form.city || "—"}</p>
              <p>{form.capacity || "—"} guests · ₹{Number(form.base_price || 0).toLocaleString("en-IN")} / {form.price_model === "night" ? "night" : "slot"}
                {form.weekend_price ? ` (weekend ₹${Number(form.weekend_price).toLocaleString("en-IN")})` : ""}</p>
              <p>{form.images.length} photo(s) · {form.videos.length} video(s) · {Object.values(form.social_links).filter(Boolean).length} link(s) · {form.amenities.length} amenities</p>
              <p className="text-gray-500">Customers pay {form.deposit_percent}% at booking. Cancellation: {form.cancellation_policy}.</p>
            </div>
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <button type="button" onClick={step === 0 ? onCancel : back} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">
          {step === 0 ? "Cancel" : "Back"}
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} style={{ background: GRADIENT }} className="px-7 py-2.5 rounded-xl text-white text-sm font-semibold">Next</button>
        ) : (
          <div className="flex gap-3">
            <button type="button" disabled={saving || !!uploading} onClick={() => save(false)} className="px-5 py-2.5 rounded-xl border text-sm font-semibold disabled:opacity-60">
              {saving ? "Saving…" : "Save as draft"}
            </button>
            <button type="button" disabled={saving || !!uploading} onClick={() => save(true)} style={{ background: GRADIENT }} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60">
              {saving ? "Saving…" : submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
