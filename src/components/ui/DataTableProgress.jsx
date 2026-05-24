import Spinner from "./Spinner";

export default function DataTableProgress({ message = "Loading partners…", rows = 6 }) {
  return (
    <div className="py-10 px-4 flex flex-col items-center justify-center gap-4 min-h-[280px]">
      <Spinner size="md" />
      <p className="text-sm text-gray-500 font-medium">{message}</p>
      <div className="w-full max-w-5xl space-y-2.5 animate-pulse px-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-11 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100"
            style={{ opacity: 1 - i * 0.08 }}
          />
        ))}
      </div>
    </div>
  );
}
