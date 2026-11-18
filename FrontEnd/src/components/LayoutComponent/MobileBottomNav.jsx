import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion as Motion } from "framer-motion";
import { FiHome, FiGrid, FiShoppingCart, FiPackage, FiUser } from "react-icons/fi";

const HIDE_BOTTOM_NAV_PREFIXES = ["/product-detail", "/checkout", "/cart"];

const MobileBottomNav = () => {
  const location = useLocation();
  const user = useSelector((state) => state.user.user);
  const cartItemCount = useSelector(
    (state) =>
      state.cart.cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
  );

  if (HIDE_BOTTOM_NAV_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))) {
    return null;
  }

  const navItems = [
    { to: "/", label: "Trang chủ", icon: FiHome, match: (p) => p === "/" },
    {
      to: "/products",
      label: "Sản phẩm",
      icon: FiGrid,
      match: (p) => p.startsWith("/products") || p.startsWith("/product-"),
    },
    {
      to: "/cart",
      label: "Giỏ hàng",
      icon: FiShoppingCart,
      badge: cartItemCount,
      match: (p) => p.startsWith("/cart"),
    },
    {
      to: user ? "/order-history" : "/login",
      label: "Đơn hàng",
      icon: FiPackage,
      match: (p) => p.startsWith("/order"),
    },
    {
      to: user ? "/profile" : "/login",
      label: user ? "Tài khoản" : "Đăng nhập",
      icon: FiUser,
      match: (p) => p.startsWith("/profile") || p.startsWith("/login"),
    },
  ];

  return (
    <nav
      aria-label="Điều hướng di động"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-lg border-t border-surface-200 dark:border-dark-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(location.pathname);
          return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 min-w-0 px-1 transition-colors ${
                  isActive
                    ? "text-primary dark:text-primary-light font-semibold"
                    : "text-surface-500 dark:text-dark-text-secondary hover:text-surface-900 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <Motion.span
                    layoutId="mobile-nav-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-primary dark:bg-primary-light"
                  />
                )}
              <div className="relative">
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight truncate max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
