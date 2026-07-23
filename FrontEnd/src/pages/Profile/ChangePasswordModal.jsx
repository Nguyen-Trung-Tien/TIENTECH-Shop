import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiX, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import Button from "../../components/UI/Button";
import Modal from "../../components/UI/Modal";

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
    <Modal
      isOpen={show}
      onClose={onHide}
      size="md"
      title="Đổi Mật Khẩu"
      subtitle="Cập nhật mật khẩu để bảo mật tài khoản của bạn."
    >
      <div className="space-y-4">
        {[
          {
            name: "oldPassword",
            label: "Mật khẩu cũ",
            placeholder: "Nhập mật khẩu hiện tại",
          },
          {
            name: "newPassword",
            label: "Mật khẩu mới",
            placeholder: "Tối thiểu 6 ký tự",
          },
          {
            name: "confirmPassword",
            label: "Xác nhận mật khẩu",
            placeholder: "Nhập lại mật khẩu mới",
          },
        ].map(({ name, label, placeholder }) => (
          <div key={name} className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest ml-1">
              {label}
            </label>
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
                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm font-bold dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword(name)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {showPassword[name] ? (
                  <FiEyeOff size={18} />
                ) : (
                  <FiEye size={18} />
                )}
              </button>
            </div>
          </div>
        ))}

        <div className="flex gap-3 sm:gap-4 pt-4">
          <Button
            variant="secondary"
            className="flex-1 h-13 rounded-2xl text-xs font-black uppercase tracking-widest"
            onClick={onHide}
          >
            HỦY BỎ
          </Button>
          <Button
            variant="primary"
            className="flex-1 h-13 rounded-2xl text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            loading={loading}
            icon={FiCheckCircle}
            onClick={handleSave}
          >
            CẬP NHẬT
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
