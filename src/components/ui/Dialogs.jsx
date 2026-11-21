import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

/**
 * App-wide replacement for the browser's alert / confirm / prompt.
 *
 *   alert(...)            -> a centered dialog with an OK button (installDialogs() swaps window.alert)
 *   await confirmDialog() -> a styled confirmation, resolves true / false
 *   await promptDialog()  -> a styled text prompt, resolves the text or null
 *
 * Works from anywhere (components, handlers, plain functions). Mount <DialogHost /> once.
 */

const PRIMARY = "#076300";
const PRIMARY_HOVER = "#065000";

/* ───────────────────────────── store ───────────────────────────── */

let state = { toasts: [], modal: null };
const listeners = new Set();
const modalQueue = [];
let nextId = 1;

const emit = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getState = () => state;

/* ───────────────────────────── toasts ───────────────────────────── */

const MAX_TOASTS = 4;

/** Work out how a message should look: "Error: x" / "Success: x" prefixes win, then the wording. */
export function toneFor(message) {
  const text = String(message ?? "").trim();
  const prefixed = text.match(/^(success|error|warning|info)\s*:\s*([\s\S]*)$/i);
  if (prefixed) return { tone: prefixed[1].toLowerCase(), text: prefixed[2].trim() || text };

  if (/\b(error|fail(ed|ure|s)?|could not|couldn'?t|can'?t|cannot|unable|invalid|denied|not found|wrong|blocked|refused|expired|unauthori[sz]ed|forbidden|went wrong|not allowed|already exists?|duplicate)\b/i.test(text)) {
    return { tone: "error", text };
  }
  if (/^please\b|\bmust\b|\brequired\b|\bselect\b|\benter\b|\bchoose\b|\bmax\b|\bat least\b/i.test(text)) {
    return { tone: "warning", text };
  }
  if (/\b(success(fully)?|added|updated|saved|deleted|created|sent|done|copied|approved|published|submitted|cancell?ed|activated|deactivated|removed|changed|uploaded|assigned|converted|logged|unblocked|blocked)\b/i.test(text)) {
    return { tone: "success", text };
  }
  return { tone: "info", text };
}

export function notify(message, tone) {
  const inferred = toneFor(message);
  const toast = {
    id: nextId++,
    tone: tone || inferred.tone,
    text: inferred.text || String(message ?? ""),
  };
  if (!toast.text) return;
  emit({ toasts: [...state.toasts, toast].slice(-MAX_TOASTS) });
  const lifetime = toast.tone === "error" || toast.tone === "warning" ? 6500 : 4500;
  setTimeout(() => dismissToast(toast.id), lifetime);
}

function dismissToast(id) {
  if (state.toasts.some((t) => t.id === id)) emit({ toasts: state.toasts.filter((t) => t.id !== id) });
}

/* ───────────────────────────── modals ───────────────────────────── */

function openModal(modal) {
  return new Promise((resolve) => {
    const entry = { ...modal, id: nextId++, resolve };
    if (state.modal) modalQueue.push(entry);
    else emit({ modal: entry });
  });
}

function closeModal(result) {
  const current = state.modal;
  if (!current) return;
  const next = modalQueue.shift() || null;
  emit({ modal: next });
  current.resolve(result);
}

