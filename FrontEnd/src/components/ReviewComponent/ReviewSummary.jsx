import React from "react";
import { FaStar } from "react-icons/fa";

const ReviewSummary = ({ reviews = [], avgRating }) => {
  const total = reviews.length;
  
  // Tính toán số lượng cho từng mức sao
  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }));

  return (
    <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-50 dark:bg-dark-surface p-8 md:p-10 rounded-[2rem] border border-slate-100 dark:border-dark-border mb-12 shadow-sm">
      {/* Cột trái: Tổng điểm */}
      <div className="text-center md:border-r border-slate-200 dark:border-dark-border md:pr-12">
        <p className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 leading-none">
          {avgRating > 0 ? avgRating.toFixed(1) : "0"}
        </p>
        <div className="flex text-amber-400 justify-center mb-3 gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar 
              key={i} 
              size={18} 
              className={i < Math.round(avgRating) ? "fill-current" : "text-slate-200 dark:text-slate-700"} 
            />
          ))}
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{total} Đánh giá</p>
      </div>

      {/* Cột phải: Biểu đồ thanh */}
      <div className="flex-1 w-full space-y-4">
        {counts.map(({ star, count }) => {
          const percent = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-4 group">
              <div className="flex items-center gap-1 w-8">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{star}</span>
                <FaStar size={10} className="text-amber-400" />
              </div>
              <div className="flex-1 h-2.5 bg-slate-200 dark:bg-dark-bg rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 ease-out shadow-sm" 
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 w-10 text-right">{Math.round(percent)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(ReviewSummary);
