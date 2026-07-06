import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useAuth } from "../store/auth";
import Loader from "../components/Loader";
import { CiSearch } from "react-icons/ci";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiDownload,
  FiMoreVertical,
  FiCheckCircle,
} from "react-icons/fi";
import { MdGridView, MdTableRows } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";

const ROLE_LABELS = {
  project: "Project Partner",
  territory: "Territory Partner",
  sales: "Sales Partner",
};

const ROLE_FROM_LABEL = {
  "Project Partner": "project",
  "Territory Partner": "territory",
  "Sales Partner": "sales",
};

const TABS = ["Project Partner", "Territory Partner", "Sales Partner"];

/** App Store Connect subscription products (iOS partner app). */
const IOS_PARTNER_PRODUCTS = [
  { tier: "Basic", productId: "com.reparv.partner.basic.monthly", level: 1 },
  { tier: "Pro", productId: "com.reparv.partner.pro.monthly", level: 2 },
  { tier: "Premium", productId: "com.reparv.partner.premium.monthly", level: 3 },
  { tier: "Platinum", productId: "com.reparv.partner.platinum.monthly", level: 4 },
];

const suggestAppleProductId = (planName) => {
  const normalized = String(planName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+plan$/i, "")
    .trim();
  const match = IOS_PARTNER_PRODUCTS.find(
    (p) => p.tier.toLowerCase() === normalized,
  );
  return match?.productId || "";
};

const appleTierLabel = (productId) => {
  const row = IOS_PARTNER_PRODUCTS.find((p) => p.productId === productId);
  return row?.tier || null;
};

const GST_RATE = 18;

const formatINR = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const calcGstFromBase = (base) => {
  const b = Math.max(0, Number(base) || 0);
  const gst = Math.round((b * GST_RATE) / 100);
  return { base: b, gst, total: b + gst };
};

const monthlyPrice = (plan) => {
  const price = Number(plan.price || 0);
  const d = Number(plan.duration || 1);
  if (plan.billing_cycle === "yearly") return Math.round(price / Math.max(1, d * 12));
  return Math.round(price / Math.max(1, d));
};

const durationLabel = (duration, cycle, planType) => {
  const d = Number(duration) || 1;
  if (planType === "trial") {
    return `${d} Day${d > 1 ? "s" : ""}`;
  }
  return `${d} ${
    cycle === "yearly" ? `Year${d > 1 ? "s" : ""}` : `Month${d > 1 ? "s" : ""}`
  }`;
};

const isTrialPlanRow = (row) =>
  String(row?.plan_type || "").toLowerCase() === "trial";

const isEnterprisePlanRow = (row) =>
  String(row?.plan_type || "").toLowerCase() === "enterprise";

/** Same role + plan_name = one enterprise offering (monthly/yearly are separate rows). */
const enterpriseGroupKey = (row) =>
  `${row.role}::${String(row.plan_name || "").trim()}`;

const planTypeLabel = (row) => {
  if (isTrialPlanRow(row)) return "Trial";
  if (isEnterprisePlanRow(row)) return "Enterprise";
  return "Paid";
};

const tableCustomStyles = {
  headCells: {
    style: {
      backgroundColor: "#f9fafb",
      color: "#111827",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      paddingTop: "14px",
      paddingBottom: "14px",
    },
  },
  cells: {
    style: {
      paddingTop: "14px",
      paddingBottom: "14px",
      fontSize: "14px",
      color: "#374151",
    },
  },
  rows: {
    style: {
      minHeight: "58px",
    },
  },
};

