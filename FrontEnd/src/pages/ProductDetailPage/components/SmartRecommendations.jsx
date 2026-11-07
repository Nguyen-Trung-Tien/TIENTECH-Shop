import React from "react";
import { FiZap, FiChevronRight } from "react-icons/fi";

const SmartRecommendations = ({ smartRecs }) => {
  if (!smartRecs || smartRecs.length === 0) return null;

  return (
    <div className="mt-16 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-dark-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <FiZap className="size-4.5 fill-current" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Hệ Sinh Thái Tương Sinh & Gợi Ý Vượng Khí
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-dark-text-secondary">
            Sản phẩm phối hợp hoàn hảo giúp gia tăng năng suất và tài lộc dựa trên thuật toán AI
          </p>
        </div>
        <a
          href="/products"
          className="text-xs font-black uppercase tracking-wider text-primary dark:text-primary-light hover:underline transition-colors flex items-center gap-1.5 group shrink-0"
        >
          Khám phá tất cả{" "}
          <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {smartRecs.map((rec) => {
          const finalPrice = rec.basePrice * (1 - (rec.discount || 0) / 100);
          return (
            <a
              key={rec.id}
              href={`/product-detail/${rec.slug || rec.id}`}
              className="group bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/80 dark:border-dark-border p-4 hover:shadow-xl hover:border-primary/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1 ${
                      rec.reason === "Thường mua cùng"
                        ? "bg-emerald-600 text-white"
                        : "bg-gradient-to-r from-primary to-indigo-600 text-white"
                    }`}
                  >
                    {rec.reason === "Thường mua cùng" ? "🤝 Combo Đắc Lộc" : "✨ Đề Xuất"}
                  </span>
                </div>

                <div className="aspect-square rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-dark-card dark:to-dark-surface mb-3 overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={rec.image || "/images/no-image.png"}
                    alt={rec.name}
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>

                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {rec.name}
                </h3>
              </div>

              <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100 dark:border-dark-border">
                <span className="text-sm font-black text-rose-600 dark:text-rose-500">
                  {Number(finalPrice).toLocaleString("vi-VN")}₫
                </span>
                {rec.discount > 0 && (
                  <span className="text-[10px] font-medium text-slate-400 line-through">
                    {Number(rec.basePrice).toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(SmartRecommendations);
