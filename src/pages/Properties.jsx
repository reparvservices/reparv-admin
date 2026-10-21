import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import { FaFire } from "react-icons/fa6";
import DataTable from "react-data-table-component";
import { FiChevronRight } from "react-icons/fi";
import DataTableProgress from "../components/ui/DataTableProgress";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FiRefreshCw } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { PiBuildingsFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import propertyPicture from "../assets/propertyPicture.svg";
import DownloadCSV from "../components/DownloadCSV";
import PropertyFilter from "../components/PropertyFilter";
import FormatPrice from "../components/FormatPrice";
import { getImageURI } from "../utils/helper";
import {
  prefetchPropertyPhoto,
  sharePropertyOnWhatsApp,
} from "../utils/propertyShare";

import {
  FaEye,
  FaHeart,
  FaPhoneAlt,
  FaWhatsapp,
  FaShareAlt,
} from "react-icons/fa";
import { formatNumber } from "../utils/formatNumber";

const PROPERTY_LISTERS = ["Reparv Employee", "Project Partner", "Guest User"];

const isPartnerSelected = (partner) =>
  PROPERTY_LISTERS.includes(partner) || partner === "Select Property Lister";

const LIST_STATE_KEY = "admin.properties.list";

// Remember the lister / search so "Back" from a property page returns to the same list
const readListState = () => {
  try {
    return JSON.parse(sessionStorage.getItem(LIST_STATE_KEY) || "{}");
  } catch {
    return {};
  }
};

const Properties = () => {
  const navigate = useNavigate();
  const { propertyFilter, URI } = useAuth();

  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => readListState().searchTerm || "");
  const [seoActive, setSeoActive] = useState(false);

  const [selectedPartner, setSelectedPartner] = useState(
    () => readListState().selectedPartner || "Select Property Lister",
  );
  const [listLoading, setListLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [listError, setListError] = useState("");

  useEffect(() => {
    try {
      sessionStorage.setItem(LIST_STATE_KEY, JSON.stringify({ selectedPartner, searchTerm }));
    } catch {
      /* ignore */
    }
  }, [selectedPartner, searchTerm]);

  const openProperty = (propertyid, tab) =>
    navigate(`/properties/${propertyid}${tab ? `?tab=${tab}` : ""}`);

  //Fetch Data
  const fetchData = async ({ silent = false } = {}) => {
    if (!isPartnerSelected(selectedPartner)) {
      setDatas([]);
      setListError("");
      setListLoading(false);
      setRefreshing(false);
      setHasLoaded(true);
      return;
    }

    if (!silent) {
      if (hasLoaded) setRefreshing(true);
      else setListLoading(true);
    }
    setListError("");

    try {
      const response = await fetch(
        `${URI}/admin/properties/get/${encodeURIComponent(selectedPartner)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch properties.");
      const data = await response.json();
      setDatas(Array.isArray(data) ? data : []);
    } catch (err) {
      setListError(err?.message || "Failed to load properties.");
      setDatas([]);
    } finally {
      setListLoading(false);
      setRefreshing(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPartner]);


  const getPropertyCounts = (data) => {
    return data.reduce(
      (acc, item) => {
        if (item.approve === "Approved") {
          acc.Approved++;
        } else if (item.approve === "Not Approved") {
          acc.NotApproved++;
        } else if (item.approve === "Rejected") {
          acc.Rejected++;
        }
        return acc;
      },
      { Approved: 0, NotApproved: 0, Rejected: 0 },
    );
  };

  const propertyCounts = getPropertyCounts(datas);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = datas.filter((item) => {
    const lowerSearchTerm = searchTerm?.toLowerCase() || "";

    /* Text search filter */
    const matchesSearch =
      !lowerSearchTerm ||
      item.propertyName?.toLowerCase().includes(lowerSearchTerm) ||
      item.company_name?.toLowerCase().includes(lowerSearchTerm) ||
      item.propertyCategory?.toLowerCase().includes(lowerSearchTerm) ||
      item.state?.toLowerCase().includes(lowerSearchTerm) ||
      item.city?.toLowerCase().includes(lowerSearchTerm) ||
      item.approve?.toLowerCase().includes(lowerSearchTerm) ||
      item.status?.toLowerCase().includes(lowerSearchTerm);

    /* Date range filter */
    let startDate = range?.[0]?.startDate;
    let endDate = range?.[0]?.endDate;

    if (startDate)
      startDate = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    if (endDate)
      endDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));

    const itemDate = item.created_at
      ? parse(item.created_at, "dd MMM yyyy | hh:mm a", new Date())
      : null;

    const matchesDate =
      (!startDate && !endDate) ||
      (itemDate &&
        startDate &&
        endDate &&
        itemDate >= startDate &&
        itemDate <= endDate);

    /* Property approval filter */
    const getPropertyApprovedStatus = () => {
      switch (item.approve) {
        case "Approved":
          return "Approved";
        case "Not Approved":
          return "Not Approved";
        case "Rejected":
          return "Rejected";
        default:
          return "";
      }
    };

    const matchesProperty =
      !propertyFilter || getPropertyApprovedStatus() === propertyFilter;

    /* SEO filter */
    const isSeoMissing =
      !item.seoSlug?.trim() ||
      !item.seoTittle?.trim() ||
      !item.seoDescription?.trim() ||
      !item.propertyDescription?.trim();

    const matchesSeo = seoActive ? isSeoMissing : true;

    /* Final decision */
    return matchesSearch && matchesDate && matchesProperty && matchesSeo;
  });

  const customStyles = {
    table: {
      style: {
        backgroundColor: "transparent",
      },
    },
    headRow: {
      style: {
        minHeight: "48px",
        borderBottomWidth: "1px",
        borderBottomColor: "#E5E7EB",
      },
    },
    rows: {
      style: {
        minHeight: "72px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#111827",
        borderBottomColor: "#F3F4F6",
        "&:hover": {
          backgroundColor: "#F9FAFB",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#F0FDF4",
        outline: "none",
      },
    },
    headCells: {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 10,
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        backgroundColor: "#F9FAFB",
        color: "#6B7280",
        paddingLeft: "12px",
        paddingRight: "12px",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        color: "#1F2937",
        paddingLeft: "12px",
        paddingRight: "12px",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #E5E7EB",
        fontSize: "13px",
        color: "#4B5563",
      },
    },
  };

  const isInitialLoad = listLoading && !hasLoaded;
  const tableBusy = listLoading || refreshing;

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
      name: "Image",
      cell: (row) => {
        let imageSrc = propertyPicture;

        try {
          const parsed = JSON.parse(row.frontView);
          if (Array.isArray(parsed) && parsed[0]) {
            imageSrc = `${getImageURI(parsed[0])}`;
          }
        } catch {
          // fall back to the placeholder image
        }

        return (
          <div className="w-[112px] h-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
            <img
              src={imageSrc}
              alt={row.propertyName || "Property"}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = propertyPicture;
              }}
              className="w-full h-full object-cover"
            />
          </div>
        );
      },
      width: "130px",
    },
    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },
    {
      name: "Property Name",
      cell: (row) => (
        <span className="flex items-center gap-1.5 font-semibold text-gray-900 hover:text-[#076300] hover:underline">
          {row.hotDeal === "Active" && <FaFire className="text-red-600 shrink-0" />}
          {row.propertyName}
        </span>
      ),
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Analytics",
      cell: (row) => (
        <div className="flex items-center gap-4 text-xs">
          {/* Views */}
          <div className="flex items-center gap-1 text-gray-600">
            <FaEye className="text-gray-400" />
            <span>{formatNumber(row.views)}</span>
          </div>

          {/* Likes */}
          <div className="flex items-center gap-1 text-red-500">
            <FaHeart />
            <span>{formatNumber(row.likes)}</span>
          </div>

          {/* Calls */}
          <div className="flex items-center gap-1 text-blue-500">
            <FaPhoneAlt />
            <span>{formatNumber(row.calls)}</span>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-1 text-green-600">
            <FaWhatsapp />
            <span>{formatNumber(row.whatsapp)}</span>
          </div>

          {/* Shares */}
          <div className="flex items-center gap-1 text-purple-500">
            <FaShareAlt />
            <span>{formatNumber(row.shares)}</span>
          </div>
        </div>
      ),
      minWidth: "260px",
    },
    {
      name: "Top Picks",
      cell: (row) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            openProperty(row.propertyid, "promotion");
          }}
          title="Manage Top Picks"
          className={`px-2 py-1 rounded-md cursor-pointer hover:ring-1 hover:ring-gray-300 ${
            row.topPicksStatus === "Active"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : "bg-gray-100"
          }`}
        >
          {row.topPicksStatus}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Offer Price",
      selector: (row) => <FormatPrice price={parseInt(row.totalOfferPrice)} />,
      width: "150px",
    },
    {
      name: "Builder",
      selector: (row) => row.company_name,
      minWidth: "150px",
    },
    {
      name: "Property Lister",
      cell: (row) => (
        <div className="flex flex-col gap-[2px]">
          <span>{row.fullname}</span>
          <span> {row.contact}</span>
          <span> {row.partnerCity}</span>
        </div>
      ),
      omit: false,
      minWidth: "180px",
    },
    {
      name: "Category",
      selector: (row) => row.propertyCategory,
      width: "150px",
    },
    {
      name: "City",
      selector: (row) => row.city,
      width: "150px",
    },
    {
      name: "Approve",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.approve === "Approved"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.approve === "Rejected"
                ? "bg-[#FBE9E9] text-[#FF0000]"
                : "bg-[#E9F2FF] text-[#0068FF]"
          }`}
        >
          {row.approve}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Reparv Assured",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.reparvAssured === "Active"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : "bg-gray-100"
          }`}
        >
          {row.reparvAssured === "Active" ? "Assured" : "Not Assured"}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Reject Reason",
      selector: (row) => row.rejectreason || "-- No Reason --",
      minWidth: "150px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sharePropertyOnWhatsApp(row);
            }}
            onMouseEnter={() => prefetchPropertyPhoto(row)}
            onFocus={() => prefetchPropertyPhoto(row)}
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#1ebe5b] transition-colors"
          >
            <FaWhatsapp size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openProperty(row.propertyid);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#076300] px-3 py-1.5 text-xs font-semibold text-[#076300] hover:bg-[#EAFBF1] transition-colors"
          >
            Manage <FiChevronRight size={14} />
          </button>
        </div>
      ),
      width: "170px",
      ignoreRowClick: true,
    },
  ];

  const hasPropertyLister = datas.some((row) => !!row.fullname);

  const finalColumns = columns.map((col) => {
    if (col.name === "Property Lister")
      return { ...col, omit: !hasPropertyLister };
    return col;
  });

  const propertiesNoData = (
    <div className="py-16 px-6 text-center max-w-md mx-auto">
      {!isPartnerSelected(selectedPartner) ? (
        <>
          <PiBuildingsFill className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-800">
            Select a property lister
          </p>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Choose Reparv Employee, Project Partner, or Guest User above to load
            the properties list.
          </p>
        </>
      ) : listError ? (
        <>
          <p className="text-sm font-semibold text-red-800">{listError}</p>
          <button
            type="button"
            onClick={() => fetchData()}
            className="mt-3 text-sm font-semibold text-[#076300] hover:underline"
          >
            Try again
          </button>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-800">
            No properties found
          </p>
          <p className="text-xs text-gray-500 mt-1.5">
            {datas.length > 0
              ? "Try adjusting search, filters, or date range."
              : "No listings for this property lister yet."}
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="properties w-full min-h-full bg-[#F4F6F8] overflow-y-auto scrollbar-hide">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 pb-10">
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="relative px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="flex gap-3 sm:gap-4 min-w-0">
                <div className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20 shrink-0">
                  <PiBuildingsFill size={26} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-xs sm:text-sm font-medium">
                    Projects
                  </p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5">
                    Properties
                  </h1>
                  <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                    Manage listings, approvals, SEO, media, and commissions.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => fetchData({ silent: hasLoaded })}
                  disabled={
                    !isPartnerSelected(selectedPartner) || isInitialLoad
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/25 disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={tableBusy ? "animate-spin" : ""}
                    size={16}
                  />
                  Refresh
                </button>
                <div className="flex gap-2 [&_.addButton]:bg-white [&_.addButton]:text-[#076300] [&_.addButton]:border-white/30 [&_.addButton]:rounded-xl [&_.addButton]:py-2.5">
                  <DownloadCSV
                    data={filteredData}
                    filename={"Properties.csv"}
                  />
                  <AddButton
                    label="Add property"
                    func={() => navigate("/properties/add")}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8">
              {[
                { label: "Approved", value: propertyCounts.Approved },
                { label: "Not approved", value: propertyCounts.NotApproved },
                { label: "Rejected", value: propertyCounts.Rejected },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <p className="text-[10px] sm:text-xs text-white/75 uppercase tracking-wide truncate">
                    {s.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tabular-nums mt-0.5">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-medium text-gray-500 shrink-0">
                Property lister
              </label>
              <div className="relative w-full sm:max-w-[280px]">
                <div className="flex gap-2 items-center justify-between bg-white border border-gray-200 text-sm font-semibold text-gray-900 rounded-xl py-2.5 px-3 shadow-sm focus-within:ring-2 focus-within:ring-[#076300]/25 focus-within:border-[#076300]/40">
                  <span className="truncate">
                    {selectedPartner || "Select Property Lister"}
                  </span>
                  <RiArrowDropDownLine className="w-6 h-6 text-gray-400 shrink-0" />
                </div>
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={selectedPartner}
                  aria-label="Select property lister"
                  onChange={(e) => setSelectedPartner(e.target.value)}
                >
                  <option value="Select Property Lister">
                    Select Property Lister
                  </option>
                  {PROPERTY_LISTERS.map((lister) => (
                    <option key={lister} value={lister}>
                      {lister}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {listError && isPartnerSelected(selectedPartner) ? (
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
                <CiSearch
                  className="text-gray-400 shrink-0"
                  size={20}
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Search property name, builder, city, category, status…"
                  className="w-full min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search properties"
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
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <PropertyFilter counts={propertyCounts} />
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSeoActive(!seoActive)}
                    className={`inline-flex items-center justify-center font-medium rounded-xl text-sm px-4 py-2 border transition-colors ${
                      seoActive
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Not SEO
                  </button>
                  <CustomDateRangePicker range={range} setRange={setRange} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-gray-900">
                Properties list
              </h2>
              {hasLoaded && isPartnerSelected(selectedPartner) ? (
                <p className="text-xs text-gray-500 tabular-nums">
                  Showing {filteredData.length} of {datas.length}
                  {searchTerm ? ` · “${searchTerm}”` : ""}
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
                <DataTableProgress message="Loading properties…" />
              ) : (
                <DataTable
                  className="scrollbar-hide"
                  customStyles={customStyles}
                  columns={finalColumns}
                  data={filteredData}
                  fixedHeader
                  fixedHeaderScrollHeight="calc(100vh - 22rem)"
                  highlightOnHover
                  pointerOnHover
                  onRowClicked={(row, e) => {
                    if (e?.metaKey || e?.ctrlKey) {
                      window.open(`/properties/${row.propertyid}`, "_blank");
                    } else {
                      openProperty(row.propertyid);
                    }
                  }}
                  pagination
                  paginationPerPage={15}
                  paginationRowsPerPageOptions={[10, 15, 25, 50]}
                  progressPending={tableBusy && hasLoaded}
                  progressComponent={
                    <DataTableProgress
                      message="Updating properties…"
                      rows={4}
                    />
                  }
                  noDataComponent={propertiesNoData}
                  paginationComponentOptions={{
                    rowsPerPageText: "Rows per page:",
                    rangeSeparatorText: "of",
                    selectAllRowsItem: true,
                    selectAllRowsItemText: "All",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Properties;
