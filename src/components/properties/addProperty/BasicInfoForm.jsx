import {
  areaModeFor,
  basicDetailFieldsFor,
  LAND_UNITS,
  BHK_OPTIONS,
  showBhkFor,
} from "../../../utils/propertyListing";

const Req = () => <span className="text-red-500">*</span>;

function Group({ title, hint, children }) {
  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

/**
 * required: false drops the red asterisks (editing an older listing, where only
 * the name is mandatory).
 */
export default function BasicInfoForm({
  form,
  errors,
  propertyTab,
  listingType,
  onChange,
  onValidate,
  required = true,
}) {
  const isBuy = listingType === "Buy";
  // Fields follow the property type: Residential / Commercial / Agriculture-Land
  const areaMode = areaModeFor(form);
  const detailFields = basicDetailFieldsFor(form);
  const star = required ? <Req /> : null;

  const inputCls = (err) =>
    `mt-1 w-full h-10 rounded-xl border px-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400
     ${err
       ? "border-red-400 focus:ring-2 focus:ring-red-100"
       : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"
     }`;

  const numberInput = (field, label, placeholder, isRequired = false) => (
    <div>
      <label className="text-xs text-gray-500 font-medium">
        {label} {isRequired && star}
      </label>
      <input
        type="number"
        min="0"
        value={form[field] || ""}
        onChange={e => onChange(field, e.target.value)}
        placeholder={placeholder}
        className={inputCls(false)}
      />
    </div>
  );

  const priceInput = (field, label, hint, isRequired = true) => (
    <div>
      <label className="text-xs text-gray-500 font-medium">
        {label} {isRequired && star}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium mt-0.5">₹</span>
        <input
          type="number"
          min="0"
          value={form[field]}
          onChange={e => onChange(field, e.target.value)}
          placeholder="00"
          className="mt-1 w-full h-10 rounded-xl border border-gray-200 pl-7 pr-3 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-400"
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">Property Details</h3>
          <p className="text-xs text-gray-400 mt-0.5">Name, size, features and price</p>
        </div>
        <span className="shrink-0 text-[11px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
          {areaMode === "land" ? "Agriculture / Land" : form.propertyKind || "Residential"}
        </span>
      </div>

      {/* Basics */}
      <Group title="Basics">
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-500 font-medium">
            {areaMode === "land" ? "Land / Farm Name" : "Property Name / Project"} <Req />
          </label>
          <input
            type="text"
            value={form.propertyName}
            onChange={e => {
              const v = e.target.value.replace(/[^A-Za-z0-9\s.,'&()-]/g, "");
              onChange("propertyName", v);
              onValidate("propertyName", v);
            }}
            placeholder={areaMode === "land" ? "e.g. Green Acres Farm" : "e.g. Green Valley Heights"}
            className={inputCls(errors.propertyName)}
          />
          {errors.propertyName
            ? <p className="text-xs text-red-500 mt-1">{errors.propertyName}</p>
            : <p className="text-xs text-gray-400 mt-1">Must be unique</p>
          }
        </div>

        {showBhkFor(form.propertyCategory) && (
          <div>
            <label className="text-xs text-gray-500 font-medium">
              BHK Configuration {star}
            </label>
            <select
              value={form.propertyType}
              onChange={e => onChange("propertyType", e.target.value)}
              className={inputCls(false)}
            >
              <option value="">Select BHK</option>
              {[...BHK_OPTIONS, ...(form.propertyType && !BHK_OPTIONS.includes(form.propertyType) ? [form.propertyType] : [])].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        )}
      </Group>

      {/* Size — depends on the property type */}
      <Group title={areaMode === "land" ? "Land area" : areaMode === "plot" ? "Plot area" : "Size"}>
        {areaMode === "built" && (
          <>
            {numberInput("builtUpArea", "Built Up Area (sq ft)", "e.g. 1,450")}
            {numberInput("carpetArea", "Carpet Area (sq ft)", "e.g. 1,100", true)}
          </>
        )}
        {areaMode === "plot" && numberInput("plotArea", "Plot Area (sq ft)", "e.g. 1,200", true)}
        {areaMode === "land" && (
          <div>
            <label className="text-xs text-gray-500 font-medium">
              Land Area {star}
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={form.landArea || ""}
                onChange={e => onChange("landArea", e.target.value)}
                placeholder="e.g. 2.5"
                className={`${inputCls(false)} mt-0 min-w-0 flex-1`}
              />
              <select
                value={form.landUnit || "Acre"}
                onChange={e => onChange("landUnit", e.target.value)}
                className="h-10 rounded-xl border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                {LAND_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        )}
      </Group>

      {/* Type-specific details */}
      {detailFields.length > 0 && (
        <Group title="Features" hint="Optional, but helps buyers decide">
          {detailFields.map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 font-medium">{f.label}</label>
              {f.type === "select" ? (
                <select
                  value={form[f.key] || ""}
                  onChange={e => onChange(f.key, e.target.value)}
                  className={inputCls(false)}
                >
                  <option value="">Select</option>
                  {/* an older listing may hold a value that is not in the standard list: keep it visible */}
                  {[...f.options, ...(form[f.key] && !f.options.includes(form[f.key]) ? [form[f.key]] : [])].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={form[f.key] || ""}
                  onChange={e => onChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={inputCls(false)}
                />
              )}
            </div>
          ))}
        </Group>
      )}

      {/* Pricing */}
      <Group title="Pricing">
        {priceInput(
          "totalSalesPrice",
          isBuy ? "Maximum Budget (₹)" : propertyTab === "rent" ? "Monthly Rent (₹)" : "Total Sales Price (₹)",
        )}
        {priceInput(
          "totalOfferPrice",
          isBuy ? "Preferred Budget (₹)" : "Offer Price (₹)",
          isBuy ? "Budget you'd ideally like to pay" : "Price you're willing to negotiate",
        )}
      </Group>
    </div>
  );
}
