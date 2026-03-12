import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../store/auth";
import FormatPrice from "./FormatPrice";

const paymentTypes = [
  { value: "direct", label: "Direct Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "razorpay", label: "Razorpay" },
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
];

const inputStyle =
  "w-full mt-[10px] text-[16px] font-medium p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none";

export default function PaymentUpdateModal({
  show,
  setShow,
  partnerId,
  partnerType,
  updatePaymentId,
}) {
  const { URI, loading } = useAuth();

  const [plans, setPlans] = useState([]);

  /* -------- Subscription Mode -------- */

  const [mode, setMode] = useState("subscription"); // subscription | manual

  /* -------- Payment State -------- */

  const [payment, setPayment] = useState({
    plan: "",
    amount: "",
    paymentType: "",
    paymentid: "",
    startDate: "",
    endDate: "",
    screenshot: null,
  });

  /* -------- Fetch Plans -------- */

  const fetchData = async () => {
    try {
      const response = await fetch(
        URI + "/admin/subscription/pricing/plans/" + partnerType,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to fetch plans");

      const data = await response.json();
      setPlans(data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  useEffect(() => {
    if (show) fetchData();
  }, [show]);

  /* -------- Handle Inputs -------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "plan") {
      const selectedPlan = plans.find((p) => p.id == value);

      setPayment((prev) => ({
        ...prev,
        plan: parseInt(selectedPlan.planDuration), // send only number (3)
        amount: selectedPlan ? selectedPlan.totalPrice : "",
      }));
    } else {
      setPayment((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* -------- File Upload -------- */

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      alert("Image size must be less than 2MB");
      return;
    }

    setPayment((prev) => ({
      ...prev,
      screenshot: file,
    }));
  };

  const resetPayment = () => {
    setPayment({
      plan: "",
      amount: "",
      paymentType: "",
      paymentid: "",
      startDate: "",
      endDate: "",
      screenshot: null,
    });
  };

  /* -------- Submit -------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!payment.paymentType) {
      alert("Please select payment type");
      return;
    }

    if (mode === "manual" && (!payment.startDate || !payment.endDate)) {
      alert("Please select start and end date");
      return;
    }

    const formData = new FormData();

    formData.append("mode", mode);
    formData.append("plan", payment.plan);
    formData.append("amount", payment.amount);
    formData.append("paymentType", payment.paymentType);
    formData.append("paymentid", payment.paymentid);
    formData.append("startDate", payment.startDate);
    formData.append("endDate", payment.endDate);

    if (payment.screenshot) {
      formData.append("screenshot", payment.screenshot);
    }

    await updatePaymentId(partnerId, formData);

    setPayment({
      plan: "",
      amount: "",
      paymentType: "",
      paymentid: "",
      startDate: "",
      endDate: "",
      screenshot: null,
    });

    setMode("subscription");

    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto">
      <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
        {/* Header */}

        <div className="flex justify-between mb-4">
          <h2 className="text-[16px] font-semibold">Payment Details</h2>

          <IoMdClose
            className="w-6 h-6 cursor-pointer"
            onClick={() => setShow(false)}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Subscription / Manual Toggle */}

            <div className="w-full lg:col-span-2">
              <label className="text-sm text-gray-500">Subscription Mode</label>

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("subscription");
                    resetPayment();
                  }}
                  className={`px-4 py-2 rounded border ${
                    mode === "subscription"
                      ? "bg-green-700 text-white"
                      : "bg-white"
                  }`}
                >
                  Subscription
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("manual");
                    resetPayment();
                  }}
                  className={`px-4 py-2 rounded border ${
                    mode === "manual" ? "bg-green-700 text-white" : "bg-white"
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Subscription Plan */}
            {mode === "subscription" && (
              <div className="w-full lg:col-span-2">
                <label className="text-sm text-gray-500">
                  Subscription Plan
                </label>

                <select
                  name="plan"
                  required
                  className={inputStyle}
                  value={payment.planDuration}
                  onChange={handleChange}
                >
                  <option value="">Select Plan</option>

                  {plans.map((plan) => (
                    <option key={plan.id} value={parseInt(plan.id)}>
                      {plan.planName} - {plan.planDuration} -{" "}
                      <FormatPrice price={parseFloat(plan.totalPrice)} />
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Manual Dates */}

            {mode === "manual" && (
              <>
                <div>
                  <label className="text-sm text-gray-500">Start Date</label>

                  <input
                    type="date"
                    name="startDate"
                    required
                    className={inputStyle}
                    value={payment.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">End Date</label>

                  <input
                    type="date"
                    name="endDate"
                    required
                    className={inputStyle}
                    value={payment.endDate}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* Payment Type */}

            <div>
              <label className="text-sm text-gray-500">Payment Type</label>

              <select
                name="paymentType"
                required
                className={inputStyle}
                value={payment.paymentType}
                onChange={handleChange}
              >
                <option value="">Select Payment Type</option>

                {paymentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}

            <div>
              <label className="text-sm text-gray-500">Payment Amount</label>

              <input
                type="number"
                name="amount"
                required
                disabled={mode === "subscription"}
                className={inputStyle}
                placeholder="Enter Amount"
                value={payment.amount}
                onChange={handleChange}
              />
            </div>

            {/* Payment ID */}

            {(payment.paymentType === "razorpay" ||
              payment.paymentType === "upi") && (
              <div>
                <label className="text-sm text-gray-500">Payment ID</label>

                <input
                  type="text"
                  name="paymentid"
                  className={inputStyle}
                  value={payment.paymentid}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Screenshot */}

            {["upi", "cash", "direct", "cheque"].includes(
              payment.paymentType,
            ) && (
              <div>
                <label className="text-sm text-gray-500">
                  Payment Screenshot
                </label>

                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={handleFile}
                  className="mt-2"
                />

                {payment.screenshot && (
                  <div className="relative mt-3">
                    <img
                      src={URL.createObjectURL(payment.screenshot)}
                      alt="preview"
                      className="w-full rounded border"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setPayment((prev) => ({
                          ...prev,
                          screenshot: null,
                        }))
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit */}

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-green-700 rounded disabled:opacity-50"
            >
              {loading ? "Processing..." : "Submit Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
