import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiHeadphones,
  FiCheck,
  FiZap,
  FiCpu,
  FiSmartphone,
  FiSliders,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";

const SHOWCASE_ITEMS = [
  {
    id: "laptop",
    tag: "Ultrabook AI 2025",
    brand: "Apple & High-End PC",
    name: "MacBook Pro M-Series Max",
    desc: "128-core GPU • Liquid Retina XDR • Tản nhiệt buồng hơi CryoCooling",
    price: "48.990.000₫",
    originalPrice: "56.990.000₫",
    specs: "Apple M3/M4 Max • 64GB RAM • 1TB SSD",
    fps: "120 FPS Ray Tracing",
    perf: "98.4%",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
    badgeColor: "from-cyan-500 to-blue-600",
    icon: <FiCpu className="text-sm" />,
  },
  {
    id: "phone",
    tag: "Flagship AI Smartphone",
    brand: "Flagship Series",
    name: "Titanium Pro Ultra 5G",
    desc: "Camera Periscope 200MP • Khung viền Titanium cấp hàng không • Chip 3nm",
    price: "29.490.000₫",
    originalPrice: "34.990.000₫",
    specs: "Snapdragon 8 Gen 3 / A18 Pro • 16GB RAM",
    fps: "144Hz ProMotion OLED",
    perf: "99.1%",
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=1000",
    badgeColor: "from-violet-500 to-indigo-600",
    icon: <FiSmartphone className="text-sm" />,
  },
  {
    id: "audio",
    tag: "Hi-Res Studio Sound",
    brand: "Audiophile Grade",
    name: "CyberBuds Studio ANC Pro",
    desc: "Chống ồn chủ động thích ứng 48dB • Codec LDAC 24-bit/96kHz • Pin 40 Giờ",
    price: "4.890.000₫",
    originalPrice: "6.290.000₫",
    specs: "Dual Driver 11mm • Bluetooth 5.4 Low Latency",
    fps: "Hi-Res Wireless Audio",
    perf: "97.8%",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000",
    badgeColor: "from-emerald-500 to-teal-600",
    icon: <FiHeadphones className="text-sm" />,
  },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(SHOWCASE_ITEMS[0]);

  const scrollToFlashSale = () => {
    const flashSaleSection = document.getElementById("flash-sale-section");
    if (flashSaleSection) {
      flashSaleSection.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/products?sale=true");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white dark:from-slate-950 dark:via-dark-bg dark:to-dark-bg text-slate-900 dark:text-white pt-8 pb-14 lg:pt-16 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      {/* Dynamic Ambient Neon Glows */}
      <div className="absolute -top-32 left-1/4 w-[600px] h-[350px] bg-blue-500/10 dark:bg-cyan-500/15 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-[500px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-20 left-1/3 w-[400px] h-[250px] bg-violet-600/5 dark:bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Cyber Grid Background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b14_1px,transparent_1px),linear-gradient(to_bottom,#1e293b14_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left min-w-0">
            {/* Cyber Pill Tag */}
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center lg:justify-start"
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-slate-800/80 backdrop-blur-md border border-blue-200 dark:border-cyan-500/40 text-blue-700 dark:text-cyan-300 text-xs font-semibold mb-5 shadow-xs dark:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 dark:bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-blue-600 dark:bg-cyan-400"></span>
                </span>
                <span className="tracking-wide uppercase text-[11px] font-mono">
                  Kỷ Nguyên Công Nghệ Flagship &bull; AI-Powered 2025
                </span>
              </div>
            </Motion.div>

            {/* Main Headline */}
            <Motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black leading-[1.12] mb-5 tracking-tight text-slate-900 dark:text-white"
            >
              Hệ Sinh Thái Thiết Bị
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-cyan-400 dark:via-blue-500 dark:to-indigo-400 drop-shadow-xs dark:drop-shadow-[0_0_35px_rgba(6,182,212,0.3)]">
                Công Nghệ Đỉnh Cao
              </span>
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8 font-normal"
            >
              Trải nghiệm hiệu năng vượt trội từ các dòng Laptop Gaming AI, Smartphone thế hệ mới, Thiết bị âm thanh Hi-Res và linh kiện cao cấp được phân phối 100% chính hãng với chính sách bảo hành VIP 1 đổi 1 trong 24 tháng.
            </Motion.p>

            {/* CTAs */}
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5"
            >
              <button
                type="button"
                onClick={() => navigate("/products")}
                aria-label="Khám phá ngay danh mục công nghệ tại TienTech"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-600 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-600 dark:hover:from-cyan-400 dark:hover:via-blue-500 dark:hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 dark:shadow-[0_0_25px_rgba(6,182,212,0.35)] active:scale-98 cursor-pointer group"
              >
                <FiShoppingBag className="text-base" />
                Khám phá ngay
                <FiArrowRight className="group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={scrollToFlashSale}
                aria-label="Săn deal Flash Sale sốc"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 bg-white hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-800 dark:text-cyan-300 hover:text-blue-600 dark:hover:text-white border border-slate-200 dark:border-cyan-500/40 hover:border-blue-400 dark:hover:border-cyan-400 shadow-2xs active:scale-98 cursor-pointer"
              >
                <FiZap className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 animate-bounce" />
                Săn Deal Hot ⚡
              </button>
            </Motion.div>

            {/* Live Trust Metrics Bar */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
            >
              {[
                {
                  icon: <FiShield className="text-blue-600 dark:text-cyan-400 text-base" />,
                  title: "100% Chính Hãng",
                  desc: "Bồi hoàn 200% nếu giả",
                },
                {
                  icon: <FiTruck className="text-indigo-600 dark:text-indigo-400 text-base" />,
                  title: "Giao Siêu Tốc 2H",
                  desc: "Nội thành hỏa tốc",
                },
                {
                  icon: <FiRefreshCw className="text-emerald-600 dark:text-emerald-400 text-base" />,
                  title: "1 Đổi 1 30 Ngày",
                  desc: "Lỗi NSX đổi mới ngay",
                },
                {
                  icon: <FiHeadphones className="text-amber-600 dark:text-amber-400 text-base" />,
                  title: "Kỹ Thuật 24/7",
                  desc: "Chuyên gia hỗ trợ",
                },
              ].map((perk, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs min-w-0"
                >
                  <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0">
                    {perk.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate">
                      {perk.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {perk.desc}
                    </p>
                  </div>
                </div>
              ))}
            </Motion.div>
          </div>

          {/* Right Content - Futuristic Interactive 3D Showcase Card */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex-1 w-full max-w-xl relative min-w-0"
          >
            <div className="relative rounded-3xl p-5 md:p-6 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xl shadow-slate-200/50 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Top Selector Tabs */}
              <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  {SHOWCASE_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeItem.id === item.id
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {item.icon}
                      <span className="hidden sm:inline">{item.tag.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-cyan-400 font-mono">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-[11px]">LIVE DEMO</span>
                </div>
              </div>

              {/* Showcase Image with AnimatePresence */}
              <AnimatePresence mode="wait">
                <Motion.div
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 aspect-[16/10] group border border-slate-200 dark:border-slate-800">
                    <img
                      src={activeItem.image}
                      alt={activeItem.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />

                    {/* Radial Center Glow matching item */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none"></div>

                    {/* Floating Telemetry Glass Card 1 (Top Left) */}
                    <div className="absolute top-3.5 left-3.5 p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-cyan-500/30 text-[11px] shadow-lg max-w-[210px] min-w-0">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-mono font-bold mb-1">
                        <FiSliders className="text-xs" />
                        <span className="truncate">{activeItem.fps}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 h-1.5 rounded-full"
                          style={{ width: activeItem.perf }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block truncate">
                        Hiệu năng đạt {activeItem.perf}
                      </span>
                    </div>

                    {/* Floating Telemetry Glass Card 2 (Bottom Right) */}
                    <div className="absolute bottom-3.5 right-3.5 p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-emerald-500/30 text-[11px] shadow-lg text-right max-w-[190px]">
                      <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                        Đặc quyền thành viên
                      </span>
                      <span className="text-slate-900 dark:text-white font-black text-sm block mt-0.5">
                        {activeItem.price}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        {activeItem.originalPrice}
                      </span>
                    </div>
                  </div>

                  {/* Active Spec Info */}
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider font-mono">
                          {activeItem.brand}
                        </span>
                        <span className="text-slate-400 dark:text-slate-600">&bull;</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <FiCheck className="text-xs" /> Sẵn sàng giao ngay
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {activeItem.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {activeItem.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/products")}
                      className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30 text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Xem chi tiết &rarr;
                    </button>
                  </div>
                </Motion.div>
              </AnimatePresence>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
