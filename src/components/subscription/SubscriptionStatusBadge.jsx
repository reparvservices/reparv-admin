const formatDateShort = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
};

export default function SubscriptionStatusBadge({ status, endDate, compact = false }) {
  const s = String(status || "").toLowerCase();
  const endsLater =
    endDate && new Date(endDate) >= new Date() && s === "cancelled";
  const map = {
    active: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
    pending: "bg-amber-50 text-amber-800 ring-amber-200/60",
    expired: "bg-gray-100 text-gray-600 ring-gray-200",
    cancelled: endsLater
      ? "bg-amber-50 text-amber-900 ring-amber-200/60"
      : "bg-red-50 text-red-800 ring-red-200/60",
    halted: "bg-orange-50 text-orange-800 ring-orange-200/60",
    trial: "bg-violet-50 text-violet-800 ring-violet-200/60",
  };
  const fullLabel = endsLater ? "Cancelled (until period end)" : status;
  const compactLabel = endsLater ? "Cancelled · until end" : status;
  const label = compact ? compactLabel : fullLabel;
  const title =
    endsLater && endDate
      ? `Cancelled — access until ${formatDateShort(endDate)}`
      : fullLabel;

  return (
    <span
      title={title}
      className={`inline-flex items-center justify-center shrink-0 rounded-full font-semibold capitalize ring-1 ${
        compact
          ? "max-w-[7.5rem] px-2 py-1 text-[10px] leading-tight text-center"
          : "whitespace-nowrap px-3 py-1 text-xs"
      } ${map[s] || "bg-gray-100 text-gray-600 ring-gray-200"}`}
    >
      {label || "—"}
    </span>
  );
}
