import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiShoppingBag, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-black dark:via-dark-bg dark:to-black pt-10 pb-16 lg:pt-16 lg:pb-24 transition-colors duration-300 border-b border-slate-100 dark:border-slate-800/80">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px]"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-700/50 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6 shadow-xs">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-blue-600"></span>
                </span>
                Hệ thống Công nghệ & Linh kiện Chính hãng
              </span>
            </Motion.div>

            <Motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.15] mb-6 tracking-tight"
            >
              TIENTECH{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                SHOP
              </span>
              <br />
              <span className="text-2xl md:text-3xl font-bold text-slate-500 dark:text-slate-400 tracking-normal">
                Công Nghệ Đỉnh Cao - Trải Nghiệm Hoàn Hảo
              </span>
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8 font-medium"
            >
              Chuyên phân phối Smartphone, Laptop, PC Gaming và Linh phụ kiện cao cấp chính hãng 100%. Cam kết giá cạnh tranh cùng chính sách hậu mãi vượt trội.
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => navigate("/products")}
                className="group flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs md:text-sm transition-all shadow-xl shadow-blue-500/25 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <FiShoppingBag className="text-lg" />
                Khám phá sản phẩm
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/about")}
                className="flex items-center gap-3 px-7 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs md:text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                Về TienTech
              </button>
            </Motion.div>

            {/* Feature Perks Bar */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 pt-8 border-t border-slate-200/70 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                { icon: <FiShield className="text-blue-600" />, title: "Chính hãng 100%", desc: "Bảo hành 12-24T" },
                { icon: <FiTruck className="text-emerald-500" />, title: "Giao hàng 2H", desc: "Miễn phí toàn quốc" },
                { icon: <FiRefreshCw className="text-amber-500" />, title: "1 Đổi 1 30 Ngày", desc: "Lỗi do nhà sản xuất" },
                { icon: <FiHeadphones className="text-indigo-500" />, title: "Hỗ trợ 24/7", desc: "Tư vấn chuyên sâu" }
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shrink-0">
                    {perk.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{perk.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </Motion.div>
          </div>

          {/* Right Content - Visual Graphic Banner */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 hidden lg:block relative"
          >
            <div className="relative z-10 p-5 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000"
                alt="TienTech Products"
                className="rounded-[1.8rem] shadow-lg object-cover aspect-[4/3] w-full"
              />

              {/* Floating Highlight Card */}
              <Motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-5 -left-5 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5"
              >
                <div className="size-10 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <FiShoppingBag className="text-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Săn Deal Tuần Này
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase">
                    Ưu Đãi Tới 50%
                  </p>
                </div>
              </Motion.div>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
