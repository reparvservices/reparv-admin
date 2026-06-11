import React, { useState, useRef, useCallback } from "react";
import { SectionHeader } from "./FormUI";

const MAX_PER_SECTION = 3;
const MAX_SIZE_MB = 5;
const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/* ── Section definitions ── */
const ALL_SECTIONS = [
  { key: "frontView", label: "Front View", required: true },
  { key: "sideView", label: "Side View", required: false },
  { key: "hallView", label: "Hall", required: false },
  { key: "kitchenView", label: "Kitchen", required: false },
  { key: "bedroomView", label: "Bedroom", required: false },
  { key: "bathroomView", label: "Bathroom", required: false },
  { key: "balconyView", label: "Balcony", required: false },
  { key: "nearestLandmark", label: "Nearest Landmark", required: true },
  { key: "developedAmenities", label: "Amenities", required: true },
];

/* Hide some sections based on category */
const hiddenFor = (key, category) => {
  const plotLike = ["CommercialPlot", "NewPlot", "FarmLand"];
  const noKitchenBed = [...plotLike, "IndustrialSpace", "RentalShop"];
  if (
    plotLike.includes(category) &&
    ["sideView", "hallView", "balconyView"].includes(key)
  )
    return true;
  if (
    noKitchenBed.includes(category) &&
    ["kitchenView", "bedroomView", "bathroomView"].includes(key)
  )
    return true;
  return false;
};

/* ── Single image card ── */
function ImageCard({ file, index, onRemove, onReplace }) {
  const url = file instanceof File ? URL.createObjectURL(file) : file;
  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
      <img src={url} alt="" className="w-full h-full object-cover" />
      {/* overlay on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <label className="cursor-pointer w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition">
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
          </svg>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onReplace(e, index)}
          />
        </label>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition"
        >
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {index === 0 && (
        <span className="absolute bottom-1.5 left-1.5 bg-[#076300] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          Cover
        </span>
      )}
    </div>
  );
}

/* ── Upload drop zone ── */
function DropZone({ sectionKey, onFiles, count, max }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        VALID_TYPES.includes(f.type),
      );
      onFiles(sectionKey, files);
    },
    [sectionKey, onFiles],
  );

  if (count >= max) return null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`col-span-1 aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
        dragging
          ? "border-[#076300] bg-[#076300]/5 scale-[0.98]"
          : "border-gray-200 bg-gray-50 hover:border-[#076300] hover:bg-[#076300]/5"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors ${dragging ? "bg-[#076300]/20" : "bg-gray-100"}`}
      >
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke={dragging ? "#076300" : "#9ca3af"}
          strokeWidth="2"
        >
          <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
      </div>
      <span
        className={`text-xs font-medium ${dragging ? "text-[#076300]" : "text-gray-400"}`}
      >
        {dragging ? "Drop here" : "Add photo"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => onFiles(sectionKey, Array.from(e.target.files))}
      />
    </div>
  );
}

