import React, { useState, useEffect } from "react";
import {
  FiCpu,
  FiTrendingUp,
  FiAlertCircle,
  FiShoppingBag,
  FiChevronUp,
} from "react-icons/fi";
import { getAIInsights } from "../../../api/adminApi";
import { motion as Motion, AnimatePresence } from "framer-motion";

const AIInsightsWidget = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  // Khởi tạo trạng thái đóng/mở từ localStorage để ghi nhớ lựa chọn của người dùng
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("ai_consultant_expanded");
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("ai_consultant_expanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      setLoading(false);
      return;
    }

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await getAIInsights();
        if (res.errCode === 0) {
          setInsights(res.data);
        }
      } catch {
        console.error("Failed to load AI insights");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [isExpanded]);

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
      {/* Header - Luôn hiển thị để Bật/Tắt */}
      <div
        className="p-6 cursor-pointer flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-800 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${isExpanded ? "bg-primary text-white scale-110 shadow-primary/20" : "bg-slate-800 text-slate-500"}`}
          >
            <FiCpu className={isExpanded ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight uppercase">
              AI Business Consultant
            </h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              Gợi ý chiến lược thông minh từ TienTech AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isExpanded && (
            <span className="hidden md:inline text-[9px] font-black text-slate-500 bg-slate-900 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-800">
              Tắt - Nhấn để mở
            </span>
          )}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-slate-400 transition-transform ${isExpanded ? "rotate-0" : "rotate-180"}`}
          >
            <FiChevronUp />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {loading ? (
              <div className="p-12 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Đang phân tích dữ liệu hệ thống...
                </p>
              </div>
            ) : insights ? (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800">
                {/* Promotion Suggestions */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <FiTrendingUp className="text-rose-500" /> Đẩy mạnh doanh số
                  </h4>
                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                    <ul className="space-y-3">
                      {insights.promotionSuggestions?.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed"
                        >
                          <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Restock Suggestions */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <FiShoppingBag className="text-sky-500" /> Quản lý tồn kho
                  </h4>
                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                    <ul className="space-y-3">
                      {insights.restockSuggestions?.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed"
                        >
                          <span className="w-1 h-1 rounded-full bg-sky-500 mt-1.5 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Strategic Advice */}
                <div className="md:col-span-2 border-t border-slate-800/50 pt-6 mt-2">
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <FiAlertCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                        Lời khuyên chiến lược
                      </p>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">
                        {insights.strategicAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                Không có dữ liệu phân tích.
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsightsWidget;
