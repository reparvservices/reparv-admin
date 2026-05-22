import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import {
  FiRefreshCw,
  FiUsers,
  FiFileText,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiXCircle,
} from "react-icons/fi";
import { useAuth } from "../store/auth";
import AssignEnterpriseModal from "../components/AssignEnterpriseModal";

const formatInr = (amount, { fromPaise = false } = {}) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  const rupees = fromPaise ? n / 100 : n;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
};

const formatDateShort = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (iso) => formatDateShort(iso);

const PeriodCell = ({ startDate, endDate }) => (
  <div className="text-xs text-gray-600 leading-snug whitespace-nowrap tabular-nums">
    <p>
      <span className="text-gray-400 font-medium">From </span>
      {formatDateShort(startDate)}
    </p>
    <p className="mt-0.5">
      <span className="text-gray-400 font-medium">To </span>
      {formatDateShort(endDate)}
    </p>
  </div>
);

const StatusBadge = ({ status, endDate, compact = false }) => {
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
};

const CopyText = ({ value, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-gray-400">—</span>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-start gap-1.5 max-w-full group">
      <span
        className="font-mono text-[11px] text-gray-600 break-all leading-snug"
        title={value}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={copy}
        title={label}
        className="shrink-0 p-1 rounded-md text-gray-400 hover:text-[#076300] hover:bg-[#076300]/10 opacity-70 group-hover:opacity-100 transition"
      >
        {copied ? <FiCheck size={14} className="text-emerald-600" /> : <FiCopy size={14} />}
      </button>
    </div>
  );
};

const Banner = ({ type, message, onDismiss }) => {
  if (!message) return null;
  const styles =
    type === "success"
      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
      : "bg-red-50 text-red-900 border-red-200";
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}
    >
      <p className="leading-snug pr-2">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 opacity-70 hover:opacity-100">
          <IoMdClose size={18} />
        </button>
      )}
    </div>
  );
};

const canCancelSubscription = (row) => {
  const s = String(row?.status || "").toLowerCase();
  return (
    row?.razorpay_subscription_id &&
    ["active", "pending", "halted"].includes(s)
  );
};

