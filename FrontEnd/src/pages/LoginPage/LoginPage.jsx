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
import { motion, AnimatePresence } from "framer-motion";

import { loginUser } from "../../api/userApi";
import { setUser } from "../../redux/userSlice";
import { getAvatarBase64 } from "../../utils/decodeImage";
import ForgotPasswordModal from "../../components/ForgotPasswordModal/ForgotPasswordModal";
import Loading from "../../components/Loading/Loading";
import logoImage from "../../assets/TienTech Shop.png";

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
          avatar: getAvatarBase64(user.avatar),
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
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      {loading && <Loading />}

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[2.5rem] shadow-2xl shadow-surface-900/10 overflow-hidden min-h-[650px]">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-surface-900 items-center justify-center p-12 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/10 rounded-full blur-[120px]"></div>

          <div className="relative z-10 text-center">
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={logoImage}
              alt="Logo"
              className="w-56 mx-auto mb-8 brightness-0 invert"
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-display text-white mb-4"
            >
              Chào mừng <span className="text-primary-hover">quay lại</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-surface-400 text-lg font-medium opacity-80"
            >
              Nơi công nghệ gặp gỡ tương lai và trải nghiệm mua sắm đỉnh cao.
            </motion.p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-white">
          <div className="w-full max-w-[420px]">
            <div className="lg:hidden text-center mb-8">
              <img src={logoImage} alt="Logo" className="h-12 mx-auto" />
            </div>

            <div className="mb-10">
              <h1 className="text-3xl font-display text-surface-900 mb-2">
                Đăng nhập
              </h1>
              <p className="text-surface-500 font-medium">
                Vui lòng nhập thông tin để truy cập tài khoản.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
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

              <div className="flex items-center justify-between mb-8 py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-surface-200 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <svg
                      className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="4"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-surface-600 group-hover:text-surface-900 transition-colors">
                    Ghi nhớ
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-14 bg-surface-900 text-white font-bold rounded-2xl overflow-hidden transition-all hover:bg-primary hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-70"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiUser className="text-lg" />
                      <span>ĐĂNG NHẬP</span>
                    </>
                  )}
                </div>
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-surface-500 font-bold uppercase tracking-wider">
                    Hoặc
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"}/user/auth/google`;
                }}
                className="w-full h-14 bg-white border-2 border-surface-200 text-surface-700 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-surface-50 hover:border-surface-300 active:scale-[0.98]"
              >
                <FcGoogle size={22} />
                <span>Đăng nhập với Google</span>
              </button>
            </form>

            <p className="text-center mt-8 text-surface-500 font-medium">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-primary font-bold hover:underline decoration-2 underline-offset-4"
              >
                Đăng ký ngay
              </Link>
            </p>

            <div className="mt-8 pt-8 border-t border-surface-100 text-center">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-surface-500 hover:text-primary font-bold transition-colors"
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
