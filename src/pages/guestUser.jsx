import React from "react";
import { format } from "date-fns";
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
import { RxCross2 } from "react-icons/rx";
import { MdDone } from "react-icons/md";
import DownloadCSV from "../components/DownloadCSV";
import ListPageLayout from "../components/ui/ListPageLayout";
import DataTableProgress from "../components/ui/DataTableProgress";
import { FiUsers } from "react-icons/fi";

const GuestUser = () => {
  const {
    showPartnerForm,
    setShowPartnerForm,
    URI,
    setLoading,
    giveAccess,
    setGiveAccess,
    showPartner,
    setShowPartner,
  } = useAuth();

  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Server-side pagination / filtering
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [partnerId, setPartnerId] = useState(null);
  const [partner, setPartner] = useState({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPartner, setNewPartner] = useState({
    fullname: "",
    contact: "",
    email: "",
  });

  // **Fetch Data from API**
  const fetchData = async () => {
    setListLoading(true);
    setListError("");
    try {
      const qs = new URLSearchParams({
        limit: String(perPage),
        offset: String((page - 1) * perPage),
      });
      if (debouncedSearch) qs.set("search", debouncedSearch);
      if (statusFilter) qs.set("status", statusFilter);
      const { startDate, endDate } = range[0];
      if (startDate && endDate) {
        qs.set("date_from", format(startDate, "yyyy-MM-dd"));
        qs.set("date_to", format(endDate, "yyyy-MM-dd"));
      }
      const response = await fetch(`${URI}/admin/guestuser/list?${qs}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.message || "Failed to fetch users.");
      setDatas(json.data || []);
      setTotal(json.total || 0);
      setCounts(json.counts || null);
    } catch (err) {
      setListError(err.message || "Failed to fetch users.");
    } finally {
      setListLoading(false);
    }
  };

  const add = async (e) => {
    e.preventDefault();

    const endpoint = newPartner.id ? `edit/${newPartner.id}` : "add";

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/guestuser/${endpoint}`, {
        method: newPartner.id ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPartner),
      });

      if (response.status === 409) {
        alert("user all ready exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to save partner. Status: ${response.status}`);
      } else {
        alert(
          newPartner.id
            ? "User updated successfully!"
            : "User added successfully!"
        );

        setNewPartner({
          fullname: "",
          contact: "",
          email: "",
        });

        setShowPartnerForm(false);
        await fetchData();
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/guestuser/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch User.");
      const data = await response.json();
      setNewPartner(data);
      setShowPartnerForm(true);
    } catch (err) {
    }
  };

  //fetch data on form
  const viewPartner = async (id) => {
    try {
      const response = await fetch(URI + `/admin/guestuser/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Partner.");
      const data = await response.json();
      setPartner(data);
      setShowPartner(true);
    } catch (err) {
    }
  };

  //Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this User?")) return;

    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/guestuser/delete/${id}`, {
        method: "DELETE",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("User deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // change status record
  const status = async (id) => {
    if (!window.confirm("Are you sure you want to change this User status?"))
      return;

    try {
      const response = await fetch(URI + `/admin/guestuser/status/${id}`, {
        method: "PUT",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
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

  // Assign login record
  const assignLogin = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to assign login to this User ?"))
      return;

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/guestuser/assignlogin/${partnerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ partnerId, username, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setPartnerId(null);
      setUsername("");
      setPassword("");
      setGiveAccess(false);
      fetchData();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, range]);

  useEffect(() => {
    fetchData();
  }, [page, perPage, debouncedSearch, statusFilter, range]);

  // Rows already filtered and paginated by the server
  const filteredData = datas;

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
            {(page - 1) * perPage + index + 1}
          </span>

          {/* Tooltip */}
          <div className="absolute w-[65px] text-center -top-12 left-[30px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
            {row.status === "Active" ? "Active" : "Inactive"}
          </div>
        </div>
      ),
      width: "80px",
    },
    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },
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
                setPartnerId(row.id);
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
          <div className="relative group cursor-pointer">
            <span
              className={`${
                row.adharno && row.panno && row.adharimage && row.panimage
                  ? "text-green-600"
                  : ""
              }`}
            >
              {row.fullname}
            </span>
            <div className="absolute w-[150px] text-center -top-12 left-[50px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
              {row.adharno && row.panno && row.adharimage && row.panimage
                ? "KYC Completed"
                : "KYC Not Completed"}
            </div>
          </div>
        </div>
      ),
      minWidth: "200px",
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
      minWidth: "250px",
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
          viewPartner(id);
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
        case "assignlogin":
          setPartnerId(id);
          setGiveAccess(true);
          break;
        default:
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
          <option value="assignlogin">Assign Login</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div className="guest-users w-full min-h-full bg-[#F4F6F8] overflow-y-auto scrollbar-hide">
      <ListPageLayout
        eyebrow="Users"
        title="Guest users"
        subtitle="People who signed up on the website and app, and their login access."
        icon={<FiUsers size={24} />}
        onRefresh={fetchData}
        refreshing={listLoading}
        actions={<AddButton label={"Add user"} func={setShowPartnerForm} />}
        stats={[
          { label: "Total", value: counts?.total ?? "—" },
          { label: "Active", value: counts?.active ?? "—" },
          { label: "Inactive", value: counts?.inactive ?? "—" },
          { label: "Login Active", value: counts?.loginActive ?? "—" },
        ]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search name, email, phone…"
        toolbar={
          <>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "All", value: "", count: counts?.total },
                { label: "Active", value: "Active", count: counts?.active },
                { label: "Inactive", value: "Inactive", count: counts?.inactive },
              ].map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setStatusFilter(f.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
                    statusFilter === f.value
                      ? "bg-[#EAFBF1] border-[#076300]/30 text-[#076300]"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {f.label}
                  {f.count != null ? (
                    <span className="text-xs tabular-nums px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                      {f.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <CustomDateRangePicker range={range} setRange={setRange} />
              <DownloadCSV data={filteredData} filename={"GuestUsers.csv"} />
              <span className="text-[10px] text-gray-400 hidden lg:inline self-center">
                CSV: current page
              </span>
            </div>
          </>
        }
        listTitle="Guest user list"
        listMeta={
          listError
            ? listError
            : total
              ? `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}${debouncedSearch ? ` · “${debouncedSearch}”` : ""}`
              : ""
        }
      >
        <DataTable
          className="scrollbar-hide"
          customStyles={customStyles}
          columns={columns}
          data={filteredData}
          fixedHeader
          fixedHeaderScrollHeight="calc(100vh - 22rem)"
          pagination
          paginationServer
          paginationTotalRows={total}
          paginationDefaultPage={page}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          onChangePage={(p) => setPage(p)}
          onChangeRowsPerPage={(n, p) => {
            setPerPage(n);
            setPage(p);
          }}
          progressPending={listLoading && datas.length === 0}
          progressComponent={<DataTableProgress message="Loading users…" />}
          paginationComponentOptions={{
            rowsPerPageText: "Rows per page:",
            rangeSeparatorText: "of",
          }}
          noDataComponent={
            <div className="py-16 text-center text-sm text-gray-500">
              No users match your search.
            </div>
          }
        />
      </ListPageLayout>

      <div
        className={`${
          showPartnerForm ? "flex" : "hidden"
        } z-[61] sales-form fixed inset-0 flex items-end md:items-center justify-center md:p-6 pointer-events-none`}
      >
        <div className="pointer-events-auto max-h-[85vh] w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Guest User Form</h2>
            <IoMdClose
              onClick={() => {
                setShowPartnerForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={add}>
            <div className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={newPartner.id || ""}
                onChange={(e) => {
                  setNewPartner({ ...newPartner, id: e.target.value });
                }}
              />
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  value={newPartner.fullname}
                  onChange={(e) => {
                    setNewPartner({
                      ...newPartner,
                      fullname: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Contact Number"
                  value={newPartner.contact}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      // Allows only up to 10 digits
                      setNewPartner({
                        ...newPartner,
                        contact: e.target.value,
                      });
                    }
                  }}
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter Email"
                  value={newPartner.email}
                  onChange={(e) => {
                    setNewPartner({
                      ...newPartner,
                      email: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowPartnerForm(false);
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

      {/* Give Access Form */}
      <div
        className={` ${
          !giveAccess && "hidden"
        }  z-[61] overflow-scroll scrollbar-hide flex fixed`}
      >
        <div className="w-[330px] h-[380px] sm:w-[600px] sm:h-[400px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] lg:h-[300px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Give Access</h2>
            <IoMdClose
              onClick={() => {
                setGiveAccess(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={assignLogin}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={partnerId || ""}
                onChange={(e) => {
                  setPartnerId(e.target.value);
                }}
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
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-center sm:justify-end gap-6">
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

      {/* Show onBoarding Partner details */}
      <div
        className={`${
          showPartner ? "flex" : "hidden"
        } z-[61] property-form fixed inset-0 flex items-end md:items-center justify-center md:p-6 pointer-events-none`}
      >
        <div className="pointer-events-auto max-h-[85vh] w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Guest User Details</h2>
            <IoMdClose
              onClick={() => {
                setShowPartner(false);
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
                value={partner.status}
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
                value={partner.loginstatus}
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
                value={partner.fullname}
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
                value={partner.contact}
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
                value={partner.email}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Experience
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={partner.experience}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Bank Name
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={partner.bankname}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Account Holder Name
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={partner.accountholdername}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Account Number
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={partner.accountnumber}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                IFSC Code
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={partner.ifsc}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Address
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={partner.address}
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
                value={partner.state}
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
                value={partner.city}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Pin-Code
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={partner.pincode}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Adhar No
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={partner.adharno}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Pancard No
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={partner.panno}
                readOnly
              />
            </div>

            {/* Aadhar Images */}
            <div
              className={`w-full ${partner.adharimage ? "block" : "hidden"}`}
            >
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Aadhar Images
              </label>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {(() => {
                  try {
                    const images = JSON.parse(partner.adharimage); // parse JSON array
                    return images.map((img, index) => (
                      <img
                        key={index}
                        onClick={() => {
                          window.open(`${URI}${img}`, "_blank");
                        }}
                        className="w-full border border-[#00000033] rounded-[4px] object-cover cursor-pointer"
                        src={`${URI}${img}`}
                        alt={`Aadhar ${index + 1}`}
                      />
                    ));
                  } catch (err) {
                    return null;
                  }
                })()}
              </div>
            </div>

            {/* PAN Images */}
            <div className={`w-full ${partner.panimage ? "block" : "hidden"}`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                PAN Card Images
              </label>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {(() => {
                  try {
                    const images = JSON.parse(partner.panimage); // parse JSON array
                    return images.map((img, index) => (
                      <img
                        key={index}
                        onClick={() => {
                          window.open(`${URI}${img}`, "_blank");
                        }}
                        className="w-full border border-[#00000033] rounded-[4px] object-cover cursor-pointer"
                        src={`${URI}${img}`}
                        alt={`PAN ${index + 1}`}
                      />
                    ));
                  } catch (err) {
                    return null;
                  }
                })()}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuestUser;
