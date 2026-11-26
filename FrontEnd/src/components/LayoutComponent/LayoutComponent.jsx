import React, { lazy, Suspense } from "react";
import { m as Motion } from "framer-motion";
import Header from "../HeaderComponent/Header";
import Footer from "../FooterComponent/Footer";
import MobileBottomNav from "./MobileBottomNav";
import FloatingCompareBar from "../../features/compare/components/FloatingCompareBar";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSystemSettings } from "../../context/useSystemSettings";
import { FiTool, FiRefreshCw, FiPhoneCall, FiMail } from "react-icons/fi";

const ChatBot = lazy(() => import("../ChatBot/ChatBot"));

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative max-w-lg w-full text-center space-y-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 rounded-[28px] shadow-2xl">
          <div className="size-16 sm:size-20 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
            <FiTool className="size-8 sm:size-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="size-2 rounded-full bg-amber-500 animate-ping" />
              <span>Đang bảo trì &amp; nâng cấp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Hệ Thống Đang Bảo Trì
            </h1>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
            {maintenanceMessage ||
              "TIENTECH đang nâng cấp hạ tầng để phục vụ bạn tốt hơn. Vui lòng quay lại sau ít phút!"}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-98"
          >
            <FiRefreshCw className="size-4" />
            Kiểm tra lại trạng thái
          </button>

          <div className="pt-5 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
            {storeHotline && (
              <a
                href={`tel:${storeHotline}`}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold text-slate-700 dark:text-slate-200"
              >
                <FiPhoneCall className="text-blue-500 shrink-0" />
                <span className="truncate">{storeHotline}</span>
              </a>
            )}
            {storeEmail && (
              <a
                href={`mailto:${storeEmail}`}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold text-slate-700 dark:text-slate-200 min-w-0"
              >
                <FiMail className="text-blue-500 shrink-0" />
                <span className="truncate">{storeEmail}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const hideFooterPaths = [
    "/checkout",
    "/checkout-success",
    "/checkout-failed",
  ];

  const shouldHideFooter = hideFooterPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-main)] transition-colors duration-300 selection:bg-primary/10 selection:text-primary">
      {isShowHeader && <Header />}
      
      <main id="main-content" tabIndex={-1} className="flex-grow pb-20 focus:outline-none">
        <Motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {children}
        </Motion.div>
      </main>

      {isShowFooter && !shouldHideFooter && <Footer />}
      <FloatingCompareBar />
      {!shouldHideFooter && !location.pathname.startsWith("/admin") && (
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      )}
      {isShowHeader && <MobileBottomNav />}
    </div>
  );
};

export default LayoutComponent;
