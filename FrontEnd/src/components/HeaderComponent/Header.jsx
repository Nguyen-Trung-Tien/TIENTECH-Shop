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

// Theme state moved into Header component body (to fix Invalid hook call)
import { removeUser } from "../../redux/userSlice";
import { clearCart, setCartItems } from "../../redux/cartSlice";
import { logoutUserApi } from "../../api/userApi";
import { searchSuggestionsApi } from "../../api/productApi";
import { getAllCarts } from "../../api/cartApi";
import { useCurrentUser } from "../../hooks/useUser";
import { debounce } from "lodash";
import logoImage from "../../assets/logo.png";
import { toast } from "react-toastify";
import NotificationBell from "./NotificationBell";
import VisualSearchModal from "./VisualSearchModal";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setShowSuggestions(false);
  }, []); // Removed location.pathname from dependency array

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change - moved access inside
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setShowSuggestions(false);
  }, [location]); // Keep location reference if needed, or use a custom hook to detect path changes reliably if location changes are not triggering

  // ... (existing code)

  // Search Suggestion Debounce
  const fetchSuggestions = useMemo(
    () =>
      debounce(async (query) => {
        if (!query.trim()) {
          setSuggestions({
            products: [],
            keywords: [],
            brands: [],
            categories: [],
          });
          setShowSuggestions(false);
          return;
        }
        try {
          const res = await searchSuggestionsApi(query);
          setSuggestions(res?.suggestions || {});
          setShowSuggestions(true);
        } catch (err) {
          console.error("Search suggest error:", err);
        }
      }, 300),
    [],
  );

  const handleLogout = async () => {
    try {
      await logoutUserApi();
      localStorage.removeItem("accessToken");
      dispatch(removeUser());
      dispatch(clearCart());
      navigate("/login");
      toast.success("Đăng xuất thành công!");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim() === "") {
      fetchSuggestions.cancel();
      setShowSuggestions(false);
      return;
    }
    fetchSuggestions(value);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(
        `/product-list?search=${encodeURIComponent(searchInput.trim())}`,
      );
      setShowSuggestions(false);
    }
  };

  const navLinks = [
    { name: "Trang chủ", path: "/", icon: <FiCompass /> },
    { name: "Yêu thích", path: "/wishlist", icon: <FiHeart /> },
    { name: "Phong thủy", path: "/fortune-products", icon: <FiBox /> },
    { name: "Giới thiệu", path: "/about", icon: <FiShoppingBag /> },
  ];

  return (
    <header
      className={`sticky top-0 z-[100] w-full duration-500 will-change-transform ${
        isScrolled
          ? "bg-white/90 dark:bg-dark-bg/90 backdrop-blur-xl shadow-md py-2"
          : "bg-white dark:bg-dark-bg py-4"
      }`}
    >
      <div className="container-custom flex items-center justify-between gap-10">
        {/* Logo */}
        <Link
          to="/"
          className="flex-shrink-0 transition-transform hover:scale-105"
        >
          <img src={logoImage} alt="Logo" className="h-9 w-auto md:h-11" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[13px] font-bold uppercase tracking-[0.15em] transition-all relative group ${
                location.pathname === link.path
                  ? "text-primary dark:text-brand"
                  : "text-slate-500 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {link.name}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-primary dark:bg-brand transition-all duration-300 ${location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"}`}
              ></span>
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div
          className="hidden lg:block flex-1 max-w-lg relative"
          ref={searchRef}
        >
          <form onSubmit={onSearchSubmit} className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm công nghệ..."
              value={searchInput}
              onChange={onSearchChange}
              className="w-full h-11 bg-slate-100 dark:bg-dark-surface border-2 border-transparent rounded-2xl pl-12 pr-10 text-[14px] font-medium focus:bg-white dark:focus:bg-dark-bg focus:border-primary/10 dark:focus:border-brand/20 focus:ring-4 focus:ring-primary/5 dark:focus:ring-brand/5 outline-none transition-all dark:text-white"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setShowSuggestions(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <FiX />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsVisualSearchOpen(true)}
                className="p-1.5 text-slate-400 hover:text-primary dark:hover:text-brand hover:bg-primary/10 dark:hover:bg-brand/10 rounded-lg transition-colors"
                title="Tìm kiếm bằng hình ảnh AI"
              >
                <FiCamera size={18} />
              </button>
            </div>
          </form>

          {/* Suggestions Dropdown (Centered) */}
          <AnimatePresence>
            {showSuggestions && (
              <>
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowSuggestions(false)}
                />
                <Motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none"
                >
                  <div className="w-full max-w-4xl bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-slate-100 dark:border-dark-border overflow-hidden pointer-events-auto max-h-[80vh] overflow-y-auto">
                    {/* ... Content ... */}
                    {suggestions.keywords?.length > 0 && (
                      <div className="mb-2 p-2 border-b border-slate-100 dark:border-dark-border">
                        <div className="flex items-center gap-2 px-3 py-2">
                          {suggestions.keywords.map((kw, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSearchInput(kw);
                                navigate(`/product-list?search=${encodeURIComponent(kw)}`);
                                setShowSuggestions(false);
                              }}
                              className="px-3 py-1 bg-slate-50 dark:bg-dark-bg hover:bg-primary/10 dark:hover:bg-brand/10 text-slate-500 dark:text-dark-text-secondary hover:text-primary dark:hover:text-brand rounded-full text-[12px] font-bold transition-all border border-slate-100 dark:border-dark-border"
                            >
                              {kw}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Grid content omitted for brevity in instruction, will copy original grid structure here */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 p-4">
                      {/* Left: Brands & Categories */}
                      {(suggestions.brands?.length > 0 || suggestions.categories?.length > 0) && (
                        <div className="md:col-span-4 space-y-4 border-r border-slate-50 dark:border-dark-border/50">
                          {suggestions.brands?.length > 0 && (
                            <div>
                              <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary bg-slate-50 dark:bg-dark-bg/50 rounded-lg mb-2">Thương hiệu</p>
                              {suggestions.brands.map((brand) => (
                                <button key={brand.id} onClick={() => { navigate(`/product-list?brandId=${brand.id}`); setShowSuggestions(false); }} className="flex items-center gap-3 w-full px-3 py-2 text-[13px] font-bold text-slate-600 dark:text-dark-text-secondary hover:bg-primary/5 dark:hover:bg-brand/5 hover:text-primary dark:hover:text-brand rounded-xl transition-all text-left group">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary dark:group-hover:bg-brand transition-colors"></div>
                                  {brand.name}
                                </button>
                              ))}
                            </div>
                          )}
                          {suggestions.categories?.length > 0 && (
                            <div>
                              <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary bg-slate-50 dark:bg-dark-bg/50 rounded-lg mb-2">Danh mục</p>
                              {suggestions.categories.map((cat) => (
                                <button key={cat.id} onClick={() => { navigate(`/product-list?categoryId=${cat.id}`); setShowSuggestions(false); }} className="flex items-center gap-3 w-full px-3 py-2 text-[13px] font-bold text-slate-600 dark:text-dark-text-secondary hover:bg-primary/5 dark:hover:bg-brand/5 hover:text-primary dark:hover:text-brand rounded-xl transition-all text-left group">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary dark:group-hover:bg-brand transition-colors"></div>
                                  {cat.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Right: Products */}
                      <div className={`${suggestions.brands?.length > 0 || suggestions.categories?.length > 0 ? "md:col-span-8" : "md:col-span-12"}`}>
                        <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary bg-slate-50 dark:bg-dark-bg/50 rounded-lg mb-2">Sản phẩm phổ biến</p>
                        {suggestions.products?.length > 0 ? (
                          suggestions.products.map((product) => (
                            <button key={product.id} onClick={() => { navigate(`/product-detail/${product.id}`); setShowSuggestions(false); }} className="flex items-center gap-4 w-full px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-dark-bg rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-dark-border">
                              <div className="relative w-14 h-14 flex-shrink-0 bg-white dark:bg-dark-bg rounded-xl border border-slate-100 dark:border-dark-border p-2"><img src={product.image} alt="" className="w-full h-full object-contain" /></div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-[14px] font-bold text-slate-800 dark:text-white truncate">{product.name}</p>
                                <span className="text-[13px] font-black text-primary dark:text-brand">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="py-8 text-center text-slate-400 text-[13px]">Không tìm thấy sản phẩm</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 dark:bg-dark-surface text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-dark-border transition-all"
            title={theme === "light" ? "Bật chế độ tối" : "Bật chế độ sáng"}
          >
            {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="group relative flex items-center justify-center w-11 h-11 rounded-2xl text-slate-700 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-surface hover:text-primary dark:hover:text-brand transition-all"
            title="Danh sách yêu thích"
          >
            <FiHeart className="text-[22px] group-hover:scale-110 transition-transform" />
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="group relative flex items-center justify-center w-11 h-11 rounded-2xl text-slate-700 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-surface hover:text-primary dark:hover:text-brand transition-all"
          >
            <FiShoppingCart className="text-[22px] group-hover:scale-110 transition-transform" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-dark-bg shadow-lg shadow-rose-500/20">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-dark-surface transition-all border border-transparent hover:border-slate-200 dark:hover:border-dark-border"
              >
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-primary/10"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-dark-bg rounded-full"></div>
                </div>
                <FiChevronDown
                  className={`text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-dark-surface rounded-3xl shadow-xl border border-slate-100 dark:border-dark-border p-3 z-50"
                  >
                    <div className="px-4 py-3 bg-slate-50 dark:bg-dark-bg rounded-2xl mb-2">
                      <p className="text-[13px] font-black text-slate-900 dark:text-white truncate">
                        {user.username || user.email}
                      </p>
                      <p className="text-[9px] uppercase font-black text-primary dark:text-brand tracking-widest mt-0.5">
                        {user.role}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {user.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-slate-600 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg hover:text-primary dark:hover:text-brand rounded-xl transition-all"
                        >
                          <FiBox className="text-lg" /> Dashboard Quản trị
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-slate-600 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg hover:text-primary dark:hover:text-brand rounded-xl transition-all"
                      >
                        <FiUser className="text-lg" /> Thông tin cá nhân
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-slate-600 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg hover:text-primary dark:hover:text-brand rounded-xl transition-all"
                      >
                        <FiHeart className="text-lg" /> Danh sách yêu thích
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-slate-600 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg hover:text-primary dark:hover:text-brand rounded-xl transition-all"
                      >
                        <FiShoppingBag className="text-lg" /> Đơn mua của tôi
                      </Link>

                      <Link
                        to="/order-history"
                        className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-slate-600 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg hover:text-primary dark:hover:text-brand rounded-xl transition-all"
                      >
                        <FiCheckCircle className="text-lg" /> Lịch sử đơn hàng
                      </Link>

                      <div className="my-2 border-t border-slate-100 dark:border-dark-border mx-2"></div>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <FiLogOut className="text-lg" /> Đăng xuất
                      </button>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-brand text-white rounded-2xl text-[13px] font-black hover:bg-primary dark:hover:bg-brand-dark hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
            >
              <FiUser className="text-lg" />
              <span className="hidden sm:inline">ĐĂNG NHẬP</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 dark:bg-dark-surface text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-dark-border transition-colors"
          >
            {isMobileMenuOpen ? (
              <FiX className="text-xl" />
            ) : (
              <FiMenu className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white dark:bg-dark-bg border-t border-slate-100 dark:border-dark-border overflow-hidden"
          >
            <div className="container-custom py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={onSearchSubmit} className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchInput}
                  onChange={onSearchChange}
                  className="w-full h-11 bg-slate-50 dark:bg-dark-surface border border-slate-100 dark:border-dark-border rounded-xl pl-11 text-sm focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                />
              </form>

              <div className="grid grid-cols-1 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-surface hover:text-primary dark:hover:text-brand transition-all font-bold"
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
      <VisualSearchModal isOpen={isVisualSearchOpen} onClose={() => setIsVisualSearchOpen(false)} />
    </header>
  );
}

export default Header;
