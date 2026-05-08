import React, { useEffect, useMemo, useState } from "react";
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

const formatINR = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const monthlyPrice = (plan) => {
  const price = Number(plan.price || 0);
  const d = Number(plan.duration || 1);
  if (plan.billing_cycle === "yearly") return Math.round(price / Math.max(1, d * 12));
  return Math.round(price / Math.max(1, d));
};

const durationLabel = (duration, cycle) =>
  `${duration} ${
    cycle === "yearly"
      ? `Year${duration > 1 ? "s" : ""}`
      : `Month${duration > 1 ? "s" : ""}`
  }`;

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

  const [form, setForm] = useState({
    partnerType: "Project Partner",
    planName: "",
    totalPrice: "",
    billingCycle: "monthly",
    duration: 1,
    status: "Active",
  });

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

  useEffect(() => {
    fetchPlans();
    fetchFeatures();
  }, []);

  const filteredPlans = useMemo(
    () =>
      plans.filter(
        (p) =>
          ROLE_LABELS[p.role] === activeTab &&
          `${p.plan_name} ${p.status}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      ),
    [plans, activeTab, searchTerm],
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
      totalPrice: "",
      billingCycle: "monthly",
      duration: 1,
      status: "Active",
    });
    setSelectedFeatures(new Set());
    setBannerPreview("");
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setPageMode("create");
    setForm({
      partnerType: ROLE_LABELS[plan.role] || activeTab,
      planName: plan.plan_name || "",
      totalPrice: plan.price || "",
      billingCycle: plan.billing_cycle || "monthly",
      duration: plan.duration || 1,
      status: plan.status || "Active",
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
    if (!Number(form.duration) || Number(form.duration) < 1) {
      setNotice({ type: "error", message: "Duration must be at least 1" });
      return;
    }
    if (!Number(form.totalPrice) || Number(form.totalPrice) < 1) {
      setNotice({ type: "error", message: "Total price must be at least 1" });
      return;
    }
    setLoading(true);
    try {
      const endpoint = editing
        ? `${URI}/admin/subscription/plans/edit/${editing.id}`
        : `${URI}/admin/subscription/plans/add`;
      const method = editing ? "PUT" : "POST";
      const body = {
        role: ROLE_FROM_LABEL[form.partnerType],
        plan_name: form.planName.trim(),
        duration: Number(form.duration),
        price: Number(form.totalPrice),
        billing_cycle: form.billingCycle,
        status: form.status,
        feature_ids: Array.from(selectedFeatures),
      };

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to save plan");

      setNotice({
        type: "success",
        message: editing ? "Plan updated successfully." : "Plan created successfully.",
      });
      setPageMode("list");
      await fetchPlans();
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

  const tableColumns = [
    {
      name: "Plan Name",
      selector: (row) => row.plan_name,
      minWidth: "200px",
      cell: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.plan_name}</p>
          <p className="text-xs text-gray-500">
            {durationLabel(Number(row.duration || 1), row.billing_cycle)}
          </p>
        </div>
      ),
    },
    { name: "Price", selector: (row) => `${formatINR(monthlyPrice(row))}/mo`, minWidth: "140px" },
    { name: "Partner Type", selector: (row) => ROLE_LABELS[row.role], minWidth: "150px" },
    {
      name: "Status",
      minWidth: "120px",
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
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Plan Duration</label>
                    <div className="flex gap-2">
                      <input type="number" min={1} value={form.duration} onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))} className="w-24 rounded-lg border border-gray-300 p-2.5 text-sm" />
                      <select value={form.billingCycle} onChange={(e) => setForm((s) => ({ ...s, billingCycle: e.target.value }))} className="flex-1 rounded-lg border border-gray-300 p-2.5 text-sm">
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Plan Name</label>
                    <input value={form.planName} onChange={(e) => setForm((s) => ({ ...s, planName: e.target.value }))} placeholder="e.g. Professional Growth" className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Total Price</label>
                    <input type="number" min={1} value={form.totalPrice} onChange={(e) => setForm((s) => ({ ...s, totalPrice: e.target.value }))} placeholder="0.00" className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" required />
                  </div>
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
                <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">Premium Plan</span>
              </div>
              <div className="p-4">
                <h4 className="text-3xl font-semibold text-gray-900">{form.planName || "Professional Growth"}</h4>
                <p className="mt-1 text-5xl font-bold text-[#0f7a1f]">
                  {formatINR(form.totalPrice)}
                  <span className="text-base font-normal text-gray-600">/{form.billingCycle === "yearly" ? "yr" : "mo"}</span>
                </p>
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
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"><FiFilter size={14} /> Filters</button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"><FiDownload size={14} /> Export</button>
          </div>
        </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 w-full md:max-w-sm shadow-sm">
          <CiSearch className="text-gray-400" size={18} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search plans..." />
        </div>

        {viewMode === "card" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPlans.map((plan) => {
                const isPopular = plan.id === popularPlanId;
                return (
                  <div key={plan.id} className={`rounded-2xl border bg-white ${isPopular ? "border-[#35a041] shadow-sm" : "border-gray-200"}`}>
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] uppercase font-semibold rounded-full px-2 py-1 ${isPopular ? "bg-[#0f7a1f] text-white" : plan.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{isPopular ? "Most Popular" : plan.status}</span>
                        <FiMoreVertical className="text-gray-400" />
                      </div>
                      <h3 className="text-4xl font-semibold text-gray-900">{plan.plan_name}</h3>
                      <p className="text-5xl font-bold text-[#128527] mt-1">{formatINR(monthlyPrice(plan))}<span className="text-base font-medium text-gray-500">/mo</span></p>
                      <p className="text-xs text-gray-400 mt-1">Billed {plan.billing_cycle} ({formatINR(Number(plan.price || 0))}/{durationLabel(Number(plan.duration || 1), plan.billing_cycle)})</p>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2 min-h-[124px]">
                        {(Array.isArray(plan.feature_names) ? plan.feature_names : []).slice(0, 5).map((name) => (
                          <li key={name} className="flex items-center gap-2 text-sm text-gray-700"><FiCheckCircle className="text-[#16a34a]" size={14} />{name}</li>
                        ))}
                        {(Array.isArray(plan.feature_names) ? plan.feature_names : []).length > 5 ? (
                          <li className="text-[#0f7a1f] text-sm font-semibold">+ more</li>
                        ) : null}
                      </ul>
                      <div className="mt-4 flex items-center gap-2">
                        <button className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700">{isPopular ? "Manage Plan" : "View Details"}</button>
                        <button className="p-2 text-[#0f7a1f] hover:bg-gray-50 rounded-lg" onClick={() => openEdit(plan)}><FiEdit2 /></button>
                        <button className="p-2 text-red-500 hover:bg-gray-50 rounded-lg" onClick={() => setConfirmDeleteId(plan.id)}><FiTrash2 /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Recent Subscriptions - Compact Table</h2>
                <button type="button" onClick={() => setViewMode("table")} className="text-sm text-[#0f7a1f] font-medium">View All Records</button>
              </div>
              <DataTable columns={tableColumns} data={filteredPlans.slice(0, 5)} pagination={false} />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-800">Subscription Pricing List</h2></div>
            <DataTable
              columns={tableColumns}
              data={filteredPlans}
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
