import { useState, useEffect } from "react";
import PropertyTypeMultiSelect from "./PropertyTypeMultiSelect";
import Select from "react-select";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "52px",
    borderColor: state.isFocused ? "#16a34a" : "#00000033",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(22,163,74,0.4)" : "none",
    "&:hover": {
      borderColor: "#16a34a",
    },
  }),

  multiValue: (base) => ({
    ...base,
    backgroundColor: "#16a34a20",
  }),

  multiValueLabel: (base) => ({
    ...base,
    color: "#15803d",
    fontWeight: 500,
  }),

  multiValueRemove: (base) => ({
    ...base,
    color: "#15803d",
    ":hover": {
      backgroundColor: "#16a34a",
      color: "white",
    },
  }),
};

const locationFeatureOptions = [
  { value: "Main Road Facing", label: "Main Road Facing" },
  {
    value: "Corner Plot / Corner Facing",
    label: "Corner Plot / Corner Facing",
  },
  { value: "Park Facing", label: "Park Facing" },
  { value: "Sea Facing", label: "Sea Facing" },
  { value: "Lake Facing", label: "Lake Facing" },
  { value: "River / Waterfront Facing", label: "River / Waterfront Facing" },
  { value: "Golf Course Facing", label: "Golf Course Facing" },
  { value: "City View / Skyline View", label: "City View / Skyline View" },
  { value: "Garden / Green Belt Facing", label: "Garden / Green Belt Facing" },
  { value: "Highway Facing", label: "Highway Facing" },
];

const amenitiesFeatureOptions = [
  { value: "Lift / Elevator", label: "Lift / Elevator" },
  { value: "Power Backup", label: "Power Backup" },
  { value: "24x7 Water Supply", label: "24x7 Water Supply" },
  {
    value: "Security / CCTV Surveillance",
    label: "Security / CCTV Surveillance",
  },
  { value: "Car Parking", label: "Car Parking" },
  { value: "Gym / Fitness Center", label: "Gym / Fitness Center" },
  { value: "Swimming Pool", label: "Swimming Pool" },
  { value: "Children's Play Area", label: "Children's Play Area" },
  { value: "Clubhouse / Community Hall", label: "Clubhouse / Community Hall" },
];

const smartHomeFeatureOptions = [
  {
    value: "Smart Door Lock / Digital Lock",
    label: "Smart Door Lock / Digital Lock",
  },
  { value: "Video Door Phone", label: "Video Door Phone" },
  { value: "Smart Lighting Control", label: "Smart Lighting Control" },
  {
    value: "Smart Thermostat / Climate Control",
    label: "Smart Thermostat / Climate Control",
  },
  { value: "App-Controlled Appliances", label: "App-Controlled Appliances" },
  {
    value: "Voice Assistant Integration (Alexa, Google Home, etc.)",
    label: "Voice Assistant Integration (Alexa, Google Home, etc.)",
  },
  {
    value: "Smart Security Cameras / CCTV with Remote Access",
    label: "Smart Security Cameras / CCTV with Remote Access",
  },
  { value: "Motion Sensor Lighting", label: "Motion Sensor Lighting" },
  {
    value: "Smart Smoke / Gas Leak Detectors",
    label: "Smart Smoke / Gas Leak Detectors",
  },
  {
    value: "Automated Curtains / Blinds",
    label: "Automated Curtains / Blinds",
  },
  { value: "No Feature", label: "No Feature" },
];

const securityOptions = [
  { value: "24x7 Security", label: "24x7 Security" },
  { value: "CCTV Surveillance", label: "CCTV Surveillance" },
  { value: "Gated Community", label: "Gated Community" },
  { value: "Intercom Facility", label: "Intercom Facility" },
  { value: "Fire Safety System", label: "Fire Safety System" },
];

