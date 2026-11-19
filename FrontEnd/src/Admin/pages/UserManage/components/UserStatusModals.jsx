import React from "react";
import { CheckCircle2, Ban } from "lucide-react";
import { Button } from "../../../../components/UI";
import Modal from "../../../../components/UI/Modal";

const UserStatusModals = ({
  showStatusModal,
  onCloseStatusModal,
  targetUserForStatus,
  targetNextStatus,
  statusReason,
  onStatusReasonChange,
  statusProcessing,
  onConfirmStatusChange,
  showBulkModal,
  onCloseBulkModal,
  bulkAction,
  selectedCount,
  bulkReason,
  onBulkReasonChange,
  bulkProcessing,
  onConfirmBulkAction,
}) => {
  return (
    <>
      <Modal
        isOpen={Boolean(showStatusModal && targetUserForStatus)}
        onClose={() => !statusProcessing && onCloseStatusModal()}
        size="md"
        loading={statusProcessing}
        loadingMessage="Đang cập nhật trạng thái..."
        title={
          <span className="flex items-center gap-3 min-w-0">
            <span
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                targetNextStatus === "active"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              }`}
            >
              {targetNextStatus === "active" ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Ban className="size-5" />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {targetNextStatus === "active"
                ? "Xác nhận kích hoạt tài khoản"
                : "Xác nhận vô hiệu hóa tài khoản"}
            </span>
          </span>
        }
        subtitle={
          targetUserForStatus
            ? `${targetUserForStatus.username} (${targetUserForStatus.email})`
            : ""
        }
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              disabled={statusProcessing}
              onClick={onCloseStatusModal}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant={targetNextStatus === "active" ? "success" : "danger"}
              loading={statusProcessing}
              loadingText="Đang xử lý..."
              onClick={onConfirmStatusChange}
              className="uppercase tracking-wider"
            >
              {targetNextStatus === "active" ? "Kích hoạt ngay" : "Vô hiệu hóa"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {targetNextStatus === "active"
              ? "Tài khoản sẽ được mở khóa hoặc kích hoạt ngay lập tức. Người dùng sẽ nhận được thông báo trong hệ thống."
              : "Tài khoản sẽ bị tạm ngừng hoạt động. Phiên đăng nhập hiện tại sẽ bị thu hồi ngay lập tức."}
          </p>

          <div>
            <label
              htmlFor="status-reason-input"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Lý do thực hiện (tùy chọn, lưu vào Audit Log):
            </label>
            <textarea
              id="status-reason-input"
              aria-label="Lý do kích hoạt hoặc khóa tài khoản"
              rows={2}
              value={statusReason}
              onChange={(e) => onStatusReasonChange(e.target.value)}
              placeholder="Nhập lý do kích hoạt hoặc khóa tài khoản..."
              className="tt-input w-full text-xs sm:text-sm font-medium resize-none"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showBulkModal}
        onClose={() => !bulkProcessing && onCloseBulkModal()}
        size="md"
        loading={bulkProcessing}
        loadingMessage="Đang xử lý hàng loạt..."
        title={
          <span className="flex items-center gap-3 min-w-0">
            <span
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                bulkAction === "active"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              }`}
            >
              {bulkAction === "active" ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Ban className="size-5" />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate">
              Thao tác hàng loạt ({selectedCount} tài khoản)
            </span>
          </span>
        }
        subtitle={`Hành động: ${bulkAction === "active" ? "Kích hoạt" : "Vô hiệu hóa"}`}
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              disabled={bulkProcessing}
              onClick={onCloseBulkModal}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant={bulkAction === "active" ? "success" : "danger"}
              loading={bulkProcessing}
              loadingText="Đang xử lý..."
              onClick={onConfirmBulkAction}
              className="uppercase tracking-wider"
            >
              Xác nhận xử lý
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Thao tác sẽ được áp dụng tuần tự cho từng tài khoản đã chọn. Hệ thống tự động bỏ qua tài khoản của chính bạn để bảo đảm an toàn.
          </p>

          <div>
            <label
              htmlFor="bulk-reason-input"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Lý do thao tác hàng loạt (ghi vào Audit Log):
            </label>
            <textarea
              id="bulk-reason-input"
              aria-label="Lý do thao tác hàng loạt"
              rows={2}
              value={bulkReason}
              onChange={(e) => onBulkReasonChange(e.target.value)}
              placeholder="Nhập lý do thao tác hàng loạt..."
              className="tt-input w-full text-xs sm:text-sm font-medium resize-none"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserStatusModals;