const DANGER_WORDS = /\b(delete|remove|reject|unapprove|cancel|deactivate|discard|logout|log out|permanent|can'?t be undone|cannot be undone)\b/i;

/** await confirmDialog("Delete this?") -> true / false. Options: title, confirmText, cancelText, danger */
export function confirmDialog(message, options = {}) {
  const text = String(message ?? "");
  const danger = options.danger ?? DANGER_WORDS.test(text);
  return openModal({
    kind: "confirm",
    title: options.title ?? (danger ? "Are you sure?" : "Please confirm"),
    message: text,
    confirmText: options.confirmText ?? (danger ? "Yes, continue" : "Confirm"),
    cancelText: options.cancelText ?? "Cancel",
    danger,
  });
}

/** await promptDialog("Reason?", "") -> the text, or null if cancelled */
export function promptDialog(message, defaultValue = "", options = {}) {
  return openModal({
    kind: "prompt",
    title: options.title ?? "Enter a value",
    message: String(message ?? ""),
    defaultValue: String(defaultValue ?? ""),
    confirmText: options.confirmText ?? "OK",
    cancelText: options.cancelText ?? "Cancel",
    danger: Boolean(options.danger),
  });
}

/** A centered message dialog, tone picked from the wording. Resolves when closed. */
export function alertDialog(message, tone) {
  const { tone: inferred, text } = toneFor(message);
  const t = tone || inferred;
  return openModal({
    kind: "alert",
    tone: t,
    title: TONES[t]?.label === "Check this" ? "Please check" : TONES[t]?.label || "Notice",
    message: text || String(message ?? ""),
    confirmText: "OK",
  });
}

/** Replace the browser's alert() with a centered dialog. Call once at startup, before rendering. */
export function installDialogs() {
  if (typeof window === "undefined" || window.__dialogsInstalled) return;
  window.__dialogsInstalled = true;
  window.alert = (message) => { alertDialog(message); };
}

/* ───────────────────────────── UI ───────────────────────────── */

const TONES = {
  success: { Icon: FiCheckCircle, bar: "border-emerald-500", icon: "text-emerald-600", label: "Success" },
  error: { Icon: FiAlertCircle, bar: "border-red-500", icon: "text-red-600", label: "Error" },
  warning: { Icon: FiAlertTriangle, bar: "border-amber-500", icon: "text-amber-600", label: "Check this" },
  info: { Icon: FiInfo, bar: "border-blue-500", icon: "text-blue-600", label: "Notice" },
};

function Toast({ toast }) {
  const { Icon, bar, icon, label } = TONES[toast.tone] || TONES.info;
  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={`dlg-in pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-gray-200 border-l-4 ${bar} bg-white px-4 py-3 shadow-lg`}
    >
      <Icon size={20} className={`mt-0.5 shrink-0 ${icon}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-0.5 whitespace-pre-line break-words text-sm text-gray-800">{toast.text}</p>
      </div>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
        aria-label="Dismiss"
      >
        <FiX size={16} />
      </button>
    </div>
  );
}

function Modal({ modal }) {
  const [value, setValue] = useState(modal.defaultValue || "");
  const inputRef = useRef(null);
  const okRef = useRef(null);
  const isPrompt = modal.kind === "prompt";
  const isAlert = modal.kind === "alert";
  const tone = isAlert ? TONES[modal.tone] || TONES.info : null;

  useEffect(() => {
    (isPrompt ? inputRef.current : okRef.current)?.focus();
    if (isPrompt) inputRef.current?.select();
    const onKey = (e) => {
      if (e.key === "Escape") closeModal(isPrompt ? null : isAlert ? undefined : false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPrompt]);

  const ok = () => closeModal(isPrompt ? value : true);
  const cancel = () => closeModal(isPrompt ? null : isAlert ? undefined : false);

  const okCls = modal.danger
    ? "bg-red-600 hover:bg-red-700"
    : "";

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
      onMouseDown={(e) => e.target === e.currentTarget && cancel()}
    >
      <form
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        onSubmit={(e) => {
          e.preventDefault();
          ok();
        }}
        className="dlg-pop w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className={`px-5 py-5 ${isAlert ? "text-center" : ""}`}>
          {tone && (
            <div className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-50 ${tone.icon}`}>
              <tone.Icon size={28} />
            </div>
          )}
          <h2 id="dlg-title" className="text-base font-semibold text-gray-900">
            {modal.title}
          </h2>
          {modal.message && (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{modal.message}</p>
          )}
          {isPrompt && (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-[#076300] focus:ring-4 focus:ring-[#076300]/15"
            />
          )}
        </div>
        <div className={`flex gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-3 ${isAlert ? "justify-center" : "justify-end"}`}>
          {!isAlert && (
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white cursor-pointer"
            >
              {modal.cancelText}
            </button>
          )}
          <button
            ref={okRef}
            type="submit"
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white cursor-pointer ${okCls}`}
            style={modal.danger ? undefined : { backgroundColor: PRIMARY }}
            onMouseEnter={(e) => !modal.danger && (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
            onMouseLeave={(e) => !modal.danger && (e.currentTarget.style.backgroundColor = PRIMARY)}
          >
            {modal.confirmText}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Mount once near the app root. */
export function DialogHost() {
  const { toasts, modal } = useSyncExternalStore(subscribe, getState, getState);
  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      <style>{`
        @keyframes dlgIn { from { opacity: 0; transform: translateY(-8px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes dlgPop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
        .dlg-in { animation: dlgIn .18s ease-out; }
        .dlg-pop { animation: dlgPop .16s ease-out; }
      `}</style>
      <div className="pointer-events-none fixed right-4 top-4 z-[10060] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} />
        ))}
      </div>
      {modal && <Modal key={modal.id} modal={modal} />}
    </>,
    document.body,
  );
}
