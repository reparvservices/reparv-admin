import { FiRefreshCw } from "react-icons/fi";

export default function DashboardHeader({
  lastUpdated,
  loading,
  onRefresh,
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

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#076300] via-[#0a7a02] to-[#054d00] text-white p-5 md:p-6 shadow-lg shadow-[#076300]/20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Reparv Admin
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">Dashboard</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">
            Platform overview — deals, partners, subscriptions, and engagement at a glance.
          </p>
          <p className="text-xs text-white/60 mt-2">Last updated: {updatedLabel}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start md:self-center px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-sm font-semibold transition disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
}
