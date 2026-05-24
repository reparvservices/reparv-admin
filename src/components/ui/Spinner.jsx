const SIZES = {
  sm: "w-5 h-5 border-2",
  md: "w-10 h-10 border-4",
  lg: "w-12 h-12 border-4",
};

export default function Spinner({ size = "md", className = "" }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${SIZES[size] || SIZES.md} border-gray-200 border-t-[#076300] rounded-full animate-spin ${className}`}
    />
  );
}