const Subscription = () => {
  const { URI, setLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [activeTab, setActiveTab] = useState("Project Partner");
  const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageMode, setPageMode] = useState("list");
  const [editing, setEditing] = useState(null);
  const [featSearch, setFeatSearch] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState(new Set());
  const [bannerPreview, setBannerPreview] = useState("");
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [billingCycleFilter, setBillingCycleFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);

  const [form, setForm] = useState({
    partnerType: "Project Partner",
    planName: "",
    basePrice: "",
    billingCycle: "monthly",
    duration: 7,
    status: "Active",
    planType: "paid",
    enableMonthly: true,
    enableYearly: false,
    durationMonthly: 1,
    durationYearly: 1,
    basePriceMonthly: "",
    basePriceYearly: "",
    appleProductId: "",
  });

  const isTrialForm = form.planType === "trial";
  const isEnterpriseForm = form.planType === "enterprise";

  const pricePreview = useMemo(
    () => calcGstFromBase(form.basePrice),
    [form.basePrice],
  );

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${URI}/admin/subscription/plans`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error("Failed to load plans");
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to load plans" });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      const res = await fetch(`${URI}/admin/subscription/features`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error("Failed to load features");
      setFeatures(
        Array.isArray(data)
          ? data
              .map((f) => ({ id: Number(f.id), name: f.name, status: f.status }))
              .filter((f) => Number.isInteger(f.id) && f.id > 0 && f.name)
          : [],
      );
    } catch {
      setFeatures([]);
    }
  };

  const fetchActiveSubscriptions = async () => {
    try {
      const res = await fetch(
        `${URI}/admin/subscription/user-subscriptions?status=active&limit=5`,
        { credentials: "include" },
      );
      const data = await res.json().catch(() => ({}));
      setActiveSubscriptions(Array.isArray(data.data) ? data.data : []);
    } catch {
      setActiveSubscriptions([]);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchFeatures();
    fetchActiveSubscriptions();
  }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (ROLE_LABELS[p.role] !== activeTab) return false;
      const q = searchTerm.toLowerCase();
      if (q && !`${p.plan_name} ${p.status}`.toLowerCase().includes(q)) return false;
      if (planTypeFilter !== "all") {
        const pt = String(p.plan_type || "paid").toLowerCase();
        if (planTypeFilter === "paid" && pt !== "paid") return false;
        if (planTypeFilter === "trial" && pt !== "trial") return false;
        if (planTypeFilter === "enterprise" && pt !== "enterprise") return false;
      }
      if (billingCycleFilter !== "all" && p.billing_cycle !== billingCycleFilter) return false;
      return true;
    });
  }, [plans, activeTab, searchTerm, planTypeFilter, billingCycleFilter]);

  /** One list row per enterprise plan (legacy DB may have monthly+yearly duplicates). */
  const displayPlans = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const p of filteredPlans) {
      if (isEnterprisePlanRow(p)) {
        const gk = enterpriseGroupKey(p);
        if (seen.has(gk)) continue;
        seen.add(gk);
        out.push(p);
      } else {
        out.push(p);
      }
    }
    return out;
  }, [filteredPlans]);

  const displayPlansForCards = useMemo(
    () => displayPlans.map((p) => (isEnterprisePlanRow(p) ? { ...p, _enterpriseGroup: [p] } : p)),
    [displayPlans],
  );

  const filteredFeatures = useMemo(() => {
    const q = featSearch.toLowerCase().trim();
    const visible = features.filter(
      (f) => f.status === "Active" || selectedFeatures.has(f.id),
    );
    if (!q) return visible;
    return visible.filter((f) => f.name.toLowerCase().includes(q));
  }, [features, featSearch, selectedFeatures]);

  const featureNameMap = useMemo(() => {
    return new Map(features.map((f) => [f.id, f.name]));
  }, [features]);

  const selectedFeatureNames = useMemo(
    () =>
      Array.from(selectedFeatures)
        .map((id) => featureNameMap.get(id))
        .filter(Boolean),
    [selectedFeatures, featureNameMap],
  );

  const popularPlanId = useMemo(() => {
    const active = filteredPlans.filter((p) => p.status === "Active");
    if (!active.length) return null;
    return [...active].sort((a, b) => Number(b.price) - Number(a.price))[0]?.id ?? null;
  }, [filteredPlans]);

  const openCreate = () => {
    setEditing(null);
    setPageMode("create");
    setForm({
      partnerType: activeTab,
      planName: "",
      basePrice: "",
      billingCycle: "monthly",
      duration: 7,
      status: "Active",
      planType: "paid",
      enableMonthly: true,
      enableYearly: false,
      durationMonthly: 1,
      durationYearly: 1,
      basePriceMonthly: "",
      basePriceYearly: "",
      appleProductId: "",
    });
    setSelectedFeatures(new Set());
    setBannerPreview("");
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setPageMode("create");
    const trial = isTrialPlanRow(plan);
    const enterprise = isEnterprisePlanRow(plan);
    setForm({
      partnerType: ROLE_LABELS[plan.role] || activeTab,
      planName: plan.plan_name || "",
      basePrice: trial ? "0" : plan.base_price || Math.round(Number(plan.price || 0) / 1.18) || "",
      billingCycle: plan.billing_cycle || "monthly",
      duration: plan.duration || (trial ? 7 : 1),
      status: plan.status || "Active",
      planType: trial ? "trial" : enterprise ? "enterprise" : "paid",
      enableMonthly: true,
      enableYearly: false,
      durationMonthly: enterprise ? plan.duration || 1 : 1,
      durationYearly: 1,
      basePriceMonthly: "",
      basePriceYearly: "",
      appleProductId: plan.apple_product_id || suggestAppleProductId(plan.plan_name) || "",
    });
    const existing = Array.isArray(plan.feature_ids)
      ? plan.feature_ids.map((id) => Number(id))
      : [];
    setSelectedFeatures(new Set(existing));
  };

  const toggleFeature = (id) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.planName.trim()) {
      setNotice({ type: "error", message: "Plan name is required" });
      return;
    }
    if (
      !isEnterpriseForm &&
      (!Number(form.duration) || Number(form.duration) < 1)
    ) {
      setNotice({ type: "error", message: "Duration must be at least 1" });
      return;
    }
    if (isEnterpriseForm && (!Number(form.durationMonthly) || Number(form.durationMonthly) < 1)) {
      setNotice({ type: "error", message: "Access period length must be at least 1" });
      return;
    }
    if (!isTrialForm && !isEnterpriseForm && (!Number(form.basePrice) || Number(form.basePrice) < 1)) {
      setNotice({ type: "error", message: "Base price (excl. GST) must be at least 1" });
      return;
    }
    const role = ROLE_FROM_LABEL[form.partnerType];
    const nameTrim = form.planName.trim();
    const cycle = isTrialForm ? "monthly" : form.billingCycle || "monthly";

    if (isEnterpriseForm) {
      const duplicate = plans.some((p) => {
        if (!p || p.role !== role) return false;
        if (String(p.plan_name || "").trim() !== nameTrim) return false;
        if (!isEnterprisePlanRow(p)) return false;
        if (editing && Number(p.id) === Number(editing.id)) return false;
        if (
          editing &&
          isEnterprisePlanRow(editing) &&
          enterpriseGroupKey(p) === enterpriseGroupKey(editing)
        ) {
          return false;
        }
        return true;
      });
      if (duplicate) {
        setNotice({
          type: "error",
          message: "An enterprise plan with this name already exists for this partner type.",
        });
        return;
      }
    }

    if (!isEnterpriseForm) {
      const duplicate = plans.some((p) => {
        if (!p || p.role !== role) return false;
        if (String(p.billing_cycle || "monthly") !== String(cycle)) return false;
        if (String(p.plan_name || "").trim() !== nameTrim) return false;
        if (editing && Number(p.id) === Number(editing.id)) return false;
        if (
          editing &&
          isEnterprisePlanRow(editing) &&
          isEnterprisePlanRow(p) &&
          enterpriseGroupKey(p) === enterpriseGroupKey(editing)
        ) {
          return false;
        }
        return true;
      });
      if (duplicate) {
        setNotice({
          type: "error",
          message:
            "This plan name already exists for this partner type and billing period. Use a different name or billing period, or edit the existing plan.",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = editing
        ? `${URI}/admin/subscription/plans/edit/${editing.id}`
        : `${URI}/admin/subscription/plans/add`;
      const method = editing ? "PUT" : "POST";
      const body = isEnterpriseForm
        ? {
            role,
            plan_name: nameTrim,
            status: form.status,
            plan_type: "enterprise",
            duration: Number(form.durationMonthly) || 1,
            feature_ids: Array.from(selectedFeatures),
          }
        : {
            role,
            plan_name: nameTrim,
            duration: Number(form.duration),
            base_price: isTrialForm ? 0 : Number(form.basePrice),
            billing_cycle: cycle,
            status: form.status,
            plan_type: form.planType,
            feature_ids: Array.from(selectedFeatures),
            apple_product_id: form.appleProductId || undefined,
          };

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          res.status === 409
            ? data.message ||
              "This plan name already exists for this partner type and billing period. Change the name or billing period."
            : data.message || "Failed to save plan";
        throw new Error(msg);
      }

      setNotice({
        type: "success",
        message: editing ? "Plan updated successfully." : "Plan created successfully.",
      });
      setPageMode("list");
      await fetchPlans();
      await fetchActiveSubscriptions();
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to save plan" });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (confirmDeleteId !== id) return;
    setLoading(true);
    try {
      const res = await fetch(`${URI}/admin/subscription/plans/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete plan");
      setNotice({ type: "success", message: "Plan deleted successfully." });
      await fetchPlans();
      setConfirmDeleteId(null);
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to delete plan" });
    } finally {
      setLoading(false);
    }
  };

  const activeSubColumns = [
    {
      name: "Partner",
      selector: (row) => row.user_name,
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.user_name || "—"}</p>
          <p className="text-xs text-gray-500">{row.role_label}</p>
        </div>
      ),
    },
    {
      name: "Plan",
      selector: (row) => row.plan_name,
      cell: (row) => (
        <div>
          <p className="text-sm">{row.plan_name || "—"}</p>
          <p className="text-xs text-gray-500 capitalize">
            {row.plan_type || "paid"} · {row.billing_cycle || ""}
          </p>
        </div>
      ),
    },
    {
      name: "Expires",
      selector: (row) => row.end_date,
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {row.end_date ? new Date(row.end_date).toLocaleDateString("en-IN") : "—"}
        </span>
      ),
    },
  ];

  const tableColumns = [
    {
      name: "Plan Name",
      selector: (row) => row.plan_name,
      style: { minWidth: "200px" },
      cell: (row) => (
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{row.plan_name}</p>
            {isTrialPlanRow(row) ? (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                Trial
              </span>
            ) : null}
            {isEnterprisePlanRow(row) ? (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                Enterprise
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-500">
            {durationLabel(Number(row.duration || 1), row.billing_cycle, row.plan_type)}
          </p>
        </div>
      ),
    },
    {
      name: "Base (excl. GST)",
      selector: (row) => row.base_price || Math.round(Number(row.price || 0) / 1.18),
      cell: (row) => formatINR(row.base_price || Math.round(Number(row.price || 0) / 1.18)),
      style: { minWidth: "120px" },
    },
    {
      name: "GST (18%)",
      selector: (row) => row.gst_amount,
      cell: (row) =>
        formatINR(row.gst_amount ?? Number(row.price || 0) - Math.round(Number(row.price || 0) / 1.18)),
      style: { minWidth: "100px" },
    },
    {
      name: "Total",
      selector: (row) => row.price,
      cell: (row) => (
        <span className="font-semibold text-gray-900">{formatINR(row.price)}</span>
      ),
      style: { minWidth: "100px" },
    },
    {
      name: "iOS (App Store)",
      selector: (row) => row.apple_product_id,
      style: { minWidth: "180px" },
      cell: (row) => {
        if (isTrialPlanRow(row) || isEnterprisePlanRow(row)) {
          return <span className="text-xs text-gray-400">—</span>;
        }
        const tier = appleTierLabel(row.apple_product_id);
        return row.apple_product_id ? (
          <div>
            <p className="text-sm font-medium text-gray-900">{tier || "Linked"}</p>
            <p className="text-[11px] text-gray-500 break-all">{row.apple_product_id}</p>
          </div>
        ) : (
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
            Not linked
          </span>
        );
      },
    },
    {
      name: "Type",
      selector: (row) => planTypeLabel(row),
      style: { minWidth: "100px" },
    },
    {
      name: "Billing",
      selector: (row) => row.billing_cycle || "—",
      cell: (row) => (
        <span className="capitalize text-sm">
          {isEnterprisePlanRow(row) ? "Monthly / Yearly" : row.billing_cycle || "—"}
        </span>
      ),
      style: { minWidth: "90px" },
    },
    {
      name: "Partner Type",
      selector: (row) => ROLE_LABELS[row.role],
      style: { minWidth: "150px" },
    },
    {
      name: "Status",
      style: { minWidth: "120px" },
      cell: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            row.status === "Active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      width: "150px",
      cell: (row) => (
        <div className="flex items-center gap-1 text-gray-500">
          <button className="p-1.5 rounded hover:bg-gray-100" title="View details" onClick={() => openEdit(row)}><FiEye size={14} /></button>
          <button className="p-1.5 rounded hover:bg-gray-100" title="Edit" onClick={() => openEdit(row)}><FiEdit2 size={14} /></button>
          <button className="p-1.5 rounded hover:bg-gray-100" title="Delete" onClick={() => setConfirmDeleteId(row.id)}><FiTrash2 size={14} /></button>
        </div>
      ),
    },
  ];

  if (pageMode === "create") {
    return (
      <div className="w-full min-h-screen bg-[#f7f8fa] p-4 md:p-6">
        {notice.message ? (
          <div
            className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <p>{notice.message}</p>
            <button
              type="button"
              className="rounded px-2 py-1 text-xs hover:bg-black/5"
              onClick={() => setNotice({ type: "", message: "" })}
            >
              Close
            </button>
          </div>
        ) : null}
        <div className="sticky top-0 z-20 mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white/95 px-3 py-2 backdrop-blur">
          <button
            type="button"
            onClick={() => setPageMode("list")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <IoArrowBack size={16} /> Back to plans
          </button>
          <button
            type="button"
            onClick={(e) => submit(e)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#076300] px-4 py-2 text-sm font-medium text-white shadow-sm"
          >
            <FiPlus size={14} /> {editing ? "Update Plan" : "Add Plan"}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-5">
            <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
              <h3 className="mb-4 text-2xl font-semibold text-gray-900">Basic Plan Info</h3>
              <form className="space-y-4" onSubmit={submit}>
                <div>
                  <label className="mb-2 block text-xs text-gray-500">Plan type</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((s) => ({
                          ...s,
                          planType: "paid",
                          basePrice: s.basePrice === "0" ? "" : s.basePrice,
                        }))
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                        form.planType === "paid"
                          ? "bg-[#076300] text-white border-[#076300]"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      Paid plan
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((s) => ({
                          ...s,
                          planType: "trial",
                          basePrice: "0",
                          duration: s.duration || 7,
                        }))
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                        isTrialForm
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      Free trial
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((s) => ({
                          ...s,
                          planType: "enterprise",
                          durationMonthly: s.durationMonthly || 1,
                          durationYearly: s.durationYearly || 1,
                        }))
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                        isEnterpriseForm
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      Enterprise
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Partner Type</label>
                    <select
                      value={form.partnerType}
                      onChange={(e) => setForm((s) => ({ ...s, partnerType: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                    >
                      {TABS.map((tab) => <option key={tab}>{tab}</option>)}
                    </select>
                  </div>
                  {!isEnterpriseForm ? (
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      {isTrialForm ? "Trial length (days)" : "Plan duration"}
                    </label>
                    {isTrialForm ? (
                      <input
                        type="number"
                        min={1}
                        value={form.duration}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, duration: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                      />
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={form.duration}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, duration: e.target.value }))
                          }
                          className="w-24 rounded-lg border border-gray-300 p-2.5 text-sm"
                        />
                        <select
                          value={form.billingCycle}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, billingCycle: e.target.value }))
                          }
                          className="flex-1 rounded-lg border border-gray-300 p-2.5 text-sm"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    )}
                  </div>
                  ) : null}
                  <div className={isEnterpriseForm ? "md:col-span-2" : ""}>
                    <label className="mb-1 block text-xs text-gray-500">Plan Name</label>
                    <input
                      value={form.planName}
                      onChange={(e) => {
                        const planName = e.target.value;
                        setForm((s) => ({
                          ...s,
                          planName,
                          appleProductId:
                            s.planType === "paid" && !s.appleProductId
                              ? suggestAppleProductId(planName)
                              : s.appleProductId ||
                                suggestAppleProductId(planName) ||
                                s.appleProductId,
                        }));
                      }}
                      placeholder="e.g. Basic, Pro, Premium, Platinum"
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {isEnterpriseForm
                        ? "Direct-contact clients only. Set price when you assign the plan (Assign Enterprise)."
                        : "For iOS, use Basic / Pro / Premium / Platinum to auto-link App Store products. Must be unique per partner type and billing period."}
                    </p>
                  </div>
                  {!isEnterpriseForm && !isTrialForm ? (
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs text-gray-500">
                        iOS App Store product
                      </label>
                      <select
                        value={form.appleProductId}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, appleProductId: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                      >
                        <option value="">— Select App Store tier —</option>
                        {IOS_PARTNER_PRODUCTS.map((p) => (
                          <option key={p.productId} value={p.productId}>
                            {p.tier} · {p.productId}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Android keeps Razorpay pricing. iOS uses this App Store subscription (monthly).
                      </p>
                    </div>
                  ) : null}
                  {isEnterpriseForm ? (
                    <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                      <p className="text-sm text-slate-700">
                        No catalog price — amount and billing cycle are chosen when assigning to a partner.
                      </p>
                      <div>
                        <label className="text-xs text-gray-500">Default access period length</label>
                        <input
                          type="number"
                          min={1}
                          value={form.durationMonthly}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, durationMonthly: e.target.value }))
                          }
                          className="w-full max-w-xs rounded-lg border border-gray-300 p-2.5 text-sm mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Used with monthly (months) or yearly (years) when you assign this plan.
                        </p>
                      </div>                    </div>
                  ) : null}
                  {!isEnterpriseForm ? (
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Base price (excl. GST)</label>
                    {isTrialForm ? (
                      <p className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5 text-sm text-violet-900">
                        Free trial — no payment. Partners get access for the trial period only.
                      </p>
                    ) : (
                      <>
                        <input
                          type="number"
                          min={1}
                          value={form.basePrice}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, basePrice: e.target.value }))
                          }
                          placeholder="e.g. 1000"
                          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          required
                        />
                        <div className="mt-2 rounded-lg bg-[#f6f4fb] border border-[#5E23DC]/10 px-3 py-2 text-xs text-gray-600 space-y-1">
                          <p className="flex justify-between">
                            <span>GST ({GST_RATE}%)</span>
                            <span className="font-medium">{formatINR(pricePreview.gst)}</span>
                          </p>
                          <p className="flex justify-between font-semibold text-gray-900">
                            <span>Total (charged)</span>
                            <span>{formatINR(pricePreview.total)}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Feature Management</h3>
                <div className="text-xs text-gray-500">Selected: {selectedFeatures.size}/{features.length}</div>
              </div>
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <CiSearch className="text-gray-400" />
                <input value={featSearch} onChange={(e) => setFeatSearch(e.target.value)} placeholder="Search features by name or category..." className="w-full bg-transparent text-sm outline-none" />
              </div>
              {selectedFeatureNames.length ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedFeatureNames.map((name) => (
                      <span key={name} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">{name}</span>
                    ))}
                </div>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredFeatures.map((feature) => {
                  const enabled = selectedFeatures.has(feature.id);
                  return (
                    <button key={feature.id} type="button" onClick={() => toggleFeature(feature.id)} className={`w-full rounded-xl border px-3 py-2.5 text-left ${enabled ? "border-[#1f9e2c] bg-emerald-50" : "border-gray-200 bg-white"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-gray-800">{feature.name}</p>
                        <span role="switch" aria-checked={enabled} className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${enabled ? "border-[#1f9e2c] bg-[#1f9e2c]" : "border-gray-300 bg-gray-200"}`}>
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
              <h3 className="mb-3 text-2xl font-semibold text-gray-900">Banner Upload</h3>
              <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-200 p-6 text-center hover:border-gray-300">
                {bannerPreview ? <img src={bannerPreview} alt="preview" className="mx-auto mb-3 h-32 w-auto rounded-lg object-cover" /> : null}
                <p className="text-sm text-gray-700">Drag and drop your banner here</p>
                <p className="text-xs text-gray-500">Recommended size: 1200x400px. Max file size 2MB.</p>
                <span className="mt-3 inline-block rounded-md border px-4 py-2 text-sm">Select Files</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBannerPreview(URL.createObjectURL(file));
                }} />
              </label>
            </section>

            <div className="sticky bottom-3 z-10 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPageMode("list")}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => submit(e)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#076300] px-5 py-2 text-sm font-medium text-white"
                >
                  <FiPlus size={14} /> {editing ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </div>
          </div>

          <aside className="sticky top-5 h-max rounded-2xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-xs font-semibold text-[#1f9e2c]">(•) LIVE PREVIEW</p>
            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
              <div className="h-20 bg-gradient-to-br from-[#0f5d1d] to-[#1f9e2c] p-3 flex items-end">
                <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">
                  {isEnterpriseForm ? "Enterprise" : isTrialForm ? "Free trial" : "Premium Plan"}
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-3xl font-semibold text-gray-900">{form.planName || "Professional Growth"}</h4>
                {isEnterpriseForm ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-slate-700">
                      Price set when assigning (monthly or yearly)
                    </p>
                    <p className="text-xs text-slate-500">
                      Period length: {form.durationMonthly} (months or years at assign)
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-4xl font-bold text-[#0f7a1f]">
                      {formatINR(pricePreview.total)}
                      <span className="text-base font-normal text-gray-600"> incl. GST</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Base {formatINR(pricePreview.base)} + GST {formatINR(pricePreview.gst)}
                    </p>
                  </>
                )}
                <p className="mt-4 mb-2 text-[11px] uppercase tracking-wide text-gray-500">What’s Included</p>
                <ul className="space-y-2">
                  {Array.from(selectedFeatures)
                    .map((id) => featureNameMap.get(id))
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((name) => (
                      <li key={name} className="flex items-center gap-2 text-sm text-gray-700"><FiCheckCircle className="text-[#16a34a]" />{name}</li>
                    ))}
                  {selectedFeatures.size > 6 ? <li className="text-sm font-medium text-[#0f7a1f]">+ {selectedFeatures.size - 6} more features</li> : null}
                </ul>
                <button type="button" className="mt-5 w-full rounded-xl bg-[#146a22] py-2.5 font-medium text-white">Get Started Today</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] p-4 md:p-6">
      {notice.message ? (
        <div
          className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p>{notice.message}</p>
          <button
            type="button"
            className="rounded px-2 py-1 text-xs hover:bg-black/5"
            onClick={() => setNotice({ type: "", message: "" })}
          >
            Close
          </button>
        </div>
      ) : null}
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-[#dbe7df] bg-gradient-to-r from-white via-white to-[#f1fbf2] p-4 md:p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Pricing</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and optimize your global subscription tiers and partner configurations.
            </p>
          </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-[#076300] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-green-100 transition hover:bg-[#065500]"
            >
              <FiPlus size={15} /> Add Plan
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 md:p-4 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm whitespace-nowrap transition ${
                  activeTab === tab
                    ? "bg-[#e9f7eb] text-[#076300] font-semibold"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button type="button" onClick={() => setViewMode("card")} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${viewMode === "card" ? "bg-[#ebf6eb] text-[#076300] font-medium" : "text-gray-500"}`}><MdGridView size={15} /> Card View</button>
              <button type="button" onClick={() => setViewMode("table")} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${viewMode === "table" ? "bg-[#ebf6eb] text-[#076300] font-medium" : "text-gray-500"}`}><MdTableRows size={15} /> Table View</button>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${
                showFilters ? "border-[#076300] bg-[#ebf6eb] text-[#076300]" : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              <FiFilter size={14} /> Filters
            </button>
          </div>
        </div>
        {showFilters ? (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-500 w-full">Plan type</span>
            {["all", "paid", "trial", "enterprise"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPlanTypeFilter(t)}
                className={`rounded-full px-3 py-1 text-xs capitalize ${
                  planTypeFilter === t ? "bg-[#076300] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t}
              </button>
            ))}
            <span className="text-xs text-gray-500 w-full mt-2">Billing</span>
            {["all", "monthly", "yearly"].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBillingCycleFilter(b)}
                className={`rounded-full px-3 py-1 text-xs capitalize ${
                  billingCycleFilter === b ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        ) : null}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 w-full md:max-w-sm shadow-sm">
          <CiSearch className="text-gray-400" size={18} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search plans..." />
        </div>

        {viewMode === "card" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayPlansForCards.map((plan) => {
                const isPopular = plan.id === popularPlanId && !isEnterprisePlanRow(plan);
                const featureNames = Array.isArray(plan.feature_names) ? plan.feature_names : [];
                const group = plan._enterpriseGroup;
                const cycleLabel = group
                  ? group.map((g) => (g.billing_cycle === "yearly" ? "Yearly" : "Monthly")).join(" · ")
                  : plan.billing_cycle === "yearly"
                    ? "Yearly"
                    : "Monthly";
                return (
                  <article
                    key={plan.id}
                    className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                      isPopular
                        ? "shadow-lg shadow-emerald-900/10 ring-2 ring-emerald-500/30"
                        : "border border-gray-200/90 shadow-md shadow-gray-200/50 ring-1 ring-black/[0.04] hover:ring-emerald-500/15"
                    }`}
                  >
                    {isPopular ? (
                      <div
                        className="h-1.5 w-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-400"
                        aria-hidden
                      />
                    ) : (
                      <div className="h-1 w-full bg-gradient-to-r from-gray-100 via-gray-50 to-transparent" aria-hidden />
                    )}

                    <div
                      className={`px-5 pt-5 pb-4 ${
                        isPopular
                          ? "bg-gradient-to-b from-emerald-50/90 via-white to-white"
                          : "bg-gradient-to-b from-gray-50/40 to-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {isPopular ? (
                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                              Most popular
                            </span>
                          ) : null}
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              plan.status === "Active"
                                ? "bg-emerald-100/80 text-emerald-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {plan.status}
                          </span>
                          <span className="inline-flex rounded-full border border-gray-200/80 bg-white/80 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                            {cycleLabel}
                          </span>
                          {isEnterprisePlanRow(plan) ? (
                            <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                              Enterprise
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-400 opacity-60 transition hover:bg-white/80 hover:text-gray-600 hover:opacity-100"
                          aria-label="Plan options"
                        >
                          <FiMoreVertical size={18} />
                        </button>
                      </div>

                      <h3 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-gray-900 md:text-[1.65rem]">
                        {plan.plan_name}
                      </h3>

                      {group ? (
                        <div className="mt-4 space-y-2">
                          {group.map((g) => (
                            <p key={g.id} className="text-sm text-gray-700">
                              <span className="font-semibold capitalize">{g.billing_cycle}</span>:{" "}
                              {formatINR(Number(g.price || 0))} incl. GST
                            </p>
                          ))}
                        </div>
                      ) : (
                      <>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tabular-nums tracking-tight text-emerald-700 md:text-[2.75rem]">
                          {formatINR(monthlyPrice(plan))}
                        </span>
                        <span className="text-sm font-medium text-gray-500">/mo</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                        Effective monthly rate ·{" "}
                        <span className="font-medium text-gray-600">
                          {formatINR(Number(plan.price || 0))}
                        </span>{" "}
                        per {durationLabel(Number(plan.duration || 1), plan.billing_cycle).toLowerCase()}
                      </p>
                      </>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col px-5 pb-5 pt-1">
                      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                        What&apos;s included
                      </p>
                      <ul className="min-h-[7.5rem] space-y-0 rounded-2xl bg-gray-50/70 p-3 ring-1 ring-gray-100/80">
                        {featureNames.slice(0, 5).map((name) => (
                          <li
                            key={name}
                            className="flex items-start gap-2.5 border-b border-gray-100/80 py-2.5 text-sm text-gray-700 last:border-0 last:pb-0 first:pt-0"
                          >
                            <FiCheckCircle
                              className="mt-0.5 shrink-0 text-emerald-600"
                              size={16}
                              strokeWidth={2.25}
                            />
                            <span className="leading-snug">{name}</span>
                          </li>
                        ))}
                        {featureNames.length > 5 ? (
                          <li className="pt-2 text-center text-xs font-semibold text-emerald-700">
                            +{featureNames.length - 5} more features
                          </li>
                        ) : null}
                        {featureNames.length === 0 ? (
                          <li className="py-6 text-center text-sm text-gray-400">No features linked yet</li>
                        ) : null}
                      </ul>

                      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={() => openEdit(plan)}
                          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                            isPopular
                              ? "bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md shadow-emerald-900/20 hover:from-emerald-800 hover:to-emerald-700"
                              : "border border-gray-200 bg-white text-gray-800 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/50"
                          }`}
                        >
                          {isPopular ? "Manage plan" : "View & edit"}
                        </button>
                        <div className="flex shrink-0 justify-end gap-1 sm:justify-start">
                          <button
                            type="button"
                            onClick={() => openEdit(plan)}
                            className="rounded-xl border border-transparent p-2.5 text-emerald-700 transition hover:border-emerald-100 hover:bg-emerald-50"
                            title="Edit plan"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(plan.id)}
                            className="rounded-xl border border-transparent p-2.5 text-red-500 transition hover:border-red-100 hover:bg-red-50"
                            title="Delete plan"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Active subscribers</h2>
                <Link to="/user-subscriptions?status=active" className="text-sm text-[#0f7a1f] font-medium">
                  View all
                </Link>
              </div>
              <DataTable
                columns={activeSubColumns}
                data={activeSubscriptions}
                pagination={false}
                noDataComponent={
                  <div className="py-8 text-sm text-gray-500">No active subscriptions yet.</div>
                }
              />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-800">Subscription Pricing List</h2></div>
            <DataTable
              columns={tableColumns}
              data={displayPlans}
              pagination
              customStyles={tableCustomStyles}
              noDataComponent={
                <div className="py-10 text-sm text-gray-500">No plans found for this partner type.</div>
              }
            />
          </div>
        )}
      </div>
      {confirmDeleteId ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Delete plan?</h3>
            <p className="mt-1 text-sm text-gray-600">
              This action will permanently remove this subscription plan.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDelete(confirmDeleteId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <Loader />
    </div>
  );
};

export default Subscription;
