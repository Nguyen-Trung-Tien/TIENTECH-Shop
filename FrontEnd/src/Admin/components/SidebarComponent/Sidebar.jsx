import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiLayers,
  FiLogOut,
  FiBarChart,
  FiDollarSign,
  FiMessageSquare,
  FiTag,
  FiChevronDown,
  FiX,
  FiShield,
  FiCompass,
  FiGrid,
  FiStar,
  FiSettings,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logoutUserApi } from "../../../api/userApi";
import { getAdminCounters } from "../../../api/adminApi";
import { removeUser } from "../../../redux/userSlice";
import { clearCart } from "../../../redux/cartSlice";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";

import Logo from "../../../components/UI/Logo";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";

const MENU_SECTIONS = [
  {
    title: "TỔNG QUAN",
    items: [
      { to: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
      { to: "/admin/revenue", icon: <FiBarChart />, label: "Doanh thu" },
    ],
  },
  {
    title: "BÁN HÀNG",
    items: [
      {
        label: "Đơn hàng",
        icon: <FiShoppingCart />,
        subItems: [
          { to: "/admin/orders", label: "Tất cả đơn hàng" },
          {
            to: "/admin/orders-return",
            label: "Duyệt trả hàng",
            badgeKey: "returnRequestedCount",
          },
          {
            to: "/admin/orders-cancel",
            label: "Duyệt hủy hàng",
            badgeKey: "cancelRequestedCount",
          },
        ],
      },
      { to: "/admin/payment", icon: <FiDollarSign />, label: "Thanh toán" },
    ],
  },
  {
    title: "SẢN PHẨM & KHO",
    items: [
      { to: "/admin/products", icon: <FiBox />, label: "Sản phẩm" },
      { to: "/admin/categories", icon: <FiLayers />, label: "Danh mục" },
      { to: "/admin/brands", icon: <FiTag />, label: "Thương hiệu" },
    ],
  },
  {
    title: "KHÁCH HÀNG & MKT",
    items: [
      { to: "/admin/users", icon: <FiUsers />, label: "Người dùng" },
      { to: "/admin/vouchers", icon: <FiTag />, label: "Mã giảm giá" },
      { to: "/admin/reviews", icon: <FiMessageSquare />, label: "Đánh giá" },
    ],
  },
  {
    title: "CẤU HÌNH",
    items: [
      { to: "/admin/settings", icon: <FiSettings />, label: "Cài đặt hệ thống" },
    ],
  },
];


const Sidebar = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [loggingOut, setLoggingOut] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(["Đơn hàng"]);
  const [counters, setCounters] = useState({
    cancelRequestedCount: 0,
    returnRequestedCount: 0,
  });

  // Tự động đóng mobile drawer khi chuyển route trên điện thoại
  useEffect(() => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  }, [location.pathname, onCloseMobile]);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const res = await getAdminCounters();
        if (res.errCode === 0) {
          setCounters(res.data);
        }
      } catch {
        console.error("Error fetching admin counters");
      }
    };

    if (user && user.role === "admin") {
      fetchCounters();
      const interval = setInterval(fetchCounters, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleMenu = (label) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    if (loggingOut || !user) return;
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
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-white dark:bg-dark-surface text-slate-600 dark:text-dark-text-secondary transition-all duration-300 ease-in-out z-50 flex flex-col border-r border-slate-200/80 dark:border-dark-border/80 ${
          mobileOpen
            ? "translate-x-0 w-72 shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-dark-border/60 shrink-0 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm">
          <Link to="/admin/dashboard" className="flex items-center w-full min-w-0">
            <Logo showText={mobileOpen || !collapsed} size="sm" />
          </Link>
          {mobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Đóng thanh điều hướng quản trị"
              className="md:hidden size-9 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          )}
        </div>

        {/* Navigation Menu (Grouped by Category) */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
          {MENU_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {(mobileOpen || !collapsed) && (
                <div className="px-3 mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary/50">
                    {section.title}
                  </span>
                </div>
              )}
              {collapsed && !mobileOpen && (
                <div className="w-8 h-[1px] bg-slate-200/60 dark:bg-dark-border/60 mx-auto my-2" />
              )}

              {section.items.map((item) => {
                // Sub-menu logic
                if (item.subItems) {
                  const isExpanded = expandedMenus.includes(item.label);
                  const isSubActive = item.subItems.some(
                    (sub) => location.pathname === sub.to
                  );
                  const totalBadges =
                    counters.cancelRequestedCount + counters.returnRequestedCount;

                  return (
                    <div key={item.label} className="space-y-1 relative group">
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.label)}
                        aria-label={`Mục menu ${item.label}`}
                        aria-expanded={isExpanded}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
                          isSubActive
                            ? "text-primary dark:text-blue-400 bg-primary/10 dark:bg-primary/20 font-bold border-l-2 border-primary"
                            : "hover:bg-slate-100/80 dark:hover:bg-dark-bg text-slate-700 dark:text-dark-text-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`text-base flex-shrink-0 transition-colors ${
                              isSubActive
                                ? "text-primary dark:text-blue-400"
                                : "text-slate-400 dark:text-dark-text-secondary group-hover:text-primary"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {!collapsed && (
                            <span className="text-xs font-bold truncate">
                              {item.label}
                            </span>
                          )}
                        </div>

                        {!collapsed && (
                          <div className="flex items-center gap-1.5">
                            {totalBadges > 0 && (
                              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[9px] font-mono font-black rounded shadow-xs">
                                {totalBadges > 99 ? "99+" : totalBadges}
                              </span>
                            )}
                            <FiChevronDown
                              className={`text-slate-400 text-xs transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        )}
                      </button>

                      {/* Tooltip when collapsed */}
                      {collapsed && !mobileOpen && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-mono font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap">
                          {item.label}
                        </div>
                      )}

                      {/* Sub-items dropdown */}
                      {!collapsed && (
                        <AnimatePresence>
                          {isExpanded && (
                            <Motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden ml-3 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5 pt-0.5"
                            >
                              {item.subItems.map((sub) => {
                                const badgeCount = sub.badgeKey
                                  ? counters[sub.badgeKey]
                                  : 0;
                                const isItemActive = location.pathname === sub.to;
                                return (
                                  <Link
                                    key={sub.to}
                                    to={sub.to}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all ${
                                      isItemActive
                                        ? "text-primary dark:text-blue-400 bg-primary/10 dark:bg-primary/20 font-bold"
                                        : "text-slate-500 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-dark-bg"
                                    }`}
                                  >
                                    <span className="truncate">{sub.label}</span>
                                    {badgeCount > 0 && (
                                      <span className="flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-rose-600 text-white text-[9px] font-mono font-black rounded shadow-xs">
                                        {badgeCount > 99 ? "99+" : badgeCount}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </Motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                }

                // Regular Single Link
                const isActive = location.pathname.startsWith(item.to);

                return (
                  <div key={item.to} className="relative group">
                    <Link
                      to={item.to}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 ${
                        isActive
                          ? "bg-primary text-white font-bold shadow-xs"
                          : "hover:bg-slate-100/80 dark:hover:bg-dark-bg text-slate-700 dark:text-dark-text-secondary"
                      }`}
                    >
                      <span
                        className={`text-base flex-shrink-0 ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 dark:text-dark-text-secondary group-hover:text-primary"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {(mobileOpen || !collapsed) && (
                        <span className="text-xs truncate">{item.label}</span>
                      )}
                    </Link>

                    {/* Tooltip when collapsed */}
                    {collapsed && !mobileOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-mono font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Info & Quick Logout Footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-dark-border/80 shrink-0 bg-slate-50/50 dark:bg-dark-bg/30">
          {(mobileOpen || !collapsed) && (
            <div className="flex items-center gap-2.5 p-2 mb-2 rounded-lg bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border/80 shadow-2xs">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="size-8 rounded-lg object-cover ring-1 ring-primary/30 shrink-0"
                />
              ) : (
                <div className="size-8 rounded-lg bg-primary/10 text-primary font-mono font-black flex items-center justify-center text-xs shrink-0">
                  {user.username?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.username || "Admin"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-400 text-[9px] font-mono font-bold uppercase tracking-wider">
                    <span className="size-1 rounded-full bg-lime-500"></span> {user.role || "ADMIN"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Đăng xuất khỏi trang quản trị"
            className={`flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-600 hover:text-white transition-all duration-150 group disabled:opacity-60 cursor-pointer text-xs font-semibold border border-rose-200/60 dark:border-rose-900/40 ${
              collapsed && !mobileOpen ? "justify-center" : ""
            }`}
            title={collapsed ? "Đăng xuất" : ""}
          >
            {loggingOut ? (
              <UnifiedSpinner size="xs" variant="danger" />
            ) : (
              <FiLogOut className="text-sm flex-shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            )}
            {(mobileOpen || !collapsed) && (
              <span className="truncate">
                {loggingOut ? "Đang xử lý..." : "Đăng xuất console"}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
