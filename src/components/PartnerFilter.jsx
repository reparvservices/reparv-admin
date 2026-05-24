import React from "react";
import { useAuth } from "../store/auth";

const LEGACY_OPTIONS = [
  { label: "Unpaid", bg: "bg-red-100", text: "text-red-600", countKey: "Unpaid" },
  { label: "Follow Up", bg: "bg-blue-100", text: "text-blue-600", countKey: "FollowUp" },
  { label: "Paid", bg: "bg-green-100", text: "text-green-600", countKey: "Paid" },
  { label: "Free", bg: "bg-yellow-100", text: "text-yellow-500", countKey: "Free" },
];

const SUBSCRIPTION_OPTIONS = [
  { label: "All", bg: "bg-gray-100", text: "text-gray-800", countKey: "All" },
  { label: "Unpaid", bg: "bg-red-100", text: "text-red-600", countKey: "Unpaid" },
  { label: "Follow Up", bg: "bg-blue-100", text: "text-blue-600", countKey: "FollowUp" },
  { label: "Trial", bg: "bg-violet-100", text: "text-violet-700", countKey: "Trial" },
  { label: "Paid", bg: "bg-emerald-100", text: "text-emerald-700", countKey: "Paid" },
  { label: "Enterprise", bg: "bg-slate-200", text: "text-slate-800", countKey: "Enterprise" },
  { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", countKey: "Pending" },
];

const PartnerFilter = ({
  counts = {},
  showRequestButton = false,
  variant = "legacy",
}) => {
  const { partnerPaymentStatus, setPartnerPaymentStatus } = useAuth();
  const baseOptions = variant === "subscription" ? SUBSCRIPTION_OPTIONS : LEGACY_OPTIONS;

  const filterOptions = [
    ...baseOptions,
    {
      label: "Partner Change Request",
      show: showRequestButton,
      bg: "bg-[#F4F0FB]",
      text: "text-[#5D00FF]",
      countKey: "Request",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 items-center z-10">
      {filterOptions.map((option) => {
        if (option.show === false) return null;
        const isActive = partnerPaymentStatus === option.label;
        const count = counts?.[option.countKey] ?? 0;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => setPartnerPaymentStatus(option.label)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm border font-medium transition-all duration-200
              ${
                isActive
                  ? `${option.bg} ${option.text} border-transparent`
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#076300]/30"
              }`}
          >
            <span>{option.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums
                ${
                  isActive
                    ? `${option.text} bg-white`
                    : "text-gray-500 bg-gray-100"
                }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PartnerFilter;
