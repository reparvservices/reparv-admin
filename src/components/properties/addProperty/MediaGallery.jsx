import { FiUploadCloud } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { imageSectionsFor, maxPhotosFor, ALL_IMAGE_SECTIONS } from "../../../utils/propertyListing";

/**
 * Photo sections follow the property type, same as the partner app.
 * Laid out as a grid of cards (one per section), each with its own tile grid.
 *
 * bare     : render only the grid, for a parent card that already has the heading.
 * existing : { sectionKey: [photoUrl, ...] }, the photos already saved (edit mode). New photos are added to
 *            them, and a saved photo can be marked for removal.
 * removed  : { sectionKey: [savedIndex, ...] }, saved photos marked for removal (applied when you save).
 * onToggleSaved(sectionKey, savedIndex) marks / unmarks a saved photo.
 */
export default function MediaGallery({ category, imageFiles, onAdd, onRemove, bare = false, existing = {}, removed = {}, onToggleSaved }) {
  // A plain function (not a nested component), so the grid isn't remounted on every render
  const wrap = (children) =>
    bare ? (
      <div>{children}</div>
    ) : (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5">
        <h3 className="font-semibold text-gray-900">Media Gallery</h3>
        {children}
      </div>
    );

  if (!category) {
    return wrap(<p className="text-sm text-gray-400">Select a property type to add photos.</p>);
  }

  // Photos saved under a section this category's cards don't list (older listings): never hide them
  const listed = new Set(imageSectionsFor(category).map((s) => s.key));
  const otherSaved = ALL_IMAGE_SECTIONS.filter((s) => !listed.has(s.key) && (existing?.[s.key] || []).length > 0);

  return wrap(
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {imageSectionsFor(category).map(({ key, label, required }) => {
        const files = imageFiles?.[key] || [];
        const saved = existing?.[key] || [];
        const gone = removed?.[key] || [];
        const kept = saved.length - gone.length; // saved photos that stay
        const max = maxPhotosFor(key);
        return (
          <div key={key} className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800">
                {label} {required && <span className="text-red-500">*</span>}
              </p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 ring-1 ring-inset ring-gray-200">
                {`${kept + files.length}/${max}`}
                {gone.length > 0 ? ` · ${gone.length} to remove` : ""}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Photos already saved for this section: each can be marked for removal */}
              {saved.map((src, i) => {
                const isGone = gone.includes(i);
                return (
                  <div
                    key={`saved-${i}`}
                    className={`relative aspect-square rounded-lg overflow-hidden border bg-white ${isGone ? "border-red-300" : "border-gray-200"}`}
                  >
                    <img loading="lazy" decoding="async" src={src} alt={`${label} saved ${i + 1}`} className={`w-full h-full object-cover ${isGone ? "opacity-30" : ""}`} />
                    <span className={`absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[9px] font-medium text-white ${isGone ? "bg-red-600" : "bg-black/60"}`}>
                      {isGone ? "Will be removed" : "Saved"}
                    </span>
                    {onToggleSaved && (
                      <button
                        type="button"
                        aria-label={isGone ? `Keep ${label} photo ${i + 1}` : `Remove saved ${label} photo ${i + 1}`}
                        title={isGone ? "Keep this photo" : "Remove this photo"}
                        onClick={() => onToggleSaved(key, i)}
                        className={`absolute top-1 right-1 h-5 min-w-5 rounded-full px-1 text-white grid place-items-center cursor-pointer ${isGone ? "bg-gray-700 text-[9px]" : "bg-red-500"}`}
                      >
                        {isGone ? "Undo" : <RxCross2 size={10} />}
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Photos added now */}
              {files.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-green-300 bg-white">
                  <img loading="lazy" decoding="async" src={URL.createObjectURL(file)} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 rounded bg-green-600 px-1.5 py-0.5 text-[9px] font-medium text-white">New</span>
                  <button
                    type="button"
                    aria-label={`Remove ${label} photo`}
                    onClick={() => onRemove(key, i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white grid place-items-center cursor-pointer"
                  >
                    <RxCross2 size={10} />
                  </button>
                </div>
              ))}

              {kept + files.length < max && (
                <label
                  onDrop={(e) => { e.preventDefault(); onAdd(key, Array.from(e.dataTransfer.files)); }}
                  onDragOver={(e) => e.preventDefault()}
                  className="aspect-square border-2 border-dashed border-gray-300 bg-white rounded-lg flex flex-col items-center justify-center gap-1 text-green-600 cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <FiUploadCloud size={20} />
                  <span className="text-[10px] font-medium text-gray-500">Add photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { onAdd(key, Array.from(e.target.files)); e.target.value = ""; }}
                  />
                </label>
              )}
            </div>

            {gone.length > 0 && (
              <p className="mt-2 text-[11px] text-red-600">
                {gone.length} saved photo{gone.length === 1 ? "" : "s"} will be removed when you save.
              </p>
            )}
          </div>
        );
      })}

      {/* Saved earlier under other sections: shown as they are, and kept when you save */}
      {otherSaved.map(({ key, label }) => (
        <div key={`other-${key}`} className="rounded-xl border border-dashed border-gray-300 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500 ring-1 ring-inset ring-gray-200">
              {existing[key].length} saved
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {existing[key].map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                <img loading="lazy" decoding="async" src={src} alt={`${label} saved ${i + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">Saved</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">Saved earlier. Kept as they are.</p>
        </div>
      ))}
    </div>,
  );
}
