import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaHeart,
  FaPhoneAlt,
  FaWhatsapp,
  FaShareAlt,
} from "react-icons/fa";
import { formatNumber } from "../../utils/formatNumber";

function hasMetric(value) {
  return value !== undefined && value !== null;
}

function AnalyticsRow({ analytics }) {
  if (!analytics) return null;
  const items = [
    hasMetric(analytics.views) && {
      icon: FaEye,
      value: analytics.views,
      className: "text-blue-500",
    },
    hasMetric(analytics.likes) && {
      icon: FaHeart,
      value: analytics.likes,
      className: "text-red-500",
    },
    hasMetric(analytics.shares) && {
      icon: FaShareAlt,
      value: analytics.shares,
      className: "text-green-500",
    },
    hasMetric(analytics.call_enquirers) && {
      icon: FaPhoneAlt,
      value: analytics.call_enquirers,
      className: "text-blue-500",
    },
    hasMetric(analytics.whatsapp_enquirers) && {
      icon: FaWhatsapp,
      value: analytics.whatsapp_enquirers,
      className: "text-green-600",
    },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 w-full text-xs text-gray-600 font-medium border-t border-gray-100 pt-2 mt-2">
      {items.map(({ icon: Icon, value, className }, i) => (
        <div key={i} className="flex items-center gap-1">
          <Icon className={className} size={12} />
          {formatNumber(value)}
        </div>
      ))}
    </div>
  );
}

export default function DashboardStatGrid({ counts }) {
  const navigate = useNavigate();
  const c = counts || {};

  const cards = [
    {
      label: "Enquiries",
      value: c.totalEnquiry,
      to: "/enquirers",
      analytics: {
        call_enquirers: c.call_enquirers,
        whatsapp_enquirers: c.whatsapp_enquirers,
      },
    },
    {
      label: "Properties",
      value: c.totalProperty,
      to: "/properties",
      analytics: {
        views: c.propertyViews,
        likes: c.propertyLikes,
        shares: c.propertyShares,
      },
    },
    {
      label: "Blogs",
      value: c.totalBlog,
      to: "/blogs",
      analytics: { views: c.blogViews, likes: c.blogLikes, shares: c.blogShares },
    },
    {
      label: "News",
      value: c.totalNews,
      to: "/news",
      analytics: { views: c.newsViews, likes: c.newsLikes, shares: c.newsShares },
    },
    { label: "Builders", value: c.totalBuilder, to: "/builders" },
    { label: "Employees", value: c.totalEmployee, to: "/employees" },
    { label: "Promoters", value: c.totalPromoter, to: "/promoters" },
    { label: "Project partners", value: c.totalProjectPartner, to: "/projectpartner" },
    { label: "Sales partners", value: c.totalSalesPerson, to: "/salespersons" },
    { label: "Territory partners", value: c.totalTerritoryPartner, to: "/territorypartner" },
    { label: "Onboarding partners", value: c.totalOnboardingPartner, to: "/onboardingpartner" },
    { label: "Guest users", value: c.totalGuestUser, to: "/guest-users" },
    { label: "Tickets", value: c.totalTicket, to: "/tickets" },
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Platform directory</h2>
        <p className="text-sm text-gray-500">Click a card to open the management page</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => navigate(card.to)}
            className="text-left rounded-2xl border border-gray-200 bg-white p-4 hover:border-[#076300] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-700 group-hover:text-[#076300]">
                {card.label}
              </p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">
                {Number(card.value || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <AnalyticsRow analytics={card.analytics} />
          </button>
        ))}
      </div>
    </section>
  );
}
