import { useEffect, useState, Suspense } from "react";
import { useLocation, NavLink, Outlet } from "react-router-dom";
import reparvMainLogo from "../../assets/layout/reparvMainLogo.svg";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import Profile from "../Profile";
import { useAuth } from "../../store/auth";
import LogoutButton from "../LogoutButton";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";

import { MdDashboard } from "react-icons/md";
import { IoIosListBox } from "react-icons/io";
import { HiUsers } from "react-icons/hi2";
import { PiBuildingsFill } from "react-icons/pi";
import { RiAdvertisementFill } from "react-icons/ri";
import { FaUserTie } from "react-icons/fa";
import { FaHandshake } from "react-icons/fa";
import { BiSolidDiamond } from "react-icons/bi";
import { FaTicket } from "react-icons/fa6";
import { FaPhotoVideo } from "react-icons/fa";

const menuItems = [
  {
    label: "Dashboard",
    icon: <MdDashboard size={21} />,
    to: "/dashboard",
  },

  {
    to: "/tickets",
    icon: <FaTicket size={21} />,
    label: "Tickets",
  },

  // Leads Dropdown
  {
    label: "Leads",
    icon: <IoIosListBox size={21} />,
    dropdown: [
      { label: "Enquirers", to: "/enquirers" },
      { label: "Call Enquirers", to: "/call-enquirers" },
      { label: "Whatsapp Enquirers", to: "/whatsapp-enquirers" },
      { label: "Whatsapp Chat", to: "/whatsapp-chat" },
      { label: "Digital Broker", to: "/digital-broker" },
      { label: "Meta Leads", to: "/meta-leads" },
    ],
  },

  // Customers
  {
    label: "Visitors",
    icon: <HiUsers size={21} />,
    dropdown: [
      { label: "Customers", to: "/customers" },
      { label: "Messages", to: "/contact-us-messages" },
      { label: "Users Loan Eligibility", to: "/users-loan-eligibility" },
    ],
  },

  // Project Dropdown
  {
    label: "Projects",
    icon: <PiBuildingsFill size={21} />,
    dropdown: [
      { label: "Properties", to: "/properties" },
      { label: "Authorities", to: "/property-authorities" },
      { label: "Builders", to: "/builders" },
      { label: "Map", to: "/map" },
    ],
  },

  // Employee Dropdown
  {
    label: "Employees",
    icon: <FaUserTie size={21} />,
    dropdown: [
      { label: "Employees", to: "/employees" },
      { label: "Departments", to: "/department" },
      { label: "Roles", to: "/role" },
    ],
  },

  // Partners Dropdown
  {
    label: "Partners",
    icon: <FaHandshake size={21} />,
    dropdown: [
      { label: "Project Partner", to: "/projectpartner" },
      { label: "Partner Leads", to: "/partner-leads" },
      { label: "Sales Partner", to: "/salespersons" },
      { label: "Territory Partner", to: "/territorypartner" },
      { label: "Guest Users", to: "/guest-users" },
      { label: "Messages", to: "/messages" },
      { label: "Scheduled Requests", to: "/scheduled-requests" },
      { label: "Calendar", to: "/calender" },
    ],
  },

  // Promotion Dopdown
  {
    label: "Promotions",
    icon: <RiAdvertisementFill size={21} />,
    dropdown: [{ label: "Ads Manager", to: "/ads-manager" }],
  },

  // Subscription Plan Dopdown
  {
    label: "Subscription Plans",
    icon: <BiSolidDiamond size={21} />,
    dropdown: [
      { label: "Subscription Pricing", to: "/subscription-pricing" },
      { label: "Subscription Features", to: "/subscription-features" },
      { label: "User Subscriptions", to: "/user-subscriptions" },
      { label: "GST Bills", to: "/gst-bills" },
      { label: "Subscription Analytics", to: "/subscription-analytics" },
    ],
  },

  // Manage Reparv Dopdown
  {
    label: "Manage Reparv",
    icon: <FaPhotoVideo size={21} />,
    dropdown: [
      { to: "/faqs", label: "FAQs" },
      { to: "/blogs", label: "Blogs" },
      { to: "/news", label: "News" },
      { label: "Trends", to: "/trends" },
      { label: "Slider", to: "/slider" },
      { label: "Subscribers", to: "/subscribers" },
      { label: "Testimonial", to: "/testimonial" },
      { label: "Marketing Content", to: "/marketing-content" },
    ],
  },
];

