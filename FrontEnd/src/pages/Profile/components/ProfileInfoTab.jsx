import React from "react";
import { m as Motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Check, X, Save } from "lucide-react";
import { Button } from "../../../components/UI";
import { PROFILE_FORM_FIELDS } from "./profileConstants";

const FieldIcon = ({ iconType }) => {
  switch (iconType) {
    case "mail":
      return <Mail className="size-4.5" />;
    case "phone":
      return <Phone className="size-4.5" />;
    case "map":
      return <MapPin className="size-4.5" />;
    default:
      return <User className="size-4.5" />;
  }
};

const ProfileInfoTab = ({
  formData,
  isEditing,
  onChange,
  onCancelEdit,
  onSave,
  loading,
  receiveEmail,
  emailToggleLoading,
  onToggleEmailNotification,
}) => {
  return (
    <Motion.div
      key="info"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200/80 dark:border-dark-border shadow-soft"
    >
      <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-100 dark:border-dark-border">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Chi tiết hồ sơ
          </h3>
          <p className="text-xs text-slate-400 dark:text-dark-text-secondary font-medium mt-0.5">
            Quản lý thông tin định danh và liên lạc chính thức.
          </p>
        </div>

        {isEditing && (
          <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
            Đang chỉnh sửa
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {PROFILE_FORM_FIELDS.map((field) => (
          <div
            key={field.name}
            className={`${field.colSpan ? "md:col-span-2" : ""} space-y-1.5`}
          >
            <label className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1">
              {field.label}
            </label>
            <div className="relative group">
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  isEditing ? "text-primary" : "text-slate-400 dark:text-slate-600"
                }`}
              >
                <FieldIcon iconType={field.iconType} />
              </div>
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={onChange}
                disabled={!isEditing}
                placeholder={field.placeholder}
                className={`w-full h-13 pl-12 pr-4 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl text-sm font-bold outline-none transition-all ${
                  isEditing
                    ? "bg-white dark:bg-dark-surface border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-900 dark:text-white"
                    : "border-transparent text-slate-700 dark:text-slate-300 cursor-not-allowed"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
              receiveEmail
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
            }`}
          >
            <Mail className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              Nhận thông báo qua Email
            </p>
            <p className="text-[11px] text-slate-400 dark:text-dark-text-secondary break-words [overflow-wrap:anywhere]">
              {receiveEmail
                ? "Đang nhận cập nhật đơn hàng và khuyến mãi qua email"
                : "Đã tạm dừng nhận email thông báo"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleEmailNotification}
          disabled={emailToggleLoading}
          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 ${
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

      {isEditing && (
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border flex justify-end gap-3"
        >
          <Button
            variant="secondary"
            size="lg"
            className="min-h-[44px]"
            onClick={onCancelEdit}
          >
            HỦY BỎ
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="shadow-xl shadow-primary/20 min-h-[44px]"
            icon={Save}
            loading={loading}
            onClick={onSave}
          >
            LƯU THAY ĐỔI
          </Button>
        </Motion.div>
      )}
    </Motion.div>
  );
};

export default ProfileInfoTab;
