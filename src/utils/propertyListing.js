import { MdApartment } from "react-icons/md";
import { GiFarmTractor, GiFamilyHouse } from "react-icons/gi";
import {
  FaHome,
  FaStore,
  FaBuilding,
  FaCity,
  FaTree,
  FaIndustry,
  FaWarehouse,
} from "react-icons/fa";
import { BsShopWindow } from "react-icons/bs";

/* Listing flow: Sell / Buy / Rent → Residential / Commercial / Agriculture → category.
 * propertyCategory values are unchanged so the rest of the form (and the
 * website filters) keep working; listingType / propertyKind are stored too. */

export const LISTING_TYPES = [
  { key: "Sell", label: "Sell", hint: "List a property for sale" },
  { key: "Rent", label: "Rent", hint: "List a property for rent" },
];

// Venue Booking (villas, halls, farmhouses, event spaces) is a property type too, but it is
// stored and priced as a venue listing (nightly / per slot) and saved through the venue API.
export const VENUE_KIND = "Venue";

export const PROPERTY_KINDS = [
  { key: "Residential", label: "Residential" },
  { key: "Commercial", label: "Commercial" },
  { key: "Agriculture", label: "Agriculture / Land" },
  { key: VENUE_KIND, label: "Venue Booking" },
];

// Sell & Buy: new launch or resale (maps to the existing category groups)
export const SALE_CONDITIONS = [
  { key: "new", label: "New Launch" },
  { key: "resale", label: "Resale" },
];

const NEW_CATEGORIES = [
  { label: "New Flat", value: "NewFlat", icon: MdApartment, kind: "Residential" },
  { label: "New Plot", value: "NewPlot", icon: FaCity, kind: "Residential" },
  { label: "Row House", value: "RowHouse", icon: FaHome, kind: "Residential" },
  { label: "Studio", value: "Studio", icon: FaHome, kind: "Residential" },
  { label: "Penthouse", value: "Penthouse", icon: GiFamilyHouse, kind: "Residential" },
  { label: "Independent Floor", value: "IndependentFloor", icon: FaBuilding, kind: "Residential" },
  { label: "New Shop", value: "NewShop", icon: FaStore, kind: "Commercial" },
  { label: "Office Space", value: "OfficeSpace", icon: FaBuilding, kind: "Commercial" },
  { label: "Showrooms", value: "Showrooms", icon: BsShopWindow, kind: "Commercial" },
  { label: "Warehouse", value: "Warehouse", icon: FaWarehouse, kind: "Commercial" },
  { label: "Commercial Flat", value: "CommercialFlat", icon: FaBuilding, kind: "Commercial" },
  { label: "Commercial Plot", value: "CommercialPlot", icon: FaCity, kind: "Commercial" },
  { label: "Industrial Space", value: "IndustrialSpace", icon: FaWarehouse, kind: "Commercial" },
  { label: "Farm Land", value: "FarmLand", icon: FaTree, kind: "Agriculture" },
  { label: "Farm House", value: "FarmHouse", icon: GiFarmTractor, kind: "Agriculture" },
];

const RESALE_CATEGORIES = [
  { label: "Resale Flat", value: "ResaleFlat", icon: MdApartment, kind: "Residential" },
  { label: "Resale Plot", value: "ResalePlot", icon: FaCity, kind: "Residential" },
  { label: "Resale House", value: "ResaleHouse", icon: FaHome, kind: "Residential" },
  { label: "Resale Villa", value: "ResalelVilla", icon: FaBuilding, kind: "Residential" },
  { label: "Resale Bungalow", value: "ResaleBunglow", icon: FaHome, kind: "Residential" },
  { label: "Resale Shop", value: "ResaleShop", icon: FaStore, kind: "Commercial" },
  { label: "Resale Office", value: "ResaleOffice", icon: FaBuilding, kind: "Commercial" },
  { label: "Resale Godown", value: "ResaleGodown", icon: FaWarehouse, kind: "Commercial" },
  { label: "Resale ShowRoom", value: "ResaleShowroom", icon: BsShopWindow, kind: "Commercial" },
  { label: "Resale Farm Land", value: "ResaleFarmLand", icon: FaTree, kind: "Agriculture" },
  { label: "Resale Farm House", value: "ResaleFarmHouse", icon: GiFarmTractor, kind: "Agriculture" },
];

