import React from "react";
import { FaStar } from "react-icons/fa";

/**
 * ReviewSummary Component - Compact Version
 * Hiển thị tóm tắt điểm đánh giá theo phong cách tinh tế, gọn gàng.
 */
const ReviewSummary = ({ reviews = [], avgRating }) => {
  const total = reviews.length;
  
  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 mb-8">
      {/* Left Column: Big Score */}
      <div className="text-center sm:border-r border-slate-200 sm:pr-8 flex-shrink-0">
        <p className="text-5xl font-black text-slate-900 tracking-tighter mb-1 leading-none">
          {avgRating > 0 ? avgRating.toFixed(1) : "0"}
        </p>
        <div className="flex text-amber-400 justify-center mb-2 gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar 
              key={i} 
              size={14} 
              className={i < Math.round(avgRating) ? "fill-current" : "text-slate-200"} 
            />
          ))}
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{total} Đánh giá</p>
      </div>

      {/* Right Column: Bars */}
      <div className="flex-1 w-full space-y-2.5">
        {counts.map(({ star, count }) => {
          const percent = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-6">
                <span className="text-[10px] font-bold text-slate-500">{star}</span>
                <FaStar size={8} className="text-amber-400" />
              </div>
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-slate-400 w-8 text-right">{Math.round(percent)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(ReviewSummary);
