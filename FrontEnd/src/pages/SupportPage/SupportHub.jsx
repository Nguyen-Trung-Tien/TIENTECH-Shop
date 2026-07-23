import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHelpCircle,
  FiShield,
  FiTruck,
  FiCreditCard,
  FiPhoneCall,
  FiSearch,
  FiArrowRight,
  FiFileText,
  FiMessageCircle,
  FiCheckCircle,
} from "react-icons/fi";

const SupportHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/support/faq?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const supportCategories = [
    {
      title: "Câu Hỏi Thường Gặp (FAQ)",
      desc: "Giải đáp nhanh các thắc mắc phổ biến về đơn hàng, chọn đá phong thủy & tài khoản.",
      icon: <FiHelpCircle className="text-blue-600 dark:text-blue-400" size={32} />,
      link: "/support/faq",
      badge: "Phổ biến nhất",
      color: "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40",
    },
    {
      title: "Chính Sách Bảo Hành",
      desc: "Cam kết chất lượng đá tự nhiên 100%, bảo hành & đánh bóng miễn phí trọn đời.",
      icon: <FiShield className="text-emerald-600 dark:text-emerald-400" size={32} />,
      link: "/support/warranty",
      badge: "Cam kết 100%",
      color: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40",
    },
    {
      title: "Vận Chuyển & Đổi Trả",
      desc: "Miễn phí giao hàng toàn quốc, chính sách 1 đổi 1 trong 7 ngày nếu không vừa ý.",
      icon: <FiTruck className="text-amber-600 dark:text-amber-400" size={32} />,
      link: "/support/shipping-returns",
      badge: "7 Ngày đổi trả",
      color: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40",
    },
    {
      title: "Thanh Toán Trực Tuyến",
      desc: "Hướng dẫn thanh toán qua VNPay, PayPal, Chuyển khoản QR code & COD an toàn.",
      icon: <FiCreditCard className="text-purple-600 dark:text-purple-400" size={32} />,
      link: "/support/payment",
      badge: "Bảo mật SSL",
      color: "bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40",
    },
  ];

  const quickArticles = [
    { title: "Cách đo size tay chuẩn xác để chọn vòng đá phong thủy", link: "/support/faq" },
    { title: "Cách phân biệt đá tự nhiên và đá nhân tạo thật hay giả", link: "/support/warranty" },
    { title: "Quy trình yêu cầu đổi trả hoặc hoàn tiền đơn hàng", link: "/support/shipping-returns" },
    { title: "Hướng dẫn quét mã QR thanh toán nhận chiết khấu 5%", link: "/support/payment" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 py-12">
      {/* Search Header Banner */}
      <div className="container-custom mb-14">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-8 md:p-16 text-center shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest inline-block">
              Trung Tâm Hỗ Trợ Khách Hàng TienTech
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Chúng tôi có thể giúp gì cho bạn hôm nay?
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto">
              Tìm kiếm câu trả lời nhanh chóng hoặc chọn chủ đề hỗ trợ bên dưới
            </p>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto pt-2">
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm (vd: bảo hành, đổi trả, đo size, thanh toán...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-32 bg-white text-slate-900 rounded-2xl text-sm font-medium focus:outline-none shadow-xl placeholder:text-slate-400"
              />
              <FiSearch className="absolute left-4 top-6 text-slate-400 text-xl" />
              <button
                type="submit"
                className="absolute right-2 top-3 h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Tìm Kiếm
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Support Grid */}
      <div className="container-custom mb-16">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 text-center uppercase tracking-wide">
          Danh Mục Hỗ Trợ Chính
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {supportCategories.map((cat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className={`p-8 rounded-3xl border ${cat.color} backdrop-blur-md transition-all shadow-sm flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                    {cat.icon}
                  </div>
                  <span className="px-3 py-1 bg-white/80 dark:bg-slate-900/80 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-800">
                    {cat.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {cat.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                <Link
                  to={cat.link}
                  className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Xem chi tiết <FiArrowRight />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Articles & Direct Contact Banner */}
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Helpful Articles */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FiFileText className="text-blue-600" /> Bài Viết Hướng Dẫn Hữu Ích
            </h3>

            <div className="space-y-3">
              {quickArticles.map((art, i) => (
                <Link
                  key={i}
                  to={art.link}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <span className="flex items-center gap-3">
                    <FiCheckCircle className="text-blue-600 shrink-0" />
                    {art.title}
                  </span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-blue-600" />
                </Link>
              ))}
            </div>
          </div>

          {/* Need Direct Assistance Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full inline-block">
                Tư vấn trực tiếp
              </span>
              <h3 className="text-2xl font-black">Cần hỗ trợ đặc biệt?</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Đội ngũ chuyên gia đá phong thủy TienTech luôn sẵn sàng tư vấn trực tiếp 1-1 cho bạn theo mệnh và tuổi.
              </p>
            </div>

            <div className="space-y-3 pt-6">
              <Link
                to="/contact"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <FiMessageCircle size={18} /> Gửi Yêu Cầu Tư Vấn
              </Link>
              <a
                href="tel:0123456789"
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                <FiPhoneCall size={18} /> Hotline: 0123 456 789
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHub;
