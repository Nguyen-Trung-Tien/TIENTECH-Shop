import React from "react";
import { motion } from "framer-motion";
import {
  FiCreditCard,
  FiShield,
  FiCheck,
  FiLock,
  FiZap,
  FiDollarSign,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const PaymentPage = () => {
  const paymentMethods = [
    {
      name: "Thanh Toán Khi Nhận Hàng (COD)",
      desc: "Nhận hàng, mở hộp kiểm tra đúng mẫu mã và thanh toán tiền mặt trực tiếp cho nhân viên giao hàng.",
      badge: "Phổ biến",
      icon: <FiDollarSign size={28} className="text-emerald-500" />,
    },
    {
      name: "Chuyển Khoản Ngân Hàng QR Code",
      desc: "Quét mã VietQR thanh toán nhanh qua ứng dụng ngân hàng (MB, Vietcombank, Techcombank, TPBank...). Chiết khấu ngay 5%.",
      badge: "Ưu đãi -5%",
      icon: <FiZap size={28} className="text-amber-500" />,
    },
    {
      name: "Ví Điện Tử & Cổng VNPay",
      desc: "Hỗ trợ thanh toán qua VNPay-QR, Ví MoMo, ZaloPay nhanh chóng và an toàn tuyệt đối.",
      badge: "Tiện lợi",
      icon: <FiCreditCard size={28} className="text-blue-500" />,
    },
    {
      name: "Thanh Toán Quốc Tế PayPal / Visa",
      desc: "Chấp nhận các loại thẻ tín dụng quốc tế Visa, Mastercard, JCB và tài khoản PayPal toàn cầu.",
      badge: "Quốc tế",
      icon: <FiLock size={28} className="text-purple-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 py-12">
      {/* Hero Banner */}
      <div className="container-custom mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-8 md:p-14 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest rounded-full inline-block mb-4">
              An Toàn & Bảo Mật Tuyệt Đối
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Hướng Dẫn Thanh Toán Trực Tuyến
            </h1>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              TienTech áp dụng các công nghệ bảo mật thanh toán tiên tiến nhất, mang tới cho khách hàng 
              trải nghiệm mua sắm linh hoạt, nhanh chóng và tin cậy.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom">
        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {paymentMethods.map((m, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                    {m.icon}
                  </div>
                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-black text-xs uppercase tracking-wider rounded-full border border-purple-100 dark:border-purple-900/30">
                    {m.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {m.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Commitment Box */}
        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FiShield size={28} className="text-purple-600 shrink-0" />
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Cam Kết Bảo Mật Thông Tin Giao Dịch
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tiêu chuẩn an toàn thông tin thanh toán chuẩn quốc tế
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <FiCheck className="text-emerald-500" /> Mã Hóa SSL 256-Bit
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Toàn bộ thông tin đường truyền giữa khách hàng và ngân hàng được bảo mật mã hóa mức cao nhất.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <FiCheck className="text-emerald-500" /> Không Lưu Thẻ Ngân Hàng
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                TienTech tuyệt đối không lưu giữ số thẻ hay mã CVC/OTP của quý khách trên hệ thống máy chủ.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <FiCheck className="text-emerald-500" /> Xác Thực OTP 2 Lớp
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Mọi giao dịch trực tuyến đều yêu cầu xác thực OTP gửi về số điện thoại chính chủ của quý khách.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/support"
            className="inline-block px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-md"
          >
            Quay lại Trung tâm hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
