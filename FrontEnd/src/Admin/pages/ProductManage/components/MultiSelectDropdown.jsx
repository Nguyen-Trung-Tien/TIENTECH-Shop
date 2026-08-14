import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

const getItemValue = (opt) => {
  if (typeof opt === "object" && opt !== null) {
    return opt.id !== undefined ? opt.id : opt.value !== undefined ? opt.value : opt;
  }
  return opt;
};

const getItemLabel = (opt) => {
  if (typeof opt === "object" && opt !== null) {
    return opt.name || opt.value || opt.label || String(opt.id || "");
  }
  return String(opt);
};

const MultiSelectDropdown = React.memo(({ label, options = [], selected = [], onToggle, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 min-w-[150px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-10 w-full px-3.5 rounded-2xl flex items-center justify-between bg-white dark:bg-dark-bg border font-bold text-[11px] transition-all cursor-pointer ${
          safeSelected.length > 0
            ? "border-indigo-500 ring-2 ring-indigo-500/10 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20"
            : "border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-text-secondary hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <span className="truncate flex items-center gap-2 pr-1">
          {icon}
          <span className="truncate">
            {safeSelected.length > 0 ? `${label} (${safeSelected.length})` : label}
          </span>
        </span>
        <FiChevronDown
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 p-2 bg-white dark:bg-dark-surface border border-slate-200/90 dark:border-dark-border rounded-2xl shadow-xl shadow-slate-300/40 dark:shadow-none z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
          {safeOptions.length === 0 ? (
            <div className="p-3 text-center text-xs font-medium text-slate-400">
              Không có tùy chọn
            </div>
          ) : (
            safeOptions.map((opt, idx) => {
              const val = getItemValue(opt);
              const itemLabel = getItemLabel(opt);
              const isChecked = safeSelected.includes(val) || safeSelected.map(String).includes(String(val));

              return (
                <label
                  key={val || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-dark-bg rounded-xl cursor-pointer group transition-colors"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggle(val)}
                      className="form-checkbox size-4 text-indigo-600 rounded border-slate-300 dark:border-dark-border dark:bg-dark-bg cursor-pointer"
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold truncate ${
                      isChecked
                        ? "text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-slate-700 dark:text-dark-text-primary group-hover:text-slate-900 dark:group-hover:text-white"
                    }`}
                  >
                    {itemLabel}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

export default MultiSelectDropdown;
