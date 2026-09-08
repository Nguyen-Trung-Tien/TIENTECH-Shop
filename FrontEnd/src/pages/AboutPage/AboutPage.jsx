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
      {/* HERO SECTION */}
      <section className="relative py-16 md:py-24 bg-slate-950 text-white overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-blue-400 text-xs font-semibold mb-6">
              <span className="size-2 rounded-full bg-blue-500"></span>
              <span>Về chúng tôi &bull; TienTech Shop</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
              Đam mê công nghệ, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500">
                tận tâm vì khách hàng
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mb-8 font-normal leading-relaxed">
              TienTech ra đời với sứ mệnh mang đến cho cộng đồng công nghệ Việt Nam những thiết bị, linh kiện chính hãng chất lượng cao cùng trải nghiệm mua sắm an tâm và dịch vụ bảo hành chu đáo.
            </p>

            <div className="flex flex-wrap justify-center gap-3.5">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-8 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 bg-primary hover:bg-primary-hover text-white shadow-lg shadow-blue-500/25 active:scale-98 cursor-pointer"
                onClick={() => navigate("/products")}
              >
                Khám phá sản phẩm
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 bg-slate-900 border border-slate-800 text-white hover:bg-slate-850 cursor-pointer active:scale-98"
                onClick={() => navigate("/contact")}
              >
                Liên hệ hỗ trợ
              </button>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-10 bg-white dark:bg-dark-surface border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Khách hàng tin chọn", val: "50,000+", icon: FiUsers, sub: "Độ hài lòng 99.4%" },
              { label: "Sản phẩm chính hãng", val: "100%", icon: FiShield, sub: "Cam kết nguồn gốc" },
              { label: "Năm kinh nghiệm", val: "05+", icon: FiAward, sub: "Đội ngũ chuyên nghiệp" },
              { label: "Tăng trưởng mỗi năm", val: "200%+", icon: FiTrendingUp, sub: "Phát triển bền vững" }
            ].map((s, i) => (
              <div key={i} className="flex flex-col p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-medium">{s.sub}</span>
                  <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-blue-400 flex items-center justify-center">
                    <s.icon size={15} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 leading-none">{s.val}</p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-14 md:py-20 bg-slate-50/50 dark:bg-dark-bg transition-colors border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative min-w-0"
            >
              <div className="rounded-3xl p-3 bg-white dark:bg-dark-surface border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                  alt="TienTech Team"
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="min-w-0"
            >
              <span className="text-xs font-semibold text-primary dark:text-blue-400 uppercase tracking-wider block mb-2">
                Hành trình &amp; Giá trị cốt lõi
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight tracking-tight">
                Kiến tạo trải nghiệm <br />
                <span className="text-primary dark:text-blue-400">công nghệ tin cậy</span>
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <p>
                  <strong className="text-slate-900 dark:text-white font-bold">TienTech Shop</strong> được xây dựng từ tình yêu công nghệ và khát vọng mang đến dịch vụ trung thực, chất lượng cao nhất cho khách hàng.
                </p>
                <p>
                  Mỗi thiết bị khi tới tay người dùng đều được chọn lọc kỹ càng, kiểm tra hoạt động nghiêm ngặt và hỗ trợ hậu mãi chu đáo từ đội ngũ kỹ thuật viên giàu kinh nghiệm.
                </p>
              </div>

              {/* Development Milestones */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-200/80 dark:border-slate-800 pt-5">
                {[
                  { year: "2022", text: "Thành lập và định hình chuẩn sản phẩm" },
                  { year: "2024", text: "Đạt mốc 50.000 khách hàng tin dùng" },
                  { year: "2026", text: "Nâng cấp hệ thống số hóa & AI Price" }
                ].map((m, i) => (
                  <div key={i} className="text-left min-w-0">
                    <p className="text-xl sm:text-2xl font-black text-primary dark:text-blue-400">{m.year}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-snug">{m.text}</p>
                  </div>
                ))}
              </div>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-14 md:py-20 bg-white dark:bg-dark-surface transition-colors border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 sm:p-8 rounded-3xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
            >
              <div className="size-11 bg-primary text-white rounded-2xl flex items-center justify-center mb-5 shadow-sm shadow-blue-500/25">
                <FiTarget size={22} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Sứ mệnh của chúng tôi
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
              className="p-6 sm:p-8 rounded-3xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
            >
              <div className="size-11 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-5 shadow-sm shadow-emerald-500/25 font-bold">
                <FiEye size={22} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Tầm nhìn tương lai
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                Trở thành hệ thống bán lẻ công nghệ tin cậy hàng đầu, nơi người dùng có thể tìm thấy sự an tâm tuyệt đối và giải pháp phù hợp nhất cho mọi nhu cầu làm việc và sáng tạo.
              </p>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-14 md:py-20 bg-slate-50/50 dark:bg-dark-bg transition-colors border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-primary dark:text-blue-400 uppercase tracking-wider block mb-1">
              Đội ngũ TienTech
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Nhân sự tâm huyết
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Những con người luôn nỗ lực vì sự hài lòng của bạn
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
                className="p-5 bg-white dark:bg-dark-surface rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center min-w-0"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {member.name}
                </h4>
                <p className="text-primary dark:text-blue-400 font-semibold text-xs mb-2">
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
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white text-center shadow-xl shadow-blue-500/20">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              Sẵn sàng nâng tầm trải nghiệm công nghệ?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Trang bị các thiết bị công nghệ chính hãng với chính sách đổi mới 1-1 và hỗ trợ kỹ thuật tận tâm từ TienTech.
            </p>
            <div className="flex flex-wrap justify-center gap-3.5">
              <button
                type="button"
                className="px-8 py-3.5 bg-white text-primary font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:bg-blue-50 transition-all active:scale-98 cursor-pointer"
                onClick={() => navigate("/products")}
              >
                Mua sắm ngay
              </button>
              <button
                type="button"
                className="px-8 py-3.5 bg-blue-700/60 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl border border-blue-400/40 transition-all active:scale-98 cursor-pointer"
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