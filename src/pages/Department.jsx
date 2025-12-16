import React from "react";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import ActionSelect from "../components/ActionSelect";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import EmployeeFilter from "../components/employee/EmployeeFilter";
import DataTable from "react-data-table-component";
import Loader from "../components/Loader";

const Department = () => {
  const { showDepartmentForm, setShowDepartmentForm, action, URI, setLoading } =
    useAuth();
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newDepartment, setNewDepartment] = useState({
    departmentid: "",
    department: "",
  });

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/departments", {
        method: "GET",
        credentials: "include", // ✅ Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch departments.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Add or update record
  const addOrUpdate = async (e) => {
    e.preventDefault();

    const endpoint = newDepartment.departmentid
      ? `edit/${newDepartment.departmentid}`
      : "add";

    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/departments/${endpoint}`, {
        method: newDepartment.departmentid ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDepartment),
      });

      if (!response.ok) throw new Error("Failed to save department.");

      if (newDepartment.departmentid) {
        alert(`Department updated successfully!`);
      } else if (response.status === 202) {
        alert(`Department already Exit!!`);
      } else {
        alert(`Department added successfully!`);
      }

      setNewDepartment({ department: "" });

      setShowDepartmentForm(false);
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
      const response = await fetch(URI + `/admin/departments/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch departments.");
      const data = await response.json();
      setNewDepartment(data);
      setShowDepartmentForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      const response = await fetch(URI + `/admin/departments/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert("Department deleted successfully!");

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
    if (
      !window.confirm("Are you sure you want to change this department status?")
    )
      return;

    try {
      const response = await fetch(URI + `/admin/departments/status/${id}`, {
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

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = datas.filter(
    (item) =>
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      name: "Name",
      selector: (row) => row.department,
      sortable: true,
      width: "200px",
    },

    {
      name: "",
      cell: (row) => (
        <ActionSelect
          statusAction={() => status(row.departmentid)}
          editAction={() => edit(row.departmentid)} // Dynamic edit route
          deleteAction={() => del(row.departmentid)} // Delete function
        />
      ),
      width: "120px",
    },
  ];
  // const handleMethod = () => {
  //   console.log("add");
  // };

  return (
    <div
      className={`role overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="role-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        <p className="block md:hidden text-lg font-semibold">Department</p>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Department"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <AddButton label={"Add"} func={setShowDepartmentForm} />
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Department List</h2>
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
          showDepartmentForm ? "block" : "hidden"
        } z-[61] roleForm overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Department</h2>
            <IoMdClose
              onClick={() => {
                setShowDepartmentForm(false);
                setNewDepartment({
                  departmentid: "",
                  department: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addOrUpdate}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={newDepartment.departmentid || ""}
                onChange={(e) =>
                  setNewDepartment({
                    ...newDepartment,
                    departmentid: e.target.value,
                  })
                }
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enter Department
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Department"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDepartment.department}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      department: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                {action}
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Department;
