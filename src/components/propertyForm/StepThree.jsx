import { useState } from "react";

const StepThree = ({
  newProperty,
  setPropertyData,
  imageFiles,
  setImageFiles,
}) => {
  // Handle Image Upload with Validation
  const handleImageChange = (event, category) => {
    const files = Array.from(event.target.files);
    const validFormats = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 500 * 1024; // 500 KB limit

    const validFiles = [];
    for (const file of files) {
      if (!validFormats.includes(file.type)) {
        alert(`❌ Invalid file type: ${file.name}. Only JPG, JPEG, PNG allowed.`);
        continue;
      }
      if (file.size > maxSize) {
        alert(`⚠️ File too large: ${file.name}. Must be under 500KB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      event.target.value = "";
      return;
    }

    setImageFiles((prev) => {
      const existing = prev[category] || [];
      const newFiles = [...existing, ...validFiles];
      if (newFiles.length > 3) {
        alert("⚠️ You can only upload up to 3 images per category.");
        return { ...prev, [category]: newFiles.slice(0, 3) };
      }
      return { ...prev, [category]: newFiles };
    });

    event.target.value = ""; // reset input
  };

  // Remove Image
  const removeImage = (category, index) => {
    setImageFiles((prev) => {
      const updated = [...prev[category]];
      updated.splice(index, 1);
      return { ...prev, [category]: updated };
    });
  };

  // Reusable Image Upload UI
  const renderUploadSection = (category, label, required = false, hidden = false) => {
    if (hidden) return null;
    return (
      <div className="w-full">
        <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        <div className="w-full mt-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            multiple
            onChange={(e) => handleImageChange(e, category)}
            className="hidden"
            id={`${category}Images`}
          />
          <label
            htmlFor={`${category}Images`}
            className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
          >
            <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
              Upload Images
            </span>
            <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
              Browse
            </div>
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(imageFiles[category] || []).map((image, index) => {
            const imageUrl = URL.createObjectURL(image);
            return (
              <div key={index} className="relative">
                <img
                  src={imageUrl}
                  alt="Uploaded preview"
                  className={`w-full h-24 object-cover rounded-lg border ${
                    index === 0 ? "border-4 border-blue-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => removeImage(category, index)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white h-[55vh] overflow-scroll scrollbar-x-hidden p-2">
      <div className="flex items-center justify-between text-base font-semibold mb-4">
        Step 3: Upload Property Images{" "}
        <span className="text-red-600 text-xs">(Maximum Image Size 500KB)</span>
      </div>

      <div className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {renderUploadSection("frontView", "Front View", true)}
        {renderUploadSection("nearestLandmark", "Nearest Landmark", true)}
        {renderUploadSection("developedAmenities", "Developed Amenities", true)}

        {renderUploadSection(
          "sideView",
          "Side View",
          false,
          ["CommercialPlot", "NewPlot", "FarmLand"].includes(newProperty.propertyCategory)
        )}
        {renderUploadSection(
          "hallView",
          "Hall View",
          false,
          ["CommercialPlot", "NewPlot", "FarmLand"].includes(newProperty.propertyCategory)
        )}
        {renderUploadSection(
          "kitchenView",
          "Kitchen View",
          false,
          ["CommercialPlot", "NewPlot", "FarmLand", "IndustrialSpace", "RentalShop"].includes(
            newProperty.propertyCategory
          )
        )}
        {renderUploadSection(
          "bedroomView",
          "Bedroom View",
          false,
          ["CommercialPlot", "NewPlot", "FarmLand", "IndustrialSpace", "RentalShop"].includes(
            newProperty.propertyCategory
          )
        )}
        {renderUploadSection(
          "bathroomView",
          "Bathroom View",
          false,
          ["CommercialPlot", "NewPlot", "FarmLand", "IndustrialSpace", "RentalShop"].includes(
            newProperty.propertyCategory
          )
        )}
        {renderUploadSection(
          "balconyView",
          "Balcony View",
          false,
          ["CommercialPlot", "NewPlot", "FarmLand"].includes(newProperty.propertyCategory)
        )}
      </div>
    </div>
  );
};

export default StepThree;