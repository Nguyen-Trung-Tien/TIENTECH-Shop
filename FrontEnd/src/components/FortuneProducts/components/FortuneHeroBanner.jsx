import React from "react";
import { Compass, Zap } from "lucide-react";

const FortuneHeroBanner = ({ allElements, activeElement }) => {
  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white p-6 sm:p-10 md:p-14 border border-indigo-100 dark:border-slate-800 shadow-lg dark:shadow-2xl transition-colors duration-300">
      <div className="absolute top-0 right-0 p-8 opacity-15 dark:opacity-10 select-none pointer-events-none transform translate-x-8 -translate-y-8">
        <Compass className="size-[280px] text-indigo-500/30 dark:text-blue-400 animate-spin-slow" />
      </div>
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl min-w-0">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/30 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-md">
          <Zap className="size-3.5 text-indigo-500 dark:text-indigo-400" />
          AI Tech Color &amp; Setup Advisor
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-5 text-slate-900 dark:text-white">
          Chọn Màu Sắc &amp;{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
            Góc Setup
          </span>
          <br />
          <span className="font-serif italic font-normal text-slate-600 dark:text-slate-300 text-2xl sm:text-3xl md:text-4xl block mt-1">
            Chuẩn Cá Tính • Đồng Bộ Không Gian Làm Việc
          </span>
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg font-normal leading-relaxed max-w-2xl min-w-0 break-words mb-8">
          AI Tech Color &amp; Setup Advisor kết hợp hồ sơ cá nhân và sở thích thẩm mỹ để gợi ý phiên bản màu sắc thiết bị và phong cách bàn làm việc tối ưu nhất cho bạn.
        </p>

        {allElements.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mr-2">
              Ngũ Hành:
            </span>
            {allElements.map((el) => {
              const isActive = activeElement === el.key;
              return (
                <span
                  key={el.key}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/50 shadow-sm font-bold"
                      : "bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 shadow-xs"
                  }`}
                >
                  <span>{el.icon}</span>
                  <span>{el.name}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FortuneHeroBanner;
