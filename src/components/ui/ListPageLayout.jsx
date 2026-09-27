import { CiSearch } from "react-icons/ci";
import { FiRefreshCw } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

/**
 * Shared list page shell matching the Project Partner page:
 * green header with title, actions and stat tiles, then search, toolbar and the list.
 */
export default function ListPageLayout({
  eyebrow,
  title,
  subtitle,
  icon,
  onRefresh,
  refreshing = false,
  actions,
  stats = [],
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  toolbar,
  listTitle,
  listMeta,
  children,
}) {
  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 pb-10">
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="relative px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex gap-3 sm:gap-4 min-w-0">
              {icon ? (
                <div className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20 shrink-0">
                  {icon}
                </div>
              ) : null}
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-white/80 text-xs sm:text-sm font-medium">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
              {onRefresh ? (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/25"
                >
                  <FiRefreshCw
                    className={refreshing ? "animate-spin" : ""}
                    size={16}
                  />
                  Refresh
                </button>
              ) : null}
              {actions ? (
                <div className="flex flex-col sm:flex-row gap-2 [&_.addButton]:bg-white [&_.addButton]:text-[#076300] [&_.addButton]:border-white/30 [&_.addButton]:rounded-xl [&_.addButton]:py-2.5">
                  {actions}
                </div>
              ) : null}
            </div>
          </div>
          {stats.length > 0 ? (
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8 ${
                // Full class names so Tailwind generates them
                { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" }[stats.length] || "lg:grid-cols-6"
              }`}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <p className="text-[10px] sm:text-xs text-white/75 uppercase tracking-wide truncate">
                    {s.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tabular-nums mt-0.5">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4">
          <div className="space-y-3">
            {onSearchChange ? (
              <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[#076300]/25 focus-within:border-[#076300]/40">
                <CiSearch className="text-gray-400 shrink-0" size={20} aria-hidden />
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="w-full min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  aria-label={searchPlaceholder}
                />
                {searchValue ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/80"
                    aria-label="Clear search"
                  >
                    <RxCross2 size={16} />
                  </button>
                ) : null}
              </div>
            ) : null}
            {toolbar ? (
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                {toolbar}
              </div>
            ) : null}
          </div>

          {listTitle || listMeta ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-gray-900">{listTitle}</h2>
              {listMeta ? (
                <p className="text-xs text-gray-500 tabular-nums">{listMeta}</p>
              ) : null}
            </div>
          ) : null}

          <div className="relative rounded-xl border border-gray-100 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
