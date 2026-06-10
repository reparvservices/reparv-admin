import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StepOne from "../components/propertyForm/StepOne";
import StepTwo from "../components/propertyForm/StepTwo";
import StepThree from "../components/propertyForm/StepThree";
import { useAuth } from "../store/auth";
import Loader from "../components/Loader";
import { PiBuildingsFill } from "react-icons/pi";
import { IoArrowBack } from "react-icons/io5";

const EMPTY_PROPERTY = {
  propertyid: "",
  builderid: "",
  projectBy: "",
  possessionDate: "",
  propertyCategory: "",
  propertyApprovedBy: "",
  propertyName: "",
  address: "",
  state: "",
  city: "",
  pincode: "",
  location: "",
  distanceFromCityCenter: "",
  latitude: "",
  longitude: "",
  totalSalesPrice: "",
  totalOfferPrice: "",
  stampDuty: "",
  registrationFee: "",
  gst: "",
  advocateFee: "",
  msebWater: "",
  maintenance: "",
  other: "",
  tags: "",
  propertyType: "",
  builtYear: "",
  ownershipType: "",
  builtUpArea: "",
  carpetArea: "",
  parkingAvailability: "",
  totalFloors: "",
  floorNo: "",
  loanAvailability: "",
  propertyFacing: "",
  reraRegistered: "",
  furnishing: "",
  waterSupply: "",
  powerBackup: "",
  locationFeature: [],
  sizeAreaFeature: "",
  parkingFeature: "",
  terraceFeature: "",
  ageOfPropertyFeature: "",
  amenitiesFeature: [],
  propertyStatusFeature: "",
  smartHomeFeature: [],
  securityBenefit: [],
  primeLocationBenefit: [],
  rentalIncomeBenefit: [],
  qualityBenefit: [],
  capitalAppreciationBenefit: [],
  ecofriendlyBenefit: [],
};

const EMPTY_IMAGES = {
  frontView: [],
  sideView: [],
  kitchenView: [],
  hallView: [],
  bedroomView: [],
  bathroomView: [],
  balconyView: [],
  nearestLandmark: [],
  developedAmenities: [],
};

const STEPS = [
  { label: "Property Details", desc: "Category, location & pricing" },
  { label: "Overview & Features", desc: "Specs, amenities & benefits" },
  { label: "Media Gallery", desc: "Upload property photos" },
];

