import React, { useState, useEffect } from "react";
import PropertyTypeMultiSelect from "./PropertyTypeMultiSelect";
import {
  SectionHeader,
  FieldLabel,
  FieldInput,
  FieldSelect,
  PillSelect,
  PillMultiSelect,
  Divider,
  Grid2,
  Grid3,
} from "./FormUI";

/* ── Option sets ── */
const LOCATION_FEATURES = [
  "Main Road Facing",
  "Corner Plot / Corner Facing",
  "Park Facing",
  "Sea Facing",
  "Lake Facing",
  "River / Waterfront Facing",
  "Golf Course Facing",
  "City View / Skyline View",
  "Garden / Green Belt Facing",
  "Highway Facing",
];
const AMENITIES = [
  "Lift / Elevator",
  "Power Backup",
  "24x7 Water Supply",
  "Security / CCTV Surveillance",
  "Car Parking",
  "Gym / Fitness Center",
  "Swimming Pool",
  "Children's Play Area",
  "Clubhouse / Community Hall",
];
const SMART_HOME = [
  "Smart Door Lock / Digital Lock",
  "Video Door Phone",
  "Smart Lighting Control",
  "Smart Thermostat / Climate Control",
  "App-Controlled Appliances",
  "Voice Assistant Integration (Alexa, Google Home, etc.)",
  "Smart Security Cameras / CCTV with Remote Access",
  "Motion Sensor Lighting",
  "Smart Smoke / Gas Leak Detectors",
  "Automated Curtains / Blinds",
  "No Feature",
];
const SECURITY = [
  "24x7 Security",
  "CCTV Surveillance",
  "Gated Community",
  "Intercom Facility",
  "Fire Safety System",
];
const PRIME_LOCATION = [
  "Near School / College",
  "Near Hospital",
  "Near Market / Shopping Mall",
  "Near Public Transport",
  "Near IT / Business Hub",
];
const RENTAL_INCOME = [
  "Residential Long-Term Rental",
  "Residential Short-Term / Vacation Rental",
  "Paying Guest (PG) Accommodation",
  "Commercial Space Rental",
  "Co-working Space Rental",
  "Retail Shop Rental",
  "Warehouse / Storage Rental",
];
const QUALITY = [
  "Longer Building Life",
  "Low Maintenance Cost",
  "Better Safety & Structural Strength",
  "Higher Property Value",
];
const CAPITAL = [
  "Higher Resale Value",
  "Increased Return on Investment (ROI)",
  "Wealth Creation Over Time",
  "Better Loan Collateral Value",
  "Inflation Hedge",
];
const ECO = [
  "Lower Energy Bills",
  "Reduced Water Consumption",
  "Healthier Living Environment",
  "Lower Carbon Footprint",
];
const FACING_OPTIONS = [
  "North-facing",
  "North-East-facing (NE)",
  "East-facing",
  "South-East-facing (SE)",
  "South-facing",
  "South-West-facing (SW)",
  "West-facing",
  "North-West-facing (NW)",
  "Road Facing",
  "Garden facing",
  "Corner",
];
const PARKING_FEATURE_OPTIONS = [
  "Basement Parking",
  "Visitor Parking",
  "Mechanical / Automated Parking",
  "Two-Wheeler Parking",
  "Dedicated Parking Slot",
  "Shared Parking",
];
const WATER_OPTIONS = [
  "Municipal / Corporation Water",
  "Borewell / Tube Well",
  "Open Well",
  "Combination / Mixed",
];
const POWER_OPTIONS = [
  "State Electricity Board Supply",
  "Dedicated Transformer Supply",
  "DG (Diesel Generator) Backup",
  "Inverter / Battery Backup",
  "Solar Power Supply",
  "Hybrid Power (Solar + Grid + DG)",
  "No Power Supply",
];
const OWNERSHIP_OPTIONS = [
  "Freehold",
  "Lease Hold",
  "Co-operative Society",
  "Power of Attorney",
  "Joint Ownership",
  "Single Ownership",
  "Government Alloted Property",
];
const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const TERRACE_OPTIONS = [
  "Main Road Facing",
  "Corner Plot / Corner Facing",
  "Park Facing",
  "Sea Facing",
  "Lake Facing",
  "River / Waterfront Facing",
  "Golf Course Facing",
  "City View / Skyline View",
  "Garden / Green Belt Facing",
  "Highway Facing",
];
const PARKING_AVAIL = ["Yes", "No"];
const LOAN_AVAIL = ["Yes", "No"];
const RERA_CATS = ["NewPlot", "NewFlat", "CommercialFlat", "CommercialPlot"];
const PLOT_CATS = ["NewPlot", "CommercialPlot", "RentalLand"];
const RENTAL_ALL = [
  "RentalFlat",
  "RentalPlot",
  "RentalVilla",
  "RentalShop",
  "RentalOffice",
  "RentalHouse",
  "RentalGodown",
  "RentalOpenLand",
  "RentalShowroom",
];

