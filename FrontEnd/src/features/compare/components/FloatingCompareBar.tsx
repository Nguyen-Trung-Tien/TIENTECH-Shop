import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftRight, Trash2, X } from "lucide-react";
import {
  clearCompare,
  MAX_COMPARE_ITEMS,
  removeFromCompare,
  selectCompareItems,
} from "../compareSlice";
import { formatCurrency } from "../../../utils/format";

const FloatingCompareBar: React.FC = () => {
  const items = useSelector(selectCompareItems);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenPathPrefixes = ["/compare", "/checkout", "/admin"];
  const isHiddenRoute = hiddenPathPrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  if (items.length === 0 || isHiddenRoute) {
    return null;
  }

  const handleOpenCompare = () => {
    const idsParam = items.map((item) => item.id).join(",");
    navigate(`/compare?ids=${idsParam}`);
  };

  return (
    <div
      role="region"
      aria-label="Khay so sánh sản phẩm"
      className="fixed inset-x-3 bottom-20 lg:bottom-4 z-40 max-w-5xl mx-auto pointer-events-auto"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0 min-w-0 flex-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl px-2.5 py-1.5 min-w-[165px] max-w-[210px] shrink-0"
            >
              <img
                src={item.image || "/images/no-image.png"}
                alt={item.name}
                className="size-9 rounded-lg object-contain bg-white p-0.5 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-[10px] font-semibold text-primary truncate">
                  {formatCurrency(item.price || 0)}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Xóa ${item.name} khỏi so sánh`}
                onClick={() => dispatch(removeFromCompare(item.id))}
                className="size-5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {items.length < 2 && (
            <div className="hidden sm:flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-[11px] text-slate-400 shrink-0">
              Chọn thêm tối đa {MAX_COMPARE_ITEMS - items.length} SP
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => dispatch(clearCompare())}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa hết</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCompare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black shadow-md shadow-primary/25 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>So sánh ngay ({items.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingCompareBar;
