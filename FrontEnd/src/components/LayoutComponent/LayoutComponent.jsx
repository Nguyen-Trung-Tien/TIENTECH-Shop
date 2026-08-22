import React from "react";
import Header from "../HeaderComponent/Header";
import Footer from "../FooterComponent/Footer";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSystemSettings } from "../../context/ThemeContext";
import { FiTool, FiShield } from "react-icons/fi";

const LayoutComponent = ({
  children,
  isShowHeader = true,
  isShowFooter = true,
}) => {
  const location = useLocation();
  const user = useSelector((state) => state.user.user);
  const { isMaintenance, maintenanceMessage, storeHotline, storeEmail } = useSystemSettings();
  const isAdmin = user?.role === "admin" || user?.role === "root";

  if (isMaintenance && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="relative max-w-lg w-full text-center space-y-6 bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-8 md:p-12 rounded-[32px] shadow-2xl">
          <div className="size-20 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
            <FiTool className="size-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Hệ Thống Đang Nâng Cấp
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              BẢO TRÌ HỆ THỐNG
            </h1>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {maintenanceMessage || "TIENTECH đang tiến hành bảo trì & nâng cấp hệ thống định kỳ. Quý khách vui lòng quay lại sau ít phút!"}
          </p>
          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <p>Hotline hỗ trợ: <span className="font-bold text-white">{storeHotline}</span></p>
            <p>Email liên hệ: <span className="font-bold text-white">{storeEmail}</span></p>
          </div>
        </div>
      </div>
    );
  }

  const hideFooterPaths = [
    "/cart",
    "/checkout",
    "/checkout-success",
    "/checkout-failed",
    "/order-history",
    "/orders",
    "/orders-detail",
    "/profile",
    "/product-detail",
    "/product-list",
    "/products",
    "/fortune-products",
  ];

  const shouldHideFooter = hideFooterPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-main)] transition-colors duration-300 selection:bg-primary/10 selection:text-primary">
      {isShowHeader && <Header />}
      
      <main className="flex-grow pb-20">
        <div className="animate-in fade-in duration-700">
          {children}
        </div>
      </main>

      {isShowFooter && !shouldHideFooter && <Footer />}
    </div>
  );
};

export default LayoutComponent;