function CancelSubscriptionModal({ row, apiBase, onClose, onSuccess }) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const runCancel = async (cancelAtCycleEnd) => {
    if (!row?.id) return;
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/${row.id}/cancel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Cancel failed");
      onSuccess(data.message || "Subscription cancelled");
      onClose();
    } catch (e) {
      setError(e.message || "Could not cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  if (!row) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">Cancel subscription</h3>
        <p className="text-sm text-gray-600 mt-1">
          {row.user_name} · {row.plan_name || "Plan"}
        </p>
        <p className="text-xs text-gray-500 mt-2 font-mono break-all">{row.razorpay_subscription_id}</p>
        {error && (
          <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <p className="mt-3 text-xs text-gray-500 leading-relaxed">
          End-of-period stops renewal at the billing month end and keeps access until the expiry
          date. Immediate ends the subscription and partner access now.
        </p>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            disabled={cancelling}
            onClick={() => runCancel(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#076300] hover:bg-[#065a00] disabled:opacity-50 text-left px-4"
          >
            <span className="block">
              {cancelling ? "Cancelling…" : "After billing period ends"}
            </span>
            <span className="block text-[11px] font-normal opacity-90 mt-0.5">
              Access until current expiry date (month end)
            </span>
          </button>
          <button
            type="button"
            disabled={cancelling}
            onClick={() => runCancel(false)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-left px-4"
          >
            <span className="block">Cancel immediately</span>
            <span className="block text-[11px] font-normal opacity-90 mt-0.5">
              Status expired — partner locked out now
            </span>
          </button>
          <button
            type="button"
            disabled={cancelling}
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionCard({ row, index, onInvoice, onCancel }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 font-medium">
            #{index + 1} · Sub {row.id}
          </p>
          <h3 className="font-semibold text-gray-900 truncate">{row.user_name || "—"}</h3>
          <p className="text-xs text-gray-500 truncate" title={row.user_email}>
            {row.user_email || row.user_contact}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Partner ID {row.user_id}</p>
        </div>
        <div className="shrink-0 max-w-[45%]">
          <StatusBadge status={row.display_status || row.status} endDate={row.end_date} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Role</p>
          <p className="text-gray-800 font-medium mt-0.5">{row.role_label}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Amount</p>
          <p className="text-gray-900 font-semibold tabular-nums mt-0.5">
            {formatInr(row.final_amount)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Plan</p>
          <p className="text-gray-800 font-medium mt-0.5">{row.plan_name || "—"}</p>
          <p className="text-xs text-gray-500">
            {row.plan_period_label ||
              `${row.plan_duration || ""}${row.billing_cycle ? ` · ${row.billing_cycle}` : ""}`}
          </p>
          {row.payment_label && (
            <p className="text-[10px] text-gray-400 mt-0.5">{row.payment_label}</p>
          )}
        </div>
        <div className="col-span-2 min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-1">
            Period
          </p>
          <PeriodCell startDate={row.start_date} endDate={row.end_date} />
        </div>
        {row.razorpay_subscription_id && (
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-1">
              Razorpay subscription
            </p>
            <CopyText value={row.razorpay_subscription_id} label="Copy subscription id" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onInvoice(row)}
          disabled={!row.razorpay_subscription_id}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-[#076300] border border-[#076300]/35 bg-[#076300]/5 hover:bg-[#076300]/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <FiFileText size={16} />
          View invoice & payments
        </button>
        {canCancelSubscription(row) && (
          <button
            type="button"
            onClick={() => onCancel(row)}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition"
          >
            <FiXCircle size={16} />
            Cancel subscription
          </button>
        )}
      </div>
    </article>
  );
}

const InvoiceModal = ({ open, onClose, row, apiBase }) => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!row?.id) return;
    setLoading(true);
    setError("");
    try {
      const [payRes, invRes] = await Promise.all([
        fetch(`${apiBase}/${row.id}/payments`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${apiBase}/${row.id}/invoices`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
      ]);
      const payJson = await payRes.json().catch(() => ({}));
      const invJson = await invRes.json().catch(() => ({}));
      if (!payRes.ok && payRes.status !== 503) {
        throw new Error(payJson.message || "Failed to load payment ledger");
      }
      if (!invRes.ok) throw new Error(invJson.message || "Failed to load invoices");
      setData({
        ...invJson,
        ledger: payJson.payments || [],
        ledger_summary: payJson.summary || invJson.ledger_summary,
        subscription: payJson.subscription || invJson.subscription,
        ledger_error: payRes.status === 503 ? payJson.message : null,
      });
    } catch (e) {
      setError(e.message || "Could not load payment history");
    } finally {
      setLoading(false);
    }
  }, [row?.id, apiBase]);

  const syncFromRazorpay = async () => {
    if (!row?.id) return;
    setSyncing(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/${row.id}/payments/sync`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Sync failed");
      setData((prev) => ({
        ...(prev || {}),
        ledger: json.payments || [],
        ledger_summary: json.summary,
        subscription: prev?.subscription,
      }));
    } catch (e) {
      setError(e.message || "Could not sync from Razorpay");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!open || !row?.id) return;
    loadData();
  }, [open, row?.id, loadData]);

  if (!open) return null;

  const invoices = data?.invoices || [];
  const ledger = data?.ledger || [];
  const ledgerSummary = data?.ledger_summary;
  const payments = [...(data?.payments || [])].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">Recurring payments</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {row?.user_name || "User"} · {row?.plan_name || "Plan"}
            </p>
            {row?.razorpay_subscription_id && (
              <div className="mt-2">
                <CopyText value={row.razorpay_subscription_id} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <IoMdClose size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-6">
          {!loading && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#076300]/5 border border-[#076300]/20 px-4 py-3">
              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {ledgerSummary?.success_count ?? 0} successful charge
                  {(ledgerSummary?.success_count ?? 0) === 1 ? "" : "s"}
                  {ledgerSummary?.total_paid_inr != null && (
                    <span className="text-[#076300]">
                      {" "}
                      · {formatInr(ledgerSummary.total_paid_inr)} total
                    </span>
                  )}
                </p>
                {data?.subscription?.next_billing_date && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Next billing: {formatDateShort(data.subscription.next_billing_date)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={syncFromRazorpay}
                disabled={syncing || !row?.razorpay_subscription_id}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#076300] hover:bg-[#065a00] disabled:opacity-50"
              >
                <FiRefreshCw className={syncing ? "animate-spin" : ""} size={14} />
                Sync from Razorpay
              </button>
            </div>
          )}

          {data?.ledger_error && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              {data.ledger_error}
            </p>
          )}

          {loading && (
            <p className="text-sm text-gray-500 text-center py-8">Loading payment history…</p>
          )}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {!loading && !error && data?.message && !ledger.length && !invoices.length && !payments.length && (
            <p className="text-sm text-gray-600">{data.message}</p>
          )}

          {!loading && ledger.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Payment ledger ({ledger.length})
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Stored on Reparv — each renewal from webhook, checkout verify, or sync.
              </p>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Payment ID</th>
                      <th className="px-3 py-2.5 text-right">Amount</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Method</th>
                      <th className="px-3 py-2.5">Billing period</th>
                      <th className="px-3 py-2.5">Source</th>
                      <th className="px-3 py-2.5">GST invoice</th>
                      <th className="px-3 py-2.5">Paid at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((p) => (
                      <tr key={p.id || p.razorpay_payment_id} className="border-t border-gray-100">
                        <td className="px-3 py-2.5 font-medium text-gray-700">{p.charge_number ?? "—"}</td>
                        <td className="px-3 py-2.5 font-mono text-xs">{p.razorpay_payment_id}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                          <div>{formatInr(p.amount)}</div>
                          {p.gst_invoice && (
                            <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                              Base {formatInr(p.gst_invoice.base_amount)} + GST{" "}
                              {formatInr(
                                (p.gst_invoice.cgst_amount || 0) +
                                  (p.gst_invoice.sgst_amount || 0) +
                                  (p.gst_invoice.igst_amount || 0),
                              )}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 capitalize">{p.status}</td>
                        <td className="px-3 py-2.5 capitalize">{p.payment_method || "—"}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                          {p.billing_cycle_start
                            ? `${formatDateShort(p.billing_cycle_start)} → ${formatDateShort(p.billing_cycle_end)}`
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-500">{p.source}</td>
                        <td className="px-3 py-2.5 text-xs">
                          {p.gst_invoice ? (
                            <div>
                              <p className="font-mono text-[#5E23DC]">{p.gst_invoice.invoice_number}</p>
                              <a
                                href={`${apiBase.replace("/user-subscriptions", "/gst-invoices")}/${p.gst_invoice.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#076300] font-semibold hover:underline"
                              >
                                PDF
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                          {formatDateShort(p.paid_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {!loading && invoices.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Invoices</h3>
              <ul className="space-y-2">
                {invoices.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {inv.invoice_number || inv.id}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDateShort(inv.created_at)} · {inv.status} ·{" "}
                        {formatInr(inv.amount_paid || inv.amount, { fromPaise: true })}
                      </p>
                    </div>
                    {inv.short_url && (
                      <a
                        href={inv.short_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 text-[#076300] font-semibold hover:underline shrink-0"
                      >
                        Open invoice <FiExternalLink size={14} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!loading && payments.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-800">
                Razorpay API — live payments ({payments.length})
              </h3>
              <p className="text-xs text-gray-500 mt-1 mb-3 leading-relaxed">
                Fetched directly from Razorpay (use Sync to save into the ledger above).
              </p>
              <div className="space-y-2 sm:hidden">
                {payments.map((p, idx) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-gray-200 p-3 text-sm"
                  >
                    <p className="text-[10px] text-gray-400 font-medium">
                      Charge {payments.length - idx}
                    </p>
                    <p className="font-mono text-xs text-gray-700 mt-1 break-all">{p.id}</p>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="font-semibold">{formatInr(p.amount, { fromPaise: true })}</span>
                      <span className="capitalize text-gray-600">{p.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDateShort(p.created_at)}</p>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm min-w-[480px]">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2.5">Payment</th>
                      <th className="px-3 py-2.5 text-right">Amount</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, idx) => (
                      <tr key={p.id} className="border-t border-gray-100">
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] text-gray-400 block">Charge {payments.length - idx}</span>
                          <span className="font-mono text-xs">{p.id}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium tabular-nums whitespace-nowrap">
                          {formatInr(p.amount, { fromPaise: true })}
                        </td>
                        <td className="px-3 py-2.5 capitalize whitespace-nowrap">{p.status}</td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                          {formatDateShort(p.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {!loading &&
            !error &&
            ledger.length === 0 &&
            invoices.length === 0 &&
            payments.length === 0 &&
            !data?.message && (
              <p className="text-sm text-gray-500 text-center py-6">
                No invoices or payments found for this Razorpay subscription yet.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

const tableStyles = {
  table: { style: { minWidth: "1080px" } },
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
      fontSize: "13px",
      minHeight: "72px",
      "&:hover": { backgroundColor: "#f9fafb" },
    },
  },
};

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
  { value: "pending", label: "Pending" },
  { value: "halted", label: "Halted" },
];

const UserSubscriptions = () => {
  const { URI } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const apiBase = useMemo(
    () => `${URI}/admin/subscription/user-subscriptions`,
    [URI],
  );

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") || "",
  );
  const [banner, setBanner] = useState({ type: "", message: "" });
  const [invoiceRow, setInvoiceRow] = useState(null);
  const [cancelRow, setCancelRow] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const showBanner = useCallback((type, message) => {
    setBanner({ type, message });
    if (type === "success" && message) {
      window.setTimeout(() => setBanner({ type: "", message: "" }), 4500);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams({ limit: "500", include_all: "1" });
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`${apiBase}?${params}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Failed to load subscriptions");
      setRows(Array.isArray(json.data) ? json.data : []);
      setTotal(json.total ?? 0);
      setSummary(json.summary || null);
    } catch (e) {
      console.error(e);
      showBanner("error", e.message || "Could not load user subscriptions.");
      setRows([]);
      setTotal(0);
    } finally {
      setFetching(false);
    }
  }, [apiBase, roleFilter, statusFilter, searchTerm, showBanner]);

  useEffect(() => {
    const t = window.setTimeout(() => fetchData(), searchTerm ? 400 : 0);
    return () => window.clearTimeout(t);
  }, [fetchData, searchTerm]);

  useEffect(() => {
    const q = statusFilter || "";
    if (searchParams.get("status") !== q) {
      if (q) setSearchParams({ status: q }, { replace: true });
      else setSearchParams({}, { replace: true });
    }
  }, [statusFilter, searchParams, setSearchParams]);

  const stats = useMemo(() => {
    if (summary) {
      return {
        shown: rows.length,
        total: summary.total,
        trial: summary.trial,
        active: summary.active,
        pending: summary.pending,
        cancelled: summary.cancelled,
        expired: summary.expired,
      };
    }
    const active = rows.filter((r) => String(r.status).toLowerCase() === "active").length;
    const pending = rows.filter((r) => String(r.status).toLowerCase() === "pending").length;
    const cancelled = rows.filter((r) => String(r.status).toLowerCase() === "cancelled").length;
    const expired = rows.filter((r) => String(r.status).toLowerCase() === "expired").length;
    return { shown: rows.length, total: rows.length, active, pending, cancelled, expired };
  }, [rows, summary]);

  const openInvoice = useCallback((row) => setInvoiceRow(row), []);
  const openCancel = useCallback((row) => setCancelRow(row), []);

  const columns = useMemo(
    () => [
      {
        name: "#",
        width: "52px",
        center: true,
        cell: (_, i) => (
          <span className="text-xs text-gray-400 tabular-nums font-medium">{i + 1}</span>
        ),
      },
      {
        name: "Sub ID",
        width: "72px",
        center: true,
        cell: (row) => (
          <span className="text-xs font-mono text-gray-600 tabular-nums">{row.id}</span>
        ),
      },
      {
        name: "User",
        minWidth: "220px",
        grow: 2,
        cell: (row) => (
          <div className="min-w-[200px] max-w-[280px]">
            <p className="font-semibold text-gray-900 truncate" title={row.user_name}>
              {row.user_name || "—"}
            </p>
            <p
              className="text-xs text-gray-500 truncate mt-0.5"
              title={row.user_email || row.user_contact}
            >
              {row.user_email || row.user_contact || "—"}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">ID {row.user_id}</p>
          </div>
        ),
      },
      {
        name: "Role",
        width: "128px",
        cell: (row) => (
          <span className="text-xs font-medium text-gray-700 leading-snug block">
            {row.role_label}
          </span>
        ),
      },
      {
        name: "Plan",
        minWidth: "140px",
        grow: 1,
        cell: (row) => (
          <div className="min-w-[120px]">
            <p className="font-medium text-gray-900">{row.plan_name || "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
              {row.plan_period_label ||
                `${row.plan_duration || ""}${row.billing_cycle ? ` · ${row.billing_cycle}` : ""}`}
            </p>
            {row.plan_type ? (
              <span
                className={`inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  row.is_enterprise || String(row.plan_type).toLowerCase() === "enterprise"
                    ? "bg-slate-200 text-slate-800"
                    : row.is_trial || String(row.plan_type).toLowerCase() === "trial"
                      ? "bg-violet-100 text-violet-800"
                      : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {row.is_trial ? "trial" : row.plan_type}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        name: "Amount",
        width: "100px",
        right: true,
        cell: (row) => (
          <span className="font-semibold tabular-nums text-gray-900 whitespace-nowrap">
            {formatInr(row.final_amount)}
          </span>
        ),
      },
      {
        name: "Status",
        width: "120px",
        center: true,
        cell: (row) => (
          <StatusBadge
            status={row.display_status || row.status}
            endDate={row.end_date}
            compact
          />
        ),
      },
      {
        name: "Period",
        width: "230px",
        minWidth: "230px",
        style: { overflow: "visible", whiteSpace: "nowrap" },
        cell: (row) => (
          <PeriodCell startDate={row.start_date} endDate={row.end_date} />
        ),
      },
      {
        name: "Razorpay ID",
        minWidth: "160px",
        grow: 1,
        cell: (row) => (
          <CopyText
            value={row.razorpay_subscription_id}
            label="Copy Razorpay subscription id"
          />
        ),
      },
      {
        name: "Actions",
        width: "120px",
        center: true,
        ignoreRowClick: true,
        cell: (row) => (
          <div className="flex flex-col items-stretch gap-1.5 w-full max-w-[7.5rem] mx-auto">
            <button
              type="button"
              onClick={() => openInvoice(row)}
              disabled={!row.razorpay_subscription_id}
              title={
                row.razorpay_subscription_id ? "View invoices" : "No Razorpay subscription id"
              }
              className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-[#076300] border border-[#076300]/30 hover:bg-[#076300]/8 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <FiFileText size={13} />
              Invoice
            </button>
            {canCancelSubscription(row) ? (
              <button
                type="button"
                onClick={() => openCancel(row)}
                title="Cancel Razorpay subscription"
                className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-red-700 border border-red-200/80 hover:bg-red-50 transition"
              >
                <FiXCircle size={13} />
                Cancel
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [openInvoice, openCancel],
  );

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f3f4f6]">
      <div className="flex-1 px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-[1600px] mx-auto w-full">
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="relative px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex gap-3 sm:gap-4 min-w-0">
                <div className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20 shrink-0">
                  <FiUsers size={26} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-xs sm:text-sm font-medium">Partner billing</p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5 truncate">
                    User subscriptions
                  </h1>
                  <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                    Partner subscriptions, plans, and Razorpay billing history.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-[#076300] hover:bg-white/95 w-full sm:w-auto"
                >
                  Assign Enterprise
                </button>
                <button
                  type="button"
                  onClick={fetchData}
                  disabled={fetching}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/25 disabled:opacity-50 w-full sm:w-auto"
                >
                  <FiRefreshCw className={fetching ? "animate-spin" : ""} size={16} />
                  Refresh
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mt-6 sm:mt-8">
              {[
                { label: "Total", value: stats.total ?? total },
                { label: "Trial", value: stats.trial ?? summary?.trial ?? 0 },
                { label: "Active paid", value: stats.active },
                { label: "Pending", value: stats.pending },
                { label: "Cancelled", value: stats.cancelled },
                { label: "Expired", value: stats.expired },
                { label: "Shown", value: stats.shown },
                {
                  label: "Enterprise",
                  value: summary?.enterprise_active ?? 0,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <p className="text-[10px] sm:text-xs text-white/75 uppercase tracking-wide truncate">
                    {s.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tabular-nums mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 space-y-4">
            <Banner
              type={banner.type}
              message={banner.message}
              onDismiss={() => setBanner({ type: "", message: "" })}
            />

            <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:thin]">
              <div className="flex gap-2 min-w-max px-1">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value || "all"}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition whitespace-nowrap ${
                      statusFilter === tab.value
                        ? "bg-[#076300] text-white border-[#076300]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#076300]/40"
                    }`}
                  >
                    {tab.label}
                    {tab.value === "cancelled" && summary?.cancelled != null
                      ? ` (${summary.cancelled})`
                      : ""}
                    {tab.value === "trial" && summary?.trial != null
                      ? ` (${summary.trial})`
                      : ""}
                    {tab.value === "active" && summary?.active != null
                      ? ` (${summary.active})`
                      : ""}
                    {tab.value === "pending" && summary?.pending != null
                      ? ` (${summary.pending})`
                      : ""}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 min-w-0">
                <CiSearch className="text-gray-400 shrink-0" size={20} />
                <input
                  type="search"
                  placeholder="Search name, email, plan, Razorpay id…"
                  className="flex-1 bg-transparent text-sm outline-none min-w-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[160px] rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white"
              >
                <option value="">All roles</option>
                <option value="project">Project Partner</option>
                <option value="sales">Sales Partner</option>
                <option value="territory">Territory Partner</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="hidden xl:block w-full sm:w-auto sm:min-w-[140px] rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white"
              >
                <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="halted">Halted</option>
              </select>
            </div>

            {/* Mobile & tablet: cards */}
            <div className="xl:hidden space-y-3">
              {fetching ? (
                <div className="flex flex-col items-center py-16 text-gray-500 gap-2">
                  <FiRefreshCw className="animate-spin text-[#076300]" size={28} />
                  <span className="text-sm">Loading subscriptions…</span>
                </div>
              ) : rows.length === 0 ? (
                <p className="text-center py-12 text-sm text-gray-500">No subscriptions found.</p>
              ) : (
                rows.map((row, i) => (
                  <SubscriptionCard
                    key={row.id ?? i}
                    row={row}
                    index={i}
                    onInvoice={openInvoice}
                    onCancel={openCancel}
                  />
                ))
              )}
            </div>

            {/* Desktop (xl+): table */}
            <div className="hidden xl:block rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={rows}
                  customStyles={tableStyles}
                  progressPending={fetching}
                  progressComponent={
                    <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
                      <FiRefreshCw className="animate-spin text-[#076300]" size={24} />
                      <span className="text-sm">Loading subscriptions…</span>
                    </div>
                  }
                  fixedHeader
                  fixedHeaderScrollHeight="calc(100vh - 380px)"
                  persistTableHead
                  highlightOnHover
                  noDataComponent={
                    <p className="py-12 text-sm text-gray-500">No subscriptions found.</p>
                  }
                />
              </div>
              <p className="text-[11px] text-gray-400 px-4 py-2 border-t border-gray-100 bg-gray-50/80">
                Scroll horizontally if columns do not fit. Use copy icon for full Razorpay IDs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <InvoiceModal
        open={Boolean(invoiceRow)}
        row={invoiceRow}
        apiBase={apiBase}
        onClose={() => setInvoiceRow(null)}
      />
      {cancelRow && (
        <CancelSubscriptionModal
          row={cancelRow}
          apiBase={apiBase}
          onClose={() => setCancelRow(null)}
          onSuccess={(msg) => {
            showBanner("success", msg);
            fetchData();
          }}
        />
      )}
      <AssignEnterpriseModal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={(msg) => {
          showBanner("success", msg);
          fetchData();
        }}
      />
    </div>
  );
};

export default UserSubscriptions;
