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
  FiCreditCard,
  FiPause,
} from "react-icons/fi";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { m as Motion } from "framer-motion";
import { getOrderById } from "../../api/orderApi";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const [countdown, setCountdown] = useState(12);
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState(null);

  const order = location.state?.order || fetchedOrder;
  const displayOrderCode = order?.orderCode || orderId || "CHECKOUT";
  const totalAmount = order?.totalPrice ?? order?.totalAmount ?? order?.finalAmount;

  useEffect(() => {
    if (!location.state?.order && orderId) {
      getOrderById(orderId)
        .then((res) => {
          if (res?.errCode === 0 && res?.data) {
            setFetchedOrder(res.data);
          }
        })
        .catch(() => {});
    }
  }, [location.state?.order, orderId]);

  useEffect(() => {
    if (!autoRedirect) return;
    if (countdown <= 0) {
      navigate(order?.id ? `/orders-detail/${order.id}` : "/orders");
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, autoRedirect, navigate, order?.id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayOrderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const targetOrderUrl = order?.id ? `/orders-detail/${order.id}` : "/orders";

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex items-center justify-center p-4 md:p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[110px]"></div>
      </div>

      <Motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 text-center"
      >
        {/* SUCCESS ANIMATED ICON */}
        <Motion.div
          initial={{ scale: 0, rotate: -35 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
          className="size-18 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-xl shadow-emerald-500/25"
        >
          <FiCheckCircle size={36} />
        </Motion.div>

        {/* TITLE */}
        <div className="space-y-1.5 mb-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Đặt Hàng Thành Công!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Cảm ơn bạn đã mua sắm tại <span className="font-bold text-slate-800 dark:text-slate-200">TienTech Shop</span>. Đơn hàng đang được chuẩn bị và giao đến bạn sớm nhất.
          </p>
        </div>

        {/* ORDER INFO CARD */}
        <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 sm:p-5 my-5 border border-slate-200/80 dark:border-slate-800 text-left space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-teal-400" />

          <div className="flex items-center justify-between gap-2">
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

          <div className="flex flex-wrap items-baseline justify-between gap-2 min-w-0">
            <strong className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-wide break-all min-w-0">
              {displayOrderCode.startsWith("#") ? displayOrderCode : `#${displayOrderCode}`}
            </strong>

            {totalAmount > 0 && (
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">
                {Number(totalAmount).toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <FiTruck className="text-blue-500 shrink-0" />
              Dự kiến: <strong className="text-slate-800 dark:text-slate-200">1 - 3 ngày</strong>
            </span>
            {order?.paymentMethod && (
              <span className="flex items-center gap-1.5 font-medium uppercase">
                <FiCreditCard className="text-emerald-500 shrink-0" />
                <strong className="text-slate-800 dark:text-slate-200">{order.paymentMethod}</strong>
              </span>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => navigate(targetOrderUrl)}
            className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <FiShoppingBag className="text-base" />
            Xem chi tiết đơn
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full sm:flex-1 py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <FiHome className="text-base" />
            Trang chủ
          </button>
        </div>

        {/* AUTO REDIRECT COUNTDOWN */}
        {autoRedirect ? (
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="truncate">Chuyển trang sau {countdown}s</span>
              <button
                type="button"
                onClick={() => setAutoRedirect(false)}
                className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <FiPause size={12} /> Ở lại trang
              </button>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <Motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 12, ease: "linear" }}
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(targetOrderUrl)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Đi tới đơn hàng của tôi <FiArrowRight size={12} />
          </button>
        )}
      </Motion.div>
    </div>
  );
};

export default CheckoutSuccess;