const RENTAL_CATEGORIES = [
  { label: "Rental Flat", value: "RentalFlat", icon: MdApartment, kind: "Residential" },
  { label: "Rental House", value: "RentalHouse", icon: FaHome, kind: "Residential" },
  { label: "Rental Villa", value: "RentalVilla", icon: FaBuilding, kind: "Residential" },
  { label: "Rental Plot", value: "RentalPlot", icon: FaCity, kind: "Residential" },
  { label: "Rental Shop", value: "RentalShop", icon: FaStore, kind: "Commercial" },
  { label: "Rental Office", value: "RentalOffice", icon: FaBuilding, kind: "Commercial" },
  { label: "Rental Godown", value: "RentalGodown", icon: FaWarehouse, kind: "Commercial" },
  { label: "Rental ShowRoom", value: "RentalShowroom", icon: BsShopWindow, kind: "Commercial" },
  { label: "Rental Land", value: "RentalOpenLand", icon: FaTree, kind: "Agriculture" },
];

const ALL_CATEGORIES = [...NEW_CATEGORIES, ...RESALE_CATEGORIES, ...RENTAL_CATEGORIES];

const AGRICULTURE_FALLBACK = new Set(["ResaleFarmLand", "RentalFarmHouse", "RentalLand"]);
const COMMERCIAL_FALLBACK = new Set([
  "Shop", "OfficeSpace", "Showrooms", "Warehouse", "Lease",
  "ResaleWarehouse", "ResaleShowRoom", "ResaleCommercial", "RentalWarehouse", "RentalShowRoom",
]);

/** "new" | "resale" | "rent" — the group a category belongs to */
export const categoryGroup = (category) => {
  const c = String(category || "");
  if (c.startsWith("Rental")) return "rent";
  if (c.startsWith("Resale")) return "resale";
  return "new";
};

export const kindOfCategory = (category) => {
  const c = String(category || "");
  if (!c) return "";
  const known = ALL_CATEGORIES.find((item) => item.value === c);
  if (known) return known.kind;
  if (AGRICULTURE_FALLBACK.has(c)) return "Agriculture";
  if (COMMERCIAL_FALLBACK.has(c)) return "Commercial";
  return "Residential";
};

/** Categories to offer for a listing type / sale condition / property kind */
export const categoriesFor = ({ listingType, condition, propertyKind }) => {
  const group =
    listingType === "Rent"
      ? RENTAL_CATEGORIES
      : condition === "resale"
        ? RESALE_CATEGORIES
        : NEW_CATEGORIES;
  return propertyKind ? group.filter((c) => c.kind === propertyKind) : group;
};

/** Initial classification state from a stored property (edit mode) */
export const classificationFromProperty = (property = {}) => {
  const category = property.propertyCategory || "";
  const group = categoryGroup(category);
  return {
    listingType:
      property.listingType || (category && group === "rent" ? "Rent" : "Sell"),
    condition: group === "resale" ? "resale" : "new",
    propertyKind: property.propertyKind || kindOfCategory(category) || "Residential",
  };
};

/** propertyTab value used by the existing form sections ("new" | "resale" | "rent") */
export const propertyTabFor = ({ listingType, condition }) =>
  listingType === "Rent" ? "rent" : condition === "resale" ? "resale" : "new";

export const categoryLabel = (category) =>
  ALL_CATEGORIES.find((c) => c.value === category)?.label || category || "";

/* ── Basic information: fields change with the property type ─────────────── */

export const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
export const COMMERCIAL_FURNISHING_OPTIONS = [...FURNISHING_OPTIONS, "Bare Shell"];
export const FACING_OPTIONS = [
  "North-facing",
  "North-East-facing (NE)",
  "East-facing",
  "South-East-facing (SE)",
  "South-facing",
  "South-West-facing (SW)",
  "West-facing",
  "North-West-facing (NW)",
  "Road Facing",
];
export const YES_NO = ["Yes", "No"];
export const POWER_OPTIONS = [
  "State Electricity Board Supply",
  "Dedicated Transformer Supply",
  "DG (Diesel Generator) Backup",
  "Inverter / Battery Backup",
  "Solar Power Supply",
  "No Power Supply",
];
export const WATER_SOURCE_OPTIONS = [
  "Borewell / Tube Well",
  "Open Well",
  "Canal / River",
  "Municipal / Corporation Water",
  "Combination / Mixed",
  "No Water Source",
];
export const OWNERSHIP_OPTIONS = [
  "Freehold",
  "Lease Hold",
  "Single Ownership",
  "Joint Ownership",
  "Power of Attorney",
  "Government Alloted Property",
];
export const LAND_UNITS = ["Acre", "Guntha", "Hectare", "Sq.ft"];

