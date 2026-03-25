import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import {
  FiTrash2,
  FiEye,
  FiX,
  FiRefreshCw,
  FiUsers,
  FiFilter,
} from "react-icons/fi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import DataTable from "react-data-table-component";

const URI = "https://aws-api.reparv.in";

/* ─── helpers ─── */
const fmt = (str = "") =>
  str
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const fmtVal = (str = "") =>
  str
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const SKIP = new Set([
  "property_id",
  "inbox_url",
  "full_name",
  "email",
  "city",
  "phone_number",
]);

const parseFields = (lead) => {
  try {
    const p =
      typeof lead.raw_payload === "string"
        ? JSON.parse(lead.raw_payload)
        : lead.raw_payload;
    return Array.isArray(p?.field_data) ? p.field_data : [];
  } catch {
    return [];
  }
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
  ["#fee2e2", "#991b1b"],
];
const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

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
  fontFamily: "'Plus Jakarta Sans', sans-serif",
});

const actionBtn = (bg, color) => ({
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: bg,
  color,
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  transition: "opacity 0.15s",
  flexShrink: 0,
});

/* ─── custom table styles ─── */
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
      transition: "background 0.15s",
      "&:hover": { backgroundColor: "#f8fafc !important" },
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e2e8f0",
      backgroundColor: "#f8fafc",
      borderRadius: "0 0 16px 16px",
      fontSize: "13px",
      color: "#475569",
    },
  },
};

