import React, { useState, useEffect, useMemo } from "react";
import {
  FiX,
  FiTrendingDown,
  FiShield,
  FiAlertTriangle,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiInfo,
  FiActivity,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { predictPrice } from "../../api/chatApi";

const StatCard = ({
  icon,
  label,
  value,
  subValue,
  advice,
  className = "",
  reliability,
}) => (
  <div
    className={`p-6 rounded-3xl border ${advice?.border || "border-slate-100 dark:border-slate-800"} ${advice?.bg || "bg-white dark:bg-slate-800/50"} flex flex-col justify-between transition-all hover:shadow-lg shadow-sm ${className}`}
  >
    <div>
      <div
        className={`size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center ${advice?.text || "text-slate-400"} shadow-sm mb-4`}
      >
        {icon}
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </h4>
      <p
        className={`text-2xl font-black ${advice?.text || "text-slate-900 dark:text-white"} uppercase italic mt-1`}
      >
        {value}
      </p>
    </div>
    {subValue && (
      <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase">
        {subValue}
      </div>
    )}
    {reliability !== undefined && (
      <div className="mt-4 w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <Motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: reliability / 100 }}
          style={{ originX: 0 }}
          className="h-full bg-indigo-600 w-full"
        />
      </div>
    )}
    {advice?.suggestion && (
      <p className="text-[11px] font-bold text-slate-500 mt-4 leading-relaxed line-clamp-2">
        {advice.suggestion}
      </p>
    )}
  </div>
);

const TrendChart = ({ data }) => {
  const chartData = useMemo(
    () =>
      data?.aiAnalysis?.chartData || [
        { name: "Hiện tại", price: data?.currentPrice },
        { name: "30 ngày", price: data?.predicted30 },
        { name: "60 ngày", price: data?.predicted60 },
        { name: "90 ngày", price: data?.predicted90 },
      ],
    [data],
  );

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <FiTrendingDown className="text-indigo-600" /> Xu hướng giá dự kiến
          </h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Biểu đồ biến động giá trong 90 ngày tới
          </p>
        </div>
        <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">
            Hiện tại:
          </span>
          <span className="text-sm font-black text-indigo-600">
            {data?.currentPrice?.toLocaleString()}đ
          </span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fontWeight: 900,
                fill: "#94a3b8",
              }}
              dy={10}
            />
            <YAxis hide domain={["dataMin - 1000000", "dataMax + 1000000"]} />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                fontWeight: "bold",
              }}
              formatter={(value) => [
                Number(value).toLocaleString() + "đ",
                "Giá dự kiến",
              ]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#4f46e5"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AnalysisDetail = ({ icon: Icon, title, content, colorClass }) => (
  <div className="space-y-4">
    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <Icon className={colorClass} /> {title}
    </h4>
    <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
      {content}
    </div>
  </div>
);

const PricePredictionModal = ({ productId, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && productId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await predictPrice(productId);
          if (res.errCode === 0) {
            setData(res.data);
          } else {
            console.error(res.errMessage);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, productId]);

  const adviceStyle = useMemo(() => {
    const code = data?.aiAnalysis?.adviceCode;
    switch (code) {
      case "BUY_NOW":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/10",
          text: "text-emerald-600",
          border: "border-emerald-100 dark:border-emerald-900/30",
          label: "Mua ngay",
          icon: <FiCheckCircle />,
          suggestion: data?.aiAnalysis?.suggestion,
        };
      case "WAIT":
        return {
          bg: "bg-amber-50 dark:bg-amber-900/10",
          text: "text-amber-600",
          border: "border-amber-100 dark:border-amber-900/30",
          label: "Nên chờ",
          icon: <FiClock />,
          suggestion: data?.aiAnalysis?.suggestion,
        };
      case "SKIP":
        return {
          bg: "bg-rose-50 dark:bg-rose-900/10",
          text: "text-rose-600",
          border: "border-rose-100 dark:border-rose-900/30",
          label: "Cân nhắc bỏ qua",
          icon: <FiAlertTriangle />,
          suggestion: data?.aiAnalysis?.suggestion,
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-dark-bg",
          text: "text-slate-600 dark:text-dark-text-secondary",
          border: "border-slate-100 dark:border-dark-border",
          label: "Chưa rõ",
          icon: <FiInfo />,
        };
    }
  }, [data]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <FiActivity size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight">
                  AI Price Analytics
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                  Dự đoán xu hướng giá TienTech Engine v5.0
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="size-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-400"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="size-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                  AI đang phân tích thị trường...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    icon={adviceStyle.icon}
                    label="AI Advice"
                    value={adviceStyle.label}
                    advice={adviceStyle}
                  />

                  <StatCard
                    icon={<FiShoppingBag />}
                    label="Giá hợp lý nên mua"
                    value={`${data?.aiAnalysis?.fairPrice?.toLocaleString() || "---"}đ`}
                    subValue={
                      <>
                        <FiTrendingDown /> Thấp hơn{" "}
                        {Math.round(
                          (1 -
                            data?.aiAnalysis?.fairPrice / data?.currentPrice) *
                            100,
                        )}
                        % so với hiện tại
                      </>
                    }
                  />

                  <StatCard
                    icon={<FiShield />}
                    label="Độ tin cậy dự báo"
                    value={`${data?.aiAnalysis?.reliability || data?.reliability}%`}
                    reliability={
                      data?.aiAnalysis?.reliability || data?.reliability || 0
                    }
                  />
                </div>

                <TrendChart data={data} />

                {/* Analysis Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AnalysisDetail
                    icon={FiActivity}
                    title="Phân tích thị trường"
                    content={data?.aiAnalysis?.trend}
                    colorClass="text-indigo-600"
                  />
                  <AnalysisDetail
                    icon={FiAlertTriangle}
                    title="Rủi ro biến động"
                    content={data?.aiAnalysis?.risk}
                    colorClass="text-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <FiInfo size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Dữ liệu được cập nhật dựa trên thời gian thực
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
            >
              Đã hiểu
            </button>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PricePredictionModal;
