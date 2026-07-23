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
  FiHelpCircle,
  FiTag,
  FiChevronDown,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logoutUserApi } from "../../../api/userApi";
import { getAdminCounters } from "../../../api/adminApi";
import { removeUser } from "../../../redux/userSlice";
import { clearCart } from "../../../redux/cartSlice";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";

import logoImage from "../../../assets/logo.png";
import Logo from "../../../components/UI/Logo";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";

const MENU_ITEMS = [
  { to: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
  { to: "/admin/revenue", icon: <FiBarChart />, label: "Doanh thu" },
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
  { to: "/admin/products", icon: <FiBox />, label: "Sản phẩm" },
  { to: "/admin/users", icon: <FiUsers />, label: "Người dùng" },
  { to: "/admin/vouchers", icon: <FiTag />, label: "Mã giảm giá" },
  { to: "/admin/brands", icon: <FiTag />, label: "Thương hiệu" },
  { to: "/admin/categories", icon: <FiLayers />, label: "Danh mục" },
  { to: "/admin/reviews", icon: <FiHelpCircle />, label: "Phản hồi" },
];

const Sidebar = ({ collapsed }) => {
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

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const res = await getAdminCounters();
        if (res.errCode === 0) {
          setCounters(res.data);
        }
      } catch {
        console.error("Error fetching counters:");
      }
    };

    if (user && user.role === "admin") {
      fetchCounters();
      // Tùy chọn: Refresh mỗi 30s
      const interval = setInterval(fetchCounters, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleMenu = (label) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const handleLogout = async () => {
    if (loggingOut || !user) return;
    setLoggingOut(true);
    try {
      await logoutUserApi();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      dispatch(removeUser());
      dispatch(clearCart());
      navigate("/admin/login", { replace: true });
      toast.success("Đăng xuất thành công!");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <aside
      className={`sticky top-0 h-screen bg-white dark:bg-dark-surface text-slate-500 dark:text-dark-text-secondary transition-all duration-300 ease-in-out z-50 flex flex-col border-r border-slate-200 dark:border-dark-border ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Logo / Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-dark-border">
        <Link to="/admin/dashboard" className="flex items-center w-full">
          <Logo showText={!collapsed} size="sm" />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary/50">
            Hệ thống
          </p>
        )}
        {MENU_ITEMS.map((item) => {
          if (item.subItems) {
            const isExpanded = expandedMenus.includes(item.label);
            const isSubActive = item.subItems.some(
              (sub) => location.pathname === sub.to,
            );

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                    isSubActive
                      ? "text-primary dark:text-primary-light bg-primary/5 dark:bg-primary/10"
                      : "hover:bg-slate-50 dark:hover:bg-dark-bg text-slate-600 dark:text-dark-text-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg flex-shrink-0 ${isSubActive ? "text-primary dark:text-primary-light" : "text-slate-400 dark:text-dark-text-secondary group-hover:text-primary transition-colors"}`}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300">
                        {item.label}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="flex items-center gap-2">
                      {item.label === "Đơn hàng" &&
                        counters.cancelRequestedCount +
                          counters.returnRequestedCount >
                          0 && (
                          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] rounded-full shadow-lg shadow-rose-500/20 animate-pulse">
                            {counters.cancelRequestedCount +
                              counters.returnRequestedCount >
                            99
                              ? "99+"
                              : counters.cancelRequestedCount +
                                counters.returnRequestedCount}
                          </span>
                        )}
                      <FiChevronDown
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  )}
                </button>

                {!collapsed && (
                  <AnimatePresence>
                    {isExpanded && (
                      <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden ml-9 space-y-1"
                      >
                        {item.subItems.map((sub) => {
                          const badgeCount = sub.badgeKey
                            ? counters[sub.badgeKey]
                            : 0;
                          return (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                location.pathname === sub.to
                                  ? "text-primary dark:text-primary-light bg-primary/5 dark:bg-primary/10"
                                  : "text-slate-500 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-dark-bg"
                              }`}
                            >
                              <span>{sub.label}</span>
                              {badgeCount > 0 && (
                                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] rounded-full shadow-lg shadow-rose-500/20">
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

          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary text-white shadow-xl shadow-primary/20"
                  : "hover:bg-slate-50 dark:hover:bg-dark-bg text-slate-600 dark:text-dark-text-secondary"
              }`}
              title={collapsed ? item.label : ""}
            >
              <span
                className={`text-lg flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-dark-text-secondary group-hover:text-primary transition-colors"}`}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300">
                  {item.label}
                </span>
              )}

              {collapsed && isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Quick Info & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-dark-border">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-500 dark:text-dark-text-secondary hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 group disabled:opacity-60 cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Đăng xuất" : ""}
        >
          {loggingOut ? (
            <UnifiedSpinner size="xs" variant="danger" />
          ) : (
            <FiLogOut className="text-lg flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
          )}
          {!collapsed && (
            <span className="text-sm font-bold whitespace-nowrap overflow-hidden">
              {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
