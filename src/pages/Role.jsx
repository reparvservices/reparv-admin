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
import ListPageLayout from "../components/ui/ListPageLayout";
import { FiShield } from "react-icons/fi";

const Role = () => {
  const { showRoleForm, setShowRoleForm, action, URI, setLoading } = useAuth();
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRole, setNewRole] = useState({ roleid: "", role: "" });

  // **Fetch Data from API**
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(URI + "/admin/roles", {
        method: "GET",
        credentials: "include", // ✅ Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch roles.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
};

  //Add or update record
  const addOrUpdate = async (e) => {
    e.preventDefault();

    const endpoint = newRole.roleid ? `edit/${newRole.roleid}` : "add";
    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/roles/${endpoint}`, {
        method: action === "update" ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRole),
      });

      if (!response.ok) throw new Error("Failed to save role.");

      if (newRole.roleid) {
        alert(`Role updated successfully!`);
      } else if (response.status === 202) {
        alert(`Role already Exit!!`);
      } else {
        alert(`Role added successfully!`);
      }

      setNewRole({ role: "" });

      setShowRoleForm(false);
      fetchData();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/roles/${id}`, {
        method: "GET",
        credentials: "include", // ✅ Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch roles.");
      const data = await response.json();
      setNewRole(data);
      setShowRoleForm(true);
    } catch (err) {
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      const response = await fetch(URI + `/admin/roles/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert("Role deleted successfully!");

        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
    }
  };

  // change status record
  const status = async (id) => {
    if (!window.confirm("Are you sure you want to change this role status?"))
      return;

    try {
      const response = await fetch(URI + `/admin/roles/status/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      fetchData();
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = datas.filter(
    (item) =>
      item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      selector: (row) => row.role,
      sortable: true,
      width: "200px",
    },
    {
      name: "",
      cell: (row) => (
        <ActionSelect
          statusAction={() => status(row.roleid)}
          editAction={() => edit(row.roleid)} // Dynamic edit route
          deleteAction={() => del(row.roleid)} // Delete function
        />
      ),
      width: "120px",
    },
  ];
  // const handleMethod = () => {
  // };

  return (
    <div className="role w-full min-h-full bg-[#F4F6F8] overflow-y-auto scrollbar-hide">
      <ListPageLayout
        eyebrow="Employees"
        title="Roles"
        subtitle="Roles that control what employees can access."
        icon={<FiShield size={24} />}
        onRefresh={fetchData}
        actions={<AddButton label={"Add role"} func={setShowRoleForm} />}
        stats={[
          { label: "Total", value: datas.length },
          {
            label: "Active",
            value: datas.filter((d) => d.status === "Active").length,
          },
          {
            label: "Inactive",
            value: datas.filter((d) => d.status !== "Active").length,
          },
        ]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search role…"
        listTitle="Role list"
        listMeta={`Showing ${filteredData.length} of ${datas.length}`}
      >
        <DataTable
          className="scrollbar-hide"
          customStyles={customStyles}
          columns={columns}
          data={filteredData}
          fixedHeader
          fixedHeaderScrollHeight="calc(100vh - 22rem)"
          pagination
          paginationPerPage={15}
          paginationComponentOptions={{
            rowsPerPageText: "Rows per page:",
            rangeSeparatorText: "of",
            selectAllRowsItem: true,
            selectAllRowsItemText: "All",
          }}
          noDataComponent={
            <div className="py-16 text-center text-sm text-gray-500">
              No roles match your search.
            </div>
          }
        />
      </ListPageLayout>

      <div
        className={`${
          showRoleForm ? "flex" : "hidden"
        } z-[61] roleForm fixed inset-0 flex items-end md:items-center justify-center md:p-6 pointer-events-none`}
      >
        <div className="pointer-events-auto max-h-[85vh] w-full md:w-[500px] max-h-[70vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Role</h2>
            <IoMdClose
              onClick={() => {
                setShowRoleForm(false);
                setNewRole({ roleid: "", role: "" });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addOrUpdate}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={newRole.roleid || ""}
                onChange={(e) =>
                  setNewRole({ ...newRole, roleid: e.target.value })
                }
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enter Role
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Role"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newRole.role}
                  onChange={(e) =>
                    setNewRole({ ...newRole, role: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowRoleForm(false);
                  setNewRole({ roleid: "", role: "" });
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
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

export default Role;
