export const getImageURI = (path) => {
  // Fast exit
  if (!path || typeof path !== "string") return "";

  // If already absolute URL → return as-is
  if (path.startsWith("http") || path.startsWith("https")) {
    return path;
  }

  const base = "https://api.reparv.in";

  // Ensure single slash between base and path
  return `${base}/${path.replace(/^\/+/, "")}`;
};
