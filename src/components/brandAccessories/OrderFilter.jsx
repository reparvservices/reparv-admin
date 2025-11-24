import React from "react";
import { useAuth } from "../../store/auth";

const OrderFilter = ({ counts = {} }) => {
  const { orderFilter, setOrderFilter } = useAuth();

  const filterOptions = [
    {
      name: "New",
      label: "New",
      bg: "bg-green-100",
      text: "text-green-600",
      count: counts?.New || 0,
    },
    {
      name: "Out For Delivery",
      label: "Out For Delivery",
      bg: "bg-[#fff8e3]",
      text: " text-[#ffbc21]",
      count: counts?.OutForDelivery || 0,
    },
    {
      name: "Completed",
      label: "Completed",
      bg: "bg-blue-100",
      text: "text-blue-600",
      count: counts?.Completed || 0,
    },
    {
      name: "Cancelled",
      label: "Cancelled",
      bg: "bg-red-100",
      text: "text-red-600",
      count: counts?.Cancelled || 0,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center z-10">
      {filterOptions.map((option) => {
        const isActive = orderFilter === option.label;
        return (
          <button
            key={option.label}
            onClick={() => setOrderFilter(option.label)}
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

export default OrderFilter;