/** "built" (flat/shop/office…), "plot" (residential/commercial plot) or "land" (agriculture) */
export const areaModeFor = ({ propertyKind, propertyCategory }) => {
  const kind = propertyKind || kindOfCategory(propertyCategory);
  if (kind === "Agriculture") return "land";
  return /Plot|Land/.test(String(propertyCategory || "")) ? "plot" : "built";
};

const FIELD = {
  furnishing: { key: "furnishing", label: "Furnishing", type: "select", options: FURNISHING_OPTIONS },
  floorNo: { key: "floorNo", label: "Floor No.", type: "number", placeholder: "e.g. 3" },
  totalFloors: { key: "totalFloors", label: "Total Floors", type: "number", placeholder: "e.g. 12" },
  propertyFacing: { key: "propertyFacing", label: "Facing", type: "select", options: FACING_OPTIONS },
  parkingAvailability: { key: "parkingAvailability", label: "Parking Available", type: "select", options: YES_NO },
  powerBackup: { key: "powerBackup", label: "Power Supply / Backup", type: "select", options: POWER_OPTIONS },
  waterSupply: { key: "waterSupply", label: "Water Source", type: "select", options: WATER_SOURCE_OPTIONS },
  ownershipType: { key: "ownershipType", label: "Ownership", type: "select", options: OWNERSHIP_OPTIONS },
};

/** Extra basic-info fields (besides area & price) for the selected type */
export const basicDetailFieldsFor = ({ propertyKind, propertyCategory }) => {
  const kind = propertyKind || kindOfCategory(propertyCategory);
  const mode = areaModeFor({ propertyKind: kind, propertyCategory });
  if (mode === "land") return [FIELD.waterSupply, FIELD.ownershipType, FIELD.propertyFacing];
  if (mode === "plot") return [FIELD.propertyFacing, FIELD.ownershipType];
  if (kind === "Commercial") {
    return [
      { ...FIELD.furnishing, options: COMMERCIAL_FURNISHING_OPTIONS },
      FIELD.floorNo,
      FIELD.totalFloors,
      FIELD.parkingAvailability,
      FIELD.powerBackup,
    ];
  }
  return [FIELD.furnishing, FIELD.floorNo, FIELD.totalFloors, FIELD.propertyFacing];
};

export const BASIC_DETAIL_KEYS = Object.keys(FIELD);

/** Split a stored land area like "2.5 Acre" into { value, unit } */
export const parseLandArea = (stored) => {
  const text = String(stored ?? "").trim();
  const unit = LAND_UNITS.find((u) => text.toLowerCase().endsWith(u.toLowerCase()));
  return {
    value: unit ? text.slice(0, -unit.length).trim() : text,
    unit: unit || "Acre",
  };
};

/**
 * Area columns to store for the area mode:
 *  built → builtUpArea + carpetArea, plot → plot area in both,
 *  land → "2.5 Acre" in builtUpArea, carpetArea empty.
 */
export const areaColumnsFor = (mode, { builtUpArea, carpetArea, plotArea, landArea, landUnit }) => {
  if (mode === "land") {
    return { builtUpArea: landArea ? `${landArea} ${landUnit || "Acre"}` : "", carpetArea: "" };
  }
  if (mode === "plot") return { builtUpArea: plotArea || "", carpetArea: plotArea || "" };
  return { builtUpArea: builtUpArea || "", carpetArea: carpetArea || "" };
};

/** Label + value for showing a stored property's area */
export const areaDisplayFor = (property = {}) => {
  const mode = areaModeFor(property);
  if (mode === "land") return { label: "Land Area", value: property.builtUpArea || "" };
  if (mode === "plot") {
    const v = property.carpetArea || property.builtUpArea;
    return { label: "Plot Area", value: v ? `${v} sq.ft` : "" };
  }
  return {
    label: "Carpet Area",
    value: property.carpetArea ? `${property.carpetArea} sq.ft` : "",
  };
};

/* ── BHK: same options and rules as the partner app ──────────────────────── */

