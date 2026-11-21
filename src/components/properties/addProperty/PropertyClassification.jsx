import {
  LISTING_TYPES,
  PROPERTY_KINDS,
  SALE_CONDITIONS,
  VENUE_KIND,
  categoriesFor,
  categoryLabel,
} from "../../../utils/propertyListing";

const pillCls = (active) =>
  `px-5 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
    active
      ? "bg-green-600 text-white border-green-600 shadow-sm"
      : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
  }`;

/**
 * PropertyClassification
 * Sell / Buy / Rent → (New Launch / Resale) → Residential / Commercial / Agriculture → category
 *
 * Props:
 *   listingType      : "Sell" | "Buy" | "Rent"
 *   condition        : "new" | "resale"  (Sell / Buy only)
 *   propertyKind     : "Residential" | "Commercial" | "Agriculture"
 *   propertyCategory : selected category value (e.g. "NewFlat")
 *   onChange         : fn({ listingType, condition, propertyKind, propertyCategory })
 *   bare             : render without the card wrapper / title
 */
export default function PropertyClassification({
  listingType,
  condition,
  propertyKind,
  propertyCategory,
  onChange,
  bare = false,
  allowVenue = true,
}) {
  const current = { listingType, condition, propertyKind, propertyCategory };
  const isVenue = propertyKind === VENUE_KIND;
  const kinds = PROPERTY_KINDS.filter((k) => allowVenue || k.key !== VENUE_KIND);

  // Changing an upper level clears the category if it no longer fits
  const update = (patch) => {
    const next = { ...current, ...patch };
    if (!("propertyCategory" in patch)) {
      const stillValid = categoriesFor(next).some(
        (c) => c.value === next.propertyCategory,
      );
      if (!stillValid) next.propertyCategory = "";
    }
    onChange(next);
  };

  const types = categoriesFor(current);
  // Keep an older/unlisted stored category visible in edit mode
  const showStored =
    propertyCategory && !types.some((c) => c.value === propertyCategory);

  const body = (
    <div className="space-y-5">
      {/* Sell / Buy / Rent (not for venues: they are booked, not sold or rented) */}
      {!isVenue && (
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">
          I want to <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {LISTING_TYPES.map(({ key, label, hint }) => {
            const active = listingType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ listingType: key })}
                className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  active
                    ? "bg-green-600 text-white border-green-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-green-400"
                }`}
              >
                <span className="block text-sm font-semibold">{label}</span>
                <span
                  className={`block text-[11px] leading-tight mt-0.5 ${
                    active ? "text-green-100" : "text-gray-400"
                  }`}
                >
                  {hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* New Launch / Resale (Sell & Buy) */}
      {!isVenue && listingType !== "Rent" && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">
            {listingType === "Buy" ? "Looking for" : "Property is"}
          </p>
          <div className="flex flex-wrap gap-2">
            {SALE_CONDITIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => update({ condition: key })}
                className={pillCls(condition === key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Residential / Commercial / Agriculture */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">
          Property Type <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {kinds.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => update({ propertyKind: key })}
              className={pillCls(propertyKind === key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isVenue && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
          <p className="font-semibold">Venue Booking</p>
          <p className="text-xs mt-0.5 text-green-700">
            Villas, farmhouses, resorts, halls, banquets and lawns that customers book directly, priced
            per night or per slot. You&apos;ll fill in the venue details next.
          </p>
        </div>
      )}

      {/* Category grid — 2 cols on mobile, 4 cols on sm+ */}
      {!isVenue && (
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">
          Category <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {showStored && (
            <button
              type="button"
              className="border rounded-xl p-4 flex flex-col items-center gap-2 bg-green-600 text-white border-green-600 shadow-sm"
            >
              <span className="text-xs text-center leading-tight">
                {categoryLabel(propertyCategory)} (current)
              </span>
            </button>
          )}
          {types.map(({ label, value, icon: Icon }) => {
            const active = propertyCategory === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => update({ propertyCategory: value })}
                className={`border rounded-xl p-4 flex flex-col items-center gap-2 transition-all cursor-pointer
                  ${active
                    ? "bg-green-600 text-white border-green-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-green-50 hover:border-green-300"
                  }`}
              >
                <Icon size={18} />
                <span className="text-xs text-center leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );

  if (bare) return body;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Property Classification</h3>
      {body}
    </div>
  );
}
