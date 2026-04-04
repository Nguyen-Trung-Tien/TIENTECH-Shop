import React, { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiDownload,
  FiArrowUpRight,
  FiArrowDownRight,
  FiBarChart2,
} from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import { getRevenueStats, exportRevenue } from "../../../api/adminApi";
import { toast } from "react-toastify";
import ChartCard from "../../components/ChartCardComponent/ChartCard";
import { Link } from "react-router";

const Revenue = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPagePeriod] = useState("month");
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getRevenueStats(period);
        if (res.errCode === 0) setStats(res.data);
      } catch {
        toast.error("Lỗi tải báo cáo doanh thu");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  const handleExport = async () => {
    try {
      const blob = await exportRevenue();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `DoanhThu-${new Date().toLocaleDateString()}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Đã xuất báo cáo!");
    } catch {
      toast.error("Lỗi khi xuất file");
    }
  };

  const statCards = [
    {
      title: "Tổng doanh thu",
      value: stats?.totalRevenue || 0,
      icon: <FiDollarSign />,
      color: "bg-indigo-600",
      trend: "+12.5%",
      isUp: true,
    },
    {
      title: "Lợi nhuận ước tính",
      value: stats?.totalProfit || 0,
      icon: <FiTrendingUp />,
      color: "bg-emerald-500",
      trend: "+8.2%",
      isUp: true,
    },
    {
      title: "Tổng đơn hàng",
      value: stats?.totalOrders || 0,
      icon: <FiShoppingBag />,
      color: "bg-orange-500",
      trend: "+5.1%",
      isUp: true,
    },
    {
      title: "Khách hàng mới",
      value: stats?.newUsers || 0,
      icon: <FiUsers />,
      color: "bg-violet-500",
      trend: "-2.4%",
      isUp: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-4 md:p-8 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <FiBarChart2 size={28} />
            </div>
            Phân tích Doanh thu
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary font-medium mt-2 ml-1">
            Theo dõi dòng tiền và hiệu suất kinh doanh của cửa hàng trong thời
            gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border p-1.5 rounded-2xl flex items-center shadow-sm">
            {["week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => setPagePeriod(p)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 dark:text-dark-text-secondary hover:text-slate-600 dark:hover:text-white"}`}
              >
                {p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm"}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 h-12 px-6 bg-white dark:bg-dark-surface text-slate-700 dark:text-dark-text-primary border border-slate-200 dark:border-dark-border rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-dark-bg transition-all shadow-sm group"
          >
            <FiDownload className="text-lg group-hover:scale-110 transition-transform" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-white dark:bg-dark-surface p-6 rounded-[2rem] border border-slate-100 dark:border-dark-border shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500"
          >
            <div
              className={`w-14 h-14 ${card.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}
            >
              {card.icon}
            </div>
            <p className="text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
              {card.title}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {typeof card.value === "number" &&
              (card.title.toLowerCase().includes("doanh thu") ||
                card.title.toLowerCase().includes("lợi nhuận"))
                ? card.value.toLocaleString() + "₫"
                : card.value.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mt-4">
              <span
                className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg ${card.isUp ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}
              >
                {card.isUp ? <FiArrowUpRight /> : <FiArrowDownRight />}{" "}
                {card.trend}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase">
                so với kỳ trước
              </span>
            </div>
          </Motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50 dark:border-dark-border">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Biểu đồ tăng trưởng
              </h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mt-1">
                Dữ liệu doanh thu thực tế theo thời gian
              </p>
            </div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
              <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"></div>{" "}
              LIVE
            </div>
          </div>
          <div className="h-[650px]">
            <ChartCard />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-8 rounded-[2.5rem] text-slate-900 dark:text-white border border-slate-100 dark:border-dark-border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 dark:bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

          <div className="relative z-10 space-y-10">
            <div>
              <h3 className="text-xl font-black">Top sản phẩm bán chạy</h3>
              <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-secondary uppercase tracking-widest mt-1">
                Dựa trên số lượng đơn hàng hoàn tất
              </p>
            </div>

            <div className="space-y-6">
              {(stats?.topProducts || []).length > 0 ? (
                stats.topProducts.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border flex items-center justify-center font-black text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      #{i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {product.productName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                        {product.totalSold} đơn đã bán
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {Number(product.totalRevenue).toLocaleString()}₫
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-slate-400 dark:text-dark-text-secondary text-sm italic">
                    Chưa có dữ liệu sản phẩm
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-dark-border">
              <Link
                to="/admin/products"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white rounded-xl transition-all"
              >
                Quản lý kho hàng <FiArrowUpRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
