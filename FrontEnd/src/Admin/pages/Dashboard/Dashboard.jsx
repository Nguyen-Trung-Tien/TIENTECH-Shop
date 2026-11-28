import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { m as Motion } from "framer-motion";
import {
  FaBox,
  FaShoppingCart,
  FaDollarSign,
  FaUsers,
  FaUndo,
  FaTimesCircle,
} from "react-icons/fa";
import {
  FiPlus,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiArrowRight,
} from "react-icons/fi";
import StatsCard from "../../components/StatsCardComponent/StatsCard";
import ChartCard from "../../components/ChartCardComponent/ChartCard";
import AIInsightsWidget from "../../components/AIInsightsWidget/AIInsightsWidget";
import { getDashboard, exportRevenue } from "../../../api/adminApi";
import { showErrorToast, showSuccessToast } from "../../../utils/toastHelper";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import DashboardSkeleton from "./components/DashboardSkeleton";
import { ErrorBanner } from "../../../components/UI";
import AdminPageShell from "../../components/AdminPageShell";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState([]);
  const [actionQueue, setActionQueue] = useState({
    cancelRequestedCount: 0,
    returnRequestedCount: 0,
  });
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
      showSuccessToast("Xuất báo cáo thành công!");
    } catch (e) {
      showErrorToast(e, "Lỗi khi xuất báo cáo.");
    } finally {
      setExporting(false);
    }
  };

  const fetchDashboard = useCallback(async () => {
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

        setActionQueue({
          cancelRequestedCount: Number(cancelRequestedCount) || 0,
          returnRequestedCount: Number(returnRequestedCount) || 0,
        });

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
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  return (
    <AdminPageShell className="space-y-6 sm:space-y-8 text-slate-900 dark:text-dark-text-primary transition-colors duration-300">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-100/80 dark:from-slate-900 dark:via-[#0e1628] dark:to-slate-900 text-slate-900 dark:text-white p-5 sm:p-7 md:p-8 border border-blue-100/80 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors duration-300">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-16 -right-16 size-64 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 size-56 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-2xl min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
              {greeting}, Quản trị viên!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Chào mừng bạn trở lại hệ thống quản trị TienTech. Dưới đây là phân
              tích vận hành kinh doanh, hiệu suất đơn hàng và báo cáo tài chính
              mới nhất.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchDashboard}
              disabled={loading}
              aria-label="Làm mới số liệu dashboard"
              className="px-3.5 py-2.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 active:scale-98 border border-slate-200 dark:border-white/15 backdrop-blur-md rounded-xl text-xs font-bold text-slate-700 dark:text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 min-h-[42px]"
            >
              <FiRefreshCw
                className={`text-sm ${loading ? "animate-spin" : ""}`}
              />
              <span>Làm mới</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="px-4 sm:px-5 py-2.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 active:scale-98 border border-slate-200 dark:border-white/15 backdrop-blur-md rounded-xl text-xs font-bold text-slate-700 dark:text-white transition-all shadow-xs dark:shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 min-h-[42px]"
            >
              {exporting ? (
                <>
                  <UnifiedSpinner size="xs" />
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
        <ErrorBanner message={error} onRetry={fetchDashboard} />
      ) : (
        <div className="space-y-6 sm:space-y-10">
          {/* Primary Business KPIs (4 spacious columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((item, i) => (
              <Link key={i} to={item.link} className="block group min-w-0">
                <StatsCard {...item} />
              </Link>
            ))}
          </div>

          {/* Action Queue Strip: Urgent Operations */}
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Link
              to="/admin/orders?tab=cancel_requested"
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-dark-surface border border-rose-200/80 dark:border-rose-900/40 hover:border-rose-400 transition-all shadow-xs min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <FaTimesCircle className="text-lg" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500 dark:text-dark-text-secondary truncate">
                    Yêu cầu hủy đơn
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {actionQueue.cancelRequestedCount}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                Duyệt ngay <FiArrowRight />
              </span>
            </Link>

            <Link
              to="/admin/orders?tab=return_requested"
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-dark-surface border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400 transition-all shadow-xs min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FaUndo className="text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500 dark:text-dark-text-secondary truncate">
                    Yêu cầu trả hàng
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {actionQueue.returnRequestedCount}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                Kiểm tra <FiArrowRight />
              </span>
            </Link>

            <Link
              to="/admin/products"
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-dark-surface border border-orange-200/80 dark:border-orange-900/40 hover:border-orange-400 transition-all shadow-xs min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <FiAlertTriangle className="text-lg" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500 dark:text-dark-text-secondary truncate">
                    Sắp hết tồn kho
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {lowStock.count} SP
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 shrink-0">
                Nhập kho <FiArrowRight />
              </span>
            </Link>
          </Motion.div>

          {/* Low Stock Detail Strip */}
          {lowStock.count > 0 && lowStock.products.length > 0 && (
            <div className="px-4 py-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <p className="text-amber-800 dark:text-amber-300 font-medium min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                <span className="font-bold">Cần bổ sung gấp:</span>{" "}
                {lowStock.products
                  .map((p) => `${p.name} (còn ${p.totalStock})`)
                  .join(" • ")}
              </p>
            </div>
          )}

          {/* AI Insights Section */}
          <AIInsightsWidget />

          {/* Charts Area */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-xs overflow-hidden p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-dark-border">
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
    </AdminPageShell>
  );
};

export default Dashboard;
