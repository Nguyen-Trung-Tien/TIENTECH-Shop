import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
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
    { id: "product", label: "Sản phẩm & AI Setup", icon: <FiShield /> },
    { id: "order", label: "Đơn hàng & Giao hàng", icon: <FiPackage /> },
    { id: "payment", label: "Thanh toán", icon: <FiCreditCard /> },
    { id: "warranty", label: "Bảo hành & Đổi trả", icon: <FiRefreshCw /> },
  ];

  const faqs = [
    {
      category: "product",
      question: "TienTech cam kết chất lượng thiết bị công nghệ như thế nào?",
      answer:
        "100% thiết bị công nghệ, linh kiện và phụ kiện setup tại TienTech đều là hàng chính hãng nguyên seal, đầy đủ hóa đơn VAT và tem bảo hành điện tử từ nhà phân phối ủy quyền tại Việt Nam.",
    },
    {
      category: "product",
      question: "AI Tech Color & Setup Advisor hoạt động như thế nào?",
      answer:
        "Bạn có thể mở công cụ 'AI Color & Setup' trên website để nhận gợi ý phối màu thiết bị (bàn phím, chuột, laptop, màn hình) hợp cá tính và tối ưu không gian bàn làm việc. Ngoài ra, đội ngũ kỹ thuật viên TienTech luôn sẵn sàng tư vấn 1-1 qua hotline hoặc khung chat.",
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
      question: "Chính sách bảo hành thiết bị công nghệ quy định như thế nào?",
      answer:
        "Mọi thiết bị chính hãng tại TienTech đều được bảo hành phần cứng theo tiêu chuẩn nhà sản xuất (12–36 tháng), hỗ trợ vệ sinh, kiểm tra và tối ưu phần mềm MIỄN PHÍ TRỌN ĐỜI. Lỗi kỹ thuật phát sinh được xử lý tiếp nhận nhanh trong 24–48h.",
    },
    {
      category: "warranty",
      question: "Nếu muốn đổi màu sắc, phiên bản hoặc nâng cấp mẫu khác thì sao?",
      answer:
        "Trong vòng 7 ngày kể từ khi nhận hàng (sản phẩm còn nguyên tem/hộp), bạn được hỗ trợ đổi màu sắc, đổi cấu hình hoặc nâng cấp sang mẫu mới có giá trị bằng hoặc cao hơn hoàn toàn miễn phí.",
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
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 py-12">
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
                      <m.div
                        initial={{ opacity: 0, scaleY: 0.95 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="origin-top"
                      >
                        <div className="px-6 pb-6 pt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                          {faq.answer}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-3xl mx-auto mt-14 p-8 rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-slate-100/80 dark:from-blue-900/80 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-white border border-blue-100 dark:border-slate-800 text-center shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Vẫn chưa tìm thấy câu trả lời?</h3>
          <p className="text-slate-600 dark:text-white/80 text-sm max-w-md mx-auto">
            Hãy liên hệ với đội ngũ hỗ trợ TienTech để nhận tư vấn trực tiếp và nhanh chóng nhất.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/contact"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              Gửi Liên Hệ
            </Link>
            <a
              href="tel:0123456789"
              className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
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
