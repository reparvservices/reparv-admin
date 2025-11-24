import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import Loader from "../components/Loader";
import DownloadCSV from "../components/DownloadCSV";
import FormatPrice from "../components/FormatPrice";
import UsersLoanEligibilityFilter from "../components/usersLoanEligibility/UsersLoanEligibilityFilter";
import { useNavigate } from "react-router-dom";

const UsersLoanEligibility = () => {
  const navigate = useNavigate();
  const {
    showEMI,
    setShowEMI,
    showEMIForm,
    setShowEMIForm,
    giveAccess,
    setGiveAccess,
    filterStatus,
    URI,
    setLoading,
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("");
  const [statusCounts, setStatusCounts] = useState({});

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(`${URI}/admin/emi/${filterStatus}`, {
        method: "GET",
        credentials: "include", // Sends cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch Users");

      const result = await response.json();
      console.log("Fetched Users Data:", result);

      setUsers(result?.data ?? []);
      setStatusCounts(result?.statusCounts ?? {});
    } catch (err) {
      console.error("Error fetching partner data:", err);
      setUsers([]); // clear previous data on error
      setStatusCounts({}); // clear previous counts on error
    }
  };

  //fetch data on form
  const view = async (id) => {
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
      setShowEMIForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // change status record
  const changeStatus = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/emi/status/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setStatus("");
      setUserId(null);
      setShowEMI(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting :", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(URI + `/admin/emi/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert("user deleted successfully!");
        // Refresh list
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = users?.filter((item) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      item.fullname?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.aadhaarNumber?.toLowerCase().includes(search) ||
      item.contactNo?.toLowerCase().includes(search) ||
      item.panNumber?.toLowerCase().includes(search) ||
      item.state?.toLowerCase().includes(search) ||
      item.city?.toLowerCase().includes(search);

    // Date filtering
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

    return matchesSearch && matchesDate;
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
        <span
          className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md ${
            row.status === "Eligible"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.status === "Not Eligible"
              ? "bg-[#FBE9E9] text-[#FF0000]"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {index + 1}
        </span>
      ),
      width: "80px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.status === "Eligible"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.status === "Not Eligible"
              ? "bg-[#FBE9E9] text-[#FF0000]"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },
    {
      name: "Name",
      selector: (row) => row.fullname,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Contact",
      selector: (row) => row.contactNo,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: "ADHAR No",
      selector: (row) => row.aadhaarNumber,
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "PAN No",
      selector: (row) => row.panNumber,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "State",
      selector: (row) => row.state,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "City",
      selector: (row) => row.city,
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "",
      cell: (row) => <ActionDropdown row={row} />,
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
          setShowEMI(true);
          setUserId(id);
          changeStatus();
          break;
        case "update":
          navigate(`/user-loan-eligibility-data-update/${id}`);
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
      className={`employee overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="users-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between md:justify-end gap-1 sm:gap-3">
          <p className="block md:hidden text-lg font-semibold">Users</p>
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"Users.csv"} />
          </div>
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
              <UsersLoanEligibilityFilter counts={statusCounts} />
              <div className="block">
                <CustomDateRangePicker range={range} setRange={setRange} />
              </div>
            </div>
            <div className="hidden xl:flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
              <DownloadCSV data={filteredData} filename={"Users.csv"} />
            </div>
          </div>
        </div>

        <h2 className="text-[16px] font-semibold">Users List</h2>
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

      {/* Change Status Form */}
      <div
        className={` ${
          !showEMI && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] h-[40vh] bg-white py-8 pb-10 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Change Eligibility Status
            </h2>
            <IoMdClose
              onClick={() => {
                setShowEMI(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={changeStatus}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Eligibility Status
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                  }}
                >
                  <option value="" disabled>
                    Select Eligibility Status
                  </option>
                  <option value="Eligible">Eligible</option>
                  <option value="Not Eligible">Not Eligible</option>
                </select>
              </div>
            </div>
            <div className="w-full flex mt-6 justify-end gap-6">
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Change Status
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {showEMIForm && (
        <div className="z-[61] fixed w-[400px] h-[70vh] md:w-[700px] overflow-scroll scrollbar-hide property-form flex">
          <div className="w-[330px] sm:w-[600px] md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg overflow-scroll scrollbar-hide">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold">EMI Form Details</h2>
              <IoMdClose
                onClick={() => setShowEMIForm(false)}
                className="w-6 h-6 cursor-pointer"
              />
            </div>

            <form className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2">
              {[
                { label: "Status", value: formData.status },
                { label: "Employment Type", value: formData.employmentType },
                { label: "Full Name", value: formData.fullname },
                { label: "Contact Number", value: formData.contactNo },
                { label: "Email", value: formData.email },
                { label: "Date of Birth", value: formData.dateOfBirth },
                { label: "PAN Number", value: formData.panNumber },
                { label: "Aadhaar Number", value: formData.aadhaarNumber },
                { label: "State", value: formData.state },
                { label: "City", value: formData.city },
                { label: "Pincode", value: formData.pincode },
              ]
                .filter(({ value }) => value !== null && value !== "")
                .map(({ label, value }) => (
                  <div key={label} className="w-full">
                    <label className="block text-sm leading-4 text-[#00000066] font-medium">
                      {label}
                    </label>
                    <input
                      type="text"
                      className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] bg-gray-100 cursor-not-allowed"
                      value={value}
                      readOnly
                    />
                  </div>
                ))}

              {(formData.employmentType === "Job"
                ? [
                    {
                      label: "Employment Sector",
                      value: formData.employmentSector,
                    },
                    {
                      label: "Work Experience (Years)",
                      value: formData.workexperienceYear,
                    },
                    {
                      label: "Work Experience (Months)",
                      value: formData.workexperienceMonth,
                    },
                    { label: "Salary Type", value: formData.salaryType },
                    { label: "Gross Pay", value: formData.grossPay },
                    { label: "Net Pay", value: formData.netPay },
                    { label: "PF Deduction", value: formData.pfDeduction },
                  ]
                : [
                    {
                      label: "Business Sector",
                      value: formData.businessSector,
                    },
                    {
                      label: "Business Category",
                      value: formData.businessCategory,
                    },
                    {
                      label: "Business Exp (Years)",
                      value: formData.businessExperienceYears,
                    },
                    {
                      label: "Business Exp (Months)",
                      value: formData.businessExperienceMonths,
                    },
                    {
                      label: "Business Other Income",
                      value: formData.businessOtherIncome,
                    },
                  ]
              )
                .filter(({ value }) => value !== null && value !== "")
                .map(({ label, value }) => (
                  <div key={label} className="w-full">
                    <label className="block text-sm leading-4 text-[#00000066] font-medium">
                      {label}
                    </label>
                    <input
                      type="text"
                      className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] bg-gray-100 cursor-not-allowed"
                      value={value}
                      readOnly
                    />
                  </div>
                ))}

              {[
                { label: "Other Income", value: formData.otherIncome },
                { label: "Annual Income", value: formData.yearIncome },
                { label: "Monthly Income", value: formData.monthIncome },
                { label: "Ongoing EMI", value: formData.ongoingEmi },
              ]
                .filter(({ value }) => value !== null && value !== "")
                .map(({ label, value }) => (
                  <div key={label} className="w-full">
                    <label className="block text-sm leading-4 text-[#00000066] font-medium">
                      {label}
                    </label>
                    <input
                      type="text"
                      className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] bg-gray-100 cursor-not-allowed"
                      value={value}
                      readOnly
                    />
                  </div>
                ))}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersLoanEligibility;
