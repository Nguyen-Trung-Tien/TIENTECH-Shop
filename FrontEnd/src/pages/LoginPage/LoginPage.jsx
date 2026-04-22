import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiArrowLeft,
  FiUser,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { motion as Motion } from "framer-motion";

import { loginUser } from "../../api/userApi";
import { setUser } from "../../redux/userSlice";
import ForgotPasswordModal from "../../components/ForgotPasswordModal/ForgotPasswordModal";
import Loading from "../../components/Loading/Loading";
import logoImage from "../../assets/logo.png";
import { appConfig } from "../../config/runtimeConfig";

// TÁCH FloatingInput RA NGOÀI Component chính để không bị re-mount khi gõ phím
const FloatingInput = ({
  id,
  value,
  onChange,
  type,
  label,
  icon: Icon,
  toggleIcon: ToggleIcon,
  onToggle,
}) => (
  <div className="relative group mb-4">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors duration-200">
      <Icon size={18} />
    </div>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      required
      placeholder=" "
      className="peer w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-dark-surface border-2 border-transparent rounded-2xl text-[14px] font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-dark-bg focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder-transparent"
    />
    <label
      htmlFor={id}
      className="absolute left-12 top-1/2 -translate-y-1/2 text-surface-500 text-[14px] pointer-events-none transition-all duration-200 
                 peer-focus:top-0 peer-focus:left-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:bg-white dark:peer-focus:bg-dark-bg peer-focus:px-2
                 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-dark-bg peer-[:not(:placeholder-shown)]:px-2"
    >
      {label}
    </label>
    {ToggleIcon && (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
      >
        <ToggleIcon size={18} />
      </button>
    )}
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser(email, password);

      if (res.errCode === 0 && res.data) {
        const { user } = res.data;
        const minimalUser = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
        };
        dispatch(setUser({ user: minimalUser }));
        toast.success(res.errMessage || "Đăng nhập thành công!");
        navigate("/");
      } else {
        toast.error(res.errMessage || "Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Kiểm tra lại mật khẩu và tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center p-4 overflow-hidden fixed inset-0">
      {loading && <Loading />}

      <div className="w-full max-w-4xl h-fit max-h-[90vh] grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-2xl shadow-surface-900/10 overflow-hidden">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-surface-900 items-center justify-center p-8 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/10 rounded-full blur-[100px]"></div>

          <div className="relative z-10 text-center">
            <Motion.img
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              src={logoImage}
              alt="Logo"
              className="w-40 mx-auto mb-6 brightness-0 invert"
            />
            <Motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-display text-white mb-3"
            >
              Chào mừng <span className="text-primary-hover">quay lại</span>
            </Motion.h2>
            <Motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-surface-400 text-sm font-medium opacity-80 px-4"
            >
              Nơi công nghệ gặp gỡ tương lai và trải nghiệm mua sắm đỉnh cao.
            </Motion.p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 bg-white dark:bg-dark-surface overflow-y-auto max-h-[90vh] scrollbar-hide">
          <div className="w-full max-w-[360px]">
            <div className="lg:hidden text-center mb-6">
              <img src={logoImage} alt="Logo" className="h-10 mx-auto" />
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-display text-surface-900 dark:text-white mb-1">
                Đăng nhập
              </h1>
              <p className="text-surface-500 dark:text-slate-400 text-sm font-medium">
                Vui lòng nhập thông tin để truy cập tài khoản.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-1">
              <FloatingInput
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={FiMail}
              />

              <FloatingInput
                id="password"
                type={showPassword ? "text" : "password"}
                label="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={FiLock}
                toggleIcon={showPassword ? FiEyeOff : FiEye}
                onToggle={() => setShowPassword(!showPassword)}
              />

              <div className="flex items-center justify-between mb-6 py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 border-2 border-surface-200 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <svg
                      className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="4"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-semibold text-surface-600 dark:text-slate-400 group-hover:text-surface-900 dark:group-hover:text-white transition-colors">
                    Ghi nhớ
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[13px] font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-12 bg-surface-900 dark:bg-primary text-white font-bold rounded-2xl overflow-hidden transition-all hover:bg-primary dark:hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-70"
              >
                <div className="relative z-10 flex items-center justify-center gap-2 text-sm">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiUser className="text-base" />
                      <span>ĐĂNG NHẬP</span>
                    </>
                  )}
                </div>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200 dark:border-dark-border"></div>
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="px-3 bg-white dark:bg-dark-surface text-surface-500 font-bold uppercase tracking-wider">
                    Hoặc
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.href = `${appConfig.apiUrl}/user/auth/google`;
                }}
                className="w-full h-12 bg-white dark:bg-dark-surface border-2 border-surface-200 dark:border-dark-border text-surface-700 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all hover:bg-surface-50 dark:hover:bg-dark-bg hover:border-surface-300 active:scale-[0.98]"
              >
                <FcGoogle size={18} />
                <span>Google</span>
              </button>
            </form>

            <p className="text-center mt-6 text-surface-500 dark:text-slate-400 text-[13px] font-medium">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-primary font-bold hover:underline decoration-2 underline-offset-4"
              >
                Đăng ký ngay
              </Link>
            </p>

            <div className="mt-6 pt-6 border-t border-surface-100 dark:border-dark-border text-center">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-[13px] text-surface-500 dark:text-slate-400 hover:text-primary font-bold transition-colors"
              >
                <FiArrowLeft /> Quay lại trang chủ
              </button>
            </div>
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

export default LoginPage;
