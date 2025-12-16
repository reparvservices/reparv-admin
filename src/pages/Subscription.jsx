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

const Subscription = () => {
  const {
    showSubscriptionPlan,
    setShowSubscriptionPlan,
    showSubscriptionForm,
    setShowSubscriptionForm,
    action,
    URI,
    setLoading,
  } = useAuth();
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState({});
  const [newSubscription, setNewSubscription] = useState({
    id: "",
    partnerType: "",
    planDuration: "",
    planName: "",
    totalPrice: "",
    features: "",
  });

  const [selectedImages, setSelectedImages] = useState({
    first: null,
    second: null,
    third: null,
  });

  const handleImageChange = (event, key) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG and JPEG formats are allowed!");
      event.target.value = "";
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      alert("File size must be less than 1MB!");
      event.target.value = "";
      return;
    }

    // Set the image dynamically
    setSelectedImages((prev) => ({ ...prev, [key]: file }));
  };

  const removeImage = (key) => {
    setSelectedImages((prev) => ({ ...prev, [key]: null }));
  };

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/subscription/pricing", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Subscriptions.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Add or Update Subscription Record with Images
  const addOrUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !newSubscription.partnerType ||
      !newSubscription.planDuration ||
      !newSubscription.planName ||
      !newSubscription.totalPrice ||
      !newSubscription.features
    ) {
      alert("Please fill all required fields!");
      return;
    }

    const endpoint = newSubscription.id ? `edit/${newSubscription.id}` : "add";
    const method = newSubscription.id ? "PUT" : "POST";

    try {
      setLoading(true);

      // Create FormData
      const formData = new FormData();
      formData.append("partnerType", newSubscription.partnerType);
      formData.append("planDuration", newSubscription.planDuration);
      formData.append("planName", newSubscription.planName);
      formData.append("totalPrice", newSubscription.totalPrice);
      formData.append("features", newSubscription.features);

      // Append images if selected
      if (selectedImages.first)
        formData.append("firstImage", selectedImages.first);
      if (selectedImages.second)
        formData.append("secondImage", selectedImages.second);
      if (selectedImages.third)
        formData.append("thirdImage", selectedImages.third);

      const response = await fetch(
        `${URI}/admin/subscription/pricing/${endpoint}`,
        {
          method,
          credentials: "include",
          body: formData, // FormData automatically sets multipart/form-data
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save subscription.");
      }

      if (newSubscription.id) {
        alert("Subscription updated successfully!");
      } else if (response.status === 202) {
        alert("Subscription already exists!");
      } else {
        alert("Subscription added successfully!");
      }

      // Reset form
      setNewSubscription({
        id: "",
        partnerType: "",
        planDuration: "",
        planName: "",
        totalPrice: "",
        features: "",
      });

      setSelectedImages({ first: null, second: null, third: null });
      setShowSubscriptionForm(false);
      fetchData(); // Refresh the list
    } catch (err) {
      console.error("Error saving subscription:", err);
      alert(err.message || "Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/subscription/pricing/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Subscriptions.");
      const data = await response.json();
      setNewSubscription(data);
      setShowSubscriptionForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const view = async (id) => {
    try {
      const response = await fetch(URI + `/admin/subscription/pricing/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Subscriptions.");
      const data = await response.json();
      setSubscriptionPlan(data);
      setShowSubscriptionPlan(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Highlight The Plan
  const highlight = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to Highlight this Subscription Plan?"
      )
    )
      return;

    try {
      const response = await fetch(
        URI + `/admin/subscription/pricing/highlight/${id}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      const data = await response.json();
      //console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      fetchData();
    } catch (error) {
      console.error("Error Highlighting :", error);
    }
  };

  // change status record
  const status = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to change this Subscription status?"
      )
    )
      return;

    try {
      const response = await fetch(
        URI + `/admin/subscription/pricing/status/${id}`,
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
    if (!window.confirm("Are you sure you want to delete this Subscription?"))
      return;
    try {
      const response = await fetch(
        URI + `/admin/subscription/pricing/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Subscription deleted successfully!");

        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error while changing status:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = datas.filter(
    (item) =>
      item.partnerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
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
        position: "sticky",
        top: 0,
        zIndex: 10,
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
      name: "Partner Type",
      selector: (row) => row.partnerType,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Plan Name",
      cell: (row) => (
        <span className={`${row.highlight === "True" && "text-[#0bb501]"}`}>
          {row.planName}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Plan Duration",
      selector: (row) => row.planDuration,
      minWidth: "150px",
    },
    {
      name: "Total Price",
      selector: (row) => <FormatPrice price={parseInt(row.totalPrice)} />,
      minWidth: "150px",
    },
    {
      name: "Plan Features",
      cell: (row) => <span>{row.features}</span>,
      minWidth: "350px",
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
        case "highlight":
          highlight(id);
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
          <option value="highlight">Highlight</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`Subscription overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="Subscription-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        {/* <p className="block md:hidden text-lg font-semibold">Subscription</p> */}
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Subscription"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <AddButton label={"Add"} func={setShowSubscriptionForm} />
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Subscription Pricing List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={columns}
            data={filteredData}
            fixedHeader
            fixedHeaderScrollHeight="60vh"
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
          showSubscriptionForm ? "flex" : "hidden"
        } z-[61] SubscriptionForm overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] lg:w-[750px] max-h-[75vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Subscription Plan</h2>
            <IoMdClose
              onClick={() => {
                setShowSubscriptionForm(false);
                setSelectedImages({ first: null, second: null, third: null });
                setNewSubscription({
                  id: "",
                  partnerType: "",
                  planDuration: "",
                  planName: "",
                  totalPrice: "",
                  features: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addOrUpdate}>
            <div className="w-full grid place-items-center gap-4 grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={newSubscription.id || ""}
                onChange={(e) =>
                  setNewSubscription({ ...newSubscription, id: e.target.value })
                }
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Partner Type <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none "
                  value={newSubscription.partnerType}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
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
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Plan Duration <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none "
                  value={newSubscription.planDuration}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      planDuration: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select Months
                  </option>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="4 Months">4 Months</option>
                  <option value="5 Months">5 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="7 Months">7 Months</option>
                  <option value="8 Months">8 Months</option>
                  <option value="9 Months">9 Months</option>
                  <option value="10 Months">10 Months</option>
                  <option value="11 Months">11 Months</option>
                  <option value="12 Months">12 Months</option>
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Plan Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Plan Name"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black"
                  value={newSubscription.planName}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      planName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Total Price <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="Enter Total Price"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black"
                  value={newSubscription.totalPrice}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      totalPrice: e.target.value,
                    })
                  }
                />
              </div>
              <div className={`w-full col-span-2`}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enter Comma(,) Seprated Features{" "}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  cols={40}
                  placeholder="Enter Features"
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black"
                  value={newSubscription.features}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      features: e.target.value,
                    })
                  }
                />
              </div>
              {/* First Banner Image */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                  First Banner Image
                </label>

                {/* Existing image from DB */}
                {newSubscription?.firstImage && (
                  <div className="relative mt-2 w-full max-w-[100px]">
                    <img
                      src={URI + newSubscription?.firstImage}
                      alt="Uploaded preview"
                      className="w-[100px] object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                {/* Upload input */}
                <div className="w-full mt-2">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => handleImageChange(e, "first")}
                    className="hidden"
                    id="firstImageUpload"
                  />
                  <label
                    htmlFor="firstImageUpload"
                    className="flex items-center justify-between border border-gray-300 rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      Upload Image
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>

                {/* Preview of selected image */}
                {selectedImages.first && (
                  <div className="relative mt-2 w-full max-w-[100px]">
                    <img
                      src={URL.createObjectURL(selectedImages.first)}
                      alt="Uploaded preview"
                      className="w-[100px] object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("first")}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Second Banner Image */}
              <div className="w-full mt-4">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Second Banner Image
                </label>

                {newSubscription?.secondImage && (
                  <div className="relative mt-2 w-full max-w-[100px]">
                    <img
                      src={URI + newSubscription?.secondImage}
                      alt="Uploaded preview"
                      className="w-[100px] object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                <div className="w-full mt-2">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => handleImageChange(e, "second")}
                    className="hidden"
                    id="secondImageUpload"
                  />
                  <label
                    htmlFor="secondImageUpload"
                    className="flex items-center justify-between border border-gray-300 rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      Upload Image
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>

                {selectedImages.second && (
                  <div className="relative mt-2 w-full max-w-[100px]">
                    <img
                      src={URL.createObjectURL(selectedImages.second)}
                      alt="Uploaded preview"
                      className="w-[100px] object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("second")}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Third Banner Image */}
              <div className="w-full mt-4">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Third Banner Image
                </label>

                {newSubscription?.thirdImage && (
                  <div className="relative mt-2 w-full max-w-[100px]">
                    <img
                      src={URI + newSubscription?.thirdImage}
                      alt="Uploaded preview"
                      className="w-[100px] object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                <div className="w-full mt-2">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => handleImageChange(e, "third")}
                    className="hidden"
                    id="thirdImageUpload"
                  />
                  <label
                    htmlFor="thirdImageUpload"
                    className="flex items-center justify-between border border-gray-300 rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      Upload Image
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>

                {selectedImages.third && (
                  <div className="relative mt-2 w-full max-w-[100px]">
                    <img
                      src={URL.createObjectURL(selectedImages.third)}
                      alt="Uploaded preview"
                      className="w-[100px] object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("third")}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowSubscriptionForm(false);
                  setSelectedImages({ first: null, second: null, third: null });
                  setNewSubscription({
                    id: "",
                    role: "",
                    oneMonthPrice: "",
                    threeMonthPrice: "",
                    sixMonthPrice: "",
                    oneYearPrice: "",
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

      {/* Show Subscription Plan Details */}
      <div
        className={`${
          showSubscriptionPlan ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[70vh] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Discount Plan Details</h2>
            <IoMdClose
              onClick={() => {
                setShowSubscriptionPlan(false);
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
                value={subscriptionPlan.status}
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
                value={subscriptionPlan.partnerType}
                readOnly
              />
            </div>
            <div className={`w-full`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Plan Name
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subscriptionPlan.planName}
                readOnly
              />
            </div>
            <div
              className={`${
                subscriptionPlan.planDuration ? "block" : "hidden"
              } w-full`}
            >
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Duration
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subscriptionPlan.planDuration}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Total Price
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subscriptionPlan.totalPrice}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Banner Images
              </label>
              <div className="w-full flex gap-2 mt-2">
                <img
                onClick={()=>{
                  window.open(URI + subscriptionPlan.firstImage,"_blank")
                }}
                src={URI + subscriptionPlan.firstImage}
                className={`${
                  subscriptionPlan?.firstImage ? "block" : "hidden" 
                } max-w-[100px] h-[60px] cursor-pointer rounded-lg`}
              />
              <img
              onClick={()=>{
                  window.open(URI + subscriptionPlan.secondImage,"_blank")
                }}
                src={URI + subscriptionPlan.secondImage}
                className={`${
                  subscriptionPlan?.secondImage ? "block" : "hidden" 
                } max-w-[100px] h-[60px] cursor-pointer rounded-lg`}
              />
              <img
              onClick={()=>{
                  window.open(URI + subscriptionPlan.thirdImage,"_blank")
                }}
                src={URI + subscriptionPlan.thirdImage}
                className={`${
                  subscriptionPlan?.thirdImage ? "block" : "hidden" 
                } max-w-[100px] h-[60px] cursor-pointer rounded-lg`}
              />
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Features
              </label>
              <ul className="mt-3 space-y-2 text-gray-700 list-disc pl-5">
                {subscriptionPlan.features?.split(",").map((feature, index) => (
                  <li key={index}>{feature.trim()}</li>
                ))}
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
