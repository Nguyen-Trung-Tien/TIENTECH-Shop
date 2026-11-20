import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { updateUser } from "../../redux/userSlice";
import { updateUserApi } from "../../api/userApi";
import { showErrorToast, showSuccessToast } from "../../utils/toastHelper";
import ChangePasswordModal from "./ChangePasswordModal";
import { User, MapPin, Shield } from "lucide-react";
import { m as Motion, AnimatePresence } from "framer-motion";
import { Loader, PageShell } from "../../components/UI";
import AddressManager from "./AddressManager";
import ProfileHeroCard from "./components/ProfileHeroCard";
import ProfileInfoTab from "./components/ProfileInfoTab";
import ProfileSecurityTab from "./components/ProfileSecurityTab";
import ProfileAvatarModal from "./components/ProfileAvatarModal";
import { useDocumentMeta } from "../../features/shared/hooks/useDocumentMeta";

const Profile = () => {
  useDocumentMeta({
    title: "Hồ sơ cá nhân",
    description: "Quản lý thông tin tài khoản, sổ địa chỉ và bảo mật tại TIENTECH Shop.",
    canonicalPath: "/profile",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  // Redirect legacy tickets tab to unified /support-tickets page
  useEffect(() => {
    if (tabFromUrl === "tickets") {
      const ticketId = searchParams.get("ticketId");
      navigate(
        ticketId
          ? `/support-tickets?ticketId=${encodeURIComponent(ticketId)}`
          : "/support-tickets",
        { replace: true }
      );
    }
  }, [tabFromUrl, searchParams, navigate]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    avatar: null,
  });

  const [receiveEmail, setReceiveEmail] = useState(true);
  const [emailToggleLoading, setEmailToggleLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState(
    ["info", "address", "security"].includes(tabFromUrl)
      ? tabFromUrl
      : "info"
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (tabFromUrl && ["info", "address", "security"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tabId);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

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
      setReceiveEmail(user.receiveEmail !== false);
    }
  }, [user]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleToggleEmailNotification = useCallback(async () => {
    if (!user?.id) return;
    const nextVal = !receiveEmail;
    setEmailToggleLoading(true);
    try {
      const res = await updateUserApi({ id: user.id, receiveEmail: nextVal });
      if (res.errCode === 0) {
        setReceiveEmail(nextVal);
        dispatch(updateUser({ ...user, receiveEmail: nextVal }));
        showSuccessToast(
          nextVal
            ? "Đã bật nhận thông báo & khuyến mãi qua Email!"
            : "Đã tắt nhận thông báo qua Email thành công!",
        );
      } else {
        showErrorToast(res.errMessage, "Không thể cập nhật thiết lập email");
      }
    } catch (error) {
      showErrorToast(error, "Lỗi khi thay đổi cài đặt nhận email");
      console.error(error);
    } finally {
      setEmailToggleLoading(false);
    }
  }, [user, receiveEmail, dispatch]);

  const handleSave = useCallback(async () => {
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
        data.append("receiveEmail", receiveEmail);
        data.append("avatar", formData.avatar);
        res = await updateUserApi(data, true);
      } else {
        res = await updateUserApi({ id: user.id, ...formData, receiveEmail });
      }

      if (res.errCode === 0) {
        showSuccessToast("Cập nhật thông tin thành công!");
        dispatch(updateUser(res.data));
        setIsEditing(false);
      } else {
        showErrorToast(res.errMessage, "Không thể cập nhật thông tin cá nhân");
      }
    } catch (error) {
      showErrorToast(error, "Không thể cập nhật thông tin cá nhân");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, formData, receiveEmail, dispatch]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleAvatarUpload = useCallback(async () => {
    if (!selectedFile) return showErrorToast("Chưa chọn ảnh!");
    setAvatarLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        const res = await updateUserApi({ id: user.id, avatar: base64 });
        if (res.errCode === 0) {
          showSuccessToast("Cập nhật ảnh đại diện thành công!");
          setFormData((prev) => ({ ...prev, avatar: res.data.avatar }));
          setPreview(res.data.avatar);
          dispatch(updateUser({ ...user, avatar: res.data.avatar }));
          setShowAvatarModal(false);
        } else {
          showErrorToast(res.errMessage, "Lỗi cập nhật ảnh đại diện");
        }
      } catch (err) {
        showErrorToast(err, "Không thể cập nhật ảnh đại diện");
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  }, [selectedFile, user, dispatch]);

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

  return (
    <PageShell
      eyebrow="ACCOUNT PROFILE // SETTINGS"
      title="Hồ sơ cá nhân"
      subtitle="Quản lý thông tin tài khoản, địa chỉ giao hàng và bảo mật."
      backTo="/"
      backLabel="Quay lại trang chủ"
      maxWidthClass="max-w-6xl mx-auto px-3 sm:px-6 space-y-6 sm:space-y-8"
    >
      <ProfileHeroCard
        user={user}
        formData={formData}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing((prev) => !prev)}
        onOpenAvatarModal={() => setShowAvatarModal(true)}
        onOpenPasswordModal={() => setShowPasswordModal(true)}
      />

      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-soft overflow-x-auto touch-pan-x">
        {[
          { id: "info", label: "Thông tin cá nhân", Icon: User },
          { id: "address", label: "Sổ địa chỉ nhận hàng", Icon: MapPin },
          { id: "security", label: "Bảo mật & Cài đặt", Icon: Shield },
        ].map((tab) => {
          const Icon = tab.Icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
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
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "info" ? (
          <ProfileInfoTab
            formData={formData}
            isEditing={isEditing}
            onChange={handleChange}
            onCancelEdit={() => setIsEditing(false)}
            onSave={handleSave}
            loading={loading}
            receiveEmail={receiveEmail}
            emailToggleLoading={emailToggleLoading}
            onToggleEmailNotification={handleToggleEmailNotification}
          />
        ) : activeTab === "address" ? (
          <Motion.div
            key="address"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200/80 dark:border-dark-border shadow-soft"
          >
            <AddressManager />
          </Motion.div>
        ) : (
          <ProfileSecurityTab
            receiveEmail={receiveEmail}
            emailToggleLoading={emailToggleLoading}
            onToggleEmailNotification={handleToggleEmailNotification}
            onOpenPasswordModal={() => setShowPasswordModal(true)}
          />
        )}
      </AnimatePresence>

      <ProfileAvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        preview={preview}
        avatarLoading={avatarLoading}
        onFileChange={handleFileChange}
        onUpload={handleAvatarUpload}
      />

      <ChangePasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        userId={user?.id}
      />
    </PageShell>
  );
};

export default Profile;
