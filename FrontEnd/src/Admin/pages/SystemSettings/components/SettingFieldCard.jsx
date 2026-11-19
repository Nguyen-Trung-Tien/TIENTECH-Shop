import React from "react";
import { m as Motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import UnifiedSpinner from "../../../../components/Loading/UnifiedSpinner";
import {
  isBooleanSetting,
  isTextareaSettingKey,
  isNumericSettingKey,
} from "./settingsConstants";

const SettingFieldCard = ({
  item,
  currentValue,
  initialValue,
  savingKey,
  onFieldChange,
  onToggleSetting,
  onSaveSingle,
  onRevertSingle,
}) => {
  const isBoolean = isBooleanSetting(item, currentValue);
  const isTextarea = isTextareaSettingKey(item.key);
  const isMaintenanceKey = item.key === "MAINTENANCE_MODE";
  const isDirty = currentValue !== initialValue;
  const isRowSaving = savingKey === item.key;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-dark-surface border rounded-2xl p-5 shadow-2xs transition-all space-y-3 ${
        isMaintenanceKey && currentValue
          ? "border-rose-300 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/10"
          : isDirty
            ? "border-amber-300 dark:border-amber-800/60 bg-amber-50/10 dark:bg-amber-950/10"
            : "border-slate-200/80 dark:border-dark-border hover:border-primary/40"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-black text-primary break-all">
              {item.key}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary">
              {item.category}
            </span>
            {item.isPublic && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                Public API
              </span>
            )}
            {isDirty && !isBoolean && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Đã sửa - Chưa lưu
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 break-words [overflow-wrap:anywhere]">
            {item.description}
          </p>
        </div>

        {isBoolean && (
          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                currentValue
                  ? isMaintenanceKey
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-500 dark:bg-dark-bg dark:text-dark-text-secondary"
              }`}
            >
              {currentValue ? "Đang Bật" : "Đang Tắt"}
            </span>
            <button
              type="button"
              onClick={() => onToggleSetting(item)}
              disabled={isRowSaving}
              title="Nhấn để Bật/Tắt ngay lập tức"
              aria-label={`Bật hoặc tắt ${item.key}`}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ${
                currentValue
                  ? isMaintenanceKey
                    ? "bg-rose-600"
                    : "bg-primary"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-flex items-center justify-center size-6 rounded-full bg-white shadow-md transform transition duration-300 ${
                  currentValue ? "translate-x-7" : "translate-x-0"
                }`}
              >
                {isRowSaving && <UnifiedSpinner size="xs" variant="primary" />}
              </span>
            </button>
          </div>
        )}
      </div>

      {!isBoolean && (
        <div className="pt-1 space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {isTextarea ? (
              <textarea
                rows={3}
                value={currentValue}
                onChange={(e) => onFieldChange(item.key, e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
              />
            ) : (
              <input
                type={isNumericSettingKey(item.key) ? "number" : "text"}
                value={currentValue}
                onChange={(e) => onFieldChange(item.key, e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            )}

            {isDirty && (
              <div className="flex items-center justify-end gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onSaveSingle(item)}
                  disabled={isRowSaving}
                  title="Lưu thay đổi này ngay"
                  className="h-10 px-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isRowSaving ? (
                    <UnifiedSpinner size="xs" variant="white" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  <span>Lưu</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRevertSingle(item.key)}
                  disabled={isRowSaving}
                  title="Hoàn tác"
                  aria-label={`Hoàn tác ${item.key}`}
                  className="size-10 rounded-xl bg-slate-100 dark:bg-dark-bg hover:bg-slate-200 dark:hover:bg-dark-border text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {(item.key.includes("FEE") || item.key.includes("MIN_ORDER")) &&
            !isNaN(currentValue) &&
            currentValue !== "" && (
              <p className="text-[11px] font-bold text-primary dark:text-primary-light">
                👉 Quy đổi: {(Number(currentValue) || 0).toLocaleString("vi-VN")} ₫
              </p>
            )}
        </div>
      )}
    </Motion.div>
  );
};

export default SettingFieldCard;
