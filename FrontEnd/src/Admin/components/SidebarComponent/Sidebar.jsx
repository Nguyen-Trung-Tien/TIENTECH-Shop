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
  FiRotateCcw,
  FiXCircle,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logoutUserApi } from "../../../api/userApi";
import { removeUser } from "../../../redux/userSlice";
import { clearCart } from "../../../redux/cartSlice";
import { toast } from "react-toastify";

const MENU_ITEMS = [
  { to: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
  { to: "/admin/revenue", icon: <FiBarChart />, label: "Doanh thu" },
  { to: "/admin/orders", icon: <FiShoppingCart />, label: "Đơn hàng" },
  { to: "/admin/orders-return", icon: <FiRotateCcw />, label: "Duyệt trả hàng" },
  { to: "/admin/orders-cancel", icon: <FiXCircle />, label: "Duyệt hủy đơn" },
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
      className={`sticky top-0 h-screen bg-slate-950 text-slate-400 transition-all duration-300 ease-in-out z-50 flex flex-col border-r border-slate-800/50 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Logo / Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
        {collapsed ? (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
            T
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
              T
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                Admin<span className="text-primary">Panel</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.1em] text-slate-400 font-bold mt-1">
                Management System
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Hệ thống
          </p>
        )}
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary text-white shadow-xl shadow-primary/20"
                  : "hover:bg-slate-900 hover:text-white"
              }`}
              title={collapsed ? item.label : ""}
            >
              <span
                className={`text-lg flex-shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-primary transition-colors"}`}
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
      <div className="p-4 border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 group ${
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
