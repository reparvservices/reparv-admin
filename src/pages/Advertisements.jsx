import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { FiMoreVertical } from "react-icons/fi";
import { useAuth } from "../store/auth";
import AddButton from "../components/AddButton";

// Real-estate advertisements (furniture, interiors, home loans, ...) shown on
// the website home page below "Verified Rental Properties".

const EMPTY_FORM = {
  id: null,
  title: "",
  advertiserName: "",
  category: "",
  description: "",
  ctaLabel: "",
  targetUrl: "",
  contactPhone: "",
  city: "Nagpur",
  displayOrder: 0,
  startDate: "",
  endDate: "",
  imageUrl: "",
};

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const STATE_STYLES = {
  Live: "bg-[#EAFBF1] text-[#0BB501]",
  Scheduled: "bg-[#EEF4FF] text-[#2F5BEA]",
  Expired: "bg-[#FFF4E5] text-[#B45309]",
  Inactive: "bg-[#FFEAEA] text-[#ff2323]",
};

const inputClass =
  "w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm leading-4 text-[#00000066] font-medium";

const formatDate = (d) =>
  d
    ? new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

const Advertisements = () => {
  const { URI, setLoading } = useAuth();
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : form.imageUrl),
    [imageFile, form.imageUrl],
  );
  useEffect(
    () => () => {
      if (imageFile && previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [imageFile, previewUrl],
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${URI}/admin/advertisements`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch advertisements.");
      setData(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${URI}/admin/advertisements/categories`, {
        credentials: "include",
      });
      if (response.ok) setCategories(await response.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const openForm = (open) => {
    if (open) {
      setForm(EMPTY_FORM);
      setImageFile(null);
      setFormError("");
    }
    setShowForm(open);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setFormError("");
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setFormError("Only JPG, PNG and WEBP images are allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Image must be 2MB or smaller.");
      return;
    }
    setFormError("");
    setImageFile(file);
  };

  const save = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.targetUrl.trim() && !form.contactPhone.trim()) {
      setFormError("Add a website link or a contact number.");
      return;
    }
    if (!form.id && !imageFile) {
      setFormError("Please upload the advertisement image.");
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setFormError("End date cannot be before the start date.");
      return;
    }

    const body = new FormData();
    [
      "title",
      "advertiserName",
      "category",
      "description",
      "ctaLabel",
      "targetUrl",
      "contactPhone",
      "city",
      "displayOrder",
      "startDate",
      "endDate",
    ].forEach((key) => body.append(key, form[key] ?? ""));
    if (imageFile) body.append("image", imageFile);

    setSaving(true);
    try {
      const response = await fetch(
        `${URI}/admin/advertisements/${form.id ? `edit/${form.id}` : "add"}`,
        {
          method: form.id ? "PUT" : "POST",
          credentials: "include",
          body,
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFormError(result.message || "Could not save the advertisement.");
        return;
      }
      alert(result.message);
      closeForm();
      fetchData();
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const edit = async (id) => {
    try {
      const response = await fetch(`${URI}/admin/advertisements/${id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch advertisement.");
      const ad = await response.json();
      setForm({
        ...EMPTY_FORM,
        ...Object.fromEntries(
          Object.entries(ad).map(([k, v]) => [k, v ?? ""]),
        ),
      });
      setImageFile(null);
      setFormError("");
      setShowForm(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (id) => {
    if (!window.confirm("Change this advertisement's status?")) return;
    try {
      const response = await fetch(`${URI}/admin/advertisements/status/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      const result = await response.json();
      alert(result.message);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this advertisement? This cannot be undone."))
      return;
    try {
      const response = await fetch(`${URI}/admin/advertisements/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      alert(result.message);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredData = data.filter((item) => {
    const q = searchTerm.toLowerCase();
    return [item.title, item.advertiserName, item.category, item.city, item.liveState]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q));
  });

  const ActionDropdown = ({ row }) => (
    <div className="relative inline-block w-[120px]">
      <div className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer">
        <span className="text-[12px]">Action</span>
        <FiMoreVertical className="text-gray-500" />
      </div>
      <select
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        value=""
        onChange={(e) => {
          const action = e.target.value;
          if (action === "status") toggleStatus(row.id);
          if (action === "update") edit(row.id);
          if (action === "delete") del(row.id);
        }}
      >
        <option value="" disabled>
          Select Action
        </option>
        <option value="status">
          {row.status === "Active" ? "Deactivate" : "Activate"}
        </option>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
      </select>
    </div>
  );

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <span
          className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md ${
            row.status === "Active"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : "bg-[#FFEAEA] text-[#ff2323]"
          }`}
        >
          {index + 1}
        </span>
      ),
      width: "60px",
    },
    {
      name: "Image",
      cell: (row) => (
        <img
          src={row.imageUrl}
          alt={row.title}
          className="w-[110px] h-[58px] object-cover rounded-md border border-gray-200 my-2"
        />
      ),
      width: "130px",
    },
    {
      name: "Advertisement",
      cell: (row) => (
        <div className="flex flex-col gap-1 py-2">
          <span className="font-semibold">{row.title}</span>
          <span className="text-xs text-gray-500">{row.advertiserName}</span>
        </div>
      ),
      sortable: true,
      selector: (row) => row.title,
      minWidth: "180px",
    },
    {
      name: "Category",
      cell: (row) => <span className="whitespace-normal">{row.category}</span>,
      selector: (row) => row.category,
      sortable: true,
      width: "130px",
    },
    {
      name: "City",
      selector: (row) => row.city || "All cities",
      sortable: true,
      width: "110px",
    },
    {
      name: "Status / Schedule",
      cell: (row) => (
        <div className="flex flex-col items-start gap-1 py-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${
              STATE_STYLES[row.liveState] || ""
            }`}
          >
            {row.liveState}
          </span>
          <span className="text-[11px] text-gray-500">
            {row.startDate || row.endDate
              ? `${formatDate(row.startDate) || "Now"} – ${formatDate(row.endDate) || "No end"}`
              : "Always"}
          </span>
        </div>
      ),
      sortable: true,
      selector: (row) => row.liveState,
      width: "160px",
    },
    {
      name: "Order",
      selector: (row) => row.displayOrder,
      sortable: true,
      width: "95px",
    },
    {
      name: "Clicks",
      selector: (row) => row.clicks,
      sortable: true,
      width: "95px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "140px",
    },
  ];

  const customStyles = {
    rows: { style: { fontSize: "14px", fontWeight: 500, color: "#111827" } },
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "600",
        backgroundColor: "#F9FAFB",
        color: "#374151",
      },
    },
    cells: { style: { fontSize: "13px", color: "#1F2937" } },
  };

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="flex w-full h-[80vh] flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        <p className="block md:hidden text-lg font-semibold">Advertisements</p>
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="w-full lg:w-[30%] min-w-[150px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search title, advertiser, category"
              className="w-full h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <AddButton label={"Add Advertisement"} func={openForm} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-[16px] font-semibold">Advertisement List</h2>
          <p className="text-xs text-gray-500">
            Live ads appear on the website home page below "Verified Rental
            Properties", sorted by Order (lowest first).
          </p>
        </div>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            customStyles={customStyles}
            columns={columns}
            data={filteredData}
            fixedHeader
            fixedHeaderScrollHeight="60vh"
            pagination
            paginationPerPage={15}
            noDataComponent={
              <p className="py-10 text-gray-500">
                No advertisements yet. Click "Add Advertisement" to create one.
              </p>
            }
          />
        </div>
      </div>

      {showForm && (
        <div className="z-[61] w-full flex fixed inset-0 items-end md:items-center justify-center bg-black/30">
          <div className="w-full md:w-[640px] max-h-[85vh] overflow-scroll scrollbar-hide bg-white py-6 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold">
                {form.id ? "Update Advertisement" : "Add Advertisement"}
              </h2>
              <IoMdClose onClick={closeForm} className="w-6 h-6 cursor-pointer" />
            </div>

            <form onSubmit={save} className="w-full grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Title *</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Flat 40% off on sofa sets"
                  className={inputClass}
                  value={form.title}
                  onChange={setField("title")}
                />
              </div>
              <div>
                <label className={labelClass}>Advertiser / Brand Name *</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Nagpur Furniture House"
                  className={inputClass}
                  value={form.advertiserName}
                  onChange={setField("advertiserName")}
                />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  required
                  className={inputClass}
                  value={form.category}
                  onChange={setField("category")}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Short Description (optional)</label>
                <textarea
                  rows={2}
                  maxLength={300}
                  placeholder="One or two lines about the offer"
                  className={inputClass}
                  value={form.description}
                  onChange={setField("description")}
                />
              </div>
              <div>
                <label className={labelClass}>Website Link</label>
                <input
                  type="url"
                  maxLength={500}
                  placeholder="https://..."
                  className={inputClass}
                  value={form.targetUrl}
                  onChange={setField("targetUrl")}
                />
              </div>
              <div>
                <label className={labelClass}>Contact Number</label>
                <input
                  type="tel"
                  maxLength={15}
                  placeholder="10 digit mobile number"
                  className={inputClass}
                  value={form.contactPhone}
                  onChange={setField("contactPhone")}
                />
              </div>
              <div>
                <label className={labelClass}>Button Text (optional)</label>
                <input
                  type="text"
                  maxLength={40}
                  placeholder="Shop Now / Get Quote / Call Now"
                  className={inputClass}
                  value={form.ctaLabel}
                  onChange={setField("ctaLabel")}
                />
              </div>
              <div>
                <label className={labelClass}>City (empty = all cities)</label>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="All cities"
                  className={inputClass}
                  value={form.city}
                  onChange={setField("city")}
                />
              </div>
              <div>
                <label className={labelClass}>Start Date (optional)</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.startDate}
                  onChange={setField("startDate")}
                />
              </div>
              <div>
                <label className={labelClass}>End Date (optional)</label>
                <input
                  type="date"
                  min={form.startDate || undefined}
                  className={inputClass}
                  value={form.endDate}
                  onChange={setField("endDate")}
                />
              </div>
              <div>
                <label className={labelClass}>Display Order</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.displayOrder}
                  onChange={setField("displayOrder")}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`${labelClass} mb-2`}>
                  Advertisement Image * (JPG/PNG/WEBP, max 2MB, best at 1200 × 630)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onImageChange}
                  className="hidden"
                  id="adImageUpload"
                />
                <label
                  htmlFor="adImageUpload"
                  className="flex items-center justify-between border border-gray-300 rounded cursor-pointer mt-2"
                >
                  <span className="m-3 p-1 text-[15px] font-medium text-[#00000066] truncate">
                    {imageFile ? imageFile.name : form.imageUrl ? "Replace image" : "Upload image"}
                  </span>
                  <div className="flex items-center justify-center w-[107px] p-4 rounded-r bg-[#000000B2] text-white">
                    Browse
                  </div>
                </label>
                {previewUrl && (
                  <div className="relative mt-3">
                    <img
                      src={previewUrl}
                      alt="Advertisement preview"
                      className="w-full aspect-[1200/630] object-cover rounded-lg border border-gray-300"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

              {formError && (
                <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {formError}
                </p>
              )}

              <div className="sm:col-span-2 flex items-center justify-center gap-4 mt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98] disabled:opacity-60"
                >
                  {saving ? "Saving..." : form.id ? "Update Advertisement" : "Add Advertisement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advertisements;
