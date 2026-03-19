import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import { FiArrowDownRight, FiArrowUpRight, FiZap, FiTarget, FiX, FiTrendingUp } from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import Button from "../UI/Button";
import Badge from "../UI/Badge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PricePredictionModal = ({ show, onHide, result }) => {
  if (!result || !result.currentPrice) return null;

  const {
    productName = "Sản phẩm",
    category = "Không xác định",
    currentPrice = 0,
    predicted30 = 0,
    predicted60 = 0,
    predicted90 = 0,
    reliability = 0,
    discount = 0,
    aiAnalysis = null,
  } = result;

  const calcPercent = (delta) => {
    if (currentPrice === 0) return 0;
    return ((Math.abs(delta) / currentPrice) * 100).toFixed(1);
  };

  const predictions = [
    { label: "30 ngày tới", price: predicted30 },
    { label: "60 ngày tới", price: predicted60 },
    { label: "90 ngày tới", price: predicted90 },
  ].map((p) => ({
    ...p,
    delta: p.price - currentPrice,
  }));

  const reliabilityColor = reliability > 80 ? "bg-emerald-500" : reliability > 50 ? "bg-amber-500" : "bg-rose-500";

  // Chart Configuration
  const chartData = {
    labels: ["Hiện tại", "30 ngày", "60 ngày", "90 ngày"],
    datasets: [
      {
        label: "Giá dự đoán (VNĐ)",
        data: [currentPrice, predicted30, predicted60, predicted90],
        borderColor: "#0071e3",
        backgroundColor: "rgba(0, 113, 227, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 3,
        pointBorderColor: "#0071e3",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1d1d1f",
        padding: 12,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 14 },
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.raw.toLocaleString()} ₫`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { font: { size: 10, weight: 'bold' }, color: '#86868b' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' }, color: '#86868b' }
      }
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onHide}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-3xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-surface-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <FiTrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-surface-900 leading-none">Dự đoán giá AI</h3>
                  <p className="text-surface-400 text-sm font-medium mt-1">Phân tích xu hướng thị trường thông minh</p>
                </div>
              </div>
              <button 
                onClick={onHide}
                className="p-3 hover:bg-surface-100 rounded-2xl transition-colors text-surface-400"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Product Info */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <Badge variant="brand" className="mb-2">DỰ ĐOÁN THÔNG MINH</Badge>
                  <h4 className="text-xl font-bold text-surface-900">{productName}</h4>
                  <p className="text-surface-400 text-sm font-medium">Danh mục: {category}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-1">Giá thị trường hiện tại</p>
                  <div className="flex items-center gap-3 justify-end">
                    {discount > 0 && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-lg uppercase">-{discount}%</span>
                    )}
                    <span className="text-3xl font-black text-primary tracking-tighter">{currentPrice.toLocaleString()}₫</span>
                  </div>
                </div>
              </div>

              {/* Predictions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {predictions.map((item) => {
                  const isDown = item.delta < 0;
                  return (
                    <div key={item.label} className={`p-6 rounded-3xl border-2 transition-all duration-300 ${
                      isDown ? "bg-emerald-50/30 border-emerald-100" : "bg-rose-50/30 border-rose-100"
                    }`}>
                      <p className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-3">{item.label}</p>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-xl font-black text-surface-900">{item.price.toLocaleString()}₫</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-sm font-bold ${isDown ? "text-emerald-600" : "text-rose-600"}`}>
                        {isDown ? <FiArrowDownRight /> : <FiArrowUpRight />}
                        <span>{isDown ? "Giảm" : "Tăng"} {calcPercent(item.delta)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reliability Progress */}
              <div className="bg-surface-50 rounded-[2.5rem] p-8 border border-surface-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiTarget className="text-primary" />
                    <span className="text-sm font-bold text-surface-700">Độ tin cậy của thuật toán</span>
                  </div>
                  <span className="text-lg font-black text-primary">{reliability}%</span>
                </div>
                <div className="h-3 w-full bg-surface-200 rounded-full overflow-hidden p-0.5 border border-white">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${reliability}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full shadow-sm ${reliabilityColor}`}
                  />
                </div>
              </div>

              {/* AI Analysis Card */}
              {aiAnalysis && aiAnalysis !== "AI phân tích thất bại" && (
                <div className="bg-surface-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -z-0"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <FiZap size={20} />
                      </div>
                      <h5 className="text-xl font-display font-bold">Phân tích chuyên sâu từ AI</h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Xu hướng</p>
                          <p className="text-sm font-medium leading-relaxed">{aiAnalysis.trend}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Rủi ro</p>
                          <p className="text-sm font-medium leading-relaxed">{aiAnalysis.risk}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Đề xuất mua</p>
                          <p className="text-sm font-medium leading-relaxed">{aiAnalysis.suggestion}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Giá kỳ vọng hợp lý</p>
                          <p className="text-2xl font-black text-white tracking-tighter">{aiAnalysis.fairPrice?.toLocaleString()}₫</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-white/30 italic">
                      * Kết quả dự đoán được tổng hợp từ dữ liệu lịch sử và biến động thị trường thời gian thực. Thông tin chỉ mang tính chất tham khảo.
                    </p>
                  </div>
                </div>
              )}

              {/* Chart Visualization */}
              <div>
                <h5 className="text-lg font-bold text-surface-900 mb-6">Trực quan hóa biến động giá</h5>
                <div className="h-[250px] w-full bg-white rounded-3xl border border-surface-100 p-4">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-surface-100 bg-surface-50/50 flex justify-end shrink-0">
              <Button variant="secondary" className="px-8" onClick={onHide}>ĐÓNG CỬA SỔ</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PricePredictionModal;
