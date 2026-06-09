import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiEye, FiX, FiRefreshCw, FiUsers } from "react-icons/fi";
import DataTable from "react-data-table-component";
import { useAuth } from "../store/auth";

const fmtStatus = (s = "") =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const badgeStyle = (bg, color) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  background: bg,
  color,
  whiteSpace: "nowrap",
});

const scoreBadge = (score) => {
  if (score === "hot") return badgeStyle("#fee2e2", "#991b1b");
  if (score === "warm") return badgeStyle("#fef3c7", "#92400e");
  if (score === "cold") return badgeStyle("#dbeafe", "#1e40af");
  return badgeStyle("#f1f5f9", "#64748b");
};

const statusBadge = (status) => {
  if (status === "human_handoff") return badgeStyle("#fce7f3", "#9d174d");
  if (status === "qualified") return badgeStyle("#d1fae5", "#065f46");
  return badgeStyle("#e0f2fe", "#0369a1");
};

const avatar = (name = "") => {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
};

const AVATAR_COLORS = [
  ["#e0f2fe", "#0369a1"],
  ["#fce7f3", "#9d174d"],
  ["#d1fae5", "#065f46"],
  ["#fef3c7", "#92400e"],
  ["#ede9fe", "#5b21b6"],
];
const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const formatBudget = (min, max) => {
  if (min == null && max == null) return "—";
  const fmt = (n) =>
    n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;
  return `${fmt(min)} – ${fmt(max)}`;
};

const tableStyles = {
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      borderBottom: "2px solid #e2e8f0",
      minHeight: "44px",
    },
  },
  headCells: {
    style: {
      fontSize: "11px",
      fontWeight: "700",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  cells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
      paddingTop: "12px",
      paddingBottom: "12px",
    },
  },
  rows: {
    style: {
      borderBottom: "1px solid #f1f5f9",
      "&:hover": { backgroundColor: "#f8fafc !important" },
    },
  },
};

