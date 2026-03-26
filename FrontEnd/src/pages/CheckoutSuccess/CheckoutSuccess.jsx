import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiHome,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../components/UI/Button";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);

  const order = location.state?.order;
  const displayOrderCode = order?.orderCode || orderId || "CHECKOUT";

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[70px]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center"
      >
        {/* SUCCESS ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-500/30"
        >
          <FiCheckCircle size={32} />
        </motion.div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán thành công
        </h1>

        {/* DESCRIPTION */}
        <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
          Cảm ơn bạn đã mua sắm tại{" "}
          <span className="text-primary font-bold italic">Tien-Tech</span>. Đơn
          hàng đang được chuẩn bị để giao cho bạn.
        </p>

        {/* ORDER INFO */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl"></div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Mã đơn hàng
            </span>

            <strong className="text-xl font-black text-gray-900 tracking-tight">
              {displayOrderCode.startsWith("#") ? displayOrderCode : `#${displayOrderCode}`}
            </strong>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto min-w-[140px]"
            icon={FiHome}
            onClick={() => navigate("/")}
          >
            Trang chủ
          </Button>

          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto min-w-[140px]"
            icon={FiShoppingBag}
            onClick={() => navigate("/orders")}
          >
            Đơn hàng
          </Button>
        </div>

        {/* AUTO REDIRECT */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
          <span className="text-primary font-semibold">
            Tự động chuyển sau {countdown}s
          </span>
          <FiArrowRight />
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
