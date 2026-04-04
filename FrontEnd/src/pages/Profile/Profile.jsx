import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../redux/userSlice";
import { updateUserApi } from "../../api/userApi";
import { toast } from "react-toastify";
import ChangePasswordModal from "./ChangePasswordModal";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiEdit3,
  FiSave,
  FiX,
  FiLock,
} from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import { Button, Modal } from "../../components/UI";
import Badge from "../../components/UI/Badge";
import AddressManager from "./AddressManager";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    avatar: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || null,
      });
      setPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const hasFile = formData.avatar instanceof File;
      let res;

      if (hasFile) {
        const data = new FormData();
        data.append("id", user.id);
        data.append("username", formData.username);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("address", formData.address);
        data.append("avatar", formData.avatar);
        res = await updateUserApi(data, true);
      } else {
        res = await updateUserApi({ id: user.id, ...formData });
      }

      if (res.errCode === 0) {
        toast.success("Cập nhật thành công!");
        dispatch(updateUser(res.data));
        setIsEditing(false);
      } else {
        toast.error(res.errMessage || "Lỗi server");
      }
    } catch (error) {
      toast.error("Không thể cập nhật. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return toast.error("Chưa chọn ảnh!");
    setAvatarLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        const res = await updateUserApi({ id: user.id, avatar: base64 });
        if (res.errCode === 0) {
          toast.success("Cập nhật avatar thành công!");
          setFormData((prev) => ({ ...prev, avatar: res.data.avatar }));
          setPreview(res.data.avatar);
          dispatch(updateUser({ ...user, avatar: res.data.avatar }));
          setShowAvatarModal(false);
        } else {
          toast.error(res.errMessage || "Lỗi cập nhật avatar");
        }
      } catch {
        toast.error("Không thể cập nhật avatar");
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  if (loading && !formData.username) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-dark-bg gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-surface-400 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[11px]">
          Đang tải thông tin cá nhân...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg py-12 transition-colors duration-300">
      <div className="container-custom">
        {/* Breadcrumb / Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-surface-400 dark:text-dark-text-secondary hover:text-primary transition-colors mb-8 font-bold text-[13px] uppercase tracking-widest"
        >
          <FiArrowLeft size={18} /> Quay lại trang chủ
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-2">
            Hồ sơ cá nhân
          </h1>
          <p className="text-surface-500 dark:text-dark-text-secondary font-medium">
            Quản lý thông tin tài khoản và bảo mật của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Avatar & Overview */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-dark-surface rounded-[32px] p-8 border border-surface-200 dark:border-dark-border shadow-soft text-center overflow-hidden relative">
              {/* Profile Background Decor */}
              <div className="absolute top-0 left-0 w-full h-24 bg-primary/5 dark:bg-primary/10 -z-0"></div>

              <div className="relative z-10">
                <div
                  className="group relative w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white dark:border-dark-surface shadow-xl cursor-pointer overflow-hidden"
                  onClick={() => setShowAvatarModal(true)}
                >
                  <img
                    src={formData.avatar || "/images/avatar-default.png"}
                    alt={formData.username}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiCamera className="text-white text-2xl" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-1">
                  {formData.username || "Người dùng"}
                </h2>
                <p className="text-sm text-surface-500 dark:text-dark-text-secondary mb-6">
                  {formData.email}
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    variant={isEditing ? "secondary" : "primary"}
                    className="w-full shadow-lg shadow-primary/10"
                    icon={isEditing ? FiX : FiEdit3}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "HỦY CHỈNH SỬA" : "CHỈNH SỬA HỒ SƠ"}
                  </Button>
                  <Button
                    variant="surface"
                    className="w-full text-surface-700 dark:text-dark-text-primary font-bold bg-white dark:bg-dark-bg border dark:border-dark-border"
                    icon={FiLock}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    ĐỔI MẬT KHẨU
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats or Info */}
            <div className=" bg-white dark:bg-dark-surface rounded-[32px] p-8 border border-surface-200 dark:border-dark-border shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <FiUser size={20} />
                </div>

                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">
                  Thành viên
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-border">
                  <span className="text-gray-500 dark:text-dark-text-secondary text-sm font-medium">
                    Xếp hạng
                  </span>

                  <Badge
                    variant={
                      user?.rank === "Platinum"
                        ? "brand"
                        : user?.rank === "Gold"
                          ? "warning"
                          : user?.rank === "Silver"
                            ? "primary"
                            : "secondary"
                    }
                  >
                    {user?.rank || "Đồng"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-border">
                  <span className="text-gray-500 dark:text-dark-text-secondary text-sm font-medium">
                    Điểm tích lũy
                  </span>

                  <span className="font-bold text-primary">
                    {user?.points || 0} pts
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500 dark:text-dark-text-secondary text-sm font-medium">
                    Tham gia từ
                  </span>

                  <span className="font-bold text-gray-900 dark:text-white">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Form */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-dark-surface rounded-[32px] p-8 md:p-10 border border-surface-200 dark:border-dark-border shadow-soft">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-surface-100 dark:border-dark-border">
                <h3 className="text-xl font-display font-bold text-surface-900 dark:text-white">
                  Chi tiết thông tin
                </h3>
                {isEditing && (
                  <Badge variant="warning" className="animate-pulse">
                    Chế độ chỉnh sửa
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Field Groups */}
                {[
                  {
                    name: "username",
                    label: "Họ và tên",
                    icon: FiUser,
                    placeholder: "Nguyễn Văn A",
                  },
                  {
                    name: "email",
                    label: "Email liên lạc",
                    icon: FiMail,
                    type: "email",
                    placeholder: "example@mail.com",
                  },
                  {
                    name: "phone",
                    label: "Số điện thoại",
                    icon: FiPhone,
                    placeholder: "09xx xxx xxx",
                  },
                  {
                    name: "address",
                    label: "Địa chỉ thường trú",
                    icon: FiMapPin,
                    placeholder: "Số nhà, đường, phường/xã, tỉnh/thành phố...",
                    colSpan: true,
                  },
                ].map((field) => (
                  <div
                    key={field.name}
                    className={`${field.colSpan ? "md:col-span-2" : ""} space-y-1.5`}
                  >
                    <label className="text-[11px] font-black text-surface-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1">
                      {field.label}
                    </label>
                    <div
                      className={`relative group transition-all duration-300 ${isEditing ? "opacity-100" : "opacity-80"}`}
                    >
                      <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? "text-primary" : "text-surface-300 dark:text-dark-text-secondary"}`}
                      >
                        <field.icon size={18} />
                      </div>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={field.placeholder}
                        className={`w-full h-14 pl-12 pr-4 bg-surface-50 dark:bg-dark-bg border-2 rounded-2xl text-[15px] font-bold outline-none transition-all ${
                          isEditing
                            ? "bg-white dark:bg-dark-surface border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/5 text-surface-900 dark:text-white"
                            : "border-transparent bg-surface-50 dark:bg-dark-bg text-surface-900 dark:text-white cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {isEditing && (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 flex justify-end gap-4"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setIsEditing(false)}
                  >
                    HỦY BỎ
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="shadow-xl shadow-primary/20"
                    icon={FiSave}
                    loading={loading}
                    onClick={handleSave}
                  >
                    LƯU THAY ĐỔI
                  </Button>
                </Motion.div>
              )}
            </div>

            {/* Address Management Section */}
            <div className="bg-white dark:bg-dark-surface rounded-[32px] p-8 md:p-10 border border-surface-200 dark:border-dark-border shadow-soft">
              <AddressManager />
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Cập nhật ảnh đại diện"
        size="md"
      >
        <div className="space-y-6 text-center">
          <div className="w-48 h-48 mx-auto rounded-full border-4 border-surface-100 dark:border-dark-border overflow-hidden shadow-inner bg-white dark:bg-dark-bg">
            <img
              src={preview || "/images/avatar-default.png"}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-14 bg-surface-50 dark:bg-dark-bg border-2 border-dashed border-surface-200 dark:border-dark-border rounded-2xl flex items-center justify-center gap-2 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
              <FiCamera className="text-surface-400 dark:text-dark-text-secondary group-hover:text-primary" />
              <span className="text-sm font-bold text-surface-600 dark:text-dark-text-secondary group-hover:text-primary">
                Chọn ảnh từ thiết bị
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowAvatarModal(false)}
            >
              HỦY BỎ
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              loading={avatarLoading}
              onClick={handleAvatarUpload}
            >
              CẬP NHẬT
            </Button>
          </div>
        </div>
      </Modal>

      <ChangePasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        userId={user?.id}
      />
    </div>
  );
};

export default Profile;
