import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import Loader from "../components/Loader";
import {
  FiMoreVertical,
  FiFilter,
  FiDownload,
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiZap,
  FiToggleLeft,
} from "react-icons/fi";
import { MdGridView, MdTableRows } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";

// ─────────────────────────────────────────────
// Indian currency formatter
// ─────────────────────────────────────────────
const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// ─────────────────────────────────────────────
// Feature catalogue (for toggle UI)
// ─────────────────────────────────────────────
const FEATURE_CATALOGUE = {
  "Lead Management": [
    "Automatic Lead Scoring",
    "CRM Integration",
    "Lead Import / Export",
    "Duplicate Detection",
  ],
  "Marketing Tools": [
    "Email Campaign Builder",
    "Social Media Scheduler",
    "SMS Broadcast",
    "WhatsApp Integration",
  ],
  Analytics: [
    "Custom Report Engine",
    "Advanced Attribution",
    "Real-time Dashboards",
    "Export to Excel / PDF",
  ],
};
const ALL_FEATURES = Object.values(FEATURE_CATALOGUE).flat();

// ─────────────────────────────────────────────
// Partner tabs
// ─────────────────────────────────────────────
const PARTNER_TABS = ["Project Partner", "Territory Partner", "Sales Partner"];

// ─────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      status === "Active"
        ? "bg-green-50 text-green-700"
        : "bg-gray-100 text-gray-500"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
    />
    {status}
  </span>
);

