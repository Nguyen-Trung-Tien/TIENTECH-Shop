import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiShield, FiKey, FiArrowLeft, FiRefreshCw, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import {
  forgotPasswordApi,
  resetPasswordApi,
  verifyResetTokenApi,
} from "../../api/userApi";

const ForgotPasswordModal = ({ show, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetAll = () => {
    setStep(1);
    setLoading(false);
    setEmail("");
    setToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.warning("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPasswordApi(email);
      if (res.errCode === 0) {
        toast.success(res.errMessage);
        setStep(2);
      } else toast.error(res.errMessage);
    } catch {
      toast.error("Lỗi khi gửi mã xác nhận");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!token) {
      toast.warning("Vui lòng nhập mã xác nhận");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyResetTokenApi(email, token);
      if (res.errCode === 0) {
        toast.success(res.errMessage);
        setStep(3);
      } else toast.error(res.errMessage);
    } catch {
      toast.error("Lỗi khi xác thực mã");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.warning("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi(email, token, newPassword);
      if (res.errCode === 0) {
        toast.success(res.errMessage || "Đổi mật khẩu thành công");
        handleClose();
      } else toast.error(res.errMessage || "Không thể đổi mật khẩu");
    } catch {
      toast.error("Lỗi khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 pt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                {step === 1 && <FiMail size={20} />}
                {step === 2 && <FiShield size={20} />}
                {step === 3 && <FiKey size={20} />}
              </div>
              <div>
                <h3 className="text-xl font-display text-surface-900 leading-none">
                  {step === 1 && "Quên mật khẩu"}
                  {step === 2 && "Xác thực"}
                  {step === 3 && "Mật khẩu mới"}
                </h3>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-surface-400 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-surface-500 text-sm font-medium">
                      Nhập email đã đăng ký để nhận mã khôi phục mật khẩu.
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-surface-900 uppercase tracking-wider ml-1">Email</label>
                      <div className="relative group">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors" />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          className="w-full h-12 pl-11 pr-4 bg-surface-50 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.trim())}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-surface-500 text-sm font-medium leading-relaxed">
                      Mã xác nhận đã gửi đến <span className="text-surface-900 font-bold">{email}</span>. Vui lòng kiểm tra hộp thư.
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-surface-900 uppercase tracking-wider ml-1">Mã xác nhận</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors" />
                          <input
                            placeholder="Nhập 6 ký tự..."
                            className="w-full h-12 pl-11 pr-4 bg-surface-50 border-2 border-transparent rounded-xl text-sm font-bold tracking-widest focus:bg-white focus:border-primary/20 outline-none transition-all"
                            value={token}
                            onChange={(e) => setToken(e.target.value.trim())}
                          />
                        </div>
                        <button 
                          onClick={handleSendEmail}
                          disabled={loading}
                          className="px-4 bg-surface-100 text-surface-600 hover:bg-surface-200 rounded-xl transition-all disabled:opacity-50"
                        >
                          <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-surface-500 text-sm font-medium">
                      Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn.
                    </p>
                    <div className="space-y-3">
                      <PasswordField
                        label="Mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <PasswordField
                        label="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-8 pt-0 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="flex-1 h-12 bg-surface-100 text-surface-600 font-bold rounded-xl hover:bg-surface-200 transition-all disabled:opacity-50"
              >
                Quay lại
              </button>
            )}
            <button
              onClick={step === 1 ? handleSendEmail : step === 2 ? handleVerifyToken : handleResetPassword}
              disabled={loading}
              className={`flex-[2] h-12 font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${
                step === 3 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600" : "bg-surface-900 text-white hover:bg-primary shadow-lg shadow-surface-900/10"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                step === 1 ? "Gửi mã" : step === 2 ? "Xác thực mã" : "Đổi mật khẩu"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const PasswordField = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-bold text-surface-900 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors" />
        <input
          type={show ? "text" : "password"}
          className="w-full h-12 pl-11 pr-12 bg-surface-50 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all"
          value={value}
          onChange={onChange}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-900 transition-colors"
        >
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

