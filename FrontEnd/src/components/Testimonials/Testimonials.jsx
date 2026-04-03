import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import image1 from "../../assets/000000005b6461.png";

const Testimonials = ({ limit = 3 }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const mock = [
      {
        id: 1,
        name: "Nguyễn Văn A",
        role: "Kỹ sư phần mềm",
        text: "Trải nghiệm mua sắm tuyệt vời. Sản phẩm chính hãng, đóng gói cẩn thận và giao hàng thần tốc. Sẽ tiếp tục ủng hộ TienTech Shop.",
        avatar: image1,
        rating: 5,
      },
      {
        id: 2,
        name: "Trần Thị B",
        role: "Nhà thiết kế đồ họa",
        text: "Dịch vụ khách hàng cực kỳ tốt. Nhân viên tư vấn rất kỹ về cấu hình máy tính phù hợp với công việc. Máy chạy rất mượt và ổn định.",
        avatar: image1,
        rating: 5,
      },
      {
        id: 3,
        name: "Lê Văn C",
        role: "Sáng tạo nội dung",
        text: "Cửa hàng có rất nhiều mẫu mã mới và giá cả cạnh tranh. Đặc biệt là chế độ bảo hành minh bạch, khiến mình cực kỳ an tâm khi mua đồ.",
        avatar: image1,
        rating: 5,
      },
    ];
    setItems(mock.slice(0, limit));
  }, [limit]);

  return (
    <section className="py-10 bg-transparent transition-colors duration-300 overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col items-center mb-10 text-center">
          <Motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-3"
          >
            <span className="w-6 h-[2px] bg-blue-600 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Đánh giá thực tế</span>
          </Motion.div>
          <Motion.h3
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase"
          >
            Khách Hàng Nói Gì Về <span className="text-blue-600">TienTech</span>
          </Motion.h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((t, index) => (
            <Motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 shadow-sm hover:border-blue-500/30 transition-all duration-500"
            >
              <div className="absolute top-6 right-8 text-blue-600/5 dark:text-blue-500/10 group-hover:text-blue-600/20 transition-colors">
                <FaQuoteLeft size={48} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-1 text-amber-400 mb-6 text-[10px]">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <p className="text-slate-600 dark:text-slate-400 italic mb-8 leading-relaxed text-sm md:text-base">
                  “{t.text}”
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-blue-600/10 shadow-md group-hover:border-blue-600 transition-all p-0.5">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover rounded-[12px]"
                    />
                  </div>
                  <div>
                    <h6 className="font-black text-slate-900 dark:text-white leading-none uppercase text-xs tracking-tight">
                      {t.name}
                    </h6>
                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mt-1.5 opacity-80">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