// Same list as the website, so the website BHK filters find every listing
export const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "5 BHK", "Above 5 BHK", "Pent House", "Studio Apartment", "Duplex Apartment"];
const NO_BHK_CATEGORIES = new Set(["NewPlot", "NewShop", "OfficeSpace", "Showrooms", "Warehouse", "CommercialPlot", "CommercialFlat", "IndustrialSpace", "ResalePlot", "ResaleShop", "ResaleOffice", "ResaleGodown", "ResaleShowroom", "ResaleFarmLand", "ResaleFarmHouse", "RentalPlot", "RentalShop", "RentalOffice", "RentalGodown", "RentalShowroom", "RentalOpenLand", "FarmLand", "FarmHouse"]);
export const showBhkFor = (category) => !!category && !NO_BHK_CATEGORIES.has(category);

/* ── Photos: same sections and limits as the partner app ─────────────────── */

export const MAX_PHOTOS_PER_SECTION = 5;
export const MAX_EXTRA_PHOTOS = 10;
export const maxPhotosFor = (key) =>
  key === "extraImages" ? MAX_EXTRA_PHOTOS : MAX_PHOTOS_PER_SECTION;

const S = (key, label, required) => ({ key, label, required: !!required });
const FRONT = S("frontView", "Front View", true);
const EXTRA = S("extraImages", "Extra / Other");
const RESIDENTIAL_SECTIONS = [FRONT, S("sideView", "Side View"), S("hallView", "Hall"), S("kitchenView", "Kitchen"), S("bedroomView", "Bedroom"), S("bathroomView", "Bathroom"), S("balconyView", "Balcony"), EXTRA];
const PLOT_SECTIONS = [FRONT, S("nearestLandmark", "Nearest Landmark"), S("developedAmenities", "Developed Amenities"), EXTRA];
const FARMHOUSE_SECTIONS = [FRONT, S("sideView", "Side View"), S("hallView", "Hall"), S("kitchenView", "Kitchen"), S("bathroomView", "Bathroom"), S("terraceSitout", "Terrace / Sit-out"), S("farmGardenArea", "Farm / Garden Area"), EXTRA];
const SHOP_SECTIONS = [FRONT, S("interiorView", "Interior"), S("entranceView", "Entrance"), S("roadView", "Road View"), S("parkingView", "Parking"), EXTRA];
const OFFICE_SECTIONS = [FRONT, S("officeArea", "Office Area"), S("cabinView", "Cabin"), S("washroomView", "Washroom"), S("parkingView", "Parking"), EXTRA];
const WAREHOUSE_SECTIONS = [FRONT, S("warehouseArea", "Warehouse Area"), S("loadingArea", "Loading Area"), S("washroomView", "Washroom"), S("parkingView", "Parking"), EXTRA];
const SHOWROOM_SECTIONS = [FRONT, S("showroomInterior", "Showroom Interior"), S("entranceView", "Entrance"), S("displayArea", "Display Area"), S("roadView", "Road View"), S("parkingView", "Parking"), S("washroomView", "Washroom"), EXTRA];

const SECTION_GROUPS = [
  [PLOT_SECTIONS, ["NewPlot", "CommercialPlot", "ResalePlot", "RentalPlot", "FarmLand", "ResaleFarmLand", "RentalOpenLand"]],
  [FARMHOUSE_SECTIONS, ["FarmHouse", "ResaleFarmHouse"]],
  [SHOP_SECTIONS, ["NewShop", "Shop", "ResaleShop", "RentalShop"]],
  [OFFICE_SECTIONS, ["OfficeSpace", "CommercialFlat", "ResaleOffice", "RentalOffice"]],
  [WAREHOUSE_SECTIONS, ["Warehouse", "IndustrialSpace", "ResaleGodown", "RentalGodown", "RentalWarehouse"]],
  [SHOWROOM_SECTIONS, ["Showrooms", "ResaleShowroom", "ResaleShowRoom", "RentalShowroom", "RentalShowRoom"]],
];

export const imageSectionsFor = (category) =>
  SECTION_GROUPS.find(([, ids]) => ids.includes(category))?.[0] ?? RESIDENTIAL_SECTIONS;

const ALL_SECTIONS = [RESIDENTIAL_SECTIONS, ...SECTION_GROUPS.map(([s]) => s)].flat();
export const ALL_IMAGE_SECTIONS = ALL_SECTIONS.filter(
  (s, i) => ALL_SECTIONS.findIndex((o) => o.key === s.key) === i,
);

/** Every property type with its label, kind and group (New Launch / Resale / Rental), for admin screens */
export const ALL_PROPERTY_CATEGORIES = ALL_CATEGORIES.map(({ label, value, kind }) => ({
  label,
  value,
  kind,
  group: categoryGroup(value),
}));
