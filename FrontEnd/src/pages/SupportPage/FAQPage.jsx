import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHelpCircle,
  FiChevronDown,
  FiSearch,
  FiPackage,
  FiShield,
  FiCreditCard,
  FiRefreshCw,
  FiPhoneCall,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "Tất cả câu hỏi", icon: <FiHelpCircle /> },
    { id: "product", label: "Sản phẩm & Phong thủy", icon: <FiShield /> },
    { id: "order", label: "Đơn hàng & Giao hàng", icon: <FiPackage /> },
    { id: "payment", label: "Thanh toán", icon: <FiCreditCard /> },
    { id: "warranty", label: "Bảo hành & Đổi trả", icon: <FiRefreshCw /> },
  ];

  const faqs = [
    {
      category: "product",
      question: "TienTech cam kết chất lượng đá phong thủy như thế nào?",
      answer:
        "100% các sản phẩm trang sức và vật phẩm phong thủy tại TienTech đều được chế tác từ đá tự nhiên nguyên khối. Tất cả sản phẩm đều có chứng thư kiểm định chất lượng từ các trung tâm kiểm định uy tín hàng đầu Việt Nam.",
    },
    {
      category: "product",
      question: "Làm thế nào để chọn vật phẩm phong thủy hợp mệnh tuổi?",
      answer:
        "Bạn có thể sử dụng công cụ 'Phong Thủy' trên website để tra cứu theo Năm Sinh và Mệnh (Kim, Mộc, Thủy, Hỏa, Thổ). Ngoài ra, bạn cũng có thể liên hệ trực tiếp với chuyên gia tư vấn TienTech qua hotline hoặc khung chat trực tuyến.",
    },
    {
      category: "order",
      question: "Thời gian giao hàng mất bao lâu?",
      answer:
        "Nội thành TP.HCM và Hà Nội: Giao nhanh từ 1 - 2 ngày làm việc. Các tỉnh thành khác: Giao từ 2 - 4 ngày làm việc thông qua đối tác vận chuyển hỏa tốc.",
    },
    {
      category: "order",
      question: "Tôi có được kiểm tra hàng trước khi thanh toán không?",
      answer:
        "Có! TienTech áp dụng chính sách ĐỒNG KIỂM áp dụng cho tất cả đơn hàng. Bạn có quyền mở hộp kiểm tra đúng mẫu mã, kích thước và giấy kiểm định trước khi thanh toán cho nhân viên giao hàng.",
    },
    {
      category: "payment",
      question: "TienTech hỗ trợ các hình thức thanh toán nào?",
      answer:
        "Chúng tôi hỗ trợ nhiều hình thức linh hoạt: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng qua mã QR (giảm 5%), Cổng thanh toán quét mã VNPay, PayPal và trả góp qua thẻ tín dụng.",
    },
    {
      category: "payment",
      question: "Thanh toán qua website có đảm bảo an toàn không?",
      answer:
        "Hệ thống thanh toán trực tuyến của TienTech đạt chuẩn bảo mật mã hóa SSL 256-bit cao nhất. Chúng tôi tuyệt đối không lưu trữ thông tin thẻ ngân hàng hay tài khoản cá nhân của quý khách.",
    },
    {
      category: "warranty",
      question: "Chính sách bảo hành sản phẩm quy định như thế nào?",
      answer:
        "Mọi sản phẩm bán ra đều được bảo hành dây xâu, vệ sinh, đánh bóng và làm mới MIỄN PHÍ TRỌN ĐỜI. Đối với lỗi đứt dây, đính lại đá phụ, TienTech hỗ trợ xử lý cực nhanh trong 48h.",
    },
    {
      category: "warranty",
      question: "Nếu không vừa size tay hoặc muốn đổi mẫu khác thì sao?",
      answer:
        "Trong vòng 7 ngày kể từ khi nhận hàng, bạn được hỗ trợ đổi size tay hoặc đổi sang mẫu mới có giá trị bằng hoặc cao hơn hoàn toàn miễn phí.",
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 py-12">
      <div className="container-custom mb-12">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
          <span className="px-3.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest rounded-full inline-block">
            Giải Đáp Thắc Mắc
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Câu Hỏi Thường Gặp (FAQ)
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            Tổng hợp giải đáp chi tiết nhất cho các câu hỏi thường gặp của khách hàng
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi (vd: bảo hành, đổi trả, thanh toán...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 shadow-sm"
            />
            <FiSearch className="absolute left-4 top-5 text-slate-400 text-lg" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setOpenIndex(null);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <FiHelpCircle className="size-12 text-slate-400 mx-auto mb-3" />
              <p className="font-bold text-slate-600 dark:text-slate-400 text-sm">
                Không tìm thấy câu hỏi phù hợp với từ khóa của bạn.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-base md:text-lg">
                      {faq.question}
                    </span>
                    <FiChevronDown
                      className={`text-slate-400 text-xl transition-transform duration-300 shrink-0 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 pt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-3xl mx-auto mt-14 p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center shadow-xl space-y-4">
          <h3 className="text-xl font-black">Vẫn chưa tìm thấy câu trả lời?</h3>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            Hãy liên hệ với đội ngũ hỗ trợ TienTech để nhận tư vấn trực tiếp và nhanh chóng nhất.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-blue-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors"
            >
              Gửi Liên Hệ
            </Link>
            <a
              href="tel:0123456789"
              className="px-6 py-3 bg-blue-700/80 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/20 hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              <FiPhoneCall /> Hotline 0123 456 789
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
