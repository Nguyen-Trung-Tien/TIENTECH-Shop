import React from "react";
import { motion } from "framer-motion";
import {
  FiShield,
  FiCheckCircle,
  FiAward,
  FiTool,
  FiRotateCcw,
  FiHelpCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const WarrantyPage = () => {
  const policies = [
    {
      icon: <FiAward className="text-amber-500" size={28} />,
      title: "Cam Kết Đá Tự Nhiên 100%",
      desc: "Tất cả sản phẩm đều đi kèm chứng thư kiểm định chất lượng đá tự nhiên từ các trung tâm kiểm định độc lập uy tín.",
    },
    {
      icon: <FiTool className="text-blue-500" size={28} />,
      title: "Bảo Dưỡng & Vệ Sinh Trọn Đời",
      desc: "Miễn phí xâu lại dây, đánh bóng hạt đá, vệ sinh làm mới sản phẩm không giới hạn số lần cho mọi khách hàng.",
    },
    {
      icon: <FiRotateCcw className="text-emerald-500" size={28} />,
      title: "Bảo Hành 1 Đổi 1 Trong 7 Ngày",
      desc: "Đổi mới lập tức sản phẩm nếu có lỗi do nhà sản xuất hoặc nứt vỡ trong quá trình vận chuyển.",
    },
    {
      icon: <FiShield className="text-purple-500" size={28} />,
      title: "Thẻ Bảo Hành Điện Tử",
      desc: "Tất cả đơn hàng đều được lưu trữ thông tin bảo hành điện tử theo Số điện thoại / Mã đơn hàng cực kỳ tiện lợi.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Cung Cấp Thông Tin",
      desc: "Khách hàng đọc Số Điện Thoại mua hàng hoặc Mã đơn hàng cho nhân viên chăm sóc.",
    },
    {
      step: "02",
      title: "Gửi Sản Phẩm Hỗ Trợ",
      desc: "Mang trực tiếp tới Showroom hoặc gửi bưu điện theo hướng dẫn của tổng đài.",
    },
    {
      step: "03",
      title: "Xử Lý & Kiểm Định",
      desc: "Kỹ thuật viên tiến hành vệ sinh, xâu lại dây, thay hạt (nếu cần) trong 24-48h.",
    },
    {
      step: "04",
      title: "Bàn Giao Cho Khách",
      desc: "Gửi lại sản phẩm hoàn thiện tận tay quý khách hoàn toàn sạch sẽ và mới nguyên.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 py-12">
      {/* Header Banner */}
      <div className="container-custom mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-8 md:p-14 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest rounded-full inline-block mb-4">
              Cam Kết Chất Lượng Tuyệt Đối
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Chính Sách Bảo Hành & Kiểm Định
            </h1>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              TienTech tự hào mang đến trải nghiệm an tâm tuyệt đối cho quý khách hàng 
              với chính sách bảo hành, bảo dưỡng đá phong thủy uy tín hàng đầu Việt Nam.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom">
        {/* Core Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {policies.map((p, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl w-fit">
                  {p.icon}
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Terms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FiShield className="text-emerald-600" /> Điều Khoản Bảo Hành Chi Tiết
            </h2>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-600" /> Phạm Vi Bảo Hành Miễn Phí Trọn Đời
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  <li>Thay dây xâu co giãn cho vòng tay đá.</li>
                  <li>Đánh bóng, siêu âm vệ sinh làm sáng đá tự nhiên.</li>
                  <li>Gắn lại đá phụ hạt nhỏ bị rơi rớt (miễn phí hạt phụ tiêu chuẩn).</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  Trường Hợp Hỗ Trợ Có Tính Phí (Ưu Đãi Khách Hàng)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <li>Sản phẩm bị nứt vỡ do va đập mạnh từ phía người sử dụng.</li>
                  <li>Khách hàng muốn làm lại dây chuyền bạc/vàng mới hoặc bổ sung hạt đá chủ.</li>
                  <li>Cần làm lại giấy kiểm định mới theo yêu cầu riêng của khách.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warranty Process Timeline */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FiTool className="text-blue-600" /> Quy Trình Bảo Hành
            </h2>

            <div className="space-y-4">
              {steps.map((st, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="size-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                    {st.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {st.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {st.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Contact */}
        <div className="text-center p-8 rounded-3xl bg-slate-900 text-white space-y-4">
          <FiHelpCircle size={32} className="text-emerald-400 mx-auto" />
          <h3 className="text-xl font-black">Cần hỗ trợ bảo hành sản phẩm ngay?</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Liên hệ với bộ phận CSKH để được hướng dẫn gửi sản phẩm bảo hành nhanh nhất.
          </p>
          <Link
            to="/contact"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
          >
            Yêu Cầu Bảo Hành
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WarrantyPage;
