import React from "react";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import AddButton from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import Loader from "../components/Loader";
import FormatPrice from "../components/FormatPrice";
import { FiMoreVertical } from "react-icons/fi";

const SubscriptionDiscount = () => {
  const {
    showDiscount,
    setShowDiscount,
    showDiscountForm,
    setShowDiscountForm,
    URI,
    setLoading,
  } = useAuth();

  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [discount, setDiscount] = useState({});
  const [plans, setPlans] = useState([]);
  const [newDiscount, setNewDiscount] = useState({
    partnerType: "",
    planId: "",
    redeemCode: "",
    discount: "",
    startDate: "",
    endDate: "",
  });

  // For Redeem Code Checking
  const [isSame, setIsSame] = useState(true);
  const [message, setMessage] = useState("");

  const checkRedeemCode = async () => {
    try {
      const res = await fetch(
        `${URI}/admin/subscription/discount/check/redeem-code`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newDiscount),
        }
      );

      const data = await res.json();
      setIsSame(data.unique);
      setMessage(data.message);
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong");
    }
  };

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/subscription/discount", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch discounts.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch Data from API**
  const fetchPlans = async () => {
    try {
      const response = await fetch(
        URI + "/admin/subscription/pricing/plans/" + newDiscount?.partnerType,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch plans.");
      const data = await response.json();
      setPlans(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Add or update record
  const addOrUpdate = async (e) => {
    e.preventDefault();

    const endpoint = newDiscount.id ? `edit/${newDiscount.id}` : "add";
    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/subscription/discount/${endpoint}`,
        {
          method: newDiscount.id ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDiscount),
        }
      );

      if (!response.ok) throw new Error("Failed to save Discount.");

      if (newDiscount.id) {
        alert(`Discount updated successfully!`);
      } else if (response.status === 202) {
        alert(`Discount already Exit!!`);
      } else {
        alert(`Discount added successfully!`);
      }

      setNewDiscount({
        partnerType: "",
        planId: "",
        redeemCode: "",
        discount: "",
        startDate: "",
        endDate: "",
      });

      setShowDiscountForm(false);
      fetchData();
    } catch (err) {
      console.error("Error saving :", err);
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/subscription/discount/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Discounts.");
      const data = await response.json();
      setNewDiscount(data);
      setShowDiscountForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // show Discount plan
  const view = async (id) => {
    try {
      const response = await fetch(URI + `/admin/subscription/discount/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Discounts.");
      const data = await response.json();
      setDiscount(data);
      setShowDiscount(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // change status record
  const status = async (id) => {
    if (
      !window.confirm("Are you sure you want to change this Discount status?")
    )
      return;

    try {
      const response = await fetch(
        URI + `/admin/subscription/discount/status/${id}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      fetchData();
    } catch (error) {
      console.error("Error deleting :", error);
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Discount?"))
      return;
    try {
      const response = await fetch(
        URI + `/admin/subscription/discount/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Discount deleted successfully!");

        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error while changing status:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [newDiscount.partnerType]);

  useEffect(() => {
    if (
      !newDiscount.id &&
      newDiscount.partnerType
    ) {
      checkRedeemCode();
    }
  }, [newDiscount.redeemCode, newDiscount.partnerType]);

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = datas.filter(
    (item) =>
      item.partnerType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.planDuration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customStyles = {
    rows: {
      style: {
        padding: "5px 0px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#111827",
      },
    },
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "600",
        backgroundColor: "#F9FAFB",
        backgroundColor: "#00000007",
        color: "#374151",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        color: "#1F2937",
      },
    },
  };

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          {/* Serial Number Box */}
          <span
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer ${
              row.status === "Active"
                ? "bg-[#EAFBF1] text-[#0BB501]"
                : "bg-[#FFEAEA] text-[#ff2323]"
            }`}
          >
            {index + 1}
          </span>

          {/* Tooltip */}
          <div className="absolute w-[65px] text-center -top-12 left-[30px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
            {row.status === "Active" ? "Active" : "Inactive"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Redeem Code",
      cell: (row) => (
        <span
          className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer ${
            row.status === "Active"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : "bg-[#FFEAEA] text-[#ff2323]"
          }`}
        >
          {row.redeemCode}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Partner Type",
      selector: (row) => row.partnerType,
      minWidth: "150px",
    },
    {
      name: "Subscription Plan",
      selector: (row) => row.planName + " | " + row.planDuration,
      minWidth: "200px",
    },
    {
      name: "Total Price",
      selector: (row) => <FormatPrice price={parseInt(row.totalPrice)} />,
      minWidth: "150px",
    },
    {
      name: "Discount",
      selector: (row) => <FormatPrice price={parseInt(row.discount)} />,
      minWidth: "150px",
    },
    {
      name: "Start Date",
      selector: (row) => row.startDate,
      minWidth: "150px",
    },
    {
      name: "End Date",
      selector: (row) => row.endDate,
      minWidth: "150px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id) => {
      switch (action) {
        case "view":
          view(id);
          break;
        case "update":
          edit(id);
          break;
        case "status":
          status(id);
          break;
        case "delete":
          del(id);
          break;

        default:
          console.log("Invalid action");
      }
    };

    return (
      <div className="relative inline-block w-[120px]">
        <div className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span className=" text-[12px]">{selectedAction || "Action"}</span>
          <FiMoreVertical className="text-gray-500" />
        </div>
        <select
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          value={selectedAction}
          onChange={(e) => {
            const action = e.target.value;
            handleActionSelect(action, row.id);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="status">Status</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`Discount overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="Discount-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        {/* <p className="block md:hidden text-lg font-semibold">Discount</p> */}
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Discount"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <AddButton label={"Add"} func={setShowDiscountForm} />
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Discount List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={15}
            paginationComponentOptions={{
              rowsPerPageText: "Rows per page:",
              rangeSeparatorText: "of",
              selectAllRowsItem: true,
              selectAllRowsItemText: "All",
            }}
          />
        </div>
      </div>

      <div
        className={`${
          showDiscountForm ? "flex" : "hidden"
        } z-[61] DiscountForm overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] lg:w-[750px] max-h-[75vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Discount Plan</h2>
            <IoMdClose
              onClick={() => {
                setShowDiscountForm(false);
                setNewDiscount({
                  partnerType: "",
                  planId: "",
                  redeemCode: "",
                  discount: "",
                  startDate: "",
                  endDate: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addOrUpdate}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2 ">
              <input
                type="hidden"
                value={newDiscount.id || ""}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, id: e.target.value })
                }
              />
              <div className="w-full">
                <label
                  className={`${
                    newDiscount.partnerType
                      ? "text-green-600"
                      : "text-[#00000066]"
                  } block text-sm leading-4 font-medium`}
                >
                  Partner Type <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none "
                  value={newDiscount.partnerType}
                  onChange={(e) =>
                    setNewDiscount({
                      ...newDiscount,
                      partnerType: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select Partner Type
                  </option>
                  <option value="Sales Partner">Sales Partner</option>
                  <option value="Project Partner">Project Partner</option>
                  <option value="Territory Partner">Territory Partner</option>
                  <option value="Onboarding Partner">Onboarding Partner</option>
                </select>
              </div>

              <div className="w-full">
                <label
                  className={`${
                    newDiscount.planId ? "text-green-600" : "text-[#00000066]"
                  } block text-sm leading-4 font-medium`}
                >
                  Plan <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={newDiscount.planId}
                  onChange={(e) =>
                    setNewDiscount({
                      ...newDiscount,
                      planId: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select Plan
                  </option>
                  {plans &&
                    Object.values(plans).map((plan, index) => (
                      <option key={index} value={plan.id}>
                        {plan.planName} | {plan.planDuration}
                      </option>
                    ))}
                </select>
              </div>

              <div className="w-full ">
                <label
                  className={`${
                    isSame === true && newDiscount.partnerType
                      ? "text-green-600"
                      : isSame === false
                      ? "text-red-600"
                      : "text-[#00000066]"
                  } ${
                    newDiscount.id && newDiscount.redeemCode && newDiscount.partnerType
                      ? "text-green-600"
                      : "text-[#00000066]"
                  } block text-sm leading-4 font-medium`}
                >
                  {message || "Redeem Code"}{" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  minLength={6}
                  required
                  placeholder="Enter Redeem Code"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-black"
                  value={newDiscount.redeemCode}
                  onChange={(e) =>
                    setNewDiscount({
                      ...newDiscount,
                      redeemCode: e.target.value,
                    })
                  }
                />
              </div>

              <div className="w-full">
                <label
                  className={`${
                    newDiscount.discount ? "text-green-600" : "text-[#00000066]"
                  } block text-sm leading-4 font-medium`}
                >
                  Discount in Rupees <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="Enter Discount in Rupees"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black"
                  value={newDiscount.discount}
                  onChange={(e) =>
                    setNewDiscount({
                      ...newDiscount,
                      discount: e.target.value,
                    })
                  }
                />
              </div>

              {/* Start Date */}
              <div className="w-full ">
                <label
                  className={`${
                    newDiscount.startDate
                      ? "text-green-600"
                      : "text-[#00000066]"
                  } block text-sm leading-4 font-medium`}
                >
                  Start Date{" "}
                  {newDiscount.startDate ? "| " + newDiscount.startDate : ""}{" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDiscount.startDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    setNewDiscount({
                      ...newDiscount,
                      startDate: selectedDate === "" ? null : selectedDate,
                    });
                  }}
                />
              </div>

              {/* End Date */}
              <div className="w-full">
                <label
                  className={`${
                    newDiscount.endDate ? "text-green-600" : "text-[#00000066]"
                  } block text-sm leading-4 font-medium`}
                >
                  End Date{" "}
                  {newDiscount.endDate ? "| " + newDiscount.endDate : ""}{" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDiscount.endDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    setNewDiscount({
                      ...newDiscount,
                      endDate: selectedDate === "" ? null : selectedDate,
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowDiscountForm(false);
                  setNewDiscount({
                    partnerType: "",
                    planId: "",
                    redeemCode: "",
                    discount: "",
                    startDate: "",
                    endDate: "",
                  });
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Save
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* Show Discount Plan Details */}
      <div
        className={`${
          showDiscount ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[70vh] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Discount Details</h2>
            <IoMdClose
              onClick={() => {
                setShowDiscount(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <form className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Status
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={discount.status}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Redeem Code
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={discount.redeemCode}
                readOnly
              />
            </div>
            <div className={`w-full`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Partner Type
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={discount.partnerType}
                readOnly
              />
            </div>
            <div className={`w-full`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Subscription Plan
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={discount.partnerPlan + " | " + discount.planDuration}
                readOnly
              />
            </div>
            <div className={`w-full`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Total Price
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={discount.totalPrice}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Discount
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={discount.discount}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Start Date
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={discount.startDate}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                End Date
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={discount.endDate}
                readOnly
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDiscount;
