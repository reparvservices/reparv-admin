import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import LocationPicker from "./LocationPicker";
import TagsInput from "./TagsInput";
import FormatPrice from "../../components/FormatPrice";
//import MapLibreBuildings from "./MapLibreBuildings";

import {
  FaHome,
  FaBuilding,
  FaStore,
  FaIndustry,
  FaTree,
  FaCity,
} from "react-icons/fa";
import { MdApartment } from "react-icons/md";
import { GiFarmTractor, GiFamilyHouse } from "react-icons/gi";

const StepOne = ({
  newProperty,
  setPropertyData,
  builderData,
  authorities,
  states,
  cities,
}) => {
  const { URI } = useAuth();

  // For Property Name Checking
  const [isSame, setIsSame] = useState(true);
  const [message, setMessage] = useState("");

  const [propertyTab, setPropertyTab] = useState("new");

  const newTypes = [
    { label: "New Flat", value: "NewFlat", icon: MdApartment },
    { label: "New Plot", value: "NewPlot", icon: FaTree },
    { label: "New Shop", value: "NewShop", icon: FaStore },
    { label: "Row House", value: "RowHouse", icon: FaHome },
    { label: "Lease", value: "Lease", icon: FaBuilding },
    { label: "Farm House", value: "FarmHouse", icon: GiFarmTractor },
    { label: "Flarm Land", value: "FarmLand", icon: FaTree },
    { label: "Commercial Flat", value: "CommercialFlat", icon: MdApartment },
    { label: "Commercial Plot", value: "CommercialPlot", icon: FaCity },
    { label: "Industrial Space", value: "IndustrialSpace", icon: FaIndustry },
  ];

  const rentalTypes = [
    { label: "Rental Flat", value: "RentalFlat", icon: MdApartment },
    { label: "Rental Villa", value: "RentalVilla", icon: FaTree },
    { label: "Rental Shop", value: "RentalShop", icon: FaStore },
    { label: "Rental Office", value: "RentalOffice", icon: FaBuilding },
    { label: "Rental House", value: "RentalHouse", icon: FaHome },
    { label: "Rental Godown", value: "RentalGodown", icon: FaCity },
    { label: "Rental Land", value: "RentalOpenLand", icon: FaTree },
    { label: "Rental ShowRoom", value: "RentalShowroom", icon: FaIndustry },
  ];

  const resaleTypes = [
    { label: "Resale Flat", value: "ResaleFlat", icon: MdApartment },
    { label: "Resale Villa", value: "ResalelVilla", icon: FaTree },
    { label: "Resale Shop", value: "ResaleShop", icon: FaStore },
    { label: "Resale Office", value: "ResaleOffice", icon: FaBuilding },
    {
      label: "Resale Farm House",
      value: "ResaleFarmHouse",
      icon: GiFarmTractor,
    },
    { label: "Resale Godown", value: "ResaleGodown", icon: FaCity },
    { label: "Resale Bunglow", value: "ResaleBunglow", icon: FaBuilding },
    { label: "Resale ShowRoom", value: "ResaleShowroom", icon: FaIndustry },
  ];

  const [isRental, setIsRental] = useState(false);

  useEffect(() => {
    const isRentalType = [
      "RentalFlat",
      "RentalVilla",
      "RentalShop",
      "RentalOffice",
      "RentalHouse",
      "RentalGodown",
      "RentalOpenLand",
      "RentalShowroom",
    ].includes(newProperty?.propertyCategory);

    setIsRental(isRentalType);
  }, [newProperty?.propertyCategory]);

  const checkPropertyName = async () => {
    try {
      const res = await fetch(`${URI}/admin/properties/check-property-name`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProperty),
      });

      const data = await res.json();
      setIsSame(data.unique);
      setMessage(data.message);
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong");
    }
  };

  useEffect(() => {
    if (!newProperty.propertyid) {
      checkPropertyName();
    }
  }, [newProperty.propertyName]);

  return (
    <div className="bg-white h-[55vh] overflow-scroll scrollbar-x-hidden p-2">
      <h2 className="text-base font-semibold mb-4">Step 1: Property Details</h2>
      <div className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          {/* PROPERTY TYPE */}
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-black">
            What type of property are you selling?{" "}
            <span className="text-red-500">*</span>
          </h2>
          {/* PROPERTY MAIN TABS */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setPropertyTab("new");
                setPropertyData({ ...newProperty, propertyCategory: "" });
              }}
              className={`px-6 py-2 rounded-lg font-semibold border ${
                propertyTab === "new"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              New
            </button>

            <button
              type="button"
              onClick={() => {
                setPropertyTab("rental");
                setPropertyData({ ...newProperty, propertyCategory: "" });
              }}
              className={`px-6 py-2 rounded-lg font-semibold border ${
                propertyTab === "rental"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              Rental
            </button>

            <button
              type="button"
              onClick={() => {
                setPropertyTab("resale");
                setPropertyData({ ...newProperty, propertyCategory: "" });
              }}
              className={`px-6 py-2 rounded-lg font-semibold border ${
                propertyTab === "resale"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              Resale
            </button>
          </div>
          {/* PROPERTY Category */}
          <p className="text-sm hidden sm:block mb-5 text-[#868686]">
            Select the category that best describes your property
          </p>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-4">
            {(propertyTab === "new"
              ? newTypes
              : propertyTab === "rental"
              ? rentalTypes
              : resaleTypes
            ).map((item) => {
              const Icon = item.icon;
              const isActive = newProperty.propertyCategory === item.value;

              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() =>
                    setPropertyData({
                      ...newProperty,
                      propertyCategory: item.value,
                    })
                  }
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 px-3 py-2 rounded-lg border text-sm transition
                             ${
                               isActive
                                 ? "bg-green-600 text-white font-bold border-green-600"
                                 : "border-[#D9D9D9] text-[#868686] hover:border-green-600"
                             }
                            `}
                >
                  <Icon size={16} color={isActive ? "#FFFFFF" : "#868686"} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="w-full">
          <label
            className={`${
              newProperty.builderid ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Builder/Company <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none bg-transparent placeholder:text-black"
            style={{ backgroundImage: "none" }}
            value={newProperty.builderid}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                builderid: e.target.value,
              })
            }
          >
            <option value="">Select Builder/Company</option>
            {builderData.map((builder, index) => (
              <option key={index} value={builder.builderid}>
                {builder.company_name}
              </option>
            ))}
          </select>
        </div>

        <div
          className={`${isRental ? "hidden" : "block"} w-full`}
        >
          <label
            className={`text-green-600 block text-sm leading-4 font-medium`}
          >
            Project By
          </label>
          <input
            type="text"
            placeholder="Enter Project By"
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.projectBy}
            onChange={(e) =>
              setPropertyData({ ...newProperty, projectBy: e.target.value })
            }
          />
        </div>

        <div
          className={`${
            ["RentalFlat", "RentalShop", "RentalOffice"].includes(
              newProperty.propertyCategory
            )
              ? "hidden"
              : "block"
          } w-full`}
        >
          <label className="text-green-600 block text-sm leading-4 font-medium">
            Possession Date
          </label>
          <input
            type="date"
            placeholder="Enter Possession Date"
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={
              newProperty.possessionDate
                ? new Date(newProperty.possessionDate)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            onChange={(e) => {
              const selectedDate = e.target.value;
              setPropertyData({
                ...newProperty,
                possessionDate: selectedDate === "" ? null : selectedDate,
              });
            }}
          />
        </div>

        <div
          className={`${
            newProperty.propertyCategory === "FarmLand" ? "hidden" : "block"
          } w-full`}
        >
          <label
            className={`${
              newProperty.propertyApprovedBy
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Property Approved by <span className="text-red-600">*</span>
          </label>
          <select
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none bg-transparent"
            style={{ backgroundImage: "none" }}
            value={newProperty.propertyApprovedBy}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                propertyApprovedBy: e.target.value,
              })
            }
          >
            <option value="">Select Approved by</option>
            {authorities?.map((authority, index) => (
              <option key={index} value={authority.authorityNACL}>
                {authority.authorityNACL}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full ">
          <label
            className={`${
              isSame === true
                ? "text-green-600"
                : isSame === false
                ? "text-red-600"
                : "text-[#00000066]"
            } ${
              newProperty.propertyid && newProperty.propertyName
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            {message || "Property Name"} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Enter Property Name"
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.propertyName}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                propertyName: e.target.value,
              })
            }
          />
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.totalSalesPrice
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Total Sales Price <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            required
            placeholder="Enter Sales Price"
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.totalSalesPrice}
            onChange={(e) => {
              const value = e.target.value;
              setPropertyData({
                ...newProperty,
                totalSalesPrice: value < 0 ? 0 : value, // block negatives
              });
            }}
          />
        </div>
        <div className="w-full">
          <label
            className={`${
              newProperty.totalOfferPrice
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Total Offer Price <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            required
            placeholder="Enter Offer Price"
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.totalOfferPrice}
            onChange={(e) => {
              const value = e.target.value;
              setPropertyData({
                ...newProperty,
                totalOfferPrice: value < 0 ? 0 : value, // block negatives
              });
            }}
          />
        </div>

        <div className="w-full ">
          <label
            className={`${
              newProperty.address ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Address <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Enter Address"
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.address}
            onChange={(e) =>
              setPropertyData({ ...newProperty, address: e.target.value })
            }
          />
        </div>

        {/* State Select Input */}
        <div className="w-full">
          <label
            className={`${
              newProperty.state ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Select State <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none bg-transparent placeholder:text-black"
            style={{ backgroundImage: "none" }}
            value={newProperty.state}
            onChange={(e) =>
              setPropertyData({ ...newProperty, state: e.target.value })
            }
          >
            <option value="">Select Your State</option>
            {states?.map((state, index) => (
              <option key={index} value={state.state}>
                {state.state}
              </option>
            ))}
          </select>
        </div>

        {/* City Select Input */}
        <div className="w-full">
          <label
            className={`${
              newProperty.city ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Select City <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none bg-transparent placeholder:text-black"
            style={{ backgroundImage: "none" }}
            value={newProperty.city}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                city: e.target.value,
              })
            }
          >
            <option value="">Select Your City</option>
            {cities?.map((city, index) => (
              <option key={index} value={city.city}>
                {city.city}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.pincode ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Pin-Code <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            required
            placeholder="Enter Pin-Code"
            value={newProperty.pincode}
            onChange={(e) => {
              const input = e.target.value;
              if (/^\d{0,6}$/.test(input)) {
                setPropertyData({ ...newProperty, pincode: input });
              }
            }}
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none  focus:ring-2 focus:ring-green-600 placeholder:text-black"
          />
        </div>

        <div className="w-full ">
          <label
            className={`${
              newProperty.location ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Location <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Enter Location"
            placeholder:text-black
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.location}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                location: e.target.value,
              })
            }
          />
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.distanceFromCityCenter
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Distance From City Center <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.distanceFromCityCenter}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                distanceFromCityCenter: e.target.value,
              })
            }
          >
            <option value="">Select Distance (Kms)</option>
            {Array.from({ length: 25 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} Km
              </option>
            ))}
          </select>
        </div>

        {/* Map Picker */}
        <div
          className={`${
            newProperty.state && newProperty.city && newProperty.pincode
              ? "block"
              : "hidden"
          } w-full col-span-1 lg:col-span-2 xl:col-span-3`}
        >
          <label
            className={`${
              newProperty.latitude && newProperty.longitude
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium mb-2`}
          >
            Select Correct Location on Map{" "}
            <span className="text-red-600">*</span>
          </label>

          {/* Leaflet Picker */}
          {newProperty.state && newProperty.city && newProperty.pincode && (
            <LocationPicker
              onChange={({ latitude, longitude }) =>
                setPropertyData({
                  ...newProperty,
                  latitude,
                  longitude,
                })
              }
              state={newProperty.state}
              city={newProperty.city}
              pincode={newProperty.pincode}
              latitude={newProperty.latitude}
              longitude={newProperty.longitude}
            />
          )}
        </div>
      </div>

      <h2 className="text-base font-semibold mt-6 mb-4">
        Step 2: Other Charges
      </h2>
      <div className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <div className="w-full">
          <label
            className={`${
              newProperty.stampDuty ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Stamp Duty In Percentage <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.stampDuty}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                stampDuty: e.target.value,
              })
            }
          >
            <option value="">Select Stamp Duty %</option>
            <option value="0.25">0.25%</option>
            <option value="5">5%</option>
            <option value="6">6%</option>
            <option value="7">7%</option>
          </select>
        </div>

        <div
          className={`${isRental ? "hidden" : "block"} w-full`}
        >
          <label
            className={`${
              newProperty.registrationFee
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            {newProperty.registrationFee && newProperty.registrationFee != 30000
              ? "Registration Percentage " +
                parseFloat(newProperty.registrationFee) +
                "%"
              : "Registration Fee or Percentage "}

            <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.registrationFee}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                registrationFee: e.target.value,
              })
            }
          >
            <option value="">Select Registration Fee</option>
            <option value="1">1%</option>
            <option value="30000">Rs. 30,000</option>
          </select>
        </div>

        <div
          className={`${isRental ? "hidden" : "block"} w-full`}
        >
          <label
            className={`${
              newProperty.gst ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            GST Percentage <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.gst}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                gst: e.target.value,
              })
            }
          >
            <option value="">Select GST %</option>
            <option value="0">0%</option>
            <option value="1">1%</option>
            <option value="5">5%</option>
          </select>
        </div>

        <div
          className={`${isRental ? "hidden" : "block"} w-full`}
        >
          <label
            className={`${
              newProperty.advocateFee ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Advocate Fee in Rupee <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.advocateFee}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                advocateFee: e.target.value,
              })
            }
          >
            <option value="">Select Advocate Fee</option>
            <option value="0">Rs. 0</option>
            <option value="10000">Rs. 10,000</option>
            <option value="15000">Rs. 15,000</option>
            <option value="20000">Rs. 20,000</option>
            <option value="25000">Rs. 25,000</option>
          </select>
        </div>

        <div
          className={`${isRental ? "hidden" : "block"} w-full`}
        >
          <label
            className={`${
              newProperty.msebWater ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            MSEB & Water Charges in Rupee<span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            required
            placeholder="Enter Charges In Rupee"
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.msebWater}
            onChange={(e) => {
              const value = e.target.value;
              setPropertyData({
                ...newProperty,
                msebWater: value < 0 ? 0 : value, // block negatives
              });
            }}
          />
        </div>

        <div
          className={`${isRental ? "hidden" : "block"} w-full`}
        >
          <label
            className={`${
              newProperty.maintenance ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Maintenance in Rupee <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            required
            placeholder="Enter Maintenance In Rupee"
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.maintenance}
            onChange={(e) => {
              const value = e.target.value;
              setPropertyData({
                ...newProperty,
                maintenance: value < 0 ? 0 : value, // block negatives
              });
            }}
          />
        </div>
        <div className="w-full">
          <label
            className={`${
              newProperty.other ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Other charges in Rupee <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            required
            placeholder="Enter Charges In Rupee"
            className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.other}
            onChange={(e) => {
              const value = e.target.value;
              setPropertyData({
                ...newProperty,
                other: value < 0 ? 0 : value, // block negatives
              });
            }}
          />
        </div>
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <TagsInput
            newProperty={newProperty}
            setPropertyData={setPropertyData}
          />
        </div>
      </div>
    </div>
  );
};

export default StepOne;
