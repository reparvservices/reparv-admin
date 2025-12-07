import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(Cookies.get("accessToken"));

  let isLoggedIn = !!accessToken;

  const storeTokenInCookie = (token) => {
    Cookies.set("accessToken", token);
    setAccessToken(Cookies.get("accessToken"));
  };
  const delTokenInCookie = () => {
    setAccessToken();
    Cookies.remove("accessToken");
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("adminUser");
  };
  const URI = "http://localhost:3000";
  //const URI = "https://api.reparv.in";

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("adminUser"))
  );
  const [loading, setLoading] = useState(false);
  const [showEmployee, setShowEmployee] = useState(false);
  const [showEplDetailsForm, setShowEplDetailsForm] = useState(false);
  const [showBuilderForm, setShowBuilderForm] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [showSalesPerson, setShowSalesPerson] = useState(false);
  const [showAuctionForm, setShowAuctionForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showPropertyTypeForm, setShowPropertyTypeForm] = useState(false);

  // Set Object For Show Property and Partner Commission
  const [propertyCommissionData, setPropertyCommissionData] = useState({});
  const [showPropertyCommissionPopup, setShowPropertyCommissionPopup] =
    useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);

  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTicketInfo, setShowTicketInfo] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [action, setAction] = useState("Save Details");
  const [isActive, setIsActive] = useState("Builders");
  const [showPaymentIdForm, setShowPaymentIdForm] = useState(false);
  const [giveAccess, setGiveAccess] = useState(false);
  const [showAssignTaskForm, setShowAssignTaskForm] = useState(false);
  const [showUpdateImagesForm, setShowUpdateImagesForm] = useState(false);
  const [showAdditionalInfoForm, setShowAdditionalInfoForm] = useState(false);
  const [showNewPlotAdditionalInfoForm, setShowNewPlotAdditionalInfoForm] =
    useState(false);
  const [showAssignSalesForm, setShowAssignSalesForm] = useState(false);
  const [showEnquiryStatusForm, setShowEnquiryStatusForm] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [showEnquiryUpdateForm, setShowEnquiryUpdateForm] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showPropertyInfo, setShowPropertyInfo] = useState(false);
  const [showEnquirerPropertyForm, setShowEnquirerPropertyForm] =
    useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [showSliderForm, setShowSliderForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showRejectReasonForm, setShowRejectReasonForm] = useState(false);
  const [showPartner, setShowPartner] = useState(false);
  const [showAddMobileImage, setShowAddMobileImage] = useState(false);
  const [showFollowUpList, setShowFollowUpList] = useState(false);
  const [showSeoForm, setShowSeoForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showCommissionForm, setShowCommissionForm] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showCustomerPaymentForm, setShowCustomerPaymentForm] = useState(false);
  const [showApkUploadForm, setShowApkUploadForm] = useState(false);
  const [partnerPaymentStatus, setPartnerPaymentStatus] = useState("Unpaid");
  const [showEMIForm, setShowEMIForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("New");
  const [showEMI, setShowEMI] = useState(false);
  const [enquiryFilter, setEnquiryFilter] = useState("New");
  const [propertyFilter, setPropertyFilter] = useState("Approved");
  const [showContentUploadForm, setShowContentUploadForm] = useState(false);
  const [showTrendForm, setShowTrendForm] = useState(false);
  const [orderFilter, setOrderFilter] = useState("New");
  const [showProduct, setShowProduct] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showVideoUploadForm, setShowVideoUploadForm] = useState(false);
  const [showPropertyLocationForm, setShowPropertyLocationForm] =
    useState(false);
  const [showAuthorityForm, setShowAuthorityForm] = useState(false);
  const [showSubscriptionPlan, setShowSubscriptionPlan] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showAssignProjectPartnerForm, setShowAssignProjectPartnerForm] =
    useState(false);
  const [showNotePopup, setShowNotePopup] = useState(false);

  const [showAdsManager, setShowAdsManager] = useState(false);
  const [showAdsManagerForm, setShowAdsManagerForm] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        URI,
        user,
        setUser,
        loading,
        setLoading,
        isLoggedIn,
        storeTokenInCookie,
        delTokenInCookie,
        accessToken,
        setAccessToken,
        showEmployee,
        setShowEmployee,
        showEplDetailsForm,
        setShowEplDetailsForm,
        action,
        setAction,
        showProfile,
        setShowProfile,
        showBuilderForm,
        setShowBuilderForm,
        showBuilder,
        setShowBuilder,
        showSalesForm,
        setShowSalesForm,
        showSalesPerson,
        setShowSalesPerson,
        showAuctionForm,
        setShowAuctionForm,
        showTicketInfo,
        setShowTicketInfo,
        showTicketForm,
        setShowTicketForm,
        showTicket,
        setShowTicket,
        showResponseForm,
        setShowResponseForm,
        isActive,
        setIsActive,
        showPropertyForm,
        setShowPropertyForm,
        showPropertyTypeForm,
        setShowPropertyTypeForm,
        showRoleForm,
        setShowRoleForm,
        showDepartmentForm,
        setShowDepartmentForm,
        showPaymentIdForm,
        setShowPaymentIdForm,
        giveAccess,
        setGiveAccess,
        showInfo,
        setShowInfo,
        showInfoForm,
        setShowInfoForm,
        showAssignTaskForm,
        setShowAssignTaskForm,
        showUpdateImagesForm,
        setShowUpdateImagesForm,
        showAdditionalInfoForm,
        setShowAdditionalInfoForm,
        showNewPlotAdditionalInfoForm,
        setShowNewPlotAdditionalInfoForm,
        showAssignSalesForm,
        setShowAssignSalesForm,
        showEnquiryStatusForm,
        setShowEnquiryStatusForm,
        showEnquiryForm,
        setShowEnquiryForm,
        showEnquiryUpdateForm,
        setShowEnquiryUpdateForm,
        showEnquiry,
        setShowEnquiry,
        showPropertyInfo,
        setShowPropertyInfo,
        showEnquirerPropertyForm,
        setShowEnquirerPropertyForm,
        showSliderForm,
        setShowSliderForm,
        showFeedbackForm,
        setShowFeedbackForm,
        showPartnerForm,
        setShowPartnerForm,
        showRejectReasonForm,
        setShowRejectReasonForm,
        showPartner,
        setShowPartner,
        showAddMobileImage,
        setShowAddMobileImage,
        showFollowUpList,
        setShowFollowUpList,
        showSeoForm,
        setShowSeoForm,
        showBlogForm,
        setShowBlogForm,
        showCommissionForm,
        setShowCommissionForm,
        partnerPaymentStatus,
        setPartnerPaymentStatus,
        showCustomer,
        setShowCustomer,
        showApkUploadForm,
        setShowApkUploadForm,
        showCustomerPaymentForm,
        setShowCustomerPaymentForm,
        filterStatus,
        setFilterStatus,
        showEMI,
        setShowEMI,
        showEMIForm,
        setShowEMIForm,
        enquiryFilter,
        setEnquiryFilter,
        propertyFilter,
        setPropertyFilter,
        showContentUploadForm,
        setShowContentUploadForm,
        showTrendForm,
        setShowTrendForm,
        orderFilter,
        setOrderFilter,
        showProduct,
        setShowProduct,
        showProductForm,
        setShowProductForm,
        showStockForm,
        setShowStockForm,
        showOrder,
        setShowOrder,
        showStatusForm,
        setShowStatusForm,
        showVideoUploadForm,
        setShowVideoUploadForm,
        showPropertyLocationForm,
        setShowPropertyLocationForm,
        propertyCommissionData,
        setPropertyCommissionData,
        showPropertyCommissionPopup,
        setShowPropertyCommissionPopup,
        showAuthorityForm,
        setShowAuthorityForm,
        showSubscriptionPlan,
        setShowSubscriptionPlan,
        showSubscriptionForm,
        setShowSubscriptionForm,
        showDiscount,
        setShowDiscount,
        showDiscountForm,
        setShowDiscountForm,
        showAssignProjectPartnerForm,
        setShowAssignProjectPartnerForm,
        showNotePopup,
        setShowNotePopup,

        showAdsManager,
        setShowAdsManager,
        showAdsManagerForm,
        setShowAdsManagerForm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