function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShortBar, setIsShortbar] = useState(false);
  const [heading, setHeading] = useState(localStorage.getItem("head"));
  const {
    showProfile,
    setShowProfile,
    showPaymentIdForm,
    setShowPaymentIdForm,
    giveAccess,
    setGiveAccess,
    showAssignTaskForm,
    setShowAssignTaskForm,
    showSalesForm,
    setShowSalesForm,
    showEmployee,
    setShowEmployee,
    showEplDetailsForm,
    setShowEplDetailsForm,
    showBuilderForm,
    setShowBuilderForm,
    showAuctionForm,
    setShowAuctionForm,
    showPropertyForm,
    setShowPropertyForm,
    showPropertyTypeForm,
    setShowPropertyTypeForm,
    showRoleForm,
    setShowRoleForm,
    showDepartmentForm,
    setShowDepartmentForm,
    showUpdateImagesForm,
    setShowUpdateImagesForm,
    showAdditionalInfoForm,
    setShowAdditionalInfoForm,
    showNewPlotAdditionalInfoForm,
    setShowNewPlotAdditionalInfoForm,
    showAssignSalesForm,
    setShowAssignSalesForm,
    showEnquiryForm,
    setShowEnquiryForm,
    showEnquiryUpdateForm,
    setShowEnquiryUpdateForm,
    showEnquiryStatusForm,
    setShowEnquiryStatusForm,
    showPropertyInfo,
    setShowPropertyInfo,
    showSliderForm,
    setShowSliderForm,
    showFeedbackForm,
    setShowFeedbackForm,
    showPartnerForm,
    setShowPartnerForm,
    showTicketForm,
    setShowTicketForm,
    showResponseForm,
    setShowResponseForm,
    showRejectReasonForm,
    setShowRejectReasonForm,
    showTicket,
    setShowTicket,
    showEnquiry,
    setShowEnquiry,
    showBuilder,
    setShowBuilder,
    showPartner,
    setShowPartner,
    showSalesPerson,
    setShowSalesPerson,
    showAddMobileImage,
    setShowAddMobileImage,
    showEnquirerPropertyForm,
    setShowEnquirerPropertyForm,
    showFollowUpList,
    setShowFollowUpList,
    showSeoForm,
    setShowSeoForm,
    showBlogForm,
    setShowBlogForm,
    showNewsForm,
    setShowNewsForm,
    showTrendForm,
    setShowTrendForm,
    showCommissionForm,
    setShowCommissionForm,
    showCustomer,
    setShowCustomer,
    showCustomerPaymentForm,
    setShowCustomerPaymentForm,
    showApkUploadForm,
    setShowApkUploadForm,
    showContentUploadForm,
    setShowContentUploadForm,
    showEMIForm,
    setShowEMIForm,
    showProduct,
    setShowProduct,
    showProductForm,
    setShowProductForm,
    showOrder,
    setShowOrder,
    showStockForm,
    setShowStockForm,
    showStatusForm,
    setShowStatusForm,
    showVideoUploadForm,
    setShowVideoUploadForm,
    showPropertyLocationForm,
    setShowPropertyLocationForm,
    showAuthorityForm,
    setShowAuthorityForm,
    showSubscriptionPlan,
    setShowSubscriptionPlan,
    showSubscriptionForm,
    setShowSubscriptionForm,
    showInfo,
    setShowInfo,
    showInfoForm,
    setShowInfoForm,
    showAssignProjectPartnerForm,
    setShowAssignProjectPartnerForm,
    showEMI,
    setShowEMI,
    showNotePopup,
    setShowNotePopup,
    showAdsManager,
    setShowAdsManager,
    showAdsManagerForm,
    setShowAdsManagerForm,
    showChangeProjectPartnerForm,
    setShowChangeProjectPartnerForm,
    showFAQForm,
    setShowFAQForm,
    showAdURLForm,
    setShowAdURLForm,
    showTopPicksForm,
    setShowTopPicksForm,
  } = useAuth();

  const overlays = [
    { state: giveAccess, setter: setGiveAccess },
    { state: showAssignTaskForm, setter: setShowAssignTaskForm },
    { state: showSalesForm, setter: setShowSalesForm },
    { state: showEmployee, setter: setShowEmployee },
    { state: showEplDetailsForm, setter: setShowEplDetailsForm },
    { state: showAuctionForm, setter: setShowAuctionForm },
    { state: showBuilderForm, setter: setShowBuilderForm },
    { state: showDepartmentForm, setter: setShowDepartmentForm },
    { state: showPropertyForm, setter: setShowPropertyForm },
    { state: showPropertyTypeForm, setter: setShowPropertyTypeForm },
    { state: showRoleForm, setter: setShowRoleForm },
    { state: showUpdateImagesForm, setter: setShowUpdateImagesForm },
    { state: showAssignSalesForm, setter: setShowAssignSalesForm },
    { state: showAdditionalInfoForm, setter: setShowAdditionalInfoForm },
    {
      state: showNewPlotAdditionalInfoForm,
      setter: setShowNewPlotAdditionalInfoForm,
    },
    { state: showEnquiryForm, setter: setShowEnquiryForm },
    { state: showEnquiryUpdateForm, setter: setShowEnquiryUpdateForm },
    { state: showEnquiryStatusForm, setter: setShowEnquiryStatusForm },
    { state: showRejectReasonForm, setter: setShowRejectReasonForm },
    { state: showPropertyInfo, setter: setShowPropertyInfo },
    { state: showSliderForm, setter: setShowSliderForm },
    { state: showFeedbackForm, setter: setShowFeedbackForm },
    { state: showPartnerForm, setter: setShowPartnerForm },
    { state: showTicketForm, setter: setShowTicketForm },
    { state: showResponseForm, setter: setShowResponseForm },
    { state: showTicket, setter: setShowTicket },
    { state: showEnquiry, setter: setShowEnquiry },
    { state: showBuilder, setter: setShowBuilder },
    { state: showSalesPerson, setter: setShowSalesPerson },
    { state: showPartner, setter: setShowPartner },
    { state: showAddMobileImage, setter: setShowAddMobileImage },
    { state: showPaymentIdForm, setter: setShowPaymentIdForm },
    { state: showEnquirerPropertyForm, setter: setShowEnquirerPropertyForm },
    { state: showFollowUpList, setter: setShowFollowUpList },
    { state: showSeoForm, setter: setShowSeoForm },
    { state: showBlogForm, setter: setShowBlogForm },
    { state: showNewsForm, setter: setShowNewsForm },
    { state: showTrendForm, setter: setShowTrendForm },
    { state: showCommissionForm, setter: setShowCommissionForm },
    { state: showCustomer, setter: setShowCustomer },
    { state: showCustomerPaymentForm, setter: setShowCustomerPaymentForm },
    { state: showApkUploadForm, setter: setShowApkUploadForm },
    { state: showContentUploadForm, setter: setShowContentUploadForm },
    { state: showEMI, setter: setShowEMI },
    { state: showEMIForm, setter: setShowEMIForm },
    { state: showProduct, setter: setShowProduct },
    { state: showProductForm, setter: setShowProductForm },
    { state: showStockForm, setter: setShowStockForm },
    { state: showOrder, setter: setShowOrder },
    { state: showStatusForm, setter: setShowStatusForm },
    { state: showVideoUploadForm, setter: setShowVideoUploadForm },
    { state: showPropertyLocationForm, setter: setShowPropertyLocationForm },
    { state: showAuthorityForm, setter: setShowAuthorityForm },
    { state: showSubscriptionPlan, setter: setShowSubscriptionPlan },
    { state: showSubscriptionForm, setter: setShowSubscriptionForm },
    { state: showInfo, setter: setShowInfo },
    { state: showInfoForm, setter: setShowInfoForm },
    {
      state: showAssignProjectPartnerForm,
      setter: setShowAssignProjectPartnerForm,
    },
    { state: showNotePopup, setter: setShowNotePopup },
    { state: showAdsManager, setter: setShowAdsManager },
    { state: showAdsManagerForm, setter: setShowAdsManagerForm },
    {
      state: showChangeProjectPartnerForm,
      setter: setShowChangeProjectPartnerForm,
    },
    { state: showFAQForm, setter: setShowFAQForm },
    { state: showAdURLForm, setter: setShowAdURLForm },
    { state: showTopPicksForm, setter: setShowTopPicksForm },
  ];

  const [openLeads, setOpenLeads] = useState(false);
  const [openVisitors, setOpenVisitors] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);
  const [openEmployees, setOpenEmployees] = useState(false);
  const [openPartners, setOpenPartners] = useState(false);
  const [openPromotions, setOpenPromotions] = useState(false);
  const [openSubscriptionPlans, setOpenSubscriptionPlans] = useState(false);
  const [openManageReparv, setOpenManageReparv] = useState(false);

  const isPathActive = (path) =>
    path && (location.pathname === path || location.pathname.startsWith(`${path}/`));

  const leafLinkClass = ({ isActive }) =>
    [
      "block rounded-xl px-3 py-2 text-[13px] font-medium transition-colors duration-150",
      isActive
        ? "bg-[#E3FFDF] text-[#076300] shadow-[inset_0_0_0_1px_rgba(7,99,0,0.12)]"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    ].join(" ");

  const getHeading = (label) => {
    setHeading(label);
    localStorage.setItem("head", label);
  };

  useEffect(() => {
    const path = location.pathname;
    const routeActive = (route) =>
      route && (path === route || path.startsWith(`${route}/`));
    menuItems.forEach((item) => {
      if (!item.dropdown) return;
      const hit = item.dropdown.some((sub) => routeActive(sub.to));
      if (!hit) return;
      if (item.label === "Leads") setOpenLeads(true);
      if (item.label === "Visitors") setOpenVisitors(true);
      if (item.label === "Projects") setOpenProjects(true);
      if (item.label === "Employees") setOpenEmployees(true);
      if (item.label === "Partners") setOpenPartners(true);
      if (item.label === "Promotions") setOpenPromotions(true);
      if (item.label === "Subscription Plans") setOpenSubscriptionPlans(true);
      if (item.label === "Manage Reparv") setOpenManageReparv(true);
    });
  }, [location.pathname]);

  return (
    <div className="flex flex-col w-full h-screen bg-[#F5F5F6]">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center justify-between px-5 py-3 bg-white shadow-sm">
        <img src={reparvMainLogo} alt="Reparv Logo" className="h-10" />
        <div className="ButtonContainer flex gap-4 items-center justify-center">
          <FaUserCircle
            onClick={() => {
              setShowProfile("true");
            }}
            className="w-8 h-8 text-[#076300]"
          />
          <LogoutButton />
          <button
            className="p-2 rounded-md bg-gray-100 text-black hover:text-[#076300] active:scale-95"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen === false ? (
              <IoMenu size={24} />
            ) : (
              <IoMdClose size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Navbar */}
      <div className="navbar hidden h-[72px] w-full shrink-0 items-center justify-center border-b border-gray-200/90 bg-white md:flex">
        <div className="navLogo flex h-[72px] w-[260px] shrink-0 items-center justify-center border-r border-gray-100 bg-[#FAFAFA]">
          <img
            src={reparvMainLogo}
            alt="Reparv Logo"
            className="mb-0.5 w-[92px]"
          />
        </div>

        <div className="navHeading flex h-full w-full min-w-0 items-center justify-between px-6 text-lg font-semibold">
          <div className="left-heading flex min-w-0 items-center gap-3 text-[18px] font-semibold tracking-tight text-gray-900">
            <button
              type="button"
              aria-label={isShortBar ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setIsShortbar(!isShortBar)}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]"
            >
              <IoMenu className="size-6" />
            </button>
            <p className="truncate">{heading}</p>
          </div>
          <div className="right-heading flex h-10 shrink-0 items-center gap-4">
            <FaUserCircle
              onClick={() => {
                setShowProfile("true");
              }}
              className="w-8 h-8 text-[#076300]"
            />
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Sidebar + main */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[54] bg-gray-900/35 backdrop-blur-[1px] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}
        <aside
          className={[
            "flex h-full min-h-0 flex-col border-r border-gray-200/90 bg-white shadow-[2px_0_24px_-16px_rgba(0,0,0,0.08)]",
            "fixed z-[55] transition-[transform,width] duration-300 ease-out md:static md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            isShortBar ? "w-[76px] md:w-[76px]" : "w-[min(100vw-3rem,280px)] md:w-[260px]",
          ].join(" ")}
        >
          <div className="scrollbar-hide flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 md:px-3">
            <img
              src={reparvMainLogo}
              alt="Reparv"
              className="mx-auto mb-2 h-9 w-auto shrink-0 object-contain md:hidden"
            />

            <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
              {menuItems.map((item, index) => {
                const dropdownOpen =
                  (item.label === "Leads" && openLeads) ||
                  (item.label === "Visitors" && openVisitors) ||
                  (item.label === "Projects" && openProjects) ||
                  (item.label === "Employees" && openEmployees) ||
                  (item.label === "Partners" && openPartners) ||
                  (item.label === "Promotions" && openPromotions) ||
                  (item.label === "Subscription Plans" &&
                    openSubscriptionPlans) ||
                  (item.label === "Manage Reparv" && openManageReparv);

                const toggleDropdown = () => {
                  if (item.label === "Leads") setOpenLeads((o) => !o);
                  if (item.label === "Visitors") setOpenVisitors((o) => !o);
                  if (item.label === "Projects") setOpenProjects((o) => !o);
                  if (item.label === "Employees") setOpenEmployees((o) => !o);
                  if (item.label === "Partners") setOpenPartners((o) => !o);
                  if (item.label === "Promotions") setOpenPromotions((o) => !o);
                  if (item.label === "Subscription Plans")
                    setOpenSubscriptionPlans((o) => !o);
                  if (item.label === "Manage Reparv")
                    setOpenManageReparv((o) => !o);
                };

                const childActive =
                  item.dropdown?.some((sub) => isPathActive(sub.to)) ?? false;

                const parentActive =
                  !item.dropdown && isPathActive(item.to)
                    ? true
                    : item.dropdown
                      ? childActive
                      : false;

                const iconShell = (
                  <span
                    className={[
                      "flex size-9 shrink-0 items-center justify-center rounded-[11px] border transition-colors duration-150 md:size-10",
                      parentActive
                        ? "border-[#076300]/25 bg-[#076300]/10 text-[#076300]"
                        : "border-gray-100 bg-gray-50 text-gray-600 group-hover:border-gray-200 group-hover:bg-white group-hover:text-gray-800",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>
                );

                return (
                  <div key={index} className="w-full">
                    {item.dropdown ? (
                      <button
                        type="button"
                        aria-expanded={dropdownOpen}
                        onClick={() => {
                          toggleDropdown();
                        }}
                        title={isShortBar ? item.label : undefined}
                        className={[
                          "group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors duration-150 md:gap-3 md:px-2.5",
                          parentActive
                            ? "bg-[#E3FFDF] text-[#076300] shadow-[inset_0_0_0_1px_rgba(7,99,0,0.1)]"
                            : "text-gray-800 hover:bg-gray-50",
                          isShortBar ? "justify-center md:px-1.5" : "",
                        ].join(" ")}
                      >
                        {iconShell}
                        <span
                          className={[
                            "min-w-0 flex-1 text-left text-[13px] font-semibold leading-snug tracking-tight md:text-[14px]",
                            isShortBar ? "md:sr-only" : "",
                          ].join(" ")}
                        >
                          {item.label}
                        </span>
                        <span
                          className={[
                            "flex shrink-0 text-gray-400 transition-transform duration-200",
                            dropdownOpen ? "rotate-180" : "",
                            isShortBar ? "md:hidden" : "",
                          ].join(" ")}
                        >
                          <RiArrowDropDownLine size={22} className="-mr-1" />
                        </span>
                      </button>
                    ) : (
                      <NavLink
                        to={item.to}
                        title={isShortBar ? item.label : undefined}
                        onClick={() => {
                          setIsSidebarOpen(false);
                          getHeading(item.label);
                        }}
                        className={({ isActive }) =>
                          [
                            "group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 transition-colors duration-150 md:gap-3 md:px-2.5",
                            isActive
                              ? "bg-[#E3FFDF] text-[#076300] shadow-[inset_0_0_0_1px_rgba(7,99,0,0.1)]"
                              : "text-gray-800 hover:bg-gray-50",
                            isShortBar ? "justify-center md:px-1.5" : "",
                          ].join(" ")
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={[
                                "flex size-9 shrink-0 items-center justify-center rounded-[11px] border transition-colors duration-150 md:size-10",
                                isActive
                                  ? "border-[#076300]/25 bg-[#076300]/10 text-[#076300]"
                                  : "border-gray-100 bg-gray-50 text-gray-600 group-hover:border-gray-200 group-hover:bg-white group-hover:text-gray-800",
                              ].join(" ")}
                            >
                              {item.icon}
                            </span>
                            <span
                              className={[
                                "min-w-0 flex-1 text-left text-[13px] font-semibold leading-snug tracking-tight md:text-[14px]",
                                isShortBar ? "md:sr-only" : "",
                              ].join(" ")}
                            >
                              {item.label}
                            </span>
                          </>
                        )}
                      </NavLink>
                    )}

                    {item.dropdown && (
                      <div
                        className={[
                          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                          dropdownOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                          isShortBar ? "md:hidden" : "",
                        ].join(" ")}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="mt-1 flex gap-0 border-l-2 border-gray-100 pl-2.5 ml-4 md:ml-5">
                            <div className="flex flex-1 flex-col gap-0.5 py-0.5">
                              {item.dropdown.map((sub, i) => (
                                <NavLink
                                  key={i}
                                  to={sub.to}
                                  end
                                  onClick={() => {
                                    getHeading(sub.label);
                                    setIsSidebarOpen(false);
                                  }}
                                  className={leafLinkClass}
                                >
                                  {sub.label}
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide bg-[#F5F5F6] md:p-4 md:pl-4 md:pt-0"
          onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
        >
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
      </div>
      {showProfile && <Profile />}

      {overlays.map(({ state, setter }, index) =>
        state ? (
          <div
            key={index}
            className="w-full h-screen z-[60] fixed bg-[#767676a0]"
            onClick={() => setter(false)}
          ></div>
        ) : null,
      )}
    </div>
  );
}

export default Layout;
