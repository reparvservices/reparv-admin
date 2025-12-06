import { useState, useEffect } from "react";
import axios from "axios";
import { RiArrowDropDownLine } from "react-icons/ri";

export default function FilterBar({ onResults, filters, setFilters }) {
  const [cities, setCities] = useState([]);
  const [properties, setProperties] = useState([]);
  const [partners, setPartners] = useState([]);
  const [plans, setPlans] = useState([]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get("/filter-options");
        setCities(res.data.cities || []);
        setProperties(res.data.properties || []);
        setPartners(res.data.projectPartners || []);
        setPlans(res.data.plans || []);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetchOptions();
  }, []);

  // Filter API call
  const handleFilter = async () => {
    try {
      const res = await axios.get("/filter-properties", {
        params: filters,
      });
      onResults && onResults(res.data.data);
    } catch (error) {
      console.error("Filter Error:", error);
    }
  };

  const handleClear = () => {
    setFilters({
      projectPartnerCity: "",
      propertyName: "",
      projectPartnerName: "",
      planName: "",
    });
    onResults && onResults([]);
  };

  // UI Dropdown reuse
  const CustomSelect = ({ label, options, value, onChange }) => (
    <div className="w-full relative inline-block">
      <div className="flex gap-2 items-center justify-between bg-white border border-[#00000033] rounded-lg py-1.5 px-3 text-sm font-semibold text-black cursor-pointer">
        <span>{value || label}</span>
        <RiArrowDropDownLine className="w-6 h-6 text-[#000000B2]" />
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map((item, i) => (
          <option key={i} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl">
      <div className="hidden w-full sm:flex gap-2 items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Filter</h2>
        <div className="flex justify-end gap-6">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 sm:px-6 py-1.5 leading-4 text-sm sm:text-base text-[#ffffff] font-medium bg-[#000000B2] rounded-md active:scale-[0.98]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleFilter}
            className="px-4 sm:px-6 py-1.5 leading-4 text-sm sm:text-base text-white bg-[#076300] font-medium rounded-md active:scale-[0.98]"
          >
            Apply Filter
          </button>
        </div>
      </div>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-4">
        {/* City */}
        <CustomSelect
          label="Select City"
          options={cities}
          value={filters?.projectPartnerCity}
          onChange={(val) =>
            setFilters({ ...filters, projectPartnerCity: val })
          }
        />

        {/* Property Name */}
        <CustomSelect
          label="Select Property"
          options={properties}
          value={filters?.propertyName}
          onChange={(val) => setFilters({ ...filters, propertyName: val })}
        />

        {/* Project Partner */}
        <CustomSelect
          label="Select Project Partner"
          options={partners}
          value={filters?.projectPartnerName}
          onChange={(val) =>
            setFilters({ ...filters, projectPartnerName: val })
          }
        />

        {/* Plan */}
        <CustomSelect
          label="Select Plan"
          options={plans}
          value={filters?.planName}
          onChange={(val) => setFilters({ ...filters, planName: val })}
        />
      </div>
      <div className="w-full flex sm:hidden gap-4 items-center justify-end mt-4">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 sm:px-6 py-1.5 leading-4 text-sm sm:text-base text-[#ffffff] font-medium bg-[#000000B2] rounded-md active:scale-[0.98]"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleFilter}
          className="px-4 sm:px-6 py-1.5 leading-4 text-sm sm:text-base text-white bg-[#076300] font-medium rounded-md active:scale-[0.98]"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
}
