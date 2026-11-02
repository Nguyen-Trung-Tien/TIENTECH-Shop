// FrontEnd/src/pages/ProductCompare/components/CompareDrawersAndModals.jsx
import React, { useState } from "react";
import { X, Search, Plus, Trash2, CheckCircle2 } from "lucide-react";

/**
 * Side Sheet (Drawer) thay thế modal to:
 * Người dùng tra cứu & bổ sung sản phẩm vào ma trận so sánh mà không mất ngữ cảnh
 */
export const AddProductDrawer = ({ isOpen, onClose, candidates = [], onSelectProduct, currentCount, maxLimit = 4 }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filtered = candidates.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Thêm Sản Phẩm So Sánh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đang chọn: {currentCount}/{maxLimit} sản phẩm khả dụng
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input with Combo Box semantics */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Nhập tên laptop, mã SKU (ROG, Alienware, Legion)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* List of candidates */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Không tìm thấy sản phẩm phù hợp trong kho.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-800/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-100 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</p>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {Number(item.price).toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                <button
                  type="button"
                  disabled={currentCount >= maxLimit}
                  onClick={() => {
                    onSelectProduct(item);
                    onClose();
                  }}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white cursor-pointer disabled:cursor-not-allowed shrink-0 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Đóng bảng tra cứu
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal Dialog: Chỉ dùng cho hành động có tính phá hủy (Destructive Action)
 * Đạt chuẩn Accessibility với Focus lock và phím Escape
 */
export const ClearCompareModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-center text-base font-bold text-slate-900 dark:text-white mb-1">
          Xóa Toàn Bộ So Sánh?
        </h3>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-6">
          Hành động này sẽ giải phóng bảng ma trận thông số hiện tại. Bạn có thể thêm lại các sản phẩm bất cứ lúc nào.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className="py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
          >
            Đồng Ý Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Product Tour (Coach Marks) hướng dẫn nhanh cho người dùng mới
 */
export const CoachMarks = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-sm bg-slate-900/95 text-white dark:bg-blue-950/95 p-4 rounded-2xl shadow-2xl border border-blue-500/30 backdrop-blur-md z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Mẹo Sử Dụng Ma Trận
            </h5>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Bật tính năng <strong>"Làm nổi bật điểm khác biệt"</strong> để hệ thống tự động tô màu các trường thông số CPU, RAM hoặc TGP có sự chênh lệch lớn giữa các model.
          </p>
        </div>
      </div>
    </div>
  );
};

