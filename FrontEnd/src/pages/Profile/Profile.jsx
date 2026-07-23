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
  FiShield,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiStar,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Button, Modal, Loader } from "../../components/UI";
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
  const [activeTab, setActiveTab] = useState("info");
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
        toast.success("Cập nhật thông tin thành công!");
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
          toast.success("Cập nhật ảnh đại diện thành công!");
          setFormData((prev) => ({ ...prev, avatar: res.data.avatar }));
          setPreview(res.data.avatar);
          dispatch(updateUser({ ...user, avatar: res.data.avatar }));
          setShowAvatarModal(false);
        } else {
          toast.error(res.errMessage || "Lỗi cập nhật ảnh đại diện");
        }
      } catch {
        toast.error("Không thể cập nhật ảnh đại diện");
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  if (loading && !formData.username) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-bg gap-4">
        <Loader size="lg" className="text-primary" />
        <p className="text-slate-400 dark:text-dark-text-secondary font-black uppercase tracking-widest text-[11px] animate-pulse">
          Đang tải hồ sơ cá nhân...
        </p>
      </div>
    );
  }

  const getRankConfig = (rank) => {
    switch (rank) {
      case "Platinum":
        return {
          label: "Bạch Kim",
          gradient: "from-cyan-500 via-blue-600 to-indigo-600",
          badgeBg: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
          icon: FiStar,
        };
      case "Gold":
        return {
          label: "Vàng Sáng",
          gradient: "from-amber-400 via-yellow-500 to-orange-500",
          badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
          icon: FiAward,
        };
      case "Silver":
        return {
          label: "Bạc Sang",
          gradient: "from-slate-400 via-slate-500 to-zinc-600",
          badgeBg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          icon: FiAward,
        };
      default:
        return {
          label: "Thành Viên",
          gradient: "from-blue-500 to-indigo-600",
          badgeBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          icon: FiUser,
        };
    }
  };

  const rankConfig = getRankConfig(user?.rank);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-dark-bg py-6 sm:py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-6 sm:space-y-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 dark:text-dark-text-secondary hover:text-primary transition-colors font-bold text-xs sm:text-sm uppercase tracking-widest active:scale-95"
        >
          <FiArrowLeft size={16} /> Quay lại trang chủ
        </Link>

        {/* Hero Cover Header Card */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] border border-slate-200/80 dark:border-dark-border shadow-xl overflow-hidden relative">
          {/* Gradient Mesh Banner */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
            <div className="absolute -bottom-10 -right-10 size-48 sm:size-64 bg-white/10 rounded-full blur-2xl" />
          </div>

          {/* Profile Overview Bar */}
          <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-0 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4 sm:mb-6">
              {/* Avatar Box */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div
                  className="group relative size-28 sm:size-36 rounded-full border-4 border-white dark:border-dark-surface shadow-2xl cursor-pointer overflow-hidden bg-slate-100 dark:bg-dark-bg shrink-0 ring-4 ring-primary/20"
                  onClick={() => setShowAvatarModal(true)}
                  title="Đổi ảnh đại diện"
                >
                  <img
                    src={formData.avatar || "/images/avatar-default.png"}
                    alt={formData.username}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiCamera className="text-white text-2xl mb-1" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Đổi ảnh</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {formData.username || "Người dùng"}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider shadow-xs ${rankConfig.badgeBg}`}
                    >
                      <rankConfig.icon className="text-xs" />
                      {rankConfig.label}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-dark-text-secondary">
                    {formData.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant={isEditing ? "secondary" : "primary"}
                  size="md"
                  className="flex-1 sm:flex-initial shadow-lg shadow-primary/10 rounded-2xl min-h-[44px]"
                  icon={isEditing ? FiX : FiEdit3}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "HỦY CHỈNH SỬA" : "CHỈNH SỬA HỒ SƠ"}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 sm:flex-initial font-bold bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-text-primary rounded-2xl min-h-[44px]"
                  icon={FiLock}
                  onClick={() => setShowPasswordModal(true)}
                >
                  ĐỔI MẬT KHẨU
                </Button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-slate-100 dark:border-dark-border">
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-dark-bg/60 border border-slate-100 dark:border-dark-border flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shrink-0">
                  <FiAward />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Hạng hội viên</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user?.rank || "Thành viên Đồng"}
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-dark-bg/60 border border-slate-100 dark:border-dark-border flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0">
                  <FiStar />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Điểm thưởng</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {user?.points || 0} PTS
                  </p>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-dark-bg/60 border border-slate-100 dark:border-dark-border flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg shrink-0">
                  <FiCalendar />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Tham gia từ</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Tabs Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-soft overflow-x-auto touch-pan-x">
          {[
            { id: "info", label: "Thông tin cá nhân", icon: FiUser },
            { id: "address", label: "Sổ địa chỉ nhận hàng", icon: FiMapPin },
            { id: "security", label: "Bảo mật & Tài khoản", icon: FiShield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 min-w-[140px] sm:min-w-[180px] py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer z-10 ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <Motion.div
                    layoutId="activeProfileTab"
                    className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {activeTab === "info" ? (
            <Motion.div
              key="info"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] p-4 sm:p-8 md:p-10 border border-slate-200/80 dark:border-dark-border shadow-soft"
            >
              <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-100 dark:border-dark-border">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Chi tiết hồ sơ
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-dark-text-secondary font-medium mt-0.5">
                    Quản lý thông tin định danh và liên lạc chính thức.
                  </p>
                </div>

                {isEditing && (
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                    Đang chỉnh sửa
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    name: "username",
                    label: "Họ và tên người dùng",
                    icon: FiUser,
                    placeholder: "Nhập họ tên...",
                  },
                  {
                    name: "email",
                    label: "Địa chỉ Email",
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
                    label: "Địa chỉ mặc định",
                    icon: FiMapPin,
                    placeholder: "Số nhà, đường, phường/xã, quận/huyện...",
                    colSpan: true,
                  },
                ].map((field) => (
                  <div
                    key={field.name}
                    className={`${field.colSpan ? "md:col-span-2" : ""} space-y-1.5`}
                  >
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1">
                      {field.label}
                    </label>
                    <div className="relative group">
                      <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                          isEditing ? "text-primary" : "text-slate-400 dark:text-slate-600"
                        }`}
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
                        className={`w-full h-13 pl-12 pr-4 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl text-sm font-bold outline-none transition-all ${
                          isEditing
                            ? "bg-white dark:bg-dark-surface border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-900 dark:text-white"
                            : "border-transparent text-slate-700 dark:text-slate-300 cursor-not-allowed"
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
                  className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border flex justify-end gap-3"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    className="min-h-[44px]"
                    onClick={() => setIsEditing(false)}
                  >
                    HỦY BỎ
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="shadow-xl shadow-primary/20 min-h-[44px]"
                    icon={FiSave}
                    loading={loading}
                    onClick={handleSave}
                  >
                    LƯU THAY ĐỔI
                  </Button>
                </Motion.div>
              )}
            </Motion.div>
          ) : activeTab === "address" ? (
            <Motion.div
              key="address"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] p-4 sm:p-8 md:p-10 border border-slate-200/80 dark:border-dark-border shadow-soft"
            >
              <AddressManager />
            </Motion.div>
          ) : (
            <Motion.div
              key="security"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] p-4 sm:p-8 md:p-10 border border-slate-200/80 dark:border-dark-border shadow-soft space-y-6"
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-dark-border">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Bảo mật tài khoản
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-dark-text-secondary font-medium mt-0.5">
                    Quản lý mật khẩu và thiết lập an toàn cho tài khoản TienTech.
                  </p>
                </div>
                <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                  <FiCheckCircle />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-200/60 dark:border-dark-border flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-base">
                        <FiLock />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Mật khẩu đăng nhập</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-dark-text-secondary font-medium">
                      Thay đổi định kỳ mật khẩu để bảo vệ thông tin cá nhân và đơn hàng.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center min-h-[44px]"
                    icon={FiLock}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    ĐỔI MẬT KHẨU NGAY
                  </Button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-200/60 dark:border-dark-border flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-base">
                        <FiShield />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Trạng thái xác minh</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-dark-text-secondary font-medium">
                      Tài khoản của bạn đã được xác minh địa chỉ Email thành công.
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <FiCheckCircle /> Đã xác thực an toàn
                  </span>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar Upload Modal with Backdrop Blur Loading Spinner */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Cập nhật ảnh đại diện"
        size="md"
        loading={avatarLoading}
        loadingMessage="Đang tải ảnh đại diện..."
      >
        <div className="space-y-6 text-center">
          <div className="size-44 sm:size-48 mx-auto rounded-full border-4 border-slate-200 dark:border-dark-border overflow-hidden shadow-2xl bg-slate-100 dark:bg-dark-bg relative group">
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
            <div className="w-full h-14 bg-slate-50 dark:bg-dark-bg border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl flex items-center justify-center gap-2 group-hover:border-primary group-hover:bg-primary/5 transition-all">
              <FiCamera className="text-slate-400 group-hover:text-primary transition-colors text-lg" />
              <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-dark-text-secondary group-hover:text-primary transition-colors">
                Tải ảnh mới từ thiết bị
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1 min-h-[44px]"
              onClick={() => setShowAvatarModal(false)}
            >
              HỦY BỎ
            </Button>
            <Button
              variant="primary"
              className="flex-1 min-h-[44px]"
              loading={avatarLoading}
              onClick={handleAvatarUpload}
            >
              CẬP NHẬT NGAY
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
