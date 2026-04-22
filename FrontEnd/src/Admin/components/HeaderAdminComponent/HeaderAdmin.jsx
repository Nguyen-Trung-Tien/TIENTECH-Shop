import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FiSearch,
  FiUser,
  FiLogOut,
  FiHome,
  FiMenu,
  FiX,
  FiBell,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiArrowRight,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { logoutUserApi } from "../../../api/userApi";
import { globalSearchApi } from "../../../api/adminApi";
import { removeUser } from "../../../redux/userSlice";
import { clearCart } from "../../../redux/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useCurrentUser } from "../../../hooks/useUser";
import logoImage from "../../../assets/logo.png";
import NotificationBell from "../../../components/HeaderComponent/NotificationBell";
import { debounce } from "lodash";
import { motion as Motion, AnimatePresence } from "framer-motion";

const HeaderAdmin = ({ toggleSidebar, isCollapsed, theme, toggleTheme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.user.user);
  const { data: resUser } = useCurrentUser();
  const user = resUser?.data || reduxUser;

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState({
    products: [],
    orders: [],
    users: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const searchRef = useRef(null);

  const displayName =
    user?.username?.length > 15
      ? user.username.slice(0, 15) + "..."
      : user?.username || user?.email || "Admin";

  // Global Search Debounced
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query) => {
        if (!query.trim()) {
          setSuggestions({ products: [], orders: [], users: [] });
          setIsLoading(false);
          return;
        }
        try {
          const res = await globalSearchApi(query);
          if (res.errCode === 0) {
            setSuggestions(res.data);
          }
        } catch (err) {
          console.error("Global search error:", err);
        } finally {
          setIsLoading(false);
        }
      }, 400),
    [],
  );

  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true);
      setShowSuggestions(true);
      debouncedSearch(searchQuery);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, debouncedSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 shadow-sm md:px-6 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Brand / Title (Mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          <img src={logoImage} alt="Logo" className="h-8 w-auto" />
        </div>

        {/* Search Bar (Desktop) */}
        <div ref={searchRef} className="hidden md:block relative group">
          <form onSubmit={handleSearch} className="flex relative group">
            <FiSearch
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? "text-primary animate-pulse" : "text-slate-400 dark:text-dark-text-secondary group-focus-within:text-primary"}`}
            />
            <input
              type="text"
              placeholder="Tìm sản phẩm, đơn hàng, khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              className="h-10 w-80 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </form>

          {/* Global Search Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && (
              <Motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute top-full left-0 mt-3 w-[450px] bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-slate-100 dark:border-dark-border overflow-hidden z-50 p-2"
              >
                {isLoading ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 dark:text-dark-text-secondary font-medium italic">
                      Đang tìm kiếm hệ thống...
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Products Section */}
                    {suggestions.products?.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 bg-slate-50 dark:bg-dark-bg rounded-lg">
                          <FiPackage className="text-primary text-xs" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-secondary">
                            Sản phẩm
                          </span>
                        </div>
                        <div className="space-y-1">
                          {suggestions.products.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                navigate(`/admin/product/edit/${p.id}`);
                                setShowSuggestions(false);
                              }}
                              className="flex items-center justify-between w-full px-3 py-2 hover:bg-slate-50 dark:hover:bg-dark-bg rounded-xl transition-all group text-left"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors truncate">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-dark-text-secondary font-medium">
                                  SKU:{" "}
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {p.sku}
                                  </span>{" "}
                                  • Kho:{" "}
                                  <span
                                    className={
                                      p.totalStock > 0
                                        ? "text-emerald-600"
                                        : "text-rose-500"
                                    }
                                  >
                                    {p.totalStock}
                                  </span>
                                </p>
                              </div>
                              <span className="text-xs font-black text-slate-900 dark:text-white ml-4">
                                {formatPrice(p.basePrice)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Orders Section */}
                    {suggestions.orders?.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 bg-slate-50 dark:bg-dark-bg rounded-lg">
                          <FiShoppingBag className="text-indigo-500 text-xs" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-secondary">
                            Đơn hàng
                          </span>
                        </div>
                        <div className="space-y-1">
                          {suggestions.orders.map((o) => (
                            <button
                              key={o.id}
                              onClick={() => {
                                navigate(`/admin/order/${o.id}`);
                                setShowSuggestions(false);
                              }}
                              className="flex items-center justify-between w-full px-3 py-2 hover:bg-slate-50 dark:hover:bg-dark-bg rounded-xl transition-all group text-left"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                                  #{o.orderCode}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-dark-text-secondary font-medium">
                                  Khách:{" "}
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {o.user?.username || "Ẩn danh"}
                                  </span>{" "}
                                  •{" "}
                                  {new Date(o.createdAt).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-slate-900 dark:text-white">
                                  {formatPrice(o.totalPrice)}
                                </p>
                                <span
                                  className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${o.status === "delivered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                                >
                                  {o.status}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users Section */}
                    {suggestions.users?.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 bg-slate-50 dark:bg-dark-bg rounded-lg">
                          <FiUsers className="text-rose-500 text-xs" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-secondary">
                            Khách hàng
                          </span>
                        </div>
                        <div className="space-y-1">
                          {suggestions.users.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                navigate(`/admin/users?editId=${u.id}`);
                                setShowSuggestions(false);
                              }}
                              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-slate-50 dark:hover:bg-dark-bg rounded-xl transition-all group text-left"
                            >
                              <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 text-xs font-bold group-hover:bg-rose-500 group-hover:text-white transition-all">
                                {u.username?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-rose-600 transition-colors truncate">
                                  {u.username}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-dark-text-secondary font-medium truncate">
                                  {u.email} • {u.phone || "N/A"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No results */}
                    {suggestions.products.length === 0 &&
                      suggestions.orders.length === 0 &&
                      suggestions.users.length === 0 && (
                        <div className="py-12 text-center space-y-2">
                          <div className="h-12 w-12 bg-slate-50 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto">
                            <FiX className="text-slate-300 dark:text-slate-600 text-xl" />
                          </div>
                          <p className="text-xs text-slate-400 dark:text-dark-text-secondary font-medium italic">
                            Không tìm thấy kết quả phù hợp
                          </p>
                        </div>
                      )}

                    <div className="mt-2 p-1 pt-2 border-t border-slate-50 dark:border-dark-border">
                      <button
                        onClick={() => {
                          navigate(
                            `/admin/search?q=${encodeURIComponent(searchQuery)}`,
                          );
                          setShowSuggestions(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-slate-900 dark:bg-primary text-white rounded-xl text-[11px] font-black hover:bg-primary dark:hover:bg-primary-hover transition-all uppercase tracking-widest"
                      >
                        Xem toàn bộ kết quả <FiArrowRight />
                      </button>
                    </div>
                  </div>
                )}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary border border-slate-200 dark:border-dark-border hover:text-primary transition-all shadow-sm"
          title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
        >
          {theme === "dark" ? <FiSun className="text-amber-500" /> : <FiMoon />}
        </button>

        {/* Quick Actions */}
        <button
          onClick={() => navigate("/")}
          className="hidden sm:flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 text-sm font-medium text-slate-600 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors shadow-sm"
        >
          <FiHome />
          <span>Trang chủ</span>
        </button>

        {/* Notifications */}
        <NotificationBell />

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-dark-border mx-1"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-xl p-1 pr-3 hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-primary/10"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FiUser className="text-lg" />
              </div>
            )}
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-dark-text-secondary uppercase font-bold tracking-wider">
                Quản trị viên
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-2 shadow-xl ring-1 ring-black/5 z-20 transition-all">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-dark-border mb-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {user?.username || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-dark-text-secondary truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg hover:text-primary transition-all"
                >
                  <FiUser className="text-lg" />
                  Hồ sơ cá nhân
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-dark-border"></div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
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
