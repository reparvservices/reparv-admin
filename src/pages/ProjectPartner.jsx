import React from "react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import FilterData from "../components/FilterData";
import DataTable from "react-data-table-component";
import { FiMoreVertical, FiRefreshCw, FiUsers } from "react-icons/fi";
import DataTableProgress from "../components/ui/DataTableProgress";
import PartnerFilter from "../components/PartnerFilter";
import { RxCross2 } from "react-icons/rx";
import { MdDone } from "react-icons/md";
import { MdMoneyOffCsred } from "react-icons/md";
import DownloadCSV from "../components/DownloadCSV";
import { useNavigate } from "react-router-dom";
import useProjectPartnerActions from "../components/projectPartner/useProjectPartnerActions";
import SubscriptionStatusBadge from "../components/subscription/SubscriptionStatusBadge";
import {
  resolvePartnerFilterBucket,
  planTypeBadgeClass,
  formatInr,
} from "../utils/partnerSubscriptionDisplay";
import {
  fetchProjectPartnerList,
  partnerFilterToApiParam,
} from "../lib/projectPartnerApi";

const ProjectPartner = () => {
  const {
    URI,
    partnerPaymentStatus,
    setPartnerPaymentStatus,
  } = useAuth();

  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();
  const [listLoading, setListLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const mountedRef = useRef(true);

  const fetchData = useCallback(
    async ({ silent = false, pageOverride } = {}) => {
      if (!silent) {
        setListLoading(true);
        setListError("");
      } else {
        setRefreshing(true);
      }

      const currentPage = pageOverride ?? page;
      const offset = (currentPage - 1) * perPage;
      const startRaw = range[0]?.startDate;
      const endRaw = range[0]?.endDate;

      try {
        const json = await fetchProjectPartnerList(URI, {
          limit: perPage,
          offset,
          search: debouncedSearch.trim(),
          filter: partnerFilterToApiParam(partnerPaymentStatus),
          dateFrom: startRaw ? new Date(startRaw).toISOString() : undefined,
          dateTo: endRaw ? new Date(endRaw).toISOString() : undefined,
        });

        if (!mountedRef.current) return;
        setDatas(Array.isArray(json.data) ? json.data : []);
        setTotal(json.total ?? 0);
        setSummary(json.summary || null);
        setHasLoaded(true);
      } catch (err) {
        if (!mountedRef.current) return;
        setListError(err.message || "Could not load project partners.");
        if (!silent) {
          setDatas([]);
          setTotal(0);
        }
      } finally {
        if (!mountedRef.current) return;
        setListLoading(false);
        setRefreshing(false);
      }
    },
    [URI, page, perPage, debouncedSearch, partnerPaymentStatus, range],
  );

  // Open the full partner profile page
  const viewPartner = (id) => {
    navigate(`/projectpartner/${id}`);
  };

  const { runAction, actionModals } = useProjectPartnerActions({
    onChanged: () => fetchData({ silent: true }),
    onFollowUpAdded: () => setPartnerPaymentStatus("Follow Up"),
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, partnerPaymentStatus, range]);

  useEffect(() => {
    fetchData({ silent: hasLoaded });
  }, [fetchData, page, perPage, hasLoaded]);

  const partnerCounts = useMemo(
    () => ({
      All: summary?.total ?? 0,
      Unpaid: summary?.unpaid ?? 0,
      FollowUp: summary?.follow_up ?? 0,
      Trial: summary?.trial ?? 0,
      Paid: summary?.paid ?? 0,
      Enterprise: summary?.enterprise ?? 0,
      Pending: summary?.pending ?? 0,
    }),
    [summary],
  );

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const isInitialLoad = listLoading && !hasLoaded;

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

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          {/* Serial Number Box */}
          <span
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer ${
              row.status === "Active"
                ? "bg-[#EAFBF1] text-[#0BB501]"
                : "bg-[#FFEAEA] text-[#ff2323]"
            }`}
          >
            {index + 1}
          </span>

          {/* Tooltip */}
          <div className="absolute w-[65px] text-center -top-12 left-[30px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
            {row.status === "Active" ? "Active" : "Inactive"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Follow Up",
      cell: (row) => {
        const followUpColorMap = {
          New: "bg-blue-100 text-blue-700",
          CNR1: "bg-red-100 text-red-600",
          CNR2: "bg-red-100 text-red-600",
          CNR3: "bg-red-100 text-red-600",
          CNR4: "bg-red-100 text-red-600",
          "Switch Off": "bg-red-100 text-red-700",
          "Call Busy": "bg-yellow-100 text-yellow-600",
          "Call Back": "bg-yellow-100 text-yellow-600",
          "Not Responding (After Follow Up)": "bg-yellow-100 text-yellow-600",
          "Call Cut / Disconnected": "bg-orange-100 text-orange-600",
          "Invalid Number": "bg-red-100 text-red-700",
          "Wrong Number": "bg-red-100 text-red-700",
          "Form Filled By Mistake": "bg-blue-100 text-blue-600",
          "Repeat Lead": "bg-gray-100 text-gray-600",
          "Lead Clash": "bg-purple-100 text-purple-500",
          "Details Shared": "bg-green-100 text-green-600",
          "Not Interested": "bg-pink-100 text-pink-600",
          "Not Interested (After Details Shared & Explanation)":
            "bg-orange-100 text-orange-600",
          Interested: "bg-green-100 text-green-700",
          "Documents Collected": "bg-green-200 text-green-800",
          "Payment Done": "bg-green-300 text-green-900",
          // fallback/default:
          Success: "bg-[#EAFBF1] text-[#0BB501]",
          "Follow Up": "bg-[#E9F2FF] text-[#0068FF]",
        };

        const styleClass =
          followUpColorMap[row.followUp] || "bg-[#efefef] text-[#000000]";

        return (
          <span
            onClick={() => runAction("followup", row)}
            className={`px-2 py-1 rounded-md cursor-pointer ${styleClass}`}
          >
            {row.followUp || "- Empty -"}
          </span>
        );
      },
      minWidth: "150px",
    },
    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },
    {
      name: "Full Name",
      cell: (row) => (
        <div className={`flex gap-2 items-center justify-center`}>
          <div className="relative group cursor-pointer">
            <div
              className={`px-[3px] py-[3px] rounded-md flex items-center justify-center ${
                row.loginstatus === "Active"
                  ? "bg-[#EAFBF1] text-[#0BB501]"
                  : "bg-[#FBE9E9] text-[#FF0000]"
              }`}
              onClick={() => runAction("assignlogin", row)}
            >
              {row.loginstatus === "Active" ? <MdDone /> : <RxCross2 />}
            </div>
            <div className="absolute w-[150px] text-center -top-12 left-[75px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
              {row.loginstatus === "Active"
                ? "Login Status Active"
                : "Login Status Inactive"}
            </div>
          </div>
          <div className="relative group cursor-pointer">
            {row.freeProjectPartner === "Active" && (
              <>
                <div
                  className={`px-[3px] py-[3px] rounded-md flex items-center justify-center ${
                    row.freeProjectPartner === "Active"
                      ? "bg-[#EAFBF1] text-[#0BB501]"
                      : "bg-[#FBE9E9] text-[#FF0000]"
                  }`}
                >
                  <MdMoneyOffCsred />
                </div>
                <div className="absolute w-[150px] text-center -top-12 left-[75px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
                  {row.freeProjectPartner === "Active" ? "Free Partner" : ""}
                </div>
              </>
            )}
          </div>
          <div className="relative group cursor-pointer">
            <span
              className={`${
                row.adharno && row.panno && row.adharimage && row.panimage
                  ? "text-green-600"
                  : ""
              }`}
            >
              {row.fullname}
            </span>
            <div className="absolute w-[150px] text-center -top-12 left-[50px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
              {row.adharno && row.panno && row.adharimage && row.panimage
                ? "KYC Completed"
                : "KYC Not Completed"}
            </div>
          </div>
        </div>
      ),
      width: "200px",
    },
    {
      name: "Contact",
      cell: (row) => (
        <span
          className="cursor-pointer"
          onClick={() => {
            window.open(
              `https://www.reparv.in/project-partner/${row.contact}`,
              "_blank",
            );
          }}
        >
          {row.contact}
        </span>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "State",
      selector: (row) => row.state,
      sortable: true,
      width: "150px",
    },
    {
      name: "City",
      selector: (row) => row.city,
      sortable: true,
      width: "150px",
    },
    {
      name: "Plan",
      minWidth: "150px",
      grow: 1,
      cell: (row) => (
        <div className="min-w-[130px] py-0.5">
          <p
            className="font-medium text-gray-900 text-sm truncate"
            title={row.subscription_plan_name}
          >
            {row.subscription_plan_name || "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
            {row.subscription_plan_period_label ||
              (row.subscription_billing_cycle
                ? String(row.subscription_billing_cycle)
                : "") ||
              "—"}
          </p>
          {row.subscription_plan_type ? (
            <span
              className={`inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${planTypeBadgeClass(
                row.subscription_plan_type,
                row,
              )}`}
            >
              {row.subscription_is_trial ? "trial" : row.subscription_plan_type}
            </span>
          ) : resolvePartnerFilterBucket(row) === "Unpaid" ? (
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700">
              no plan
            </span>
          ) : null}
        </div>
      ),
    },
    {
      name: "Amount",
      width: "96px",
      right: true,
      cell: (row) => (
        <span className="text-sm font-semibold tabular-nums text-gray-900 whitespace-nowrap">
          {formatInr(row.subscription_final_amount)}
        </span>
      ),
    },
    {
      name: "Status",
      width: "120px",
      center: true,
      cell: (row) => {
        const display =
          row.subscription_display_status ||
          row.subscription_status ||
          (resolvePartnerFilterBucket(row) === "Unpaid" ? "unpaid" : "");
        if (!display && resolvePartnerFilterBucket(row) === "Follow Up") {
          return (
            <span className="inline-flex px-2 py-1 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700">
              Follow up
            </span>
          );
        }
        return (
          <SubscriptionStatusBadge
            status={display}
            endDate={row.subscription_end_date}
            compact
          />
        );
      },
    },
    {
      name: "Period",
      width: "200px",
      cell: (row) => (
        <div className="text-[11px] text-gray-600 leading-snug">
          {row.subscription_start_date ? (
            <p>
              From{" "}
              {new Date(row.subscription_start_date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "2-digit",
              })}
            </p>
          ) : null}
          {row.subscription_end_date ? (
            <p className="mt-0.5">
              To{" "}
              {new Date(row.subscription_end_date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "2-digit",
              })}
            </p>
          ) : (
            <p>—</p>
          )}
        </div>
      ),
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action) => {
      if (action === "view") viewPartner(row.id);
      else runAction(action, row);
    };

    return (
      <div className="relative inline-block w-[120px]">
        <div className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span className=" text-[12px]">{selectedAction || "Action"}</span>
          <FiMoreVertical className="text-gray-500" />
        </div>
        <select
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          value={selectedAction}
          onChange={(e) => {
            const action = e.target.value;
            handleActionSelect(action);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="status">Status</option>
          <option value="update">Update</option>
          <option value="assignEnterprise">Assign Enterprise</option>
          <option value="followup">Follow Up</option>
          <option value="assignlogin">Assign Login</option>
          <option value="SEO">Landing Page SEO</option>
          <option value="free">Set Free Partner</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div className="w-full min-h-full bg-[#F4F6F8] overflow-y-auto scrollbar-hide">
      {actionModals}

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 pb-10">
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="relative px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="flex gap-3 sm:gap-4 min-w-0">
                <div className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20 shrink-0">
                  <FiUsers size={26} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-xs sm:text-sm font-medium">Partners</p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5">
                    Project partners
                  </h1>
                  <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                    Manage leads, subscriptions, follow-ups, and partner access.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => fetchData({ silent: hasLoaded })}
                  disabled={listLoading && !hasLoaded}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/25 disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={listLoading || refreshing ? "animate-spin" : ""}
                    size={16}
                  />
                  Refresh
                </button>
                <div className="[&_.addButton]:bg-white [&_.addButton]:text-[#076300] [&_.addButton]:border-white/30 [&_.addButton]:rounded-xl [&_.addButton]:py-2.5">
                  <AddButton label="Add partner" func={() => runAction("add")} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-6 sm:mt-8">
              {[
                { label: "Total", value: summary?.total ?? 0 },
                { label: "Trial", value: partnerCounts.Trial },
                { label: "Paid", value: partnerCounts.Paid },
                { label: "Enterprise", value: partnerCounts.Enterprise },
                { label: "Pending", value: partnerCounts.Pending },
                { label: "Unpaid", value: partnerCounts.Unpaid },
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

          <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4">
            {listError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-red-800">{listError}</p>
                <button
                  type="button"
                  onClick={() => fetchData()}
                  className="text-sm font-semibold text-red-700 hover:underline shrink-0"
                >
                  Try again
                </button>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[#076300]/25 focus-within:border-[#076300]/40">
                <CiSearch className="text-gray-400 shrink-0" size={20} aria-hidden />
                <input
                  type="search"
                  placeholder="Search name, email, phone, city, company, partner ID…"
                  className="w-full min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search project partners"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/80"
                    aria-label="Clear search"
                  >
                    <RxCross2 size={16} />
                  </button>
                ) : null}
                {searchTerm.trim() !== debouncedSearch && searchTerm.trim() ? (
                  <span className="shrink-0 text-[10px] text-gray-400 hidden sm:inline">
                    Searching…
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <PartnerFilter counts={partnerCounts} variant="subscription" />
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                  <CustomDateRangePicker range={range} setRange={setRange} />
                  <DownloadCSV data={datas} filename="ProjectPartner.csv" />
                  <span className="text-[10px] text-gray-400 hidden lg:inline self-center">
                    CSV: current page
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-gray-900">Partner list</h2>
              {hasLoaded ? (
                <p className="text-xs text-gray-500 tabular-nums">
                  Showing {datas.length} of {total}
                  {debouncedSearch ? ` · “${debouncedSearch}”` : ""}
                  {refreshing ? " · Updating…" : ""}
                </p>
              ) : null}
            </div>

            <div
              className={`relative rounded-xl border border-gray-100 overflow-hidden transition-opacity duration-200 ${
                refreshing ? "opacity-70" : "opacity-100"
              }`}
            >
              {isInitialLoad ? (
                <DataTableProgress message="Loading project partners…" />
              ) : (
                <DataTable
                  className="scrollbar-hide"
                  customStyles={customStyles}
                  columns={columns}
                  data={datas}
                  fixedHeader
                  fixedHeaderScrollHeight="calc(100vh - 22rem)"
                  pagination
                  paginationServer
                  paginationTotalRows={total}
                  paginationDefaultPage={page}
                  paginationPerPage={perPage}
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  paginationComponentOptions={{
                    rowsPerPageText: "Rows per page:",
                    rangeSeparatorText: "of",
                  }}
                  progressPending={listLoading && !hasLoaded}
                  progressComponent={<DataTableProgress />}
                  noDataComponent={
                    <div className="py-16 text-center text-sm text-gray-500">
                      {listError
                        ? "Could not load partners."
                        : "No partners match your filters."}
                    </div>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPartner;
