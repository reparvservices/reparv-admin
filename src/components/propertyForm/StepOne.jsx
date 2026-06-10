import React, { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import LocationPicker from "./LocationPicker";
import TagsInput from "./TagsInput";
import {
  SectionHeader,
  FieldLabel,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  PillSelect,
  Divider,
  Grid2,
  Grid3,
} from "./FormUI";

import {
  FaHome,
  FaBuilding,
  FaStore,
  FaIndustry,
  FaTree,
  FaCity,
} from "react-icons/fa";
import { MdApartment } from "react-icons/md";
import { GiFarmTractor } from "react-icons/gi";

/* ── Property type tabs & options ── */
const NEW_TYPES = [
  { label: "New Flat", value: "NewFlat", icon: MdApartment },
  { label: "New Plot", value: "NewPlot", icon: FaTree },
  { label: "New Shop", value: "NewShop", icon: FaStore },
  { label: "Row House", value: "RowHouse", icon: FaHome },
  { label: "Lease", value: "Lease", icon: FaBuilding },
  { label: "Farm House", value: "FarmHouse", icon: GiFarmTractor },
  { label: "Farm Land", value: "FarmLand", icon: FaTree },
  { label: "Commercial Flat", value: "CommercialFlat", icon: MdApartment },
  { label: "Commercial Plot", value: "CommercialPlot", icon: FaCity },
  { label: "Industrial Space", value: "IndustrialSpace", icon: FaIndustry },
];
const RENTAL_TYPES = [
  { label: "Rental Flat", value: "RentalFlat", icon: MdApartment },
  { label: "Rental Plot", value: "RentalPlot", icon: FaCity },
  { label: "Rental Villa", value: "RentalVilla", icon: FaTree },
  { label: "Rental Shop", value: "RentalShop", icon: FaStore },
  { label: "Rental Office", value: "RentalOffice", icon: FaBuilding },
  { label: "Rental House", value: "RentalHouse", icon: FaHome },
  { label: "Rental Godown", value: "RentalGodown", icon: FaCity },
  { label: "Rental Land", value: "RentalOpenLand", icon: FaTree },
  { label: "Rental ShowRoom", value: "RentalShowroom", icon: FaIndustry },
];
const RESALE_TYPES = [
  { label: "Resale Flat", value: "ResaleFlat", icon: MdApartment },
  { label: "Resale Plot", value: "ResalePlot", icon: FaCity },
  { label: "Resale House", value: "ResaleHouse", icon: FaHome },
  { label: "Resale Villa", value: "ResalelVilla", icon: FaTree },
  { label: "Resale Shop", value: "ResaleShop", icon: FaStore },
  { label: "Resale Office", value: "ResaleOffice", icon: FaBuilding },
  { label: "Resale Farm House", value: "ResaleFarmHouse", icon: GiFarmTractor },
  { label: "Resale Godown", value: "ResaleGodown", icon: FaCity },
  { label: "Resale Bunglow", value: "ResaleBunglow", icon: FaBuilding },
  { label: "Resale ShowRoom", value: "ResaleShowroom", icon: FaIndustry },
];

const RENTAL_CATS = [
  "RentalFlat",
  "RentalVilla",
  "RentalShop",
  "RentalOffice",
  "RentalHouse",
  "RentalGodown",
  "RentalOpenLand",
  "RentalShowroom",
  "RentalPlot",
];

export default function StepOne({
  newProperty,
  setPropertyData,
  builderData,
  authorities,
  states,
  cities,
}) {
  const { URI } = useAuth();
  const [propertyTab, setPropertyTab] = useState("new");
  const [isSame, setIsSame] = useState(true);
  const [message, setMessage] = useState("");

  const isRental = RENTAL_CATS.includes(newProperty?.propertyCategory);

  /* Sync tab to loaded category (edit mode) */
  useEffect(() => {
    if (!newProperty?.propertyCategory) return;
    const c = newProperty.propertyCategory;
    if (c.startsWith("New")) setPropertyTab("new");
    else if (c.startsWith("Rental")) setPropertyTab("rental");
    else if (c.startsWith("Resale")) setPropertyTab("resale");
  }, [newProperty?.propertyCategory]);

  /* Property name uniqueness check */
  const checkPropertyName = async () => {
    if (!newProperty.propertyName) return;
    try {
      const res = await fetch(`${URI}/admin/properties/check-property-name`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProperty),
      });
      const data = await res.json();
      setIsSame(data.unique);
      setMessage(data.message);
    } catch {
      setMessage("Could not verify name");
    }
  };

  useEffect(() => {
    if (!newProperty.propertyid) checkPropertyName();
  }, [newProperty.propertyName]);

  const set = (key, val) => setPropertyData({ ...newProperty, [key]: val });

  const activeTypes =
    propertyTab === "new"
      ? NEW_TYPES
      : propertyTab === "rental"
        ? RENTAL_TYPES
        : RESALE_TYPES;

  return (
    <div className="space-y-0">
      {/* ── Property Category ── */}
      <SectionHeader
        title="Property Type"
        subtitle="What type of property are you listing?"
      />

      {/* Main tabs */}
      <div className="flex gap-2 pb-4">
        {["new", "rental", "resale"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setPropertyTab(tab);
              set("propertyCategory", "");
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all capitalize ${
              propertyTab === tab
                ? "bg-[#076300] text-white border-[#076300]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#076300]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Category pills with icon */}
      <div className="flex flex-wrap gap-2 pb-6">
        {activeTypes.map(({ label, value, icon: Icon }) => {
          const active = newProperty.propertyCategory === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => set("propertyCategory", value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                active
                  ? "bg-[#076300] text-white border-[#076300] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#076300] hover:text-[#076300]"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      <Divider />

      {/* ── Basic Details ── */}
      <SectionHeader
        title="Basic Details"
        subtitle="Builder, project name and possession"
      />
      <Grid2>
        <div>
          <FieldLabel active={!!newProperty.builderid}>
            Builder / Company
          </FieldLabel>
          <FieldSelect
            value={newProperty.builderid}
            onChange={(e) => set("builderid", e.target.value)}
          >
            <option value="">Select Builder</option>
            {builderData.map((b) => (
              <option key={b.builderid} value={b.builderid}>
                {b.company_name}
              </option>
            ))}
          </FieldSelect>
        </div>

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.projectBy}>Project By</FieldLabel>
            <FieldInput
              placeholder="e.g. XYZ Developers"
              value={newProperty.projectBy}
              onChange={(e) => set("projectBy", e.target.value)}
            />
          </div>
        )}

        {!["RentalFlat", "RentalShop", "RentalOffice"].includes(
          newProperty.propertyCategory,
        ) && (
          <div>
            <FieldLabel active={!!newProperty.possessionDate}>
              Possession Date
            </FieldLabel>
            <FieldInput
              type="date"
              value={
                newProperty.possessionDate
                  ? new Date(newProperty.possessionDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) => set("possessionDate", e.target.value || null)}
            />
          </div>
        )}

        {newProperty.propertyCategory !== "FarmLand" && (
          <div>
            <FieldLabel active={!!newProperty.propertyApprovedBy}>
              Approved By <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldSelect
              value={newProperty.propertyApprovedBy}
              onChange={(e) => set("propertyApprovedBy", e.target.value)}
              required
            >
              <option value="">Select Authority</option>
              {authorities?.map((a, i) => (
                <option key={i} value={a.authorityNACL}>
                  {a.authorityNACL}
                </option>
              ))}
            </FieldSelect>
          </div>
        )}
      </Grid2>

      <Divider />

      {/* ── Property Name ── */}
      <SectionHeader
        title="Property Name"
        subtitle="This name will appear publicly"
      />
      <div>
        <FieldLabel active={isSame && !!newProperty.propertyName} required>
          <span className={isSame === false ? "text-red-500" : ""}>
            {message || "Property Name"}
          </span>
        </FieldLabel>
        <FieldInput
          placeholder="Enter property name"
          value={newProperty.propertyName}
          onChange={(e) => set("propertyName", e.target.value)}
          required
        />
        {isSame === false && (
          <p className="mt-1.5 text-xs text-red-500">{message}</p>
        )}
      </div>

      <Divider />

      {/* ── Pricing ── */}
      <SectionHeader title="Pricing" subtitle="Sales and offer price" />
      <Grid2>
        <div>
          <FieldLabel active={!!newProperty.totalSalesPrice} required>
            Total Sales Price
          </FieldLabel>
          <FieldInput
            icon="₹"
            type="number"
            min="0"
            placeholder="0"
            value={newProperty.totalSalesPrice}
            onChange={(e) =>
              set("totalSalesPrice", Math.max(0, e.target.value))
            }
            required
          />
        </div>
        <div>
          <FieldLabel active={!!newProperty.totalOfferPrice} required>
            Total Offer Price
          </FieldLabel>
          <FieldInput
            icon="₹"
            type="number"
            min="0"
            placeholder="0"
            value={newProperty.totalOfferPrice}
            onChange={(e) =>
              set("totalOfferPrice", Math.max(0, e.target.value))
            }
            required
          />
        </div>
      </Grid2>

      <Divider />

      {/* ── Location ── */}
      <SectionHeader title="Location" subtitle="Address and coordinates" />
      <div className="space-y-4">
        <div>
          <FieldLabel active={!!newProperty.address} required>
            Address
          </FieldLabel>
          <FieldInput
            placeholder="Full address"
            value={newProperty.address}
            onChange={(e) => set("address", e.target.value)}
            required
          />
        </div>

        <Grid3>
          <div>
            <FieldLabel active={!!newProperty.state} required>
              State
            </FieldLabel>
            <FieldSelect
              value={newProperty.state}
              onChange={(e) => set("state", e.target.value)}
              required
            >
              <option value="">Select State</option>
              {states?.map((s, i) => (
                <option key={i} value={s.state}>
                  {s.state}
                </option>
              ))}
            </FieldSelect>
          </div>
          <div>
            <FieldLabel active={!!newProperty.city} required>
              City
            </FieldLabel>
            <FieldSelect
              value={newProperty.city}
              onChange={(e) => set("city", e.target.value)}
              required
            >
              <option value="">Select City</option>
              {cities?.map((c, i) => (
                <option key={i} value={c.city}>
                  {c.city}
                </option>
              ))}
            </FieldSelect>
          </div>
          <div>
            <FieldLabel active={!!newProperty.pincode} required>
              Pin Code
            </FieldLabel>
            <FieldInput
              type="number"
              placeholder="6-digit code"
              value={newProperty.pincode}
              onChange={(e) => {
                if (/^\d{0,6}$/.test(e.target.value))
                  set("pincode", e.target.value);
              }}
              required
            />
          </div>
        </Grid3>

        <Grid2>
          <div>
            <FieldLabel active={!!newProperty.location} required>
              Locality / Area
            </FieldLabel>
            <FieldInput
              placeholder="Locality name"
              value={newProperty.location}
              onChange={(e) => set("location", e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel active={!!newProperty.distanceFromCityCenter} required>
              Distance from City Center
            </FieldLabel>
            <FieldSelect
              value={newProperty.distanceFromCityCenter}
              onChange={(e) => set("distanceFromCityCenter", e.target.value)}
              required
            >
              <option value="">Select distance</option>
              {Array.from({ length: 25 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} km
                </option>
              ))}
            </FieldSelect>
          </div>
        </Grid2>

        {/* Map picker */}
        {newProperty.state && newProperty.city && newProperty.pincode && (
          <div>
            <FieldLabel
              active={!!(newProperty.latitude && newProperty.longitude)}
              required
            >
              Pin on Map
            </FieldLabel>
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <LocationPicker
                onChange={({ latitude, longitude }) =>
                  setPropertyData({ ...newProperty, latitude, longitude })
                }
                state={newProperty.state}
                city={newProperty.city}
                pincode={newProperty.pincode}
                latitude={newProperty.latitude}
                longitude={newProperty.longitude}
              />
            </div>
          </div>
        )}
      </div>

      <Divider />

      {/* ── Other Charges ── */}
      <SectionHeader
        title="Charges & Taxes"
        subtitle="Applicable rates and fees"
      />
      <Grid2>
        <div>
          <FieldLabel active={!!newProperty.stampDuty} required>
            Stamp Duty
          </FieldLabel>
          <FieldSelect
            icon="%"
            value={newProperty.stampDuty}
            onChange={(e) => set("stampDuty", e.target.value)}
            required
          >
            <option value="">Select %</option>
            <option value="0.25">0.25%</option>
            <option value="5">5%</option>
            <option value="6">6%</option>
            <option value="7">7%</option>
          </FieldSelect>
        </div>

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.registrationFee}>
              Registration Fee
            </FieldLabel>
            <FieldSelect
              icon="%"
              value={newProperty.registrationFee}
              onChange={(e) => set("registrationFee", e.target.value)}
            >
              <option value="">Select fee</option>
              <option value="1">1%</option>
              <option value="30000">₹ 30,000</option>
            </FieldSelect>
          </div>
        )}

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.gst}>GST</FieldLabel>
            <FieldSelect
              icon="%"
              value={newProperty.gst}
              onChange={(e) => set("gst", e.target.value)}
            >
              <option value="">Select %</option>
              <option value="0">0%</option>
              <option value="1">1%</option>
              <option value="5">5%</option>
            </FieldSelect>
          </div>
        )}

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.advocateFee}>
              Advocate Fee
            </FieldLabel>
            <FieldSelect
              icon="₹"
              value={newProperty.advocateFee}
              onChange={(e) => set("advocateFee", e.target.value)}
            >
              <option value="">Select fee</option>
              <option value="0">₹ 0</option>
              <option value="10000">₹ 10,000</option>
              <option value="15000">₹ 15,000</option>
              <option value="20000">₹ 20,000</option>
              <option value="25000">₹ 25,000</option>
            </FieldSelect>
          </div>
        )}

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.maintenance}>
              Maintenance
            </FieldLabel>
            <FieldInput
              icon="₹"
              type="number"
              min="0"
              placeholder="0"
              value={newProperty.maintenance}
              onChange={(e) => set("maintenance", Math.max(0, e.target.value))}
            />
          </div>
        )}

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.msebWater}>
              MSEB &amp; Water Charges
            </FieldLabel>
            <FieldInput
              icon="₹"
              type="number"
              min="0"
              placeholder="0"
              value={newProperty.msebWater}
              onChange={(e) => set("msebWater", Math.max(0, e.target.value))}
            />
          </div>
        )}

        <div>
          <FieldLabel active={!!newProperty.other} required>
            Other Charges
          </FieldLabel>
          <FieldInput
            icon="₹"
            type="number"
            min="0"
            placeholder="0"
            value={newProperty.other}
            onChange={(e) => set("other", Math.max(0, e.target.value))}
            required
          />
        </div>
      </Grid2>

      <Divider />

      {/* ── Tags ── */}
      <SectionHeader
        title="Tags"
        subtitle="Keywords to help buyers find this property"
      />
      <TagsInput newProperty={newProperty} setPropertyData={setPropertyData} />
    </div>
  );
}
