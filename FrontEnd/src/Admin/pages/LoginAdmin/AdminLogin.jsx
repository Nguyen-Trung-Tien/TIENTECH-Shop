import React, { useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiRefreshCw,
  FiLock,
  FiMail,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { loginUser } from "../../../api/userApi";
import { setUser } from "../../../redux/userSlice";
import logoImage from "../../../assets/logo.png";
import ForgotPasswordModal from "../../../components/ForgotPasswordModal/ForgotPasswordModal";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
          toast.error("Bạn không có quyền admin!");
          setLoading(false);
          return;
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
        toast.success("Đăng nhập thành công!");
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
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[40px] shadow-soft overflow-hidden border border-slate-100">
        {/* Left Side: Branding */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-slate-950 items-center justify-center p-12 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/10 rounded-full blur-[120px]"></div>
          <div className="relative z-10 text-center">
            <img
              src={logoImage}
              alt="Logo"
              className="w-48 mx-auto mb-10 brightness-0 invert opacity-90"
            />
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight">
              Quản Trị Hệ Thống
            </h2>
            <p className="text-slate-400 text-sm font-medium tracking-wide max-w-[280px] mx-auto">
              Truy cập trung tâm điều khiển TienTech.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-8 md:p-16 bg-white">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Chào mừng trở lại!
              </h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest text-label">
                Vui lòng đăng nhập
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-12 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                >
                  Security Key
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-12 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary p-2"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Duy trì đăng nhập
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-black text-primary uppercase tracking-widest"
                >
                  Quên mã?
                </button>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <FiRefreshCw className="animate-spin text-lg" />
                  ) : (
                    "Truy cập Dashboard"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full h-14 bg-white border border-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  <FiArrowLeft /> Cổng mua sắm
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
