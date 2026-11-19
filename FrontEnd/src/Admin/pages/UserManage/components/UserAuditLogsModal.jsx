import React from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../components/UI";
import Modal from "../../../../components/UI/Modal";
import UnifiedSpinner from "../../../../components/Loading/UnifiedSpinner";

const UserAuditLogsModal = ({
  isOpen,
  onClose,
  selectedUserForAudit,
  auditLogs,
  auditLoading,
  auditPage,
  auditTotalPages,
  auditTotalItems,
  onPageChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock className="size-4.5" />
          </span>
          <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
            {selectedUserForAudit
              ? `Lịch sử thao tác: ${selectedUserForAudit.username}`
              : "Nhật ký quản trị tài khoản hệ thống"}
          </span>
        </span>
      }
      subtitle="Bảo đảm tính toàn vẹn và minh bạch dữ liệu"
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap w-full">
          <div className="flex items-center gap-2">
            {auditTotalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={auditPage <= 1 || auditLoading}
                  onClick={() => onPageChange(auditPage - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Trang trước"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Trang <strong className="text-slate-900 dark:text-white">{auditPage}</strong> /{" "}
                  {auditTotalPages}
                </span>
                <button
                  type="button"
                  disabled={auditPage >= auditTotalPages || auditLoading}
                  onClick={() => onPageChange(auditPage + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Trang sau"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
            {auditTotalItems > 0 && (
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                (Tổng {auditTotalItems} bản ghi)
              </span>
            )}
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {auditLoading ? (
          <div className="py-12 flex justify-center">
            <UnifiedSpinner size="md" message="Đang tải lịch sử thao tác..." />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium text-xs">
            Chưa có bản ghi nhật ký nào cho mục tiêu này.
          </div>
        ) : (
          auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-slate-50 dark:bg-dark-bg/60 rounded-xl border border-slate-200/60 dark:border-dark-border/60 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      log.action === "ACCOUNT_ACTIVATED"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                    }`}
                  >
                    {log.action === "ACCOUNT_ACTIVATED" ? "Kích hoạt" : "Vô hiệu hóa"}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Mục tiêu: {log.targetUser?.username || `ID ${log.targetUserId}`}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(log.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 break-words [overflow-wrap:anywhere]">
                <strong>Lý do:</strong> {log.reason || "Không ghi chú"}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/30 dark:border-dark-border/40">
                <span>
                  Người thực hiện:{" "}
                  <strong>{log.admin?.username || `Admin #${log.adminId}`}</strong>
                </span>
                {log.ipAddress && <span>IP: {log.ipAddress}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default UserAuditLogsModal;
