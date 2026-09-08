import React from "react";
import { FiUsers, FiTarget, FiEye, FiAward, FiTrendingUp, FiShield } from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import imgPro1 from "../../assets/about-pro1.webp";
import imgPro2 from "../../assets/about-pro1.webp";
import imgPro3 from "../../assets/about-pro2.webp";
import Logo from "../../components/UI/Logo";
import Button from "../../components/UI/Button";

const teamMembers = [
  {
    name: "Nguyễn Trung Tiến",
    role: "CEO & Founder",
    img: imgPro1,
    desc: "Kiến tạo tầm nhìn và định hướng chiến lược phát triển bền vững cho hệ sinh thái công nghệ.",
  },
  {
    name: "Nguyễn Trung Tiến",
    role: "CTO",
    img: imgPro2,
    desc: "Dẫn dắt đội ngũ kỹ thuật và tối ưu hóa hệ thống công nghệ mang lại trải nghiệm tốt nhất.",
  },
  {
    name: "Nguyễn Trung Tiến",
    role: "Creative Director",
    img: imgPro3,
    desc: "Người đứng sau những thiết kế và trải nghiệm người dùng tinh tế, hiện đại.",
  },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg transition-colors duration-300">
      {/* HERO SECTION - TECHNICAL EDITORIAL */}
      <section className="relative py-16 md:py-24 bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="tt-eyebrow mb-6 bg-slate-900 border-slate-800 text-slate-300">
              <span className="size-1.5 rounded-full bg-lime-400"></span>
              <span>TIENTECH MANIFESTO // ARCHITECTURE &amp; ENGINEERING</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-6 leading-[1.15] tracking-tight uppercase">
              Chuẩn Mực Tuyển Chọn <br />
              <span className="text-primary dark:text-blue-400">Công Nghệ Đỉnh Cao</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mb-8 font-normal leading-relaxed">
              Chúng tôi không định nghĩa bản thân là một cửa hàng bán lẻ đại trà. TienTech là hệ thống kiểm chuẩn, tuyển lựa và triển khai phần cứng công nghệ cao với cam kết tuyệt đối về độ tin cậy và minh bạch kỹ thuật.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="tt-button tt-button-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wider"
                onClick={() => navigate("/products")}
              >
                Khám phá catalog sản phẩm
              </button>
              <button
                type="button"
                className="tt-button tt-button-secondary px-8 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-900 border-slate-800 text-white hover:bg-slate-800"
                onClick={() => navigate("/contact")}
              >
                Liên hệ kỹ sư tư vấn
              </button>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* STATS SECTION - TECHNICAL METRICS LEDGER */}
      <section className="py-8 bg-white dark:bg-dark-surface border-b border-slate-200/80 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Khách hàng tin chọn", val: "50,000+", icon: FiUsers, sub: "TỶ LỆ HÀI LÒNG 99.4%" },
              { label: "Kiểm định chính hãng", val: "100%", icon: FiShield, sub: "CHUẨN NHÀ SẢN XUẤT" },
              { label: "Kinh nghiệm phát triển", val: "05 NĂM", icon: FiAward, sub: "CHUYÊN GIA PHẦN CỨNG" },
              { label: "Chỉ số tăng trưởng", val: "200%+", icon: FiTrendingUp, sub: "DOANH THU HÀNG NĂM" }
            ].map((s, i) => (
              <div key={i} className="flex flex-col p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{s.sub}</span>
                  <s.icon className="text-primary dark:text-blue-400 text-sm" />
                </div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mb-1 leading-none">{s.val}</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-14 md:py-20 bg-ivory dark:bg-dark-bg transition-colors border-b border-slate-200/80 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative min-w-0"
            >
              <div className="tt-card p-2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                  alt="TienTech Engineering Hub"
                  className="w-full h-auto rounded-lg object-cover"
                />
                <div className="p-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                  <span>TIENTECH LAB &bull; VERIFICATION CENTER</span>
                  <span className="text-lime-600 dark:text-lime-400 font-bold">ACTIVE</span>
                </div>
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="min-w-0"
            >
              <div className="tt-eyebrow mb-3">
                <span className="size-1.5 rounded-full bg-lime-500"></span>
                <span>ORIGIN &bull; IDENTITY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-5 leading-tight tracking-tight uppercase">
                Xây dựng chuẩn mực mới <br />
                <span className="text-primary dark:text-blue-400">Cho Hệ Sinh Thái Công Nghệ</span>
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <p>
                  <strong className="text-slate-900 dark:text-white font-bold">TienTech Shop</strong> được kiến tạo bởi các kỹ sư phần mềm và chuyên gia phần cứng có chung niềm đam mê sâu sắc với kiến trúc thiết bị tối tân.
                </p>
                <p>
                  Chúng tôi loại bỏ hoàn toàn mô hình bán hàng mập mờ linh kiện. Mọi cấu hình bán ra đều có mã SKU chuẩn, kiểm chuẩn nhiệt độ và tài liệu bảo hành 1-1 điện tử rõ ràng.
                </p>
              </div>

              {/* Development Milestones */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800 pt-5">
                {[
                  { year: "2022", text: "Khởi động trung tâm kiểm chuẩn phần cứng" },
                  { year: "2024", text: "Phục vụ hơn 50.000 chuyên gia kỹ thuật" },
                  { year: "2026", text: "Hệ thống AI Price Predictor & Spec Matcher" }
                ].map((m, i) => (
                  <div key={i} className="text-left min-w-0">
                    <p className="text-lg sm:text-xl font-mono font-black text-primary dark:text-blue-400">{m.year}</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 leading-snug">{m.text}</p>
                  </div>
                ))}
              </div>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-14 md:py-20 bg-white dark:bg-dark-surface transition-colors border-b border-slate-200/80 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="tt-card p-6 sm:p-8 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800"
            >
              <div className="size-11 bg-primary text-white rounded-lg flex items-center justify-center mb-5 shadow-xs">
                <FiTarget size={22} />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight font-mono">
                01 // SỨ MỆNH KỸ THUẬT
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                Đưa những giải pháp công nghệ đỉnh cao và linh kiện nguyên bản tới tay người dùng Việt Nam với chi phí minh bạch, tư vấn chuẩn xác và trách nhiệm bảo hành cao nhất.
              </p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="tt-card p-6 sm:p-8 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800"
            >
              <div className="size-11 bg-lime-500 text-slate-950 rounded-lg flex items-center justify-center mb-5 shadow-xs font-bold">
                <FiEye size={22} />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight font-mono">
                02 // TẦM NHÌN DÀI HẠN
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                Trở thành hệ thống tham chiếu hàng đầu về cung cấp phần cứng máy tính và thiết bị thông minh, nơi khách hàng tìm thấy sự an tâm tuyệt đối trong từng quyết định đầu tư.
              </p>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-14 md:py-20 bg-ivory dark:bg-dark-bg transition-colors border-b border-slate-200/80 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="tt-eyebrow mb-2">
              <span className="size-1.5 rounded-full bg-lime-500"></span>
              <span>ENGINEERING LEADERSHIP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Đội Ngũ Kiến Trúc Sư
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              NHÂN SỰ NÒNG CỐT ĐỒNG HÀNH CÙNG TIENTECH
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => (
              <Motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="tt-card p-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center min-w-0"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                  />
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {member.name}
                </h4>
                <p className="text-primary dark:text-blue-400 font-mono font-bold uppercase tracking-wider text-[11px] mb-2">
                  {member.role}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {member.desc}
                </p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-14 md:py-20 bg-white dark:bg-dark-surface transition-colors">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="tt-card p-8 sm:p-12 bg-slate-900 text-white text-center border border-slate-800">
            <div className="tt-eyebrow mb-4 bg-slate-800 border-slate-700 text-lime-400">
              <span className="size-1.5 rounded-full bg-lime-400"></span>
              <span>READY FOR DEPLOYMENT</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black mb-4 uppercase tracking-tight">
              Sẵn Sàng Nâng Tầm Trải Nghiệm Công Nghệ?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Trang bị hệ thống máy tính và thiết bị công nghệ chính hãng với chính sách hỗ trợ kỹ thuật 24/7 từ đội ngũ TienTech.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="tt-button tt-button-accent px-8 py-3.5 text-xs font-bold uppercase tracking-wider"
                onClick={() => navigate("/products")}
              >
                Mua sắm ngay
              </button>
              <button
                type="button"
                className="tt-button tt-button-secondary px-8 py-3.5 text-xs font-bold uppercase tracking-wider bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                onClick={() => navigate("/contact")}
              >
                Liên hệ tư vấn
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;