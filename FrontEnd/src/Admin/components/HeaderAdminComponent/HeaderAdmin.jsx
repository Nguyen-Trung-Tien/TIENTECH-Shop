import React, { useState } from "react";
import {
  FiSearch,
  FiUser,
  FiLogOut,
  FiHome,
  FiMenu,
  FiX,
  FiBell,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { logoutUserApi } from "../../../api/userApi";
import { removeUser } from "../../../redux/userSlice";
import { clearCart } from "../../../redux/cartSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useCurrentUser } from "../../../hooks/useUser";
import logoImage from "../../../assets/Tien-Tech Shop.png";

const HeaderAdmin = ({ toggleSidebar, isCollapsed }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: resUser } = useCurrentUser();
  const user = resUser?.data;

  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName =
    user?.username?.length > 15
      ? user.username.slice(0, 15) + "..."
      : user?.username || user?.email || "Admin";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
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
      toast.error("Đăng xuất thất bại!");
    } finally {
      setLoggingOut(false);
      setShowProfileMenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Brand / Title (Mobile) */}
        <div className="flex items-center gap-2 md:hidden">
           <img src={logoImage} alt="Logo" className="h-8 w-auto" />
        </div>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex relative group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm hệ thống..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Quick Actions */}
        <button 
          onClick={() => navigate("/")}
          className="hidden sm:flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <FiHome />
          <span>Trang chủ</span>
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
          <FiBell className="text-lg" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-xl p-1 pr-3 hover:bg-slate-50 transition-colors"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FiUser className="text-lg" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Quản trị viên</p>
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowProfileMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-20">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                   <p className="text-sm font-bold text-slate-900">{user?.username || "Admin"}</p>
                   <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-all"
                >
                  <FiUser className="text-lg" />
                  Hồ sơ cá nhân
                </button>
                
                <div className="my-1 border-t border-slate-100"></div>
                
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <FiLogOut className="text-lg" />
                  {loggingOut ? "Đang xử lý..." : "Đăng xuất"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
