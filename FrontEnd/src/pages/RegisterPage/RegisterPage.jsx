import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import { registerUser } from "../../api/userApi";
import Loading from "../../components/Loading/Loading";
import logoImage from "../../assets/Tien-Tech Shop.png";

// Di chuyển FloatingInput ra ngoài để tránh việc re-mount component khi state của cha thay đổi
const FloatingInput = ({ id, name, type, label, icon: Icon, required, toggleIcon: ToggleIcon, onToggle, value, onChange }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors duration-200">
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
      className="peer w-full h-14 pl-12 pr-12 bg-surface-50 border-2 border-transparent rounded-2xl text-[14px] font-medium text-surface-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder-transparent"
    />
    <label
      htmlFor={id}
      className="absolute left-12 top-1/2 -translate-y-1/2 text-surface-500 text-[14px] pointer-events-none transition-all duration-200 
                 peer-focus:top-0 peer-focus:left-4 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-primary peer-focus:bg-white peer-focus:px-2
                 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2"
    >
      {label}
    </label>
    {ToggleIcon && (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors z-10"
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
    confirmPassword: ""
  });
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự");
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
        toast.success(data.errMessage || "Đăng ký thành công! Vui lòng nhập mã OTP.");
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
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      {loading && <Loading />}
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[2.5rem] shadow-2xl shadow-surface-900/10 overflow-hidden min-h-[700px]">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-surface-900 items-center justify-center p-12 overflow-hidden">
          {/* Decorative Gradients */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/10 rounded-full blur-[120px]"></div>
          
          <div className="relative z-10 text-center">
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={logoImage}
              alt="Logo"
              className="w-64 mx-auto mb-8 brightness-0 invert"
            />
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-display text-white mb-4"
            >
              Trải nghiệm công nghệ <span className="text-primary-hover">đỉnh cao</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-surface-400 text-lg font-medium opacity-80"
            >
              Tham gia cùng hàng nghìn khách hàng tin dùng Tien-Tech Shop mỗi ngày.
            </motion.p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-white">
          <div className="w-full max-w-[480px]">
            <div className="lg:hidden text-center mb-8">
              <img src={logoImage} alt="Logo" className="h-12 mx-auto" />
            </div>

            <div className="mb-10">
              <h1 className="text-3xl font-display text-surface-900 mb-2">Tạo tài khoản</h1>
              <p className="text-surface-500 font-medium">Bắt đầu hành trình mua sắm tuyệt vời ngay hôm nay.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  label="Email"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  label="Xác nhận"
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
                className="group relative w-full h-14 bg-surface-900 text-white font-bold rounded-2xl overflow-hidden transition-all hover:bg-primary hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-70"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "ĐĂNG KÝ NGAY"
                  )}
                </div>
              </button>
            </form>

            <p className="text-center mt-8 text-surface-500 font-medium">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                Đăng nhập
              </Link>
            </p>

            <div className="mt-8 pt-8 border-t border-surface-100 text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-surface-500 hover:text-primary font-bold transition-colors"
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