export default function AiLeads() {
  const { URI, setLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLocalLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateAssign, setUpdateAssign] = useState("");

  const fetchLeads = async () => {
    try {
      setLocalLoading(true);
      setLoading?.(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (scoreFilter !== "all") params.set("lead_score", scoreFilter);
      if (statusFilter !== "all") params.set("lead_status", statusFilter);

      const res = await fetch(
        `${URI}/admin/ai-agent/leads?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch");
      setLeads(data?.leads || []);
    } catch {
      setLeads([]);
    } finally {
      setLocalLoading(false);
      setLoading?.(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreFilter, statusFilter]);

  const openDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`${URI}/admin/ai-agent/leads/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load");
      setDetailModal(data.lead);
      setUpdateStatus(data.lead?.lead_status || "");
      setUpdateAssign(data.lead?.assigned_to || "");
    } catch (e) {
      alert(e.message || "Failed to load lead");
    } finally {
      setDetailLoading(false);
    }
  };

  const saveStatus = async () => {
    if (!detailModal?.id) return;
    try {
      setDetailLoading(true);
      const res = await fetch(
        `${URI}/admin/ai-agent/leads/${detailModal.id}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_status: updateStatus || undefined,
            assigned_to: updateAssign,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed");
      alert("Lead updated successfully");
      setDetailModal(null);
      fetchLeads();
    } catch (e) {
      alert(e.message || "Update failed");
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((item) =>
      [item.name, item.phone, item.city, item.property_type]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [leads, searchTerm]);

  const stats = useMemo(
    () => ({
      total: leads.length,
      hot: leads.filter((d) => d.lead_score === "hot").length,
      warm: leads.filter((d) => d.lead_score === "warm").length,
      cold: leads.filter((d) => d.lead_score === "cold").length,
      qualified: leads.filter((d) => d.lead_status === "qualified").length,
      handoff: leads.filter((d) => d.lead_status === "human_handoff").length,
    }),
    [leads],
  );

  const columns = [
    {
      name: "#",
      cell: (_, i) => (
        <span style={{ ...badgeStyle("#f1f5f9", "#475569"), minWidth: 28, justifyContent: "center" }}>
          {i + 1}
        </span>
      ),
      width: "56px",
    },
    {
      name: "Score",
      cell: (row) => (
        <span style={scoreBadge(row.lead_score)}>
          {row.lead_score ? row.lead_score.toUpperCase() : "—"}
        </span>
      ),
      width: "90px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span style={statusBadge(row.lead_status)}>
          {fmtStatus(row.lead_status || "qualifying")}
        </span>
      ),
      width: "130px",
    },
    {
      name: "Lead",
      cell: (row) => {
        const name = row.name || row.enquirer_customer || "Unknown";
        const initials = avatar(name);
        const [bg, fg] = getAvatarColor(name);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: bg,
                color: fg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials || "?"}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                {name}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                {row.phone || row.enquirer_contact || "—"}
              </div>
            </div>
          </div>
        );
      },
      minWidth: "200px",
    },
    {
      name: "City",
      cell: (row) => (
        <span style={{ fontSize: 12, color: "#475569" }}>{row.city || "—"}</span>
      ),
      width: "110px",
    },
    {
      name: "Budget",
      cell: (row) => (
        <span style={{ fontSize: 11, color: "#475569" }}>
          {formatBudget(row.budget_min, row.budget_max)}
        </span>
      ),
      minWidth: "160px",
    },
    {
      name: "Property Type",
      cell: (row) => (
        <span style={{ fontSize: 12, color: "#475569" }}>
          {row.property_type || "—"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Timeline",
      cell: (row) => (
        <span style={{ fontSize: 11, color: "#64748b" }}>
          {row.purchase_timeline || "—"}
        </span>
      ),
      minWidth: "140px",
    },
    {
      name: "Channel",
      cell: (row) => (
        <span style={badgeStyle("#ede9fe", "#5b21b6")}>
          {(row.channel || "web").toUpperCase()}
        </span>
      ),
      width: "90px",
    },
    {
      name: "Created",
      cell: (row) => (
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          {row.created_at || "—"}
        </span>
      ),
      width: "150px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          type="button"
          onClick={() => openDetail(row.id)}
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ede9fe",
            color: "#5b21b6",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
          title="View details"
        >
          <FiEye size={15} />
        </button>
      ),
      width: "80px",
    },
  ];

  const scorePills = [
    { id: "all", label: "All" },
    { id: "hot", label: "Hot" },
    { id: "warm", label: "Warm" },
    { id: "cold", label: "Cold" },
  ];

  return (
    <div style={{ padding: "24px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          AI Leads
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          Qualified buyer profiles from the Real Estate AI Advisor
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Total", value: stats.total, color: "#6366f1" },
          { label: "Hot", value: stats.hot, color: "#dc2626" },
          { label: "Warm", value: stats.warm, color: "#d97706" },
          { label: "Cold", value: stats.cold, color: "#2563eb" },
          { label: "Qualified", value: stats.qualified, color: "#059669" },
          { label: "Handoff", value: stats.handoff, color: "#db2777" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
            <CiSearch
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: 18,
              }}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
              placeholder="Search name, phone, city..."
              style={{
                width: "100%",
                padding: "10px 12px 10px 38px",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 13,
              background: "#fff",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="qualifying">Qualifying</option>
            <option value="qualified">Qualified</option>
            <option value="human_handoff">Human Handoff</option>
          </select>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {scorePills.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setScoreFilter(p.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: scoreFilter === p.id ? "#6366f1" : "#e2e8f0",
                  background: scoreFilter === p.id ? "#eef2ff" : "#fff",
                  color: scoreFilter === p.id ? "#4338ca" : "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchLeads}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <FiRefreshCw size={14} />
            Refresh
          </button>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          progressPending={loading}
          pagination
          paginationPerPage={15}
          customStyles={tableStyles}
          noDataComponent={
            <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
              <FiUsers size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <div style={{ fontWeight: 700, color: "#475569" }}>No AI leads yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Leads appear when users share contact details in the AI chat
              </div>
            </div>
          }
        />
      </div>

      {detailModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setDetailModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 520,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                AI Lead Details
              </h2>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                <FiX size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                Loading…
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  <span style={scoreBadge(detailModal.lead_score)}>
                    {(detailModal.lead_score || "—").toUpperCase()}
                  </span>
                  <span style={statusBadge(detailModal.lead_status)}>
                    {fmtStatus(detailModal.lead_status)}
                  </span>
                  <span style={badgeStyle("#ede9fe", "#5b21b6")}>
                    {(detailModal.channel || "web").toUpperCase()}
                  </span>
                </div>

                {[
                  ["Name", detailModal.name],
                  ["Phone", detailModal.phone],
                  ["City", detailModal.city],
                  ["Budget", formatBudget(detailModal.budget_min, detailModal.budget_max)],
                  ["Property Type", detailModal.property_type],
                  ["Location Preference", detailModal.location_preference],
                  ["Purchase Timeline", detailModal.purchase_timeline],
                  [
                    "Home Loan",
                    detailModal.home_loan_required == null
                      ? "—"
                      : detailModal.home_loan_required
                        ? "Yes"
                        : "No",
                  ],
                  ["Session", detailModal.user_id],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{label}</span>
                    <span style={{ color: "#0f172a", textAlign: "right", maxWidth: "60%" }}>
                      {value || "—"}
                    </span>
                  </div>
                ))}

                {detailModal.enquirer && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      background: "#f0fdf4",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#065f46", marginBottom: 4 }}>
                      Linked Enquirer #{detailModal.enquirersid}
                    </div>
                    <div>
                      {detailModal.enquirer.customer} · {detailModal.enquirer.contact} ·{" "}
                      {detailModal.enquirer.status}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/enquirers")}
                      style={{
                        marginTop: 8,
                        padding: "6px 12px",
                        background: "#059669",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Open Enquirers (select AI Agent source)
                    </button>
                  </div>
                )}

                <div style={{ marginTop: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                    Update Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: 10,
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    <option value="qualifying">Qualifying</option>
                    <option value="qualified">Qualified</option>
                    <option value="human_handoff">Human Handoff</option>
                  </select>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                    Assigned To
                  </label>
                  <input
                    value={updateAssign}
                    onChange={(e) => setUpdateAssign(e.target.value)}
                    placeholder="Sales agent name"
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: 10,
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={saveStatus}
                  disabled={detailLoading}
                  style={{
                    marginTop: 16,
                    width: "100%",
                    padding: 12,
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
