import React, { useState, useEffect, useRef } from "react";
import { m as Motion } from "framer-motion";
import {
  Send,
  Users,
  User,
  Search,
  Check,
  X,
} from "lucide-react";
import { Modal, Button } from "../../UI";
import { getAllUsersApi } from "../../../api/userApi";

const NotificationBroadcastModal = ({
  isOpen,
  onClose,
  broadcastForm,
  setBroadcastForm,
  sendingBroadcast,
  onSubmit,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounced user search when typing
  useEffect(() => {
    if (!isOpen || broadcastForm.target !== "user" || broadcastForm.selectedUser) {
      setUserSuggestions([]);
      return;
    }

    const query = searchQuery.trim();
    if (!query) {
      setUserSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await getAllUsersApi(1, 8, query);
        if (res?.errCode === 0) {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data?.users || [];
          setUserSuggestions(list);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, broadcastForm.target, broadcastForm.selectedUser]);

  // Handle clicking outside suggestions dropdown
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelectUser = (user) => {
    setBroadcastForm({
      ...broadcastForm,
      targetUserId: user.id,
      selectedUser: user,
    });
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleClearSelectedUser = () => {
    setBroadcastForm({
      ...broadcastForm,
      targetUserId: null,
      selectedUser: null,
    });
  };

  const isUserTarget = broadcastForm.target === "user";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isUserTarget ? "Gửi thông báo cá nhân" : "Phát thông báo hệ thống"}
      subtitle={
        isUserTarget
          ? "Gửi tin nhắn riêng tới 1 khách hàng cụ thể"
          : "Gửi tin nhắn thông báo đến người dùng toàn cửa hàng"
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Target Audience Switcher */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
            Phạm vi người nhận *
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-dark-bg rounded-2xl relative">
            <button
              type="button"
              onClick={() =>
                setBroadcastForm({
                  ...broadcastForm,
                  target: "all",
                  targetUserId: null,
                  selectedUser: null,
                })
              }
              className={`relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer z-10 ${
                !isUserTarget
                  ? "text-primary dark:text-primary-light"
                  : "text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {!isUserTarget && (
                <Motion.div
                  layoutId="broadcastTargetIndicator"
                  className="absolute inset-0 bg-white dark:bg-dark-surface rounded-xl shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Users className="size-3.5" />
              <span>Toàn hệ thống</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setBroadcastForm({
                  ...broadcastForm,
                  target: "user",
                })
              }
              className={`relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer z-10 ${
                isUserTarget
                  ? "text-primary dark:text-primary-light"
                  : "text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {isUserTarget && (
                <Motion.div
                  layoutId="broadcastTargetIndicator"
                  className="absolute inset-0 bg-white dark:bg-dark-surface rounded-xl shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <User className="size-3.5" />
              <span>Gửi riêng cá nhân</span>
            </button>
          </div>
        </div>

        {/* User Search & Selection for Target === 'user' */}
        {isUserTarget && (
          <div ref={searchContainerRef} className="space-y-1.5 relative">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1">
              Chọn người dùng nhận tin *
            </label>

            {broadcastForm.selectedUser ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {broadcastForm.selectedUser.avatar ? (
                    <img
                      src={broadcastForm.selectedUser.avatar}
                      alt=""
                      className="size-9 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                      {(broadcastForm.selectedUser.username || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {broadcastForm.selectedUser.username}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-dark-text-secondary truncate">
                      {broadcastForm.selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedUser}
                  className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-dark-card text-slate-400 hover:text-rose-500 transition-colors"
                  title="Chọn người khác"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email hoặc ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (userSuggestions.length > 0) setShowSuggestions(true);
                    }}
                    className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
                  />
                  {searching && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && userSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl max-h-56 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                    {userSuggestions.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-card transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt=""
                              className="size-7 rounded-full object-cover shrink-0 border"
                            />
                          ) : (
                            <div className="size-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                              {(u.username || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {u.username}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-bg text-slate-500 shrink-0">
                          #{u.id}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
            Loại thông báo *
          </label>
          <select
            value={broadcastForm.type}
            onChange={(e) =>
              setBroadcastForm({ ...broadcastForm, type: e.target.value })
            }
            className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
          >
            <option value="system">Hệ thống (Bảo trì / Hỗ trợ / Cập nhật)</option>
            <option value="promotion">Khuyến mãi (Voucher / Tri ân)</option>
            <option value="order">Đơn hàng</option>
            <option value="security">Bảo mật tài khoản</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
            Tiêu đề thông báo *
          </label>
          <input
            type="text"
            required
            placeholder={
              isUserTarget
                ? "Ví dụ: Phản hồi yêu cầu của bạn từ Ban Quản Trị"
                : "Ví dụ: Siêu SALE Khuyến Mãi Khủng!"
            }
            value={broadcastForm.title}
            onChange={(e) =>
              setBroadcastForm({ ...broadcastForm, title: e.target.value })
            }
            className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
            Nội dung chi tiết *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Nhập thông điệp gửi tới khách hàng..."
            value={broadcastForm.message}
            onChange={(e) =>
              setBroadcastForm({ ...broadcastForm, message: e.target.value })
            }
            className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl p-4 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
            Đường dẫn liên kết (Link tùy chọn)
          </label>
          <input
            type="text"
            placeholder="Ví dụ: /support-tickets hoặc /orders"
            value={broadcastForm.link}
            onChange={(e) =>
              setBroadcastForm({ ...broadcastForm, link: e.target.value })
            }
            className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-dark-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={sendingBroadcast}
            icon={Send}
          >
            {isUserTarget
              ? `Gửi Riêng Cho ${broadcastForm.selectedUser?.username || "Cá Nhân"}`
              : "Gửi Ngay Cho Tất Cả"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NotificationBroadcastModal;
