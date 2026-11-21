import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../store/auth";
import { ALL_PROPERTY_CATEGORIES } from "../utils/propertyListing";
import { GST_RATE, amountsFromRules, diffFees, withGst } from "../lib/listingFees";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const GROUPS = [
  { key: "new", title: "New Launch (for sale)" },
  { key: "resale", title: "Resale (for sale)" },
  { key: "rent", title: "Rental" },
];
const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600";

export default function ListingFees() {
  const { URI, setLoading } = useAuth();
  const [settings, setSettings] = useState({ enabled: 0, free_per_user: 1, default_fee: 0, go_live_at: null });
  const [rules, setRules] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [payments, setPayments] = useState([]);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const call = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`${URI}/admin/listing-fees${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || "Request failed");
      return data;
    },
    [URI],
  );

  const load = useCallback(async () => {
    setLoading?.(true);
    try {
      const cfg = await call("");
      setSettings({ ...cfg.settings, enabled: Number(cfg.settings.enabled) });
      setRules(cfg.rules);
      setAmounts(amountsFromRules(cfg.rules));
      setPayments((await call("/payments")).payments);
    } catch (e) {
      setNotice({ type: "error", message: e.message });
    } finally {
      setLoading?.(false);
    }
  }, [call, setLoading]);

  useEffect(() => {
    if (URI) load();
  }, [URI, load]);

  const dirty = useMemo(() => {
    const d = diffFees(rules, amounts);
    return d.save.length + d.remove.length;
  }, [rules, amounts]);

  const saveSettings = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const data = await call("/settings", {
        method: "PUT",
        body: JSON.stringify({ enabled: !!settings.enabled, free_per_user: Number(settings.free_per_user), default_fee: Number(settings.default_fee) }),
      });
      setSettings({ ...data.settings, enabled: Number(data.settings.enabled) });
      setNotice({ type: "success", message: "Settings saved." });
    } catch (e) {
      setNotice({ type: "error", message: e.message });
    } finally {
      setSaving(false);
    }
  };

  const saveFees = async () => {
    const { save, remove, invalid } = diffFees(rules, amounts);
    if (invalid.length) {
      setNotice({ type: "error", message: "Fees must be whole numbers from 0 to 10,00,000." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      let latest = rules;
      for (const r of save) {
        latest = (await call("/rules", { method: "POST", body: JSON.stringify({ listing_type: "Any", ...r }) })).rules;
      }
      for (const id of remove) {
        latest = (await call(`/rules/${id}`, { method: "DELETE" })).rules;
      }
      setRules(latest);
      setAmounts(amountsFromRules(latest));
      setNotice({ type: "success", message: "Fees saved." });
    } catch (e) {
      setNotice({ type: "error", message: e.message });
    } finally {
      setSaving(false);
    }
  };

  const goLive = settings.go_live_at ? new Date(settings.go_live_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null;
  const defaultWithGst = withGst(settings.default_fee);
  // what the "Default" placeholders show while the admin is still typing (never negative)
  const defaultShown = Math.max(0, Math.round(Number(settings.default_fee) || 0));

  return (
    <div className="p-4 sm:p-6 w-full max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Listing Fees</h1>
        <p className="text-sm text-gray-500 mt-1">
          Website users get free listings first. After that they pay the fee for the property type when they submit a listing.
          Amounts here exclude GST; {GST_RATE}% GST is added at checkout.
        </p>
      </div>

      {notice ? (
        <p className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${notice.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {notice.message}
        </p>
      ) : null}

      {/* Settings */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Settings</h2>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <span className={settings.enabled ? "text-green-700" : "text-gray-500"}>{settings.enabled ? "Charging is ON" : "Charging is OFF"}</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-green-700"
              checked={!!settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked ? 1 : 0 })}
            />
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Free listings per user
            <input type="number" min={0} max={100} className={inputCls} value={settings.free_per_user}
              onChange={(e) => setSettings({ ...settings, free_per_user: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Default fee (₹, excluding GST)
            <input type="number" min={0} className={inputCls} value={settings.default_fee}
              onChange={(e) => setSettings({ ...settings, default_fee: e.target.value })} />
            <span className="mt-1 block text-xs text-gray-400">
              Used for property types with no fee below. Users pay {inr(defaultWithGst.total)} including GST. 0 = free.
            </span>
          </label>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {goLive
            ? `Charging started on ${goLive}. Only listings created after that count toward the free allowance; earlier listings stay free.`
            : "When you switch charging on, that moment becomes the start date. Listings users already made stay free and don't count toward the free allowance."}
        </p>
        <button type="button" disabled={saving} onClick={saveSettings}
          className="mt-4 rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
          Save settings
        </button>
      </section>

      {/* Fees by property type */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Fee per property type</h2>
            <p className="text-xs text-gray-500">Leave a box empty to use the default fee. Enter 0 to make that type free.</p>
          </div>
          <button type="button" disabled={saving || !dirty} onClick={saveFees}
            className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {dirty ? `Save ${dirty} change${dirty > 1 ? "s" : ""}` : "No changes"}
          </button>
        </div>
        {GROUPS.map((g) => (
          <div key={g.key} className="mt-5">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">{g.title}</h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              {ALL_PROPERTY_CATEGORIES.filter((c) => c.group === g.key).map((c) => {
                const typed = amounts[c.value] ?? "";
                const total = typed === "" ? null : withGst(typed).total;
                return (
                  <div key={c.value} className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-3 py-2 last:border-b-0">
                    <span className="min-w-[10rem] flex-1 text-sm font-medium text-gray-800">{c.label}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">{c.kind}</span>
                    <input
                      type="number" min={0} placeholder={`Default (${inr(defaultShown)})`}
                      className="w-40 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-green-600"
                      value={typed}
                      onChange={(e) => setAmounts({ ...amounts, [c.value]: e.target.value })}
                    />
                    <span className="w-36 text-right text-xs text-gray-500">{total === null ? "" : `${inr(total)} with GST`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Payments */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Listing fee payments</h2>
        {payments.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No listing fees yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="py-2 pr-3">Date</th><th className="pr-3">User</th><th className="pr-3">Property</th>
                  <th className="pr-3">Fee</th><th className="pr-3">GST</th><th className="pr-3">Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3 whitespace-nowrap">{new Date(p.paid_at || p.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                    <td className="pr-3">{p.user_name || `User ${p.user_id}`}<span className="block text-xs text-gray-400">{p.user_contact}</span></td>
                    <td className="pr-3">{p.property_name || `#${p.property_id}`}</td>
                    <td className="pr-3">{inr(p.base_amount)}</td>
                    <td className="pr-3">{inr(p.gst_amount)}</td>
                    <td className="pr-3 font-semibold">{inr(p.total_amount)}</td>
                    <td>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {p.status === "paid" ? "Paid" : "Awaiting payment"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