export default function PropertyFormPage() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { URI, setLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [newProperty, setPropertyData] = useState(EMPTY_PROPERTY);
  const [imageFiles, setImageFiles] = useState(EMPTY_IMAGES);
  const [builderData, setBuilderData] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(!!editId);

  /* ── Reference data ── */
  useEffect(() => {
    Promise.all([
      fetch(`${URI}/admin/authorities`, { credentials: "include" }).then((r) =>
        r.json(),
      ),
      fetch(`${URI}/admin/states`, { credentials: "include" }).then((r) =>
        r.json(),
      ),
      fetch(`${URI}/admin/builders/active`, { credentials: "include" }).then(
        (r) => r.json(),
      ),
    ])
      .then(([auth, st, bl]) => {
        setAuthorities(auth);
        setStates(st);
        setBuilderData(bl);
      })
      .catch(() => {});
  }, [URI]);

  useEffect(() => {
    if (!newProperty.state) return;
    fetch(`${URI}/admin/cities/${newProperty.state}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setCities)
      .catch(() => {});
  }, [newProperty.state, URI]);

  /* ── Edit mode ── */
  useEffect(() => {
    if (!editId) return;
    setFetchingEdit(true);
    fetch(`${URI}/admin/properties/${editId}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setPropertyData)
      .catch(() => {})
      .finally(() => setFetchingEdit(false));
  }, [editId, URI]);

  /* ── Step validation ── */
  useEffect(() => {
    if (step === 1) {
      const req = [
        "propertyCategory",
        "propertyName",
        "address",
        "state",
        "city",
        "pincode",
        "location",
        "distanceFromCityCenter",
        "latitude",
        "longitude",
        "totalSalesPrice",
        "totalOfferPrice",
        "stampDuty",
        "other",
        "tags",
      ];
      setNextEnabled(
        req.every((f) => {
          const v = newProperty[f];
          return typeof v === "number" ? v >= 0 : v && String(v).trim() !== "";
        }),
      );
    } else if (step === 2) {
      const req = [
        "carpetArea",
        "loanAvailability",
        "propertyFacing",
        "waterSupply",
        "powerBackup",
        "securityBenefit",
        "primeLocationBenefit",
        "rentalIncomeBenefit",
        "capitalAppreciationBenefit",
        "ecofriendlyBenefit",
      ];
      setNextEnabled(
        req.every((f) => {
          const v = newProperty[f];
          if (Array.isArray(v)) return v.length > 0;
          return typeof v === "number" ? v >= 0 : v && String(v).trim() !== "";
        }),
      );
    } else {
      setNextEnabled(false);
    }
  }, [newProperty, step]);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newProperty).forEach(([k, v]) => formData.append(k, v));
    [
      "frontView",
      "sideView",
      "kitchenView",
      "hallView",
      "bedroomView",
      "bathroomView",
      "balconyView",
      "nearestLandmark",
      "developedAmenities",
    ].forEach((field) =>
      (imageFiles[field] || []).forEach((f) => formData.append(field, f)),
    );

    const endpoint = newProperty.propertyid
      ? `edit/${newProperty.propertyid}`
      : "add";
    try {
      setLoading(true);
      const res = await fetch(`${URI}/admin/properties/${endpoint}`, {
        method: newProperty.propertyid ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      });
      if (res.status === 409) {
        const d = await res.json();
        alert(d.message || "Property name exists!");
        return;
      }
      if (!res.ok) throw new Error();
      alert(newProperty.propertyid ? "Property updated!" : "Property added!");
      navigate("/properties");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  /* ── Loading state ── */
  if (fetchingEdit) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading property…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* ═══ Page hero strip ═══ */}
      <div className="bg-gradient-to-br from-[#076300] via-[#0a7d04] to-[#0d4f0a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="hidden sm:flex h-11 w-11 rounded-xl bg-white/15 items-center justify-center border border-white/20 shrink-0 mt-0.5">
              <PiBuildingsFill size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                {STEPS[step - 1].label}
              </h2>
              <p className="text-white/70 text-sm mt-0.5">
                {STEPS[step - 1].desc}
              </p>
            </div>
          </div>

          {/* Step pills */}
          <div className="mt-5 flex items-center gap-2 sm:gap-3">
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <React.Fragment key={s.label}>
                  <button
                    type="button"
                    onClick={() => done && setStep(idx)}
                    className={`flex items-center gap-1.5 shrink-0 transition-all ${done ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border-2 transition-all ${
                        active
                          ? "bg-white text-[#076300] border-white"
                          : done
                            ? "bg-white/20 text-white border-white/40"
                            : "bg-white/10 text-white/40 border-white/20"
                      }`}
                    >
                      {done ? "✓" : idx}
                    </span>
                    <span
                      className={`hidden sm:block text-xs font-semibold transition-opacity ${
                        active
                          ? "text-white"
                          : done
                            ? "text-white/60"
                            : "text-white/35"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-white/60 transition-all duration-500"
                        style={{ width: done ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Form body ═══ */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-20">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-5 sm:px-8 py-6 sm:py-8">
              {step === 1 && (
                <StepOne
                  newProperty={newProperty}
                  setPropertyData={setPropertyData}
                  builderData={builderData}
                  authorities={authorities}
                  states={states}
                  cities={cities}
                />
              )}
              {step === 2 && (
                <StepTwo
                  newProperty={newProperty}
                  setPropertyData={setPropertyData}
                />
              )}
              {step === 3 && (
                <StepThree
                  newProperty={newProperty}
                  imageFiles={imageFiles}
                  setImageFiles={setImageFiles}
                />
              )}
            </div>
          </div>

          {/* ═══ Sticky bottom nav — truly full width ═══ */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.07)]">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
              {/* Left: Cancel */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 sm:px-5 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>

              {/* Right: Back + Next/Save */}
              <div className="flex items-center gap-2 sm:gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all"
                  >
                    ← Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextEnabled ? goNext : undefined}
                    disabled={!nextEnabled}
                    className={`px-6 sm:px-10 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      nextEnabled
                        ? "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-sm shadow-green-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Continue →
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-6 sm:px-10 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 active:scale-[0.98] rounded-xl shadow-sm shadow-green-200 transition-all"
                    >
                      {newProperty.propertyid ? "Save Changes" : "Add Property"}
                    </button>
                    <Loader />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
