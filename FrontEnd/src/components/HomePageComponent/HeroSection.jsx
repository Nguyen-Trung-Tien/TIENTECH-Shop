import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiShoppingBag, FiShield, FiTruck, FiRefreshCw, FiHeadphones, FiCheck } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white dark:from-[#0c1220] dark:via-dark-bg dark:to-dark-bg pt-8 pb-14 lg:pt-14 lg:pb-20 transition-colors duration-300 border-b border-slate-100 dark:border-slate-800/80">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left min-w-0">
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center lg:justify-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/40 text-primary dark:text-blue-400 text-xs font-semibold mb-5 shadow-2xs">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-blue-600"></span>
                </span>
                <span>Công nghệ tiên phong &bull; Phân phối chính hãng</span>
              </div>
            </Motion.div>

            <Motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-slate-900 dark:text-white leading-[1.15] mb-5 tracking-tight"
            >
              Thiết bị &amp; linh kiện
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-primary">
                công nghệ hàng đầu
              </span>
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8 font-normal"
            >
              Trải nghiệm mua sắm thông minh cùng hệ sinh thái Smartphone, Laptop, Máy tính bảng và linh kiện cao cấp từ các thương hiệu hàng đầu thế giới với chính sách bảo hành 1 đổi 1 an tâm tuyệt đối.
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5"
            >
              <button
                type="button"
                onClick={() => navigate("/products")}
                aria-label="Khám phá toàn bộ danh mục sản phẩm tại TienTech"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 bg-primary hover:bg-primary-hover text-white shadow-lg shadow-blue-600/25 active:scale-98 cursor-pointer group"
              >
                <FiShoppingBag className="text-base" />
                Khám phá sản phẩm
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/about")}
                aria-label="Tìm hiểu về TienTech"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 bg-white hover:bg-slate-50 dark:bg-dark-surface dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs active:scale-98 cursor-pointer"
              >
                Về chúng tôi
              </button>
            </Motion.div>

            {/* Feature Perks Bar */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
            >
              {[
                { icon: <FiShield className="text-primary text-base" />, title: "Chính Hãng 100%", desc: "Bảo hành 12-24T" },
                { icon: <FiTruck className="text-indigo-500 text-base" />, title: "Giao Siêu Tốc 2H", desc: "Nội thành hỏa tốc" },
                { icon: <FiRefreshCw className="text-emerald-500 text-base" />, title: "1 Đổi 1 30 Ngày", desc: "Lỗi NSX đổi mới" },
                { icon: <FiHeadphones className="text-amber-500 text-base" />, title: "Hỗ Trợ 24/7", desc: "Kỹ thuật chuyên môn" }
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-slate-800 shadow-xs min-w-0">
                  <div className="size-9 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center shrink-0">
                    {perk.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{perk.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </Motion.div>
          </div>

          {/* Right Content - Modern Product Showcase Card */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex-1 hidden lg:block relative min-w-0 w-full max-w-lg"
          >
            <div className="relative rounded-3xl p-5 bg-white dark:bg-dark-surface border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
              {/* Header Spec Tag */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Sản phẩm nổi bật</span>
                </div>
                <span className="text-[11px] font-medium text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                  Chính hãng Apple
                </span>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-[4/3] group">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000"
                  alt="TienTech Featured Product"
                  className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent">
                  <div className="flex items-center justify-between text-white mb-1.5">
                    <span className="text-sm font-bold">MacBook Pro M-Series</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">Sẵn hàng</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <span>Chip Apple M-Max</span>
                    <span>&bull;</span>
                    <span>RAM 64GB</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-bold">Giá ưu đãi</span>
                  </div>
                </div>
              </div>

              {/* Bottom Verification */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                  <FiCheck className="text-emerald-500 stroke-[2.5]" /> Bảo hành 24 tháng chính hãng &amp; hỗ trợ kỹ thuật trọn đời
                </span>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
