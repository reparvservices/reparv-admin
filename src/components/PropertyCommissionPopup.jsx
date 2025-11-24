import React from "react";
import { useAuth } from "../store/auth";
import FormatPrice from "./FormatPrice";
import { IoClose } from "react-icons/io5";

function PropertyCommissionPopup() {
  const {
    propertyCommissionData,
    showPropertyCommissionPopup,
    setShowPropertyCommissionPopup,
  } = useAuth();

  if (!showPropertyCommissionPopup) return null; // Don't render if hidden

  return (
    <div className="fixed inset-0 z-[61] flex items-center justify-center bg-black bg-opacity-50">
      {/* Popup Card */}
      <div className="bg-white w-[90%] max-w-md rounded-lg shadow-lg p-5 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={() => setShowPropertyCommissionPopup(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <IoClose size={24} />
        </button>

        {/* Title */}
        <h2 className="text-[16px] font-semibold text-[#0bb501] mb-4">
          {propertyCommissionData?.propertyName || "Property Details"}
        </h2>

        {/* Price Section */}
        <div className="w-full flex items-center justify-between mb-2">
          <span className="font-medium">Total Price:</span>
          <FormatPrice
            price={parseFloat(propertyCommissionData?.totalOfferPrice) || 0}
          />
        </div>

        {propertyCommissionData?.commissionAmount ? (
          <>
            <div className="w-full flex items-center justify-between mb-1">
              <span>Reparv Commission:</span>
              <FormatPrice
                price={parseFloat(
                  (propertyCommissionData.commissionAmount * 40) / 100
                )}
              />
            </div>
            <div className="w-full flex items-center justify-between mb-1">
              <span>Sales Commission:</span>
              <FormatPrice
                price={parseFloat(
                  (propertyCommissionData.commissionAmount * 40) / 100
                )}
              />
            </div>
            <div className="w-full flex items-center justify-between mb-1">
              <span>Territory Commission:</span>
              <FormatPrice
                price={parseFloat(
                  (propertyCommissionData.commissionAmount * 20) / 100
                )}
              />
            </div>
            <div className="w-full flex items-center justify-between font-semibold mt-2">
              <span>Total Commission:</span>
              <FormatPrice
                price={parseFloat(propertyCommissionData.commissionAmount)}
              />
            </div>
          </>
        ) : (
          <div className="w-full text-red-500 text-[13px] flex items-center justify-center font-semibold py-3">
            Commission Not Added
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyCommissionPopup;