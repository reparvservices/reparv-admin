/** Strip trailing slashes for safe URL joining */
const trimEndSlash = (s) => (typeof s === "string" ? s.replace(/\/+$/, "") : "");

/**
 * Build a public URL for a stored image/path.
 * - Absolute http(s) URLs are returned unchanged.
 * - Relative paths use VITE_S3_IMAGE_URL when set, otherwise VITE_ASSET_BASE_URL,
 *   otherwise the same host as the admin API (aws-api.reparv.in) so paths match backend uploads.
 */
export const getImageURI = (path) => {
  if (path == null) return "";
  if (typeof path !== "string") return "";

  const p = path.trim();
  if (!p || p === "undefined" || p === "null") return "";

  if (p.startsWith("http://") || p.startsWith("https://")) {
    return p;
  }

  const rel = p.replace(/^\/+/, "");
  const s3 = trimEndSlash(import.meta.env.VITE_S3_IMAGE_URL);
  const assetBase = trimEndSlash(
    import.meta.env.VITE_ASSET_BASE_URL || "https://aws-api.reparv.in",
  );

  const base = s3 || assetBase;
  if (!base) return "";

  return `${base}/${rel}`;
};
