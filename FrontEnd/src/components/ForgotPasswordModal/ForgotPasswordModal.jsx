import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiShield,
  FiKey,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { Modal, Button } from "../UI";
import UnifiedSpinner from "../Loading/UnifiedSpinner";
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
    <Modal
      isOpen={show}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <div className="size-10 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            {step === 1 && <FiMail size={20} />}
            {step === 2 && <FiShield size={20} />}
            {step === 3 && <FiKey size={20} />}
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {step === 1 && "Quên Mật Khẩu"}
            {step === 2 && "Xác Thực Mã Token"}
            {step === 3 && "Tạo Mật Khẩu Mới"}
          </span>
        </div>
      }
      size="md"
      showClose={true}
    >
      <div className="min-h-[180px]">
        <AnimatePresence mode="wait">
          <Motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
                  Nhập địa chỉ email đã đăng ký tài khoản để nhận mã khôi phục mật khẩu.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Địa chỉ Email
                  </label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
                  Mã xác nhận đã được gửi đến{" "}
                  <strong className="text-blue-600 dark:text-blue-400 font-bold">{email}</strong>.
                  Vui lòng kiểm tra hộp thư của bạn.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Mã xác nhận (OTP)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        placeholder="Nhập mã xác nhận"
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all"
                        value={token}
                        onChange={(e) => setToken(e.target.value.trim())}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="shrink-0 size-12 rounded-2xl"
                      onClick={handleSendEmail}
                      loading={loading}
                    >
                      <FiRefreshCw />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium">
                  Tạo mật khẩu mới cho tài khoản của bạn.
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
          </Motion.div>
        </AnimatePresence>
      </div>

      {/* Custom Footer */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        {step > 1 && (
          <Button
            variant="secondary"
            className="flex-1 py-3 text-xs uppercase font-bold"
            onClick={() => setStep(step - 1)}
            disabled={loading}
          >
            Quay lại
          </Button>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={
            step === 1
              ? handleSendEmail
              : step === 2
                ? handleVerifyToken
                : handleResetPassword
          }
          className={`flex-[2] py-3.5 px-6 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
            step === 3
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          }`}
        >
          {loading ? (
            <>
              <UnifiedSpinner size="xs" variant="white" />
              <span>Đang xử lý...</span>
            </>
          ) : step === 1 ? (
            "Gửi mã xác nhận"
          ) : step === 2 ? (
            "Xác thực mã"
          ) : (
            "Đổi mật khẩu"
          )}
        </button>
      </div>
    </Modal>
  );
};

const PasswordField = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative group">
        <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input
          type={show ? "text" : "password"}
          className="w-full h-12 pl-11 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all"
          value={value}
          onChange={onChange}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
