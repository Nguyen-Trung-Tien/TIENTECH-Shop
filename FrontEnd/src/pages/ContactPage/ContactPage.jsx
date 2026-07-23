import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiMessageSquare,
  FiShield,
  FiHeadphones,
} from "react-icons/fi";
import { toast } from "react-toastify";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "tuvansanpham",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    setIsSubmitting(true);
    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Gửi yêu cầu thành công! Chúng tôi sẽ phản hồi trong 24h.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 py-12">
      {/* Hero Banner */}
      <div className="container-custom mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white p-8 md:p-14 shadow-2xl">
          <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
            <FiHeadphones className="w-96 h-96" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-4"
            >
              Liên Hệ & Hỗ Trợ Khách Hàng
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
            >
              Chúng tôi luôn sẵn sàng lắng nghe bạn!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/90 text-sm md:text-base leading-relaxed"
            >
              Bạn cần tư vấn vật phẩm phong thủy, hỗ trợ bảo hành hay có câu hỏi về đơn hàng? 
              Đội ngũ chuyên gia TienTech luôn phục vụ 24/7.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="container-custom">
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4"
          >
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
              <FiPhone size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                Hotline Trực Tuyến
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Tư vấn miễn phí 24/7</p>
              <a href="tel:0123456789" className="font-black text-blue-600 dark:text-blue-400 text-sm hover:underline">
                0123 456 789
              </a>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4"
          >
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <FiMail size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                Email Phản Hồi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Giải đáp trong 24 giờ</p>
              <a href="mailto:support@tientech.vn" className="font-black text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                support@tientech.vn
              </a>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4"
          >
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FiClock size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                Giờ Làm Việc
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Thứ 2 - Chủ Nhật</p>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                08:00 - 22:00
              </span>
            </div>
          </motion.div>
        </div>

        {/* Main Content Form & Store Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Section */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <FiMessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Gửi lời nhắn cho chúng tôi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vui lòng điền thông tin bên dưới, chuyên gia của chúng tôi sẽ liên hệ lại ngay.
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="size-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <FiCheckCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Cảm ơn bạn đã gửi liên hệ!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Yêu cầu của bạn đã được ghi nhận. Đội ngũ tư vấn TienTech sẽ liên hệ lại với bạn qua số điện thoại hoặc email trong thời gian sớm nhất.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", subject: "tuvansanpham", message: "" });
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-blue-700 transition-colors"
                >
                  Gửi lời nhắn mới
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Địa chỉ Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@gmail.com"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0987 654 321"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Chủ đề cần hỗ trợ
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="tuvansanpham">Tư vấn sản phẩm & Phong thủy</option>
                      <option value="baohanh">Hỗ trợ bảo hành & Kiểm định</option>
                      <option value="donhang">Hỏi về trạng thái đơn hàng</option>
                      <option value="khac">Ý kiến đóng góp / Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Nội dung chi tiết <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Mô tả nội dung bạn cần hỗ trợ..."
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>ĐANG GỬI THÔNG TIN...</span>
                  ) : (
                    <>
                      <FiSend /> GỬI YÊU CẦU NGAY
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Store Location & Information Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FiMapPin className="text-blue-600" /> Hệ thống cửa hàng
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="inline-block px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg mb-2">
                    Showroom Chính (TP.HCM)
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hotline: 0123 456 789 (Nhánh 1)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="inline-block px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg mb-2">
                    Chi nhánh Hà Nội
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    45 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hotline: 0123 456 789 (Nhánh 2)
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center gap-3">
                <FiShield className="text-blue-600 text-2xl shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Cam kết 100% sản phẩm có giấy kiểm định chất lượng đá tự nhiên & chứng nhận bảo hành chính hãng.
                </p>
              </div>
            </div>

            {/* Embedded Google Maps Placeholder / Visual Card */}
            <div className="relative h-48 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-center p-6">
              <div className="space-y-2">
                <FiMapPin size={32} className="text-blue-600 mx-auto animate-bounce" />
                <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Bản đồ vị trí Showroom TienTech
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-1.5 bg-blue-600 text-white font-bold text-[11px] rounded-xl uppercase tracking-wider hover:bg-blue-700 transition-colors"
                >
                  Xem trên Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
