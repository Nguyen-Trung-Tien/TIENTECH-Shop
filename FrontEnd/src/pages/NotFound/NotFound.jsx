import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiArrowLeft, FiSearch } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]" />

      <div className="text-center relative z-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-[12rem] md:text-[16rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-indigo-600/20 tracking-tighter">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-[-2rem]"
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Oops! Trang không tồn tại
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium text-lg max-w-lg mx-auto leading-relaxed">
            Có vẻ như bạn đã đi lạc vào một không gian không có dữ liệu. Hãy quay lại hoặc tìm kiếm thứ gì đó mới mẻ hơn.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-sm"
          >
            <FiHome size={18} />
            Quay về trang chủ
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-black rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 uppercase tracking-widest text-sm"
          >
            <FiArrowLeft size={18} />
            Quay lại
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 text-gray-400 dark:text-gray-600"
        >
          <div className="h-px w-12 bg-current" />
          <FiSearch size={24} />
          <div className="h-px w-12 bg-current" />
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
