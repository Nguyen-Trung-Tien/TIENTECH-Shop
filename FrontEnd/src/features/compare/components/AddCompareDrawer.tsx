import React, { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { searchCompareProductsApi } from "../compareApi";
import type { CompareTrayItem } from "../types";
import { formatCurrency } from "../../../utils/format";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";

interface AddCompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  existingIds: number[];
  maxReached: boolean;
  onSelectProduct: (item: CompareTrayItem) => void;
}

const AddCompareDrawer: React.FC<AddCompareDrawerProps> = ({
  isOpen,
  onClose,
  existingIds,
  maxReached,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<CompareTrayItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const list = await searchCompareProductsApi(searchTerm);
        if (active) setResults(list);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  const existingSet = new Set(existingIds.map((id) => Number(id)));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Thêm sản phẩm vào so sánh"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-white dark:bg-dark-surface border-l border-slate-200 dark:border-dark-border shadow-2xl flex flex-col"
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-dark-border flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              Chọn sản phẩm để so sánh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {maxReached
                ? "Đã đủ 4 sản phẩm trong bảng so sánh."
                : "Tìm kiếm theo tên thiết bị hoặc SKU."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng hộp thoại chọn sản phẩm"
            onClick={onClose}
            className="size-9 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-dark-border">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm laptop, điện thoại, tai nghe..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-sm text-slate-900 dark:text-white outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <UnifiedSpinner size="md" variant="primary" />
              <span className="text-xs text-slate-400">Đang tìm sản phẩm...</span>
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-12">
              Không tìm thấy sản phẩm phù hợp.
            </p>
          ) : (
            results.map((item) => {
              const alreadyAdded = existingSet.has(item.id);
              const disabled = alreadyAdded || maxReached;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-bg/50 min-w-0"
                >
                  <img
                    src={item.image || "/images/no-image.png"}
                    alt={item.name}
                    className="size-12 rounded-xl object-contain bg-slate-50 dark:bg-slate-900 p-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white break-words [overflow-wrap:anywhere] line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs font-bold text-primary mt-0.5">
                      {formatCurrency(item.price || 0)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onSelectProduct(item);
                    }}
                    className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      alreadyAdded
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 cursor-default"
                        : maxReached
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-primary hover:bg-primary-hover text-white cursor-pointer"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{alreadyAdded ? "Đã chọn" : "Thêm"}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCompareDrawer;
