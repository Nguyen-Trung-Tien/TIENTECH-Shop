import React, { useState, useEffect } from "react";
import { FiCpu, FiTrendingUp, FiAlertCircle, FiShoppingBag, FiStar } from "react-icons/fi";
import { getAIInsights } from "../../../api/adminApi";

const AIInsightsWidget = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getAIInsights();
        if (res.errCode === 0) {
          setInsights(res.data);
        }
      } catch (error) {
        console.error("Failed to load AI insights");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-[40px] p-8 text-white animate-pulse min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiCpu size={40} className="text-primary animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">AI đang phân tích dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-slate-950 rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <FiCpu className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">AI Business Consultant</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gợi ý chiến lược từ Gemini AI</p>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Dữ liệu thực tế</span>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Promotion Suggestions */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <FiTrendingUp className="text-rose-500" /> Đẩy mạnh doanh số
          </h4>
          <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800/50">
            <ul className="space-y-3">
              {insights.promotionSuggestions.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Restock Suggestions */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <FiShoppingBag className="text-sky-500" /> Quản lý tồn kho
          </h4>
          <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800/50">
            <ul className="space-y-3">
              {insights.restockSuggestions.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Service Feedback */}
        <div className="md:col-span-2 space-y-4 border-t border-slate-800 pt-8 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <FiStar className="text-amber-500" /> Chất lượng dịch vụ
              </h4>
              <p className="text-sm text-slate-400 italic leading-relaxed bg-slate-900/30 p-6 rounded-3xl border border-slate-800/30">
                "{insights.serviceReview}"
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <FiAlertCircle className="text-primary" /> Lời khuyên chiến lược
              </h4>
              <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6">
                <p className="text-primary font-bold text-sm leading-relaxed">
                  {insights.strategicAdvice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsWidget;
