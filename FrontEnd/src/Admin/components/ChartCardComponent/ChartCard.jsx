import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FiRefreshCw } from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import { getDashboard } from "../../../api/adminApi";

const PERIOD = { WEEK: "week", MONTH: "month", YEAR: "year" };

const FALLBACK_DATA = {
  [PERIOD.WEEK]: [
    { name: "T2", value: 300000 },
    { name: "T3", value: 420000 },
    { name: "T4", value: 650000 },
    { name: "T5", value: 500000 },
    { name: "T6", value: 720000 },
    { name: "T7", value: 680000 },
    { name: "CN", value: 800000 },
  ],
  [PERIOD.MONTH]: Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}`,
    value: Math.floor(Math.random() * 300000) + 200000,
  })),
  [PERIOD.YEAR]: Array.from({ length: 12 }, (_, i) => ({
    name: `T${i + 1}`,
    value: Math.floor(Math.random() * 5000000) + 10000000,
  })),
};

const convertRevenueData = (arr, labelKey, valueKey) =>
  (arr || []).map((item) => ({
    name: item[labelKey] ?? "N/A",
    value: parseFloat(item[valueKey]) || 0,
  }));

const formatCurrency = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toLocaleString("vi-VN");
};

const ChartCard = ({ token }) => {
  const [type, setType] = useState(PERIOD.WEEK);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    revenueByWeek: [],
    revenueByMonth: [],
    revenueByYear: [],
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboard(token);
      if (res?.errCode === 0 && res.data) {
        setDashboardData({
          totalRevenue: parseFloat(res.data.totalRevenue) || 0,
          revenueByWeek: convertRevenueData(
            res.data.revenueByWeek,
            "date",
            "revenue",
          ),
          revenueByMonth: convertRevenueData(
            res.data.revenueByMonth,
            "date",
            "revenue",
          ),
          revenueByYear: convertRevenueData(
            res.data.revenueByYear,
            "date",
            "revenue",
          ),
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const selectedData = useMemo(() => {
    const data = type === PERIOD.WEEK
      ? dashboardData.revenueByWeek
      : type === PERIOD.MONTH
        ? dashboardData.revenueByMonth
        : dashboardData.revenueByYear;
    
    return data.length > 0 ? data : FALLBACK_DATA[type];
  }, [type, dashboardData]);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border shadow-soft overflow-hidden p-4 md:p-8 transition-colors duration-300 w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h5 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Biểu đồ doanh thu
          </h5>
          <p className="text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mt-1">
            Dữ liệu thời gian thực (Real-time analytics)
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-dark-bg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-dark-text-secondary rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-dark-border active:scale-95 shadow-sm"
        >
          <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} />
          Làm mới dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl p-5">
          <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
            Tổng doanh thu hệ thống
          </p>
          <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {formatCurrency(dashboardData.totalRevenue)}{" "}
            <span className="text-base font-bold opacity-70">₫</span>
          </h3>
        </div>
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {Object.values(PERIOD).map((p) => (
            <button
              key={p}
              onClick={() => setType(p)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                type === p
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-white dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-500 dark:text-dark-text-secondary hover:border-indigo-400"
              }`}
            >
              {p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full min-w-0 bg-slate-50/30 dark:bg-dark-bg/20 rounded-[2rem] p-2 md:p-6 border border-slate-100 dark:border-dark-border">
        {loading ? (
          <div className="h-full w-full flex flex-col gap-6 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4"></div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 10, fontWeight: 700 }}
                className="text-slate-400 dark:text-dark-text-secondary"
                dy={15}
              />
              <YAxis 
                hide={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 10, fontWeight: 700 }}
                className="text-slate-400 dark:text-dark-text-secondary"
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card, #1e293b)",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color, #334155)",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
                  padding: "12px 16px",
                  color: "#fff"
                }}
                itemStyle={{ fontSize: "13px", fontWeight: "900", color: "#6366f1" }}
                labelStyle={{ fontSize: "11px", fontWeight: "bold", color: "#94a3b8", marginBottom: "4px" }}
                cursor={{ stroke: "#6366f1", strokeWidth: 2, strokeDasharray: "5 5" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ fill: "#6366f1", strokeWidth: 2, r: 5, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 4, stroke: "rgba(99, 102, 241, 0.2)" }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Motion.div>
  );
};

export default ChartCard;
