import { useEffect, useState } from "react";
import { PiBuildingsFill } from "react-icons/pi";
import PropertyClassification from "./PropertyClassification";
import BasicInfoForm from "./BasicInfoForm";
import LocationForm from "./LocationForm";
import MediaGallery from "./MediaGallery";
import ListingExtras from "./ListingExtras";
import VideoLinksForm from "./VideoLinksForm";
import { categoryLabel, areaModeFor } from "../../../utils/propertyListing";

const SECTIONS = [
  { id: "edit-type", label: "Type" },
  { id: "edit-details", label: "Details" },
  { id: "edit-location", label: "Location & contact" },
  { id: "edit-media", label: "Photos & videos" },
];

const STATUS_STYLE = {
  Approved: "bg-white/20 text-white",
  "Not Approved": "bg-amber-400/90 text-amber-950",
  Rejected: "bg-red-500/90 text-white",
};

/**
 * Edit screen: one scrollable page with a section nav and a sticky save bar,
 * instead of the step-by-step wizard used for adding.
 */
export default function PropertyEditView({
  form,
  setForm,
  condition,
  setCondition,
  errors,
  states,
  cities,
  imageFiles,
  onAddImages,
  onRemoveImage,
  onChange,
  onValidate,
  propertyTab,
  missing,
  canSave,
  onSave,
  onCancel,
  approve,
  existingImages,
  removedImages,
  onToggleSavedImage,
}) {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [changingType, setChangingType] = useState(false);

  // Highlight the section nearest the top while scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const goTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const kind = form.propertyKind || "Residential";

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6F8]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex h-11 w-11 rounded-xl bg-white/15 items-center justify-center border border-white/20 shrink-0">
            <PiBuildingsFill size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Edit property</p>
            <h2 className="text-xl sm:text-2xl font-bold truncate">{form.propertyName || "Untitled property"}</h2>
          </div>
          {approve && (
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[approve] || "bg-white/20 text-white"}`}>
              {approve === "Not Approved" ? "Pending approval" : approve}
            </span>
          )}
        </div>
      </div>

      {/* Section nav */}
      <div className="sticky top-0 z-30 bg-[#F4F6F8]/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex gap-1.5 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(s.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition cursor-pointer ${
                activeSection === s.id
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-green-600"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <form onSubmit={onSave} className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Type */}
        <section id="edit-type" className="scroll-mt-20">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">Property type</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[form.listingType === "Rent" ? "For Rent" : "For Sale", kind, categoryLabel(form.propertyCategory)]
                    .filter(Boolean)
                    .map((chip) => (
                      <span key={chip} className="rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {chip}
                      </span>
                    ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChangingType((v) => !v)}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:border-green-400 hover:text-green-700 cursor-pointer"
              >
                {changingType ? "Done" : "Change type"}
              </button>
            </div>

            {changingType && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="mb-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-800">
                  Changing the type changes which fields and photo sections apply. Check the details below afterwards.
                </p>
                <PropertyClassification
                  allowVenue={false}
                  listingType={form.listingType}
                  condition={condition}
                  propertyKind={form.propertyKind}
                  propertyCategory={form.propertyCategory}
                  onChange={({ listingType, condition: nextCondition, propertyKind, propertyCategory }) => {
                    setCondition(nextCondition);
                    setForm((p) => ({ ...p, listingType, propertyKind, propertyCategory }));
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Details */}
        <section id="edit-details" className="scroll-mt-20">
          <BasicInfoForm
            form={form}
            errors={errors}
            propertyTab={propertyTab}
            listingType={form.listingType}
            onChange={onChange}
            onValidate={onValidate}
            required={false}
          />
        </section>

        {/* Location & contact */}
        <section id="edit-location" className="scroll-mt-20">
          <LocationForm
            form={form}
            errors={errors}
            states={states}
            cities={cities}
            onChange={onChange}
            onValidate={onValidate}
            required={false}
          />
        </section>

        {/* More details: description, charges, specifications, features, benefits */}
        <section id="edit-more" className="scroll-mt-20 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <ListingExtras form={form} onChange={onChange} builtUp={areaModeFor(form) === "built"} />
        </section>

        {/* Photos & videos */}
        <section id="edit-media" className="scroll-mt-20 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900">Photos &amp; videos</h3>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">
              Saved photos are kept. New photos are added to them, and the × on a saved photo removes it when you save.
            </p>
            <MediaGallery
              bare
              existing={existingImages}
              removed={removedImages}
              onToggleSaved={onToggleSavedImage}
              category={form.propertyCategory}
              imageFiles={imageFiles}
              onAdd={onAddImages}
              onRemove={onRemoveImage}
            />
          </div>
          <VideoLinksForm form={form} errors={errors} onChange={onChange} onValidate={onValidate} />
        </section>

        {/* Save bar */}
        <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3 min-w-0">
              {missing.length > 0 && (
                <p className="hidden sm:block truncate text-xs font-medium text-amber-700">
                  Still needed: {missing.join(", ")}
                </p>
              )}
              <button
                type="submit"
                disabled={!canSave}
                className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  canSave
                    ? "text-white bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-sm shadow-green-200 cursor-pointer"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
          {missing.length > 0 && (
            <p className="sm:hidden mt-2 text-xs font-medium text-amber-700">Still needed: {missing.join(", ")}</p>
          )}
        </div>
      </form>
    </div>
  );
}
