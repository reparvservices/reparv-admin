import { FiTrendingUp, FiUsers, FiMessageSquare, FiCreditCard } from "react-icons/fi";
import { formatINR, formatCount, formatPercent } from "../../lib/dashboardFormat";

function KpiCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {sub ? <p className="text-xs text-gray-500 mt-1">{sub}</p> : null}
        </div>
        <span
          className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

export default function DashboardKpiStrip({ counts, funnel, subscriptions }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        label="Total deal value"
        value={formatINR(counts?.totalDealAmount, { compact: true })}
        sub="Token-stage deals"
        icon={FiTrendingUp}
        accent="bg-violet-50 text-violet-600"
      />
      <KpiCard
        label="Closed customers"
        value={formatCount(counts?.totalCustomer)}
        sub={`${formatPercent(funnel?.conversionRate)} conversion from ${formatCount(funnel?.totalLeads)} leads`}
        icon={FiUsers}
        accent="bg-emerald-50 text-emerald-600"
      />
      <KpiCard
        label="Open enquiries"
        value={formatCount(funnel?.openEnquiries)}
        sub="Not yet converted to token"
        icon={FiMessageSquare}
        accent="bg-amber-50 text-amber-600"
      />
      <KpiCard
        label="Paid subscriptions"
        value={formatCount(subscriptions?.active)}
        sub={`${formatCount(subscriptions?.trial)} on trial · ${formatINR(subscriptions?.revenueThisMonth, { compact: true })} collected this month`}
        icon={FiCreditCard}
        accent="bg-sky-50 text-sky-600"
      />
    </div>
  );
}
