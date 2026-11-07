import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiUser,
  FiLogOut,
  FiHome,
  FiMenu,
  FiSun,
  FiMoon,
  FiPlus,
  FiChevronDown,
} from "react-icons/fi";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { logoutUserApi } from "../../../api/userApi";
import { removeUser } from "../../../redux/userSlice";
import { clearCart } from "../../../redux/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useCurrentUser } from "../../../hooks/useUser";
import Logo from "../../../components/UI/Logo";
import NotificationBell from "../../../components/HeaderComponent/NotificationBell";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import CommandPaletteModal from "./CommandPaletteModal";

const ROUTE_LABELS = {
  "/admin": "Bảng điều khiển",
  "/admin/dashboard": "Bảng điều khiển",
  "/admin/orders": "Quản lý đơn hàng",
  "/admin/products": "Quản lý sản phẩm",
  "/admin/revenue": "Báo cáo doanh thu",
  "/admin/categories": "Danh mục sản phẩm",
  "/admin/brands": "Thương hiệu đối tác",
  "/admin/users": "Khách hàng & Người dùng",
  "/admin/vouchers": "Mã giảm giá & Khuyến mãi",
  "/admin/reviews": "Đánh giá & Phản hồi",
  "/admin/payment": "Giao dịch thanh toán",
  "/admin/settings": "Cài đặt & Vận hành",
  "/admin/search": "Tìm kiếm toàn cục",
};

const HeaderAdmin = ({ toggleSidebar, isCollapsed, theme, toggleTheme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const reduxUser = useSelector((state) => state.user.user);
  const { data: resUser } = useCurrentUser();
  const user = resUser?.data || reduxUser;

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName =
    user?.username?.length > 15
      ? user.username.slice(0, 15) + "..."
      : user?.username || user?.email || "Admin";

  // Global Keyboard shortcut listener (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutUserApi();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      dispatch(removeUser());
      dispatch(clearCart());
      navigate("/admin/login", { replace: true });
      toast.success("Đăng xuất thành công!");
      setLoggingOut(false);
      setShowProfileMenu(false);
    }
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (ROUTE_LABELS[path]) return ROUTE_LABELS[path];
    if (path.startsWith("/admin/order")) return "Chi tiết đơn hàng";
    if (path.startsWith("/admin/product")) return "Chỉnh sửa sản phẩm";
    return "Tổng quan";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full max-w-full overflow-x-clip items-center justify-between border-b border-slate-200/80 dark:border-dark-border bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md px-3 sm:px-6 md:px-8 shadow-xs transition-colors duration-300">
      {/* Left Area: Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Menu điều hướng quản trị"
          className="flex size-10 items-center justify-center rounded-xl text-slate-500 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors cursor-pointer active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-dark-border"
          title={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity shrink-0"
          title="Về trang chủ TienTech Shop"
        >
          <Logo size="sm" className="[&>div:last-child]:hidden sm:[&>div:last-child]:flex" />
        </Link>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs font-bold text-slate-400 dark:text-dark-text-secondary pl-3 border-l border-slate-200 dark:border-dark-border">
          <span className="uppercase tracking-widest text-[9px] bg-slate-100 dark:bg-dark-bg text-slate-500 px-2 py-0.5 rounded-md font-mono font-black border border-slate-200/60 dark:border-dark-border">
            ADMIN
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-900 dark:text-white font-extrabold tracking-tight truncate max-w-[200px]">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={() => setShowCommandPalette(true)}
          className="w-full flex items-center justify-between h-10 px-3.5 bg-slate-100/70 dark:bg-dark-bg/70 hover:bg-white dark:hover:bg-dark-surface border border-slate-200/70 dark:border-dark-border rounded-xl text-xs text-slate-400 dark:text-dark-text-secondary hover:text-slate-700 dark:hover:text-white hover:border-primary/50 transition-all cursor-pointer shadow-2xs group"
          title="Mở bảng lệnh hoặc tìm kiếm toàn hệ thống (Ctrl + K)"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <FiSearch className="text-slate-400 group-hover:text-primary transition-colors text-sm shrink-0" />
            <span className="truncate font-medium">Tìm sản phẩm, đơn hàng, khách hàng...</span>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-black text-slate-400 dark:text-dark-text-secondary bg-white dark:bg-dark-card rounded border border-slate-200 dark:border-dark-border shadow-xs shrink-0 group-hover:border-primary/40">
            Ctrl K
          </span>
        </button>
      </div>

      {/* Right Area: Actions, Notification, Theme, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={() => setShowCommandPalette(true)}
          className="flex md:hidden size-9 sm:size-10 items-center justify-center rounded-xl bg-slate-100/70 dark:bg-dark-bg/70 text-slate-600 dark:text-dark-text-secondary border border-slate-200/80 dark:border-dark-border hover:text-primary transition-all cursor-pointer active:scale-95"
          title="Tìm kiếm"
          aria-label="Tìm kiếm toàn hệ thống"
        >
          <FiSearch className="text-base" />
        </button>

        {/* Quick Add Product Shortcut */}
        <Link
          to="/admin/products"
          className="hidden xl:flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all active:scale-95"
          title="Quản lý & Thêm sản phẩm mới"
        >
          <FiPlus className="text-sm" />
          <span>Thêm hàng</span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-slate-100/70 dark:bg-dark-bg/70 text-slate-600 dark:text-dark-text-secondary border border-slate-200/80 dark:border-dark-border hover:text-primary transition-all cursor-pointer active:scale-95"
          title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
          aria-label="Chuyển chế độ màu sắc"
        >
          {theme === "dark" ? (
            <FiSun className="text-amber-400 hover:rotate-90 transition-transform duration-300" />
          ) : (
            <FiMoon className="hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Home Link */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="hidden sm:flex size-9 sm:size-10 items-center justify-center rounded-xl bg-slate-100/70 dark:bg-dark-bg/70 text-slate-600 dark:text-dark-text-secondary border border-slate-200/80 dark:border-dark-border hover:text-primary transition-all cursor-pointer active:scale-95"
          title="Về trang chủ khách hàng"
          aria-label="Về trang chủ khách hàng"
        >
          <FiHome className="text-base" />
        </button>

        {/* Realtime Notification Bell */}
        <NotificationBell />

        <div className="h-6 w-[1px] bg-slate-200 dark:border-dark-border mx-1"></div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
            className="flex items-center gap-2.5 rounded-xl p-1 pr-2 hover:bg-slate-100/80 dark:hover:bg-dark-bg transition-colors cursor-pointer active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-dark-border"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="size-8 rounded-lg object-cover ring-2 ring-primary/20 shrink-0"
              />
            ) : (
              <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-dark-text-secondary uppercase font-bold tracking-wider">
                Quản trị viên
              </p>
            </div>
            <FiChevronDown className="text-slate-400 text-xs hidden md:block" />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-dark-border mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.username || "Admin"}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-dark-text-secondary truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-bg hover:text-primary transition-colors cursor-pointer"
                >
                  <FiUser className="text-sm" />
                  <span>Hồ sơ cá nhân</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-dark-border"></div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {loggingOut ? (
                    <>
                      <UnifiedSpinner size="xs" variant="danger" />
                      <span>Đang đăng xuất...</span>
                    </>
                  ) : (
                    <>
                      <FiLogOut className="text-sm" />
                      <span>Đăng xuất</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Spotlight Command Palette Modal */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </header>
  );
};

export default HeaderAdmin;
