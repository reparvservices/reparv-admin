import React from "react";
import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import FilterData from "../components/FilterData";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import Loader from "../components/Loader";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import DownloadCSV from "../components/DownloadCSV";
import Select from "react-select";
import FilterBar from "../components/adsManager/filterBar";
import { FaRegCopy } from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";

const AdsManager = () => {
  const {
    URI,
    setLoading,
    showAdsManager,
    setShowAdsManager,
    showAdsManagerForm,
    setShowAdsManagerForm,
  } = useAuth();

  const [adsManagers, setAdsManagers] = useState([]);
  const [adsManager, setAdsManager] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [adsManagerId, setAdsManagerId] = useState(null);
  const [newAdsManager, setNewAdsManager] = useState({
    propertyCityId: "",
    projectPartnerId: "",
    planId: "",
    planName: "",
    startDate: "",
    endDate: "",
    state: "",
    city: "",
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [projectPartnerList, setProjectPartnerList] = useState([]);
  const [projectPartnerId, setProjectPartnerId] = useState("");
  const [projectPartner, setProjectPartner] = useState({});
  const customStyle = {
    menu: (provided) => ({
      ...provided,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px", // Default is ~160px — increase as needed
      paddingTop: 0,
      paddingBottom: 0,
    }),
  };

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
      const response = await fetch(
        `${URI}/admin/cities/${newAdsManager?.state}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch cities.");
      const data = await response.json();
      setCities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch Data from API for Update Property in the Enquiry**
  const fetchProjectPartnerList = async () => {
    try {
      const response = await fetch(
        URI + "/admin/projectpartner/get/in/" + newAdsManager?.city,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        throw new Error("Failed to fetch project partner list.");
      const list = await response.json();
      setProjectPartnerList(list);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch Data from API**
  const fetchProjectPartnerData = async () => {
    try {
      const response = await fetch(
        URI + "/admin/ads-manager/project-partner/" + projectPartnerId,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        throw new Error("Failed to fetch Project Partner Data.");
      const data = await response.json();
      console.log(data);
      setProjectPartner(data);
      if (!data?.planId) {
        alert(data?.fullname + "'s Subscription Plan Not Active! ");
        setNewAdsManager({
          ...newAdsManager,
          planId: "",
          planName: "",
          startDate: "",
          endDate: "",
        });
      } else {
        setNewAdsManager({
          ...newAdsManager,
          planId: data.planId,
          planName: data.planName,
          startDate: data.startDate,
          endDate: data.endDate,
        });
      }
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/ads-manager", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Ads Manager.");
      const data = await response.json();
      console.log(data);
      setAdsManagers(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const view = async (id) => {
    try {
      const response = await fetch(URI + `/admin/ads-manager/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch ads manager.");
      const data = await response.json();

      setAdsManager(data);
      console.log(data);
      // Only show form after data is loaded
      setShowAdsManager(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/ads-manager/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch ads manager.");
      const data = await response.json();

      setNewAdsManager(data);

      // Only show form after data is loaded
      setShowAdsManagerForm(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const add = async (e) => {
    e.preventDefault();

    const endpoint = newAdsManager.id ? `edit/${newAdsManager.id}` : "add";
    const method = newAdsManager.id ? "PUT" : "POST";

    try {
      setLoading(true);

      const response = await fetch(`${URI}/admin/ads-manager/${endpoint}`, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAdsManager),
      });

      if (response.status === 409) {
        alert("Ads Manager already exists!");
      } else if (!response.ok) {
        throw new Error(
          `Failed to save Ads Manager. Status: ${response.status}`
        );
      } else {
        alert(
          newAdsManager.id
            ? "Ads Manager updated successfully!"
            : "Ads Manager added successfully!"
        );

        setNewAdsManager({
          propertyCityId: "",
          projectPartnerId: "",
          planId: "",
          planName: "",
          startDate: "",
          endDate: "",
          state: "",
          city: "",
        });

        setShowAdsManagerForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error("Error saving Ads Manager:", err);
    } finally {
      setLoading(false);
    }
  };

  // change status record
  const status = async (id) => {
    if (!window.confirm("Are you sure to change this Ads Manager status?"))
      return;

    try {
      const response = await fetch(URI + `/admin/ads-manager/status/${id}`, {
        method: "PUT",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      fetchData();
    } catch (error) {
      console.error("Error changing status :", error);
    }
  };

  //Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure to delete this Ads Manager?")) return;

    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/ads-manager/delete/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Ads Manager deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting Ads Manager:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStates();
  }, []);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const [filters, setFilters] = useState({
    city: "",
    propertyName: "",
    projectPartner: "",
    planName: "",
  });

  const filteredData = adsManagers?.filter((item) => {
    // Text Search Matching
    const matchesSearch =
      item.projectPartnerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.propertyCityId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase());

    // NEW: Matched City Filter
    const matchesCity =
      !filters.city ||
      item.city?.toLowerCase() ===
        filters.city.toLowerCase();

    // NEW: Matched Property Filter
    const matchesProperty =
      !filters.propertyName ||
      item.propertyName?.toLowerCase() === filters.propertyName.toLowerCase();

    // NEW: Matched Project Partner Filter
    const matchesPartner =
      !filters.projectPartner ||
      item.projectPartnerName?.toLowerCase() ===
        filters.projectPartner.toLowerCase();

    // NEW: Matched Subscription Plan Filter
    const matchesPlan =
      !filters.planName ||
      item.planName?.toLowerCase() === filters.planName.toLowerCase();

    // Date Filtering
    let startDate = range[0].startDate;
    let endDate = range[0].endDate;

    if (startDate) startDate = new Date(startDate.setHours(0, 0, 0, 0));
    if (endDate) endDate = new Date(endDate.setHours(23, 59, 59, 999));

    const itemDate = parse(
      item.created_at,
      "dd MMM yyyy | hh:mm a",
      new Date()
    );

    const matchesDate =
      (!startDate && !endDate) ||
      (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

    // FINAL RETURN
    return (
      matchesSearch &&
      matchesDate &&
      matchesCity &&
      matchesProperty &&
      matchesPartner &&
      matchesPlan
    );
  });

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
      name: "Property ID",
      cell: (row, index) => (
        <span
          onClick={() => {
            view(row.id);
          }}
          className={`px-2 py-1 rounded-md cursor-pointer ${
            row.status === "Active"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.status === "Pending"
              ? "bg-[#FFEAEA] text-[#ff2323]"
              : "text-[#000000]"
          }`}
        >
          {row.propertycityid || row.propertyCityId}
        </span>
      ),
      sortable: false,
      width: "150px",
    },
    {
      name: "Property Name",
      cell: (row) => {
        return (
          <div>
            <p>{row.propertyName}</p>
          </div>
        );
      },
      minWidth: "200px",
    },
    {
      name: "Project Partner",
      cell: (row) => {
        return (
          <div>
            <p>{row.projectPartnerName}</p>
            <p>{row.projectPartnerContact}</p>
          </div>
        );
      },
      minWidth: "200px",
    },
    {
      name: "City",
      selector: (row) => row.city,
      width: "150px",
    },
    {
      name: "Subscription Plan",
      selector: (row) => row.planName || "-- Not Active --",
      minWidth: "200px",
    },
    { name: "Start Date", selector: (row) => row.startDate, width: "200px" },
    { name: "End Date", selector: (row) => row.endDate, width: "200px" },
    {
      name: "Landing Page",
      cell: (row) => {
        return (
          <div className="flex gap-4 items-center justify-center">
            <div
              onClick={() => {
                navigator.clipboard.writeText(`https://www.reparv.in/project-partner/${row.projectPartnerContact}`);
                alert("Landing Page Link Copied Successfully!");
              }}
              className="flex items-center justify-center w-8 h-8 p-2 text-white bg-blue-600 rounded-lg cursor-pointer active:scale-95"
            >
              <FaRegCopy size={15} />
            </div>
            <div
              onClick={() => {
                window.open(
                  `https://www.reparv.in/project-partner/${row.projectPartnerContact}`,
                  "_blank"
                );
              }}
              className="flex items-center justify-center w-8 h-8 p-2 text-white bg-red-600 rounded-lg cursor-pointer active:scale-95"
            >
              <FaExternalLinkAlt size={14} />
            </div>
          </div>
        );
      },
      minWidth: "200px",
    },
  ];

  {
    /*
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    * */
  }

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id, slug) => {
      switch (action) {
        case "view":
          view(id);
          break;
        case "status":
          status(id);
          break;
        case "update":
          setAdsManagerId(id);
          edit(id);
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
            handleActionSelect(action, row.id, row.seoSlug);
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
      className={`sales Persons overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="sales-table w-full h-[85vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="flex md:hidden w-full items-center justify-between md:justify-end gap-1 sm:gap-3">
          <p className="text-lg font-semibold">Ads Managers</p>
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"Ads_Manager.csv"} />
          </div>
        </div>
        <div className="w-full flex items-center justify-center gap-1 sm:gap-3">
          <FilterBar filters={filters} setFilters={setFilters} />
        </div>

        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <div className="flex flex-wrap items-center justify-end gap-3 px-2">
              <div className="block">
                <CustomDateRangePicker range={range} setRange={setRange} />
              </div>
            </div>
            <div className="hidden xl:flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
              <DownloadCSV data={filteredData} filename={"Ads_Manager.csv"} />
            </div>
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Ads Manager List</h2>
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
          showAdsManagerForm ? "flex" : "hidden"
        } z-[61] sales-form overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[750px] max-h-[80vh] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">ADD Ads Manager </h2>

            <IoMdClose
              onClick={() => {
                setShowAdsManagerForm(false);
                setNewAdsManager({
                  propertyCityId: "",
                  projectPartnerId: "",
                  planId: "",
                  planName: "",
                  startDate: "",
                  endDate: "",
                  state: "",
                  city: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={add}>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 ">
              <input type="hidden" value={newAdsManager.id || ""} readOnly />
              {/* State Select Input */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Select State <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newAdsManager.state}
                  onChange={(e) =>
                    setNewAdsManager({
                      ...newAdsManager,
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
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Select City <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newAdsManager.city}
                  onChange={(e) =>
                    setNewAdsManager({
                      ...newAdsManager,
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
              {/* Salect Project Partner */}
              <div className="w-full md:col-span-2">
                <label className="block text-sm leading-4 text-black font-medium mb-[10px]">
                  {projectPartnerList.length > 0
                    ? "Select Project Partner"
                    : "Project Partner Not Found"}{" "}
                  <span className="text-red-600">*</span>
                </label>

                <Select
                  required
                  styles={customStyle}
                  className="text-[16px] font-medium"
                  options={
                    projectPartnerList
                      ?.filter((pp) => pp.status === "Active")
                      .map((pp) => ({
                        value: pp.id, // ONLY ID
                        label: `${pp.fullname} | ${pp.contact}`,
                      })) || []
                  }
                  placeholder="Select Project Partner"
                  value={
                    projectPartnerId
                      ? projectPartnerList
                          ?.filter((pp) => pp.status === "Active")
                          .map((pp) => ({
                            value: pp.id,
                            label: `${pp.fullname} | ${pp.contact}`,
                          }))
                          .find((opt) => opt.value === projectPartnerId) || null
                      : null
                  }
                  onChange={(selected) => {
                    setProjectPartnerId(selected.value);
                    setNewAdsManager({
                      ...newAdsManager,
                      projectPartnerId: selected.value,
                    });
                  }} // store only ID
                />
              </div>
              <div className={`w-full`}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Subscription Plan
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="subscription Plan"
                  className="w-full mt-[10px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newAdsManager.planName}
                  readOnly
                />
              </div>
              <div className={` w-full`}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Start Date
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Start Date"
                  className="w-full mt-[10px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newAdsManager.startDate}
                  readOnly
                />
              </div>
              <div className={` w-full`}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  End Date
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="End Date"
                  className="w-full mt-[10px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newAdsManager.endDate}
                  readOnly
                />
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowAdsManagerForm(false);
                  setNewAdsManager({
                    propertyCityId: "",
                    projectPartnerId: "",
                    planId: "",
                    planName: "",
                    startDate: "",
                    endDate: "",
                    state: "",
                    city: "",
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

      {/* Show Ads Manager Details */}
      <div
        className={`${
          showAdsManager ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[70vh] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Ads Manager Details</h2>
            <IoMdClose
              onClick={() => {
                setShowAdsManager(false);
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
                className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={adsManager.status}
                readOnly
              />
            </div>
            <div className={`w-full`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Property Id
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={adsManager.propertyCityId}
                readOnly
              />
            </div>
            <div className={`w-full col-span-2`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Project Partner
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={
                  adsManager.projectPartnerName +
                  " | " +
                  adsManager.projectPartnerContact
                }
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
                className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={adsManager.planName}
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
                className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={adsManager.startDate}
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
                className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={adsManager.endDate}
                readOnly
              />
            </div>

            <div className={` w-full`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                State
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={adsManager.state}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                City
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={adsManager.city}
                readOnly
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdsManager;
