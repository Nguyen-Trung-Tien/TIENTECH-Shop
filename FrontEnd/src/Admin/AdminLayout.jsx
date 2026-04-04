import React, { useState, Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import HeaderAdmin from "./components/HeaderAdminComponent/HeaderAdmin";
import Sidebar from "./components/SidebarComponent/Sidebar";
import { AdminPageLoader } from "./components/AdminLoading";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [adminTheme, setAdminTheme] = useState(
    () => localStorage.getItem("admin_theme") || "light",
  );

  const toggleSidebar = () => setCollapsed(!collapsed);
  
  const toggleTheme = () => {
    const newTheme = adminTheme === "light" ? "dark" : "light";
    setAdminTheme(newTheme);
    localStorage.setItem("admin_theme", newTheme);
  };

  // Đồng bộ theme Admin lên thẻ html để Tailwind v4 hoạt động chính xác
  useEffect(() => {
    if (adminTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Cleanup khi thoát khỏi phân hệ Admin
    return () => {
      // Nếu bạn muốn theme của Admin không ảnh hưởng đến Client, 
      // bạn có thể khôi phục theme client tại đây nếu cần.
    };
  }, [adminTheme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary transition-colors duration-300">
      <div className="flex min-h-screen">
        {/* Sidebar - Fixed width when expanded, smaller when collapsed */}
        <Sidebar collapsed={collapsed} />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
          {/* Top Header - Sticky with glass effect if needed */}
          <HeaderAdmin 
            toggleSidebar={toggleSidebar} 
            isCollapsed={collapsed} 
            theme={adminTheme}
            toggleTheme={toggleTheme}
          />

          {/* Dynamic Content Area */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
            <div className="px-4 py-6 md:px-8 md:py-8 lg:px-10 mx-auto max-w-[1600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Suspense fallback={<AdminPageLoader />}>
                <div className="text-slate-900 dark:text-dark-text-primary">
                  <Outlet />
                </div>
              </Suspense>
            </div>
          </main>

          {/* Admin Footer - Simple and clean */}
          <footer className="py-4 px-10 border-t border-slate-200/60 dark:border-dark-border bg-white/50 dark:bg-dark-surface/50 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
            &copy; {new Date().getFullYear()} TienTech Shop &bull; Dashboard
            Version 2.0
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
