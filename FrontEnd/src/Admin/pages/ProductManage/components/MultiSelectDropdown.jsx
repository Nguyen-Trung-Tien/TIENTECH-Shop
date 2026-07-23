import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

// UI Component cho Dropdown chọn nhiều
const MultiSelectDropdown = React.memo(({ label, options = [], selected = [], onToggle, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];

  return (
    <div className="relative flex-1 min-w-[160px]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`input-modern h-12 w-full px-4 flex items-center justify-between bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border font-bold text-[10px] uppercase tracking-widest transition-all ${
          safeSelected.length > 0
            ? "border-indigo-500 ring-1 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400"
            : "text-slate-900 dark:text-dark-text-primary"
        }`}
      >
        <span className="truncate flex items-center gap-2">
          {icon}
          {safeSelected.length > 0 ? `${label} (${safeSelected.length})` : label}
        </span>
        <FiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
            {safeOptions.map((opt) => (
              <label
                key={opt.id || opt.value}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-dark-bg rounded-xl cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={safeSelected.includes(opt.id || opt.value)}
                  onChange={() => onToggle(opt.id || opt.value)}
                  className="form-checkbox size-4 text-indigo-600 rounded border-slate-300 dark:border-dark-border dark:bg-dark-bg"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-dark-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {opt.name || opt.value}
                </span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default MultiSelectDropdown;
