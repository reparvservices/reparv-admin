import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiLayers,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";

const InlineLoader = ({ show, label = "Please wait…" }) => {
  if (!show) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <svg
        className="animate-spin w-4 h-4 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const active = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        active ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      {status || "—"}
    </span>
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
      role="status"
    >
      <p className="leading-snug pr-2">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-current opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <IoMdClose size={18} />
        </button>
      )}
    </div>
  );
};

const ACTION_MENU_MIN_W = 168;
const ACTION_MENU_EST_H = 136;

const ActionDropdown = ({ row, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const close = useCallback(() => setOpen(false), []);

  const computePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuH = menuRef.current?.offsetHeight ?? ACTION_MENU_EST_H;
    const menuW = Math.max(
      menuRef.current?.offsetWidth ?? ACTION_MENU_MIN_W,
      ACTION_MENU_MIN_W,
    );
    const pad = 8;
    const spaceBelow = window.innerHeight - rect.bottom - pad;
    const openUp = spaceBelow < menuH && rect.top - pad > menuH;
    const top = openUp ? rect.top - menuH - 4 : rect.bottom + 4;
    let left = rect.right - menuW;
    left = Math.max(pad, Math.min(left, window.innerWidth - menuW - pad));
    setCoords({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    computePosition();
    const t = window.setTimeout(() => computePosition(), 0);
    window.addEventListener("scroll", computePosition, true);
    window.addEventListener("resize", computePosition);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", computePosition, true);
      window.removeEventListener("resize", computePosition);
    };
  }, [open, computePosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const menuPortal =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[1000] cursor-default bg-transparent"
          aria-label="Close menu"
          onClick={close}
        />
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-[1001] bg-white border border-gray-200 rounded-xl shadow-xl min-w-[168px] py-1 overflow-hidden"
          style={{ top: coords.top, left: coords.left }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onView(row.id);
              close();
            }}
            className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiEye size={14} /> View
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onEdit(row);
              close();
            }}
            className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiEdit2 size={14} /> Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDelete(row);
              close();
            }}
            className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <FiTrash2 size={14} /> Delete
          </button>
        </div>
      </>,
      document.body,
    );

  return (
    <div className="relative inline-block text-left">
      <button
        ref={anchorRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-xs text-gray-700 hover:bg-gray-50 min-w-[96px]"
        onClick={() => setOpen((p) => !p)}
      >
        Actions
        <FiMoreVertical className="text-gray-500" size={14} />
      </button>
      {menuPortal}
    </div>
  );
};

