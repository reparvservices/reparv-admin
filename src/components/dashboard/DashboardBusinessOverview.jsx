import { buildBusinessMetrics, formatINR } from "../../lib/dashboardFormat";

export default function DashboardBusinessOverview({ counts }) {
  const m = buildBusinessMetrics(counts);
  const isLoss = m.netProfitLoss < 0;

  const tiles = [
    { label: "Total revenue", value: formatINR(m.totalRevenue), tone: "bg-violet-50 text-violet-700" },
    {
      label: "Net profit / loss",
      value: `${isLoss ? "−" : ""}${formatINR(Math.abs(m.netProfitLoss))}`,
      tone: isLoss ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700",
    },
    { label: "Total deals", value: m.totalDeals.toLocaleString("en-IN"), tone: "bg-blue-50 text-blue-700" },
    { label: "Total expenses", value: formatINR(m.totalExpenses), tone: "bg-red-50/80 text-red-600" },
    { label: "Marketing spend", value: formatINR(m.marketingSpend), tone: "bg-pink-50 text-pink-700" },
    { label: "Sales commission", value: formatINR(m.salesCommission), tone: "bg-amber-50 text-amber-700" },
    { label: "Territory commission", value: formatINR(m.territoryCommission), tone: "bg-orange-50 text-orange-700" },
    { label: "Reparv commission", value: formatINR(m.reparvCommission), tone: "bg-green-50 text-[#076300]" },
    { label: "TDS deducted", value: formatINR(m.tds), tone: "bg-gray-50 text-gray-700" },
    {
      label: "Deal area (sq.ft)",
      value: m.sqFt.toLocaleString("en-IN"),
      tone: "bg-slate-50 text-slate-700",
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Business overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Token-stage deals — commission waterfall and profitability
          </p>
        </div>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            isLoss ? "bg-red-100 text-red-600" : "bg-green-100 text-[#076300]"
          }`}
        >
          ROI: {m.roi.toFixed(2)}%
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className={`rounded-xl border border-gray-100 p-3.5 ${tile.tone}`}>
            <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{tile.label}</p>
            <p className="text-base font-bold mt-1 break-words">{tile.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
