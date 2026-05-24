import Spinner from "./Spinner";

export default function SubmitButton({
  busy = false,
  busyLabel = "Please wait…",
  children,
  className = "",
  ...props
}) {
  return (
    <button
      type="submit"
      disabled={busy || props.disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {busy ? (
        <>
          <Spinner size="sm" className="border-white/30 border-t-white" />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