const FeatureFormModal = ({
  show,
  onClose,
  onSubmit,
  initial,
  loading,
  errorMessage,
  onDismissError,
}) => {
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    status: "Active",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id ?? "",
        name: initial.name ?? "",
        description: initial.description ?? "",
        status: initial.status ?? "Active",
      });
    } else {
      setForm({ id: "", name: "", description: "", status: "Active" });
    }
  }, [initial, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2
            id="feature-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {form.id ? "Edit feature" : "New subscription feature"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <IoMdClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Banner
            type="error"
            message={errorMessage}
            onDismiss={onDismissError}
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Feature name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. Advanced analytics"
              className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#076300]/30 focus:border-[#076300]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="What this feature includes (shown in admin & plan mapping context)."
              className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#076300]/30 focus:border-[#076300]"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Status
            </label>
            <select
              className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#076300]/30 focus:border-[#076300]"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <InlineLoader show={loading} label="Saving…" />
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium rounded-xl text-white bg-[#076300] hover:bg-[#065000] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Saving…" : form.id ? "Update feature" : "Create feature"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewModal = ({ show, feature, onClose, onEdit }) => {
  if (!show || !feature) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Feature details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <IoMdClose size={22} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Name
              </p>
              <p className="text-base font-semibold text-gray-900 mt-0.5">
                {feature.name}
              </p>
            </div>
            <StatusBadge status={feature.status} />
          </div>
          {feature.description ? (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                Description
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {feature.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No description</p>
          )}
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs text-gray-500 font-medium mb-2">
              Plan checklist preview
            </p>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-emerald-600 shrink-0" size={18} />
              <span className="text-sm text-gray-800">{feature.name}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(feature);
              }}
              className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-[#076300] hover:bg-[#065000]"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ show, feature, onClose, onConfirm, loading }) => {
  if (!show || !feature) return null;
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900">Delete feature?</h3>
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-medium text-gray-800">{feature.name}</span> will
          be removed. Plan–feature mappings for this item are also deleted on the
          server.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SubscriptionFeatures = () => {
  const { URI } = useAuth();

  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [banner, setBanner] = useState({ type: "", message: "" });

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [editing, setEditing] = useState(null);
  const [viewFeature, setViewFeature] = useState(null);
  const [showView, setShowView] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const base = useMemo(
    () => `${URI}/admin/subscription/features`,
    [URI],
  );

  const showBanner = useCallback((type, message) => {
    setBanner({ type, message });
    if (type === "success" && message) {
      window.setTimeout(() => setBanner({ type: "", message: "" }), 4500);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(base, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to load features");
      }
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showBanner("error", e.message || "Could not load features.");
      setRows([]);
    } finally {
      setFetching(false);
    }
  }, [base, showBanner]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        String(item.status || "")
          .toLowerCase()
          .includes(q),
    );
  }, [rows, searchTerm]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.status === "Active").length;
    return { total, active, inactive: total - active };
  }, [rows]);

  const openAdd = () => {
    setEditing(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (feature) => {
    setEditing(feature);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setFormError("");
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (form) => {
    const isEdit = Boolean(form.id);
    const url = isEdit ? `${base}/edit/${form.id}` : `${base}/add`;
    const method = isEdit ? "PUT" : "POST";

    setSaving(true);
    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          status: form.status,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        const msg = data.message || "A feature with this name already exists.";
        if (showForm) setFormError(msg);
        else showBanner("error", msg);
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || "Save failed");
      }
      showBanner(
        "success",
        isEdit ? "Feature updated successfully." : "Feature created successfully.",
      );
      closeForm();
      await fetchData();
    } catch (e) {
      console.error(e);
      const msg = e.message || "Something went wrong while saving.";
      if (showForm) setFormError(msg);
      else showBanner("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const viewById = async (id) => {
    try {
      const res = await fetch(`${base}/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to load feature");
      }
      setViewFeature(data);
      setShowView(true);
    } catch (e) {
      console.error(e);
      showBanner("error", e.message || "Could not open feature.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`${base}/delete/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }
      showBanner("success", "Feature deleted.");
      setDeleteTarget(null);
      await fetchData();
    } catch (e) {
      console.error(e);
      showBanner("error", e.message || "Could not delete feature.");
    } finally {
      setDeleting(false);
    }
  };

  const customStyles = {
    headCells: {
      style: {
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "#6b7280",
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        color: "#111827",
        borderBottom: "1px solid #f3f4f6",
        minHeight: "56px",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
  };

  const columns = [
    {
      name: "#",
      width: "64px",
      cell: (_, index) => (
        <span className="text-xs font-medium text-gray-500 tabular-nums">
          {index + 1}
        </span>
      ),
    },
    {
      name: "Feature",
      minWidth: "260px",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          {row.description && (
            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-xl">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Status",
      width: "130px",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      name: "",
      width: "120px",
      right: true,
      cell: (row) => (
        <ActionDropdown
          row={row}
          onView={viewById}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f3f4f6]">
      <div className="flex-1 px-4 md:px-6 py-6 max-w-[1400px] mx-auto w-full">
        <div className="rounded-3xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
          {/* Hero */}
          <div className="relative px-6 md:px-8 pt-8 pb-6 md:pb-8 bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
            <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex gap-4">
                <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-white/15 backdrop-blur items-center justify-center border border-white/20">
                  <FiLayers size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    Subscription catalogue
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                    Subscription features
                  </h1>
                  <p className="text-white/85 text-sm mt-2 max-w-xl leading-relaxed">
                    Define reusable features you can attach to plans via plan–feature
                    mapping. Active items are ready to include in subscription
                    offerings.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fetchData()}
                  disabled={fetching}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/25 text-white disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={fetching ? "animate-spin" : ""}
                    size={16}
                  />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={openAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-[#076300] hover:bg-gray-100 shadow-md"
                >
                  <FiPlus size={18} />
                  Add feature
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
              {[
                { label: "Total features", value: stats.total },
                { label: "Active", value: stats.active },
                { label: "Inactive", value: stats.inactive },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 px-4 py-3"
                >
                  <p className="text-xs text-white/75 font-medium uppercase tracking-wide">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold tabular-nums mt-1">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 md:px-8 py-6 space-y-4">
            <Banner
              type={banner.type}
              message={banner.message}
              onDismiss={() => setBanner({ type: "", message: "" })}
            />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex w-full md:max-w-md items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2">
                <CiSearch className="text-gray-400 shrink-0" size={20} />
                <input
                  type="search"
                  placeholder="Search by name, description, or status…"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none min-w-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 md:text-right">
                API: <code className="text-gray-700">{`/admin/subscription/features`}</code>
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
              {fetching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
                  <svg
                    className="animate-spin w-8 h-8 text-[#076300]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span className="text-sm">Loading features…</span>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filtered}
                  customStyles={customStyles}
                  fixedHeader
                  fixedHeaderScrollHeight="520px"
                  pagination
                  paginationPerPage={12}
                  paginationRowsPerPageOptions={[10, 12, 25, 50]}
                  highlightOnHover
                  pointerOnHover
                  noDataComponent={
                    <div className="py-16 text-center">
                      <FiLayers className="mx-auto text-gray-300 mb-3" size={40} />
                      <p className="text-gray-600 font-medium">No features yet</p>
                      <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                        Create your first feature to use it when mapping subscription
                        plans.
                      </p>
                      <button
                        type="button"
                        onClick={openAdd}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white bg-[#076300] hover:bg-[#065000]"
                      >
                        <FiPlus size={16} /> Add feature
                      </button>
                    </div>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <FeatureFormModal
        show={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initial={editing}
        loading={saving}
        errorMessage={formError}
        onDismissError={() => setFormError("")}
      />

      <ViewModal
        show={showView}
        feature={viewFeature}
        onClose={() => {
          setShowView(false);
          setViewFeature(null);
        }}
        onEdit={openEdit}
      />

      <DeleteConfirmModal
        show={Boolean(deleteTarget)}
        feature={deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default SubscriptionFeatures;
