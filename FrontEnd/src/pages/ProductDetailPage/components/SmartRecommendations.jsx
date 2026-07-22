import React from "react";
import { FiZap, FiChevronRight } from "react-icons/fi";

const SmartRecommendations = ({ smartRecs }) => {
  if (!smartRecs || smartRecs.length === 0) return null;

  return (
    <div className="mt-16 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 animate-pulse shrink-0">
              <FiZap className="fill-current text-base" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Gợi Ý Mua Sắm Thông Minh
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-400">
            Dựa trên thuật toán AI & Sản phẩm phù hợp nhất với nhu cầu của bạn
          </p>
        </div>
        <a
          href="/products"
          className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors flex items-center gap-1.5 group"
        >
          Tất cả sản phẩm{" "}
          <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {smartRecs.map((rec) => {
          const finalPrice = rec.basePrice * (1 - (rec.discount || 0) / 100);
          return (
            <a
              key={rec.id}
              href={`/product-detail/${rec.slug || rec.id}`}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                      rec.reason === "Thường mua cùng"
                        ? "bg-emerald-500 text-white"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    }`}
                  >
                    {rec.reason === "Thường mua cùng" ? "🤝" : "✨"} {rec.reason || "Đề xuất"}
                  </span>
                </div>

                <div className="aspect-square rounded-2xl bg-slate-50 dark:bg-slate-900/60 mb-3 overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={rec.image || "/images/no-image.png"}
                    alt={rec.name}
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>

                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {rec.name}
                </h3>
              </div>

              <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-black text-red-600 dark:text-red-500">
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
