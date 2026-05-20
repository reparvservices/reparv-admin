import { useState, useEffect, useMemo } from "react";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../store/auth";

const ROLE_OPTIONS = [
  { value: "project", label: "Project Partner" },
  { value: "territory", label: "Territory Partner" },
  { value: "sales", label: "Sales Partner" },
];

const inputClass =
  "w-full mt-1 rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#076300]/30";

const groupKey = (p) => `${p.role}::${String(p.plan_name || "").trim()}`;

export default function AssignEnterpriseModal({
  show,
  onClose,
  onSuccess,
  initialUserId = "",
  initialRole = "project",
  partnerName = "",
}) {
  const { URI } = useAuth();
  const [role, setRole] = useState(initialRole);
  const [userId, setUserId] = useState(String(initialUserId || ""));
  const [selectedGroupKey, setSelectedGroupKey] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [finalAmount, setFinalAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;
    setRole(initialRole || "project");
    setUserId(String(initialUserId || ""));
    setError("");
    setFinalAmount("");
    setStartDate("");
    setSelectedGroupKey("");
    setBillingCycle("monthly");
  }, [show, initialUserId, initialRole]);

  useEffect(() => {
    if (!show) return;
    const load = async () => {
      try {
        const res = await fetch(`${URI}/admin/subscription/plans`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => []);
        const enterprise = (Array.isArray(data) ? data : []).filter(
          (p) => String(p.plan_type).toLowerCase() === "enterprise" && p.status === "Active",
        );
        setPlans(enterprise);
      } catch {
        setPlans([]);
      }
    };
    load();
  }, [show, URI]);

  const enterpriseGroups = useMemo(() => {
    const map = new Map();
    for (const p of plans) {
      if (p.role !== role) continue;
      const key = groupKey(p);
      if (!map.has(key)) {
        map.set(key, {
          key,
          plan_name: p.plan_name,
          cycles: [],
        });
      }
      const entry = map.get(key);
      if (!entry.plan_id) entry.plan_id = p.id;
      if (!entry.price) entry.price = p.price;
    }
    return Array.from(map.values()).map((g) => ({
      ...g,
      cycles: [
        { billing_cycle: "monthly", price: g.price, plan_id: g.plan_id },
        { billing_cycle: "yearly", price: g.price, plan_id: g.plan_id },
      ],
    }));
  }, [plans, role]);

  const selectedGroup = enterpriseGroups.find((g) => g.key === selectedGroupKey);
  const availableCycles = selectedGroup?.cycles?.map((c) => c.billing_cycle) || [];

  useEffect(() => {
    if (availableCycles.length && !availableCycles.includes(billingCycle)) {
      setBillingCycle(availableCycles[0]);
    }
  }, [selectedGroupKey, availableCycles, billingCycle]);

  useEffect(() => {
    if (selectedGroup) {
      const match = selectedGroup.cycles.find((c) => c.billing_cycle === billingCycle);
      if (match?.price != null) setFinalAmount(String(match.price));
    }
  }, [billingCycle, selectedGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!userId.trim()) {
      setError("Partner user ID is required");
      return;
    }
    if (!selectedGroupKey || !selectedGroup) {
      setError("Select an enterprise plan");
      return;
    }

    setLoading(true);
    try {
      const body = {
        user_id: Number(userId),
        role,
        plan_name: selectedGroup.plan_name,
        billing_cycle: billingCycle,
      };
      if (finalAmount) body.final_amount = Number(finalAmount);
      if (startDate) body.start_date = startDate;

      const res = await fetch(`${URI}/admin/subscription/user-subscriptions/assign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Assignment failed");

      onSuccess?.(data.message || "Enterprise subscription assigned");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to assign subscription");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assign Enterprise plan</h2>
            {partnerName ? (
              <p className="text-sm text-gray-500 mt-0.5">{partnerName}</p>
            ) : (
              <p className="text-sm text-gray-500 mt-0.5">Admin-only — no app checkout</p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <IoMdClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-gray-500">Partner role</label>
            <select
              value={role}
              disabled={Boolean(initialUserId)}
              onChange={(e) => {
                setRole(e.target.value);
                setSelectedGroupKey("");
              }}
              className={inputClass}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Partner user ID</label>
            <input
              type="number"
              min={1}
              required
              disabled={Boolean(initialUserId)}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={inputClass}
              placeholder="e.g. 42"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Enterprise plan</label>
            <select
              required
              value={selectedGroupKey}
              onChange={(e) => setSelectedGroupKey(e.target.value)}
              className={inputClass}
            >
              <option value="">Select plan</option>
              {enterpriseGroups.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.plan_name} ({g.cycles.map((c) => c.billing_cycle).join(", ")})
                </option>
              ))}
            </select>
            {enterpriseGroups.length === 0 ? (
              <p className="text-xs text-amber-700 mt-1">No active enterprise plans for this role.</p>
            ) : null}
          </div>

          <div>
            <label className="text-xs text-gray-500">Billing cycle</label>
            <select
              required
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className={inputClass}
              disabled={!selectedGroupKey}
            >
              {availableCycles.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Amount charged (INR, incl. GST)</label>
            <input
              type="number"
              min={0}
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Start date (optional)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#076300] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Assigning…" : "Assign subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
