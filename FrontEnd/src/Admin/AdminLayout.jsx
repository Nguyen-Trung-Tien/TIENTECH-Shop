import React, { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
import HeaderAdmin from "./components/HeaderAdminComponent/HeaderAdmin";
import Sidebar from "./components/SidebarComponent/Sidebar";
import { AdminPageLoader } from "./components/AdminLoading";
import { useTheme } from "../context/ThemeContext";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary transition-colors duration-300 flex">
      {/* Sidebar - Desktop Sticky + Mobile Off-Canvas Drawer */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobileSidebar}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen w-full min-w-0 overflow-hidden transition-all duration-300 ease-in-out">
        {/* Top Header */}
        <HeaderAdmin 
          toggleSidebar={toggleSidebar} 
          isCollapsed={collapsed} 
          theme={theme}
          toggleTheme={toggleTheme}
        />


        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
          <div className="px-2 py-3 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 mx-auto max-w-[1600px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Suspense fallback={<AdminPageLoader />}>
              <div className="text-slate-900 dark:text-dark-text-primary">
                <Outlet />
              </div>
            </Suspense>
          </div>

          {/* Admin Footer */}
          <footer className="py-3 px-4 sm:px-10 border-t border-slate-200/60 dark:border-dark-border bg-white/50 dark:bg-dark-surface/50 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
            &copy; {new Date().getFullYear()} TienTech Shop &bull; Mobile Ready Dashboard v2.0
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