const locationOptions = [
  { value: "Near School / College", label: "Near School / College" },
  { value: "Near Hospital", label: "Near Hospital" },
  {
    value: "Near Market / Shopping Mall",
    label: "Near Market / Shopping Mall",
  },
  { value: "Near Public Transport", label: "Near Public Transport" },
  { value: "Near IT / Business Hub", label: "Near IT / Business Hub" },
];

const rentalOptions = [
  {
    value: "Residential Long-Term Rental",
    label: "Residential Long-Term Rental",
  },
  {
    value: "Residential Short-Term / Vacation Rental",
    label: "Residential Short-Term / Vacation Rental",
  },
  {
    value: "Paying Guest (PG) Accommodation",
    label: "Paying Guest (PG) Accommodation",
  },
  { value: "Commercial Space Rental", label: "Commercial Space Rental" },
  { value: "Co-working Space Rental", label: "Co-working Space Rental" },
  { value: "Retail Shop Rental", label: "Retail Shop Rental" },
  { value: "Warehouse / Storage Rental", label: "Warehouse / Storage Rental" },
];

const qualityOptions = [
  { value: "Longer Building Life", label: "Longer Building Life" },
  { value: "Low Maintenance Cost", label: "Low Maintenance Cost" },
  {
    value: "Better Safety & Structural Strength",
    label: "Better Safety & Structural Strength",
  },
  { value: "Higher Property Value", label: "Higher Property Value" },
];

const capitalOptions = [
  { value: "Higher Resale Value", label: "Higher Resale Value" },
  {
    value: "Increased Return on Investment (ROI)",
    label: "Increased Return on Investment (ROI)",
  },
  { value: "Wealth Creation Over Time", label: "Wealth Creation Over Time" },
  {
    value: "Better Loan Collateral Value",
    label: "Better Loan Collateral Value",
  },
  { value: "Inflation Hedge", label: "Inflation Hedge" },
];

const ecoOptions = [
  { value: "Lower Energy Bills", label: "Lower Energy Bills" },
  { value: "Reduced Water Consumption", label: "Reduced Water Consumption" },
  {
    value: "Healthier Living Environment",
    label: "Healthier Living Environment",
  },
  { value: "Lower Carbon Footprint", label: "Lower Carbon Footprint" },
];

