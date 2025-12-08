import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import axios from "axios";
import { RiArrowDropDownLine } from "react-icons/ri";

export default function FilterBar({ onResults, filters, setFilters }) {
  const { URI } = useAuth();

  const [cities, setCities] = useState([]);
  const [properties, setProperties] = useState([]);
  const [projectPartners, setProjectPartners] = useState([]);
  const [planNames, setPlanNames] = useState([]);

  const [selectedProjectPartnerId, setSelectedProjectPartnerId] = useState("");

  // ----------------------------- FETCH SUBSCRIPTION PLANS -----------------------------
  const fetchPlans = async () => {
    try {
      const res = await fetch(`${URI}/admin/ads-manager/subscription-plans`, {
        credentials: "include",
      });

      const data = await res.json();
      //console.log(data);

      setPlanNames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  // ----------------------------- FETCH CITIES -----------------------------
  const fetchCities = async () => {
    try {
      const res = await fetch(`${URI}/admin/ads-manager/cities`, {
        credentials: "include",
      });

      const data = await res.json();
      //console.log(data);

      setCities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  // ----------------------------- FETCH PROJECT PARTNERS BASED ON CITY -----------------------------
  const fetchProjectPartners = async () => {
    try {
      const city = filters?.projectPartnerCity || "All";

      const res = await fetch(
        `${URI}/admin/ads-manager/project-partner/${city}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      //console.log(data);

      setProjectPartners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching project partners:", err);
    }
  };

  // ----------------------------- FETCH PROPERTIES BASED ON PROJECT PARTNER -----------------------------
  const fetchProperties = async () => {
    try {
      const partner = selectedProjectPartnerId || "All";
      const city = filters?.city || "All";

      const res = await fetch(`${URI}/admin/ads-manager/properties`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectPartnerId: partner,
          city: city,
        }),
      });

      const data = await res.json();
      //console.log("Fetched Properties:", data);

      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  // ----------------------------- LOAD ALL FILTER OPTIONS -----------------------------

  useEffect(() => {
    fetchPlans();
    fetchCities();
    fetchProjectPartners();
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchCities();
    fetchProjectPartners();
    fetchProperties();
  }, [filters?.city, selectedProjectPartnerId]);

  // ----------------------------- CUSTOM SELECT COMPONENT -----------------------------
  const CustomSelect = ({
    label,
    options,
    value,
    onChange,
    getLabel,
    getValue,
  }) => {
    const safeOptions = Array.isArray(options) ? options : [];

    return (
      <div className="w-full relative inline-block">
        <div className="flex gap-2 items-center justify-between bg-white border border-[#00000033] rounded-lg py-1 px-3 text-sm font-semibold text-black cursor-pointer">
          <span>{value || label}</span>
          <RiArrowDropDownLine className="w-6 h-6 text-[#000000B2]" />
        </div>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          <option value="">{label}</option>

          {safeOptions.map((item, i) => (
            <option key={i} value={getValue ? getValue(item) : item}>
              {getLabel ? getLabel(item) : item}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // ----------------------------- UI -----------------------------
  return (
    <div className="w-full bg-white rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* CITY */}
        <CustomSelect
          label="Select City"
          options={cities}
          value={filters.city}
          onChange={(val) =>
            setFilters({ ...filters, city: val,  projectPartner: "", propertyName: "" })
          }
          getLabel={(c) => c}
          getValue={(c) => c}
        />

        {/* PROJECT PARTNER */}
        <CustomSelect
          label="Select Project Partner"
          options={projectPartners}
          value={filters.projectPartner}
          onChange={(val) => {
            const selected = projectPartners.find((pp) => pp.fullname === val);
            setSelectedProjectPartnerId(selected?.id || "");
            setFilters({ ...filters, projectPartner: val, propertyName: "" });
          }}
          getLabel={(p) => p.fullname}
          getValue={(p) => p.fullname}
        />

        {/* PROPERTY */}
        <CustomSelect
          label="Select Property"
          options={properties}
          value={filters.propertyName}
          onChange={(val) => setFilters({ ...filters, propertyName: val })}
          getLabel={(p) => p.propertyName}
          getValue={(p) => p.propertyName}
        />

        {/* PLAN */}
        <CustomSelect
          label="Select Plan"
          options={planNames}
          value={filters.planName}
          onChange={(val) => setFilters({ ...filters, planName: val })}
          getLabel={(p) => p}
          getValue={(p) => p}
        />
      </div>
    </div>
  );
}
