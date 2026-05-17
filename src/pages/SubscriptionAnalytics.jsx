import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useAuth } from "../store/auth";
import {
  FiBarChart2,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiCreditCard,
  FiCalendar,
} from "react-icons/fi";

const ROLE_LABELS = {
  project: "Project Partner",
  sales: "Sales Partner",
  territory: "Territory Partner",
};

const formatInr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  const map = {
    active: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
    trial: "bg-violet-50 text-violet-800 ring-violet-200/60",
    pending: "bg-amber-50 text-amber-800 ring-amber-200/60",
    expired: "bg-gray-100 text-gray-600 ring-gray-200",
    cancelled: "bg-red-50 text-red-800 ring-red-200/60",
    halted: "bg-orange-50 text-orange-800 ring-orange-200/60",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ring-1 ${
        map[s] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "—"}
    </span>
  );
}

function KpiCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{value}</p>
          {sub ? <p className="text-xs text-gray-500 mt-1">{sub}</p> : null}
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

function MonthBarChart({ monthly, selectedMonth, onSelectMonth, maxSubs }) {
  const max = maxSubs || 1;
  return (
    <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end min-h-[140px] pt-4">
      {monthly.map((m) => {
        const active = selectedMonth === m.month;
        const h = Math.max(4, Math.round((m.subscriptionsStarted / max) * 100));
        return (
          <button
            key={m.month}
            type="button"
            onClick={() => onSelectMonth(m.month)}
            className={`flex flex-col items-center gap-1 group ${active ? "opacity-100" : "opacity-90"}`}
            title={`${m.label}: ${m.subscriptionsStarted} subs, ${formatInr(m.revenue)}`}
          >
            <span className="text-[10px] font-semibold text-gray-600 tabular-nums">
              {m.subscriptionsStarted || ""}
            </span>
            <span
              className={`w-full max-w-[2rem] rounded-t-md transition-all ${
                active ? "bg-[#076300]" : "bg-[#076300]/50 group-hover:bg-[#076300]/70"
              }`}
              style={{ height: `${h}px` }}
            />
            <span
              className={`text-[10px] font-medium ${active ? "text-[#076300]" : "text-gray-500"}`}
            >
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function SubscriptionAnalytics() {
  const { URI, setLoading } = useAuth();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLocalLoading] = useState(true);

  const yearOptions = useMemo(() => {
    const opts = [];
    for (let y = currentYear; y >= currentYear - 5; y -= 1) opts.push(y);
    return opts;
  }, [currentYear]);

  const load = useCallback(async () => {
    setLocalLoading(true);
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams({ year: String(year) });
      if (selectedMonth) params.set("month", String(selectedMonth));
      const res = await fetch(`${URI}/admin/subscription/analytics?${params}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Failed to load analytics");
      setData(json);
    } catch (e) {
      setError(e.message || "Could not load analytics");
      setData(null);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [URI, year, selectedMonth, setLoading]);

  useEffect(() => {
    load();
  }, [load]);

  const ov = data?.overview || {};
  const monthly = data?.monthly || [];
  const maxSubs = Math.max(1, ...monthly.map((m) => m.subscriptionsStarted));

  const detailColumns = [
    {
      name: "Partner",
      grow: 1.2,
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.user_name || "—"}</p>
          <p className="text-xs text-gray-500">{row.user_email}</p>
        </div>
      ),
    },
    {
      name: "Role",
      width: "130px",
      cell: (row) => ROLE_LABELS[row.role] || row.role,
    },
    { name: "Plan", grow: 1, selector: (row) => row.plan_name || "—" },
    {
      name: "Status",
      width: "100px",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      name: "Amount",
      width: "100px",
      right: true,
      cell: (row) => (
        <span className="font-semibold tabular-nums">{formatInr(row.final_amount)}</span>
      ),
    },
    {
      name: "Started",
      width: "110px",
      cell: (row) => formatDate(row.created_at),
    },
  ];

  const monthDetail = data?.monthDetail;

  return (
    <div className="w-full min-h-full bg-[#F4F6F8] overflow-y-auto scrollbar-hide">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-5 pb-10">
        <div className="rounded-2xl bg-gradient-to-br from-[#076300] via-[#0a7a02] to-[#054d00] text-white p-5 md:p-6 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Subscription Plans
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1 flex items-center gap-2">
                <FiBarChart2 />
                Subscription Analytics
              </h1>
              <p className="text-sm text-white/85 mt-2 max-w-xl">
                Purchases, revenue, and status breakdown — pick a year, then any month
                for full details.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <FiCalendar className="text-white/80" />
                <select
                  value={year}
                  onChange={(e) => {
                    setYear(Number(e.target.value));
                    setSelectedMonth(null);
                  }}
                  className="rounded-lg border border-white/25 bg-white/15 text-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y} className="text-gray-900">
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-sm font-semibold hover:bg-white/25 disabled:opacity-60"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading && !data ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-[#EAFBF1] border-t-[#076300] animate-spin" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                label="Total subscriptions"
                value={ov.totalSubscriptions?.toLocaleString("en-IN")}
                sub={`${ov.startedThisYear} started in ${year}`}
                icon={FiUsers}
                accent="bg-violet-100 text-violet-700"
              />
              <KpiCard
                label="Active now"
                value={ov.active?.toLocaleString("en-IN")}
                sub={`${ov.trial || 0} on trial · ${ov.cancelled || 0} cancelled`}
                icon={FiCreditCard}
                accent="bg-emerald-100 text-emerald-700"
              />
              <KpiCard
                label={`Purchases in ${year}`}
                value={ov.subscriptionsThisYear?.toLocaleString("en-IN")}
                sub="New subscriptions started"
                icon={FiTrendingUp}
                accent="bg-sky-100 text-sky-700"
              />
              <KpiCard
                label={`Revenue ${year}`}
                value={formatInr(ov.revenueThisYear)}
                sub={`${formatInr(ov.revenueAllTime)} all time`}
                icon={FiBarChart2}
                accent="bg-amber-100 text-amber-700"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-gray-800">
                    Monthly breakdown — {year}
                  </h2>
                  {selectedMonth ? (
                    <button
                      type="button"
                      onClick={() => setSelectedMonth(null)}
                      className="text-xs font-semibold text-[#076300] hover:underline"
                    >
                      Clear month filter
                    </button>
                  ) : (
                    <p className="text-xs text-gray-500">Click a month for details</p>
                  )}
                </div>
                <MonthBarChart
                  monthly={monthly}
                  selectedMonth={selectedMonth}
                  onSelectMonth={setSelectedMonth}
                  maxSubs={maxSubs}
                />
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-100">
                        <th className="py-2 pr-4">Month</th>
                        <th className="py-2 pr-4 text-right">Subscriptions</th>
                        <th className="py-2 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly.map((m) => (
                        <tr
                          key={m.month}
                          onClick={() => setSelectedMonth(m.month)}
                          className={`border-b border-gray-50 cursor-pointer hover:bg-[#076300]/5 ${
                            selectedMonth === m.month ? "bg-[#076300]/10" : ""
                          }`}
                        >
                          <td className="py-2.5 pr-4 font-medium text-gray-800">{m.label}</td>
                          <td className="py-2.5 pr-4 text-right tabular-nums">
                            {m.subscriptionsStarted}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-medium">
                            {formatInr(m.revenue)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold text-gray-900 bg-gray-50">
                        <td className="py-3 pr-4">Year total</td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {ov.subscriptionsThisYear}
                        </td>
                        <td className="py-3 text-right tabular-nums">
                          {formatInr(ov.revenueThisYear)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-800 mb-4">Yearly totals</h2>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {(data.yearly || []).map((y) => (
                      <div
                        key={y.year}
                        className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${
                          y.year === year ? "bg-[#076300]/10 ring-1 ring-[#076300]/20" : "bg-gray-50"
                        }`}
                      >
                        <span className="font-semibold text-gray-800">{y.year}</span>
                        <span className="text-gray-600 tabular-nums">
                          {y.subscriptionsStarted} subs · {formatInr(y.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-800 mb-3">By partner type</h2>
                  <ul className="space-y-2 text-sm">
                    {(data.byRole || []).map((r) => (
                      <li
                        key={r.role}
                        className="flex justify-between py-2 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-gray-700">{r.roleLabel}</span>
                        <span className="font-semibold tabular-nums text-gray-900">
                          {r.total}{" "}
                          <span className="text-xs font-normal text-gray-500">
                            ({r.active} active)
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-800 mb-3">Top plans</h2>
                  <ul className="space-y-2 text-sm">
                    {(data.topPlans || []).map((p, i) => (
                      <li key={i} className="flex justify-between gap-2 py-1.5">
                        <span className="text-gray-700 truncate">
                          {p.planName}
                          {p.planType === "trial" ? (
                            <span className="ml-1 text-[10px] text-violet-600 font-semibold">
                              Trial
                            </span>
                          ) : null}
                        </span>
                        <span className="font-semibold tabular-nums shrink-0">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/user-subscriptions"
                    className="mt-4 inline-block text-xs font-semibold text-[#076300] hover:underline"
                  >
                    View all subscriptions →
                  </Link>
                </div>
              </div>
            </div>

            {selectedMonth && monthDetail ? (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">
                      {monthDetail.label} {year} — subscription details
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {monthDetail.subscriptionsStarted} started ·{" "}
                      {formatInr(monthDetail.revenue)} revenue
                    </p>
                  </div>
                </div>
                <DataTable
                  columns={detailColumns}
                  data={monthDetail.rows || []}
                  pagination
                  paginationPerPage={10}
                  highlightOnHover
                  responsive
                  noDataComponent={
                    <p className="py-8 text-sm text-gray-500">No subscriptions this month.</p>
                  }
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
