import { useState, useEffect } from "react";
import { IoSpeedometerOutline } from "react-icons/io5";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Loader from "../Loader";

function UpdateEMI() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { URI, setLoading, setSuccessScreen } = useAuth();
  const [activeTab, setActiveTab] = useState("Job");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  //EMI Form Data
  const [formData, setFormData] = useState({
    employmentType: activeTab,
    fullname: "",
    contactNo: "",
    email: "",
    dateOfBirth: "",
    panNumber: "",
    aadhaarNumber: "",
    state: "",
    city: "",
    pincode: "",
    employmentSector: "",
    workexperienceYear: "",
    workexperienceMonth: "",
    salaryType: "",
    grossPay: "",
    netPay: "",
    pfDeduction: "",
    otherIncome: "",
    yearIncome: "",
    monthIncome: "",
    ongoingEmi: "",
    businessSector: "",
    businessCategory: "",
    businessExperienceYears: "",
    businessExperienceMonths: "",
    businessOtherIncome: "",
  });

  // **Fetch States from API**
  const fetchStates = async () => {
    try {
      const response = await fetch(URI + "/admin/states", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch States.");
      const data = await response.json();
      setStates(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch States from API**
  const fetchCities = async () => {
    try {
      const response = await fetch(`${URI}/admin/cities/${formData?.state}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch cities.");
      const data = await response.json();
      console.log(data);
      setCities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const fetchForm = async () => {
    try {
      const response = await fetch(URI + `/admin/emi/get/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch User.");
      const data = await response.json();
      setFormData(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${URI}/admin/emi/edit/${formData?.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to Submit EMI Form. Status: ${response.status}`
        );
      }

      // Reset form BEFORE navigation
      setFormData({
        ...formData,
        employmentType: activeTab,
        fullname: "",
        contactNo: "",
        email: "",
        dateOfBirth: "",
        panNumber: "",
        aadhaarNumber: "",
        state: "",
        city: "",
        pincode: "",
        employmentSector: "",
        workexperienceYear: "",
        workexperienceMonth: "",
        salaryType: "",
        grossPay: "",
        netPay: "",
        pfDeduction: "",
        otherIncome: "",
        yearIncome: "",
        monthIncome: "",
        ongoingEmi: "",
        businessSector: "",
        businessCategory: "",
        businessExperienceYears: "",
        businessExperienceMonths: "",
        businessOtherIncome: "",
      });
      alert("Data Updated SuccessFully!");
      navigate("/users-loan-eligibility");
    } catch (err) {
      console.error("Error Submit Form:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchForm();
  }, []);

  useEffect(() => {
    if (formData.state != "") {
      fetchCities();
    }
  }, [formData.state]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-10 sm:pb-40">
      <div className="flex gap-2 items-center justify-start mb-6 text-base font-medium text-gray-900">
        <IoSpeedometerOutline />{" "}
        <span className="text-sm">Get FREE CIBIL score with your offer!</span>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-4 md:gap-10 justify-start mb-6">
        <button
          className={`md:w-[400px] px-8 py-1 border rounded-md font-semibold ${
            activeTab === "Job"
              ? "bg-[#0ab50192] text-black"
              : "bg-white text-gray-500"
          }`}
          onClick={() => setActiveTab("Job")}
        >
          Job
        </button>
        <button
          className={`md:w-[400px] px-8 py-1 border rounded-md font-semibold ${
            activeTab === "Business"
              ? "bg-[#0ab50192] text-black"
              : "bg-white text-gray-500"
          }`}
          onClick={() => setActiveTab("Business")}
        >
          Business
        </button>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-1">
          Let’s get started with your EMI offer
        </h2>
        <p className="text-[#067700] font-semibold text-sm mb-4">
          Step 1 : Personal details
        </p>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf]">
            <label className="ml-1 text-xs">Full Name (As per pan card)</label>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              required
              value={formData.fullname}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fullname: e.target.value,
                })
              }
            />
          </div>

          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf] ">
            <label className="ml-1 text-xs">Contact No.</label>
            <input
              type="number"
              placeholder="Enter Contact Number"
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              required
              value={formData.contactNo}
              onChange={(e) => {
                const input = e.target.value;
                if (/^\d{0,10}$/.test(input)) {
                  // Allows only up to 10 digits
                  setFormData({
                    ...formData,
                    contactNo: e.target.value,
                  });
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf] ">
            <label className="ml-1 text-xs">Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  email: e.target.value,
                });
              }}
            />
          </div>

          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf] ">
            <label className="ml-1 text-xs">Date of Birth (D.O.B.)</label>
            <input
              type="date"
              placeholder="Enter Date of Birth"
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              required
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateOfBirth: e.target.value,
                })
              }
            />
          </div>

          {/* State Select Input */}
          <div className="flex flex-col gap-1 text-sm font-semibold text-[#00000066]">
            <label htmlFor="state" className="ml-1 text-xs text-[#000000bf]">
              Select State
            </label>
            <select
              name="state"
              id="state"
              required
              className="w-full font-medium p-3 text-[#000000bf] border border-[#00000033] rounded-md focus:outline-0 appearance-none"
              style={{ backgroundImage: "none" }}
              value={formData.state}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  state: e.target.value,
                })
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
          <div className="flex flex-col gap-1 text-sm font-semibold text-[#00000066] ">
            <label htmlFor="city" className="ml-1 text-xs text-[#000000bf]">
              Select City
            </label>
            <select
              name="city"
              id="city"
              required
              className="w-full font-medium p-3 text-[#000000bf] border border-[#00000033] rounded-md focus:outline-0 appearance-none"
              style={{ backgroundImage: "none" }}
              value={formData.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
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

          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf] ">
            <label className="ml-1 text-xs">PIN Code</label>
            <input
              type="number"
              placeholder="Enter PIN Code"
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0 "
              required
              value={formData.pincode}
              onChange={(e) => {
                const input = e.target.value;
                if (/^\d{0,6}$/.test(input)) {
                  setFormData({ ...formData, pincode: input });
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf] ">
            <label className="ml-1 text-xs">Aadhaar Number</label>
            <input
              type="number"
              placeholder="Enter Aadhaar Number"
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0 "
              required
              value={formData.aadhaarNumber}
              onChange={(e) => {
                const input = e.target.value;
                if (/^\d{0,12}$/.test(input)) {
                  setFormData({ ...formData, aadhaarNumber: input });
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf]">
            <label className="ml-1 text-xs">PAN Number</label>
            <input
              type="text"
              placeholder="Enter PAN Number"
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0 "
              required
              value={formData.panNumber}
              onChange={(e) => {
                const input = e.target.value.toUpperCase(); // Convert to uppercase
                if (/^[A-Z0-9]{0,10}$/.test(input)) {
                  setFormData({ ...formData, panNumber: input });
                }
              }}
            />
          </div>
        </div>

        <p className="text-[#067700] font-semibold text-sm my-4">
          Step 2 : Income details
        </p>

        {/* Job Form */}
        <div
          className={`${
            activeTab !== "Job" && "hidden"
          } grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-5`}
        >
          {/* Employment Sector */}
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#000000bf]">
            <label className="block text-xs">Employment Sector</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {["Private", "Government", "Proprietorship"].map((sector) => (
                <label key={sector} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    required={activeTab === "Job"}
                    value={sector}
                    checked={formData.employmentSector === sector}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentSector: e.target.value,
                      })
                    }
                  />
                  {sector}
                </label>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#000000bf]">
            <label className="block text-xs">Work Experience</label>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Years"
                required={activeTab === "Job"}
                value={formData.workexperienceYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workexperienceYear: e.target.value,
                  })
                }
                className="w-full sm:max-w-[400px] font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              />

              <input
                type="number"
                placeholder="Months"
                required={activeTab === "Job"}
                value={formData.workexperienceMonth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workexperienceMonth: e.target.value,
                  })
                }
                className="w-full sm:max-w-[400px] font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              />
            </div>
          </div>

          {/* Salary Type */}
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#000000bf]">
            <label className="block text-xs">Salary Type</label>
            <div className="flex gap-6">
              {["Account Transfer", "Cash"].map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    required={activeTab === "Job"}
                    value={type}
                    checked={formData.salaryType === type}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryType: e.target.value })
                    }
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Salary Details */}
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#000000bf]">
            <label className="block text-xs">Salary Details</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Gross Pay"
                required={activeTab === "Job"}
                value={formData.grossPay}
                onChange={(e) =>
                  setFormData({ ...formData, grossPay: e.target.value })
                }
                className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              />

              <input
                type="text"
                placeholder="Net Pay"
                required={activeTab === "Job"}
                value={formData.netPay}
                onChange={(e) =>
                  setFormData({ ...formData, netPay: e.target.value })
                }
                className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              />

              <input
                type="text"
                placeholder="PF Deduction"
                required={activeTab === "Job"}
                value={formData.pfDeduction}
                onChange={(e) =>
                  setFormData({ ...formData, pfDeduction: e.target.value })
                }
                className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              />
            </div>
          </div>

          {/* Other Income */}
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#000000bf]">
            <label className="block text-xs">Other Income :</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {["Co-applicant", "Rental Income", "Other Income"].map(
                (income) => (
                  <label
                    key={income}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      required={activeTab === "Job"}
                      value={income}
                      checked={formData.otherIncome === income}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          otherIncome: e.target.value,
                        })
                      }
                    />
                    {income}
                  </label>
                )
              )}
            </div>
          </div>
        </div>

        {/* Business Form */}
        <div
          className={`${
            activeTab !== "Business" && "hidden"
          } grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-5`}
        >
          {/* Business Sector */}
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#000000bf]">
            <label className="block text-xs">Business Sector</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {["Services", "Traders", "Manufacturing"].map((sector) => (
                <label key={sector} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    required={activeTab === "Business"}
                    name="businessSector"
                    value={sector}
                    checked={formData.businessSector === sector}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessSector: e.target.value,
                      })
                    }
                  />
                  {sector}
                </label>
              ))}
            </div>
          </div>

          {/* Business Category */}
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#000000bf]">
            <label className="block text-xs">Business Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {["Private Limited", "Proprietorship", "Partnership"].map(
                (category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="businessCategory"
                      required={activeTab === "Business"}
                      value={category}
                      checked={formData.businessCategory === category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessCategory: e.target.value,
                        })
                      }
                    />
                    {category}
                  </label>
                )
              )}
            </div>
          </div>

          {/* Work Experience */}
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#000000bf]">
            <label className="block text-xs">
              Business Experience (as per Shop Act / Registration)
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Years"
                required={activeTab === "Business"}
                value={formData.businessExperienceYears}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessExperienceYears: e.target.value,
                  })
                }
                className="w-full sm:max-w-[400px] font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              />

              <input
                type="number"
                placeholder="Months"
                required={activeTab === "Business"}
                value={formData.businessExperienceMonths}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessExperienceMonths: e.target.value,
                  })
                }
                className="w-full sm:max-w-[400px] font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              />
            </div>
          </div>

          {/* Other Income */}
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#000000bf]">
            <label className="block text-xs">Other Income :</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {["Co-applicant", "Rental Income", "Other Income"].map(
                (income) => (
                  <label
                    key={income}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="businessOtherIncome"
                      required={activeTab === "Business"}
                      value={income}
                      checked={formData.businessOtherIncome === income}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessOtherIncome: e.target.value,
                        })
                      }
                    />
                    {income}
                  </label>
                )
              )}
            </div>
          </div>
        </div>

        {/* Compulsary */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Yearly Income */}
          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf] ">
            <label className="ml-1 text-xs">
              Yearly Income Details (as per ITR):
            </label>
            <input
              type="number"
              placeholder="Enter Income"
              required
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              value={formData.yearIncome}
              onChange={(e) =>
                setFormData({ ...formData, yearIncome: e.target.value })
              }
            />
          </div>

          {/* Monthly Avg. Balance */}
          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf] ">
            <label className="ml-1 text-xs">
              Monthly Avg. (Bank Statement):
            </label>
            <input
              type="number"
              required
              placeholder="Enter Balance"
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              value={formData.monthIncome}
              onChange={(e) =>
                setFormData({ ...formData, monthIncome: e.target.value })
              }
            />
          </div>

          {/* Ongoing Loan EMI */}
          <div className="flex flex-col gap-1 text-sm font-semibold text-[#000000bf] ">
            <label className="ml-1 text-xs">Ongoing Loan EMI (if any):</label>
            <input
              type="number"
              placeholder="Enter EMI"
              required
              className="w-full font-medium p-3 border border-[#00000033] rounded-md focus:outline-0"
              value={formData.ongoingEmi}
              onChange={(e) =>
                setFormData({ ...formData, ongoingEmi: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex h-10 mt-10 md:mt-10 justify-start font-semibold gap-6">
          <button
            type="submit"
            className="sm:w-[300px] px-4 py-2 text-white bg-[#0BB501] rounded-md active:scale-[0.98] cursor-pointer"
          >
            Submit Form
          </button>
          <Loader></Loader>
        </div>
      </form>
    </div>
  );
}

export default UpdateEMI;