const StepTwo = ({ newProperty, setPropertyData }) => {
  const [isRental, setIsRental] = useState(false);
  const [isPlot, setIsPlot] = useState(false);

  useEffect(() => {
    const isRentalType = [
      "RentalFlat",
      "RentalPlot",
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

  useEffect(() => {
    const isPlotType = ["NewPlot", "CommercialPlot", "RentalLand"].includes(
      newProperty?.propertyCategory,
    );

    setIsPlot(isPlotType);
  }, [newProperty?.propertyCategory]);

  return (
    <div className="bg-white h-[55vh] overflow-scroll scrollbar-x-hidden p-2">
      <h2 className="text-base font-semibold mb-4">
        Step 1: Property Overview Details
      </h2>
      <div className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <div
          className={`${
            [
              "NewFlat",
              "RentalFlat",
              "CommercialFlat",
              "NewPlot",
              "CommercialPlot",
              "CommercialShop",
              "IndustrialSpace",
            ].includes(newProperty.propertyCategory)
              ? "block"
              : "hidden"
          } col-span-1 lg:col-span-2 xl:col-span-3`}
        >
          <PropertyTypeMultiSelect
            newProperty={newProperty}
            setPropertyData={setPropertyData}
          />
        </div>

        <div className={`${isPlot || isRental ? "hidden" : "block"} w-full`}>
          <label
            className={`${
              newProperty.builtYear ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Property Built Year <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.builtYear}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                builtYear: e.target.value,
              })
            }
          >
            <option value="">Select Year</option>
            {Array.from(
              { length: new Date().getFullYear() - 1990 + 1 },
              (_, i) => 1990 + i,
            )
              .reverse()
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
        </div>

        <div className={`${isRental ? "hidden" : "block"} w-full`}>
          <label
            className={`${
              newProperty.ownershipType ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Ownership Type <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.ownershipType}
            onChange={(e) =>
              setPropertyData({ ...newProperty, ownershipType: e.target.value })
            }
          >
            <option value="">Select Ownership Type</option>
            <option value="Freehold">Freehold</option>
            <option value="Lease Hold">Lease Hold</option>
            <option value="Co-operative Society">Co-operative Society</option>
            <option value="Power of Attorney">Power of Attorney</option>
            <option value="Joint Ownership">Joint Ownership</option>
            <option value="Single Ownership">Single Ownership</option>
            <option value="Government Alloted Property">
              Government Alloted Property
            </option>
          </select>
        </div>

        <div className="w-full ">
          <label
            className={`${
              newProperty.builtUpArea ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Built-Up Area <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            required
            placeholder="Enter Area in Sq.Ft."
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.builtUpArea}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                builtUpArea: e.target.value,
              })
            }
          />
        </div>

        <div className="w-full ">
          <label
            className={`${
              newProperty.carpetArea ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Carpet Area <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            required
            placeholder="Enter Area in Sq.Ft."
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.carpetArea}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                carpetArea: e.target.value,
              })
            }
          />
        </div>

        <div className={`${isPlot ? "hidden" : "block"} w-full`}>
          <label
            className={`${
              newProperty.parkingAvailability
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Parking Availability <span className="text-red-600">*</span>
          </label>
          <select
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none bg-transparent placeholder:text-black"
            style={{ backgroundImage: "none" }}
            value={newProperty.parkingAvailability}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                parkingAvailability: e.target.value,
              })
            }
          >
            <option value="">Select Parking Availability</option>
            <option value="Yes">YES</option>
            <option value="No">NO</option>
          </select>
        </div>

        <div className={`${isPlot ? "hidden" : "block"} w-full`}>
          <label
            className={`${
              newProperty.totalFloors ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Total Floors <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            required
            placeholder="Total No of Floors"
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.totalFloors}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                totalFloors: e.target.value,
              })
            }
          />
        </div>

        <div className={`${isPlot ? "hidden" : "block"} w-full`}>
          <label
            className={`${
              newProperty.floorNo ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Floor No <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            required
            placeholder="Enter Floor No."
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.floorNo}
            onChange={(e) => {
              setPropertyData({ ...newProperty, floorNo: e.target.value });
            }}
          />
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.loanAvailability
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Loan Availability <span className="text-red-600">*</span>
          </label>
          <select
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none bg-transparent placeholder:text-black"
            style={{ backgroundImage: "none" }}
            value={newProperty.loanAvailability}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                loanAvailability: e.target.value,
              })
            }
          >
            <option value="">Select Loan Availability</option>
            <option value="Yes">YES</option>
            <option value="No">NO</option>
          </select>
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.propertyFacing ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Property Facing <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.propertyFacing}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                propertyFacing: e.target.value,
              })
            }
          >
            <option value="">Select Property Facing</option>
            <option value="North-facing">North-facing</option>
            <option value="North-East-facing (NE)">
              North-East-facing (NE)
            </option>
            <option value="East-facing">East-facing</option>
            <option value="South-East-facing (SE)">
              South-East-facing (SE)
            </option>
            <option value="South-facing">South-facing</option>
            <option value="South-West-facing (SW)">
              South-West-facing (SW)
            </option>
            <option value="West-facing">West-facing</option>
            <option value="North-West-facing (NW)">
              North-West-facing (NW)
            </option>
            <option value="Road Facing">Road Facing</option>
            <option value="Garden facing">Garden facing</option>
            <option value="Corner">Corner</option>
          </select>
        </div>

        <div
          className={` ${
            newProperty.propertyCategory === "NewPlot" ||
            newProperty.propertyCategory === "NewFlat" ||
            newProperty.propertyCategory === "CommercialFlat" ||
            newProperty.propertyCategory === "CommercialPlot"
              ? "block"
              : "hidden"
          } w-full`}
        >
          <label
            className={`${
              newProperty.reraRegistered ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Rera Registered <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Rera No."
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.reraRegistered}
            onChange={(e) => {
              setPropertyData({
                ...newProperty,
                reraRegistered: e.target.value,
              });
            }}
          />
        </div>

        <div className={`${isPlot ? "hidden" : "block"} w-full`}>
          <label
            className={`${
              newProperty.furnishing ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Furnishing <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.furnishing}
            onChange={(e) => {
              setPropertyData({ ...newProperty, furnishing: e.target.value });
            }}
          >
            <option value="">Select Furnishing</option>
            <option value="Unfurnished">Unfurnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Fully Furnished">Fully Furnished</option>
          </select>
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.waterSupply ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Water Supply <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.waterSupply}
            onChange={(e) => {
              setPropertyData({ ...newProperty, waterSupply: e.target.value });
            }}
          >
            <option value="">Select Water Supply</option>
            <option value="Municipal / Corporation Water">
              Municipal / Corporation Water
            </option>
            <option value="Borewell / Tube Well">Borewell / Tube Well</option>
            <option value="Open Well">Open Well</option>
            <option value="Combination / Mixed">Combination / Mixed</option>
          </select>
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.powerBackup ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Power Backup <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.powerBackup}
            onChange={(e) => {
              setPropertyData({ ...newProperty, powerBackup: e.target.value });
            }}
          >
            <option value="">Select Power Backup</option>
            <option value="State Electricity Board Supply">
              State Electricity Board Supply
            </option>
            <option value="Dedicated Transformer Supply">
              Dedicated Transformer Supply
            </option>
            <option value="DG (Diesel Generator) Backup">
              DG (Diesel Generator) Backup
            </option>
            <option value="Inverter / Battery Backup">
              Inverter / Battery Backup
            </option>
            <option value="Solar Power Supply">Solar Power Supply</option>
            <option value="Hybrid Power (Solar + Grid + DG)">
              Hybrid Power (Solar + Grid + DG)
            </option>
            <option value="No Power Supply">No Power Supply</option>
          </select>
        </div>
      </div>

      {/* Property Features And Benefits */}
      <h2
        className={`${isPlot ? "hidden" : "block"} text-base font-semibold mt-6 mb-2`}
      >
        Step 2: Property Features
      </h2>

      {/* Property Features */}
      <div
        className={`${isPlot ? "hidden" : "block"} grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`}
      >
        <div className={`${isRental ? "hidden" : "block"} w-full`}>
          <label
            className={`${
              newProperty.locationFeature
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Location Feature <span className="text-red-600">*</span>
          </label>
          <Select
            isMulti
            options={locationFeatureOptions}
            styles={selectStyles}
            className="mt-[10px]"
            placeholder="Select Location Features"
            value={locationFeatureOptions.filter((option) =>
              newProperty.locationFeature?.includes(option.value),
            )}
            onChange={(selected) =>
              setPropertyData({
                ...newProperty,
                locationFeature: selected ? selected.map((i) => i.value) : [],
              })
            }
          />
        </div>

        <div className="w-full ">
          <label
            className={`${
              newProperty.sizeAreaFeature
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Size / Area Feature <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Enter Feature Here."
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
            value={newProperty.sizeAreaFeature}
            onChange={(e) => {
              setPropertyData({
                ...newProperty,
                sizeAreaFeature: e.target.value,
              });
            }}
          />
        </div>

        <div className={`${isPlot ? "hidden" : "block"} w-full`}>
          <label
            className={`${
              newProperty.parkingFeature ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Parking Feature <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.parkingFeature}
            onChange={(e) => {
              setPropertyData({
                ...newProperty,
                parkingFeature: e.target.value,
              });
            }}
          >
            <option value="">Select Parking Feature</option>
            <option value="Basement Parking">Basement Parking</option>
            <option value="Visitor Parking">Visitor Parking</option>
            <option value="Mechanical / Automated Parking">
              Mechanical / Automated Parking
            </option>
            <option value="Two-Wheeler Parking">Two-Wheeler Parking</option>
            <option value="Dedicated Parking Slot">
              Dedicated Parking Slot
            </option>
            <option value="Shared Parking">Shared Parking</option>
          </select>
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.terraceFeature ? "text-green-600" : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Balcony / Terrace Feature <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.terraceFeature}
            onChange={(e) => {
              setPropertyData({
                ...newProperty,
                terraceFeature: e.target.value,
              });
            }}
          >
            <option value="">Select Feature</option>
            <option>Main Road Facing</option>
            <option>Corner Plot / Corner Facing</option>
            <option>Park Facing</option>
            <option>Sea Facing</option>
            <option>Lake Facing</option>
            <option>River / Waterfront Facing</option>
            <option>Golf Course Facing</option>
            <option>City View / Skyline View</option>
            <option>Garden / Green Belt Facing</option>
            <option>Highway Facing</option>
          </select>
        </div>

        <div className={`${isRental ? "hidden" : "block"} w-full`}>
          <label
            className={`${
              newProperty.ageOfPropertyFeature
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Age Of Property <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Enter Feature Here"
            className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none placeholder:text-black"
            value={newProperty.ageOfPropertyFeature}
            onChange={(e) => {
              setPropertyData({
                ...newProperty,
                ageOfPropertyFeature: e.target.value,
              });
            }}
          />
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.amenitiesFeature?.length
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Amenities Feature <span className="text-red-600">*</span>
          </label>

          <Select
            isMulti
            options={amenitiesFeatureOptions}
            styles={selectStyles}
            placeholder="Select Amenities Feature"
            className="mt-[10px]"
            value={amenitiesFeatureOptions.filter((option) =>
              newProperty.amenitiesFeature?.includes(option.value),
            )}
            onChange={(selected) =>
              setPropertyData({
                ...newProperty,
                amenitiesFeature: selected ? selected.map((i) => i.value) : [],
              })
            }
          />
        </div>

        <div className="w-full">
          <label
            className={`${
              newProperty.smartHomeFeature?.length
                ? "text-green-600"
                : "text-[#00000066]"
            } block text-sm leading-4 font-medium`}
          >
            Smart Home Feature <span className="text-red-600">*</span>
          </label>

          <Select
            isMulti
            options={smartHomeFeatureOptions}
            styles={selectStyles}
            placeholder="Select Smart Home Features"
            className="mt-[10px]"
            value={smartHomeFeatureOptions.filter((option) =>
              newProperty.smartHomeFeature?.includes(option.value),
            )}
            onChange={(selected) =>
              setPropertyData({
                ...newProperty,
                smartHomeFeature: selected ? selected.map((i) => i.value) : [],
              })
            }
          />
        </div>
      </div>

      {/* Property Features And Benefits */}
      <h2 className="text-base font-semibold mt-6 mb-2">
        {isPlot ? "Step 2: " : "Step 3: "} Property Benefits
      </h2>

      {/* Property Features */}
      <div className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* SECURITY */}
        <div className="w-full">
          <label
            className={`${newProperty.securityBenefit?.length ? "text-green-600" : "text-[#00000066]"} block text-sm font-medium`}
          >
            Security Benefits <span className="text-red-600">*</span>
          </label>

          <Select
            isMulti
            styles={selectStyles}
            options={securityOptions}
            className="mt-[10px]"
            placeholder="Select Security Benefit"
            value={securityOptions.filter((option) =>
              newProperty.securityBenefit?.includes(option.value),
            )}
            onChange={(selected) =>
              setPropertyData({
                ...newProperty,
                securityBenefit: selected ? selected.map((i) => i.value) : [],
              })
            }
          />
        </div>

        {/* PRIME LOCATION */}
        <div className="w-full">
          <label
            className={`${newProperty.primeLocationBenefit?.length ? "text-green-600" : "text-[#00000066]"} block text-sm font-medium`}
          >
            Prime Location <span className="text-red-600">*</span>
          </label>

          <Select
            isMulti
            styles={selectStyles}
            options={locationOptions}
            className="mt-[10px]"
            placeholder="Select Benefit"
            value={locationOptions.filter((option) =>
              newProperty.primeLocationBenefit?.includes(option.value),
            )}
            onChange={(selected) =>
              setPropertyData({
                ...newProperty,
                primeLocationBenefit: selected
                  ? selected.map((i) => i.value)
                  : [],
              })
            }
          />
        </div>

        {/* RENTAL INCOME */}
        <div className="w-full">
          <label
            className={`${newProperty.rentalIncomeBenefit?.length ? "text-green-600" : "text-[#00000066]"} block text-sm font-medium`}
          >
            Rental Income Possibilities <span className="text-red-600">*</span>
          </label>

          <Select
            isMulti
            styles={selectStyles}
            options={rentalOptions}
            className="mt-[10px]"
            placeholder="Select Rental Income"
            value={rentalOptions.filter((option) =>
              newProperty.rentalIncomeBenefit?.includes(option.value),
            )}
            onChange={(selected) =>
              setPropertyData({
                ...newProperty,
                rentalIncomeBenefit: selected
                  ? selected.map((i) => i.value)
                  : [],
              })
            }
          />
        </div>

        {/* QUALITY */}
        <div className={`${isRental ? "hidden" : "block"} w-full`}>
          <label
            className={`${newProperty.qualityBenefit?.length ? "text-green-600" : "text-[#00000066]"} block text-sm font-medium`}
          >
            Quality Construction <span className="text-red-600">*</span>
          </label>

          <Select
            isMulti
            styles={selectStyles}
            options={qualityOptions}
            className="mt-[10px]"
            placeholder="Select Benefit"
            value={qualityOptions.filter((option) =>
              newProperty.qualityBenefit?.includes(option.value),
            )}
            onChange={(selected) =>
              setPropertyData({
                ...newProperty,
                qualityBenefit: selected ? selected.map((i) => i.value) : [],
              })
            }
          />
        </div>

        {/* CAPITAL */}
        <div className="w-full">
          <label
            className={`${newProperty.capitalAppreciationBenefit?.length ? "text-green-600" : "text-[#00000066]"} block text-sm font-medium`}
          >
            Capital Appreciation <span className="text-red-600">*</span>
          </label>

          <Select
            isMulti
            styles={selectStyles}
            options={capitalOptions}
            className="mt-[10px]"
            placeholder="Select Benefit"
            value={capitalOptions.filter((option) =>
              newProperty.capitalAppreciationBenefit?.includes(option.value),
            )}
            onChange={(selected) =>
              setPropertyData({
                ...newProperty,
                capitalAppreciationBenefit: selected
                  ? selected.map((i) => i.value)
                  : [],
              })
            }
          />
        </div>

        {/* ECO */}
        <div className="w-full">
          <label
            className={`${newProperty.ecofriendlyBenefit?.length ? "text-green-600" : "text-[#00000066]"} block text-sm font-medium`}
          >
            Eco Friendly <span className="text-red-600">*</span>
          </label>

          <Select
            isMulti
            styles={selectStyles}
            options={ecoOptions}
            className="mt-[10px]"
            placeholder="Select Benefit"
            value={ecoOptions.filter((option) =>
              newProperty.ecofriendlyBenefit?.includes(option.value),
            )}
            onChange={(selected) =>
              setPropertyData({
                ...newProperty,
                ecofriendlyBenefit: selected
                  ? selected.map((i) => i.value)
                  : [],
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
