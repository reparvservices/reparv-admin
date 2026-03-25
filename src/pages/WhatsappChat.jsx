import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../store/auth";
import { FaWhatsapp } from "react-icons/fa";
import { MdSend } from "react-icons/md";

const WhatsappChat = () => {
  const { URI, setLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);
  const messagesScrollRef = useRef(null);
  const shouldScrollToBottomRef = useRef(false);

  const lastMessageIdRef = useRef({}); // phone -> last id in UI
  const lastReadIdRef = useRef({}); // phone -> last inbound id read when selected
  const lastOpenedAtRef = useRef({}); // phone -> Date.now() when opened
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(true);

  const parseMysqlDateTime = (s) => {
    if (!s) return null;
    // mysql DATETIME: "YYYY-MM-DD HH:mm:ss"
    const d = new Date(String(s).replace(" ", "T"));
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  };

  const fmtTime = (mysqlDt) => {
    const ts = parseMysqlDateTime(mysqlDt);
    if (!ts) return "";
    const d = new Date(ts);
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const fmtDay = (mysqlDt) => {
    const ts = parseMysqlDateTime(mysqlDt);
    if (!ts) return "";
    const d = new Date(ts);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
    }).format(d);
  };

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const phone = String(c.phone_e164 || "").toLowerCase();
      const name = String(c.customer_name || "").toLowerCase();
      return phone.includes(q) || name.includes(q);
    });
  }, [conversations, search]);

  const fetchConversations = async () => {
    try {
      setLoading?.(true);
      const res = await fetch(`${URI}/admin/whatsapp-chat/conversations`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch");
      const nextConversations = data?.conversations || [];
      setConversations(nextConversations);

      // Initialize "last opened" timestamps to current last message time,
      // so we don't show "New" for already-existing conversations on first load.
      setTimeout(() => {
        for (const c of nextConversations) {
          const phone = c.phone_e164;
          if (!phone) continue;
          if (!lastOpenedAtRef.current[phone]) {
            const at = parseMysqlDateTime(c.created_at);
            lastOpenedAtRef.current[phone] = at || Date.now();
          }
        }
      }, 0);
      if (!selectedPhone && (data?.conversations || []).length > 0) {
        setSelectedPhone((data?.conversations || [])[0]?.phone_e164 || null);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load conversations");
    } finally {
      setLoading?.(false);
    }
  };

  const fetchMessages = async (phone, { afterId = null, replace = false } = {}) => {
    if (!phone) return;

    const qs = new URLSearchParams();
    qs.set("phone", phone);
    if (afterId && Number.isFinite(afterId)) qs.set("afterId", String(afterId));

    try {
      setLoadingMessages(true);
      const res = await fetch(`${URI}/admin/whatsapp-chat/messages?${qs.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch messages");

      const incoming = data?.messages || [];
      if (replace) {
        setMessages(incoming);
      } else {
        setMessages((prev) => {
          if (!incoming.length) return prev;
          // Append only what’s newer than last id we already have
          const lastId = lastMessageIdRef.current[phone] || 0;
          const toAppend = incoming.filter((m) => m.id > lastId);
          return toAppend.length ? [...prev, ...toAppend] : prev;
        });
      }

      // Update last id marker
      const maxId =
        incoming.length > 0 ? Math.max(...incoming.map((m) => m.id)) : lastMessageIdRef.current[phone] || 0;
      if (maxId) lastMessageIdRef.current[phone] = maxId;
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPhone) return;
    setMobileListOpen(false);
    lastMessageIdRef.current[selectedPhone] = 0;
    // When user selects a conversation, consider inbound messages as read from that moment.
    lastReadIdRef.current[selectedPhone] = 0;
    lastOpenedAtRef.current[selectedPhone] = Date.now();
    shouldScrollToBottomRef.current = true;
    fetchMessages(selectedPhone, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPhone]);

  // Poll so new webhook messages appear in the UI.
  useEffect(() => {
    if (!selectedPhone) return;
    const t = setInterval(() => {
      const lastId = lastMessageIdRef.current[selectedPhone] || 0;
      fetchMessages(selectedPhone, { afterId: lastId, replace: false });
      fetchConversations();
    }, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPhone]);

  useEffect(() => {
    const container = messagesScrollRef.current;
    if (!container) return;

    // Keep the view stable: use container scrollTop, not scrollIntoView (prevents page jumps).
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    const shouldScroll = shouldScrollToBottomRef.current || nearBottom;

    if (shouldScroll) {
      shouldScrollToBottomRef.current = false;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Mark read when messages change and this conversation is active
  useEffect(() => {
    if (!selectedPhone) return;
    if (!messages.length) return;
    const inboundIds = messages.filter((m) => m.direction === "inbound").map((m) => m.id);
    const maxInboundId = inboundIds.length ? Math.max(...inboundIds) : 0;
    if (maxInboundId) lastReadIdRef.current[selectedPhone] = maxInboundId;
  }, [selectedPhone, messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!selectedPhone || !draft.trim()) return;

    const text = draft.trim();
    const tempId = `tmp_${Date.now()}`;

    try {
      setLoading?.(true);
      setError("");

      // Optimistic UI append
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          direction: "outbound",
          body: text,
          created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        },
      ]);

      // Also advance markers so polling won’t re-append duplicates
      lastMessageIdRef.current[selectedPhone] = lastMessageIdRef.current[selectedPhone] || 0;

      const res = await fetch(`${URI}/admin/whatsapp-chat/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: selectedPhone,
          text,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Send failed");

      setDraft("");
      // Refetch from start of this conversation to avoid duplicates with optimistic UI.
      await fetchMessages(selectedPhone, { replace: true });
    } catch (e2) {
      console.error(e2);
      setError(e2.message || "Send failed");
    } finally {
      setLoading?.(false);
    }
  };

  const selectedMeta = useMemo(() => {
    if (!selectedPhone) return null;
    return conversations.find((x) => x.phone_e164 === selectedPhone) || null;
  }, [conversations, selectedPhone]);

  const messageGroups = useMemo(() => {
    const groups = [];
    let lastDay = null;
    for (const m of messages) {
      const ts = parseMysqlDateTime(m.created_at);
      const dayKey = ts ? new Date(ts).toDateString() : "unknown";
      if (dayKey !== lastDay) {
        groups.push({ type: "day", key: dayKey, label: fmtDay(m.created_at) });
        lastDay = dayKey;
      }
      groups.push({ type: "msg", ...m });
    }
    return groups;
  }, [messages]);

  return (
    <div className="w-full min-h-screen bg-[#f0f2f5] p-2 md:p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-3 md:mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200 h-[calc(100vh-6rem)] min-h-[720px]">
          <div className="flex h-full flex-col md:flex-row">
            {/* Left: conversations */}
            <div
              className={`w-full md:w-[340px] border-b md:border-b-0 md:border-r border-gray-200 ${
                mobileListOpen ? "block" : "hidden md:block"
              } flex flex-col`}
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <FaWhatsapp className="text-green-600" size={24} />
                  <div>
                    <div className="text-base font-semibold text-gray-900 leading-tight">
                      WhatsApp Chat
                    </div>
                    <div className="text-xs text-gray-500">
                      Inbound messages via webhook
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 border-b border-gray-200">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Search by phone or name..."
                />
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {filteredConversations.length === 0 && !loadingMessages && (
                  <div className="text-sm text-gray-500 text-center py-10 px-3">
                    No conversations yet.
                    <div className="text-xs text-gray-400 mt-1">
                      Send a WhatsApp message to start the chat.
                    </div>
                  </div>
                )}

                {filteredConversations.map((c) => {
                  const isActive = c.phone_e164 === selectedPhone;
                  const msgAt = parseMysqlDateTime(c.created_at);
                  const lastOpened = lastOpenedAtRef.current[c.phone_e164] || 0;
                  const unread =
                    c.phone_e164 !== selectedPhone && msgAt && msgAt > lastOpened ? 1 : 0;

                  return (
                    <button
                      key={c.phone_e164}
                      type="button"
                      onClick={() => setSelectedPhone(c.phone_e164)}
                      className={`w-full text-left p-3 rounded-2xl transition mb-2 border ${
                        isActive
                          ? "border-green-500 bg-green-50"
                          : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold shrink-0">
                            {(c.customer_name || "W").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {c.customer_name || "WhatsApp User"}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                              {c.phone_e164}
                            </div>
                          </div>
                        </div>

                        {unread > 0 && (
                          <div className="min-w-[24px] text-center px-2 py-0.5 rounded-full bg-green-600 text-white text-[11px]">
                            {unread}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="text-xs text-gray-700 truncate">
                          {c.last_message || ""}
                        </div>
                        <div className="text-[11px] text-gray-400 whitespace-nowrap">
                          {fmtTime(c.created_at)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: thread */}
            <div className="flex-1 bg-[#efeae2]">
              {!selectedPhone ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  Select a conversation
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold shrink-0">
                        {(selectedMeta?.customer_name || "W").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {selectedMeta?.customer_name || "WhatsApp User"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {selectedPhone}
                        </div>
                      </div>
                    </div>

                    <div className="md:hidden">
                      <button
                        type="button"
                        onClick={() => setMobileListOpen(true)}
                        className="text-sm text-green-700 font-medium"
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  <div ref={messagesScrollRef} className="flex-1 overflow-y-auto p-4">
                    {loadingMessages && messages.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-8 bg-white rounded-2xl border border-gray-200">
                        Loading messages...
                      </div>
                    )}

                    {!loadingMessages && messages.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-8 bg-white rounded-2xl border border-gray-200">
                        No messages found for this user yet.
                      </div>
                    )}

                    {messageGroups.map((g, idx) => {
                      if (g.type === "day") {
                        return (
                          <div key={`${g.type}_${g.key}_${idx}`} className="flex justify-center my-4">
                            <div className="text-[11px] text-gray-600 bg-white/80 border border-gray-200 px-3 py-1 rounded-full">
                              {g.label}
                            </div>
                          </div>
                        );
                      }

                      const m = g;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"} mb-2`}
                        >
                          <div
                            className={`max-w-[78%] rounded-[18px] px-4 py-2 text-sm whitespace-pre-wrap break-words shadow-sm ${
                              m.direction === "outbound"
                                ? "bg-[#128C7E] text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                            }`}
                          >
                            <div>{m.body}</div>
                            <div className="text-[11px] mt-1 opacity-80 flex justify-end items-center gap-1">
                              <span className={m.direction === "outbound" ? "text-white/80" : "text-gray-500"}>
                                {fmtTime(m.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div ref={bottomRef} />
                  </div>

                  <form
                    onSubmit={send}
                    className="bg-white border-t border-gray-200 p-3 md:p-4 flex-shrink-0"
                  >
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            send(e);
                          }
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!draft.trim()}
                        className="w-[44px] h-[44px] rounded-full bg-[#128C7E] disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center hover:bg-[#0f7a6a] transition"
                      >
                        <MdSend size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsappChat;

