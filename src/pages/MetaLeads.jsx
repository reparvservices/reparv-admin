import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { FiTrash2 } from "react-icons/fi";
import DataTable from "react-data-table-component";

// const URI = "http://localhost:3000";
const URI = "https://aws-api.reparv.in";
const MetaLeads = () => {
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  /* ================= FETCH META LEADS ================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${URI}/meta`);
      const result = await response.json();
      if (result.success) setDatas(result.data);
    } catch (err) {
      console.error("Error fetching meta leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= OPEN DELETE MODAL ================= */

  const openDeleteModal = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  /* ================= DELETE API ================= */

  const confirmDelete = async () => {
    if (!selectedLead) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${URI}/meta/delete-lead/${selectedLead.id}`,
        { method: "DELETE" },
      );

      const result = await response.json();

      if (result.success) {
        setDatas((prev) => prev.filter((item) => item.id !== selectedLead.id));
      } else {
        alert(result.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      closeModal();
      setLoading(false);
    }
  };

  /* ================= SEARCH FILTER ================= */

  const filteredData = datas.filter((item) =>
    [
      item.full_name,
      item.phone_number,
      item.email,
      item.city,
      item.campaign_name,
      item.adset_name,
      item.platform,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  /* ================= TABLE COLUMNS ================= */

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
          {index + 1}
        </span>
      ),
      width: "70px",
    },
    {
      name: "Lead Details",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold">{row.full_name}</span>
          <span className="text-xs text-gray-500">{row.phone_number}</span>
          <span className="text-xs text-gray-500">{row.email}</span>
        </div>
      ),
      minWidth: "220px",
    },
    {
      name: "City",
      selector: (row) => row.city || "-",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: "Campaign",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm">{row.campaign_name}</span>
          <span className="text-xs text-gray-500">{row.adset_name}</span>
        </div>
      ),
      minWidth: "250px",
    },
    {
      name: "Platform",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            row.platform === "ig"
              ? "bg-pink-100 text-pink-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {row.platform?.toUpperCase()}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Created",
      selector: (row) => row.created_at || "-",
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          onClick={() => openDeleteModal(row)}
          className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200 transition"
        >
          <FiTrash2 size={14} />
          Delete
        </button>
      ),
      width: "130px",
    },
  ];

  return (
    <div className="overflow-scroll scrollbar-hide w-full h-screen flex flex-col">
      <div className="w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        {/* Search */}
        <div className="w-full lg:w-[30%] max-w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center bg-[#0000000A]">
          <CiSearch />
          <input
            type="text"
            placeholder="Search Lead..."
            className="w-full text-sm bg-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <h2 className="text-[16px] font-semibold">Meta Leads List</h2>

        <DataTable
          columns={columns}
          data={filteredData}
          progressPending={loading}
          pagination
          fixedHeader
          fixedHeaderScrollHeight="60vh"
          highlightOnHover
          responsive
        />
      </div>

      {/* ================= DELETE MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Delete Lead
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete lead{" "}
              <span className="font-semibold">{selectedLead?.full_name}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaLeads;
