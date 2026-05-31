import { useCallback, useEffect, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FiRefreshCw } from "react-icons/fi";
import DataTable from "react-data-table-component";
import { format } from "date-fns";
import { useAuth } from "../store/auth";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "whatsapp_sent", label: "WhatsApp sent" },
  { value: "registered", label: "Registered" },
];

const STATUS_STYLES = {
  registered: "bg-emerald-50 text-emerald-700",
  whatsapp_sent: "bg-blue-50 text-blue-700",
  verified: "bg-amber-50 text-amber-700",
  pending: "bg-gray-100 text-gray-600",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMM yyyy, hh:mm a");
  } catch {
    return String(value);
  }
}

function formatStatus(status) {
  return String(status || "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const customStyles = {
  rows: {
    style: {
      padding: "5px 0px",
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
    style: {
      fontSize: "13px",
      color: "#1F2937",
    },
  },
};

const PartnerLeads = () => {
  const { URI, setLoading } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [listError, setListError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        status: statusFilter,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const response = await fetch(`${URI}/admin/partner-join-leads?${params}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Failed to fetch partner leads.");
      }

      const data = await response.json();
      setRows(data.rows || []);
      setTotal(data.total || 0);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setListError(err.message || "Could not load partner leads.");
    } finally {
      setLoading(false);
    }
  }, [URI, page, perPage, debouncedSearch, statusFilter, setLoading]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const tableData = useMemo(
    () =>
      rows.map((row) => ({
        id: row.id,
        name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
        contact: row.contact,
        status: row.status,
        source: row.source,
        otpVerifiedAt: row.otp_verified_at,
        whatsappSentAt: row.whatsapp_sent_at,
        registeredAt: row.registered_at,
        createdAt: row.created_at,
      })),
    [rows],
  );

  const columns = [
    {
      name: "SN",
      cell: (_row, index) => (page - 1) * perPage + index + 1,
      width: "60px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Contact",
      selector: (row) => `+91 ${row.contact}`,
      minWidth: "130px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            STATUS_STYLES[row.status] || STATUS_STYLES.pending
          }`}
        >
          {formatStatus(row.status)}
        </span>
      ),
      minWidth: "130px",
    },
    {
      name: "Source",
      selector: (row) => row.source?.replace(/_/g, " ") || "—",
      minWidth: "140px",
    },
    {
      name: "OTP Verified",
      selector: (row) => formatDate(row.otpVerifiedAt),
      minWidth: "170px",
    },
    {
      name: "WhatsApp Sent",
      selector: (row) => formatDate(row.whatsappSentAt),
      minWidth: "170px",
    },
    {
      name: "Registered",
      selector: (row) => formatDate(row.registeredAt),
      minWidth: "170px",
    },
    {
      name: "Created",
      selector: (row) => formatDate(row.createdAt),
      minWidth: "170px",
    },
  ];

  return (
    <div className="overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="role-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search name or phone"
              className="search-input w-full h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex w-full lg:w-auto items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[36px] rounded-[12px] border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#0BB501]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchLeads}
              className="inline-flex h-[36px] items-center gap-2 rounded-[12px] border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiRefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-semibold">Partner Leads</h2>
          <span className="text-sm text-gray-500">{total} total</span>
        </div>

        {listError ? (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {listError}
          </p>
        ) : null}

        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={columns}
            data={tableData}
            pagination
            paginationServer
            paginationTotalRows={total}
            paginationDefaultPage={page}
            paginationPerPage={perPage}
            onChangePage={setPage}
            onChangeRowsPerPage={(newPerPage, newPage) => {
              setPerPage(newPerPage);
              setPage(newPage);
            }}
            fixedHeader
            fixedHeaderScrollHeight="60vh"
            paginationComponentOptions={{
              rowsPerPageText: "Rows per page:",
              rangeSeparatorText: "of",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PartnerLeads;
