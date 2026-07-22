import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiArrowLeft,
  FiUserPlus,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { motion as Motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

import { registerUser } from "../../api/userApi";
import Loading from "../../components/Loading/Loading";
import Logo from "../../components/UI/Logo";
import { appConfig } from "../../config/runtimeConfig";

const FloatingInput = ({
  id,
  name,
  type,
  label,
  icon: Icon,
  required,
  toggleIcon: ToggleIcon,
  onToggle,
  value,
  onChange,
}) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-200 z-10 pointer-events-none">
      <Icon size={18} />
    </div>
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
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
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors z-10 cursor-pointer"
      >
        <ToggleIcon size={18} />
      </button>
    )}
  </div>
);

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      toast.warning("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.warning("Mật khẩu phải có ít nhất 1 chữ cái in hoa (A-Z)!");
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      toast.warning("Mật khẩu phải có ít nhất 1 chữ số (0-9)!");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      toast.warning("Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const { username, email, phone, password } = formData;
      const data = await registerUser({ username, email, phone, password });
      if (data.errCode === 0) {
        toast.success(
          data.errMessage || "Đăng ký thành công! Vui lòng nhập mã OTP.",
        );
        navigate(`/verify-account?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(data.errMessage || "Đăng ký thất bại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden fixed inset-0">
      {loading && <Loading />}

      <div className="w-full max-w-4xl h-fit max-h-[95vh] grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
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
              Trải nghiệm công nghệ <span className="text-blue-400">đỉnh cao</span>
            </Motion.h2>
            <Motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed px-4 max-w-xs"
            >
              Tham gia cộng đồng hàng nghìn khách hàng tin dùng TienTech Shop mỗi ngày.
            </Motion.p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 bg-white dark:bg-slate-900 overflow-y-auto max-h-[95vh] custom-scrollbar">
          <div className="w-full max-w-[440px]">
            <div className="lg:hidden text-center mb-6 flex justify-center">
              <Logo size="lg" />
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                Tạo Tài Khoản
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
                Bắt đầu hành trình mua sắm thiết bị đỉnh cao ngay hôm nay.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FloatingInput
                  id="username"
                  name="username"
                  type="text"
                  label="Họ và tên"
                  icon={FiUser}
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                />
                <FloatingInput
                  id="email"
                  name="email"
                  type="email"
                  label="Địa chỉ Email"
                  icon={FiMail}
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <FloatingInput
                id="phone"
                name="phone"
                type="text"
                label="Số điện thoại"
                icon={FiPhone}
                required
                value={formData.phone}
                onChange={handleInputChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FloatingInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Mật khẩu"
                  icon={FiLock}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  toggleIcon={showPassword ? FiEyeOff : FiEye}
                  onToggle={() => setShowPassword(!showPassword)}
                />
                <FloatingInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  label="Xác nhận mật khẩu"
                  icon={FiLock}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  toggleIcon={showConfirm ? FiEyeOff : FiEye}
                  onToggle={() => setShowConfirm(!showConfirm)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70 mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiUserPlus className="text-base" />
                    <span>ĐĂNG KÝ NGAY</span>
                  </>
                )}
              </button>

              <div className="relative my-4">
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
                className="w-full h-12 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
              >
                <FcGoogle size={18} />
                <span>Đăng ký với Google</span>
              </button>
            </form>

            <p className="text-center mt-6 text-slate-500 dark:text-slate-400 text-xs font-medium">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline underline-offset-4"
              >
                Đăng nhập
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
    </div>
  );
};

export default RegisterPage;
