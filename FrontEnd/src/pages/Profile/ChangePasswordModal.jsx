import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiX, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { updatePasswordApi } from "../../api/userApi";
import Button from "../../components/UI/Button";

const ChangePasswordModal = ({ show, onHide, userId }) => {
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.warning("Vui lòng nhập đầy đủ thông tin");
    }

    if (newPassword.length < 6) {
      return toast.warning("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp!");
    }

    try {
      setLoading(true);
      // Backend expects oldPassword and newPassword in req.body
      // authenticateToken middleware provides userId
      const res = await updatePasswordApi({ oldPassword, newPassword });
      if (res.errCode === 0) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        onHide();
      } else toast.error(res.errMessage || "Không thể đổi mật khẩu");
    } catch {
      toast.error("Lỗi máy chủ khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onHide}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 bg-primary text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FiLock size={20} />
                  </div>
                  <h3 className="text-2xl font-display font-bold">Đổi mật khẩu</h3>
                </div>
                <button 
                  onClick={onHide}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-white/70 text-sm">Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
            </div>

            <div className="p-8 space-y-6">
              {[
                { name: "oldPassword", label: "Mật khẩu cũ", placeholder: "Nhập mật khẩu hiện tại" },
                { name: "newPassword", label: "Mật khẩu mới", placeholder: "Tối thiểu 6 ký tự" },
                { name: "confirmPassword", label: "Xác nhận mật khẩu", placeholder: "Nhập lại mật khẩu mới" },
              ].map(({ name, label, placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest ml-1">{label}</label>
                  <div className="relative group">
                    <input
                      type={showPassword[name] ? "text" : "password"}
                      name={name}
                      value={passwordData[name]}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          [name]: e.target.value,
                        }))
                      }
                      placeholder={placeholder}
                      className="w-full h-12 px-4 bg-surface-50 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all placeholder:text-surface-300"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword(name)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-primary transition-colors"
                    >
                      {showPassword[name] ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 mt-8">
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={onHide}
                >
                  HỦY BỎ
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 shadow-lg shadow-primary/20" 
                  loading={loading}
                  icon={FiCheckCircle}
                  onClick={handleSave}
                >
                  CẬP NHẬT
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChangePasswordModal;
