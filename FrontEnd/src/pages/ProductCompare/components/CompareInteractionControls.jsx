// FrontEnd/src/pages/ProductCompare/components/CompareInteractionControls.jsx
import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, ChevronDown, FileSpreadsheet, Send, Zap } from "lucide-react";

/**
 * Combo Button: 1 hành động chính (Thêm giỏ / Mua ngay)
 * đi kèm dropdown phụ (Xuất báo giá, Gửi tư vấn chuyên gia)
 */
export const ComboButton = ({ onPrimaryAction, onExportQuote, onConsult }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative inline-flex w-full rounded-xl shadow-sm" ref={containerRef}>
      <button
        type="button"
        onClick={onPrimaryAction}
        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-l-xl transition-colors cursor-pointer min-w-0"
      >
        <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Chọn Mua Ngay</span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Tùy chọn đặt hàng mở rộng"
        aria-expanded={open}
        className="px-2 bg-blue-700 hover:bg-blue-800 text-white rounded-r-xl border-l border-blue-600/50 transition-colors cursor-pointer flex items-center justify-center"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-1 w-full min-w-[190px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 text-xs">
          <button
            type="button"
            onClick={() => { setOpen(false); onExportQuote?.(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Xuất file báo giá VAT
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onConsult?.(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-blue-500" /> Nhận tư vấn trả góp 0%
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Toggle Group (Segmented Control) cho 3 chế độ xem ma trận thông số
 */
export const SegmentedViewToggle = ({ value, onChange }) => {
  const options = [
    { id: "all", label: "Tất cả thông số" },
    { id: "diff-only", label: "Chỉ điểm khác biệt" },
    { id: "key-specs", label: "Thông số nổi bật" },
  ];

  return (
    <div className="inline-flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isActive
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Toggle Switch dùng cho Highlight Difference tức thì
 */
export const HighlightSwitch = ({ enabled, onChange, id = "highlight-diff-switch" }) => {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`} />
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? "transform translate-x-4" : ""}`} />
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <Zap className={`w-3.5 h-3.5 ${enabled ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
        Làm nổi bật điểm khác biệt
      </span>
    </label>
  );
};

