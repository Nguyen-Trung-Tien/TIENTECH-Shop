import React from "react";
import { FiShield, FiTruck, FiRefreshCw, FiHeadphones, FiLock, FiCheckCircle } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

const TRUST_PILLARS = [
  {
    icon: <FiShield className="text-2xl text-cyan-400" />,
    badge: "CAM KẾT 200%",
    title: "100% Chính Hãng Hàng Đầu",
    desc: "Nhập khẩu và phân phối trực tiếp từ Apple, Samsung, Asus, Sony... Bồi hoàn gấp đôi nếu phát hiện hàng nhái.",
    borderHover: "hover:border-cyan-500/50",
    glowColor: "from-cyan-500/10 to-transparent",
  },
  {
    icon: <FiRefreshCw className="text-2xl text-indigo-400" />,
    badge: "TIÊU CHUẨN VIP",
    title: "Bảo Hành VIP 24 Tháng",
    desc: "Chính sách 1 đổi 1 tận nơi trong 30 ngày đầu tiên. Hỗ trợ mượn máy thay thế trong suốt thời gian bảo hành.",
    borderHover: "hover:border-indigo-500/50",
    glowColor: "from-indigo-500/10 to-transparent",
  },
  {
    icon: <FiTruck className="text-2xl text-emerald-400" />,
    badge: "HỎA TỐC 2H",
    title: "Giao Siêu Tốc & An Toàn",
    desc: "Giao nhanh 2 giờ tại nội thành. Đóng gói chuyên dụng chống sốc đa tầng và bảo hiểm đơn hàng 100% giá trị.",
    borderHover: "hover:border-emerald-500/50",
    glowColor: "from-emerald-500/10 to-transparent",
  },
  {
    icon: <FiHeadphones className="text-2xl text-violet-400" />,
    badge: "CHUYÊN GIA 24/7",
    title: "Tư Vấn Kỹ Thuật Chuyên Sâu",
    desc: "Đội ngũ kỹ sư công nghệ hỗ trợ build PC, cấu hình tối ưu đồ họa, AI & gaming hoàn toàn miễn phí trọn đời.",
    borderHover: "hover:border-violet-500/50",
    glowColor: "from-violet-500/10 to-transparent",
  },
];

const TechTrustBanner = () => {
  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-slate-100/60 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      {/* Ambient background blur */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[250px] bg-cyan-500/5 dark:bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-2.5 font-mono">
            <FiLock className="text-xs" />
            <span>TIENTECH TRUST &amp; PROMISE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Đặc Quyền An Tâm Khi Mua Sắm Tại{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500">
              TIENTECH
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">
            Mỗi thiết bị đến tay khách hàng là một cam kết bền vững về chất lượng và dịch vụ hậu mãi
          </p>
        </div>

        {/* 4 Trust Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {TRUST_PILLARS.map((item, idx) => (
            <Motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="min-w-0"
            >
              <div
                className={`relative p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group hover:-translate-y-1 ${item.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-1.5">
                    <FiCheckCircle className="text-emerald-500 shrink-0 text-sm" />
                    <span className="truncate">{item.title}</span>
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechTrustBanner;
