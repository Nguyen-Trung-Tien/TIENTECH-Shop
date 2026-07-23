import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiX,
  FiMenu,
  FiBox,
  FiPackage,
  FiShoppingBag,
  FiCompass,
  FiSun,
  FiMoon,
  FiHeart,
  FiCheckCircle,
  FiCamera,
} from "react-icons/fi";

import { motion as Motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";

import { removeUser } from "../../redux/userSlice";
import { clearCart } from "../../redux/cartSlice";
import { logoutUserApi } from "../../api/userApi";
import { searchSuggestionsApi } from "../../api/productApi";
import { useCurrentUser } from "../../hooks/useUser";
import { debounce } from "lodash";
import Logo from "../UI/Logo";
import { toast } from "react-toastify";
import NotificationBell from "./NotificationBell";
import VisualSearchModal from "./VisualSearchModal";
import OmniSearchModal from "./OmniSearchModal";
import UnifiedSpinner from "../Loading/UnifiedSpinner";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState({
    products: [],
    keywords: [],
    brands: [],
    categories: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isOmniSearchOpen, setIsOmniSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  const reduxUser = useSelector((state) => state.user.user);
  const { data: resUser } = useCurrentUser();
  const user = resUser?.data || reduxUser;

  const cartItemCount = useSelector(
    (state) =>
      state.cart.cartItems?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0,
  );

  const avatarUrl = user?.avatar || "/images/avatar-default.png";

  // Handle Theme Toggle
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // Scroll & Location Listeners
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOmniSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUserApi();
      localStorage.removeItem("accessToken");
      dispatch(removeUser());
      dispatch(clearCart());
      navigate("/login");
      toast.success("Đăng xuất thành công!");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Không thể đăng xuất");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { name: "Trang chủ", path: "/", icon: <FiCompass /> },
    { name: "Sản phẩm", path: "/product-list", icon: <FiPackage /> },
    { name: "Phong thủy", path: "/fortune-products", icon: <FiBox /> },
    { name: "Giới thiệu", path: "/about", icon: <FiShoppingBag /> },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-900/5 py-2.5"
            : "bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 py-3.5"
        }`}
      >
        <div className="container-custom flex items-center justify-between gap-3 lg:gap-4 xl:gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <Logo size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shrink-0">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all duration-300 flex items-center gap-1.5 relative whitespace-nowrap shrink-0 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <span className="text-xs shrink-0">{link.icon}</span>
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Trigger Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-lg relative">
            <div
              onClick={() => setIsOmniSearchOpen(true)}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-cyan-500/15 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <FiSearch className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base" />
              </div>

              <input
                type="text"
                readOnly
                placeholder="Tìm sản phẩm, thương hiệu, AI Smart Search..."
                className="w-full h-11 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl pl-11 pr-28 text-[13px] font-bold cursor-pointer group-hover:bg-white dark:group-hover:bg-slate-900 group-hover:border-blue-500/40 focus:border-blue-500 outline-none transition-all duration-300 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs"
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-wider border border-slate-200/80 dark:border-slate-700/60 hidden sm:inline-flex shadow-xs">
                  Ctrl K
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVisualSearchOpen(true);
                  }}
                  className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                  title="Tìm kiếm bằng ảnh AI Vision"
                >
                  <FiCamera size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button for Mobile & Tablet */}
            <button
              onClick={() => setIsOmniSearchOpen(true)}
              className="lg:hidden size-11 min-h-[44px] min-w-[44px] rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
              title="Tìm kiếm AI"
            >
              <FiSearch size={19} />
            </button>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="size-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/30 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
              title={theme === "light" ? "Bật chế độ tối" : "Bật chế độ sáng"}
            >
              {theme === "light" ? <FiMoon size={19} /> : <FiSun size={19} />}
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Wishlist Icon Button */}
            <Link
              to="/wishlist"
              className="size-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-500/30 transition-all flex items-center justify-center active:scale-95 shadow-xs group"
              title="Danh sách yêu thích"
            >
              <FiHeart className="text-[19px] group-hover:scale-110 transition-transform" />
            </Link>

            {/* Cart Icon Button */}
            <Link
              to="/cart"
              className="relative size-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-all flex items-center justify-center active:scale-95 shadow-xs group"
              title="Giỏ hàng"
            >
              <FiShoppingCart className="text-[19px] group-hover:scale-110 transition-transform" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-md shadow-rose-500/30">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/30 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <div className="relative size-8 rounded-xl overflow-hidden ring-2 ring-blue-500/20">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <FiChevronDown
                    className={`text-slate-400 transition-transform duration-300 text-sm ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <Motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-3 z-50 overflow-hidden"
                    >
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-slate-800/30 rounded-2xl mb-2 border border-blue-100/50 dark:border-slate-700/40">
                        <p className="text-[13px] font-black text-slate-900 dark:text-white truncate">
                          {user.username || user.email}
                        </p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg tracking-widest shadow-xs">
                          {user.role}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {user.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
                          >
                            <FiBox className="text-base text-blue-500" /> Dashboard Quản trị
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
                        >
                          <FiUser className="text-base text-slate-400" /> Thông tin cá nhân
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
                        >
                          <FiShoppingBag className="text-base text-slate-400" /> Đơn mua của tôi
                        </Link>

                        <Link
                          to="/order-history"
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
                        >
                          <FiCheckCircle className="text-base text-slate-400" /> Lịch sử đơn hàng
                        </Link>

                        <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all cursor-pointer disabled:opacity-60"
                        >
                          {isLoggingOut ? (
                            <>
                              <UnifiedSpinner size="xs" variant="danger" />
                              <span>ĐANG ĐĂNG XUẤT...</span>
                            </>
                          ) : (
                            <>
                              <FiLogOut className="text-base" />
                              <span>Đăng xuất</span>
                            </>
                          )}
                        </button>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 min-h-[40px] px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wide shadow-md shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                <FiUser className="text-sm shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">ĐĂNG NHẬP</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden size-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            >
              {isMobileMenuOpen ? (
                <FiX className="text-xl" />
              ) : (
                <FiMenu className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <Motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-900 overflow-hidden shadow-2xl"
            >
              <div className="container-custom py-5 space-y-4 px-4">
                {/* Mobile Search Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsOmniSearchOpen(true);
                  }}
                  className="w-full min-h-[46px] flex items-center justify-between bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FiSearch className="text-blue-600 dark:text-blue-400 text-base" />
                    <span>Tìm kiếm sản phẩm, thương hiệu...</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg uppercase">
                    AI Search
                  </span>
                </button>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 min-h-[46px] px-4 py-3 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                      >
                        <span className="text-lg text-blue-600 dark:text-blue-400">{link.icon}</span>
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modals */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />
      <OmniSearchModal
        isOpen={isOmniSearchOpen}
        onClose={() => setIsOmniSearchOpen(false)}
        onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
      />
    </>
  );
}

export default Header;
