import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/auth";
import Select from "react-select";
import { FaWhatsapp } from "react-icons/fa";

const AdvisorWhatsApp = () => {
  const { URI, setLoading } = useAuth();
  const [salespeople, setSalespeople] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const fetchSalespeople = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${URI}/admin/whatsapp-advisor/salespersons`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load sales partners");
      const data = await res.json();
      setSalespeople(data);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (salespersonsid) => {
    if (!salespersonsid) return;
    setError("");
    try {
      setLoading(true);
      const res = await fetch(
        `${URI}/admin/whatsapp-advisor/messages?salespersonsid=${salespersonsid}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load messages");
      setThread(data);
    } catch (e) {
      console.error(e);
      setError(e.message);
      setThread(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalespeople();
  }, []);

  useEffect(() => {
    if (selected?.value) loadThread(selected.value);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!selected?.value || !draft.trim()) return;
    setError("");
    try {
      setLoading(true);
      const res = await fetch(`${URI}/admin/whatsapp-advisor/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salespersonsid: selected.value,
          text: draft.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail =
          typeof data.details === "object"
            ? JSON.stringify(data.details)
            : data.details || data.message;
        throw new Error(detail || "Send failed");
      }
      setDraft("");
      await loadThread(selected.value);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const options = salespeople.map((s) => ({
    value: s.salespersonsid,
    label: `${s.fullname} — ${s.contact}`,
  }));

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FaWhatsapp className="text-green-600" size={28} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Advisor WhatsApp (Sales partners)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Chat uses WhatsApp Cloud API. Replies appear here after the webhook
              is configured. Free-form messages work within the customer service
              window (typically 24 hours after they message you).
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select sales partner
          </label>
          <Select
            options={options}
            value={selected}
            onChange={setSelected}
            placeholder="Choose name / phone…"
            className="text-sm"
            isClearable
          />

          {error && (
            <p className="mt-3 text-sm text-red-600 whitespace-pre-wrap">
              {error}
            </p>
          )}

          {thread?.warning && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {thread.warning}
            </p>
          )}

          {thread && (
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium text-gray-800">
                  {thread.fullname}
                </span>{" "}
                · {thread.phone_e164}
              </div>
              <div className="border border-gray-200 rounded-lg bg-gray-50 h-[420px] overflow-y-auto p-4 flex flex-col gap-3">
                {(thread.messages || []).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No messages stored yet. After registration, the welcome
                    template is sent if configured. Inbound messages appear
                    once the webhook is live.
                  </p>
                )}
                {(thread.messages || []).map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.direction === "outbound" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        m.direction === "outbound"
                          ? "bg-green-600 text-white rounded-br-md"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {m.body}
                      </div>
                      <div
                        className={`text-[10px] mt-1 opacity-80 ${
                          m.direction === "outbound"
                            ? "text-green-100"
                            : "text-gray-500"
                        }`}
                      >
                        {m.direction === "inbound" ? "Inbound" : "Outbound"} ·{" "}
                        {m.created_at}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="mt-4 flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Type a reply (session window only)…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!selected?.value || !draft.trim()}
                  className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorWhatsApp;
