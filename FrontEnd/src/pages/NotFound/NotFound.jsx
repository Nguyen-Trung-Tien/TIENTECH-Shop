import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft, FiSearch, FiCompass, FiShoppingBag } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[130px]" />
      </div>

      <div className="text-center relative z-10 max-w-2xl">
        {/* BIG 404 TEXT WITH GRADIENT */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative inline-block select-none"
        >
          <h1 className="text-[10rem] sm:text-[14rem] md:text-[16rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-blue-600 via-indigo-600 to-slate-300 dark:to-slate-900 tracking-tighter">
            404
          </h1>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/30 backdrop-blur-md rounded-full text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <FiCompass className="animate-spin text-sm" /> Page Not Found
          </div>
        </Motion.div>

        {/* MESSAGES */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-2 space-y-3"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Oops! Không Tìm Thấy Trang
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển sang địa chỉ mới.
          </p>
        </Motion.div>

        {/* ACTION BUTTONS */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer"
          >
            <FiHome size={16} />
            Quay về trang chủ
          </Link>

          <Link
            to="/products"
            className="flex items-center gap-2.5 px-7 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 uppercase tracking-wider text-xs cursor-pointer"
          >
            <FiShoppingBag size={16} />
            Khám phá sản phẩm
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold uppercase tracking-wider text-xs cursor-pointer transition-colors"
          >
            <FiArrowLeft size={16} />
            Trở lại
          </button>
        </Motion.div>

        {/* DECORATION */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.5 }}
          className="mt-14 flex items-center justify-center gap-6 text-slate-300 dark:text-slate-700"
        >
          <div className="h-px w-16 bg-current" />
          <FiSearch size={20} />
          <div className="h-px w-16 bg-current" />
        </Motion.div>
      </div>
    </div>
  );
};

export default NotFound;
