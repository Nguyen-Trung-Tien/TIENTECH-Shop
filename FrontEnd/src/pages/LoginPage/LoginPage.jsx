import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiArrowLeft,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { motion as Motion } from "framer-motion";
import { loginUser } from "../../api/userApi";
import { setUser } from "../../redux/userSlice";
import ForgotPasswordModal from "../../components/ForgotPasswordModal/ForgotPasswordModal";
import UnifiedSpinner from "../../components/Loading/UnifiedSpinner";
import Logo from "../../components/UI/Logo";
import { appConfig } from "../../config/runtimeConfig";

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
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-200 z-10 pointer-events-none">
      <Icon size={18} />
    </div>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      required
      placeholder=" "
      className="peer w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-[14px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-transparent"
    />
    <label
      htmlFor={id}
      className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 text-[14px] font-medium pointer-events-none transition-all duration-200 
                 peer-focus:top-0 peer-focus:left-4 peer-focus:text-[11px] peer-focus:font-extrabold peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-focus:bg-white dark:peer-focus:bg-slate-900 peer-focus:px-2 rounded
                 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-extrabold peer-[:not(:placeholder-shown)]:text-blue-600 dark:peer-[:not(:placeholder-shown)]:text-blue-400 peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-slate-900 peer-[:not(:placeholder-shown)]:px-2"
    >
      {label}
    </label>
    {ToggleIcon && (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ToggleIcon size={18} />
      </button>
    )}
  </div>
);

const LoginPage = () => {
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("tientech_remember_me") === "true";
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("tientech_remember_email") || "";
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem("tientech_remember_password") || "";
  });
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
        // Save or Clear Saved Login Credentials
        if (rememberMe) {
          localStorage.setItem("tientech_remember_me", "true");
          localStorage.setItem("tientech_remember_email", email);
          localStorage.setItem("tientech_remember_password", password);
        } else {
          localStorage.removeItem("tientech_remember_me");
          localStorage.removeItem("tientech_remember_email");
          localStorage.removeItem("tientech_remember_password");
        }

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
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden fixed inset-0">
      <div className="w-full max-w-4xl h-fit max-h-[92vh] grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        {/* Left Side - Visual Banner */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 items-center justify-center p-8 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[90px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[90px]"></div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <Logo size="xl" variant="light" className="justify-center mb-6" />
            <Motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-black text-white mb-3 tracking-tight"
            >
              Chào mừng <span className="text-blue-400">quay lại</span>
            </Motion.h2>
            <Motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed px-4 max-w-xs"
            >
              Hệ thống mua sắm thiết bị công nghệ hàng đầu TienTech Shop.
            </Motion.p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 bg-white dark:bg-slate-900 overflow-y-auto max-h-[92vh] custom-scrollbar">
          <div className="w-full max-w-[360px]">
            <div className="lg:hidden text-center mb-6 flex justify-center">
              <Logo size="lg" />
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                Đăng Nhập
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
                Vui lòng nhập email & mật khẩu để truy cập tài khoản.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-1">
              <FloatingInput
                id="email"
                type="email"
                label="Địa chỉ Email"
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
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="size-4 border-2 border-slate-300 dark:border-slate-600 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                    <FiCheckCircle className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <UnifiedSpinner size="xs" variant="white" />
                    <span>ĐANG XÁC THỰC...</span>
                  </>
                ) : (
                  <>
                    <FiUser className="text-base" />
                    <span>ĐĂNG NHẬP NGAY</span>
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-extrabold uppercase tracking-wider">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.href = `${appConfig.apiUrl}/user/auth/google`;
                }}
                className="w-full h-12 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-2text-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
              >
                <FcGoogle size={18} />
                <span>Đăng nhập với Google</span>
              </button>
            </form>

            <p className="text-center mt-6 text-slate-500 dark:text-slate-400 text-xs font-medium">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline underline-offset-4"
              >
                Đăng ký ngay
              </Link>
            </p>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors cursor-pointer"
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
