/**
 * FormUI.jsx  — shared primitives for the property form
 * Theme: green-700 (#076300) + faint green-50/green-100 tints
 */

import React from "react";

/* ─── Section header ─────────────────────────────────────────── */
export function SectionHeader({ title, subtitle }) {
  return (
    <div className="pt-5 pb-3">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

/* ─── Field label ─────────────────────────────────────────────── */
export function FieldLabel({ children, required, active }) {
  return (
    <label
      className={`block text-sm font-semibold mb-2 transition-colors ${
        active ? "text-[#076300]" : "text-gray-700"
      }`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

/* ─── Text / number input with optional left icon ─────────────── */
export function FieldInput({
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  min,
  step,
  required,
  pattern,
  maxLength,
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
      {icon && (
        <span className="flex items-center justify-center w-11 shrink-0 self-stretch text-[#076300] border-r border-gray-100 bg-green-50 text-sm font-semibold select-none">
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        required={required}
        pattern={pattern}
        maxLength={maxLength}
        className="flex-1 px-4 py-3 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-300 min-w-0"
      />
    </div>
  );
}

/* ─── Textarea ─────────────────────────────────────────────────── */
export function FieldTextarea({ placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white outline-none placeholder:text-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none"
    />
  );
}

/* ─── Native select styled to match ───────────────────────────── */
export function FieldSelect({ icon, value, onChange, children, required }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
      {icon && (
        <span className="flex items-center justify-center w-11 shrink-0 self-stretch text-[#076300] border-r border-gray-100 bg-green-50 text-sm font-semibold select-none">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="flex-1 px-4 py-3 text-sm text-gray-900 bg-transparent outline-none appearance-none cursor-pointer"
        style={{ backgroundImage: "none" }}
      >
        {children}
      </select>
      <span className="pr-3 text-gray-400 pointer-events-none text-xs select-none">
        ▾
      </span>
    </div>
  );
}

/** The options plus any stored value that is not one of them (older listings), so it stays visible and can be changed. */
function withStored(options, stored) {
  const list = Array.isArray(stored) ? stored : stored ? [stored] : [];
  const known = new Set(options.map((o) => (typeof o === "string" ? o : o.value)));
  const extra = list.filter((v) => typeof v === "string" && v.trim() !== "" && !known.has(v));
  return extra.length ? [...options, ...extra] : options;
}

/* ─── Pill button selector (single) ───────────────────────────── */
export function PillSelect({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {withStored(options, value).map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const active = value === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(active ? "" : val)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              active
                ? "bg-[#076300] text-white border-[#076300] shadow-sm shadow-green-200"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-[#076300] hover:bg-green-50"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Pill button selector (multi) ────────────────────────────── */
export function PillMultiSelect({ options, value = [], onChange }) {
  const toggle = (val) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {withStored(options, value).map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const active = value.includes(val);
        return (
          <button
            key={val}
            type="button"
            onClick={() => toggle(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              active
                ? "bg-[#076300] text-white border-[#076300] shadow-sm shadow-green-200"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-[#076300] hover:bg-green-50"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Divider ──────────────────────────────────────────────────── */
export function Divider() {
  return <hr className="my-3 sm:my-5 border-gray-100" />;
}

/* ─── 2-col grid wrapper ───────────────────────────────────────── */
export function Grid2({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  );
}

/* ─── 3-col grid wrapper ───────────────────────────────────────── */
export function Grid3({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}