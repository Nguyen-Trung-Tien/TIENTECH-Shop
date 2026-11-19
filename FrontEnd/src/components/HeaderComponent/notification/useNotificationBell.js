import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllReadApi,
  deleteNotificationApi,
  sendBroadcastNotificationApi,
} from "../../../api/notificationApi";
import { initUserSocket } from "../../../utils/socket";
import {
  playNotificationChime,
  isNotificationSoundEnabled,
  toggleNotificationSound,
} from "../../../utils/notificationSound";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
} from "../../../utils/toastHelper";

const INITIAL_BROADCAST_FORM = {
  title: "",
  message: "",
  type: "system",
  link: "",
  target: "all",
};

export const useNotificationBell = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [broadcastForm, setBroadcastForm] = useState(INITIAL_BROADCAST_FORM);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isNotificationSoundEnabled());
  const [copiedCode, setCopiedCode] = useState(null);

  const recentAlertsRef = useRef(new Map());
  const batchOrderCountRef = useRef(0);
  const batchTimerRef = useRef(null);
  const fetchDebounceRef = useRef(null);

  const handleToggleSound = useCallback(() => {
    const next = toggleNotificationSound();
    setSoundEnabled(next);
    if (next) playNotificationChime();
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await getNotificationsApi(1, 15, activeFilter);
      if (res.errCode === 0) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, activeFilter]);

  const triggerDebouncedFetch = useCallback(() => {
    if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
    fetchDebounceRef.current = setTimeout(() => {
      fetchNotifications();
    }, 400);
  }, [fetchNotifications]);

  const shouldSuppressDuplicate = useCallback((key) => {
    if (!key) return false;
    const now = Date.now();
    const lastTime = recentAlertsRef.current.get(key);
    if (recentAlertsRef.current.size > 50) {
      recentAlertsRef.current.clear();
    }
    if (lastTime && now - lastTime < 5000) {
      return true;
    }
    recentAlertsRef.current.set(key, now);
    return false;
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handleSync = (event) => {
      if (event?.detail?.source !== "bell") {
        triggerDebouncedFetch();
      }
    };
    window.addEventListener("tientech:notifications_sync", handleSync);

    let socket = null;
    let handleNewOrder = null;
    let handleOrderStatusUpdated = null;
    let handleNotification = null;

    if (user) {
      socket = initUserSocket(user);

      handleNewOrder = (data) => {
        triggerDebouncedFetch();
        const orderKey =
          data?.orderCode ||
          data?.orderId ||
          (typeof data?.message === "string" ? data.message : "new_order");
        if (shouldSuppressDuplicate(`order_${orderKey}`)) return;

        playNotificationChime();

        const recentOrderNotifKey = data?.orderCode
          ? `order_notif_${data.orderCode}`
          : null;
        if (
          recentOrderNotifKey &&
          recentAlertsRef.current.has(recentOrderNotifKey) &&
          Date.now() - recentAlertsRef.current.get(recentOrderNotifKey) < 2000 &&
          batchOrderCountRef.current === 0
        ) {
          batchOrderCountRef.current = 1;
        } else if (batchOrderCountRef.current === 0) {
          batchOrderCountRef.current = 1;
          const msg = data?.message || "Có đơn hàng mới từ khách hàng!";
          showInfoToast(`🔔 ${msg}`, { toastId: "active_order_batch" });
        } else {
          batchOrderCountRef.current += 1;
          const batchMsg = `🔔 Hệ thống vừa nhận thêm ${batchOrderCountRef.current} đơn hàng mới!`;
          if (toast.isActive("active_order_batch")) {
            toast.update("active_order_batch", {
              render: batchMsg,
              autoClose: 3500,
            });
          } else {
            showInfoToast(batchMsg, {
              toastId: "active_order_batch",
              autoClose: 3500,
            });
          }
        }

        if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
        batchTimerRef.current = setTimeout(() => {
          batchOrderCountRef.current = 0;
        }, 3000);
      };

      handleOrderStatusUpdated = (data) => {
        triggerDebouncedFetch();
        if (!data?.message) return;
        const msgKey = `msg_${data.message}`;
        if (shouldSuppressDuplicate(msgKey)) return;

        playNotificationChime();
        const key = `status_${data.orderId || data.orderCode}_${data.status}`;
        if (shouldSuppressDuplicate(key)) return;
        showInfoToast(`🔔 ${data.message}`, { toastId: key });
      };

      handleNotification = (data) => {
        triggerDebouncedFetch();
        if (!data?.title) return;

        const notifKey = data.id
          ? `notif_${data.id}`
          : `${data.title}_${data.message || ""}`;
        if (shouldSuppressDuplicate(notifKey)) return;

        if (data.message) {
          recentAlertsRef.current.set(`msg_${data.message}`, Date.now());
          const orderCodeMatch = data.message.match(/#([A-Za-z0-9_-]+)/);
          if (orderCodeMatch?.[1]) {
            recentAlertsRef.current.set(
              `order_notif_${orderCodeMatch[1]}`,
              Date.now(),
            );
          }
        }

        setUnreadCount((prev) => prev + 1);
        const matchesFilter =
          activeFilter === "all" ||
          activeFilter === "unread" ||
          activeFilter === (data.type || "system");
        if (matchesFilter) {
          const incomingItem = {
            id:
              data.id ||
              `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            userId: data.userId ?? user.id,
            title: data.title,
            message: data.message || "",
            type: data.type || "system",
            link: data.link || null,
            metadata: data.metadata || null,
            isRead: false,
            createdAt: data.createdAt || new Date().toISOString(),
          };
          setNotifications((prev) => {
            if (data.id && prev.some((item) => item.id === data.id)) {
              return prev;
            }
            return [incomingItem, ...prev].slice(0, 15);
          });
        }

        playNotificationChime();

        if (data.type === "order" && batchOrderCountRef.current > 0) {
          return;
        }

        const text = data.message ? `: ${data.message}` : "";
        showInfoToast(`🔔 ${data.title}${text}`, { toastId: `notif_${notifKey}` });
      };

      if (user.role === "admin" || user.role === "root") {
        socket.on("new_order", handleNewOrder);
      }
      socket.on("order_status_updated", handleOrderStatusUpdated);
      socket.on("notification", handleNotification);
    }

    return () => {
      window.removeEventListener("tientech:notifications_sync", handleSync);
      if (socket) {
        if (user?.role === "admin" || user?.role === "root") {
          socket.off("new_order", handleNewOrder);
        }
        socket.off("order_status_updated", handleOrderStatusUpdated);
        socket.off("notification", handleNotification);
      }
      if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
    };
  }, [user, activeFilter, fetchNotifications, triggerDebouncedFetch, shouldSuppressDuplicate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifySync = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("tientech:notifications_sync", { detail: { source: "bell" } }),
    );
  }, []);

  const handleMarkItemReadOptimistic = useCallback(
    (n) => {
      if (n.isRead) return;
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (!String(n.id).startsWith("temp_")) {
        markAsReadApi(n.id)
          .then(() => notifySync())
          .catch(() => {});
      }
    },
    [notifySync],
  );

  const handleNotificationClick = useCallback(
    async (n) => {
      if (!n.isRead) {
        try {
          setNotifications((prev) =>
            prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          if (!String(n.id).startsWith("temp_")) {
            await markAsReadApi(n.id);
            notifySync();
          }
          fetchNotifications();
        } catch (err) {
          console.error("Error marking as read:", err);
        }
      }
      setShowDropdown(false);
      setSelectedNotification(n);
    },
    [notifySync, fetchNotifications],
  );

  const handleDeleteNotification = useCallback(
    async (e, id) => {
      e.stopPropagation();
      try {
        const target = notifications.find((item) => item.id === id);
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        if (target && !target.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        if (!String(id).startsWith("temp_")) {
          const res = await deleteNotificationApi(id);
          if (res?.errCode === 0) {
            notifySync();
            fetchNotifications();
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    [notifications, notifySync, fetchNotifications],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      const res = await markAllReadApi();
      if (res?.errCode === 0) {
        showSuccessToast("Đã đánh dấu tất cả là đã đọc!");
        notifySync();
      }
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all read:", err);
      showErrorToast(err, "Lỗi khi đánh dấu đã đọc");
    }
  }, [notifySync, fetchNotifications]);

  const handleSendBroadcast = useCallback(
    async (e) => {
      e.preventDefault();
      if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
        return showWarningToast("Vui lòng nhập tiêu đề và nội dung!");
      }
      setSendingBroadcast(true);
      try {
        const res = await sendBroadcastNotificationApi(broadcastForm);
        if (res.errCode === 0) {
          showSuccessToast(res.message, "Đã phát thông báo thành công!");
          setShowAdminModal(false);
          setBroadcastForm(INITIAL_BROADCAST_FORM);
          fetchNotifications();
        } else {
          showErrorToast(res.errMessage, "Không thể gửi thông báo");
        }
      } catch (err) {
        console.error(err);
        showErrorToast(err, "Lỗi gửi thông báo");
      } finally {
        setSendingBroadcast(false);
      }
    },
    [broadcastForm, fetchNotifications],
  );

  const handleCopyVoucher = useCallback((e, voucherCode) => {
    e.stopPropagation();
    navigator.clipboard.writeText(voucherCode);
    setCopiedCode(voucherCode);
    showSuccessToast(`Đã sao chép mã ưu đãi: ${voucherCode}`);
    setTimeout(() => setCopiedCode(null), 2500);
  }, []);

  const handleNavigateNotificationLink = useCallback(
    (e, n) => {
      e.stopPropagation();
      handleMarkItemReadOptimistic(n);
      setShowDropdown(false);
      navigate(n.link);
    },
    [handleMarkItemReadOptimistic, navigate],
  );

  return {
    user,
    navigate,
    dropdownRef,
    notifications,
    unreadCount,
    showDropdown,
    setShowDropdown,
    loading,
    activeFilter,
    setActiveFilter,
    showAdminModal,
    setShowAdminModal,
    selectedNotification,
    setSelectedNotification,
    broadcastForm,
    setBroadcastForm,
    sendingBroadcast,
    soundEnabled,
    copiedCode,
    handleToggleSound,
    handleNotificationClick,
    handleDeleteNotification,
    handleMarkAllRead,
    handleSendBroadcast,
    handleCopyVoucher,
    handleNavigateNotificationLink,
  };
};
