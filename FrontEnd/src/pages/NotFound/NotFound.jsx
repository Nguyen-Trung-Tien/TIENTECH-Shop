import React from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiHome } from "react-icons/fi";
import { motion } from "framer-motion";
import Button from "../../components/UI/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-0"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl bg-white rounded-[48px] shadow-2xl border border-surface-200 p-12 md:p-20 text-center overflow-hidden"
      >
        {/* Animated 404 Text */}
        <div className="relative mb-8">
           <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[120px] md:text-[180px] font-black text-primary/10 leading-none select-none"
           >
            404
           </motion.h1>
           <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-12"
              >
                <FiAlertCircle size={48} />
              </motion.div>
           </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-4">
          Ồ! Trang không tìm thấy
        </h2>
        
        <p className="text-surface-500 text-lg mb-12 max-w-md mx-auto leading-relaxed font-medium">
          Có vẻ như đường dẫn bạn đang tìm kiếm đã bị di chuyển hoặc không còn tồn tại trên hệ thống của chúng tôi.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[200px] shadow-xl shadow-primary/20"
            icon={FiHome}
            onClick={() => window.location.href = "/"}
          >
            VỀ TRANG CHỦ
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
            icon={FiArrowLeft}
            onClick={() => window.history.back()}
          >
            QUAY LẠI
          </Button>
        </div>

        {/* Floating elements for fun */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 6, delay: 1 }}
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"
        />
      </motion.div>
    </div>
  );
};

export default NotFound;
