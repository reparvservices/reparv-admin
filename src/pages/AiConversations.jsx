import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { FiExternalLink, FiMessageSquare, FiUser } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

const parseMysqlDateTime = (s) => {
  if (!s) return null;
  const d = new Date(String(s).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

const fmtTime = (value) => {
  if (!value) return "";
  const ts =
    typeof value === "string" && value.includes("T")
      ? new Date(value).getTime()
      : parseMysqlDateTime(value);
  if (!ts) return "";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
};

const fmtDate = (mysqlDt) => {
  const ts = parseMysqlDateTime(mysqlDt);
  if (!ts) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(ts));
};

const scoreBadgeClass = (score) => {
  if (score === "hot") return "bg-red-100 text-red-800";
  if (score === "warm") return "bg-amber-100 text-amber-800";
  if (score === "cold") return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-600";
};

const PREF_LABELS = {
  budget: "Budget",
  city: "City",
  propertyType: "Property type",
  leadScore: "Lead score",
  sessionMode: "Session",
};

function PropertyCards({ properties, align = "start" }) {
  if (!properties?.length) return null;

  return (
    <div
      className={`mt-2 flex w-full max-w-full flex-wrap gap-2 ${
        align === "end" ? "justify-end" : "justify-start"
      }`}
    >
      {properties.map((p, idx) => {
        const key = p.propertyId || p.seoSlug || `${p.projectName}-${idx}`;
        const CardTag = p.url ? "a" : "div";
        return (
          <CardTag
            key={key}
            href={p.url || undefined}
            target={p.url ? "_blank" : undefined}
            rel={p.url ? "noopener noreferrer" : undefined}
            className="flex w-[min(100%,220px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="h-[72px] w-[72px] shrink-0 bg-gray-100">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.projectName || "Property"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 p-2">
              <div className="truncate text-xs font-bold text-gray-900">
                {p.projectName || "Property"}
              </div>
              {p.location && (
                <div className="truncate text-[10px] text-gray-500">{p.location}</div>
              )}
              {p.bedrooms && (
                <div className="truncate text-[10px] text-gray-500">{p.bedrooms}</div>
              )}
              <div className="mt-0.5 text-[11px] font-bold text-indigo-700">
                {p.price || "Price on request"}
              </div>
            </div>
            {p.url && (
              <div className="flex items-center pr-2 text-indigo-500">
                <FiExternalLink size={12} />
              </div>
            )}
          </CardTag>
        );
      })}
    </div>
  );
}

export default function AiConversations() {
  const { URI, setLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(true);
  const messagesScrollRef = useRef(null);
  const listScrollRef = useRef(null);

  const fetchConversations = async () => {
    try {
      setLoading?.(true);
      setError("");
      const res = await fetch(`${URI}/admin/ai-agent/conversations`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch");
      setConversations(data?.conversations || []);
    } catch (e) {
      setError(e.message || "Failed to load conversations");
      setConversations([]);
    } finally {
      setLoading?.(false);
    }
  };

  const fetchDetail = async (userId) => {
    if (!userId) return;
    try {
      setLoadingDetail(true);
      setError("");
      const encoded = encodeURIComponent(userId);
      const res = await fetch(`${URI}/admin/ai-agent/conversations/${encoded}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load");
      setDetail(data.conversation);
    } catch (e) {
      setError(e.message || "Failed to load conversation");
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      setMobileListOpen(false);
      fetchDetail(selectedUserId);
    } else {
      setDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  useEffect(() => {
    const container = messagesScrollRef.current;
    if (!container || loadingDetail) return;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [detail, loadingDetail]);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const hay = [c.display_name, c.phone_e164, c.user_id, c.last_message]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, search]);

  const selectedMeta = useMemo(
    () => conversations.find((c) => c.user_id === selectedUserId) || null,
    [conversations, selectedUserId],
  );

  const prefs = detail?.preferences || {};
  const profile = detail?.lead_profile;

  const prefEntries = useMemo(
    () =>
      Object.entries(PREF_LABELS)
        .map(([key, label]) => [label, prefs[key]])
        .filter(([, val]) => val != null && String(val).trim() !== ""),
    [prefs],
  );

  const shownProperties = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const m of detail?.chat_history || []) {
      if (!m.properties?.length) continue;
      for (const p of m.properties) {
        const key = String(p.propertyId || p.seoSlug || p.projectName || "");
        if (!key || seen.has(key)) continue;
        seen.add(key);
        list.push(p);
      }
    }
    return list;
  }, [detail]);

  return (
    <div className="flex h-[calc(100dvh-64px)] min-h-0 flex-col overflow-hidden bg-[#f0f2f5] md:h-[calc(100dvh-72px)] md:-mb-4">
      {error && (
        <div className="shrink-0 px-2 pt-2 md:px-0">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-gray-200 bg-white shadow-sm md:rounded-2xl md:border">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          {/* Left: conversation list */}
          <div
            className={`flex min-h-0 w-full shrink-0 flex-col border-gray-200 md:w-[340px] md:border-r ${
              mobileListOpen ? "flex" : "hidden md:flex"
            } ${selectedUserId && !mobileListOpen ? "hidden md:flex" : ""}`}
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white p-4">
              <HiOutlineSparkles className="text-indigo-600" size={24} />
              <div>
                <div className="text-base font-semibold leading-tight text-gray-900">
                  AI Conversations
                </div>
                <div className="text-xs text-gray-500">
                  Read-only chat history from AI Advisor
                </div>
              </div>
            </div>

            <div className="shrink-0 border-b border-gray-200 p-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="Search by name, phone, session..."
              />
            </div>

            <div
              ref={listScrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
            >
              {filteredConversations.length === 0 && (
                <div className="px-3 py-10 text-center text-sm text-gray-500">
                  No AI conversations yet.
                  <div className="mt-1 text-xs text-gray-400">
                    Conversations appear when users chat on the AI agent page.
                  </div>
                </div>
              )}

              {filteredConversations.map((c) => {
                const isActive = c.user_id === selectedUserId;
                return (
                  <button
                    key={c.user_id}
                    type="button"
                    onClick={() => setSelectedUserId(c.user_id)}
                    className={`mb-2 w-full rounded-2xl border p-3 text-left transition ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                          {(c.display_name || "A").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {c.display_name || c.user_id}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] text-gray-500">
                            {c.phone_e164 || c.user_id}
                          </div>
                        </div>
                      </div>
                      {c.lead_score && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${scoreBadgeClass(c.lead_score)}`}
                        >
                          {c.lead_score.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="truncate text-xs text-gray-700">
                        {c.last_message || "No messages"}
                      </div>
                      <div className="whitespace-nowrap text-[11px] text-gray-400">
                        {fmtTime(c.updated_at)}
                      </div>
                    </div>
                    <div className="mt-1 flex gap-2">
                      <span className="text-[10px] font-semibold uppercase text-indigo-600">
                        {c.channel || "web"}
                      </span>
                      {c.message_count > 0 && (
                        <span className="text-[10px] text-gray-400">
                          {c.message_count} msgs
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center + right */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
            {!selectedUserId ? (
              <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f8fafc] text-sm text-gray-500">
                <div className="text-center">
                  <FiMessageSquare size={40} className="mx-auto mb-2 text-gray-300" />
                  Select a conversation to view chat history
                </div>
              </div>
            ) : (
              <>
                {/* Chat thread */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f8fafc]">
                  <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {(selectedMeta?.display_name || "A").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {selectedMeta?.display_name || selectedUserId}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {selectedMeta?.phone_e164 || selectedUserId}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileListOpen(true);
                        setSelectedUserId(null);
                      }}
                      className="text-sm font-medium text-indigo-700 md:hidden"
                    >
                      Back
                    </button>
                  </div>

                  <div
                    ref={messagesScrollRef}
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
                  >
                    {loadingDetail && (
                      <div className="py-8 text-center text-sm text-gray-500">
                        Loading conversation…
                      </div>
                    )}

                    {!loadingDetail && detail?.chat_history?.length === 0 && (
                      <div className="rounded-2xl border border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
                        No messages in this conversation yet.
                      </div>
                    )}

                    {!loadingDetail &&
                      (detail?.chat_history || []).map((m) => (
                        <div key={m.id} className="mb-4">
                          <div
                            className={`flex ${
                              m.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-[18px] px-4 py-2 text-sm shadow-sm ${
                                m.role === "user"
                                  ? "bg-indigo-600 text-white"
                                  : "border border-gray-200 bg-white text-gray-900"
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">
                                {m.content}
                              </div>
                              {(m.at || m.tool_calls?.length) && (
                                <div
                                  className={`mt-1 flex flex-wrap items-center justify-end gap-2 text-[11px] ${
                                    m.role === "user"
                                      ? "text-white/80"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {m.tool_calls?.length > 0 && (
                                    <span className="rounded bg-black/5 px-1.5 py-0.5">
                                      {m.tool_calls.join(", ")}
                                    </span>
                                  )}
                                  {m.at && <span>{fmtTime(m.at)}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          {m.role === "assistant" && m.properties?.length > 0 && (
                            <div className="mt-2 flex justify-start pl-1">
                              <PropertyCards properties={m.properties} />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  <div className="shrink-0 border-t border-indigo-100 bg-indigo-50 p-3 text-center text-xs font-medium text-indigo-700">
                    Read-only — AI agent handles replies automatically
                  </div>
                </div>

                {/* Right sidebar */}
                <div className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-gray-200 bg-white md:w-[300px] md:border-l md:border-t-0">
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    <div className="border-b border-gray-200 p-4">
                      <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Preferences
                      </div>
                      {prefEntries.length > 0 ? (
                        prefEntries.map(([label, val]) => (
                          <div key={label} className="mb-2 text-sm">
                            <span className="text-gray-500">{label}: </span>
                            <span className="font-semibold text-gray-900">
                              {String(val)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400">
                          No preferences captured yet
                        </div>
                      )}
                    </div>

                    {shownProperties.length > 0 && (
                      <div className="border-b border-gray-200 p-4">
                        <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                          Properties shown ({shownProperties.length})
                        </div>
                        <div className="flex flex-col gap-2">
                          {shownProperties.map((p, idx) => {
                            const key = p.propertyId || p.seoSlug || idx;
                            const inner = (
                              <>
                                <div className="h-20 w-full overflow-hidden rounded-lg bg-gray-100">
                                  {p.imageUrl ? (
                                    <img
                                      src={p.imageUrl}
                                      alt={p.projectName || "Property"}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                      No image
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 text-sm font-bold text-gray-900">
                                  {p.projectName || "Property"}
                                </div>
                                {p.location && (
                                  <div className="text-xs text-gray-500">{p.location}</div>
                                )}
                                <div className="text-xs font-bold text-indigo-700">
                                  {p.price || "Price on request"}
                                </div>
                              </>
                            );
                            return p.url ? (
                              <a
                                key={key}
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-xl border border-gray-200 p-2 transition hover:border-indigo-300 hover:bg-indigo-50/50"
                              >
                                {inner}
                              </a>
                            ) : (
                              <div
                                key={key}
                                className="rounded-xl border border-gray-200 p-2"
                              >
                                {inner}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {profile && (
                      <div className="border-b border-gray-200 p-4">
                        <div className="mb-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                          <FiUser size={12} />
                          Lead Profile
                        </div>
                        {profile.lead_score && (
                          <span
                            className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${scoreBadgeClass(profile.lead_score)}`}
                          >
                            {profile.lead_score.toUpperCase()}
                          </span>
                        )}
                        {[
                          ["Name", profile.name],
                          ["Phone", profile.phone],
                          ["City", profile.city],
                          ["Timeline", profile.purchase_timeline],
                          ["Status", profile.lead_status],
                        ].map(([label, val]) =>
                          val ? (
                            <div key={label} className="mb-1 text-sm">
                              <span className="text-gray-500">{label}: </span>
                              <span className="font-medium">{val}</span>
                            </div>
                          ) : null,
                        )}
                        <button
                          type="button"
                          onClick={() => navigate("/ai-leads")}
                          className="mt-3 w-full rounded-lg bg-indigo-50 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                        >
                          View in AI Leads
                        </button>
                      </div>
                    )}

                    {detail?.enquirer && (
                      <div className="border-b border-gray-200 p-4">
                        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                          Linked Enquirer
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          #{detail.enquirer.enquirersid} · {detail.enquirer.customer}
                          <br />
                          {detail.enquirer.contact} · {detail.enquirer.status}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate("/enquirers")}
                          className="w-full rounded-lg bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                        >
                          Open Enquirers (AI Agent)
                        </button>
                      </div>
                    )}

                    {detail?.created_at && (
                      <div className="p-4 text-xs text-gray-400">
                        Started {fmtDate(detail.created_at)}
                        <br />
                        Updated {fmtDate(detail.updated_at)}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
