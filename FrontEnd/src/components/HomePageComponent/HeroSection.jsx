import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiShoppingBag, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-slate-900 pt-16 pb-20 lg:pt-32 lg:pb-40">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Ưu đãi công nghệ mỗi ngày
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-8"
            >
              TienTech{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                Shop
              </span>
              <br />
              <span className="text-2xl md:text-4xl font-light text-slate-400">
                Định nghĩa lại trải nghiệm công nghệ
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-10"
            >
              Khám phá hệ sinh thái sản phẩm công nghệ chính hãng từ Laptop,
              Smartphone đến linh kiện PC cao cấp. Cam kết giá tốt nhất thị
              trường cùng chính sách bảo hành 1:1.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => navigate("/products")}
                className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 active:scale-95"
              >
                <FiShoppingBag className="text-xl" />
                Mua ngay ngay
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/about")}
                className="flex items-center gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95"
              >
                <FiInfo className="text-xl" />
                Về chúng tôi
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
            >
              <div className="flex flex-col items-center lg:items-start">
                <p className="text-white font-bold text-xl leading-none">
                  50k+
                </p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Khách hàng
                </p>
              </div>
              <div className="w-[1px] h-8 bg-slate-800 hidden sm:block"></div>
              <div className="flex flex-col items-center lg:items-start">
                <p className="text-white font-bold text-xl leading-none">
                  100%
                </p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Chính hãng
                </p>
              </div>
              <div className="w-[1px] h-8 bg-slate-800 hidden sm:block"></div>
              <div className="flex flex-col items-center lg:items-start">
                <p className="text-white font-bold text-xl leading-none">
                  24/7
                </p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Hỗ trợ
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 hidden lg:block relative"
          >
            <div className="relative z-10 p-8 rounded-[40px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000"
                alt="TienTech Products"
                className="rounded-[32px] shadow-2xl object-cover aspect-[4/3] w-full"
              />

              {/* Floating Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-6 -left-6 p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4 max-w-[200px]"
              >
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiShoppingBag />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Flash Sale
                  </p>
                  <p className="text-sm font-black text-slate-900 leading-tight">
                    Giảm tới 50%
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Glow effect under the image */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
