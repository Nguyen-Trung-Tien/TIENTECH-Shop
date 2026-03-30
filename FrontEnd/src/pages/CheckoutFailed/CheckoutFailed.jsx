import React, { useEffect } from "react";
import { FiXCircle, FiHome, FiRotateCw, FiAlertCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../components/UI/Button";

const CheckoutFailed = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    document.title = "Thanh toán thất bại - Tien-Tech";
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-danger/5 rounded-full blur-[100px] -z-0"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px] -z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl bg-white rounded-[40px] shadow-2xl border border-surface-200 p-10 md:p-16 text-center"
      >
        {/* FAILED ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-danger rounded-3xl flex items-center justify-center text-white mx-auto mb-10 shadow-xl shadow-danger/30"
        >
          <FiXCircle size={48} />
        </motion.div>

        {/* TITLE */}
        <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-4">
          Thanh toán thất bại
        </h1>

        {/* DESCRIPTION */}
        <p className="text-surface-500 text-lg mb-10 leading-relaxed max-w-md mx-auto">
          Rất tiếc, giao dịch của bạn không thể hoàn tất lúc này. Vui lòng kiểm
          tra lại thông tin thanh toán hoặc thử lại sau.
        </p>

        {/* ORDER INFO */}
        {orderId && (
          <div className="bg-danger/5 rounded-[2.5rem] p-8 mb-12 border border-danger/10 flex flex-col items-center">
            <span className="text-[11px] font-black text-danger/60 uppercase tracking-[0.3em] mb-2">
              Tham chiếu đơn hàng
            </span>
            <strong className="text-2xl font-black text-danger tracking-tight">
              {orderId?.toString().slice(-6).toUpperCase()}
            </strong>
          </div>
        )}

        {/* HELP BOX */}
        <div className="flex items-center gap-3 justify-center mb-12 text-sm font-medium text-surface-400 bg-surface-50 p-4 rounded-2xl border border-surface-100">
          <FiAlertCircle className="text-amber-500" />
          <span>Bạn có thể thử thanh toán bằng phương thức khác.</span>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[180px] shadow-xl shadow-primary/20"
            icon={FiRotateCw}
            onClick={() => navigate(-1)}
          >
            THỬ LẠI NGAY
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto min-w-[180px]"
            icon={FiHome}
            onClick={() => navigate("/")}
          >
            VỀ TRANG CHỦ
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutFailed;
