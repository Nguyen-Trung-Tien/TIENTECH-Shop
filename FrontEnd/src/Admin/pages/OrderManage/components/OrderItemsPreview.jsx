import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiX } from "react-icons/fi";

const OrderItemsPreview = ({ items, formatCurrency }) => {
  const [showPopover, setShowPopover] = useState(false);

  if (!items || items.length === 0) {
    return (
      <span className="text-slate-400 text-xs font-medium">
        Không có sản phẩm
      </span>
    );
  }

  const firstItem = items[0];
  const remainingCount = items.length - 1;

  return (
    <div className="relative min-w-[200px] max-w-[260px]">
      <div className="flex items-center gap-2.5 p-1.5 bg-slate-50/80 dark:bg-dark-bg/60 rounded-xl border border-slate-100 dark:border-dark-border/80">
        <div className="size-9 rounded-lg bg-white dark:bg-dark-surface p-0.5 border border-slate-200/80 dark:border-dark-border shrink-0 overflow-hidden">
          <img
            src={firstItem.image}
            alt={firstItem.productName}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight"
            title={firstItem.productName}
          >
            {firstItem.productName}
          </p>
          <p className="text-[10px] font-medium text-slate-400 dark:text-dark-text-secondary mt-0.5">
            SL:{" "}
            <span className="font-black text-primary">
              x{firstItem.quantity}
            </span>{" "}
            • {formatCurrency(firstItem.price)}
          </p>
        </div>
      </div>

      {remainingCount > 0 && (
        <div className="mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPopover(!showPopover);
            }}
            className="w-full px-2.5 py-1 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-[10px] font-bold flex items-center justify-between transition-all cursor-pointer border border-primary/20"
          >
            <span>+ {remainingCount} sản phẩm khác</span>
            <span className="text-[9px] underline flex items-center gap-0.5">
              Xem tất cả <FiChevronDown />
            </span>
          </button>

          <AnimatePresence>
            {showPopover && (
              <Motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute left-0 top-full mt-1.5 w-72 bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-border p-3 z-50 space-y-2 max-h-64 overflow-y-auto custom-scrollbar text-left"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-dark-border text-[10px] font-black uppercase text-slate-400">
                  <span>Tất cả sản phẩm ({items.length})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPopover(false);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <FiX size={14} />
                  </button>
                </div>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-1.5 bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-100 dark:border-dark-border"
                  >
                    <div className="size-8 rounded-lg bg-white dark:bg-dark-surface p-0.5 border border-slate-200 dark:border-dark-border shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        SL:{" "}
                        <span className="font-bold text-primary">
                          x{item.quantity}
                        </span>{" "}
                        • {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default OrderItemsPreview;
