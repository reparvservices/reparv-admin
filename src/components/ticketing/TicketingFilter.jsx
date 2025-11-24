import React, { useState } from "react";
import { HiMiniFunnel } from "react-icons/hi2";

const filterOptions = [
  { label: "", color: "text-black" },
  { label: "Open", color: "text-[#0068FF]" },
  { label: "Closed", color: "text-[#7c7c7c]" },
  { label: "Resolved", color: "text-[#0BB501]" },
  { label: "In progress", color: "text-[#FFCA00]" },
  { label: "Pending", color: "text-[#FF4646]" },
];

const TicketingFilter = ({selectedFilter, setSelectedFilter}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    setIsOpen(false);
    console.log("Selected Filter:", filter);
  };

  return (
    <div className="relative z-10">
      {/* Filter Button */}
      <div
        className={`min-w-[40px] h-[32px] ${selectedFilter&&"h-[36px]"} items-center justify-center leading-[20px] border border-[#0000001A] rounded-[8px] gap-4 py-2 px-3 text-sm cursor-pointer ${
          selectedFilter === "Resolved"
            ? "text-[#0BB501]"
            : selectedFilter === "Open"
            ? "text-[#0068FF]"
            : selectedFilter === "Closed"
            ? "text-[#7c7c7c]"
            : selectedFilter === "In progress"
            ? "text-[#FFCA00]"
            : selectedFilter === "Pending"
            ? "text-[#ff2323]"
            : "text-[#000000]"}`}
        onClick={toggleDropdown}
      >
        {selectedFilter?<div className={`flex gap-2 items-center justify-center leading-[20px] text-sm font-semibold `}><HiMiniFunnel className="text-black"/> {selectedFilter}</div>:<HiMiniFunnel/>}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-[40px] left-[-15px] w-[200px] bg-white shadow-md border rounded-bl-[10px] overflow-hidden rounded-br-[10px] z-20">
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
              <span className="text-sm">{option.label || "All"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketingFilter;