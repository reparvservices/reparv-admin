import React, { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import reparvMainLogo from "../../assets/layout/reparvMainLogo.svg";
import { Outlet } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import Profile from "../Profile";
import { useAuth } from "../../store/auth";
import LogoutButton from "../LogoutButton";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";
import { PiArrowElbowDownRightBold } from "react-icons/pi";

import { MdDashboard } from "react-icons/md";
import { IoIosListBox } from "react-icons/io";
import { HiUsers } from "react-icons/hi2";
import { PiBuildingsFill } from "react-icons/pi";
import { FaMapLocationDot } from "react-icons/fa6";
import { RiAdvertisementFill } from "react-icons/ri";
import { FaUserTie } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import { FaUsersGear } from "react-icons/fa6";
import { FaHandshake } from "react-icons/fa";
import { BiCalendar, BiSolidDiamond } from "react-icons/bi";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { FaClipboardUser } from "react-icons/fa6";
import { FaUserCog } from "react-icons/fa";
import { PiBuildingOfficeFill } from "react-icons/pi";
import { FaTicket } from "react-icons/fa6";
import { MdVerifiedUser } from "react-icons/md";
import { FaBloggerB } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";
import { MdFeedback } from "react-icons/md";
import { GrDocumentVideo } from "react-icons/gr";
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
      { label: "Digital Broker", to: "/digital-broker" },
    ],
  },

  // Customers
  {
    label: "Visitors",
    icon: <HiUsers size={21} />,
    dropdown: [
      { label: "Customers", to: "/customers" },
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
      { label: "Subscription Discount", to: "/subscription-discount" },
    ],
  },

  // Manage Reparv Dopdown
  {
    label: "Manage Reparv",
    icon: <FaPhotoVideo size={21} />,
    dropdown: [
      { to: "/faqs", label: "FAQs" },
      { to: "/blogs", label: "Blogs" },
      { label: "Trends", to: "/trends" },
      { label: "Slider", to: "/slider" },
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
    showDiscount,
    setShowDiscount,
    showDiscountForm,
    setShowDiscountForm,
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
    isLoggedIn,
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
    { state: showDiscount, setter: setShowDiscount },
    { state: showDiscountForm, setter: setShowDiscountForm },
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
  ];

  const [openLeads, setOpenLeads] = useState(false);
  const [openVisitors, setOpenVisitors] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);
  const [openEmployees, setOpenEmployees] = useState(false);
  const [openPartners, setOpenPartners] = useState(false);
  const [openPromotions, setOpenPromotions] = useState(false);
  const [openSubscriptionPlans, setOpenSubscriptionPlans] = useState(false);
  const [openManageReparv, setOpenManageReparv] = useState(false);

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? "font-semibold bg-[#E3FFDF] shadow-[0px_1px_0px_0px_rgba(0,_0,_0,_0.1)]"
      : "";
  };

  const getHeading = (label) => {
    setHeading(label);
    localStorage.setItem("head", label);
  };

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
      <div className="navbar hidden w-full h-[80px] md:flex items-center justify-center border-b-2">
        <div className="navLogo w-[300px] h-[80px] flex items-center justify-center">
          <img
            src={reparvMainLogo}
            alt="Reparv Logo"
            className="w-[100px] mb-2"
          />
        </div>

        <div className="navHeading w-full h-16 flex items-center justify-between text-lg font-semibold">
          <div className="left-heading h-8 flex gap-4 items-center justify-between text-[20px] leading-[19.36px] text-black">
            <IoMenu
              onClick={() => {
                setIsShortbar(!isShortBar);
              }}
              className="w-8 h-8 cursor-pointer active:scale-95"
            />{" "}
            <p>{heading}</p>
          </div>
          <div className="right-heading w-[135px] h-[40px] flex items-center justify-between mr-8">
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

      {/* Sidebar */}
      <div className="flex overflow-y-scroll scrollbar-hide">
        <div
          className={`w-64 ${
            isShortBar ? "md:w-[16px] " : "md:w-60"
          } h-full fixed overflow-y-scroll scrollbar-hide bg-white shadow-md md:shadow-none md:static top-0 left-0 z-[55] md:bg-[#F5F5F6] transition-transform duration-300 transform ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex flex-col items-center gap-2 p-4 md:gap-2">
            <img
              src={reparvMainLogo}
              alt="Reparv Logo"
              className="md:hidden block"
            />
            {/* Navigation Links */}
            {menuItems.map((item, index) => (
              <div key={index} className="w-full">
                {/* Parent menu button */}
                <NavLink
                  to={!item?.dropdown && item.to}
                  onClick={() => {
                    if (item.dropdown) {
                      if (item.label === "Leads") setOpenLeads(!openLeads);
                      if (item.label === "Visitors")
                        setOpenVisitors(!openVisitors);
                      if (item.label === "Projects")
                        setOpenProjects(!openProjects);
                      if (item.label === "Employees")
                        setOpenEmployees(!openEmployees);
                      if (item.label === "Partners")
                        setOpenPartners(!openPartners);
                      if (item.label === "Promotions")
                        setOpenPromotions(!openPromotions);
                      if (item.label === "Subscription Plans")
                        setOpenSubscriptionPlans(!openSubscriptionPlans);
                      if (item.label === "Manage Reparv")
                        setOpenManageReparv(!openManageReparv);
                    }
                    if (!item.dropdown) setIsSidebarOpen(false);
                    if (!item.dropdown) getHeading(item.label);
                  }}
                  className={`group flex items-center gap-3 w-full p-3 rounded-[20px] cursor-pointer transition-all duration-300 text-black ${getNavLinkClass(
                    item.to
                  )}`}
                >
                  <div className="min-w-8 min-h-8 md:min-w-10 md:min-h-10 flex items-center justify-center rounded-[12px] bg-white">
                    {item.icon}
                  </div>

                  <span
                    className={`text-sm md:text-base max-w-[80px] ${
                      isShortBar ? "md:hidden" : "block"
                    }`}
                  >
                    {item.label}
                  </span>

                  {item.dropdown && (
                    <div className="w-full flex items-end justify-end text-xs">
                      {(item.label === "Leads" && openLeads) ||
                      (item.label === "Visitors" && openVisitors) ||
                      (item.label === "Projects" && openProjects) ||
                      (item.label === "Employees" && openEmployees) ||
                      (item.label === "Partners" && openPartners) ||
                      (item.label === "Promotions" && openPromotions) ||
                      (item.label === "Subscription Plans" &&
                        openSubscriptionPlans) ||
                      (item.label === "Manage Reparv" && openManageReparv) ? (
                        <RiArrowDropUpLine
                          size={25}
                          className="min-w-[30px] text-right"
                        />
                      ) : (
                        <RiArrowDropDownLine
                          size={25}
                          className="min-w-[30px]"
                        />
                      )}
                    </div>
                  )}
                </NavLink>

                {/* Dropdown items */}
                {item.dropdown && (
                  <div
                    className={`flex ${
                      (item.label === "Leads" && openLeads) ||
                      (item.label === "Visitors" && openVisitors) ||
                      (item.label === "Projects" && openProjects) ||
                      (item.label === "Employees" && openEmployees) ||
                      (item.label === "Partners" && openPartners) ||
                      (item.label === "Promotions" && openPromotions) ||
                      (item.label === "Subscription Plans" &&
                        openSubscriptionPlans) ||
                      (item.label === "Manage Reparv" && openManageReparv)
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <div className="w-14 flex items-start justify-end">
                      <PiArrowElbowDownRightBold
                        size={20}
                        className="mr-2 mt-1"
                      />
                    </div>
                    <div className={`flex flex-col gap-1 transition-all`}>
                      {item.dropdown.map((sub, i) => (
                        <NavLink
                          key={i}
                          to={sub.to}
                          onClick={() => {
                            getHeading(sub.label);
                            setIsSidebarOpen(false);
                          }}
                          className={`text-sm py-2 px-4 rounded-xl hover:bg-[#E3FFDF] ${getNavLinkClass(
                            sub.to
                          )}`}
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 md:p-4 md:pl-0 md:pt-0 overflow-scroll scrollbar-hide"
          onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
        >
          <Outlet />
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
        ) : null
      )}
    </div>
  );
}

export default Layout;
