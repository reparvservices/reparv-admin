import React, { useState } from "react";
import { HiMiniFunnel } from "react-icons/hi2";

const filterOptions = [
  { label: "Sales", color: "text-[#0BB501]" },
  { label: "Operation", color: "text-[#FFCA00]" },
  { label: "Developer", color: "text-[#FF4646]" },
];

const EmployeeFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    setIsOpen(false);
    console.log("Selected Filter:", filter);
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <div
        className={`min-w-[40px] h-[32px] ${selectedFilter&&"h-[36px]"} items-center justify-center leading-[20px] border border-[#0000001A] rounded-[8px] gap-4 py-2 px-3 text-sm cursor-pointer ${
          selectedFilter === "Sales"
            ? "text-[#0BB501]"
            : selectedFilter === "Operation"
            ? "text-[#FFCA00]"
            : selectedFilter === "Developer"
            ? "text-[#ff2323]"
            : "text-[#000000]"}`}
        onClick={toggleDropdown}
      >
        {selectedFilter?<div className={`flex gap-2 items-center justify-center leading-[20px] text-sm font-semibold `}><HiMiniFunnel className="text-black"/> {selectedFilter}</div>:<HiMiniFunnel />}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-[40px] right-0 w-[200px] bg-white shadow-md border rounded-bl-[10px] overflow-hidden rounded-br-[10px] z-10">
          {filterOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleFilterClick(option.label)}
              className={`flex items-center w-full h-12 gap-2 p-3 cursor-pointer ${option.color}`}
            >
              <input
                type="radio"
                name="filter"
                checked={selectedFilter === option.label}
                readOnly
                className="cursor-pointer"
              />
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeFilter;