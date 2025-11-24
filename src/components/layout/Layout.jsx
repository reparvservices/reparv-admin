import React, { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import reparvMainLogo from "../../assets/layout/reparvMainLogo.svg";
import calenderIcon from "../../assets/layout/calenderIcon.svg";
import customersIcon from "../../assets/layout/customersIcon.svg";
import enquirersIcon from "../../assets/layout/enquirersIcon.svg";
import mapIcon from "../../assets/layout/mapIcon.svg";
import materialIcon from "../../assets/layout/materialIcon.svg";
import overviewIcon from "../../assets/layout/overviewIcon.svg";
import partnerIcon from "../../assets/layout/partnerIcon.svg";
import employeeIcon from "../../assets/layout/employeeIcon.svg";
import ticketingIcon from "../../assets/layout/ticketingIcon.svg";
import marketingIcon from "../../assets/layout/marketingIcon.svg";
import { Outlet } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import Profile from "../Profile";
import { useAuth } from "../../store/auth";
import LogoutButton from "../LogoutButton";
import { FaUserCircle } from "react-icons/fa";

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
    showNotePopup, setShowNotePopup,
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
  ];

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
            isShortBar ? "md:w-[95px]" : "md:w-60"
          } h-full fixed overflow-y-scroll scrollbar-hide bg-white shadow-md md:shadow-none md:static top-0 left-0 z-20 md:bg-[#F5F5F6] transition-transform duration-300 transform ${
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
            {[
              { to: "/dashboard", icon: overviewIcon, label: "Dashboard" },
              { to: "/enquirers", icon: enquirersIcon, label: "Enquirers" },
              { to: "/digital-broker", icon: enquirersIcon, label: "Digital Broker" },
              { to: "/customers", icon: customersIcon, label: "Customers" },
              { to: "/properties", icon: enquirersIcon, label: "Properties" },
              { to: "/map", icon: mapIcon, label: "Map" },
              { to: "/calender", icon: calenderIcon, label: "Calendar" },
              { to: "/employees", icon: employeeIcon, label: "Employees" },
              { to: "/builders", icon: partnerIcon, label: "Builders" },
              { to: "/promoters", icon: partnerIcon, label: "Promoters" },
              {
                to: "/projectpartner",
                icon: partnerIcon,
                label: "Project Partners",
              },
              {
                to: "/salespersons",
                icon: partnerIcon,
                label: "Sales Partner",
              },
              {
                to: "/onboardingpartner",
                icon: partnerIcon,
                label: "Onboarding Partners",
              },
              {
                to: "/territorypartner",
                icon: partnerIcon,
                label: "Territory Partners",
              },
              { to: "/guest-users", icon: partnerIcon, label: "Guest Users" },
              {
                to: "/subscription-pricing",
                icon: partnerIcon,
                label: "Subscription Pricing",
              },
              {
                to: "/subscription-discount",
                icon: partnerIcon,
                label: "Subscription Discount",
              },
              {
                to: "/users-loan-eligibility",
                icon: partnerIcon,
                label: "Users Loan Eligibility",
              },
              { to: "/role", icon: employeeIcon, label: "Roles" },
              { to: "/department", icon: employeeIcon, label: "Departments" },
              { to: "/tickets", icon: ticketingIcon, label: "Tickets" },
              {
                to: "/property-authorities",
                icon: employeeIcon,
                label: "Authorities",
              },
              { to: "/apk-upload", icon: marketingIcon, label: "Apk Upload" },
              { to: "/blogs", icon: marketingIcon, label: "Blogs" },
              { to: "/trends", icon: marketingIcon, label: "Trends" },
              { to: "/slider", icon: marketingIcon, label: "Slider" },
              { to: "/testimonial", icon: marketingIcon, label: "Testimonial" },
              {
                to: "/marketing-content",
                icon: marketingIcon,
                label: "Marketing Content",
              },
            ].map(({ to, icon, label }) => (
              <NavLink
                onClick={() => {
                  setIsSidebarOpen(false);
                  getHeading(label);
                }}
                key={to}
                to={isLoggedIn === true ? to : "/"}
                className={`flex items-center gap-3 w-full p-3 rounded-[20px] transition-all duration-300 text-black ${getNavLinkClass(
                  to
                )}`}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-[12px] bg-white">
                  <img
                    src={icon}
                    alt={`${label} Icon`}
                    className="md:h-6 md:w-6 w-5 h-5"
                  />
                </div>
                <span
                  className={`text-sm md:text-base ${
                    isShortBar ? "md:hidden" : "block"
                  }`}
                >
                  {label}
                </span>
              </NavLink>
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
