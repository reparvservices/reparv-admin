import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { formatCount, formatINR, formatPercent } from "../../lib/dashboardFormat";

function Panel({ title, subtitle, children, actionLabel, onAction }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {subtitle ? <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p> : null}
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#076300] hover:underline shrink-0"
          >
            {actionLabel}
            <FiArrowRight size={14} />
          </button>
        ) : null}
      </div>
      <div className="flex-1 space-y-3">{children}</div>
    </section>
  );
}

function StatRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold tabular-nums ${highlight ? "text-[#076300]" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

export default function DashboardInsightPanels({ funnel, properties, subscriptions }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Panel
        title="Lead funnel"
        subtitle="Enquiry to customer conversion"
        actionLabel="Enquirers"
        onAction={() => navigate("/enquirers")}
      >
        <StatRow label="Total leads" value={formatCount(funnel?.totalLeads)} />
        <StatRow label="Open enquiries" value={formatCount(funnel?.openEnquiries)} />
        <StatRow label="Token customers" value={formatCount(funnel?.tokenCustomers)} highlight />
        <div className="pt-2 border-t">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Conversion rate</span>
            <span className="font-semibold text-gray-800">{formatPercent(funnel?.conversionRate)}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#076300] transition-all"
              style={{ width: `${Math.min(100, funnel?.conversionRate || 0)}%` }}
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="Partner subscriptions"
        subtitle="Razorpay autopay — active plans"
        actionLabel="View all"
        onAction={() => navigate("/user-subscriptions")}
      >
        <StatRow label="Active" value={formatCount(subscriptions?.active)} highlight />
        <StatRow label="Pending" value={formatCount(subscriptions?.pending)} />
        <StatRow label="Expired / cancelled" value={formatCount((subscriptions?.expired || 0) + (subscriptions?.cancelled || 0))} />
        <StatRow label="Active plan value" value={formatINR(subscriptions?.activeRevenue, { compact: true })} />
        <div className="pt-2 border-t grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Project", value: subscriptions?.byRole?.project },
            { label: "Sales", value: subscriptions?.byRole?.sales },
            { label: "Territory", value: subscriptions?.byRole?.territory },
          ].map((r) => (
            <div key={r.label} className="rounded-lg bg-gray-50 py-2 px-1">
              <p className="text-[10px] text-gray-500 uppercase">{r.label}</p>
              <p className="text-sm font-bold text-gray-900">{formatCount(r.value)}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Property inventory"
        subtitle="Listings on platform"
        actionLabel="Properties"
        onAction={() => navigate("/properties")}
      >
        <StatRow label="Total listings" value={formatCount(properties?.total)} />
        <StatRow label="Live (approved)" value={formatCount(properties?.active)} highlight />
        <StatRow label="Pending approval" value={formatCount(properties?.pendingApproval)} />
        <p className="text-xs text-gray-500 pt-2 border-t leading-relaxed">
          Approved listings are visible to partners and on the public site. Pending items need admin review.
        </p>
      </Panel>
    </div>
  );
}
