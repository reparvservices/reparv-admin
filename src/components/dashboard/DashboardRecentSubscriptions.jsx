import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import FormatPrice from "../FormatPrice";

const ROLE_LABELS = {
  project: "Project Partner",
  sales: "Sales Partner",
  territory: "Territory Partner",
};

const statusClass = (displayStatus) => {
  const s = String(displayStatus || "").toLowerCase();
  if (s === "active") return "bg-emerald-50 text-emerald-800 ring-emerald-200/60";
  if (s === "trial") return "bg-violet-50 text-violet-800 ring-violet-200/60";
  if (s === "pending") return "bg-amber-50 text-amber-800 ring-amber-200/60";
  if (s === "expired") return "bg-gray-100 text-gray-600 ring-gray-200";
  if (s === "cancelled") return "bg-red-50 text-red-800 ring-red-200/60";
  return "bg-gray-100 text-gray-600 ring-gray-200";
};

export default function DashboardRecentSubscriptions({ rows = [] }) {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Recent subscriptions</h2>
          <p className="text-sm text-gray-500">Latest partner subscription activity</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/user-subscriptions")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#076300] hover:underline cursor-pointer"
        >
          View all
          <FiArrowRight size={16} />
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No subscriptions yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <th className="pb-3 px-2">Partner</th>
                <th className="pb-3 px-2">Plan</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors"
                >
                  <td className="py-3 px-2">
                    <p className="font-semibold text-gray-900">{row.user_name}</p>
                    <p className="text-xs text-gray-500">
                      {ROLE_LABELS[row.role] || row.role} · ID {row.user_id}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-800">{row.plan_name}</p>
                    {row.plan_type ? (
                      <span className="text-[10px] uppercase font-semibold text-violet-600">
                        {row.plan_type}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 px-2 tabular-nums font-medium">
                    <FormatPrice price={row.final_amount} />
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ring-1 ${statusClass(row.display_status)}`}
                    >
                      {row.display_status || row.status || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-600 whitespace-nowrap tabular-nums">
                    {row.updated_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
