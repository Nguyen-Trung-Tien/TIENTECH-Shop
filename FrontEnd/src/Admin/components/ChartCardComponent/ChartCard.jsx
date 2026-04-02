import { useState, useEffect, useCallback } from "react";
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
import { motion } from "framer-motion";
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
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
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

  const selectedData =
    (type === PERIOD.WEEK
      ? dashboardData.revenueByWeek
      : type === PERIOD.MONTH
        ? dashboardData.revenueByMonth
        : dashboardData.revenueByYear
    ).length > 0
      ? type === PERIOD.WEEK
        ? dashboardData.revenueByWeek
        : type === PERIOD.MONTH
          ? dashboardData.revenueByMonth
          : dashboardData.revenueByYear
      : FALLBACK_DATA[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-6"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h5 className="text-lg font-black text-slate-900 tracking-tight">
            Biểu đồ doanh thu
          </h5>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Dữ liệu thời gian thực
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200 active:scale-95"
        >
          <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
          <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">
            Tổng doanh thu
          </p>
          <h3 className="text-2xl font-black text-primary tracking-tight">
            {formatCurrency(dashboardData.totalRevenue)}{" "}
            <span className="text-sm font-bold opacity-70">₫</span>
          </h3>
        </div>
        <div className="flex items-center justify-end gap-2">
          {Object.values(PERIOD).map((p) => (
            <button
              key={p}
              onClick={() => setType(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                type === p
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400"
              }`}
            >
              {p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
        {loading ? (
          <div className="h-full w-full flex flex-col gap-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded-full w-1/4"></div>
            <div className="flex-1 bg-slate-100 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={4}
                dot={{ fill: "#2563eb", strokeWidth: 2, r: 4, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default ChartCard;
