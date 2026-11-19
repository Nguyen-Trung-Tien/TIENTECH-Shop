import React from "react";
import { createPortal } from "react-dom";
import { m as Motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { Button } from "../../UI";

const NotificationBroadcastModal = ({
  isOpen,
  onClose,
  broadcastForm,
  setBroadcastForm,
  sendingBroadcast,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md">
        <Motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-broadcast-title"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-dark-border my-auto"
        >
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Send className="size-5" />
              </div>
              <div>
                <h3
                  id="notification-broadcast-title"
                  className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight"
                >
                  Phát thông báo hệ thống
                </h3>
                <p className="text-xs text-slate-400">
                  Gửi tin nhắn thông báo đến người dùng toàn cửa hàng
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng hộp thoại phát thông báo"
              className="size-9 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="size-4.5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
                Loại thông báo *
              </label>
              <select
                value={broadcastForm.type}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, type: e.target.value })
                }
                className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="system">⚙️ Hệ thống (Bảo trì / Cập nhật)</option>
                <option value="promotion">🏷️ Khuyến mãi (Voucher / Sale)</option>
                <option value="order">📦 Đơn hàng</option>
                <option value="security">🔒 Bảo mật</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
                Tiêu đề thông báo *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 🎉 Siêu SALE 9.9 Khuyến Mãi Khủng!"
                value={broadcastForm.title}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, title: e.target.value })
                }
                className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
                Nội dung chi tiết *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Nhập thông điệp gửi tới khách hàng..."
                value={broadcastForm.message}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, message: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl p-4 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
                Đường dẫn liên kết (Link tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: /vouchers hoặc /orders"
                value={broadcastForm.link}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, link: e.target.value })
                }
                className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-dark-border">
              <Button type="button" variant="secondary" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={sendingBroadcast}
                icon={Send}
              >
                Gửi Ngay Cho Tất Cả
              </Button>
            </div>
          </form>
        </Motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

export default NotificationBroadcastModal;
