import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Enquirers from "./pages/Enquirers.jsx";
import DigitalBroker from "./pages/DigitalBroker.jsx";
import Map from "./pages/Map.jsx";
import Calender from "./pages/Calender.jsx";
import Customers from "./pages/Customers.jsx";
import Ticketing from "./pages/Ticketing.jsx";
import MarketingContent from "./pages/MarketingContent.jsx";
import Login from "./pages/Login.jsx";
import Employee from "./pages/Employee.jsx";
import Builders from "./pages/Builders.jsx";
import Promoter from "./pages/Promoter.jsx";
import SalesPerson from "./pages/SalesPerson.jsx";
import OnBoardingPartner from "./pages/OnBoardingPartner.jsx";
import ProjectPartner from "./pages/ProjectPartner.jsx";
import TerritoryPartner from "./pages/TerritoryPartner.jsx";
import GuestUser from "./pages/guestUser.jsx";
import Subscription from "./pages/Subscription.jsx";
import Properties from "./pages/Properties.jsx";
import Role from "./pages/Role.jsx";
import Department from "./pages/Department.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Slider from "./pages/Slider.jsx";
import Testimonial from "./pages/Testimonial.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Blogs from "./pages/Blogs.jsx";
import ApkUpload from "./pages/ApkUpload.jsx";
import UsersLoanEligibility from "./pages/UsersLoanEligibility.jsx";
import UpdateEMI from "./components/usersLoanEligibility/UpdateEMI.jsx";
import Trends from "./pages/Trends.jsx";
//import BrandAccessories from "./pages/BrandAccessories.jsx";
import PropertyAuthority from "./pages/PropertyAuthority.jsx";
import SubscriptionDiscount from "./pages/SubscriptionDiscount.jsx";
import PropertiesFlatAndPlotInfo from "./pages/PropertiesFlatAndPlotInfo.jsx";
import AdsManager from "./pages/AdsManager.jsx";
import Messages from "./pages/Messages.jsx";
import ScheduledRequests from "./pages/ScheduledRequests.jsx";
import FAQs from "./pages/FAQs.jsx";
import BlogFAQs from "./pages/BlogFAQ.jsx";
import CallEnquirers from "./pages/CallEnquirers.jsx";
import WhatsappEnquirers from "./pages/WhatsappEnquirers.jsx";
import ContactUsMessages from "./pages/ContactUsMessages.jsx";

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Login Page */}
        <Route path="" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/enquirers" element={<Enquirers />} />
          <Route path="/call-enquirers" element={<CallEnquirers />} />
          <Route path="/whatsapp-enquirers" element={<WhatsappEnquirers />} />
          <Route path="/digital-broker" element={<DigitalBroker />} />
          <Route path="/properties" element={<Properties />} />
          <Route
            path="/property/additional-info/:propertyid"
            element={<PropertiesFlatAndPlotInfo />}
          />
          <Route path="/map" element={<Map />} />
          <Route path="/calender" element={<Calender />} />
          <Route path="/ads-manager" element={<AdsManager />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/guest-users" element={<GuestUser />} />
          <Route path="/builders" element={<Builders />} />
          <Route path="/promoters" element={<Promoter />} />
          <Route path="/salespersons" element={<SalesPerson />} />
          <Route path="/onboardingpartner" element={<OnBoardingPartner />} />
          <Route path="/projectpartner" element={<ProjectPartner />} />
          <Route path="/territorypartner" element={<TerritoryPartner />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/contact-us-messages" element={<ContactUsMessages />} />
          <Route path="/scheduled-requests" element={<ScheduledRequests />} />
          <Route path="/subscription-pricing" element={<Subscription />} />
          <Route
            path="/subscription-discount"
            element={<SubscriptionDiscount />}
          />
          <Route path="/employees" element={<Employee />} />
          <Route path="/role" element={<Role />} />
          <Route path="/department" element={<Department />} />
          <Route path="/property-authorities" element={<PropertyAuthority />} />
          <Route path="/tickets" element={<Ticketing />} />
          <Route path="/slider" element={<Slider />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route
            path="/users-loan-eligibility"
            element={<UsersLoanEligibility />}
          />
          <Route
            path="/user-loan-eligibility-data-update/:id"
            element={<UpdateEMI />}
          />
          <Route path="/apk-upload" element={<ApkUpload />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/manage-faqs/:blogId" element={<BlogFAQs />} />
          <Route path="/trends" element={<Trends />} />
          {/*<Route path="/brand-accessories" element={<BrandAccessories />} />*/}
          <Route path="/marketing-content" element={<MarketingContent />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

export default App;