export default function StepTwo({ newProperty, setPropertyData }) {
  const isRental = RENTAL_ALL.includes(newProperty?.propertyCategory);
  const isPlot = PLOT_CATS.includes(newProperty?.propertyCategory);
  const showFlats = [
    "NewFlat",
    "RentalFlat",
    "CommercialFlat",
    "NewPlot",
    "CommercialPlot",
    "CommercialShop",
    "IndustrialSpace",
  ].includes(newProperty.propertyCategory);

  const set = (key, val) => setPropertyData({ ...newProperty, [key]: val });

  return (
    <div className="space-y-0">
      {/* ── BHK / Unit type (conditional) ── */}
      {showFlats && (
        <>
          <SectionHeader
            title="Unit Configuration"
            subtitle="BHK types or plot sizes available"
          />
          <PropertyTypeMultiSelect
            newProperty={newProperty}
            setPropertyData={setPropertyData}
          />
          <Divider />
        </>
      )}

      {/* ── Property Specs ── */}
      <div >
        <SectionHeader
          title="Property Details"
          subtitle="Ownership, facing and legal info"
        />
      </div>

      <div className="space-y-5">
        {!isRental && !isPlot && (
          <div>
            <FieldLabel active={!!newProperty.builtYear} required>
              Built Year
            </FieldLabel>
            <FieldSelect
              value={newProperty.builtYear}
              onChange={(e) => set("builtYear", e.target.value)}
              required
            >
              <option value="">Select year</option>
              {Array.from(
                { length: new Date().getFullYear() - 1990 + 1 },
                (_, i) => 1990 + i,
              )
                .reverse()
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </FieldSelect>
          </div>
        )}

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.ownershipType} required>
              Ownership Type
            </FieldLabel>
            <PillSelect
              options={OWNERSHIP_OPTIONS}
              value={newProperty.ownershipType}
              onChange={(v) => set("ownershipType", v)}
            />
          </div>
        )}

        <Grid2>
          <div>
            <FieldLabel active={!!newProperty.builtUpArea} required>
              Built-Up Area
            </FieldLabel>
            <FieldInput
              icon="ft²"
              type="number"
              placeholder="sq. ft."
              value={newProperty.builtUpArea}
              onChange={(e) => set("builtUpArea", e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel active={!!newProperty.carpetArea} required>
              Carpet Area
            </FieldLabel>
            <FieldInput
              icon="ft²"
              type="number"
              placeholder="sq. ft."
              value={newProperty.carpetArea}
              onChange={(e) => set("carpetArea", e.target.value)}
              required
            />
          </div>
        </Grid2>

        {!isPlot && (
          <Grid2>
            <div>
              <FieldLabel active={!!newProperty.totalFloors}>
                Total Floors
              </FieldLabel>
              <FieldInput
                type="number"
                placeholder="e.g. 10"
                value={newProperty.totalFloors}
                onChange={(e) => set("totalFloors", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel active={!!newProperty.floorNo}>Floor No.</FieldLabel>
              <FieldInput
                type="number"
                placeholder="e.g. 3"
                value={newProperty.floorNo}
                onChange={(e) => set("floorNo", e.target.value)}
              />
            </div>
          </Grid2>
        )}

        {!isPlot && (
          <div>
            <FieldLabel active={!!newProperty.parkingAvailability}>
              Parking Availability
            </FieldLabel>
            <PillSelect
              options={PARKING_AVAIL}
              value={newProperty.parkingAvailability}
              onChange={(v) => set("parkingAvailability", v)}
            />
          </div>
        )}

        <div>
          <FieldLabel active={!!newProperty.loanAvailability} required>
            Loan Availability
          </FieldLabel>
          <PillSelect
            options={LOAN_AVAIL}
            value={newProperty.loanAvailability}
            onChange={(v) => set("loanAvailability", v)}
          />
        </div>

        <div>
          <FieldLabel active={!!newProperty.propertyFacing} required>
            Property Facing
          </FieldLabel>
          <PillSelect
            options={FACING_OPTIONS}
            value={newProperty.propertyFacing}
            onChange={(v) => set("propertyFacing", v)}
          />
        </div>

        {RERA_CATS.includes(newProperty.propertyCategory) && (
          <div>
            <FieldLabel active={!!newProperty.reraRegistered}>
              RERA No.
            </FieldLabel>
            <FieldInput
              placeholder="Enter RERA registration number"
              value={newProperty.reraRegistered}
              onChange={(e) => set("reraRegistered", e.target.value)}
            />
          </div>
        )}

        {!isPlot && (
          <div>
            <FieldLabel active={!!newProperty.furnishing}>
              Furnishing
            </FieldLabel>
            <PillSelect
              options={FURNISHING_OPTIONS}
              value={newProperty.furnishing}
              onChange={(v) => set("furnishing", v)}
            />
          </div>
        )}

        <div>
          <FieldLabel active={!!newProperty.waterSupply} required>
            Water Supply
          </FieldLabel>
          <PillSelect
            options={WATER_OPTIONS}
            value={newProperty.waterSupply}
            onChange={(v) => set("waterSupply", v)}
          />
        </div>

        <div>
          <FieldLabel active={!!newProperty.powerBackup} required>
            Power Backup
          </FieldLabel>
          <PillSelect
            options={POWER_OPTIONS}
            value={newProperty.powerBackup}
            onChange={(v) => set("powerBackup", v)}
          />
        </div>
      </div>

      <Divider />

      {/* ── Property Features ── */}
      <SectionHeader
        title="Property Features"
        subtitle="Unique selling points of this property"
      />
      <div className="space-y-5">
        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.locationFeature?.length}>
              Location Feature
            </FieldLabel>
            <PillMultiSelect
              options={LOCATION_FEATURES}
              value={newProperty.locationFeature || []}
              onChange={(v) => set("locationFeature", v)}
            />
          </div>
        )}

        <div>
          <FieldLabel active={!!newProperty.sizeAreaFeature}>
            Size / Area Feature
          </FieldLabel>
          <FieldInput
            placeholder="e.g. Spacious 2400 sq ft layout"
            value={newProperty.sizeAreaFeature}
            onChange={(e) => set("sizeAreaFeature", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel active={!!newProperty.parkingFeature}>
            Parking Feature
          </FieldLabel>
          <PillSelect
            options={PARKING_FEATURE_OPTIONS}
            value={newProperty.parkingFeature}
            onChange={(v) => set("parkingFeature", v)}
          />
        </div>

        <div>
          <FieldLabel active={!!newProperty.terraceFeature}>
            Balcony / Terrace Facing
          </FieldLabel>
          <PillSelect
            options={TERRACE_OPTIONS}
            value={newProperty.terraceFeature}
            onChange={(v) => set("terraceFeature", v)}
          />
        </div>

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.ageOfPropertyFeature}>
              Age of Property
            </FieldLabel>
            <FieldInput
              placeholder="e.g. 2 years old"
              value={newProperty.ageOfPropertyFeature}
              onChange={(e) => set("ageOfPropertyFeature", e.target.value)}
            />
          </div>
        )}

        <div>
          <FieldLabel active={!!newProperty.amenitiesFeature?.length}>
            Amenities
          </FieldLabel>
          <PillMultiSelect
            options={AMENITIES}
            value={newProperty.amenitiesFeature || []}
            onChange={(v) => set("amenitiesFeature", v)}
          />
        </div>

        <div>
          <FieldLabel active={!!newProperty.smartHomeFeature?.length}>
            Smart Home Features
          </FieldLabel>
          <PillMultiSelect
            options={SMART_HOME}
            value={newProperty.smartHomeFeature || []}
            onChange={(v) => set("smartHomeFeature", v)}
          />
        </div>
      </div>

      <Divider />

      {/* ── Property Benefits ── */}
      <SectionHeader
        title="Property Benefits"
        subtitle="What makes this a great investment?"
      />
      <div className="space-y-5">
        <div>
          <FieldLabel active={!!newProperty.securityBenefit?.length} required>
            Security
          </FieldLabel>
          <PillMultiSelect
            options={SECURITY}
            value={newProperty.securityBenefit || []}
            onChange={(v) => set("securityBenefit", v)}
          />
        </div>

        <div>
          <FieldLabel
            active={!!newProperty.primeLocationBenefit?.length}
            required
          >
            Prime Location
          </FieldLabel>
          <PillMultiSelect
            options={PRIME_LOCATION}
            value={newProperty.primeLocationBenefit || []}
            onChange={(v) => set("primeLocationBenefit", v)}
          />
        </div>

        <div>
          <FieldLabel
            active={!!newProperty.rentalIncomeBenefit?.length}
            required
          >
            Rental Income Potential
          </FieldLabel>
          <PillMultiSelect
            options={RENTAL_INCOME}
            value={newProperty.rentalIncomeBenefit || []}
            onChange={(v) => set("rentalIncomeBenefit", v)}
          />
        </div>

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.qualityBenefit?.length}>
              Quality
            </FieldLabel>
            <PillMultiSelect
              options={QUALITY}
              value={newProperty.qualityBenefit || []}
              onChange={(v) => set("qualityBenefit", v)}
            />
          </div>
        )}

        <div>
          <FieldLabel
            active={!!newProperty.capitalAppreciationBenefit?.length}
            required
          >
            Capital Appreciation
          </FieldLabel>
          <PillMultiSelect
            options={CAPITAL}
            value={newProperty.capitalAppreciationBenefit || []}
            onChange={(v) => set("capitalAppreciationBenefit", v)}
          />
        </div>

        <div>
          <FieldLabel
            active={!!newProperty.ecofriendlyBenefit?.length}
            required
          >
            Eco-Friendly
          </FieldLabel>
          <PillMultiSelect
            options={ECO}
            value={newProperty.ecofriendlyBenefit || []}
            onChange={(v) => set("ecofriendlyBenefit", v)}
          />
        </div>
      </div>
    </div>
  );
}
