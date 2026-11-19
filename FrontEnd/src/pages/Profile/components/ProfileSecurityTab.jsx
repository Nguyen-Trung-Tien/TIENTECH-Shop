import React from "react";
import { m as Motion } from "framer-motion";
import { Shield, Mail, Lock, CheckCircle2, Check, X } from "lucide-react";
import { Button } from "../../../components/UI";

const ProfileSecurityTab = ({
  receiveEmail,
  emailToggleLoading,
  onToggleEmailNotification,
  onOpenPasswordModal,
}) => {
  return (
    <Motion.div
      key="security"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200/80 dark:border-dark-border shadow-soft space-y-6"
    >
      <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-dark-border">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Bảo mật &amp; Cài đặt thông báo
          </h3>
          <p className="text-xs text-slate-400 dark:text-dark-text-secondary font-medium mt-0.5">
            Quản lý mật khẩu, trạng thái tài khoản và tùy chọn nhận thông báo qua Email.
          </p>
        </div>
        <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Shield className="size-5" />
        </div>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-cyan-50/50 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg border border-blue-100 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div
            className={`size-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              receiveEmail
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
            }`}
          >
            <Mail className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Nhận thông báo qua Email
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${
                  receiveEmail
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                {receiveEmail ? "Đang bật" : "Đang tắt"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary font-medium mt-1 max-w-xl leading-relaxed break-words [overflow-wrap:anywhere]">
              Nhận email tự động về trạng thái đơn hàng (xác nhận, vận chuyển, giao thành công), biên lai thanh toán điện tử, mã giảm giá và ưu đãi thành viên độc quyền.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleEmailNotification}
          disabled={emailToggleLoading}
          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 self-start sm:self-center ${
            receiveEmail
              ? "bg-primary shadow-md shadow-primary/25"
              : "bg-slate-300 dark:bg-slate-700"
          } ${emailToggleLoading ? "opacity-60 cursor-wait" : ""}`}
          aria-label="Bật/tắt nhận email"
        >
          <Motion.span
            animate={{ x: receiveEmail ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="pointer-events-none flex size-6 items-center justify-center rounded-full bg-white shadow-md"
          >
            {emailToggleLoading ? (
              <div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : receiveEmail ? (
              <Check className="size-3.5 text-primary stroke-[3]" />
            ) : (
              <X className="size-3 text-slate-400 stroke-[2.5]" />
            )}
          </Motion.span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-200/60 dark:border-dark-border flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Lock className="size-4" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Mật khẩu đăng nhập
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary font-medium">
              Thay đổi định kỳ mật khẩu để bảo vệ thông tin cá nhân và đơn hàng.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center min-h-[44px]"
            icon={Lock}
            onClick={onOpenPasswordModal}
          >
            ĐỔI MẬT KHẨU NGAY
          </Button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-200/60 dark:border-dark-border flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Shield className="size-4" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Trạng thái xác minh
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary font-medium">
              Tài khoản của bạn đã được xác minh địa chỉ Email thành công.
            </p>
          </div>
          <span className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="size-4" /> Đã xác thực an toàn
          </span>
        </div>
      </div>
    </Motion.div>
  );
};

export default ProfileSecurityTab;
