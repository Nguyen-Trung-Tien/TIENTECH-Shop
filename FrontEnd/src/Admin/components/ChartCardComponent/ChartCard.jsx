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
import { m as Motion } from "framer-motion";
import { getDashboard } from "../../../api/adminApi";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import { useOptionalTheme } from "../../../context/useTheme";

const PERIOD = { WEEK: "week", MONTH: "month", YEAR: "year" };

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

const ChartCard = ({ token, embedded = false }) => {
  const { isDark } = useOptionalTheme();
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
    
    return Array.isArray(data) ? data : [];
  }, [type, dashboardData]);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full transition-colors duration-300 ${
        embedded
          ? ""
          : "bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border shadow-soft overflow-hidden p-4 sm:p-6 md:p-8"
      }`}
    >
      {!embedded && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h5 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Biểu đồ doanh thu
            </h5>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mt-0.5">
              Dữ liệu thời gian thực (Real-time analytics)
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 min-h-[44px] px-5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-bg dark:hover:bg-slate-800 text-slate-700 dark:text-dark-text-secondary rounded-2xl text-xs font-bold transition-all border border-slate-200/80 dark:border-dark-border active:scale-95 shadow-sm cursor-pointer"
          >
            {loading ? (
              <UnifiedSpinner size="xs" variant="primary" />
            ) : (
              <FiRefreshCw className="text-base" />
            )}
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 md:mb-8">
        <div className="bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
            Tổng doanh thu hệ thống
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {formatCurrency(dashboardData.totalRevenue)}{" "}
            <span className="text-base font-bold opacity-70">₫</span>
          </h3>
        </div>
        <div className="flex items-center justify-start md:justify-end gap-2 flex-wrap">
          {Object.values(PERIOD).map((p) => (
            <button
              key={p}
              onClick={() => setType(p)}
              className={`min-h-[44px] px-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                type === p
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "bg-slate-100 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:border-indigo-400"
              }`}
            >
              {p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm"}
            </button>
          ))}
          {embedded && (
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="flex items-center gap-2 min-h-[44px] px-4 bg-slate-100 hover:bg-slate-200 dark:bg-dark-bg dark:hover:bg-slate-800 text-slate-700 dark:text-dark-text-secondary rounded-2xl text-xs font-bold transition-all border border-slate-200/80 dark:border-dark-border active:scale-95 shadow-sm cursor-pointer"
              title="Làm mới dữ liệu"
            >
              {loading ? (
                <UnifiedSpinner size="xs" variant="primary" />
              ) : (
                <FiRefreshCw className="text-base" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="h-[280px] sm:h-[360px] md:h-[400px] w-full bg-slate-50/40 dark:bg-dark-bg/30 rounded-3xl p-2 sm:p-4 md:p-6 border border-slate-100 dark:border-dark-border overflow-x-auto">
        {loading ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3">
            <UnifiedSpinner size="lg" variant="primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đang phân tích doanh thu...</span>
          </div>
        ) : selectedData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-center p-4">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Chưa có dữ liệu doanh thu trong giai đoạn này
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Dữ liệu sẽ tự động cập nhật khi có đơn hàng hoàn tất.
            </p>
          </div>
        ) : (
          <div className="h-full min-w-[500px] sm:min-w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
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
                  dy={10}
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
                    backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.96)",
                    borderRadius: "16px",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(226,232,240,0.9)",
                    backdropFilter: "blur(12px)",
                    boxShadow: isDark ? "0 20px 25px -5px rgba(0,0,0,0.4)" : "0 16px 24px -6px rgba(15,23,42,0.12)",
                    padding: "10px 14px",
                    color: isDark ? "#f8fafc" : "#0f172a",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "900", color: isDark ? "#818cf8" : "#4f46e5" }}
                  labelStyle={{ fontSize: "10px", fontWeight: "bold", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "2px" }}
                  cursor={{ stroke: "#6366f1", strokeWidth: 2, strokeDasharray: "5 5" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: "#6366f1", strokeWidth: 2, r: 4, stroke: "#fff" }}
                  activeDot={{ r: 7, strokeWidth: 3, stroke: "rgba(99, 102, 241, 0.3)" }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Motion.div>
  );
};

export default ChartCard;
