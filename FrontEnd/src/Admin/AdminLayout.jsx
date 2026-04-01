import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderAdmin from "./components/HeaderAdminComponent/HeaderAdmin";
import Sidebar from "./components/SidebarComponent/Sidebar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans selection:bg-primary/10 selection:text-primary">
      {/* Sidebar - Fixed width when expanded, smaller when collapsed */}
      <Sidebar collapsed={collapsed} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
        {/* Top Header - Sticky with glass effect if needed */}
        <HeaderAdmin toggleSidebar={toggleSidebar} isCollapsed={collapsed} />

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto max-w-[1600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>

        {/* Admin Footer - Simple and clean */}
        <footer className="py-4 px-10 border-t border-slate-200/60 bg-white/50 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
          &copy; {new Date().getFullYear()} TienTech Shop &bull; Dashboard
          Version 2.0
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
