import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import EmployeeFilter from "../components/employee/EmployeeFilter";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { MdDone } from "react-icons/md";
import Loader from "../components/Loader";
import DownloadCSV from "../components/DownloadCSV";
import FormatPrice from "../components/FormatPrice";

const Employee = () => {
  const {
    showEplDetailsForm,
    setShowEplDetailsForm,
    action,
    giveAccess,
    setGiveAccess,
    showAssignTaskForm,
    setShowAssignTaskForm,
    showEmployee,
    setShowEmployee,
    token,
    URI,
    loading,
    setLoading,
  } = useAuth();
  const [datas, setDatas] = useState([]);
  const [employee, setEmployee] = useState({});
  const [menus, setMenus] = useState([]);
  const [task, setTask] = useState({
    menus: [],
  });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // Stores employee ID
  const [selectedLister, setSelectedLister] = useState(
    "Select Employee Lister"
  );
  const [newEmployee, setEmployeeData] = useState({
    name: "",
    uid: "",
    contact: "",
    email: "",
    address: "",
    state: "",
    city: "",
    dob: "",
    departmentid: "",
    roleid: "",
    salary: "",
    doj: "",
    status: "",
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
      const response = await fetch(
        `${URI}/admin/cities/${newEmployee?.state}`,
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

  // *Fetch Data from API*
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/employees/get/all/" + selectedLister, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch employees.");

      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  //fetch data on form
  const viewEmployee = async (id) => {
    try {
      const response = await fetch(URI + `/admin/employees/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch employee.");
      const data = await response.json();
      setEmployee(data);
      setShowEmployee(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on Tasks form
  const viewEmployeeTasks = async (id) => {
    try {
      const response = await fetch(URI + `/admin/employees/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch employee.");
      const data = await response.json();
      setTask({ ...task, menus: JSON.parse(data.menus) });
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Fetch Menus
  const fetchMenus = async () => {
    try {
      const response = await fetch(URI + "/admin/employees/get/menus", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch menus.");
      const data = await response.json();
      setMenus(data); // Store the fetched data
    } catch (err) {
      console.error("Error fetching Menus:", err);
    }
  };

  //Fetch roles data
  const fetchRoleData = async () => {
    try {
      const response = await fetch(URI + "/admin/roles", {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch roles.");
      const data = await response.json();
      setRoleData(data); // Store the fetched data
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  //Fetch department data
  const fetchDepartmentData = async () => {
    try {
      const response = await fetch(URI + "/admin/departments", {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch departments.");
      const data = await response.json();
      setDepartmentData(data); // Store the fetched data
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const add = async (e) => {
    e.preventDefault();

    const endpoint = newEmployee.id ? `edit/${newEmployee.id}` : "add";

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/employees/${endpoint}`, {
        method: newEmployee.id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });

      if (response.status === 409) {
        alert("Employee already exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to save employee. Status: ${response.status}`);
      } else {
        alert(
          newEmployee.id
            ? "Employee updated successfully!"
            : "Employee added successfully!"
        );
      }

      // Clear form only after successful fetch
      setEmployeeData({
        name: "",
        uid: "",
        contact: "",
        email: "",
        address: "",
        state: "",
        city: "",
        dob: "",
        departmentid: "",
        roleid: "",
        salary: "",
        doj: "",
        status: "",
      });

      setShowEplDetailsForm(false);

      await fetchData(); // Ensure latest data is fetched
    } catch (err) {
      console.error("Error saving employee:", err);
    } finally {
      setLoading(false);
    }
  };
  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/employees/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch employee.");
      const data = await response.json();
      setEmployeeData(data);
      setShowEplDetailsForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      const response = await fetch(URI + `/admin/employees/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert("Employee deleted successfully!");
        // Refresh employee list
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

  // change status record
  const status = async (id) => {
    if (
      !window.confirm("Are you sure you want to change this employee status?")
    )
      return;

    try {
      const response = await fetch(URI + `/admin/employees/status/${id}`, {
        method: "PUT",
        credentials: "include",
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
      console.error("Error deleting :", error);
    }
  };

  const assignTask = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/employees/assign/tasks/${selectedEmployeeId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setSelectedEmployeeId(null);
      setTask({ ...task, menus: [] });
      setShowAssignTaskForm(false);
      fetchData();
    } catch (error) {
      console.error("Error assigning tasks :", error);
    } finally {
      setLoading(false);
    }
  };

  // change status record
  const assignLogin = async (e) => {
    e.preventDefault();
    if (
      !window.confirm("Are you sure you want to assign login to this employee?")
    )
      return;

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/employees/assignlogin/${selectedEmployeeId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedEmployeeId, username, password }),
        }
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setSelectedEmployeeId(null);
      setUsername("");
      setPassword("");
      setGiveAccess(false);
      fetchData();
    } catch (error) {
      console.error("Error assign login :", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [selectedLister]);

  useEffect(() => {
    fetchData();
    fetchStates();
    fetchMenus();
    fetchRoleData();
    fetchDepartmentData();
  }, []);

  useEffect(() => {
    if (newEmployee.state != "") {
      fetchCities();
    }
  }, [newEmployee.state]);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = datas.filter((item) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      item.name?.toLowerCase().includes(search) ||
      item.uid?.toLowerCase().includes(search) ||
      item.contact?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.role?.toLowerCase().includes(search) ||
      item.department?.toLowerCase().includes(search);

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
    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },
    {
      name: "Project Partner",
      cell: (row) => (
        <div className="w-full flex flex-col gap-[2px]">
          <p>{row.projectPartnerName}</p>
          <p>{row.projectPartnerContact}</p>
        </div>
      ),
      omit: false,
      minWidth: "200px",
    },
    {
      name: "Full Name",
      cell: (row) => (
        <div className={`flex gap-1 items-center justify-center`}>
          <div className="relative group cursor-pointer">
            <div
              className={`px-[2px] py-[2px] rounded-md flex items-center justify-center ${
                row.loginstatus === "Active"
                  ? "bg-[#EAFBF1] text-[#0BB501]"
                  : "bg-[#FBE9E9] text-[#FF0000]"
              }`}
              onClick={() => {
                setSelectedEmployeeId(row.id);
                setGiveAccess(true);
              }}
            >
              {row.loginstatus === "Active" ? <MdDone /> : <RxCross2 />}
            </div>
            <div className="absolute w-[150px] text-center -top-12 left-[75px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
              {row.loginstatus === "Active"
                ? "Login Status Active"
                : "Login Status Inactive"}
            </div>
          </div>
          {row.name}
        </div>
      ),
      width: "200px",
    },
    {
      name: "Adhar No",
      selector: (row) => row.uid,
      sortable: true,
      width: "150px",
    },
    {
      name: "Contact",
      selector: (row) => row.contact,
      sortable: true,
      width: "150px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Salary",
      selector: (row) => <FormatPrice price={parseFloat(row.salary)} />,
      sortable: true,
      width: "150px",
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      width: "130px",
    },
    {
      name: "Department",
      selector: (row) => row.department,
      sortable: true,
      width: "150px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const hasProjectPartner = datas.some((row) => !!row.projectPartnerName);

  const finalColumns = columns.map((col) => {
    if (col.name === "Project Partner")
      return { ...col, omit: !hasProjectPartner };
    return col;
  });

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id) => {
      switch (action) {
        case "view":
          viewEmployee(id);
          break;
        case "status":
          status(id);
          break;
        case "update":
          edit(id);
          break;
        case "delete":
          del(id);
          break;
        case "assignTask":
          viewEmployeeTasks(id);
          fetchMenus();
          setSelectedEmployeeId(id);
          setShowAssignTaskForm(true);
          break;
        case "assignLogin":
          setSelectedEmployeeId(id);
          setGiveAccess(true);
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
          <option value="assignTask">Assign Task</option>
          <option value="assignLogin">Assign Login</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`employee overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="employee-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between gap-1 sm:gap-3">
          <div className="w-[65%] sm:min-w-[220px] sm:max-w-[230px] relative inline-block">
            <div className="flex gap-2 items-center justify-between bg-white border border-[#00000033] text-sm font-semibold  text-black rounded-lg py-1 px-3 focus:outline-none focus:ring-2 focus:ring-[#076300]">
              <span>{selectedLister || "Select Lister"}</span>
              <RiArrowDropDownLine className="w-6 h-6 text-[#000000B2]" />
            </div>
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={selectedLister}
              onChange={(e) => {
                setSelectedLister(e.target.value);
              }}
            >
              <option value="Select Employee Lister">
                Select Employee Lister
              </option>
              <option value="Reparv">Reparv</option>
              <option value="Project Partner">Project Partner</option>
            </select>
          </div>
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"Employee.csv"} />
            <AddButton label={"Add"} func={setShowEplDetailsForm} />
          </div>
        </div>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Employee"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <div className="flex flex-wrap items-center justify-end gap-3 px-2">
              <EmployeeFilter />
              <div className="block">
                <CustomDateRangePicker range={range} setRange={setRange} />
              </div>
            </div>
            <div className="hidden xl:flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
              <DownloadCSV data={filteredData} filename={"Employee.csv"} />
              <AddButton label={"Add"} func={setShowEplDetailsForm} />
            </div>
          </div>
        </div>

        <h2 className="text-[16px] font-semibold">Employee List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={finalColumns}
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
        className={` ${
          !showEplDetailsForm && "hidden"
        } z-[61] employeeForm overflow-scroll scrollbar-hide w-[400px] h-[70vh] md:w-[700px] flex fixed`}
      >
        <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Employee Details</h2>
            <IoMdClose
              onClick={() => {
                setShowEplDetailsForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={add}>
            {" "}
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2">
              <div className="w-full">
                <input
                  type="hidden"
                  value={newEmployee.id || ""}
                  onChange={(e) =>
                    setEmployeeData({ ...newEmployee, id: e.target.value })
                  }
                />

                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Full Name (As per UID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setEmployeeData({ ...newEmployee, name: e.target.value })
                  }
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required={!newEmployee.id}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={
                    newEmployee.dob
                      ? new Date(newEmployee.dob).toLocaleDateString("en-CA")
                      : ""
                  }
                  onChange={(e) => {
                    const selectedDate = e.target.value; // Get full date
                    setEmployeeData({ ...newEmployee, dob: selectedDate });
                  }}
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Contact Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Contact Number"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.contact}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      // Allows only up to 12 digits
                      setEmployeeData({ ...newEmployee, contact: input });
                    }
                  }}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter Mail"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setEmployeeData({ ...newEmployee, email: e.target.value })
                  }
                />
              </div>

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Aadhaar Number
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Aadhaar No"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.uid}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,12}$/.test(input)) {
                      // Allows only up to 12 digits
                      setEmployeeData({ ...newEmployee, uid: input });
                    }
                  }}
                />
              </div>

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Complete Address"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.address}
                  onChange={(e) =>
                    setEmployeeData({ ...newEmployee, address: e.target.value })
                  }
                />
              </div>

              {/* State Select Input */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Select State
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newEmployee.state}
                  onChange={(e) =>
                    setEmployeeData({ ...newEmployee, state: e.target.value })
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
                  Select City
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newEmployee.city}
                  onChange={(e) =>
                    setEmployeeData({
                      ...newEmployee,
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

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Department
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newEmployee.departmentid}
                  onChange={(e) =>
                    setEmployeeData({
                      ...newEmployee,
                      departmentid: e.target.value,
                    })
                  }
                >
                  <option value="">Select Department</option>
                  {departmentData.map((department, index) => (
                    <option key={index} value={department.departmentid}>
                      {department.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Role
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newEmployee.roleid}
                  onChange={(e) =>
                    setEmployeeData({ ...newEmployee, roleid: e.target.value })
                  }
                >
                  <option value="user1">Select Role</option>
                  {roleData.map((role, index) => (
                    <option key={index} value={role.roleid}>
                      {role.role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Salary
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Salary"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.salary}
                  onChange={(e) =>
                    setEmployeeData({ ...newEmployee, salary: e.target.value })
                  }
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Date of Joining
                </label>
                <input
                  type="date"
                  required={!newEmployee.id}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={
                    newEmployee.doj
                      ? new Date(newEmployee.doj).toLocaleDateString("en-CA")
                      : ""
                  }
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    setEmployeeData({ ...newEmployee, doj: selectedDate });
                  }}
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowEplDetailsForm(false);
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
              <Loader />
            </div>
          </form>
        </div>
      </div>

      {/* Assign Task Form */}
      <div
        className={` ${
          !showAssignTaskForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] lg:w-[750px] max-h-[70vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Assign Tasks</h2>
            <IoMdClose
              onClick={() => {
                setShowAssignTaskForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={assignTask}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={selectedEmployeeId || ""}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              />
              <div className="w-full col-span-2">
                <label className="block text-sm leading-4 text-[#0000009b] font-medium">
                  Select Menus
                </label>

                <div className="grid grid-cols-2 lg:grid-cols-3 mt-[10px] p-2 border border-[#00000033] rounded-[4px]">
                  {menus?.map((menu, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`menu-${index}`}
                        value={menu.menuName}
                        checked={task.menus?.includes(menu.menuName)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          const updatedMenus = checked
                            ? [...(task.menus || []), value]
                            : (task.menus || []).filter(
                                (menu) => menu !== value
                              );
                          setTask({
                            ...task,
                            menus: updatedMenus,
                          });
                        }}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`menu-${index}`}
                        className="text-xs md:text-[14px] font-medium"
                      >
                        {menu.menuName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-center md:justify-end gap-6">
              <button
                type="button"
                onClick={() => setTask({ ...task, menus: [] })}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Reset Tasks
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Assign Tasks
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* Give Access Form */}
      <div
        className={` ${
          !giveAccess && "hidden"
        } z-[61] overflow-scroll scrollbar-hide flex fixed`}
      >
        <div className="w-[330px] h-[450px] sm:w-[600px] sm:h-[400px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] lg:h-[300px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Give Access</h2>
            <IoMdClose
              onClick={() => {
                setGiveAccess(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form
            onSubmit={assignLogin}
            className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2"
          >
            <input
              type="hidden"
              value={selectedEmployeeId || ""}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            />
            <div className="w-full">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                User Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter UserName"
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div className="w-full">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter Password"
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                onClick={() => {
                  setGiveAccess(false);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Give Access
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* Show Employee details */}
      <div
        className={`${
          showEmployee ? "flex" : "hidden"
        } z-[61] property-form overflow-scroll scrollbar-hide w-[400px] h-[70vh] md:w-[700px] fixed`}
      >
        <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Employee Details</h2>
            <IoMdClose
              onClick={() => {
                setShowEmployee(false);
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
                value={employee.status}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Login Status
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.loginstatus}
                readOnly
              />
            </div>
            <div className={`${employee.projectpartnerid ? "block" : "hidden"} w-full col-span-2`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Project Partner
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.projectPartnerName + " - " + employee.projectPartnerContact}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Department
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.department}
                readOnly
              />
            </div>
            
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Role
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.role}
                readOnly
              />
            </div>
            
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Date of Joining
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.dateOfJoining}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Salary
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.salary}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Full Name
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.name}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Date of Birth
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.dateOfBirth}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Contact
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.contact}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Email
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.email}
                readOnly
              />
            </div>

            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Aadhaar No
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.uid}
                readOnly
              />
            </div>
            <div className="w-full col-span-2">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Address
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.address}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                State
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.state}
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
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employee.city}
                readOnly
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Employee;
