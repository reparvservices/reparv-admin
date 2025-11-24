import React from "react";

const TableFilter = ({ selectedTable, setSelectedTable, counts = {} }) => {
  

  const filterOptions = [
    {
      name: "Products",
      label: "Products",
      bg: "bg-green-100",
      text: "text-green-600",
    },
    {
      name: "Orders",
      label: "Orders",
      bg: "bg-green-100",
      text: "text-green-600",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center z-10">
      {filterOptions.map((option) => {
        const isActive = selectedTable === option.label;
        return (
          <button
            key={option.label}
            onClick={() => setSelectedTable(option.label)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border font-semibold transition-all duration-200
              ${
                isActive
                  ? `${option.bg} ${option.text}`
                  : "bg-white text-black text-sm"
              }
              hover:opacity-90`}
          >
            <span>{option.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TableFilter;
