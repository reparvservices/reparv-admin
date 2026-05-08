import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";

const AppDialogContext = createContext(null);

const defaultAlertTitle = (variant) => {
  switch (variant) {
    case "success":
      return "Success";
    case "error":
      return "Error";
    case "warning":
      return "Warning";
    default:
      return "Notice";
  }
};

const variantBar = {
  success: "border-emerald-500 bg-emerald-50/50",
  error: "border-red-500 bg-red-50/50",
  warning: "border-amber-500 bg-amber-50/50",
  info: "border-blue-500 bg-blue-50/40",
};

function AlertOverlay({ title, message, variant, onClose }) {
  const bar = variantBar[variant] || variantBar.info;
  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px]">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-alert-title"
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className={`border-l-4 ${bar} px-5 py-4`}>
          <div className="flex items-start justify-between gap-3">
            <h2
              id="app-alert-title"
              className="text-base font-semibold text-gray-900"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/80"
              aria-label="Close"
            >
              <IoMdClose size={20} />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
        <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-[#076300] hover:bg-[#065000] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmOverlay({
  title,
  message,
  confirmText,
  cancelText,
  danger,
  onResult,
}) {
  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px]">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-confirm-title"
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <h2
            id="app-confirm-title"
            className="text-base font-semibold text-gray-900"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
        <div className="px-5 py-3 bg-gray-50/80 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onResult(false)}
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-white transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => onResult(true)}
            className={`px-4 py-2.5 text-sm font-medium rounded-xl text-white transition-colors ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#076300] hover:bg-[#065000]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppDialogProvider({ children }) {
  const [alertState, setAlertState] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const showAlert = useCallback((message, options = {}) => {
    const variant = options.variant ?? "info";
    return new Promise((resolve) => {
      setAlertState({
        message: String(message ?? ""),
        title: options.title ?? defaultAlertTitle(variant),
        variant,
        onClose: () => {
          setAlertState(null);
          resolve();
        },
      });
    });
  }, []);

  const showConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        message: String(message ?? ""),
        title: options.title ?? "Confirm",
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText ?? "Cancel",
        danger: Boolean(options.danger),
        onResult: (ok) => {
          setConfirmState(null);
          resolve(ok);
        },
      });
    });
  }, []);

  return (
    <AppDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {typeof document !== "undefined" &&
        alertState &&
        createPortal(
          <AlertOverlay
            title={alertState.title}
            message={alertState.message}
            variant={alertState.variant}
            onClose={alertState.onClose}
          />,
          document.body,
        )}
      {typeof document !== "undefined" &&
        confirmState &&
        createPortal(
          <ConfirmOverlay
            title={confirmState.title}
            message={confirmState.message}
            confirmText={confirmState.confirmText}
            cancelText={confirmState.cancelText}
            danger={confirmState.danger}
            onResult={confirmState.onResult}
          />,
          document.body,
        )}
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const ctx = useContext(AppDialogContext);
  if (!ctx) {
    throw new Error("useAppDialog must be used within AppDialogProvider");
  }
  return ctx;
}
