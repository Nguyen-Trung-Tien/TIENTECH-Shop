import React, { useState } from "react";
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
import { removeUser } from "../../../redux/userSlice";
import { clearCart } from "../../../redux/cartSlice";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";
import logoImage from "../../../assets/logo.png";

const MENU_ITEMS = [
  { to: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
  { to: "/admin/revenue", icon: <FiBarChart />, label: "Doanh thu" },
  {
    label: "Đơn hàng",
    icon: <FiShoppingCart />,
    subItems: [
      { to: "/admin/orders", label: "Tất cả đơn hàng" },
      { to: "/admin/orders-return", label: "Duyệt trả hàng" },
      { to: "/admin/orders-cancel", label: "Duyệt hủy hàng" },
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
        {collapsed ? (
          <div className="flex items-center justify-center w-full">
            <img
              src={logoImage}
              alt="Logo"
              className="h-8 w-auto transition-all"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2">
            <img src={logoImage} alt="Logo" className="h-9 w-auto" />
            <div className="min-w-0">
              <h1 className="text-[13px] font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase truncate">
                TienTech <span className="text-primary dark:text-brand">Shop</span>
              </h1>
              <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary font-black mt-1">
                ADMIN PANEL
              </p>
            </div>
          </div>
        )}
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
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isSubActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                      : "hover:bg-slate-50 dark:hover:bg-dark-bg text-slate-600 dark:text-dark-text-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg flex-shrink-0 ${isSubActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-dark-text-secondary group-hover:text-primary transition-colors"}`}
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
                    <FiChevronDown
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {!collapsed && (
                  <AnimatePresence>
                    {isExpanded && (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-9 space-y-1"
                      >
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            className={`block px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                              location.pathname === sub.to
                                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                                : "text-slate-500 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-dark-bg"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
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
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
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
          className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-500 dark:text-dark-text-secondary hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 group ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Đăng xuất" : ""}
        >
          <FiLogOut className="text-lg flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!collapsed && (
            <span className="text-sm font-bold whitespace-nowrap overflow-hidden">
              {loggingOut ? "Đang xử lý..." : "Đăng xuất"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