/* ── Section overview card (grid at bottom) ── */
function SectionCard({ section, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 flex flex-col items-center gap-1.5 transition-all ${
        active
          ? "border-[#076300] bg-[#076300]/5 shadow-sm"
          : count > 0
            ? "border-gray-200 bg-white"
            : "border-dashed border-gray-200 bg-gray-50"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${count > 0 ? "bg-[#076300]/10" : "bg-gray-100"}`}
      >
        {count > 0 ? (
          <span className="text-sm font-bold text-[#076300]">+{count}</span>
        ) : (
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#9ca3af"
            strokeWidth="1.5"
          >
            <path d="M3 16l4-4 4 4 4-6 4 4M3 19h18M3 5h18v14H3V5z" />
          </svg>
        )}
      </div>
      <span
        className={`text-[11px] font-medium text-center leading-tight ${active ? "text-[#076300]" : count > 0 ? "text-gray-700" : "text-gray-400"}`}
      >
        {section.label}
        {section.required ? " *" : ""}
      </span>
      <span
        className={`text-[10px] ${count > 0 ? "text-[#076300]" : "text-gray-300"}`}
      >
        {count}/{MAX_PER_SECTION}
      </span>
    </button>
  );
}

export default function StepThree({ newProperty, imageFiles, setImageFiles }) {
  const [activeSection, setActiveSection] = useState("frontView");

  const visibleSections = ALL_SECTIONS.filter(
    (s) => !hiddenFor(s.key, newProperty?.propertyCategory),
  );

  const totalCount = visibleSections.reduce(
    (acc, s) => acc + (imageFiles[s.key]?.length || 0),
    0,
  );
  const activeObj =
    visibleSections.find((s) => s.key === activeSection) || visibleSections[0];
  const activeFiles = imageFiles[activeSection] || [];

  /* Validate & add files */
  const addFiles = useCallback(
    (sectionKey, rawFiles) => {
      const existing = imageFiles[sectionKey] || [];
      const slots = MAX_PER_SECTION - existing.length;
      if (slots <= 0) {
        alert(`Max ${MAX_PER_SECTION} photos per section.`);
        return;
      }

      const valid = [];
      for (const f of rawFiles) {
        if (!VALID_TYPES.includes(f.type)) {
          alert(`${f.name}: only JPG, PNG, WEBP allowed`);
          continue;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
          alert(`${f.name}: max ${MAX_SIZE_MB}MB`);
          continue;
        }
        valid.push(f);
      }
      const toAdd = valid.slice(0, slots);
      if (valid.length > slots)
        alert(`Only ${slots} slot(s) left. First ${slots} added.`);
      setImageFiles((prev) => ({
        ...prev,
        [sectionKey]: [...existing, ...toAdd],
      }));
    },
    [imageFiles, setImageFiles],
  );

  const removeFile = (index) => {
    setImageFiles((prev) => {
      const updated = [...(prev[activeSection] || [])];
      updated.splice(index, 1);
      return { ...prev, [activeSection]: updated };
    });
  };

  const replaceFile = (e, index) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!VALID_TYPES.includes(f.type)) {
      alert("Only JPG, PNG, WEBP allowed");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Max ${MAX_SIZE_MB}MB`);
      return;
    }
    setImageFiles((prev) => {
      const updated = [...(prev[activeSection] || [])];
      updated[index] = f;
      return { ...prev, [activeSection]: updated };
    });
    e.target.value = "";
  };

  return (
    <div>
      <SectionHeader
        title="Media Gallery"
        subtitle="Add property photos for each section"
      />

      {/* Total count badge */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-900">{totalCount}</span> photo
          {totalCount !== 1 ? "s" : ""} added across all sections
        </p>
        <span className="text-xs text-gray-400">
          Max {MAX_PER_SECTION} per section · JPG / PNG / WEBP · {MAX_SIZE_MB}MB
        </span>
      </div>

      {/* ── Section tabs (horizontal scroll) ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {visibleSections.map((s) => {
          const cnt = imageFiles[s.key]?.length || 0;
          const active = activeSection === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveSection(s.key)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                active
                  ? "bg-[#076300] text-white border-[#076300]"
                  : cnt > 0
                    ? "bg-[#076300]/8 text-[#076300] border-[#076300]/30"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#076300]"
              }`}
            >
              {s.label}
              {s.required ? " *" : ""}
              {cnt > 0 && (
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${active ? "bg-white/25 text-white" : "bg-[#076300]/15 text-[#076300]"}`}
                >
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active section upload area ── */}
      <div className="border border-gray-200 rounded-2xl bg-gray-50/50 p-4 sm:p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              {activeObj?.label}
              {activeObj?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeFiles.length} of {MAX_PER_SECTION} photos
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#076300] rounded-full transition-all"
              style={{
                width: `${(activeFiles.length / MAX_PER_SECTION) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Grid of existing images + drop zone */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
          {activeFiles.map((file, i) => (
            <ImageCard
              key={i}
              file={file}
              index={i}
              onRemove={removeFile}
              onReplace={replaceFile}
            />
          ))}
          <DropZone
            sectionKey={activeSection}
            onFiles={addFiles}
            count={activeFiles.length}
            max={MAX_PER_SECTION}
          />
        </div>

        {/* Add more button */}
        {activeFiles.length < MAX_PER_SECTION && (
          <label className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-[#076300]/40 text-[#076300] text-sm font-medium cursor-pointer hover:bg-[#076300]/5 transition-colors">
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add More Photos
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) =>
                addFiles(activeSection, Array.from(e.target.files))
              }
            />
          </label>
        )}
      </div>

      {/* ── All Sections overview grid ── */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">All Sections</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
          {visibleSections.map((s) => (
            <SectionCard
              key={s.key}
              section={s}
              count={imageFiles[s.key]?.length || 0}
              active={activeSection === s.key}
              onClick={() => setActiveSection(s.key)}
            />
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
        <p className="text-xs font-semibold text-amber-700 mb-1">
          📸 Photo Tips
        </p>
        <ul className="text-xs text-amber-600 space-y-0.5 list-disc list-inside">
          <li>Use natural light and shoot from corners for wider coverage</li>
          <li>First photo in each section becomes the cover photo</li>
          <li>Drag to rearrange — best photo first</li>
          <li>Accepted: JPG, PNG, WEBP · Max 5MB each</li>
        </ul>
      </div>
    </div>
  );
}
