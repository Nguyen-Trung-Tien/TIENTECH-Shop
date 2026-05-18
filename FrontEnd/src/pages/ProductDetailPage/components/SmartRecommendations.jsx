import React from "react";
import { FiZap, FiChevronRight } from "react-icons/fi";

const SmartRecommendations = ({ smartRecs }) => {
  if (smartRecs.length === 0) return null;

  return (
    <div className="mt-20 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-dark-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
              <FiZap className="fill-current" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Gợi ý thông minh
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
            Dựa trên phân tích AI & Hành vi mua sắm của bạn
          </p>
        </div>
        <a
          href="/products"
          className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-brand hover:text-indigo-700 dark:hover:text-brand transition-colors flex items-center gap-2 group"
        >
          Xem tất cả sản phẩm{" "}
          <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {smartRecs.map((rec) => (
          <a
            key={rec.id}
            href={`/product-detail/${rec.slug || rec.id}`}
            className="group bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border p-4 hover:shadow-2xl dark:hover:shadow-none hover:shadow-indigo-100 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1 ${
                  rec.reason === "Thường mua cùng"
                    ? "bg-emerald-500 text-white"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {rec.reason === "Thường mua cùng" ? "🤝" : "✨"}{" "}
                {rec.reason}
              </span>
            </div>

            <div className="aspect-square rounded-2xl bg-gray-50 dark:bg-dark-bg mb-4 overflow-hidden flex items-center justify-center p-4">
              <img
                src={rec.image}
                alt={rec.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 dark:mix-blend-normal"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate group-hover:text-indigo-600 dark:group-hover:text-brand transition-colors">
                {rec.name}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-black text-red-600 dark:text-red-500">
                  {Number(
                    rec.basePrice * (1 - (rec.discount || 0) / 100),
                  ).toLocaleString()}
                  đ
                </span>
                {rec.discount > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary line-through">
                    {rec.basePrice.toLocaleString()}đ
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SmartRecommendations);
