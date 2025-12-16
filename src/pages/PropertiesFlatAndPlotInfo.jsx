import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import AddButton from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import Loader from "../components/Loader";
import { RxCross2 } from "react-icons/rx";
import { MdDone } from "react-icons/md";
import DownloadCSV from "../components/DownloadCSV";
import FormatPrice from "../components/FormatPrice";
import DeleteButton from "../components/DeleteButton";

const PropertiesFlatAndPlotInfo = () => {
  const { propertyid } = useParams();
  const [category, setCategory] = useState("");
  const {
    showInfo,
    setShowInfo,
    showInfoForm,
    setShowInfoForm,
    URI,
    setLoading,
  } = useAuth();
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [info, setInfo] = useState({});
  const [newInfo, setNewInfo] = useState({
    mouza: "",
    khasrano: "",
    wing: "",
    wingfacing: "",
    plotfacing: "",
    plotsize: "",
    floorno: "",
    flatno: "",
    plotno: "",
    flatfacing: "",
    type: "",
    carpetarea: "",
    builtuparea: "",
    superbuiltuparea: "",
    additionalarea: "",
    payablearea: "",
    sqftprice: "",
    basiccost: "",
    stampduty: "",
    registration: "",
    advocatefee: "",
    watercharge: "",
    maintenance: "",
    gst: "",
    other: "",
    totalcost: "",
  });

  //fetch property category
  const fetchCategory = async (id) => {
    try {
      const response = await fetch(URI + `/admin/properties/${propertyid}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch roles.");
      const data = await response.json();
      //console.log(data.propertyCategory);
      if (data.propertyCategory?.toLowerCase().includes("flat")) {
        setCategory("Flat");
      } else {
        setCategory("Plot");
      }
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(
        URI + "/admin/property/additional-info/" + propertyid,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        throw new Error("Failed to fetch property additional info.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //View data
  const view = async (id) => {
    try {
      const response = await fetch(
        URI + `/admin/property/additional-info/get/${id}`,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch property info.");
      const data = await response.json();
      setInfo(data);
      setShowInfo(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Add or update record
  const addOrUpdate = async (e) => {
    e.preventDefault();

    const endpoint = newInfo.propertyinfoid
      ? `edit/${newInfo.propertyinfoid}`
      : `add/${propertyid}`;
    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/property/additional-info/${endpoint}`,
        {
          method: newInfo.propertyinfoid ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newInfo),
        }
      );

      if (!response.ok) throw new Error("Failed to save role.");

      if (newInfo.propertyinfoid) {
        alert(`Info updated successfully!`);
      } else if (response.status === 202) {
        alert(`Info already Exit!!`);
      } else {
        alert(`New Info added successfully!`);
      }

      setNewInfo({
        mouza: "",
        khasrano: "",
        wing: "",
        wingfacing: "",
        plotfacing: "",
        plotsize: "",
        floorno: "",
        flatno: "",
        plotno: "",
        flatfacing: "",
        type: "",
        carpetarea: "",
        builtuparea: "",
        superbuiltuparea: "",
        additionalarea: "",
        payablearea: "",
        sqftprice: "",
        basiccost: "",
        stampduty: "",
        registration: "",
        advocatefee: "",
        watercharge: "",
        maintenance: "",
        gst: "",
        other: "",
        totalcost: "",
      });

      setShowInfoForm(false);
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
      const response = await fetch(
        URI + `/admin/property/additional-info/get/${id}`,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch property info.");
      const data = await response.json();
      setNewInfo(data);
      setShowInfoForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure to delete this entry?")) return;
    try {
      const response = await fetch(
        URI + `/admin/property/additional-info/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Property Info deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting :", error);
    }
  };

  // Delete record
  const deleteAllData = async () => {
    if (!window.confirm("Are you sure to delete All Data?")) return;
    try {
      const response = await fetch(
        URI +
          `/project-partner/property/additional-info/all/delete/${propertyid}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Property Info deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting :", error);
    }
  };

  // change status record
  const status = async (id) => {
    if (!window.confirm("Are you sure to change this status?")) return;

    try {
      const response = await fetch(
        URI + `/admin/property/additional-info/status/${id}`,
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

  // change status into reserve
  const reserved = async (id) => {
    if (!window.confirm(`Are you sure to reserve this ${category}?`)) return;

    try {
      const response = await fetch(
        URI + `/admin/property/additional-info/reserved/${id}`,
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
      console.error("Error deleting :", error);
    }
  };

  useEffect(() => {
    fetchCategory();
    fetchData();
  }, []);

  const filteredData = datas?.filter(
    (item) =>
      item.mouza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.khasrano?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.payablearea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.wing?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.flatfacing?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.flatno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plotfacing?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plotno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              row.status === "Available"
                ? "bg-[#EAFBF1] text-[#0BB501]"
                : row.status === "Reserved"
                ? "bg-blue-100 text-blue-600"
                : row.status === "Booked"
                ? "bg-[#FFEAEA] text-[#ff2323]"
                : "bg-[#efefef] text-[#7c7c7c]"
            }`}
          >
            {index + 1}
          </span>

          {/* Tooltip */}
          <div className="absolute w-[80px] text-center -top-12 left-[30px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
            {row.status === "Available"
              ? "Available"
              : row.status === "Reserved"
              ? "Reserved"
              : "Booked"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Status",
      cell: (row, index) => (
        <span
          onClick={() => {
            //view(row.propertyinfoid);
          }}
          className={`px-3 py-1 rounded-md cursor-pointer ${
            row.status === "Available"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.status === "Reserved"
              ? "bg-blue-100 text-blue-600"
              : row.status === "Booked"
              ? "bg-[#FFEAEA] text-[#ff2323]"
              : "bg-[#efefef] text-[#7c7c7c]"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: false,
      width: "130px",
    },
    {
      name: "Mouza",
      selector: (row) => row.mouza,
      minWidth: "130px",
    },
    {
      name: "Khasra No",
      selector: (row) => row.khasrano,
      width: "130px",
    },
    {
      name: "Wing",
      selector: (row) => row.wing,
      width: "120px",
    },
    {
      name: "Wing Facing",
      selector: (row) => row.wingfacing,
      width: "130px",
    },
    {
      name: "Floor No",
      selector: (row) => row.floorno,
      width: "130px",
    },
    {
      name: "Flat No",
      selector: (row) => row.flatno,
      width: "130px",
    },
    {
      name: "Flat Facing",
      selector: (row) => row.flatfacing,
      width: "130px",
    },
    {
      name: "BHK Type",
      selector: (row) => row.type,
      width: "130px",
    },
    {
      name: "Carpet Area",
      selector: (row) => row.carpetarea + " sqft",
      width: "150px",
    },
    {
      name: "Payable Area",
      selector: (row) => row.payablearea + " sqft",
      width: "150px",
    },
    {
      name: "Basic Cost",
      selector: (row) => <FormatPrice price={parseInt(row.basiccost)} />,
      width: "150px",
    },
    {
      name: "Total Cost",
      selector: (row) => <FormatPrice price={parseInt(row.totalcost)} />,
      width: "150px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const plotColumns = [
    {
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          {/* Serial Number Box */}
          <span
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer ${
              row.status === "Available"
                ? "bg-[#EAFBF1] text-[#0BB501]"
                : row.status === "Reserved"
                ? "bg-blue-100 text-blue-600"
                : row.status === "Booked"
                ? "bg-[#FFEAEA] text-[#ff2323]"
                : "bg-[#efefef] text-[#7c7c7c]"
            }`}
          >
            {index + 1}
          </span>

          {/* Tooltip */}
          <div className="absolute w-[80px] text-center -top-12 left-[30px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
            {row.status === "Available"
              ? "Available"
              : row.status === "Reserved"
              ? "Reserved"
              : "Booked"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Status",
      cell: (row, index) => (
        <span
          onClick={() => {
            //view(row.propertyinfoid);
          }}
          className={`px-3 py-1 rounded-md cursor-pointer ${
            row.status === "Available"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.status === "Reserved"
              ? "bg-blue-100 text-blue-600"
              : row.status === "Booked"
              ? "bg-[#FFEAEA] text-[#ff2323]"
              : "bg-[#efefef] text-[#7c7c7c]"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: false,
      width: "130px",
    },
    {
      name: "Mouza",
      selector: (row) => row.mouza,
      minWidth: "130px",
    },
    {
      name: "Khasra No",
      selector: (row) => row.khasrano,
      width: "130px",
    },
    {
      name: "Plot No",
      selector: (row) => row.plotno,
      width: "120px",
    },
    {
      name: "Plot Facing",
      selector: (row) => row.plotfacing,
      width: "120px",
    },
    {
      name: "Plot Size",
      selector: (row) => row.plotsize,
      width: "120px",
    },
    {
      name: "Plot Area",
      selector: (row) => row.payablearea + " sqft",
      width: "150px",
    },
    {
      name: "Price / SQFT",
      selector: (row) => row.sqftprice,
      width: "150px",
    },
    {
      name: "Basic Cost",
      selector: (row) => <FormatPrice price={parseInt(row.basiccost)} />,
      minWidth: "120px",
    },
    {
      name: "Total Cost",
      selector: (row) => <FormatPrice price={parseInt(row.totalcost)} />,
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
        case "status":
          status(id);
          break;
        case "reserved":
          reserved(id);
          break;
        case "update":
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
            handleActionSelect(action, row.propertyinfoid);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="status">Status</option>
          <option value="reserved">Reserved</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        {/* <p className="block md:hidden text-lg font-semibold">Role</p> */}
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
            <AddButton label={"Add"} func={setShowInfoForm} />
            <DeleteButton func={deleteAllData} />
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">
          {category} Information List
        </h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={category === "Flat" ? columns : plotColumns}
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
          showInfoForm && category === "Flat" ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[550px] lg:w-[750px] xl:w-[900px] max-h-[75vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Property Additional Info
            </h2>
            <IoMdClose
              onClick={() => {
                setShowInfoForm(false);
                setNewInfo({
                  mouza: "",
                  khasrano: "",
                  wing: "",
                  wingfacing: "",
                  plotfacing: "",
                  plotsize: "",
                  floorno: "",
                  flatno: "",
                  plotno: "",
                  flatfacing: "",
                  type: "",
                  carpetarea: "",
                  builtuparea: "",
                  superbuiltuparea: "",
                  additionalarea: "",
                  payablearea: "",
                  sqftprice: "",
                  basiccost: "",
                  stampduty: "",
                  registration: "",
                  advocatefee: "",
                  watercharge: "",
                  maintenance: "",
                  gst: "",
                  other: "",
                  totalcost: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <form
            onSubmit={addOrUpdate}
            onChange={() => {
              const payablearea = parseFloat(newInfo.payablearea) || 0;
              const sqftprice = parseFloat(newInfo.sqftprice) || 0;
              const basiccost = payablearea * sqftprice;

              const stampduty = parseFloat(newInfo.stampduty) || 0;
              const registration = parseFloat(newInfo.registration) || 0;
              const advocatefee = parseFloat(newInfo.advocatefee) || 0;
              const watercharge = parseFloat(newInfo.watercharge) || 0;
              const maintenance = parseFloat(newInfo.maintenance) || 0;
              const gst = parseFloat(newInfo.gst) || 0;
              const other = parseFloat(newInfo.other) || 0;

              const totalcost =
                basiccost +
                stampduty +
                registration +
                advocatefee +
                watercharge +
                maintenance +
                gst +
                other;

              setNewInfo((prev) => ({
                ...prev,
                basiccost,
                totalcost,
              }));
            }}
          >
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              {/* Hidden ID */}
              <input
                type="hidden"
                value={newInfo.propertyinfoid || ""}
                onChange={(e) =>
                  setNewInfo({ ...newInfo, propertyinfoid: e.target.value })
                }
              />

              {/* ---- General Info Fields ---- */}
              {[
                ["mouza", "Enter Mouza"],
                ["khasrano", "Enter Khasra No"],
                ["wing", "Enter Wing"],
                ["wingfacing", "Enter Wing Facing"],
                ["floorno", "Enter Floor No"],
                ["flatno", "Enter Flat No"],
                ["flatfacing", "Enter Flat Facing"],
                ["type", "Enter BHK Type"],
              ].map(([field, placeholder]) => (
                <div key={field} className="w-full">
                  <label className="block text-sm leading-4 text-[#00000066] font-medium capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    required={["mouza", "khasrano"].includes(field)}
                    className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newInfo[field] || ""}
                    onChange={(e) =>
                      setNewInfo({ ...newInfo, [field]: e.target.value })
                    }
                  />
                </div>
              ))}

              {/* ---- Area Details ---- */}
              <h3 className="w-full font-semibold text-gray-700 mt-4">
                Area Details
              </h3>
              {[
                "carpetarea",
                "builtuparea",
                "superbuiltuparea",
                "additionalarea",
                "payablearea",
                "sqftprice",
              ].map((field) => (
                <div key={field} className="w-full">
                  <label className="block text-sm leading-4 text-[#00000066] font-medium capitalize">
                    {field}
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder={`Enter ${field}`}
                    className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newInfo[field] || ""}
                    onChange={(e) =>
                      setNewInfo({ ...newInfo, [field]: e.target.value })
                    }
                  />
                </div>
              ))}

              {/* ---- Cost Details ---- */}
              <h3 className="w-full font-semibold text-gray-700 mt-4">
                Cost Details
              </h3>

              {/* Basic Cost (Auto Calculated) */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Basic Cost (Auto)
                </label>
                <input
                  type="number"
                  readOnly
                  className="w-full mt-[5px] bg-gray-100 text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px]"
                  value={newInfo.basiccost || 0}
                />
              </div>

              {[
                "stampduty",
                "registration",
                "advocatefee",
                "watercharge",
                "maintenance",
                "gst",
                "other",
              ].map((field) => (
                <div key={field} className="w-full">
                  <label className="block text-sm leading-4 text-[#00000066] font-medium capitalize">
                    {field}
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder={`Enter ${field}`}
                    className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newInfo[field] || ""}
                    onChange={(e) =>
                      setNewInfo({ ...newInfo, [field]: e.target.value })
                    }
                  />
                </div>
              ))}

              {/* Total Cost (Auto Calculated) */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Total Cost (Auto)
                </label>
                <input
                  type="number"
                  readOnly
                  className="w-full mt-[5px] bg-gray-100 text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.totalcost || 0}
                />
              </div>
            </div>

            {/* ---- Buttons ---- */}
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowInfoForm(false);
                  setNewInfo({
                    mouza: "",
                    khasrano: "",
                    wing: "",
                    wingfacing: "",
                    plotfacing: "",
                    plotsize: "",
                    floorno: "",
                    flatno: "",
                    plotno: "",
                    flatfacing: "",
                    type: "",
                    carpetarea: "",
                    builtuparea: "",
                    superbuiltuparea: "",
                    additionalarea: "",
                    payablearea: "",
                    sqftprice: "",
                    basiccost: "",
                    stampduty: "",
                    registration: "",
                    advocatefee: "",
                    watercharge: "",
                    maintenance: "",
                    gst: "",
                    other: "",
                    totalcost: "",
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
                Save Info
              </button>
              <Loader />
            </div>
          </form>
        </div>
      </div>

      {/* ===== Plot Details Form ===== */}
      <div
        className={`${
          showInfoForm && category === "Plot" ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full md:w-[550px] lg:w-[750px] xl:w-[900px] max-h-[75vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Plot Details</h2>
            <IoMdClose
              onClick={() => {
                setShowInfoForm(false);
                setNewInfo({
                  mouza: "",
                  khasrano: "",
                  wing: "",
                  wingfacing: "",
                  plotfacing: "",
                  plotsize: "",
                  floorno: "",
                  flatno: "",
                  plotno: "",
                  flatfacing: "",
                  type: "",
                  carpetarea: "",
                  builtuparea: "",
                  superbuiltuparea: "",
                  additionalarea: "",
                  payablearea: "",
                  sqftprice: "",
                  basiccost: "",
                  stampduty: "",
                  registration: "",
                  advocatefee: "",
                  watercharge: "",
                  maintenance: "",
                  gst: "",
                  other: "",
                  totalcost: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <form
            onSubmit={addOrUpdate}
            onChange={(e) => {
              const { name, value } = e.target;
              const updated = { ...newInfo, [name]: value };

              const payablearea = parseFloat(updated.payablearea) || 0;
              const sqftprice = parseFloat(updated.sqftprice) || 0;
              const basiccost = payablearea * sqftprice;

              const stampduty = parseFloat(updated.stampduty) || 0;
              const registration = parseFloat(updated.registration) || 0;
              const gst = parseFloat(updated.gst) || 0;
              const maintenance = parseFloat(updated.maintenance) || 0;
              const advocatefee = parseFloat(updated.advocatefee) || 0;
              const other = parseFloat(updated.other) || 0;

              const totalcost =
                basiccost +
                stampduty +
                registration +
                gst +
                maintenance +
                advocatefee +
                other;

              setNewInfo({ ...updated, basiccost, totalcost });
            }}
          >
            <div className="w-full grid gap-4 place-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Mouza */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  Mouza
                </label>
                <input
                  type="text"
                  name="mouza"
                  required
                  placeholder="Enter Mouza"
                  className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.mouza || ""}
                />
              </div>

              {/* Khasra No */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  Khasra No
                </label>
                <input
                  type="text"
                  name="khasrano"
                  required
                  placeholder="Enter Khasra No"
                  className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.khasrano || ""}
                />
              </div>

              {/* Plot No */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  Plot No
                </label>
                <input
                  type="text"
                  name="plotno"
                  required
                  placeholder="Enter Plot No"
                  className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.plotno || ""}
                />
              </div>

              {/* Plot Facing */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  Plot Facing
                </label>
                <input
                  type="text"
                  name="plotfacing"
                  placeholder="Enter Plot Facing"
                  className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.plotfacing || ""}
                />
              </div>

              {/* Plot Size */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  Plot Size (e.g. 200x120)
                </label>
                <input
                  type="text"
                  name="plotsize"
                  placeholder="Enter Plot Size"
                  className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.plotsize || ""}
                />
              </div>

              {/* Plot Area */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  Plot Area (sq.ft)
                </label>
                <input
                  type="number"
                  min={0}
                  name="payablearea"
                  placeholder="Enter Plot Area"
                  className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.payablearea || ""}
                />
              </div>

              {/* Sqft Price */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  Sqft Price
                </label>
                <input
                  type="number"
                  min={0}
                  name="sqftprice"
                  placeholder="Enter Sqft Price"
                  className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.sqftprice || ""}
                />
              </div>

              {/* Basic Cost */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  Basic Cost (Auto)
                </label>
                <input
                  type="number"
                  name="basiccost"
                  readOnly
                  className="w-full mt-[5px] bg-gray-100 text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.basiccost || 0}
                />
              </div>

              {/* Cost Breakdown Fields */}
              {[
                ["stampduty", "Stamp Duty"],
                ["registration", "Registration Fees"],
                ["gst", "GST"],
                ["maintenance", "Maintenance"],
                ["advocatefee", "Advocate Fee"],
                ["other", "Other Charges"],
              ].map(([name, label]) => (
                <div key={name} className="w-full">
                  <label className="block text-sm text-[#00000066] font-medium">
                    {label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    name={name}
                    placeholder={`Enter ${label}`}
                    className="w-full mt-[5px] text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newInfo[name] || ""}
                  />
                </div>
              ))}

              {/* Total Cost */}
              <div className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  Total Cost (Auto)
                </label>
                <input
                  type="number"
                  name="totalcost"
                  readOnly
                  className="w-full mt-[5px] bg-gray-100 text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newInfo.totalcost || 0}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowInfoForm(false);
                  setNewInfo({
                    mouza: "",
                    khasrano: "",
                    wing: "",
                    wingfacing: "",
                    plotfacing: "",
                    plotsize: "",
                    floorno: "",
                    flatno: "",
                    plotno: "",
                    flatfacing: "",
                    type: "",
                    carpetarea: "",
                    builtuparea: "",
                    superbuiltuparea: "",
                    additionalarea: "",
                    payablearea: "",
                    sqftprice: "",
                    basiccost: "",
                    stampduty: "",
                    registration: "",
                    advocatefee: "",
                    watercharge: "",
                    maintenance: "",
                    gst: "",
                    other: "",
                    totalcost: "",
                  });
                }}
                className="px-4 py-2 text-white bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Save Info
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* For View Only  */}
      {/* ===== View Flat Details (Read Only) ===== */}
      <div
        className={`${
          showInfoForm && category === "Flat" ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full md:w-[550px] lg:w-[750px] xl:w-[900px] max-h-[75vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Property Additional Info
            </h2>
            <IoMdClose
              onClick={() => setShowInfoForm(false)}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <div className="w-full grid gap-4 place-items-center grid-cols-1">
            {/* ---- General Info ---- */}
            {[
              ["status", "Status"],
              ["mouza", "Mouza"],
              ["khasrano", "Khasra No"],
              ["wing", "Wing"],
              ["wingfacing", "Wing Facing"],
              ["floorno", "Floor No"],
              ["flatno", "Flat No"],
              ["flatfacing", "Flat Facing"],
              ["type", "BHK Type"],
            ].map(([field, label]) => (
              <div key={field} className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium capitalize">
                  {label}
                </label>
                <div className="mt-[5px] bg-gray-100 text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px]">
                  {info[field] || "—"}
                </div>
              </div>
            ))}

            {/* ---- Area Details ---- */}
            <h3 className="w-full font-semibold text-gray-700 mt-4">
              Area Details
            </h3>
            {[
              ["carpetarea", "Carpet Area"],
              ["builtuparea", "Built-up Area"],
              ["superbuiltuparea", "Super Built-up Area"],
              ["additionalarea", "Additional Area"],
              ["payablearea", "Payable Area"],
              ["sqftprice", "Sqft Price"],
            ].map(([field, label]) => (
              <div key={field} className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium capitalize">
                  {label}
                </label>
                <div className="mt-[5px] bg-gray-100 text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px]">
                  {info[field] || "—"}
                </div>
              </div>
            ))}

            {/* ---- Cost Details ---- */}
            <h3 className="w-full font-semibold text-gray-700 mt-4">
              Cost Details
            </h3>

            {[
              ["basiccost", "Basic Cost"],
              ["stampduty", "Stamp Duty"],
              ["registration", "Registration"],
              ["advocatefee", "Advocate Fee"],
              ["watercharge", "Water Charge"],
              ["maintenance", "Maintenance"],
              ["gst", "GST"],
              ["other", "Other"],
              ["totalcost", "Total Cost"],
            ].map(([field, label]) => (
              <div key={field} className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium capitalize">
                  {label}
                </label>
                <div className="mt-[5px] bg-gray-100 text-[16px] font-medium p-2 border border-[#00000033] rounded-[4px]">
                  {info[field] || "—"}
                </div>
              </div>
            ))}
          </div>

          {/* ---- Buttons ---- */}
          <div className="flex mt-8 md:mt-6 justify-end">
            <button
              type="button"
              onClick={() => setShowInfoForm(false)}
              className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ===== View Plot Details (Read Only) ===== */}
      <div
        className={`${
          showInfo && category === "Plot" ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full md:w-[550px] lg:w-[750px] xl:w-[900px] max-h-[75vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Plot Details (View Only)
            </h2>
            <IoMdClose
              onClick={() => setShowInfo(false)}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          {/* Plot Info Fields */}
          <div className="w-full grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["status", "Status"],
              ["mouza", "Mouza"],
              ["khasrano", "Khasra No"],
              ["plotno", "Plot No"],
              ["plotfacing", "Plot Facing"],
              ["plotsize", "Plot Size"],
              ["payablearea", "Plot Area (sq.ft)"],
              ["sqftprice", "Sqft Price"],
            ].map(([field, label]) => (
              <div key={field} className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  {label}
                </label>
                <div className="mt-[5px] p-2 bg-gray-100 border border-[#00000033] rounded-[4px] text-[16px] font-medium">
                  {info[field] || "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Cost Details */}
          <h3 className="font-semibold text-gray-700 mt-6">Cost Details</h3>
          <div className="w-full grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-2">
            {[
              ["basiccost", "Basic Cost"],
              ["stampduty", "Stamp Duty"],
              ["registration", "Registration Fees"],
              ["gst", "GST"],
              ["maintenance", "Maintenance"],
              ["advocatefee", "Advocate Fee"],
              ["other", "Other Charges"],
              ["totalcost", "Total Cost"],
            ].map(([field, label]) => (
              <div key={field} className="w-full">
                <label className="block text-sm text-[#00000066] font-medium">
                  {label}
                </label>
                <div className="mt-[5px] p-2 bg-gray-100 border border-[#00000033] rounded-[4px] text-[16px] font-medium">
                  {info[field] || "—"}
                </div>
              </div>
            ))}
          </div>
          {/* Close Button */}
          <div className="flex mt-8 md:mt-6 justify-end">
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesFlatAndPlotInfo;
