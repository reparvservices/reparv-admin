import { FaYoutube, FaInstagram } from "react-icons/fa";

const inputCls =
  "w-full h-10 rounded-xl border border-gray-200 pl-10 pr-3 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-400";

// Keep in sync with reparv-server/src/core/utils/videoLinks.js
export const youtubeRegex =
  /^https?:\/\/(?:(?:www|m)\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)[\w-]{11}(?:[?&#/].*)?$/i;
export const instagramReelRegex =
  /^https?:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(?:reel|reels|p|tv)\/[\w-]+\/?(?:[?#].*)?$/i;

/**
 * VideoLinksForm
 * Optional YouTube video and Instagram reel links for the property.
 * Props:
 *   form       : object  — full form state (videoLink, instagramReelLink)
 *   errors     : object
 *   onChange   : fn(field, value)
 *   onValidate : fn(field, value)
 */
export default function VideoLinksForm({ form, errors, onChange, onValidate }) {
  const fields = [
    {
      name: "videoLink",
      label: "YouTube Video Link",
      placeholder: "https://www.youtube.com/watch?v=...",
      Icon: FaYoutube,
      iconCls: "text-red-600",
    },
    {
      name: "instagramReelLink",
      label: "Instagram Reel Link",
      placeholder: "https://www.instagram.com/reel/...",
      Icon: FaInstagram,
      iconCls: "text-pink-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">Property Videos</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Optional — add a YouTube video or Instagram reel of the property
        </p>
      </div>

      {fields.map(({ name, label, placeholder, Icon, iconCls }) => (
        <div key={name}>
          <label className="text-xs text-gray-500 font-medium">{label}</label>
          <div className="relative mt-1">
            <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconCls}`} size={16} />
            <input
              type="url"
              value={form[name] || ""}
              onChange={(e) => {
                onChange(name, e.target.value);
                onValidate(name, e.target.value.trim());
              }}
              placeholder={placeholder}
              className={`${inputCls} ${errors[name] ? "!border-red-400 focus:!ring-red-100" : ""}`}
            />
          </div>
          {errors[name] && (
            <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
