import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FiSettings,
  FiShield,
  FiMail,
  FiCheckCircle,
  FiAlertTriangle,
  FiLock,
  FiRefreshCw,
  FiCpu,
  FiInfo,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getAllSettingsAdminApi,
  toggleOtpSettingAdminApi,
} from "../../../api/systemSettingApi";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import { useTheme } from "../../../context/ThemeContext";

const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [updatingOtp, setUpdatingOtp] = useState(false);
  const [settings, setSettings] = useState([]);
  const [requireOtp, setRequireOtp] = useState(true);
  const { theme, setTheme, isDark } = useTheme();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getAllSettingsAdminApi();
      if (res.errCode === 0 && res.data) {
        setSettings(res.data);
        const otpSetting = res.data.find(
          (s) => s.key === "REQUIRE_OTP_VERIFICATION"
        );
        if (otpSetting) {
          setRequireOtp(otpSetting.value === "true" || otpSetting.value === true);
        }
      }
    } catch (error) {
      console.error("Failed to load system settings:", error);
      toast.error("Không thể tải cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleOtp = async () => {
    const nextState = !requireOtp;
    setUpdatingOtp(true);
    try {
      const res = await toggleOtpSettingAdminApi(nextState);
      if (res.errCode === 0) {
        setRequireOtp(nextState);
        toast.success(
          nextState
            ? "Đã BẬT yêu cầu mã OTP khi đăng ký!"
            : "Đã TẮT yêu cầu mã OTP khi đăng ký! Người dùng mới có thể đăng nhập ngay sau khi tạo tài khoản.",
          { autoClose: 3500 }
        );
      } else {
        toast.error(res.errMessage || "Không thể cập nhật cấu hình OTP");
      }
    } catch (error) {
      console.error("Error updating OTP toggle:", error);
      toast.error(error.response?.data?.errMessage || "Lỗi khi lưu cấu hình OTP");
    } finally {
      setUpdatingOtp(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <FiSettings className="size-7 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Cài Đặt Hệ Thống
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Quản lý các thông số vận hành, luồng đăng ký & chính sách bảo mật toàn diện
            </p>
          </div>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          <span>Làm mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <UnifiedSpinner size="lg" variant="primary" />
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
            Đang đồng bộ cấu hình từ Redis & Database...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* OTP Verification Setting Card */}
            <Motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div
                className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-colors duration-500 ${
                  requireOtp ? "bg-blue-500/10" : "bg-amber-500/10"
                }`}
              />

              <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`size-12 rounded-2xl flex items-center justify-center text-white transition-colors duration-300 ${
                      requireOtp
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/30"
                        : "bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/30"
                    } shadow-lg`}
                  >
                    <FiMail className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                      Xác Thực Mã OTP Khi Đăng Ký Tài Khoản
                    </h2>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Module Xác Thực (Authentication Flow)
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                    requireOtp
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                  }`}
                >
                  <span
                    className={`size-2 rounded-full animate-pulse ${
                      requireOtp ? "bg-blue-600 dark:bg-blue-400" : "bg-amber-500"
                    }`}
                  />
                  {requireOtp ? "Đang Bật OTP" : "Đã Tắt OTP"}
                </div>
              </div>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-6 relative z-10">
                {requireOtp
                  ? "Khi BẬT: Khách hàng sau khi điền form đăng ký sẽ nhận được mã OTP 6 chữ số qua Email. Tài khoản chỉ được kích hoạt sau khi nhập đúng mã OTP (Bảo mật tối đa, chống spam)."
                  : "Khi TẮT: Khách hàng đăng ký xong sẽ được kích hoạt tài khoản ngay lập tức (isActive = true) mà không cần xác thực OTP. Người dùng có thể đăng nhập liền mạch ngay (Tối ưu tỷ lệ chuyển đổi)."}
              </p>

              {/* Action Control Panel */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white">
                    <FiShield className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Trạng thái hiện tại
                    </p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {requireOtp
                        ? "Bắt buộc gửi mã xác nhận 6 số đến email khách hàng"
                        : "Bỏ qua bước xác minh, tạo tài khoản active ngay"}
                    </p>
                  </div>
                </div>

                {/* Modern Toggle Switch */}
                <button
                  type="button"
                  onClick={handleToggleOtp}
                  disabled={updatingOtp}
                  className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    requireOtp ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  } ${updatingOtp ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span className="sr-only">Bật tắt OTP</span>
                  <Motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`pointer-events-none flex items-center justify-center size-9 rounded-full bg-white shadow-lg ring-0 ${
                      requireOtp ? "translate-x-10" : "translate-x-0"
                    }`}
                  >
                    {updatingOtp ? (
                      <UnifiedSpinner size="xs" variant="primary" />
                    ) : requireOtp ? (
                      <FiCheckCircle className="size-4 text-blue-600" />
                    ) : (
                      <FiAlertTriangle className="size-4 text-amber-500" />
                    )}
                  </Motion.span>
                </button>
              </div>

              {/* Security & UX Guide Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-blue-800 dark:text-blue-300">
                    <FiShield className="size-4" /> Khi nào nên BẬT OTP?
                  </div>
                  <p className="text-xs font-medium text-blue-900/80 dark:text-blue-300/80 leading-relaxed">
                    Khuyên dùng khi hệ thống đang vận hành công khai ổn định nhằm đảm bảo địa chỉ email chính chủ và phòng ngừa tài khoản rác (bot spam).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300">
                    <FiInfo className="size-4" /> Khi nào nên TẮT OTP?
                  </div>
                  <p className="text-xs font-medium text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                    Hữu ích khi máy chủ gửi mail gặp sự cố, trong các chiến dịch khuyến mãi lớn cần khách hàng đăng ký mua ngay hoặc khi test nghiệm thu hệ thống.
                  </p>
                </div>
              </div>
            </Motion.div>

            {/* Theme Preference Settings Card */}
            <Motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="size-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white">
                    {isDark ? <FiMoon className="size-6 text-amber-300" /> : <FiSun className="size-6 text-amber-200" />}
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                      Chế Độ Giao Diện (Dark / Light Mode)
                    </h2>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Giao Diện Người Dùng (UI / UX Theme)
                    </span>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700">
                  <span className="size-2 rounded-full bg-primary" />
                  {isDark ? "Giao diện Tối (Dark)" : "Giao diện Sáng (Light)"}
                </div>
              </div>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Tùy chỉnh chế độ hiển thị toàn hệ thống (Áp dụng đồng bộ cho cả Portal Quản trị và Cửa hàng Khách hàng).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Light Option Card */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    !isDark
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <FiSun className="size-5" />
                    </div>
                    {!isDark && (
                      <span className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Giao Diện Sáng (Light Mode)</h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      Nền sáng, độ tương phản cao, tối ưu hiển thị ban ngày.
                    </p>
                  </div>
                </button>

                {/* Dark Option Card */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    isDark
                      ? "border-primary bg-primary/10 shadow-md shadow-primary/10 ring-2 ring-primary/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <FiMoon className="size-5" />
                    </div>
                    {isDark && (
                      <span className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Giao Diện Tối (Dark Mode)</h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      Nền tối mờ ảo, giảm mỏi mắt, tiết kiệm pin cho màn hình OLED.
                    </p>
                  </div>
                </button>
              </div>
            </Motion.div>
          </div>

          {/* Sidebar Info & Architecture Status */}
          <div className="lg:col-span-4 space-y-6">
            {/* System Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <FiCpu className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Kiến Trúc Bộ Nhớ Đệm
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    Redis Cache Sync Protocol
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-500 dark:text-slate-400">
                    Redis Cache Key
                  </span>
                  <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-primary">
                    system:setting:*
                  </code>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-500 dark:text-slate-400">
                    Độ trễ áp dụng
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    Tức thời (0ms)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-2">
                  <span className="font-bold text-slate-500 dark:text-slate-400">
                    Rate Limit OTP
                  </span>
                  <span className="font-black text-blue-600 dark:text-blue-400">
                    5 lần / 15 phút
                  </span>
                </div>
              </div>
            </div>

            {/* Security Snapshot Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FiLock className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide text-slate-900 dark:text-white">
                    Chế Độ Bảo Mật Toàn Diện
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    Role-Based Access Control
                  </p>
                </div>
              </div>

              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                Mọi thay đổi trong cài đặt hệ thống được kiểm soát theo quyền hạn Admin/Root và tự động đồng bộ tức thời xuống client.
              </p>

              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Hệ thống hoạt động ổn định
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SystemSettingsPage;
