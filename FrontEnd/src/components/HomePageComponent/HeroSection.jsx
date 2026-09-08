import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiShoppingBag, FiShield, FiTruck, FiRefreshCw, FiHeadphones, FiCpu, FiCheck } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-ivory dark:bg-dark-bg pt-8 pb-14 lg:pt-14 lg:pb-20 transition-colors duration-300 border-b border-slate-200/80 dark:border-slate-800">
      {/* Subtle Technical Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

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
              <div className="tt-eyebrow mb-5">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-lime-500"></span>
                </span>
                <span>CURATED HARDWARE CATALOG // ED. 2026</span>
              </div>
            </Motion.div>

            <Motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 dark:text-white leading-[1.12] mb-5 tracking-tight uppercase"
            >
              Hệ Thống Thiết Bị &amp;
              <br />
              <span className="text-primary dark:text-blue-400">
                Linh Kiện Tuyển Chọn
              </span>
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8 font-normal"
            >
              Phân phối chính ngạch Smartphone cao cấp, Workstation, Laptop đồ họa và linh kiện chuẩn công nghiệp. Kiểm chuẩn 100% trước khi xuất kho cùng bảo hành đổi mới 1-1.
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <button
                type="button"
                onClick={() => navigate("/products")}
                aria-label="Khám phá toàn bộ danh mục sản phẩm tại TienTech"
                className="tt-button tt-button-primary group px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                <FiShoppingBag className="text-base" />
                Khám phá danh mục
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/about")}
                aria-label="Tìm hiểu tiêu chuẩn kỹ thuật TienTech"
                className="tt-button tt-button-secondary px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                Tiêu chuẩn TienTech
              </button>
            </Motion.div>

            {/* Feature Perks Bar - Technical Ledger Style */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
            >
              {[
                { no: "01", icon: <FiShield className="text-primary dark:text-blue-400" />, title: "Chính Hãng 100%", desc: "Bảo hành 12-24T" },
                { no: "02", icon: <FiTruck className="text-lime-600 dark:text-lime-400" />, title: "Giao Siêu Tốc 2H", desc: "Nội thành hỏa tốc" },
                { no: "03", icon: <FiRefreshCw className="text-primary dark:text-blue-400" />, title: "1 Đổi 1 30 Ngày", desc: "Lỗi NSX đổi mới" },
                { no: "04", icon: <FiHeadphones className="text-lime-600 dark:text-lime-400" />, title: "Hỗ Trợ 24/7", desc: "Kỹ sư đồng hành" }
              ].map((perk, idx) => (
                <div key={idx} className="flex flex-col p-2.5 rounded-lg bg-white/60 dark:bg-dark-surface/60 border border-slate-200/60 dark:border-slate-800/80 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">{perk.no}</span>
                    <span className="text-sm">{perk.icon}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{perk.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{perk.desc}</p>
                </div>
              ))}
            </Motion.div>
          </div>

          {/* Right Content - Technical Architecture Card */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex-1 hidden lg:block relative min-w-0 w-full max-w-lg"
          >
            <div className="relative tt-card p-4 bg-white dark:bg-dark-surface border border-slate-300/80 dark:border-slate-800 shadow-xl overflow-hidden">
              {/* Header Spec Tag */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-lime-500"></span>
                  <span>SYS // PRO-SERIES HARDWARE</span>
                </div>
                <span>TIENTECH VALIDATED</span>
              </div>

              <div className="relative overflow-hidden rounded-lg bg-slate-900 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000"
                  alt="TienTech Reference Architecture Hardware"
                  className="w-full h-full object-cover opacity-90 hover:scale-103 transition-transform duration-500"
                />

                {/* Technical Overlay Spec Sheet */}
                <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent backdrop-blur-[2px]">
                  <div className="flex items-center justify-between text-white mb-1.5">
                    <span className="text-xs font-black uppercase tracking-wider">MacBook Pro &bull; Workstation Rig</span>
                    <span className="tt-badge-lime text-[9px] py-0.5">SẴN HÀNG</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300">
                    <div className="flex items-center gap-1">
                      <FiCpu className="text-lime-400" />
                      <span>CHIP: M-MAX</span>
                    </div>
                    <div>
                      <span>RAM: 64GB UNIFIED</span>
                    </div>
                    <div className="text-right text-lime-400 font-bold">
                      <span>GIÁ: CHÍNH HÃNG</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Technical Verification Pill */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  <FiCheck className="text-lime-500 stroke-[3]" /> Kiểm chuẩn nhiệt độ &amp; hiệu năng trước bàn giao
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">REV.2026</span>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
