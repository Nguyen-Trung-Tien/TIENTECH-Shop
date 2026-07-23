import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBox, FaShoppingCart, FaDollarSign, FaUsers, FaUndo, FaTimesCircle } from "react-icons/fa";
import StatsCard from "../../components/StatsCardComponent/StatsCard";
import ChartCard from "../../components/ChartCardComponent/ChartCard";
import AIInsightsWidget from "../../components/AIInsightsWidget/AIInsightsWidget";
import { getDashboard, exportRevenue } from "../../../api/adminApi";
import { toast } from "react-toastify";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState([]);
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
            change = {},
          } = data;

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
              link: "/admin/orders-cancel",
            },
            {
              title: "Yêu cầu trả hàng",
              value: Number(returnRequestedCount).toLocaleString(),
              icon: <FaUndo className="text-amber-500" />,
              change: "Cần duyệt",
              isIncrease: false,
              link: "/admin/orders-return",
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

  return (
    <div className="space-y-6 sm:space-y-10 p-2.5 sm:p-6 md:p-8 max-w-[1600px] mx-auto text-slate-900 dark:text-dark-text-primary transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1 sm:mb-2">
            Bảng điều khiển
          </h1>
          <p className="text-slate-500 dark:text-dark-text-secondary font-bold text-[10px] sm:text-sm tracking-widest uppercase">
            Tổng quan hệ thống & Phân tích kinh doanh
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 sm:px-6 py-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-600 dark:text-dark-text-secondary hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
          >
            {exporting ? (
              <>
                <UnifiedSpinner size="xs" variant="primary" />
                <span>Đang xuất...</span>
              </>
            ) : (
              "Xuất báo cáo"
            )}
          </button>
          <Link
            to="/admin/products"
            className="px-4 sm:px-6 py-2.5 bg-primary text-white rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center text-center min-h-[44px]"
          >
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 sm:py-32 bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[40px] border border-slate-100 dark:border-dark-border shadow-soft gap-4">
          <UnifiedSpinner size="xl" variant="primary" />
          <p className="text-slate-400 dark:text-dark-text-secondary font-black text-[10px] tracking-[0.2em] uppercase">
            Đang đồng bộ dữ liệu...
          </p>
        </div>
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
            <ChartCard />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
