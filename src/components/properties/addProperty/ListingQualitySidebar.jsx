import { FiCheckCircle, FiCircle, FiInfo } from "react-icons/fi";

const ALL_CHECKS = [
  { key: "basic",    label: "Basic Details" },
  { key: "location", label: "Location Info" },
  { key: "price",    label: "Price & Payment" },
  { key: "floor",    label: "Upload Floor Plan" },
  { key: "amenities",label: "Add Amenities" },
];

/**
 * ListingQualitySidebar
 * New design: right sidebar with quality % + checklist + green info tip
 * Props:
 *   form       : object  — used to derive which checks are done
 *   imageFiles : object
 */
export default function ListingQualitySidebar({ form = {}, imageFiles = {} }) {
  // Derive done state from real form values
  const checks = {
    basic:     !!form.propertyName && !!(form.carpetArea || form.plotArea || form.landArea),
    location:  !!form.state && !!form.city && !!form.address,
    price:     !!form.totalSalesPrice && !!form.totalOfferPrice,
    floor:     (imageFiles.frontView?.length || 0) >= 1,
    amenities: false,
  };

  const doneCount = Object.values(checks).filter(Boolean).length;
  const score     = Math.round((doneCount / ALL_CHECKS.length) * 100);

  return (
    <aside className="space-y-4">

      {/* Quality card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Listing Quality</h3>
          <span className="text-green-600 font-bold text-sm">{score}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-green-600 transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Checklist */}
        {ALL_CHECKS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            {checks[key]
              ? <FiCheckCircle className="text-green-600 flex-shrink-0" size={15} />
              : <FiCircle className="text-gray-300 flex-shrink-0" size={15} />
            }
            <span className={checks[key] ? "text-gray-700 font-medium" : "text-gray-400"}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Info tip */}
      <div className="bg-green-50 rounded-2xl border border-green-100 p-4 text-sm flex gap-2">
        <FiInfo className="text-green-600 mt-0.5 flex-shrink-0" size={15} />
        <span className="text-green-800 leading-relaxed">
          Listings with <strong>high-quality images & videos</strong> get{" "}
          <strong>40% more enquiries</strong>.
        </span>
      </div>
    </aside>
  );
}