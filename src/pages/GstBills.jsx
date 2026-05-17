import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useAuth } from "../store/auth";
import { FiDownload, FiFileText, FiRefreshCw } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";

const SUB_STATUS_FILTERS = [
  { value: "", label: "All subscriptions" },
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

function SubStatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  const map = {
    active: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
    pending: "bg-amber-50 text-amber-800 ring-amber-200/60",
    expired: "bg-gray-100 text-gray-600 ring-gray-200",
    cancelled: "bg-red-50 text-red-800 ring-red-200/60",
    halted: "bg-orange-50 text-orange-800 ring-orange-200/60",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ring-1 ${
        map[s] || "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      {status || "—"}
    </span>
  );
}

const ROLE_LABELS = {
  project: "Project Partner",
  sales: "Sales Partner",
  territory: "Territory Partner",
};

const formatInr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const tableStyles = {
  table: { style: { minWidth: "1020px" } },
  headCells: {
    style: {
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "#6b7280",
      backgroundColor: "#f9fafb",
      paddingLeft: "14px",
      paddingRight: "14px",
      paddingTop: "12px",
      paddingBottom: "12px",
    },
  },
  cells: {
    style: {
      paddingLeft: "14px",
      paddingRight: "14px",
      paddingTop: "14px",
      paddingBottom: "14px",
      alignItems: "flex-start",
    },
  },
  rows: {
    style: {
      minHeight: "56px",
      "&:hover": { backgroundColor: "#f9fafb" },
    },
  },
};

function GstBillCard({ row, index, onDownload }) {
  const hasCgst = Number(row.cgst_amount) > 0;
  const hasSgst = Number(row.sgst_amount) > 0;
  const hasIgst = Number(row.igst_amount) > 0;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 font-medium">#{index + 1}</p>
          <p className="font-mono text-xs font-semibold text-gray-900 break-all">
            {row.invoice_number}
          </p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(row.invoice_date)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Total</p>
          <p className="text-lg font-bold text-gray-900 tabular-nums">
            {formatInr(row.total_amount)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Partner</p>
        <p className="font-semibold text-gray-900 truncate mt-0.5">{row.buyer_name || "—"}</p>
        <p className="text-xs text-gray-500 truncate">{row.buyer_email}</p>
        <p className="text-xs text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
          {ROLE_LABELS[row.role] || row.role}
          <SubStatusBadge status={row.subscription_status} />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Plan</p>
          <p className="text-gray-800 font-medium mt-0.5">{row.plan_name || "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Base</p>
          <p className="text-gray-900 font-semibold tabular-nums mt-0.5">
            {formatInr(row.base_amount)}
          </p>
        </div>
        <div className="col-span-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-2">
            Tax breakup
          </p>
          <div className="space-y-1">
            {hasCgst && <TaxLine label="CGST (9%)" value={formatInr(row.cgst_amount)} />}
            {hasSgst && <TaxLine label="SGST (9%)" value={formatInr(row.sgst_amount)} />}
            {hasIgst && <TaxLine label="IGST (18%)" value={formatInr(row.igst_amount)} />}
            {!hasCgst && !hasSgst && !hasIgst && (
              <p className="text-xs text-gray-400">No tax recorded</p>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDownload(row.id)}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-[#076300] border border-[#076300]/35 bg-[#076300]/5 hover:bg-[#076300]/10 transition"
      >
        <FiDownload size={16} />
        Download GST PDF
      </button>
    </article>
  );
}

function TaxLine({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium tabular-nums text-gray-800">{value}</span>
    </div>
  );
}

function MobilePagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-gray-500 tabular-nums">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export default function GstBills() {
  const { URI } = useAuth();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter) params.set("role", roleFilter);
      if (subscriptionStatusFilter) {
        params.set("subscription_status", subscriptionStatusFilter);
      }

      const res = await fetch(
        `${URI}/admin/subscription/gst-invoices?${params}`,
        { credentials: "include" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load GST bills");
      setItems(data.items || []);
      setTotal(data.total || 0);
      setSummary(data.summary || null);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [URI, page, search, roleFilter, subscriptionStatusFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const downloadPdf = useCallback(
    (id) => {
      window.open(
        `${URI}/admin/subscription/gst-invoices/${id}/pdf`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    [URI],
  );

  const columns = useMemo(
    () => [
      {
        name: "Invoice #",
        minWidth: "140px",
        cell: (row) => (
          <span className="font-mono text-xs font-semibold text-gray-900 whitespace-nowrap">
            {row.invoice_number}
          </span>
        ),
      },
      {
        name: "Date",
        width: "110px",
        cell: (row) => (
          <span className="text-sm text-gray-700 whitespace-nowrap">
            {formatDate(row.invoice_date)}
          </span>
        ),
      },
      {
        name: "Partner",
        minWidth: "160px",
        grow: 1.2,
        cell: (row) => (
          <div className="min-w-[140px]">
            <p className="font-medium text-gray-900 truncate">{row.buyer_name || "—"}</p>
            <p className="text-xs text-gray-500 truncate">{row.buyer_email}</p>
          </div>
        ),
      },
      {
        name: "Role",
        width: "128px",
        cell: (row) => (
          <span className="text-xs font-medium text-gray-700">
            {ROLE_LABELS[row.role] || row.role}
          </span>
        ),
      },
      {
        name: "Plan",
        minWidth: "120px",
        grow: 1,
        cell: (row) => (
          <div>
            <p className="text-sm text-gray-800">{row.plan_name || "—"}</p>
            <div className="mt-1">
              <SubStatusBadge status={row.subscription_status} />
            </div>
          </div>
        ),
      },
      {
        name: "Base",
        width: "96px",
        right: true,
        cell: (row) => (
          <span className="tabular-nums text-sm">{formatInr(row.base_amount)}</span>
        ),
      },
      {
        name: "CGST",
        width: "88px",
        right: true,
        cell: (row) => (
          <span className="tabular-nums text-sm">
            {Number(row.cgst_amount) > 0 ? formatInr(row.cgst_amount) : "—"}
          </span>
        ),
      },
      {
        name: "SGST",
        width: "88px",
        right: true,
        cell: (row) => (
          <span className="tabular-nums text-sm">
            {Number(row.sgst_amount) > 0 ? formatInr(row.sgst_amount) : "—"}
          </span>
        ),
      },
      {
        name: "IGST",
        width: "88px",
        right: true,
        cell: (row) => (
          <span className="tabular-nums text-sm">
            {Number(row.igst_amount) > 0 ? formatInr(row.igst_amount) : "—"}
          </span>
        ),
      },
      {
        name: "Total",
        width: "104px",
        right: true,
        cell: (row) => (
          <span className="font-semibold tabular-nums text-gray-900">
            {formatInr(row.total_amount)}
          </span>
        ),
      },
      {
        name: "",
        width: "56px",
        center: true,
        ignoreRowClick: true,
        cell: (row) => (
          <button
            type="button"
            onClick={() => downloadPdf(row.id)}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#076300]"
            title="Download GST PDF"
          >
            <FiDownload size={16} />
          </button>
        ),
      },
    ],
    [downloadPdf],
  );

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f3f4f6]">
      <div className="flex-1 px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-[1600px] mx-auto w-full">
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="relative px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex gap-3 sm:gap-4 min-w-0">
                <div className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20 shrink-0">
                  <FiFileText size={26} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-xs sm:text-sm font-medium">Partner billing</p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5 truncate">
                    GST Bills
                  </h1>
                  <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                    Tax invoices for subscription payments (18% GST on base price).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchBills}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/25 disabled:opacity-50 shrink-0 w-full sm:w-auto"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
                Refresh
              </button>
            </div>

            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8">
                {[
                  { label: "Invoices (MTD)", value: summary.invoice_count ?? 0, accent: false },
                  { label: "Taxable (MTD)", value: formatInr(summary.total_base), accent: false },
                  { label: "GST collected (MTD)", value: formatInr(summary.total_gst), accent: true },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 px-3 sm:px-4 py-2.5 sm:py-3 ${
                      s.label.includes("GST") ? "col-span-2 sm:col-span-1" : ""
                    }`}
                  >
                    <p className="text-[10px] sm:text-xs text-white/75 uppercase tracking-wide truncate">
                      {s.label}
                    </p>
                    <p
                      className={`text-lg sm:text-2xl font-bold tabular-nums mt-0.5 truncate ${
                        s.accent ? "text-white" : ""
                      }`}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {SUB_STATUS_FILTERS.map((f) => (
                <button
                  key={f.value || "all"}
                  type="button"
                  onClick={() => {
                    setSubscriptionStatusFilter(f.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    subscriptionStatusFilter === f.value
                      ? "bg-[#076300] text-white border-[#076300]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#076300]/40"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <Link
                to="/user-subscriptions?status=cancelled"
                className="text-xs font-semibold text-[#076300] hover:underline sm:ml-auto"
              >
                View cancelled subscriptions →
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 min-w-0">
                <CiSearch className="text-gray-400 shrink-0" size={20} />
                <input
                  type="search"
                  placeholder="Search invoice #, partner, payment id…"
                  className="flex-1 bg-transparent text-sm outline-none min-w-0"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto sm:min-w-[160px] rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white"
              >
                <option value="">All roles</option>
                <option value="project">Project Partner</option>
                <option value="sales">Sales Partner</option>
                <option value="territory">Territory Partner</option>
              </select>
            </div>

            <div className="lg:hidden space-y-3">
              {loading ? (
                <div className="flex flex-col items-center py-16 text-gray-500 gap-2">
                  <FiRefreshCw className="animate-spin text-[#076300]" size={28} />
                  <span className="text-sm">Loading GST bills…</span>
                </div>
              ) : items.length === 0 ? (
                <p className="text-center py-12 text-sm text-gray-500">
                  No GST invoices yet. They are created when subscription payments are captured.
                </p>
              ) : (
                <>
                  {items.map((row, i) => (
                    <GstBillCard
                      key={row.id ?? i}
                      row={row}
                      index={(page - 1) * limit + i}
                      onDownload={downloadPdf}
                    />
                  ))}
                  <MobilePagination
                    page={page}
                    total={total}
                    limit={limit}
                    onPageChange={setPage}
                  />
                </>
              )}
            </div>

            <div className="hidden lg:block rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={items}
                  customStyles={tableStyles}
                  progressPending={loading}
                  progressComponent={
                    <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
                      <FiRefreshCw className="animate-spin text-[#076300]" size={24} />
                      <span className="text-sm">Loading GST bills…</span>
                    </div>
                  }
                  pagination
                  paginationServer
                  paginationTotalRows={total}
                  paginationPerPage={limit}
                  paginationDefaultPage={page}
                  onChangePage={setPage}
                  fixedHeader
                  fixedHeaderScrollHeight="calc(100vh - 380px)"
                  persistTableHead
                  highlightOnHover
                  noDataComponent={
                    <p className="py-12 text-sm text-gray-500">
                      No GST invoices yet. They are created when subscription payments are captured.
                    </p>
                  }
                />
              </div>
              <p className="text-[11px] text-gray-400 px-4 py-2 border-t border-gray-100 bg-gray-50/80">
                Scroll horizontally on smaller screens to view all tax columns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
