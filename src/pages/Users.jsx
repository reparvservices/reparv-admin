import { lazy, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaHandshake, FaUserTie, FaUsers } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { useAuth } from "../store/auth";
import { fetchUsersOverview } from "../lib/dashboardApi";
import DataTableProgress from "../components/ui/DataTableProgress";

// Reuse the existing pages so each list keeps its own UI and actions.
// Loaders are kept separately so a page's code can be prefetched on hover.
const loaders = {
  projectPartner: () => import("./ProjectPartner.jsx"),
  salesPerson: () => import("./SalesPerson.jsx"),
  territoryPartner: () => import("./TerritoryPartner.jsx"),
  partnerLeads: () => import("./PartnerLeads.jsx"),
  messages: () => import("./Messages.jsx"),
  scheduledRequests: () => import("./ScheduledRequests.jsx"),
  calender: () => import("./Calender.jsx"),
  employee: () => import("./Employee.jsx"),
  department: () => import("./Department.jsx"),
  role: () => import("./Role.jsx"),
  guestUser: () => import("./guestUser.jsx"),
  customers: () => import("./Customers.jsx"),
};

// inTotal: whether the tab's count is people (added to the group total)
const tab = (key, label, loader, countKey, inTotal = true) => ({
  key,
  label,
  load: loaders[loader],
  Page: lazy(loaders[loader]),
  countKey,
  inTotal,
});

const USER_GROUPS = {
  partners: {
    label: "Partners",
    description: "Project, sales and territory partners, their leads and schedules.",
    icon: FaHandshake,
    tabs: [
      tab("project-partner", "Project Partner", "projectPartner", "totalProjectPartner"),
      tab("sales-partner", "Sales Partner", "salesPerson", "totalSalesPerson"),
      tab("territory-partner", "Territory Partner", "territoryPartner", "totalTerritoryPartner"),
      tab("partner-leads", "Partner Leads", "partnerLeads"),
      tab("messages", "Messages", "messages"),
      tab("scheduled-requests", "Scheduled Requests", "scheduledRequests"),
      tab("calendar", "Calendar", "calender"),
    ],
  },
  employees: {
    label: "Employees",
    description: "Reparv team members, their departments and access roles.",
    icon: FaUserTie,
    tabs: [
      tab("employees", "Employees", "employee", "totalEmployee"),
      tab("departments", "Departments", "department", "totalDepartment", false),
      tab("roles", "Roles", "role", "totalRole", false),
    ],
  },
  users: {
    label: "Users",
    description: "People using the website and app, and customers who booked.",
    icon: FaUsers,
    tabs: [
      tab("guest-users", "Guest Users", "guestUser", "totalGuestUser"),
      tab("customers", "Customers", "customers", "totalCustomer"),
    ],
  },
};

const groupTotal = (group, counts) =>
  group.tabs.reduce(
    (sum, t) => sum + (t.inTotal ? Number(counts?.[t.countKey]) || 0 : 0),
    0,
  );

const formatCount = (value) =>
  value === undefined || value === null
    ? "—"
    : Number(value).toLocaleString("en-IN");