// ─────────────────────────────────────────────
// Feature Toggle
// ─────────────────────────────────────────────
const FeatureToggle = ({ name, enabled, onToggle }) => (
  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50">
    <span
      className={`text-sm ${enabled ? "text-green-700 font-medium" : "text-gray-600"}`}
    >
      {name}
    </span>
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${enabled ? "bg-green-600" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  </div>
);

// ─────────────────────────────────────────────
// Card 3-dot dropdown
// ─────────────────────────────────────────────
const CardDropdown = ({
  plan,
  onView,
  onEdit,
  onStatus,
  onHighlight,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);

  const items = [
    {
      label: "View",
      icon: <FiEye size={14} />,
      fn: () => {
        onView(plan.id);
        setOpen(false);
      },
    },
    {
      label: "Edit",
      icon: <FiEdit2 size={14} />,
      fn: () => {
        onEdit(plan.id);
        setOpen(false);
      },
    },
    {
      label: "Status",
      icon: <FiToggleLeft size={14} />,
      fn: () => {
        onStatus(plan.id);
        setOpen(false);
      },
    },
    {
      label: "Highlight",
      icon: <FiZap size={14} />,
      fn: () => {
        onHighlight(plan.id);
        setOpen(false);
      },
    },
    {
      label: "Delete",
      icon: <FiTrash2 size={14} />,
      fn: () => {
        onDelete(plan.id);
        setOpen(false);
      },
      danger: true,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FiMoreVertical size={17} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[140px] py-1">
            {items.map(({ label, icon, fn, danger }) => (
              <button
                key={label}
                onClick={fn}
                className={`w-full flex items-center gap-2 text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${danger ? "text-red-500" : "text-gray-700"}`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Plan Card
// ─────────────────────────────────────────────
const PlanCard = ({
  plan,
  onView,
  onEdit,
  onStatus,
  onHighlight,
  onDelete,
}) => {
  const featureList = plan.features
    ? plan.features.split(",").map((f) => f.trim())
    : [];
  const isPopular = plan.highlight === "True";

  return (
    <div
      className={`relative bg-white rounded-2xl flex flex-col gap-4 p-5 transition-shadow hover:shadow-md ${
        isPopular
          ? "border-2 border-green-600 shadow-md"
          : "border border-gray-200"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <StatusBadge status={plan.status} />
        <CardDropdown
          plan={plan}
          onView={onView}
          onEdit={onEdit}
          onStatus={onStatus}
          onHighlight={onHighlight}
          onDelete={onDelete}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">{plan.planName}</h3>
        <div className="text-2xl font-bold text-green-700 mt-1">
          {formatINR(parseInt(plan.totalPrice))}
          <span className="text-sm font-normal text-gray-500">
            {" "}
            /{plan.planDuration}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{plan.partnerType}</p>
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {featureList.slice(0, 4).map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path
                  d="M1 4l2 2 4-4"
                  stroke="#16a34a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {f}
          </li>
        ))}
        {featureList.length > 4 && (
          <li
            className="text-sm text-green-600 font-medium cursor-pointer hover:underline"
            onClick={() => onView(plan.id)}
          >
            + {featureList.length - 4} more
          </li>
        )}
      </ul>

      {isPopular ? (
        <button
          onClick={() => onView(plan.id)}
          className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Manage Plan
        </button>
      ) : (
        <button
          onClick={() => onView(plan.id)}
          className="w-full py-2.5 border border-gray-300 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const Subscription = () => {
  const {
    showSubscriptionPlan,
    setShowSubscriptionPlan,
    // FIX: removed unused showSubscriptionForm / setShowSubscriptionForm
    URI,
    setLoading,
  } = useAuth();

  // ── page / view state ──
  const [page, setPage] = useState("list"); // "list" | "add" | "edit"
  const [viewMode, setViewMode] = useState("card");
  const [activeTab, setActiveTab] = useState("Project Partner");
  const [searchTerm, setSearchTerm] = useState("");

  // ── data state ──
  const [datas, setDatas] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState({});
  const [newSubscription, setNewSubscription] = useState({
    id: "",
    partnerType: "",
    planDuration: "",
    planName: "",
    totalPrice: "",
    features: "",
  });
  const [selectedImages, setSelectedImages] = useState({
    first: null,
    second: null,
    third: null,
  });

  // ── form UI state ──
  const [enabledFeats, setEnabledFeats] = useState(new Set());
  const [featSearch, setFeatSearch] = useState("");
  const [bannerPreview, setBannerPreview] = useState(null);

  // ──────────────────────────────────────────
  // helpers
  // ──────────────────────────────────────────
  const syncFeatsFromString = (str) => {
    const set = new Set(
      str
        ? str
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : [],
    );
    setEnabledFeats(set);
  };

  const toggleFeat = (name) => {
    setEnabledFeats((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      setNewSubscription((s) => ({
        ...s,
        features: Array.from(next).join(","),
      }));
      return next;
    });
  };

  const filteredCatalogue = Object.fromEntries(
    Object.entries(FEATURE_CATALOGUE)
      .map(([cat, feats]) => [
        cat,
        feats.filter((f) => f.toLowerCase().includes(featSearch.toLowerCase())),
      ])
      .filter(([, feats]) => feats.length > 0),
  );

  const resetForm = () => {
    setNewSubscription({
      id: "",
      partnerType: "",
      planDuration: "",
      planName: "",
      totalPrice: "",
      features: "",
    });
    setSelectedImages({ first: null, second: null, third: null });
    setEnabledFeats(new Set());
    setBannerPreview(null);
    setFeatSearch("");
  };

  // ── image handlers ──
  const handleImageChange = (event, key) => {
    const file = event.target.files[0];
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      alert("Only PNG, JPG and JPEG formats are allowed!");
      event.target.value = "";
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      alert("File size must be less than 1MB!");
      event.target.value = "";
      return;
    }
    setSelectedImages((prev) => ({ ...prev, [key]: file }));
    if (key === "first") setBannerPreview(URL.createObjectURL(file));
  };

  const removeImage = (key) => {
    setSelectedImages((prev) => ({ ...prev, [key]: null }));
    if (key === "first") setBannerPreview(null);
  };

  // ──────────────────────────────────────────
  // API CALLS
  // ──────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(URI + "/admin/subscription/pricing", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch Subscriptions.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdate = async (e) => {
    e.preventDefault();
    if (
      !newSubscription.partnerType ||
      !newSubscription.planDuration ||
      !newSubscription.planName ||
      !newSubscription.totalPrice ||
      !newSubscription.features
    ) {
      alert("Please fill all required fields!");
      return;
    }
    const endpoint = newSubscription.id ? `edit/${newSubscription.id}` : "add";
    const method = newSubscription.id ? "PUT" : "POST";
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("partnerType", newSubscription.partnerType);
      formData.append("planDuration", newSubscription.planDuration);
      formData.append("planName", newSubscription.planName);
      formData.append("totalPrice", newSubscription.totalPrice);
      formData.append("features", newSubscription.features);
      if (selectedImages.first)
        formData.append("firstImage", selectedImages.first);
      if (selectedImages.second)
        formData.append("secondImage", selectedImages.second);
      if (selectedImages.third)
        formData.append("thirdImage", selectedImages.third);
      const response = await fetch(
        `${URI}/admin/subscription/pricing/${endpoint}`,
        { method, credentials: "include", body: formData },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to save subscription.");
      if (newSubscription.id) alert("Subscription updated successfully!");
      else if (response.status === 202) alert("Subscription already exists!");
      else alert("Subscription added successfully!");
      resetForm();
      setPage("list");
      fetchData();
    } catch (err) {
      alert(err.message || "Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // BUG FIX: edit() now sets page to "edit"
  // and calls syncFeatsFromString so toggles
  // reflect the loaded features correctly.
  // ─────────────────────────────────────────
  const edit = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/subscription/pricing/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch Subscription.");
      const data = await response.json();
      setNewSubscription(data);
      // Sync feature toggles from the loaded features string
      syncFeatsFromString(data.features || "");
      // Reset banner preview — existing image shown from DB URL instead
      setBannerPreview(null);
      setSelectedImages({ first: null, second: null, third: null });
      // Navigate to edit page
      setPage("edit");
    } catch (err) {
      console.error("Error fetching for edit:", err);
    } finally {
      setLoading(false);
    }
  };

  const view = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/subscription/pricing/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch Subscription.");
      const data = await response.json();
      setSubscriptionPlan(data);
      setShowSubscriptionPlan(true);
    } catch (err) {
      console.error("Error fetching :", err);
    } finally {
      setLoading(false);
    }
  };

  const highlight = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to Highlight this Subscription Plan?",
      )
    )
      return;
    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/subscription/pricing/highlight/${id}`,
        { method: "PUT", credentials: "include" },
      );
      const data = await response.json();
      if (response.ok) alert(`Success: ${data.message}`);
      else alert(`Error: ${data.message}`);
      fetchData();
    } catch (error) {
      console.error("Error Highlighting :", error);
    } finally {
      setLoading(false);
    }
  };

  const status = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to change this Subscription status?",
      )
    )
      return;
    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/subscription/pricing/status/${id}`,
        { method: "PUT", credentials: "include" },
      );
      const data = await response.json();
      if (response.ok) alert(`Success: ${data.message}`);
      else alert(`Error: ${data.message}`);
      fetchData();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Subscription?"))
      return;
    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/subscription/pricing/delete/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await response.json();
      if (response.ok) {
        alert("Subscription deleted successfully!");
        fetchData();
      } else alert(`Error: ${data.message}`);
    } catch (error) {
      console.error("Error while deleting:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── filtered data ──
  const filteredData = datas.filter(
    (item) =>
      item.partnerType === activeTab &&
      (item.partnerType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // ── table custom styles ──
  const customStyles = {
    rows: {
      style: {
        padding: "6px 0",
        fontSize: "13px",
        fontWeight: 500,
        color: "#111827",
      },
    },
    headCells: {
      style: {
        fontSize: "11px",
        fontWeight: "600",
        backgroundColor: "#F9FAFB",
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      },
    },
    cells: { style: { fontSize: "13px", color: "#1F2937" } },
  };

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          <span
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer text-xs font-medium ${row.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}
          >
            {index + 1}
          </span>
          <div className="absolute w-[65px] text-center -top-10 left-7 -translate-x-1/2 px-2 py-1.5 rounded bg-black text-white text-xs hidden group-hover:block z-10 whitespace-nowrap">
            {row.status}
          </div>
        </div>
      ),
      width: "65px",
    },
    {
      name: "Partner Type",
      selector: (row) => row.partnerType,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Plan Name",
      cell: (row) => (
        <span
          className={`font-medium ${row.highlight === "True" ? "text-green-600" : "text-gray-800"}`}
        >
          {row.planName}
        </span>
      ),
      minWidth: "140px",
    },
    {
      name: "Duration",
      selector: (row) => row.planDuration,
      minWidth: "120px",
    },
    {
      name: "Total Price",
      cell: (row) => (
        <span className="font-semibold text-green-700">
          {formatINR(parseInt(row.totalPrice))}
        </span>
      ),
      minWidth: "140px",
    },
    {
      name: "Features",
      cell: (row) => (
        <span className="text-xs text-gray-500 line-clamp-2">
          {row.features}
        </span>
      ),
      minWidth: "260px",
    },
    {
      name: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
      minWidth: "100px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            title="View"
            onClick={() => view(row.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
          >
            <FiEye size={15} />
          </button>
          <button
            title="Edit"
            onClick={() => edit(row.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            title="Toggle Status"
            onClick={() => status(row.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
          >
            <FiToggleLeft size={15} />
          </button>
          <button
            title="Highlight"
            onClick={() => highlight(row.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <FiZap size={15} />
          </button>
          <button
            title="Delete"
            onClick={() => del(row.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      ),
      width: "180px",
    },
  ];

  const previewFeats = Array.from(enabledFeats);

  // ─────────────────────────────────────────────────────────────────
  // ADD / EDIT FORM PAGE
  // ─────────────────────────────────────────────────────────────────
  if (page === "add" || page === "edit") {
    return (
      // FIX: use `relative` + `pb-24` so the sticky footer doesn't overlap content
      <div className="relative w-full min-h-screen">
        {/* Scrollable content area with bottom padding for the fixed footer */}
        <div className="p-4 md:p-6 pb-28">
          {/* Back header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                resetForm();
                setPage("list");
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl px-2 py-2 hover:bg-gray-50 transition-colors"
            >
              <IoArrowBack size={16} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {page === "edit"
                  ? "Edit Subscription Plan"
                  : "Add Subscription Plan"}
              </h1>
              <p className="text-sm text-gray-500">
                {page === "edit"
                  ? "Update the plan details below."
                  : "Fill in the details to create a new plan."}
              </p>
            </div>
          </div>

          <form id="subscription-form" onSubmit={addOrUpdate}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ── Left column ── */}
              <div className="flex flex-col gap-5 col-span-2">
                {/* Basic Info */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    ℹ Basic Plan Info
                  </h3>
                  <input type="hidden" value={newSubscription.id || ""} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">
                        Partner Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newSubscription.partnerType}
                        onChange={(e) =>
                          setNewSubscription({
                            ...newSubscription,
                            partnerType: e.target.value,
                          })
                        }
                      >
                        <option value="" disabled>
                          Select partner type
                        </option>
                        <option value="Sales Partner">Sales Partner</option>
                        <option value="Project Partner">Project Partner</option>
                        <option value="Territory Partner">
                          Territory Partner
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">
                        Plan Duration <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newSubscription.planDuration}
                        onChange={(e) =>
                          setNewSubscription({
                            ...newSubscription,
                            planDuration: e.target.value,
                          })
                        }
                      >
                        <option value="" disabled>
                          Select duration
                        </option>
                        {[
                          "1 Month",
                          "2 Months",
                          "3 Months",
                          "4 Months",
                          "5 Months",
                          "6 Months",
                          "7 Months",
                          "8 Months",
                          "9 Months",
                          "10 Months",
                          "11 Months",
                          "12 Months",
                        ].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">
                        Plan Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Growth Pro"
                        className="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newSubscription.planName}
                        onChange={(e) =>
                          setNewSubscription({
                            ...newSubscription,
                            planName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">
                        Total Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        placeholder="0"
                        className="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newSubscription.totalPrice}
                        onChange={(e) =>
                          setNewSubscription({
                            ...newSubscription,
                            totalPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Feature Management */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      ☰ Feature Management
                      <span className="text-xs text-gray-400 font-normal">
                        Selected:{" "}
                        <span className="text-green-600 font-medium">
                          {enabledFeats.size}
                        </span>{" "}
                        / {ALL_FEATURES.length}
                      </span>
                    </h3>
                    <div className="flex gap-3 text-xs">
                      <button
                        type="button"
                        className="text-green-600 hover:underline"
                        onClick={() => {
                          setEnabledFeats(new Set(ALL_FEATURES));
                          setNewSubscription((s) => ({
                            ...s,
                            features: ALL_FEATURES.join(","),
                          }));
                        }}
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        className="text-gray-400 hover:underline"
                        onClick={() => {
                          setEnabledFeats(new Set());
                          setNewSubscription((s) => ({ ...s, features: "" }));
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Selected chips */}
                  {enabledFeats.size > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Array.from(enabledFeats).map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full"
                        >
                          {f.split(" ").slice(0, 2).join(" ")}
                          <button
                            type="button"
                            onClick={() => toggleFeat(f)}
                            className="ml-0.5 text-green-500 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative mb-3">
                    <CiSearch
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search features..."
                      className="w-full text-sm pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                      value={featSearch}
                      onChange={(e) => setFeatSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
                    {Object.entries(filteredCatalogue).map(([cat, feats]) => (
                      <div key={cat}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          {cat}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {feats.map((f) => (
                            <FeatureToggle
                              key={f}
                              name={f}
                              enabled={enabledFeats.has(f)}
                              onToggle={() => toggleFeat(f)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Textarea stays in sync */}
                  <div className="mt-4">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Or type comma-separated features{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Feature A, Feature B"
                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newSubscription.features}
                      onChange={(e) => {
                        setNewSubscription({
                          ...newSubscription,
                          features: e.target.value,
                        });
                        syncFeatsFromString(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* Banner Images */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-5">
                    🖼 Banner Images
                  </h3>
                  <div className="flex flex-col gap-5">
                    {[
                      {
                        key: "first",
                        label: "First Banner Image",
                        id: "firstImageUpload",
                      },
                      {
                        key: "second",
                        label: "Second Banner Image",
                        id: "secondImageUpload",
                      },
                      {
                        key: "third",
                        label: "Third Banner Image",
                        id: "thirdImageUpload",
                      },
                    ].map(({ key, label, id }) => (
                      <div key={key}>
                        <label className="text-xs text-gray-500 mb-2 block">
                          {label}
                        </label>
                        {/* Existing DB image */}
                        {newSubscription?.[`${key}Image`] && (
                          <img
                            src={URI + newSubscription[`${key}Image`]}
                            alt="existing"
                            className="w-24 h-14 object-cover rounded-lg border border-gray-200 mb-2"
                          />
                        )}
                        <label
                          htmlFor={id}
                          className="flex items-center justify-between border border-gray-300 rounded-lg cursor-pointer hover:border-green-400 transition-colors overflow-hidden"
                        >
                          <span className="px-4 py-2.5 text-sm text-gray-400">
                            Upload Image
                          </span>
                          <div className="flex items-center justify-center px-5 py-2.5 bg-gray-800 text-white text-sm">
                            Browse
                          </div>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => handleImageChange(e, key)}
                            className="hidden"
                            id={id}
                          />
                        </label>
                        {selectedImages[key] && (
                          <div className="relative mt-2 inline-block">
                            <img
                              src={URL.createObjectURL(selectedImages[key])}
                              alt="preview"
                              className="w-24 h-14 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(key)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="z-50 bg-white border rounded-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
                  <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
                    <Loader />
                    <div className="flex items-center gap-3 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setPage("list");
                        }}
                        className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="subscription-form"
                        className="px-7 py-2.5 text-sm bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl transition-colors"
                      >
                        {page === "edit" ? "Update Plan" : "Save Plan"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right column — Live Preview ── */}
              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                  Live Preview
                </p>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden sticky top-6">
                  <div
                    className="h-28 flex items-end p-4"
                    style={{
                      backgroundImage: bannerPreview
                        ? `url(${bannerPreview})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundColor: bannerPreview ? undefined : "#1a3c1a",
                    }}
                  >
                    <span className="bg-black/40 text-white text-xs px-2 py-0.5 rounded uppercase tracking-wide">
                      {newSubscription.partnerType || "Premium Plan"}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {newSubscription.planName || "Plan Name"}
                    </h3>
                    <div className="text-3xl font-bold text-green-700 mt-1">
                      {newSubscription.totalPrice
                        ? formatINR(Number(newSubscription.totalPrice))
                        : "₹0"}
                      <span className="text-sm font-normal text-gray-400">
                        {" "}
                        / {newSubscription.planDuration || "Monthly"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-5 mb-3 font-semibold">
                      What's Included
                    </p>
                    <ul className="flex flex-col gap-2">
                      {previewFeats.slice(0, 6).map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <span className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                            <svg
                              width="8"
                              height="8"
                              viewBox="0 0 8 8"
                              fill="none"
                            >
                              <path
                                d="M1 4l2 2 4-4"
                                stroke="#16a34a"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          {f}
                        </li>
                      ))}
                      {previewFeats.length > 6 && (
                        <li className="text-xs text-gray-400">
                          + {previewFeats.length - 6} more features
                        </li>
                      )}
                      {previewFeats.length === 0 && (
                        <li className="text-xs text-gray-400 italic">
                          No features selected yet
                        </li>
                      )}
                    </ul>
                    <button
                      type="button"
                      className="mt-5 w-full py-3 bg-green-700 text-white text-sm font-medium rounded-xl cursor-default"
                    >
                      Get Started Today
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // LIST PAGE
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Subscription Pricing
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and optimise your global subscription tiers and partner
            configurations.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors ${viewMode === "card" ? "bg-green-700 text-white border-green-700" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"}`}
          >
            <MdGridView size={15} /> Card View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors ${viewMode === "table" ? "bg-green-700 text-white border-green-700" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"}`}
          >
            <MdTableRows size={15} /> Table View
          </button>
        </div>
      </div>

      {/* Tabs + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {PARTNER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? "border-green-600 text-green-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-xl text-gray-600 bg-white hover:bg-gray-50">
            <FiFilter size={14} /> Filters
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-xl text-gray-600 bg-white hover:bg-gray-50">
            <FiDownload size={14} /> Export
          </button>
          <button
            onClick={() => {
              resetForm();
              setPage("add");
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl transition-colors"
          >
            <FiPlus size={15} /> Add Plan
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full max-w-xs">
        <CiSearch size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search plans..."
          className="bg-transparent text-sm text-gray-700 outline-none w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredData.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-16 text-sm">
              No plans found for this partner type.
            </div>
          ) : (
            filteredData.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onView={view}
                onEdit={edit}
                onStatus={status}
                onHighlight={highlight}
                onDelete={del}
              />
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">
              Subscription Pricing List
            </h2>
          </div>
          <div className="overflow-x-auto">
            <DataTable
              customStyles={customStyles}
              columns={columns}
              data={filteredData}
              fixedHeader
              fixedHeaderScrollHeight="60vh"
              pagination
              paginationPerPage={15}
              paginationComponentOptions={{
                rowsPerPageText: "Rows per page:",
                rangeSeparatorText: "of",
                selectAllRowsItem: true,
                selectAllRowsItemText: "All",
              }}
            />
          </div>
        </div>
      )}

      {/* Recent compact table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Recent Subscriptions — Compact Table
          </h2>
          <button
            onClick={() => setViewMode("table")}
            className="text-sm text-green-600 font-medium hover:underline"
          >
            View All Records
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Plan Name", "Price", "Partner Type", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left pb-3 text-xs text-gray-400 uppercase tracking-wide font-semibold"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {datas.slice(0, 5).map((plan) => (
              <tr
                key={plan.id}
                className="border-b border-gray-50 last:border-0"
              >
                <td className="py-3 font-medium text-gray-800">
                  {plan.planName}
                </td>
                <td className="py-3 text-green-700 font-semibold">
                  {formatINR(parseInt(plan.totalPrice))}/mo
                </td>
                <td className="py-3">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                    {plan.partnerType}
                  </span>
                </td>
                <td className="py-3">
                  <StatusBadge status={plan.status} />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    <button
                      title="View"
                      onClick={() => view(plan.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <FiEye size={14} />
                    </button>
                    <button
                      title="Edit"
                      onClick={() => edit(plan.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => del(plan.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ════════════════════════════════
          VIEW PLAN MODAL
      ════════════════════════════════ */}
      <div
        className={`${showSubscriptionPlan ? "flex" : "hidden"} fixed inset-0 z-[61] bg-black/50 items-end md:items-center justify-center`}
      >
        <div className="w-full md:w-[600px] max-h-[80vh] overflow-y-auto bg-white rounded-t-2xl md:rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Plan Details
            </h2>
            <button
              onClick={() => setShowSubscriptionPlan(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <IoMdClose size={22} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              ["Status", <StatusBadge status={subscriptionPlan.status} />],
              ["Partner Type", subscriptionPlan.partnerType],
              ["Plan Name", subscriptionPlan.planName],
              ["Duration", subscriptionPlan.planDuration],
              [
                "Total Price",
                subscriptionPlan.totalPrice
                  ? formatINR(parseInt(subscriptionPlan.totalPrice))
                  : "—",
              ],
              [
                "Highlighted",
                subscriptionPlan.highlight === "True" ? "Yes" : "No",
              ],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <div className="text-sm font-medium text-gray-800">{val}</div>
              </div>
            ))}
          </div>

          {/* Banner images */}
          {(subscriptionPlan.firstImage ||
            subscriptionPlan.secondImage ||
            subscriptionPlan.thirdImage) && (
            <div className="mb-5">
              <p className="text-xs text-gray-400 mb-2">Banner Images</p>
              <div className="flex gap-3">
                {["firstImage", "secondImage", "thirdImage"].map((imgKey) =>
                  subscriptionPlan[imgKey] ? (
                    <img
                      key={imgKey}
                      src={URI + subscriptionPlan[imgKey]}
                      onClick={() =>
                        window.open(URI + subscriptionPlan[imgKey], "_blank")
                      }
                      className="w-24 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      alt="banner"
                    />
                  ) : null,
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 mb-2">Features</p>
            <ul className="space-y-2">
              {subscriptionPlan.features?.split(",").map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  {feature.trim()}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowSubscriptionPlan(false)}
              className="px-5 py-2 text-sm bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
