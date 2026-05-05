import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";

// ─────────────────────────────────────────────
// Inline Loader — shown only when loading=true
// Does NOT rely on global setLoading from context
// ─────────────────────────────────────────────
const InlineLoader = ({ show }) => {
  if (!show) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <svg
        className="animate-spin w-4 h-4 text-green-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span>Please wait...</span>
    </div>
  );
};

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
      className={`w-1.5 h-1.5 rounded-full ${
        status === "Active" ? "bg-green-500" : "bg-gray-400"
      }`}
    />
    {status}
  </span>
);

// ─────────────────────────────────────────────
// Action Dropdown for table rows
// ─────────────────────────────────────────────
const ActionDropdown = ({ row, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Visible button */}
      <div
        className="flex items-center justify-between px-2 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer min-w-[90px]"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="text-xs text-gray-600">Action</span>
        <FiMoreVertical className="text-gray-500" size={13} />
      </div>

      {/* Transparent select on top for native behaviour fallback */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[130px] py-1">
            <button
              onClick={() => { onView(row.id); setOpen(false); }}
              className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FiEye size={13} /> View
            </button>
            <button
              onClick={() => { onEdit(row); setOpen(false); }}
              className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FiEdit2 size={13} /> Edit
            </button>
            <button
              onClick={() => { onDelete(row.id); setOpen(false); }}
              className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              <FiTrash2 size={13} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Add / Edit Popup Modal
// ─────────────────────────────────────────────
const FeatureFormPopup = ({ show, onClose, onSubmit, initial, loading }) => {
  const [form, setForm] = useState({
    id: "", name: "", description: "", status: "Active",
  });

  // Sync form when editing
  useEffect(() => {
    if (initial) {
      setForm({
        id:          initial.id          || "",
        name:        initial.name        || "",
        description: initial.description || "",
        status:      initial.status      || "Active",
      });
    } else {
      setForm({ id: "", name: "", description: "", status: "Active" });
    }
  }, [initial, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Feature name is required!");
      return;
    }
    onSubmit(form);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[61] bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {form.id ? "Edit Feature" : "Add Feature"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Feature Name */}
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1.5">
              Feature Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Real-time Dashboards"
              className="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Short description of this feature..."
              className="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1.5">
              Status
            </label>
            <select
              className="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 mt-1">
            <InlineLoader show={loading} />
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : form.id ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// View Details Popup
// ─────────────────────────────────────────────
const ViewPopup = ({ show, feature, onClose, onEdit }) => {
  if (!show || !feature) return null;

  return (
    <div className="fixed inset-0 z-[61] bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Feature Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Feature Name</p>
              <p className="text-sm font-medium text-gray-800">{feature.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <StatusBadge status={feature.status} />
            </div>
          </div>

          {feature.description && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{feature.description}</p>
            </div>
          )}

          {/* Preview as checklist item */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
              Appears in plan as
            </p>
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-gray-700">{feature.name}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => { onClose(); onEdit(feature); }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const SubscriptionFeatures = () => {
  const { URI } = useAuth(); // ← only pull URI, do NOT pull setLoading

  // ── Data ──
  const [datas, setDatas]           = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Local loading state (fixes loader running all the time) ──
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // ── Popup states ──
  const [showForm, setShowForm]         = useState(false);
  const [editingFeature, setEditingFeature] = useState(null); // null = add, object = edit
  const [viewFeature, setViewFeature]   = useState(null);
  const [showView, setShowView]         = useState(false);

  // ──────────────────────────────────────────
  // Open helpers
  // ──────────────────────────────────────────
  const openAdd = () => {
    setEditingFeature(null);
    setShowForm(true);
  };

  const openEdit = (feature) => {
    setEditingFeature(feature);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingFeature(null);
  };

  // ──────────────────────────────────────────
  // API CALLS
  // ──────────────────────────────────────────

  // Fetch all features
  const fetchData = async () => {
    setFetching(true);
    try {
      const response = await fetch(URI + "/admin/subscription/features", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch features.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching features:", err);
    } finally {
      setFetching(false);
    }
  };

  // Add or Update
  const handleSubmit = async (form) => {
    const isEdit   = !!form.id;
    const endpoint = isEdit ? `edit/${form.id}` : "add";
    const method   = isEdit ? "PUT" : "POST";

    setLoading(true);
    try {
      const response = await fetch(
        `${URI}/admin/subscription/features/${endpoint}`,
        {
          method,
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:        form.name.trim(),
            description: form.description.trim(),
            status:      form.status,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save feature.");

      if (isEdit)                  alert("Feature updated successfully!");
      else if (response.status === 202) alert("Feature already exists!");
      else                         alert("Feature added successfully!");

      closeForm();
      fetchData();
    } catch (err) {
      console.error("Error saving feature:", err);
      alert(err.message || "Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  // View single feature
  const view = async (id) => {
    try {
      const response = await fetch(URI + `/admin/subscription/features/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch feature.");
      const data = await response.json();
      setViewFeature(data);
      setShowView(true);
    } catch (err) {
      console.error("Error fetching feature:", err);
    }
  };

  // Delete
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feature?")) return;
    try {
      const response = await fetch(
        URI + `/admin/subscription/features/delete/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Feature deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Filtered data ──
  const filteredData = datas.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Table styles ──
  const customStyles = {
    rows: {
      style: {
        padding: "5px 0",
        fontSize: "14px",
        fontWeight: 500,
        color: "#111827",
      },
    },
    headCells: {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 10,
        fontSize: "14px",
        fontWeight: "600",
        backgroundColor: "#F9FAFB",
        color: "#374151",
      },
    },
    cells: {
      style: { fontSize: "13px", color: "#1F2937" },
    },
  };

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          <span
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer text-xs font-medium ${
              row.status === "Active"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-500"
            }`}
          >
            {index + 1}
          </span>
          <div className="absolute w-[65px] text-center -top-10 left-7 -translate-x-1/2 px-2 py-1.5 rounded bg-black text-white text-xs hidden group-hover:block z-10 whitespace-nowrap">
            {row.status}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Feature Name",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          {row.description && (
            <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
              {row.description}
            </div>
          )}
        </div>
      ),
      minWidth: "220px",
    },
    {
      name: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
      minWidth: "120px",
    },
    {
      name: "Action",
      cell: (row) => (
        <ActionDropdown
          row={row}
          onView={view}
          onEdit={openEdit}
          onDelete={del}
        />
      ),
      width: "130px",
    },
  ];

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="Subscription overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">

        {/* Search + Add button row */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Feature"
              className="w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full lg:w-auto flex justify-end">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#076300] hover:bg-green-800 text-white font-medium rounded-lg transition-colors active:scale-[0.98]"
            >
              <FiPlus size={15} />
              Add Feature
            </button>
          </div>
        </div>

        {/* Table heading */}
        <h2 className="text-[16px] font-semibold">Subscription Features List</h2>

        {/* Table */}
        <div className="overflow-scroll scrollbar-hide">
          {fetching ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-500 text-sm">
              <svg
                className="animate-spin w-5 h-5 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Loading features...
            </div>
          ) : (
            <DataTable
              className="scrollbar-hide"
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
              noDataComponent={
                <div className="py-12 text-gray-400 text-sm">
                  No features found.
                </div>
              }
            />
          )}
        </div>
      </div>

      {/* Add / Edit Popup */}
      <FeatureFormPopup
        show={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initial={editingFeature}
        loading={loading}
      />

      {/* View Popup */}
      <ViewPopup
        show={showView}
        feature={viewFeature}
        onClose={() => { setShowView(false); setViewFeature(null); }}
        onEdit={openEdit}
      />
    </div>
  );
};

export default SubscriptionFeatures;