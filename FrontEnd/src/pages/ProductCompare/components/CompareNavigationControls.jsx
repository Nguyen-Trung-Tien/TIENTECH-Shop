// FrontEnd/src/pages/ProductCompare/components/CompareNavigationControls.jsx
import React, { useState, useRef, useEffect } from "react";
import { 
  Grid, 
  Laptop, 
  Smartphone, 
  HardDrive, 
  Headphones, 
  Tag, 
  MoreVertical, 
  Share2, 
  Printer, 
  Bookmark, 
  Trash2 
} from "lucide-react";

/**
 * Waffle Menu (App Launcher) cho phép người dùng chuyển nhanh
 * giữa các phân hệ danh mục sản phẩm công nghệ của TienTech
 */
export const WaffleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const subsystems = [
    { label: "Laptop Gaming", icon: Laptop, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
    { label: "Điện Thoại & Tablet", icon: Smartphone, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "Linh Kiện PC", icon: HardDrive, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
    { label: "Phụ Kiện Gaming", icon: Headphones, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
    { label: "Bảng Giá Đại Lý", icon: Tag, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40" },
  ];

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Khám phá các phân hệ TienTech"
        aria-expanded={isOpen}
        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all cursor-pointer"
      >
        <Grid className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-2">
            Phân Hệ So Sánh Chuyên Biệt
          </div>
          <div className="grid grid-cols-2 gap-2">
            {subsystems.map((sub, idx) => {
              const Icon = sub.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer text-center"
                >
                  <div className={`p-2.5 rounded-xl ${sub.bg} ${sub.color} mb-1.5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-tight">
                    {sub.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Three Dots Overflow Menu cho từng thẻ sản phẩm trong ma trận
 */
export const ProductOverflowMenu = ({ onRemove, onShare, onPrint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Tùy chọn hành động sản phẩm"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 text-xs">
          <button
            type="button"
            onClick={() => { setIsOpen(false); onShare?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-500" /> Chia sẻ cấu hình
          </button>
          <button
            type="button"
            onClick={() => { setIsOpen(false); onPrint?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> In bảng thông số
          </button>
          <button
            type="button"
            onClick={() => { setIsOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Lưu vào wishlist
          </button>
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          <button
            type="button"
            onClick={() => { setIsOpen(false); onRemove?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa khỏi so sánh
          </button>
        </div>
      )}
    </div>
  );
};

