import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiHome, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../components/UI/Button";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [countdown, setCountdown] = useState(5);

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
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -z-0"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl bg-white rounded-[40px] shadow-2xl border border-surface-200 p-10 md:p-16 text-center"
      >
        {/* SUCCESS ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-10 shadow-xl shadow-emerald-500/30"
        >
          <FiCheckCircle size={48} />
        </motion.div>

        {/* TITLE */}
        <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-4">
          Thanh toán thành công!
        </h1>

        {/* DESCRIPTION */}
        <p className="text-surface-500 text-lg mb-10 leading-relaxed max-w-md mx-auto">
          Cảm ơn bạn đã tin tưởng mua sắm tại <span className="text-primary font-black italic">Tien-Tech</span>. Đơn hàng của bạn đang được chuẩn bị để giao đến bạn sớm nhất.
        </p>

        {/* ORDER INFO */}
        <div className="bg-surface-50 rounded-[2.5rem] p-8 mb-12 border border-surface-100 relative group overflow-hidden">
           <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
           <div className="flex flex-col items-center">
              <span className="text-[11px] font-black text-surface-400 uppercase tracking-[0.3em] mb-2">Mã đơn hàng của bạn</span>
              <strong className="text-3xl font-black text-surface-900 tracking-tight">
                #DH{orderId?.toString().slice(-6).toUpperCase() || "CHECKOUT"}
              </strong>
           </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[180px] shadow-xl shadow-primary/20"
            icon={FiHome}
            onClick={() => navigate("/")}
          >
            VỀ TRANG CHỦ
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto min-w-[180px]"
            icon={FiShoppingBag}
            onClick={() => navigate("/orders")}
          >
            XEM ĐƠN HÀNG
          </Button>
        </div>

        {/* AUTO REDIRECT */}
        <div className="flex items-center justify-center gap-2 text-surface-400 font-medium text-sm">
           <div className="flex items-center gap-1 text-primary font-bold">
              <span>Tự động chuyển tiếp sau {countdown}s</span>
              <FiArrowRight />
           </div>
        </div>
      </motion.div>
      
      {/* Confetti-like decoration (Visual only) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            y: [0, -100 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 400],
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          className={`absolute w-3 h-3 rounded-full -z-0 ${
            ['bg-primary', 'bg-emerald-400', 'bg-amber-400', 'bg-blue-400'][i % 4]
          }`}
          style={{ 
            left: `${10 + Math.random() * 80}%`, 
            bottom: '0' 
          }}
        />
      ))}
    </div>
  );
};

export default CheckoutSuccess;
