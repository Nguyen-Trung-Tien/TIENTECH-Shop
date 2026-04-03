import React from "react";
import { FiUsers, FiTarget, FiEye } from "react-icons/fi";
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
    desc: "Kiến tạo tầm nhìn và định hướng chiến lược phát triển.",
  },
  {
    name: "Nguyễn Trung Tiến",
    role: "CTO",
    img: imgPro2,
    desc: "Dẫn dắt đội ngũ kỹ thuật và tối ưu hóa hệ thống công nghệ.",
  },
  {
    name: "Nguyễn Trung Tiến",
    role: "Creative Director",
    img: imgPro3,
    desc: "Người đứng sau những trải nghiệm người dùng tinh tế.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1500&q=80"
            className="w-full h-full object-cover opacity-40"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900"></div>
        </div>

        <div className="container-custom relative z-10 text-center">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="w-48 h-48 md:w-64 md:h-64 mb-8 p-4 bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 flex items-center justify-center shadow-2xl">
              <img
                src={logoImage}
                alt="TienTech Logo"
                className="w-full h-auto"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-6 leading-tight max-w-4xl">
              Giải pháp công nghệ thông minh – Đồng hành cùng{" "}
              <span className="text-primary">thành công</span> của bạn.
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-10 font-medium">
              Chúng tôi không chỉ bán sản phẩm, chúng tôi cung cấp giải pháp tối
              ưu cho tương lai số của bạn.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="px-12 h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30"
              onClick={() => (window.location.href = "/product-list")}
            >
              KHÁM PHÁ NGAY
            </Button>
          </Motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                  alt="About us"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-0"></div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6">
                Câu chuyện của chúng tôi
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-8 leading-tight">
                TienTech: Nâng tầm <br /> giá trị công nghệ Việt
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-medium">
                <p>
                  <strong className="text-slate-900">TienTech</strong> được
                  thành lập với sứ mệnh cung cấp các giải pháp công nghệ thông
                  minh, giúp người dùng tiếp cận với những sản phẩm chính hãng
                  hàng đầu thế giới một cách dễ dàng nhất.
                </p>
                <p>
                  Chúng tôi tin rằng công nghệ là chìa khóa để thay đổi cuộc
                  sống. Đội ngũ chuyên gia của chúng tôi luôn không ngừng tìm
                  kiếm và tuyển chọn những thiết bị tối ưu nhất, mang lại giá
                  trị thực sự cho từng khách hàng.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-3xl font-black text-primary mb-1">100%</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Chính hãng
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary mb-1">50k+</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Khách hàng
                  </p>
                </div>
              </div>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group p-10 bg-white rounded-[3rem] border border-slate-100 shadow-soft hover:shadow-xl hover:border-primary/20 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <FiTarget size={32} />
              </div>
              <h4 className="text-2xl font-display font-bold text-slate-900 mb-4 text-primary">
                Sứ mệnh
              </h4>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Cung cấp giải pháp công nghệ tối ưu, giúp cá nhân và doanh
                nghiệp tăng hiệu suất, tiết kiệm chi phí và bứt phá trong kỷ
                nguyên số không ngừng biến động.
              </p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group p-10 bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-900/20 hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <FiEye size={32} />
              </div>
              <h4 className="text-2xl font-display font-bold text-white mb-4">
                Tầm nhìn
              </h4>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Trở thành hệ sinh thái công nghệ đáng tin cậy hàng đầu Việt Nam,
                mang lại trải nghiệm mua sắm hiện đại và giá trị bền vững cho
                cộng đồng công nghệ.
              </p>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <FiUsers size={40} className="text-primary mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">
              Đội ngũ của chúng tôi
            </h2>
            <p className="text-slate-500 text-lg font-medium">
              Những con người nhiệt huyết, tận tâm và luôn khao khát mang lại
              những giá trị tốt nhất cho khách hàng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {teamMembers.map((member, idx) => (
              <Motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden mb-8 shadow-xl border-4 border-white transition-all duration-500 group-hover:shadow-2xl group-hover:border-primary/20">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-8">
                    <div className="flex gap-4">
                      {/* Social icons could go here */}
                    </div>
                  </div>
                </div>
                <h4 className="text-2xl font-display font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                  {member.name}
                </h4>
                <p className="text-primary font-black uppercase tracking-widest text-[11px] mb-4">
                  {member.role}
                </p>
                <p className="text-slate-500 font-medium px-4">{member.desc}</p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary z-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            alt="CTA Background"
          />
        </div>

        <div className="container-custom relative z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-[4rem] p-12 md:p-20 text-center border border-white/20 shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-8">
              Hãy đồng hành cùng chúng tôi ngay hôm nay!
            </h2>
            <p className="text-white/80 text-xl md:text-2xl mb-12 font-medium max-w-2xl mx-auto">
              Đội ngũ{" "}
              <span className="text-white font-black italic underline decoration-primary decoration-4">
                TienTech
              </span>{" "}
              luôn sẵn sàng hỗ trợ bạn kiến tạo tương lai.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-primary hover:bg-slate-50 hover:text-primary-hover px-12 h-16 rounded-2xl shadow-2xl transition-all font-black text-lg"
                onClick={() => (window.location.href = "/contact")}
              >
                LIÊN HỆ TƯ VẤN
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="bg-slate-900/50 border-white/20 text-white hover:bg-slate-900/80 px-12 h-16 rounded-2xl backdrop-blur-sm transition-all font-black text-lg"
                onClick={() => (window.location.href = "/product-list")}
              >
                XEM SẢN PHẨM
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
