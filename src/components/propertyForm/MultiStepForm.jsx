import React, { useEffect, useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { useAuth } from "../../store/auth";
import { IoMdClose } from "react-icons/io";
import Loader from "../Loader";

const MultiStepForm = ({
  fetchData,
  newProperty,
  setPropertyData,
  imageFiles,
  setImageFiles,
  builderData,
  authorities,
  states,
  cities,
}) => {
  const { URI, setLoading, showPropertyForm, setShowPropertyForm } = useAuth();
  const [step, setStep] = useState(1);
  const [nextButton, setNextButton] = useState(false);

  const steps = ["Property Details", "Overview Details", "Add Images"];

  const nextStep = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const prevStep = (e) => {
    e.preventDefault();
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(newProperty).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const imageFields = [
      "frontView",
      "sideView",
      "kitchenView",
      "hallView",
      "bedroomView",
      "bathroomView",
      "balconyView",
      "nearestLandmark",
      "developedAmenities",
    ];

    imageFields.forEach((field) => {
      if (imageFiles[field]) {
        imageFiles[field].forEach((file) => {
          formData.append(field, file);
        });
      }
    });

    const endpoint = newProperty.propertyid
      ? `edit/${newProperty.propertyid}`
      : "add";

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/properties/${endpoint}`, {
        method: newProperty.propertyid ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      });

      // If duplicate property name
      if (response.status === 409) {
        const data = await response.json();
        alert(data.message || "Property name already exists!");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to save property. Status: ${response.status}`);
      }

      alert(
        newProperty.propertyid
          ? "Property updated successfully!"
          : "Property added successfully!",
      );

      // Reset form
      setPropertyData({
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
      });

      setStep(1);
      setShowPropertyForm(false);
      await fetchData();
    } catch (err) {
      alert("Something Went Wrong Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const checkButton = () => {
    if (step === 1) {
      const requiredFieldsStep1 = [
        "propertyCategory",
        "propertyName",
        "address",
        "state",
        "city",
        "pincode", // number
        "location",
        "distanceFromCityCenter",
        "latitude",
        "longitude",
        "totalSalesPrice", // number
        "totalOfferPrice", // number
        "stampDuty", // number
        "other", //number
        "tags",
      ];

      const allFilled = requiredFieldsStep1.every((field) => {
        const value = newProperty[field];
        if (typeof value === "number") {
          return value > -1; // for numbers, must be Positive
        }
        return value && value.toString().trim() !== ""; // for strings
      });

      setNextButton(allFilled);
    } else if (step === 2) {
      const requiredFieldsStep2 = [
        "carpetArea", // number
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

      const allFilled = requiredFieldsStep2.every((field) => {
        const value = newProperty[field];
        if (typeof value === "number") {
          return value > -1; // number must be Positive
        }
        return value && value.toString().trim() !== "";
      });

      setNextButton(allFilled);
    } else {
      setNextButton(false);
    }
  };

  useEffect(() => {
    checkButton();
  }, [newProperty, step]);

  const closeForm = () => {
    setShowPropertyForm(false);
    setStep(1);
    setPropertyData((prev) =>
      Object.fromEntries(Object.keys(prev).map((k) => [k, ""])),
    );
  };

  useEffect(() => {
    if (!showPropertyForm) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeForm();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showPropertyForm]);

  if (!showPropertyForm) return null;

  return (
    <div
      className="property-form fixed inset-0 z-[61] flex items-end md:items-center justify-center p-0 md:p-6 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-property-title"
    >
      <div
        className="pointer-events-auto flex w-full max-w-[1000px] max-h-[92vh] md:max-h-[88vh] flex-col overflow-hidden bg-white shadow-2xl border border-gray-200/90 rounded-t-2xl md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="add-property-title"
                className="text-lg sm:text-xl font-semibold text-gray-900"
              >
                {newProperty.propertyid ? "Edit Property" : "Add Property"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Step {step} of 3 — {steps[step - 1]}
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="shrink-0 p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <IoMdClose className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 sm:gap-3">
            {steps.map((label, index) => (
              <div
                key={label}
                className="flex flex-1 min-w-0 items-center gap-2"
              >
                <div
                  className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                    step === index + 1
                      ? "bg-[#076300] text-white"
                      : step > index + 1
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="hidden sm:block truncate text-xs font-medium text-gray-600">
                  {label}
                </span>
                {index < steps.length - 1 ? (
                  <div
                    className={`hidden sm:block flex-1 h-0.5 rounded ${
                      step > index + 1 ? "bg-emerald-300" : "bg-gray-200"
                    }`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleFinalSubmit}
          className="flex flex-1 flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 py-4 sm:py-6">
          <input
            type="hidden"
            value={newProperty.propertyid}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                propertyid: e.target.value,
              })
            }
          />
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

          <div className="shrink-0 flex justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-4 sm:px-6 py-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:scale-[0.98]"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextButton === true ? nextStep : undefined}
                disabled={nextButton !== true}
                className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  nextButton === true
                    ? "bg-[#076300] text-white hover:bg-[#065a00] active:scale-[0.98]"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#076300] rounded-xl hover:bg-[#065a00] active:scale-[0.98]"
                >
                  Save
                </button>
                <Loader />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default MultiStepForm;
