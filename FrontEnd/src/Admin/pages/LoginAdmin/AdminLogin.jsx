import React, { useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiRefreshCw,
  FiLock,
  FiMail,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { loginUser } from "../../../api/userApi";
import { setUser } from "../../../redux/userSlice";
import Logo from "../../../components/UI/Logo";
import ForgotPasswordModal from "../../../components/ForgotPasswordModal/ForgotPasswordModal";

const AdminLogin = () => {
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("tientech_admin_remember_me") === "true";
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("tientech_admin_remember_email") || "";
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem("tientech_admin_remember_password") || "";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.errCode === 0 && res.data) {
        const { user } = res.data;
        if (user.role !== "admin") {
          toast.error("Bạn không có quyền quản trị viên!");
          setLoading(false);
          return;
        }

        // Save or Clear Admin Saved Login Info
        if (rememberMe) {
          localStorage.setItem("tientech_admin_remember_me", "true");
          localStorage.setItem("tientech_admin_remember_email", email);
          localStorage.setItem("tientech_admin_remember_password", password);
        } else {
          localStorage.removeItem("tientech_admin_remember_me");
          localStorage.removeItem("tientech_admin_remember_email");
          localStorage.removeItem("tientech_admin_remember_password");
        }

        const minimalUser = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          address: user.address,
        };
        dispatch(setUser({ user: minimalUser }));
        toast.success("Đăng nhập Admin thành công!");
        navigate("/admin/dashboard");
      } else {
        toast.error(res.errMessage || "Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
        {/* Left Side: Branding Banner */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 items-center justify-center p-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[90px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[90px]"></div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <Logo size="xl" variant="light" className="justify-center mb-8" />
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight leading-tight">
              Quản Trị Hệ Thống
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed max-w-[260px] mx-auto">
              Cổng điều khiển trung tâm và phân tích dữ liệu TienTech Admin.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-8 md:p-12 lg:p-14 bg-white dark:bg-slate-900">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                <FiShield /> Admin Portal
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                Chào mừng trở lại!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
                Nhập thông tin quản trị viên để truy cập Dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1"
                >
                  Địa chỉ Email Admin
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@tientech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-13 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1"
                >
                  Mật Khẩu An Ninh
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-13 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl pl-11 pr-12 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="size-4.5 border-2 border-slate-300 dark:border-slate-600 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                    <FiCheckCircle className="absolute size-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <FiRefreshCw className="animate-spin text-base" />
                  ) : (
                    "TRUY CẬP DASHBOARD"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full h-12 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FiArrowLeft /> Về Cổng Mua Sắm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ForgotPasswordModal
        show={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default AdminLogin;
