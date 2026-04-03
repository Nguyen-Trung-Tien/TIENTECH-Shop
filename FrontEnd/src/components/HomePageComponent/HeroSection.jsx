import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiShoppingBag, FiInfo } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-white dark:bg-black pt-10 pb-12 lg:pt-20 lg:pb-24 transition-colors duration-300 border-b border-slate-100 dark:border-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[100px]"></div>
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
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Ưu đãi công nghệ mỗi ngày
              </span>
            </Motion.div>

            <Motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight"
            >
              TienTech{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                Shop
              </span>
              <br />
              <span className="text-xl md:text-3xl font-light text-slate-400 dark:text-slate-500">
                Định nghĩa lại trải nghiệm công nghệ
              </span>
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8 font-medium"
            >
              Khám phá hệ sinh thái sản phẩm công nghệ chính hãng từ Laptop,
              Smartphone đến linh kiện PC cao cấp. Cam kết giá tốt nhất thị
              trường cùng chính sách bảo hành 1:1.
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => navigate("/products")}
                className="group flex items-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/25 active:scale-95 uppercase tracking-widest"
              >
                <FiShoppingBag className="text-lg" />
                Mua ngay
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/about")}
                className="flex items-center gap-3 px-6 py-3.5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95 uppercase tracking-widest"
              >
                Về chúng tôi
              </button>
            </Motion.div>

            {/* Trust Badges */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 md:gap-8"
            >
              {[
                  { val: "50k+", label: "Khách hàng" },
                  { val: "100%", label: "Chính hãng" },
                  { val: "24/7", label: "Hỗ trợ" }
              ].map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center lg:items-start group cursor-default">
                        <p className="text-slate-900 dark:text-white font-black text-lg leading-none group-hover:text-blue-600 transition-colors">
                        {item.val}
                        </p>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                        {item.label}
                        </p>
                    </div>
                    {idx < 2 && <div className="w-[1px] h-6 bg-slate-200 dark:bg-gray-800 hidden sm:block"></div>}
                  </React.Fragment>
              ))}
            </Motion.div>
          </div>

          {/* Right Content - Visual */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 hidden lg:block relative"
          >
            <div className="relative z-10 p-6 rounded-[3rem] bg-gray-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000"
                alt="TienTech Products"
                className="rounded-[2rem] shadow-2xl object-cover aspect-[4/3] w-full"
              />

              {/* Floating Card */}
              <Motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-4 -left-4 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 flex items-center gap-4 max-w-[180px]"
              >
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiShoppingBag />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    Flash Sale
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase">
                    -50% OFF
                  </p>
                </div>
              </Motion.div>
            </div>

            {/* Glow effect under the image */}
            <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[80px] -z-10"></div>
          </Motion.div>
        </div>
      </div>
      {/* Bottom Shape Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden line-height-0 transform rotate-180">
        <svg className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white dark:fill-black"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
