import React, { useState, useEffect } from "react";
import {
  FiActivity,
  FiTrendingUp,
  FiPieChart,
  FiZap,
  FiChevronUp,
} from "react-icons/fi";
import { getRevenueForecastApi } from "../../../api/adminApi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const RevenueForecastWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("revenue_forecast_expanded");
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("revenue_forecast_expanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      setLoading(false);
      return;
    }

    const fetchForecast = async () => {
      setLoading(true);
      try {
        const res = await getRevenueForecastApi();
        if (res.errCode === 0) {
          setData(res.data);
        }
      } catch {
        console.error("Failed to load revenue forecast");
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [isExpanded]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = data
    ? [
        ...data.history.map((h) => ({
          name: h.month,
          "Thực tế": h.revenue,
          "Dự báo": null,
        })),
        ...data.forecast.map((f) => ({
          name: f.month,
          "Thực tế": null,
          "Dự báo": f.predictedRevenue,
        })),
      ]
    : [];

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-soft overflow-hidden transition-all duration-500 mt-8">
      <div
        className="p-6 cursor-pointer flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/50 hover:bg-slate-100 dark:hover:bg-dark-bg transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`size-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${isExpanded ? "bg-emerald-600 text-white scale-110 shadow-emerald-600/20" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-dark-text-secondary"}`}
          >
            <FiActivity className={isExpanded ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
              AI Revenue Forecast
            </h3>
            <p className="text-[9px] font-bold text-slate-500 dark:text-dark-text-secondary uppercase tracking-widest">
              Dự báo doanh thu & Chiến lược tài chính
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`size-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-400 transition-transform ${isExpanded ? "rotate-0" : "rotate-180"}`}
          >
            <FiChevronUp />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <Motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden"
          >
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-4">
                <UnifiedSpinner size="md" variant="primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-secondary">
                  Đang chạy mô hình dự báo...
                </p>
              </div>
            ) : data ? (
              <div className="p-8 border-t border-slate-100 dark:border-dark-border space-y-10">
                {/* Biểu đồ */}
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                        tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        formatter={(val) => formatCurrency(val)}
                      />
                      <Legend verticalAlign="top" align="right" height={36}/>
                      <Area
                        type="monotone"
                        dataKey="Thực tế"
                        stroke="#4f46e5"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorReal)"
                      />
                      <Area
                        type="monotone"
                        dataKey="Dự báo"
                        stroke="#10b981"
                        strokeWidth={4}
                        strokeDasharray="8 8"
                        fillOpacity={1}
                        fill="url(#colorForecast)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Grid chi tiết */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Ngân sách Marketing */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                      <FiPieChart className="text-emerald-500" /> Ngân sách Marketing
                    </h4>
                    <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-500/10">
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                        {formatCurrency(data.marketingBudget.amount)}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {data.marketingBudget.note}
                      </p>
                    </div>
                  </div>

                  {/* Hành động chiến lược */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                      <FiZap className="text-amber-500" /> Chiến lược tăng trưởng
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.strategicActions.map((item, i) => (
                        <div
                          key={i}
                          className="bg-slate-50 dark:bg-dark-bg/50 rounded-2xl p-4 border border-slate-100 dark:border-dark-border"
                        >
                          <p className="text-xs font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                            {item.action}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-dark-text-secondary font-bold">
                            {item.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tóm tắt */}
                <div className="bg-slate-900 dark:bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                      <FiTrendingUp size={16} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Kết luận của AI
                    </p>
                  </div>
                  <p className="text-sm font-medium leading-relaxed opacity-90">
                    {data.summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-dark-text-secondary text-xs italic">
                Không đủ dữ liệu để thực hiện dự báo.
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevenueForecastWidget;
