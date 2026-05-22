import { FiRefreshCw } from "react-icons/fi";
import { formatRelativeUpdated } from "../../lib/dashboardFormat";

const REFRESH_SECONDS = 45;

export default function DashboardHeader({
  lastUpdated,
  loading,
  refreshing,
  onRefresh,
  autoRefresh,
}) {
  const updatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const relativeLabel = formatRelativeUpdated(lastUpdated);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#076300] via-[#0a7a02] to-[#054d00] text-white p-5 md:p-6 shadow-lg shadow-[#076300]/20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Reparv Admin
            </p>
            {autoRefresh && lastUpdated ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/15 border border-white/20">
                <span
                  className={`h-1.5 w-1.5 rounded-full bg-emerald-300 ${refreshing ? "animate-pulse" : ""}`}
                />
                Live · every {REFRESH_SECONDS}s
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">Dashboard</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">
            Real-time platform overview — deals, partners, subscriptions, and engagement.
          </p>
          <p className="text-xs text-white/60 mt-2">
            Last updated: {updatedLabel}
            {relativeLabel !== "—" ? ` (${relativeLabel})` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading && !lastUpdated}
          className="inline-flex items-center justify-center gap-2 self-start md:self-center px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
        >
          <FiRefreshCw className={refreshing || loading ? "animate-spin" : ""} size={16} />
          {refreshing ? "Updating…" : "Refresh"}
        </button>
      </div>
    </div>
  );
}
