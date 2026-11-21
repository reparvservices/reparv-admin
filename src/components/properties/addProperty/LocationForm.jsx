import { FaChevronDown } from "react-icons/fa";
import LocationPicker from "./LocationPicker";

const inputCls =
  "mt-1 w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-400";
const selectCls =
  "mt-1 w-full h-10 rounded-xl border border-gray-200 px-3 pr-8 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all appearance-none bg-white cursor-pointer";

const Req = () => <span className="text-red-500">*</span>;

function SectionTitle({ children, hint }) {
  return (
    <div className="mb-3">
      <h4 className="text-sm font-semibold text-gray-800">{children}</h4>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

/**
 * LocationForm
 * Props:
 *   form       : object  — full form state
 *   errors     : object
 *   states     : [{ state }]
 *   cities     : [{ city }]
 *   onChange   : fn(field, value)
 *   onValidate : fn(field, value)
 *   required   : false to drop the red asterisks (editing an older listing)
 */
export default function LocationForm({
  form,
  errors,
  states = [],
  cities = [],
  onChange,
  onValidate,
  required = true,
}) {
  const star = required ? <Req /> : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900">Location &amp; Contact</h3>
        <p className="text-xs text-gray-400 mt-0.5">Where the property is and who buyers should contact</p>
      </div>

      {/* Address */}
      <div>
        <SectionTitle>Address</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">State <Req /></label>
            <div className="relative">
              <select
                value={form.state}
                onChange={(e) => onChange("state", e.target.value)}
                className={selectCls}
              >
                <option value="">Select State</option>
                {states.map((s, i) => (
                  <option key={i} value={s.state}>{s.state}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 pointer-events-none text-gray-400 text-xs" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">City <Req /></label>
            <div className="relative">
              <select
                value={form.city}
                onChange={(e) => onChange("city", e.target.value)}
                disabled={!form.state}
                className={`${selectCls} ${!form.state ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="">Select City</option>
                {cities.map((c, i) => (
                  <option key={i} value={c.city}>{c.city}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 pointer-events-none text-gray-400 text-xs" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 font-medium">Address / Locality <Req /></label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="e.g. Wakad, Sector 4"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 font-medium">Locality / Area</label>
            <input
              type="text"
              value={form.location || ""}
              onChange={(e) => onChange("location", e.target.value.slice(0, 100))}
              placeholder="e.g. Dharampeth"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">Pin Code {star}</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.pincode || ""}
              onChange={(e) => onChange("pincode", e.target.value.replace(/\D/g, ""))}
              placeholder="Filled from the map, or enter it"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div>
        <SectionTitle hint="Click the map to drop or move the pin. Pin code is filled in for you.">
          Pin on map {star}
        </SectionTitle>
        <LocationPicker
          state={form.state}
          city={form.city}
          pincode={form.pincode}
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={({ latitude, longitude, pincode }) => {
            // Save the pin to the form; fill the pin code from the map only if it is still empty
            onChange("latitude", latitude);
            onChange("longitude", longitude);
            if (pincode && !form.pincode) onChange("pincode", String(pincode));
          }}
        />
      </div>

      {/* Contact */}
      <div className="pt-5 border-t border-gray-100">
        <SectionTitle hint="Shown to buyers who want to reach the owner">Contact</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">Owner name {star}</label>
            <input
              type="text"
              value={form.projectBy}
              onChange={(e) => {
                const v = e.target.value.replace(/[^A-Za-z\s]/g, "");
                onChange("projectBy", v);
                onValidate("projectBy", v);
              }}
              placeholder="e.g. Rajesh Kumar"
              className={`${inputCls} ${errors.projectBy ? "!border-red-400 focus:!ring-red-100" : ""}`}
            />
            {errors.projectBy && <p className="text-xs text-red-500 mt-1">{errors.projectBy}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">Phone {star}</label>
            <div className="flex mt-1">
              <span className="h-10 px-3 flex items-center border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 bg-gray-50 font-medium">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.contact}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  onChange("contact", v);
                  onValidate("contact", v);
                }}
                placeholder="9876543210"
                className={`min-w-0 flex-1 h-10 border px-3 text-sm outline-none rounded-r-xl transition-all placeholder:text-gray-400
                  ${errors.contact
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
              />
            </div>
            {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                onChange("email", e.target.value);
                onValidate("email", e.target.value);
              }}
              placeholder="owner@email.com (optional)"
              className={`${inputCls} ${errors.email ? "!border-red-400 focus:!ring-red-100" : ""}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
