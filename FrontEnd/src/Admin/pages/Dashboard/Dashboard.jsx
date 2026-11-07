import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaBox, FaShoppingCart, FaDollarSign, FaUsers, FaUndo, FaTimesCircle } from "react-icons/fa";
import { FiPlus, FiDownload, FiCheckCircle } from "react-icons/fi";
import StatsCard from "../../components/StatsCardComponent/StatsCard";
import ChartCard from "../../components/ChartCardComponent/ChartCard";
import AIInsightsWidget from "../../components/AIInsightsWidget/AIInsightsWidget";
import { getDashboard, exportRevenue } from "../../../api/adminApi";
import { toast } from "react-toastify";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import DashboardSkeleton from "./components/DashboardSkeleton";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState([]);
  const [lowStock, setLowStock] = useState({ count: 0, products: [] });
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportRevenue();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Bao-cao-doanh-thu-${new Date().toLocaleDateString("vi-VN")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Xuất báo cáo thành công!");
    } catch {
      toast.error("Lỗi khi xuất báo cáo.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDashboard();
        if (res?.errCode === 0 && res?.data) {
          let data = res.data;
          if (Array.isArray(data)) data = data[0] || {};

          const {
            totalProducts = 0,
            todayOrders = 0,
            totalRevenue = 0,
            totalUsers = 0,
            cancelRequestedCount = 0,
            returnRequestedCount = 0,
            lowStockCount = 0,
            lowStockProducts = [],
            change = {},
          } = data;

          setLowStock({
            count: lowStockCount,
            products: lowStockProducts,
          });

          const {
            products: changeProducts = 0,
            orders: changeOrders = 0,
            revenue: changeRevenue = 0,
            users: changeUsers = 0,
          } = change;

          const formatCurrency = (value) =>
            Number(value).toLocaleString("vi-VN") + " ₫";

          setStats([
            {
              title: "Tổng sản phẩm",
              value: Number(totalProducts).toLocaleString(),
              icon: <FaBox />,
              change: `${changeProducts > 0 ? "+" : ""}${changeProducts}%`,
              isIncrease: changeProducts >= 0,
              link: "/admin/products",
            },
            {
              title: "Đơn hàng hôm nay",
              value: Number(todayOrders).toLocaleString(),
              icon: <FaShoppingCart />,
              change: `${changeOrders > 0 ? "+" : ""}${changeOrders}%`,
              isIncrease: changeOrders >= 0,
              link: "/admin/orders",
            },
            {
              title: "Doanh thu",
              value: formatCurrency(totalRevenue),
              icon: <FaDollarSign />,
              change: `${changeRevenue > 0 ? "+" : ""}${changeRevenue}%`,
              isIncrease: changeRevenue >= 0,
              link: "/admin/revenue",
            },
            {
              title: "Người dùng",
              value: Number(totalUsers).toLocaleString(),
              icon: <FaUsers />,
              change: `${changeUsers > 0 ? "+" : ""}${changeUsers}%`,
              isIncrease: changeUsers >= 0,
              link: "/admin/users",
            },
            {
              title: "Yêu cầu hủy",
              value: Number(cancelRequestedCount).toLocaleString(),
              icon: <FaTimesCircle className="text-rose-500" />,
              change: "Cần xử lý",
              isIncrease: false,
              link: "/admin/orders?tab=cancel_requested",
            },
            {
              title: "Yêu cầu trả hàng",
              value: Number(returnRequestedCount).toLocaleString(),
              icon: <FaUndo className="text-amber-500" />,
              change: "Cần duyệt",
              isIncrease: false,
              link: "/admin/orders?tab=return_requested",
            },
          ]);
        } else {
          setError("Không thể tải dữ liệu dashboard.");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Lỗi kết nối server. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 p-2.5 sm:p-6 md:p-8 max-w-[1600px] mx-auto text-slate-900 dark:text-dark-text-primary transition-colors duration-300">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-[#0e1628] to-slate-900 text-white p-5 sm:p-7 md:p-8 border border-slate-800 shadow-xl">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-16 -right-16 size-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 size-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-2xl min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>HỆ THỐNG VẬN HÀNH TIÊU CHUẨN // LIVE METRICS</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white truncate">
              {greeting}, Quản trị viên!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Chào mừng bạn trở lại hệ thống quản trị TienTech. Dưới đây là phân tích vận hành kinh doanh, hiệu suất đơn hàng và báo cáo tài chính mới nhất.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 sm:px-5 py-2.5 bg-white/10 hover:bg-white/15 active:scale-98 border border-white/15 backdrop-blur-md rounded-xl text-xs font-bold text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 min-h-[42px]"
            >
              {exporting ? (
                <>
                  <UnifiedSpinner size="xs" variant="white" />
                  <span>Đang xuất Excel...</span>
                </>
              ) : (
                <>
                  <FiDownload className="text-sm" />
                  <span>Xuất báo cáo</span>
                </>
              )}
            </button>
            <Link
              to="/admin/products"
              className="px-4 sm:px-5 py-2.5 bg-primary hover:bg-primary-hover active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 text-center min-h-[42px]"
            >
              <FiPlus className="text-sm" />
              <span>Thêm sản phẩm</span>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="p-4 sm:p-8 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl sm:rounded-3xl text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-4 shadow-sm">
          <div className="size-10 sm:size-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-rose-500/20 shrink-0">
            !
          </div>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-6">
            {stats.map((item, i) => (
              <Link key={i} to={item.link} className="block group">
                <StatsCard {...item} />
              </Link>
            ))}
          </div>

          {/* Low Stock Alert Banner */}
          {lowStock.count > 0 && (
            <div className="p-4 sm:p-5 bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-900/40 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm shadow-amber-500/20">
                  !
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-300 uppercase tracking-tight">
                    Cảnh Báo Tồn Kho ({lowStock.count} sản phẩm sắp hết hàng)
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-700/90 dark:text-amber-400 mt-0.5 truncate">
                    {lowStock.products.map((p) => `${p.name} (còn ${p.totalStock})`).join(", ")}
                  </p>
                </div>
              </div>
              <Link
                to="/admin/products"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 text-center"
              >
                Quản lý kho hàng
              </Link>
            </div>
          )}

          {/* AI Insights Section */}
          <AIInsightsWidget />

          {/* Charts Area */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[40px] border border-slate-100 dark:border-dark-border shadow-soft overflow-hidden p-4 sm:p-8 md:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-slate-50 dark:border-dark-border">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5 sm:mb-1">
                  Dòng tiền & Hiệu suất
                </h3>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                  Biểu đồ phân tích doanh thu chi tiết
                </p>
              </div>
              <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50/50 dark:bg-dark-bg/50 rounded-full border border-slate-100/50 dark:border-dark-border/40">
                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-dark-text-secondary uppercase tracking-widest">
                  Live Updates
                </span>
              </div>
            </div>
            <ChartCard embedded={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
