import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiHome,
  FiShoppingBag,
  FiArrowRight,
  FiCopy,
  FiCheck,
  FiTruck,
  FiPackage,
} from "react-icons/fi";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const [countdown, setCountdown] = useState(8);
  const [copied, setCopied] = useState(false);

  const order = location.state?.order;
  const displayOrderCode = order?.orderCode || orderId || "CHECKOUT";
  const totalAmount = order?.totalAmount || order?.finalAmount;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayOrderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4 md:p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[110px]"></div>
      </div>

      <Motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-10 text-center"
      >
        {/* SUCCESS ANIMATED ICON */}
        <Motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.15 }}
          className="size-20 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-500/30"
        >
          <FiCheckCircle size={40} />
        </Motion.div>

        {/* TITLE */}
        <div className="space-y-1 mb-4">
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-800">
            Đặt Hàng Thành Công
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight pt-2">
            Cảm Ơn Bạn Đã Mua Sắm!
          </h1>
        </div>

        {/* DESCRIPTION */}
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm mx-auto mb-6">
          Đơn hàng của bạn đã được xác nhận. <span className="font-bold text-slate-800 dark:text-slate-200">TienTech Shop</span> đang chuẩn bị đóng gói và giao đến bạn sớm nhất.
        </p>

        {/* ORDER INFO CARD */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 mb-6 border border-slate-200/80 dark:border-slate-800 text-left space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-teal-400"></div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FiPackage className="text-emerald-500" /> Mã đơn hàng
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
              <span>{copied ? "Đã sao chép" : "Sao chép"}</span>
            </button>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <strong className="text-lg md:text-xl font-black text-slate-900 dark:text-white font-mono tracking-wide">
              {displayOrderCode.startsWith("#") ? displayOrderCode : `#${displayOrderCode}`}
            </strong>

            {totalAmount > 0 && (
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {Number(totalAmount).toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <FiTruck className="text-blue-500 shrink-0 text-sm" />
            <span>Dự kiến giao hàng: <strong className="text-slate-800 dark:text-slate-200">1 - 3 ngày làm việc</strong></span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="w-full sm:flex-1 py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <FiShoppingBag className="text-base" />
            Xem đơn hàng
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full sm:flex-1 py-3.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <FiHome className="text-base" />
            Trang chủ
          </button>
        </div>

        {/* AUTO REDIRECT COUNTDOWN */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>Tự động chuyển về quản lý đơn hàng</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              {countdown}s <FiArrowRight size={12} />
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <Motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
            />
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default CheckoutSuccess;