const Users = () => {
  const { URI } = useAuth();
  // Keep the selection in the URL so a refresh or shared link opens the same list
  const [searchParams, setSearchParams] = useSearchParams();
  const groupKey = USER_GROUPS[searchParams.get("type")]
    ? searchParams.get("type")
    : "";
  const group = USER_GROUPS[groupKey];
  const activeTab =
    group?.tabs.find((t) => t.key === searchParams.get("tab")) ||
    group?.tabs[0];

  // Totals come from a small counts endpoint; the page works without them
  const [counts, setCounts] = useState(null);
  useEffect(() => {
    let active = true;
    fetchUsersOverview(URI)
      .then((data) => active && setCounts(data?.counts || {}))
      .catch(() => active && setCounts({}));
    return () => {
      active = false;
    };
  }, [URI]);

  const openGroup = (key, tabKey) => {
    if (!key) return setSearchParams({});
    setSearchParams(tabKey ? { type: key, tab: tabKey } : { type: key });
  };

  const tabCount = (t) =>
    t.countKey && counts ? formatCount(counts[t.countKey]) : null;

  const ActivePage = activeTab?.Page;

  return (
    <div className="users w-full min-h-full bg-[#F4F6F8]">
      {!group ? (
        <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 pb-10 space-y-4 sm:space-y-6">
          {/* Overview header */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm">
            <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
              <div className="flex gap-3 sm:gap-4 min-w-0">
                <div className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20 shrink-0">
                  <FaUsers size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-xs sm:text-sm font-medium">
                    People
                  </p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5">
                    Users
                  </h1>
                  <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                    Partners, employees and website users in one place.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-6 sm:mt-8">
                {[
                  {
                    label: "Partners",
                    value: counts && groupTotal(USER_GROUPS.partners, counts),
                  },
                  { label: "Employees", value: counts?.totalEmployee },
                  { label: "Guest users", value: counts?.totalGuestUser },
                  { label: "Customers", value: counts?.totalCustomer },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 px-3 sm:px-4 py-2.5 sm:py-3"
                  >
                    <p className="text-[10px] sm:text-xs text-white/75 uppercase tracking-wide truncate">
                      {s.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold tabular-nums mt-0.5">
                      {counts ? formatCount(s.value) : (
                        <span className="inline-block h-6 w-12 rounded bg-white/20 animate-pulse align-middle" />
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Group cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(USER_GROUPS).map(([key, g]) => {
              const Icon = g.icon;
              const total = counts ? groupTotal(g, counts) : null;
              return (
                <div
                  key={key}
                  className="group flex flex-col rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-[#076300]/40 transition"
                >
                  <button
                    type="button"
                    onClick={() => openGroup(key)}
                    onMouseEnter={() => g.tabs[0].load()}
                    className="flex items-start gap-3 p-5 text-left"
                  >
                    <span className="h-11 w-11 rounded-xl bg-[#EAFBF1] text-[#076300] flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-base font-semibold text-gray-900">
                          {g.label}
                        </span>
                        {total ? (
                          <span className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {formatCount(total)}
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1 leading-relaxed">
                        {g.description}
                      </span>
                    </span>
                  </button>
                  <div className="mt-auto border-t border-gray-100 px-2 py-2">
                    {g.tabs.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => openGroup(key, t.key)}
                        onMouseEnter={() => t.load()}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#F0FDF4] hover:text-[#076300]"
                      >
                        <span>{t.label}</span>
                        <span className="flex items-center gap-2">
                          {tabCount(t) ? (
                            <span className="text-xs tabular-nums text-gray-400">
                              {tabCount(t)}
                            </span>
                          ) : null}
                          <FiChevronRight className="text-gray-300" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Sticky navigation; the selected page brings its own header */}
          <div className="sticky top-0 z-20 bg-[#F4F6F8]/95 backdrop-blur">
            <div className="max-w-[1600px] w-full mx-auto px-4 md:px-6 pt-4">
              <div className="rounded-2xl bg-white border border-gray-200/80 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-3 sm:px-4 pt-3">
                  <nav className="flex items-center gap-1.5 text-sm min-w-0">
                    <button
                      type="button"
                      onClick={() => openGroup("")}
                      className="text-gray-500 hover:text-[#076300] font-medium"
                    >
                      Users
                    </button>
                    <FiChevronRight className="text-gray-300 shrink-0" />
                    <span className="font-semibold text-gray-900 truncate">
                      {group.label}
                    </span>
                  </nav>
                  <div className="inline-flex self-start lg:self-auto rounded-xl bg-gray-100 p-1">
                    {Object.entries(USER_GROUPS).map(([key, g]) => {
                      const Icon = g.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => openGroup(key)}
                          onMouseEnter={() => g.tabs[0].load()}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                            key === groupKey
                              ? "bg-white text-[#076300] shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Icon size={14} />
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-1 overflow-x-auto scrollbar-hide px-2 sm:px-3 mt-2">
                  {group.tabs.map((t) => {
                    const isActive = activeTab?.key === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => openGroup(groupKey, t.key)}
                        onMouseEnter={() => t.load()}
                        className={`shrink-0 flex items-center gap-2 px-3 py-2.5 text-sm font-semibold border-b-2 transition ${
                          isActive
                            ? "border-[#076300] text-[#076300]"
                            : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {t.label}
                        {tabCount(t) ? (
                          <span
                            className={`text-[11px] tabular-nums px-1.5 py-0.5 rounded-md ${
                              isActive
                                ? "bg-[#EAFBF1] text-[#076300]"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {tabCount(t)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="max-w-[1600px] mx-auto p-4 md:p-6">
                <DataTableProgress message={`Loading ${activeTab.label}…`} />
              </div>
            }
          >
            <ActivePage key={activeTab.key} />
          </Suspense>
        </>
      )}
    </div>
  );
};

export default Users;
