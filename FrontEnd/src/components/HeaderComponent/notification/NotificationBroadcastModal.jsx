import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { m as Motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Users,
  User,
  Search,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "../../UI";
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

  if (!isOpen) return null;

  const handleSelectUser = (userItem) => {
    setBroadcastForm({
      ...broadcastForm,
      target: "user",
      targetUserId: userItem.id,
      selectedUser: userItem,
    });
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleClearSelectedUser = () => {
    setBroadcastForm({
      ...broadcastForm,
      targetUserId: null,
      selectedUser: null,
    });
    setSearchQuery("");
  };

  const isUserTarget = broadcastForm.target === "user";

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md">
        <Motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-broadcast-title"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-dark-border my-auto"
        >
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Send className="size-5" />
              </div>
              <div>
                <h3
                  id="notification-broadcast-title"
                  className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight"
                >
                  {isUserTarget ? "Gửi thông báo cá nhân" : "Phát thông báo hệ thống"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isUserTarget
                    ? "Gửi tin nhắn riêng tới 1 khách hàng cụ thể"
                    : "Gửi tin nhắn thông báo đến người dùng toàn cửa hàng"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng hộp thoại phát thông báo"
              className="size-9 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="size-4.5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Target Audience Switcher */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
                Phạm vi người nhận *
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-dark-bg rounded-2xl">
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
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !isUserTarget
                      ? "bg-white dark:bg-dark-surface text-primary shadow-xs"
                      : "text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
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
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isUserTarget
                      ? "bg-white dark:bg-dark-surface text-primary shadow-xs"
                      : "text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
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
                      className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Đổi người khác
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="size-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Gõ tên, email hoặc SĐT để tìm khách hàng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                          if (userSuggestions.length > 0) setShowSuggestions(true);
                        }}
                        className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl pl-10 pr-10 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
                      />
                      {searching && (
                        <Loader2 className="size-4 text-primary absolute right-3.5 animate-spin" />
                      )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && userSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl max-h-56 overflow-y-auto custom-scrollbar p-1.5">
                        {userSuggestions.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectUser(u)}
                            className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-bg text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt=""
                                  className="size-7 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="size-7 rounded-full bg-slate-200 dark:bg-dark-card text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
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
                <option value="system">⚙️ Hệ thống (Bảo trì / Hỗ trợ / Cập nhật)</option>
                <option value="promotion">🏷️ Khuyến mãi (Voucher / Tri ân)</option>
                <option value="order">📦 Đơn hàng</option>
                <option value="security">🔒 Bảo mật tài khoản</option>
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
                    ? "Ví dụ: 💬 Phản hồi yêu cầu của bạn từ Ban Quản Trị"
                    : "Ví dụ: 🎉 Siêu SALE Khuyến Mãi Khủng!"
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
                placeholder="Ví dụ: /profile?tab=tickets hoặc /orders"
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
        </Motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

export default NotificationBroadcastModal;
