import { FieldLabel, FieldInput, FieldTextarea, PillSelect, PillMultiSelect, Grid2, Grid3 } from "./FormUI";

/**
 * The optional listing details every panel has (admin, partner and website): description, charges and
 * tags, specifications, feature highlights and benefits. Same fields and options in all three.
 */
export const EXTRA_TEXT_KEYS = [
  "propertyDescription",
  "stampDuty", "registrationFee", "gst", "advocateFee", "msebWater", "maintenance", "other", "tags",
  "possessionDate", "builtYear", "loanAvailability", "reraRegistered",
  "sizeAreaFeature", "parkingFeature", "terraceFeature", "ageOfPropertyFeature", "propertyStatusFeature",
];
export const EXTRA_LIST_KEYS = [
  "locationFeature", "amenitiesFeature", "smartHomeFeature",
  "securityBenefit", "primeLocationBenefit", "rentalIncomeBenefit",
  "qualityBenefit", "capitalAppreciationBenefit", "ecofriendlyBenefit",
];
/** Defaults for the form state */
export const EXTRA_DEFAULTS = {
  ...Object.fromEntries(EXTRA_TEXT_KEYS.map((k) => [k, ""])),
  ...Object.fromEntries(EXTRA_LIST_KEYS.map((k) => [k, []])),
};

/** A stored list column (JSON text) → array */
export const parseListValue = (value) => {
  let v = value;
  for (let i = 0; i < 3 && typeof v === "string"; i++) {
    try {
      v = JSON.parse(v || "[]");
    } catch {
      return [];
    }
  }
  return Array.isArray(v) ? v.filter(Boolean) : [];
};

const CHARGES = [
  ["stampDuty", "Stamp Duty"], ["registrationFee", "Registration Fee"], ["gst", "GST"], ["advocateFee", "Advocate Fee"],
  ["msebWater", "MSEB / Water Charges"], ["maintenance", "Maintenance"], ["other", "Other Charges"],
];
const YES_NO = ["Yes", "No"];
const STATUS = ["Ready to Move", "Under Construction", "New Launch", "Resale"];
const HIGHLIGHTS = [
  ["locationFeature", "Location Features", ["Near School", "Near Hospital", "Near Market", "Near Railway Station", "Near Bus Stop", "Near Airport", "Near Mall", "Near Park"]],
  ["amenitiesFeature", "Amenities", ["Gym", "Swimming Pool", "Clubhouse", "Children's Play Area", "Garden", "Lift", "Power Backup", "Security", "Indoor Games", "Jogging Track", "Community Hall", "CCTV"]],
  ["smartHomeFeature", "Smart Home Features", ["Smart Locks", "Smart Lighting", "Video Door Phone", "Home Automation", "Smart Thermostat"]],
];
const BENEFITS = [
  ["securityBenefit", "Security", ["24x7 Security Guard", "CCTV Surveillance", "Gated Community", "Fire Safety"]],
  ["primeLocationBenefit", "Prime Location", ["Prime Location", "Well Connected", "Close to IT Hub", "Close to Highway"]],
  ["rentalIncomeBenefit", "Rental Income", ["High Rental Demand", "Good Rental Yield", "Furnished for Rent"]],
  ["qualityBenefit", "Quality", ["Premium Construction", "Branded Fittings", "Earthquake Resistant"]],
  ["capitalAppreciationBenefit", "Capital Appreciation", ["High Growth Area", "Upcoming Infrastructure", "Investment Hotspot"]],
  ["ecofriendlyBenefit", "Eco-Friendly", ["Solar Panels", "Rainwater Harvesting", "Green Building", "EV Charging"]],
];

function Group({ title, hint, children }) {
  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

/** form: the form state; onChange(field, value); builtUp: floors-style fields apply to built properties */
export default function ListingExtras({ form, onChange, builtUp = true }) {
  const text = (key, label, props = {}) => (
    <div key={key}>
      <FieldLabel>{label}</FieldLabel>
      <FieldInput value={form[key] ?? ""} onChange={(e) => onChange(key, e.target.value)} {...props} />
    </div>
  );
  const pills = (key, label, options) => (
    <div className="mt-4" key={key}>
      <FieldLabel>{label}</FieldLabel>
      <PillSelect options={options} value={form[key] ?? ""} onChange={(v) => onChange(key, v)} />
    </div>
  );
  const multi = (key, label, options) => (
    <div className="mb-4" key={key}>
      <FieldLabel>{label}</FieldLabel>
      <PillMultiSelect options={options} value={form[key] || []} onChange={(v) => onChange(key, v)} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-gray-900">More details</h3>
        <p className="text-xs text-gray-400 mt-0.5">Optional, but listings with more detail get more enquiries.</p>
      </div>

      <Group title="Description">
        <FieldTextarea
          rows={4}
          placeholder="Describe the property: what makes it special, nearby places, who it suits…"
          value={form.propertyDescription ?? ""}
          onChange={(e) => onChange("propertyDescription", e.target.value.slice(0, 3000))}
        />
        <p className="mt-1 text-right text-[11px] text-gray-400">{(form.propertyDescription || "").length}/3000</p>
      </Group>

      <Group title="Charges & tags">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHARGES.map(([key, label]) => text(key, label, { type: "number", placeholder: "₹ 00" }))}
          <div className="sm:col-span-2">
            {text("tags", "Tags (comma separated)", { placeholder: "e.g. spacious, well-lit, corner-plot" })}
          </div>
        </div>
      </Group>

      <Group title="Specifications">
        <Grid2>
          {text("possessionDate", "Possession Date", { type: "date" })}
          {builtUp && text("builtYear", "Built Year", { type: "number", placeholder: "e.g. 2015" })}
        </Grid2>
        <Grid2>
          {pills("reraRegistered", "RERA Registered", YES_NO)}
          {pills("loanAvailability", "Loan Availability", YES_NO)}
        </Grid2>
      </Group>

      <Group title="Feature highlights">
        {HIGHLIGHTS.map(([key, label, options]) => multi(key, label, options))}
        <Grid3>
          {text("sizeAreaFeature", "Size / Area Highlight", { placeholder: "e.g. Spacious 3BHK" })}
          {text("parkingFeature", "Parking Highlight", { placeholder: "e.g. Covered Parking" })}
          {text("terraceFeature", "Terrace Highlight", { placeholder: "e.g. Private Terrace" })}
        </Grid3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {text("ageOfPropertyFeature", "Age of Property", { placeholder: "e.g. 5 years old" })}
          <div>
            <FieldLabel>Property Status</FieldLabel>
            <PillSelect options={STATUS} value={form.propertyStatusFeature ?? ""} onChange={(v) => onChange("propertyStatusFeature", v)} />
          </div>
        </div>
      </Group>

      <Group title="Benefits & highlights">
        {BENEFITS.map(([key, label, options]) => multi(key, label, options))}
      </Group>
    </div>
  );
}
