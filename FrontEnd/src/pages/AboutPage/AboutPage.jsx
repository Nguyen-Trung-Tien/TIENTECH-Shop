import React from "react";
import { FiUsers, FiTarget, FiEye, FiAward, FiTrendingUp, FiShield } from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import imgPro1 from "../../assets/1759303601055.png";
import imgPro2 from "../../assets/1759303601055.png";
import imgPro3 from "../../assets/1759555519030.png";
import logoImage from "../../assets/TienTech Shop.png";
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
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      
      {/* HERO SECTION - REFINED */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1500&q=80"
            className="w-full h-full object-cover opacity-30"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black/40 to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="w-40 h-40 md:w-56 md:h-48 mb-8 p-6 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl">
              <img
                src={logoImage}
                alt="TienTech Logo"
                className="w-full h-auto brightness-0 invert"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1] max-w-4xl tracking-tight">
              Định nghĩa lại <span className="text-blue-500">Tương lai số</span> <br />
              cùng TienTech Shop
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 font-medium">
              Chúng tôi không chỉ cung cấp thiết bị, chúng tôi kiến tạo giải pháp công nghệ tối ưu cho cuộc sống hiện đại.
            </p>
            <div className="flex gap-4">
                <Button
                variant="primary"
                className="px-10 h-14 !rounded-2xl text-sm font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                onClick={() => (window.location.href = "/products")}
                >
                KHÁM PHÁ SẢN PHẨM
                </Button>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* STATS SECTION - TIGHT & IMPACTFUL */}
      <section className="py-10 bg-white dark:bg-black border-b border-slate-100 dark:border-gray-900">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: "Khách hàng tin dùng", val: "50k+", icon: FiUsers },
                    { label: "Sản phẩm chính hãng", val: "100%", icon: FiShield },
                    { label: "Năm kinh nghiệm", val: "5+", icon: FiAward },
                    { label: "Tăng trưởng hàng năm", val: "200%", icon: FiTrendingUp }
                ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center text-center">
                        <s.icon className="text-blue-600 mb-2" size={20} />
                        <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{s.val}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* STORY SECTION - REFINED SPACING */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-gray-950 transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                  alt="TienTech Office"
                  className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
                Câu chuyện của chúng tôi
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight tracking-tight uppercase">
                Nâng tầm giá trị <br /> <span className="text-blue-600">Công nghệ Việt</span>
              </h2>
              <div className="space-y-6 text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium">
                <p>
                  <strong className="text-slate-900 dark:text-white">TienTech</strong> ra đời với tâm thế của những người trẻ khao khát mang những tinh hoa công nghệ thế giới đến gần hơn với người dùng Việt Nam.
                </p>
                <p>
                  Chúng tôi không chỉ tập trung vào việc bán hàng, mà chú trọng vào việc tư vấn và hỗ trợ người dùng tìm ra những thiết bị thực sự phù hợp với nhu cầu và phong cách sống của họ.
                </p>
              </div>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION - MODERN CARDS */}
      <section className="py-16 md:py-20 bg-white dark:bg-black transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group p-8 md:p-12 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-transparent hover:border-blue-500/20 transition-all duration-500"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <FiTarget size={28} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Sứ mệnh</h4>
              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium">
                Cung cấp hệ sinh thái thiết bị công nghệ chính hãng, giúp tối ưu hóa hiệu suất làm việc và nâng cao chất lượng cuộc sống cho mọi khách hàng.
              </p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group p-8 md:p-12 bg-blue-600 rounded-[3rem] text-white shadow-2xl shadow-blue-500/20 hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20 group-hover:scale-110 transition-transform">
                <FiEye size={28} />
              </div>
              <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Tầm nhìn</h4>
              <p className="text-white/80 text-base md:text-lg leading-relaxed font-medium">
                Trở thành biểu tượng của niềm tin và sự đổi mới trong lĩnh vực bán lẻ công nghệ tại Việt Nam, mang tầm vóc quốc tế.
              </p>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION - TIGHTER GRID */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-gray-950 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <FiUsers size={32} className="text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Đội ngũ sáng lập</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-bold uppercase tracking-widest opacity-70">Những nhân tố cốt lõi xây dựng nên TienTech</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {teamMembers.map((member, idx) => (
              <Motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden mb-6 shadow-xl border-4 border-white dark:border-gray-800 transition-all duration-500 group-hover:shadow-2xl group-hover:border-blue-500/20">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">TienTech Founder</p>
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                  {member.name}
                </h4>
                <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] mb-4">
                  {member.role}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium px-4 leading-relaxed line-clamp-2">{member.desc}</p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION - IMPACTFUL & CLEAN */}
      <section className="py-16 md:py-24 bg-white dark:bg-black transition-colors overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 rounded-[3rem] md:rounded-[4rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">Sẵn sàng trải nghiệm cùng TienTech?</h2>
                <p className="text-blue-50 text-base md:text-lg mb-10 font-bold uppercase tracking-widest opacity-80 max-w-xl mx-auto">
                    Kiến tạo phong cách sống công nghệ đỉnh cao ngay hôm nay.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button
                        className="h-14 px-10 bg-white text-blue-600 font-black text-sm rounded-2xl hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                        onClick={() => (window.location.href = "/contact")}
                    >
                        LIÊN HỆ TƯ VẤN
                    </button>
                    <button
                        className="h-14 px-10 bg-blue-700 text-white font-black text-sm rounded-2xl hover:bg-blue-800 transition-all border border-blue-500/30 active:scale-95"
                        onClick={() => (window.location.href = "/products")}
                    >
                        MUA SẮM NGAY
                    </button>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
