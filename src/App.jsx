import "./App.css";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import PublicRoute from "./components/auth/PublicRoute.jsx";
import AuthSessionWatcher from "./components/auth/AuthSessionWatcher.jsx";
import PropertyFormPage from "./pages/PropertyFormPage.jsx";

const Layout = lazy(() => import("./components/layout/Layout.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Enquirers = lazy(() => import("./pages/Enquirers.jsx"));
const DigitalBroker = lazy(() => import("./pages/DigitalBroker.jsx"));
const Map = lazy(() => import("./pages/Map.jsx"));
const Calender = lazy(() => import("./pages/Calender.jsx"));
const Customers = lazy(() => import("./pages/Customers.jsx"));
const Ticketing = lazy(() => import("./pages/Ticketing.jsx"));
const MarketingContent = lazy(() => import("./pages/MarketingContent.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Employee = lazy(() => import("./pages/Employee.jsx"));
const Builders = lazy(() => import("./pages/Builders.jsx"));
const Promoter = lazy(() => import("./pages/Promoter.jsx"));
const SalesPerson = lazy(() => import("./pages/SalesPerson.jsx"));
const OnBoardingPartner = lazy(() => import("./pages/OnBoardingPartner.jsx"));
const ProjectPartner = lazy(() => import("./pages/ProjectPartner.jsx"));
const PartnerLeads = lazy(() => import("./pages/PartnerLeads.jsx"));
const TerritoryPartner = lazy(() => import("./pages/TerritoryPartner.jsx"));
const GuestUser = lazy(() => import("./pages/guestUser.jsx"));
const Subscription = lazy(() => import("./pages/Subscription.jsx"));
const UserSubscriptions = lazy(() => import("./pages/UserSubscriptions.jsx"));
const GstBills = lazy(() => import("./pages/GstBills.jsx"));
const SubscriptionAnalytics = lazy(
  () => import("./pages/SubscriptionAnalytics.jsx"),
);
const Properties = lazy(() => import("./pages/Properties.jsx"));
const Role = lazy(() => import("./pages/Role.jsx"));
const Department = lazy(() => import("./pages/Department.jsx"));
const ErrorPage = lazy(() => import("./pages/ErrorPage.jsx"));
const Slider = lazy(() => import("./pages/Slider.jsx"));
const Testimonial = lazy(() => import("./pages/Testimonial.jsx"));
const Blogs = lazy(() => import("./pages/Blogs.jsx"));
const News = lazy(() => import("./pages/News.jsx"));
const ApkUpload = lazy(() => import("./pages/ApkUpload.jsx"));
const UsersLoanEligibility = lazy(
  () => import("./pages/UsersLoanEligibility.jsx"),
);
const UpdateEMI = lazy(
  () => import("./components/usersLoanEligibility/UpdateEMI.jsx"),
);
const Trends = lazy(() => import("./pages/Trends.jsx"));
const PropertyAuthority = lazy(() => import("./pages/PropertyAuthority.jsx"));
const PropertiesFlatAndPlotInfo = lazy(
  () => import("./pages/PropertiesFlatAndPlotInfo.jsx"),
);
const AdsManager = lazy(() => import("./pages/AdsManager.jsx"));
const Messages = lazy(() => import("./pages/Messages.jsx"));
const ScheduledRequests = lazy(() => import("./pages/ScheduledRequests.jsx"));
const FAQs = lazy(() => import("./pages/FAQs.jsx"));
const BlogFAQs = lazy(() => import("./pages/BlogFAQ.jsx"));
const CallEnquirers = lazy(() => import("./pages/CallEnquirers.jsx"));
const MetaLeads = lazy(() => import("./pages/MetaLeads.jsx"));
const WhatsappEnquirers = lazy(() => import("./pages/WhatsappEnquirers.jsx"));
const WhatsappChat = lazy(() => import("./pages/WhatsappChat.jsx"));
const AiLeads = lazy(() => import("./pages/AiLeads.jsx"));
const AiConversations = lazy(() => import("./pages/AiConversations.jsx"));
const ContactUsMessages = lazy(() => import("./pages/ContactUsMessages.jsx"));
const Subscribers = lazy(() => import("./pages/Subscribers.jsx"));
const SubscriptionFeatures = lazy(
  () => import("./pages/SubscriptionFeatures.jsx"),
);

const App = () => {
  return (
    <>
      <AuthSessionWatcher />
      <ScrollToTop />
      <Routes>
        <Route
          path=""
          element={
            <PublicRoute>
              <Suspense fallback={null}>
                <Login />
              </Suspense>
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Suspense fallback={null}>
                <Layout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/enquirers" element={<Enquirers />} />
          <Route path="/call-enquirers" element={<CallEnquirers />} />
          <Route path="/whatsapp-enquirers" element={<WhatsappEnquirers />} />
          <Route path="/whatsapp-chat" element={<WhatsappChat />} />
          <Route path="/meta-leads" element={<MetaLeads />} />
          <Route path="/ai-leads" element={<AiLeads />} />
          <Route path="/ai-conversations" element={<AiConversations />} />
          <Route path="/digital-broker" element={<DigitalBroker />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/add" element={<PropertyFormPage />} />
          <Route path="/properties/edit/:id" element={<PropertyFormPage />} />
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
          <Route path="/partner-leads" element={<PartnerLeads />} />
          <Route path="/territorypartner" element={<TerritoryPartner />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/contact-us-messages" element={<ContactUsMessages />} />
          <Route path="/scheduled-requests" element={<ScheduledRequests />} />
          <Route path="/subscription-pricing" element={<Subscription />} />
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
          <Route path="/news" element={<News />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/subscribers" element={<Subscribers />} />
          <Route
            path="/subscription-features"
            element={<SubscriptionFeatures />}
          />
          <Route path="/user-subscriptions" element={<UserSubscriptions />} />
          <Route path="/gst-bills" element={<GstBills />} />
          <Route
            path="/subscription-analytics"
            element={<SubscriptionAnalytics />}
          />
          <Route path="/marketing-content" element={<MarketingContent />} />
        </Route>

        <Route
          path="*"
          element={
            <Suspense fallback={null}>
              <ErrorPage />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
};

export default App;
