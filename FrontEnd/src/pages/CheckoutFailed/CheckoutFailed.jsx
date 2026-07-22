import React, { useEffect } from "react";
import { FiXCircle, FiHome, FiRotateCw, FiAlertCircle, FiCreditCard, FiHelpCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { motion as Motion } from "framer-motion";

const CheckoutFailed = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    document.title = "Thanh toán thất bại - TienTech Shop";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4 md:p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-red-500/10 dark:bg-red-600/15 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/10 dark:bg-amber-600/15 rounded-full blur-[110px]"></div>
      </div>

      <Motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-10 text-center"
      >
        {/* FAILED ANIMATED ICON */}
        <Motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.15 }}
          className="size-20 bg-gradient-to-tr from-rose-600 to-red-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-red-500/30"
        >
          <FiXCircle size={40} />
        </Motion.div>

        {/* TITLE */}
        <div className="space-y-1 mb-4">
          <span className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-200 dark:border-red-800">
            Giao Dịch Không Thành Công
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight pt-2">
            Thanh Toán Thất Bại
          </h1>
        </div>

        {/* DESCRIPTION */}
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm mx-auto mb-6">
          Giao dịch của bạn chưa thể hoàn tất. Vui lòng kiểm tra lại số dư tài khoản, thông tin thẻ hoặc chọn phương thức thanh toán khác.
        </p>

        {/* ORDER CODE REFERECE (IF ANY) */}
        {orderId && (
          <div className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-4 mb-6 border border-red-100 dark:border-red-900/30 text-center">
            <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest block mb-1">
              Mã tham chiếu đơn hàng
            </span>
            <strong className="text-lg font-black text-red-600 dark:text-red-400 font-mono tracking-wider">
              #{orderId?.toString().slice(-8).toUpperCase()}
            </strong>
          </div>
        )}

        {/* COMMON REASONS HELP BOX */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 mb-6 border border-slate-200/80 dark:border-slate-800 text-left space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FiHelpCircle className="text-amber-500" /> Lý do có thể xảy ra:
          </span>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-4 list-disc">
            <li>Số dư tài khoản/thẻ ngân hàng không đủ để thanh toán.</li>
            <li>Thông tin xác thực OTP quá hạn hoặc nhập sai.</li>
            <li>Cổng thanh toán ngân hàng đang bảo trì tạm thời.</li>
          </ul>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:flex-1 py-3.5 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <FiRotateCw className="text-base" />
            Thử lại thanh toán
          </button>

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="w-full sm:flex-1 py-3.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <FiCreditCard className="text-base" />
            Về giỏ hàng
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <FiHome size={14} /> Quay về Trang chủ
          </button>
        </div>
      </Motion.div>
    </div>
  );
};

export default CheckoutFailed;
