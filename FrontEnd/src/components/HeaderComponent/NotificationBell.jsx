import React from "react";
import { Bell } from "lucide-react";
import { useNotificationBell } from "./notification/useNotificationBell";
import NotificationDropdownPanel from "./notification/NotificationDropdownPanel";
import NotificationBroadcastModal from "./notification/NotificationBroadcastModal";
import NotificationDetailModal from "./notification/NotificationDetailModal";

const NotificationBell = () => {
  const {
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
  } = useNotificationBell();

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative size-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
        title="Thông báo"
        aria-label="Thông báo"
      >
        <Bell className="size-[19px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-md shadow-rose-500/30 animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdownPanel
        showDropdown={showDropdown}
        unreadCount={unreadCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        userRole={user.role}
        onOpenAdminBroadcast={() => {
          setShowDropdown(false);
          setShowAdminModal(true);
        }}
        notifications={notifications}
        loading={loading}
        activeFilter={activeFilter}
        onChangeFilter={setActiveFilter}
        onMarkAllRead={handleMarkAllRead}
        onCloseDropdown={() => setShowDropdown(false)}
        copiedCode={copiedCode}
        onSelectNotification={handleNotificationClick}
        onCopyVoucher={handleCopyVoucher}
        onNavigateLink={handleNavigateNotificationLink}
        onDeleteNotification={handleDeleteNotification}
      />

      <NotificationBroadcastModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        broadcastForm={broadcastForm}
        setBroadcastForm={setBroadcastForm}
        sendingBroadcast={sendingBroadcast}
        onSubmit={handleSendBroadcast}
      />

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onNavigate={navigate}
      />
    </div>
  );
};

export default NotificationBell;
