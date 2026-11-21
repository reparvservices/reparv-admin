import { PiBuildingsFill } from "react-icons/pi";
import PropertyClassification from "./PropertyClassification";
import VenueForm from "./VenueForm";

/**
 * Venue Booking inside the property flow: the same page header as the other property types,
 * the Property Type chooser and the owning Project Partner (when adding), then the venue form.
 */
export default function VenueFormShell({
  editing,
  initial,
  classification,
  onClassificationChange,
  partners = [],
  ownerId,
  onOwnerChange,
  onSave,
  onCancel,
  setBusy,
}) {
  return (
    <div className="h-full overflow-y-auto bg-[#F4F6F8] pb-16">
      <div className="bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7 flex items-start gap-3 sm:gap-4">
          <div className="hidden sm:flex h-11 w-11 rounded-xl bg-white/15 items-center justify-center border border-white/20 shrink-0 mt-0.5">
            <PiBuildingsFill size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {editing ? "Update property" : "Add new property"}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold">Venue Booking</h2>
            <p className="text-white/70 text-sm mt-0.5">
              Villas, halls, farmhouses and event spaces, booked directly by customers
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {!editing && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-2">
            <h3 className="font-semibold text-gray-900">Project Partner</h3>
            <p className="text-xs text-gray-500">The partner who owns this venue and handles its bookings.</p>
            <select
              value={ownerId}
              onChange={(e) => onOwnerChange(e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="">Select project partner *</option>
              {partners.map((pp) => (
                <option key={pp.id} value={pp.id}>
                  {pp.fullname} · {pp.contact}
                  {pp.city ? ` · ${pp.city}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {!editing && classification && (
          <PropertyClassification {...classification} onChange={onClassificationChange} />
        )}

        <VenueForm
          embedded
          editing={editing}
          initial={initial}
          setBusy={setBusy}
          onCancel={onCancel}
          onSave={onSave}
          submitLabel={editing ? "Save changes" : "Save & publish"}
        />
      </div>
    </div>
  );
}
