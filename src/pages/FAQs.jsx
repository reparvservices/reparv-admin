import React from "react";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import ActionSelect from "../components/ActionSelect";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import Loader from "../components/Loader";

const FAQs = () => {
  const { showFAQForm, setShowFAQForm, action, URI, setLoading } = useAuth();
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newFAQ, setNewFAQ] = useState({
    id: "",
    location: "",
    type: "",
    question: "",
    answer: "",
  });

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/faqs", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch FAQs.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Add or update record
  const addOrUpdate = async (e) => {
    e.preventDefault();

    const endpoint = newFAQ.id ? `edit/${newFAQ.id}` : "add";

    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/faqs/${endpoint}`, {
        method: newFAQ.id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFAQ),
      });

      if (!response.ok) throw new Error("Failed to save FAQ.");

      if (newFAQ.id) {
        alert(`FAQ updated successfully!`);
      } else if (response.status === 202) {
        alert(`FAQ already Exit!!`);
      } else {
        alert(`FAQ added successfully!`);
      }

      setNewFAQ({ id: "", location: "", type: "", question: "", answer: "" });

      setShowFAQForm(false);
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
      const response = await fetch(URI + `/admin/faqs/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch faqs.");
      const data = await response.json();
      setNewFAQ(data);
      setShowFAQForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const response = await fetch(URI + `/admin/faqs/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert("FAQ deleted successfully!");

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
    if (!window.confirm("Are you sure you want to change this FAQ status?"))
      return;

    try {
      const response = await fetch(URI + `/admin/faqs/status/${id}`, {
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
      console.error("Error status changing :", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = datas.filter(
    (item) =>
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()),
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
      name: "Type & Location",
      cell: (row) => (
        <div className="flex flex-col p-2 gap-3">
          <span>{"Type: " + row.type}</span>
          <span>{"Location: " + row.location}</span>
        </div>
      ),
      minWidth: "200px",
    },
    {
      name: "Questions & Answers",
      cell: (row) => (
        <div className="flex flex-col p-2 gap-3">
          <span>{"Question: " + row.question}</span>
          <span>{"Answer: " + row.answer}</span>
        </div>
      ),
      minWidth: "250px",
    },

    {
      name: "Action",
      cell: (row) => (
        <ActionSelect
          statusAction={() => status(row.id)}
          editAction={() => edit(row.id)} // Dynamic edit route
          deleteAction={() => del(row.id)} // Delete function
        />
      ),
      width: "120px",
    },
  ];

  return (
    <div
      className={`overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="faq-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        <p className="block md:hidden text-lg font-semibold">FAQ</p>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search FAQ"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <AddButton label={"Add"} func={setShowFAQForm} />
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">FAQ List</h2>
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
          showFAQForm ? "block" : "hidden"
        } z-[61] roleForm overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto`}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">FAQ</h2>
            <IoMdClose
              onClick={() => {
                setShowFAQForm(false);
                setNewFAQ({
                  id: "",
                  location: "",
                  type: "",
                  question: "",
                  answer: "",
                });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addOrUpdate}>
            <div className="w-full grid gap-2 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={newFAQ.id || ""}
                onChange={(e) =>
                  setNewFAQ({
                    ...newFAQ,
                    id: e.target.value,
                  })
                }
              />
              <div className="w-full">
                <label
                  htmlFor="faqLocation"
                  className="block text-sm leading-4 text-[#00000066] font-medium mt-1"
                >
                  FAQ Location
                </label>

                <select
                  id="faqLocation"
                  required
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={newFAQ?.location || ""}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, location: e.target.value })
                  }
                >
                  <option disabled value="">
                    Select Location
                  </option>
                  <option value="Reparv Home Page">Reparv Home Page</option>
                  <option value="Reparv Buy New Property Page">
                    Reparv Buy New Property Page
                  </option>
                  <option value="Reparv Buy Resale Property Page">
                    Reparv Buy Resale Property Page
                  </option>
                  <option value="Reparv Blog Details Page">
                    Reparv Blog Details Page
                  </option>
                  <option value="Reparv Verify 7/12 Page">
                    Reparv Verify 7/12 Page
                  </option>
                  <option value="Reparv Rera Property Page">
                    Reparv Rera Property Page
                  </option>
                  <option value="Reparv Trusted Builder Page">
                    Reparv Trusted Builder Page
                  </option>
                  <option value="Reparv Cost Calculator Page">
                    Reparv Cost Calculator Page
                  </option>
                  <option value="Reparv Visit Properties On Weekend Page">
                    Reparv Visit Properties On Weekend Page
                  </option>

                  <option value="Partners Project Partner Page">
                    Partners Project Partner Page
                  </option>
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="faqType"
                  className="block text-sm leading-4 text-[#00000066] font-medium mt-1"
                >
                  FAQ Type
                </label>

                <select
                  id="faqType"
                  required
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={newFAQ?.type || ""}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, type: e.target.value })
                  }
                >
                  <option disabled value="">
                    Select Type
                  </option>
                  <option value="General">General</option>
                  <option value="Getting Started">Getting Started</option>
                  <option value="Partnership & Support">
                    Partnership & Support
                  </option>
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="faqQuestion"
                  className="block text-sm leading-4 text-[#00000066] font-medium mt-1"
                >
                  Question
                </label>

                <textarea
                  rows={2}
                  cols={40}
                  id="faqQuestion"
                  placeholder="Enter FAQ Question"
                  required
                  className="w-full mt-[8px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newFAQ?.question || ""}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, question: e.target.value })
                  }
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium mt-1">
                  Answer
                </label>

                <textarea
                  rows={3}
                  cols={40}
                  placeholder="Enter FAQ Answer"
                  required
                  className="w-full mt-[8px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newFAQ?.answer || ""}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, answer: e.target.value })
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

export default FAQs;
