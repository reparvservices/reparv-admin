import React from "react";
import { useAuth } from "../../store/auth";

const UsersLoanEligibilityFilter = ({ counts = {} }) => {
  const { filterStatus, setFilterStatus } = useAuth();

  const filterOptions = [
    {
      name: "New",
      label: "New",
      bg: "bg-blue-100",
      text: "text-blue-600",
      count: counts?.New || 0,
    },
    {
      name: "Eligible",
      label: "Eligible",
      bg: "bg-green-100",
      text: "text-green-600",
      count: counts?.Eligible || 0,
    },
    {
      name: "Not Eligible",
      label: "Not Eligible",
      bg: "bg-red-100",
      text: "text-red-600",
      count: counts["Not Eligible"] || 0,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center z-10">
      {filterOptions.map((option) => {
        const isActive = filterStatus === option.label;
        return (
          <button
            key={option.label}
            onClick={() => setFilterStatus(option.label)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border font-medium transition-all duration-200
              ${
                isActive
                  ? `${option.bg} ${option.text}`
                  : "bg-white text-black text-sm"
              }
              hover:opacity-90`}
          >
            <span>{option.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold
                ${
                  isActive
                    ? `${option.text} bg-white`
                    : "text-gray-500 bg-gray-200"
                }
              `}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default UsersLoanEligibilityFilter;