/* ─── sub-components ─── */
const LoadingSpinner = () => (
  <div
    style={{
      padding: "48px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        border: "3px solid #e2e8f0",
        borderTop: "3px solid #6366f1",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <span
      style={{
        fontSize: 13,
        color: "#94a3b8",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      Loading leads…
    </span>
  </div>
);

const EmptyState = () => (
  <div style={{ padding: "48px 24px", textAlign: "center" }}>
    <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
    <p
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#1e293b",
        margin: "0 0 4px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      No leads found
    </p>
    <p
      style={{
        fontSize: 12,
        color: "#94a3b8",
        margin: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      Try adjusting your search or filters
    </p>
  </div>
);

/* ─── main component ─── */
export default function MetaLeads() {
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [platformFilter, setPlatformFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${URI}/meta`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        const sorted = [...result.data].sort((a, b) => {
          const da = new Date(a.created_at.replace(" | ", " "));
          const db = new Date(b.created_at.replace(" | ", " "));
          return db - da;
        });
        setDatas(sorted);
        console.log(sorted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      setLoading(true);
      const res = await fetch(`${URI}/meta/delete-lead/${deleteModal.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success)
        setDatas((p) => p.filter((i) => i.id !== deleteModal.id));
      else alert(result.message || "Delete failed");
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteModal(null);
      setLoading(false);
    }
  };

  const filtered = datas.filter((item) => {
    const matchSearch = [
      item.full_name,
      item.phone_number,
      item.email,
      item.city,
      item.campaign_name,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchPlatform =
      platformFilter === "all" ||
      (platformFilter === "organic" && item.is_organic) ||
      (platformFilter === "ig" && item.platform === "ig") ||
      (platformFilter === "fb" && item.platform === "fb");
    return matchSearch && matchPlatform;
  });

  const stats = {
    total: datas.length,
    organic: datas.filter((d) => d.is_organic).length,
    ig: datas.filter((d) => d.platform === "ig").length,
    fb: datas.filter((d) => d.platform === "fb").length,
  };

  const PlatformBadge = ({ row }) => {
    if (!row.platform && row.is_organic)
      return <span style={badgeStyle("#dcfce7", "#16a34a")}>Organic</span>;
    if (row.platform === "ig")
      return <span style={badgeStyle("#fdf2f8", "#c026d3")}>Instagram</span>;
    if (row.platform === "fb")
      return <span style={badgeStyle("#eff6ff", "#2563eb")}>Facebook</span>;
    return <span style={badgeStyle("#f1f5f9", "#64748b")}>—</span>;
  };

  const FieldPills = ({ lead }) => {
    const fields = parseFields(lead).filter(
      (f) => !SKIP.has(f.name) && f.values?.[0],
    );
    if (!fields.length)
      return (
        <span style={{ fontSize: 12, color: "#cbd5e1" }}>No form data</span>
      );
    return (
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "4px 0" }}
      >
        {fields.map((f) => (
          <div
            key={f.name}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "4px 10px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#94a3b8",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {fmt(f.name)}
            </div>
            <div style={{ fontSize: 11, color: "#1e293b", fontWeight: 700 }}>
              {fmtVal(f.values[0])}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const columns = [
    {
      name: "#",
      cell: (_, i) => (
        <span
          style={{
            ...badgeStyle("#f1f5f9", "#475569"),
            fontSize: 11,
            fontWeight: 700,
            minWidth: 28,
            justifyContent: "center",
          }}
        >
          {i + 1}
        </span>
      ),
      width: "56px",
    },
    {
      name: "Lead",
      cell: (row) => {
        const initials = avatar(row.full_name || "");
        const [bg, fg] = getAvatarColor(row.full_name || "");
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "6px 0",
            }}
          >
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
                textTransform: "uppercase",
              }}
            >
              {initials || "?"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#0f172a",
                  lineHeight: 1.2,
                }}
              >
                {row.full_name || "—"}
              </span>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                {row.phone_number || "—"}
              </span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                {row.email || "—"}
              </span>
              {row.city && (
                <span
                  style={{
                    fontSize: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    color: "#16a34a",
                    fontWeight: 600,
                  }}
                >
                  <HiOutlineLocationMarker size={10} /> {row.city}
                </span>
              )}
            </div>
          </div>
        );
      },
      minWidth: "220px",
    },
    {
      name: "Campaign",
      cell: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {row.campaign_name ? (
            <>
              <span
                style={{
                  fontSize: 12,
                  color: "#1e293b",
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {row.campaign_name}
              </span>
              {row.adset_name && (
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {row.adset_name}
                </span>
              )}
            </>
          ) : (
            <span
              style={{ fontSize: 12, color: "#cbd5e1", fontStyle: "italic" }}
            >
              {row.is_organic ? "Organic Lead" : "—"}
            </span>
          )}
        </div>
      ),
      minWidth: "180px",
    },
    {
      name: "Form Responses",
      cell: (row) => <FieldPills lead={row} />,
      minWidth: "320px",
      wrap: true,
    },
    {
      name: "Platform",
      cell: (row) => <PlatformBadge row={row} />,
      width: "110px",
      center: true,
    },
    {
      name: "Created",
      cell: (row) => {
        const parts = (row.created_at || "").split(" | ");
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
              {parts[0] || "—"}
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              {parts[1] || ""}
            </span>
          </div>
        );
      },
      minWidth: "140px",
      sortable: true,
      selector: (row) => row.created_at,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setDetailModal(row)}
            style={actionBtn("#eff6ff", "#2563eb")}
            title="View Details"
          >
            <FiEye size={14} />
          </button>
          <button
            onClick={() => setDeleteModal(row)}
            style={actionBtn("#fff1f2", "#e11d48")}
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ),
      width: "100px",
      center: true,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .ml-root * { font-family: 'Plus Jakarta Sans', sans-serif !important; box-sizing: border-box; }
        .ml-root { background: #f1f5f9; min-height: 100vh; padding: 24px; }
        @media (max-width: 640px) { .ml-root { padding: 12px; } .stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        .stat-card { background:#fff; border-radius:14px; padding:16px 18px; display:flex; flex-direction:column; gap:4px; box-shadow:0 1px 3px rgba(0,0,0,0.06); border:1px solid #e2e8f0; transition:transform 0.15s, box-shadow 0.15s; }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
        .filter-btn { padding:6px 14px; border-radius:8px; font-size:12px; font-weight:600; border:1.5px solid #e2e8f0; cursor:pointer; transition:all 0.15s; background:#fff; color:#64748b; font-family:'Plus Jakarta Sans',sans-serif; }
        .filter-btn.active { background:#0f172a; color:#fff; border-color:#0f172a; }
        .filter-btn:hover:not(.active) { background:#f8fafc; border-color:#cbd5e1; }
        .search-box { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #e2e8f0; border-radius:10px; padding:0 14px; height:40px; transition:border 0.15s; flex:1; max-width:320px; }
        .search-box:focus-within { border-color:#94a3b8; }
        .search-box input { border:none; outline:none; background:transparent; font-size:13px; color:#1e293b; width:100%; font-family:'Plus Jakarta Sans',sans-serif; }
        .search-box input::placeholder { color:#cbd5e1; }
        .modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.55); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:100; padding:16px; }
        .modal-box { background:#fff; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,0.18); width:100%; max-width:620px; overflow:hidden; }
        .field-table { width:100%; border-collapse:collapse; }
        .field-table th { background:#f8fafc; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; font-size:10px; padding:10px 16px; text-align:left; }
        .field-table td { padding:10px 16px; font-size:12px; border-bottom:1px solid #f1f5f9; color:#1e293b; }
        .field-table tr:last-child td { border-bottom:none; }
        .field-table tr:nth-child(even) td { background:#f8fafc; }
        .field-table td:first-child { color:#64748b; font-weight:500; width:45%; }
        .field-table td:last-child { font-weight:700; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .refresh-icon-spinning { animation: spin 1s linear infinite; }
      `}</style>

      <div className="ml-root">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Meta Leads
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>
              {filtered.length} of {datas.length} leads
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <FiRefreshCw
              size={14}
              className={loading ? "refresh-icon-spinning" : ""}
            />{" "}
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Total Leads",
              value: stats.total,
              color: "#6366f1",
              bg: "#eef2ff",
            },
            {
              label: "Organic",
              value: stats.organic,
              color: "#16a34a",
              bg: "#dcfce7",
            },
            {
              label: "Instagram",
              value: stats.ig,
              color: "#c026d3",
              bg: "#fdf4ff",
            },
            {
              label: "Facebook",
              value: stats.fb,
              color: "#2563eb",
              bg: "#eff6ff",
            },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                <FiUsers size={15} color={s.color} />
              </div>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div className="search-box">
              <CiSearch size={16} color="#94a3b8" />
              <input
                placeholder="Search by name, phone, city…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <FiFilter size={13} color="#94a3b8" />
              {[
                { key: "all", label: "All" },
                { key: "organic", label: "Organic" },
                { key: "ig", label: "Instagram" },
                { key: "fb", label: "Facebook" },
              ].map((p) => (
                <button
                  key={p.key}
                  className={`filter-btn${platformFilter === p.key ? " active" : ""}`}
                  onClick={() => setPlatformFilter(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            progressPending={loading}
            progressComponent={<LoadingSpinner />}
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[10, 20, 50, 100]}
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 380px)"
            highlightOnHover
            responsive
            customStyles={tableStyles}
            noDataComponent={<EmptyState />}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setDetailModal(null)}
        >
          <div className="modal-box">
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {(() => {
                  const [bg, fg] = getAvatarColor(detailModal.full_name || "");
                  return (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: bg,
                        color: fg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 15,
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      {avatar(detailModal.full_name || "") || "?"}
                    </div>
                  );
                })()}
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {detailModal.full_name || "Unknown"}
                  </h3>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    ID: {detailModal.lead_id || detailModal.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDetailModal(null)}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            <div
              style={{
                padding: "20px 24px",
                maxHeight: "65vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {[
                  ["Phone", detailModal.phone_number],
                  ["Email", detailModal.email],
                  ["City", detailModal.city],
                  [
                    "Platform",
                    detailModal.platform?.toUpperCase() ||
                      (detailModal.is_organic ? "Organic" : "—"),
                  ],
                  ["Campaign", detailModal.campaign_name || "—"],
                  ["Ad Set", detailModal.adset_name || "—"],
                  ["Created", detailModal.created_at],
                  ["Property ID", detailModal.property_id || "—"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      background: "#f8fafc",
                      borderRadius: 10,
                      padding: "10px 14px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 3,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      {value || "—"}
                    </div>
                  </div>
                ))}
              </div>

              {(() => {
                const fields = parseFields(detailModal);
                if (!fields.length) return null;
                return (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 3,
                          height: 16,
                          background: "#6366f1",
                          borderRadius: 99,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        Form Responses
                      </span>
                    </div>
                    <div
                      style={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                      }}
                    >
                      <table className="field-table">
                        <thead>
                          <tr>
                            <th>Field</th>
                            <th>Response</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map((f) => {
                            const val = f.values?.filter(Boolean).join(", ");
                            return (
                              <tr key={f.name}>
                                <td>{fmt(f.name)}</td>
                                <td>
                                  {val ? (
                                    fmtVal(val)
                                  ) : (
                                    <span style={{ color: "#cbd5e1" }}>—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>

            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                onClick={() => {
                  setDeleteModal(detailModal);
                  setDetailModal(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  background: "#fff1f2",
                  color: "#e11d48",
                  border: "1.5px solid #fecdd3",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <FiTrash2 size={14} /> Delete
              </button>
              <button
                onClick={() => setDetailModal(null)}
                style={{
                  padding: "9px 20px",
                  background: "#0f172a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div style={{ padding: "24px 24px 20px" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "#fff1f2",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <FiTrash2 size={22} color="#e11d48" />
              </div>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Delete Lead
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#64748b",
                  lineHeight: 1.6,
                }}
              >
                Are you sure you want to delete{" "}
                <strong style={{ color: "#0f172a" }}>
                  {deleteModal.full_name || "this lead"}
                </strong>
                ? This action cannot be undone.
              </p>
            </div>
            <div
              style={{
                padding: "0 24px 24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() => setDeleteModal(null)}
                style={{
                  padding: "9px 20px",
                  background: "#f8fafc",
                  color: "#475569",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "9px 20px",
                  background: "#e11d48",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
