import React from "react";
import {
  Package,
  Tag,
  Shield,
  Info,
  Copy,
  Check,
  ExternalLink,
  Trash2,
} from "lucide-react";
import {
  extractVoucherCode,
  formatRelativeTimeVi,
} from "../../../utils/notificationHelpers";
import { getNotificationTypeMeta } from "./notificationBellMeta";

const TypeIcon = ({ iconType }) => {
  switch (iconType) {
    case "order":
      return <Package className="size-4" />;
    case "promotion":
      return <Tag className="size-4" />;
    case "security":
      return <Shield className="size-4" />;
    default:
      return <Info className="size-4" />;
  }
};

const NotificationItemRow = ({
  notification,
  copiedCode,
  onSelect,
  onCopyVoucher,
  onNavigateLink,
  onDelete,
}) => {
  const n = notification;
  const meta = getNotificationTypeMeta(n.type);
  const voucherCode =
    extractVoucherCode(`${n.title} ${n.message}`) || n.metadata?.voucherCode;

  return (
    <div
      onClick={() => onSelect(n)}
      className={`p-4 flex gap-3.5 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-dark-bg/60 transition-all group relative ${
        !n.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
      }`}
    >
      <div
        className={`size-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${meta.bg}`}
      >
        <TypeIcon iconType={meta.iconType} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary">
            {meta.badge}
          </span>
          <span className="text-[9px] font-bold text-slate-400">
            {formatRelativeTimeVi(n.createdAt)}
          </span>
        </div>

        <h4
          className={`text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-1 break-words [overflow-wrap:anywhere] ${
            !n.isRead ? "" : "opacity-75 font-bold"
          }`}
          title={n.title}
        >
          {n.title}
        </h4>

        <p className="text-[11px] font-medium text-slate-500 dark:text-dark-text-secondary line-clamp-2 mt-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">
          {n.message}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {voucherCode && (
            <button
              type="button"
              onClick={(e) => onCopyVoucher(e, voucherCode)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-[10px] font-black tracking-wide border border-rose-200/60 dark:border-rose-900/40 transition-colors cursor-pointer"
              title="Nhấn để sao chép mã ưu đãi"
            >
              {copiedCode === voucherCode ? (
                <Check className="size-2.5" />
              ) : (
                <Copy className="size-2.5" />
              )}
              {copiedCode === voucherCode ? "Đã chép" : `Mã: ${voucherCode}`}
            </button>
          )}

          {n.type === "order" && n.link && (
            <button
              type="button"
              onClick={(e) => onNavigateLink(e, n)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-[10px] font-black tracking-wide border border-sky-200/60 dark:border-sky-900/40 transition-colors cursor-pointer"
            >
              <Package className="size-2.5" /> Xem đơn
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(n);
            }}
            className="text-[10px] font-bold text-slate-500 dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary-light transition-colors cursor-pointer"
          >
            Xem chi tiết
          </button>

          {n.link && n.type !== "order" && (
            <button
              type="button"
              onClick={(e) => onNavigateLink(e, n)}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-primary dark:text-primary-light hover:underline cursor-pointer"
            >
              Đến trang <ExternalLink className="size-2.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end justify-between shrink-0">
        {!n.isRead ? (
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-rose-500 shadow-sm shadow-rose-500/50" />
          </span>
        ) : (
          <div className="size-2.5" />
        )}

        <button
          type="button"
          onClick={(e) => onDelete(e, n.id)}
          className="size-7 rounded-lg text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
          title="Xóa thông báo"
          aria-label="Xóa thông báo"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItemRow;
