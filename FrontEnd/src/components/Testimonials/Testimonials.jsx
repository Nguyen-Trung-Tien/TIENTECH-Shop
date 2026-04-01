import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
        text: "Trải nghiệm mua sắm tuyệt vời. Sản phẩm chính hãng, đóng gói cẩn thận và giao hàng thần tốc. Sẽ tiếp tục ủng hộ TienTech Shop trong tương lai.",
        avatar: image1,
        rating: 5,
      },
      {
        id: 2,
        name: "Trần Thị B",
        role: "Nhà thiết kế đồ họa",
        text: "Dịch vụ khách hàng cực kỳ tốt. Nhân viên tư vấn rất kỹ về cấu hình máy tính phù hợp với công việc của mình. Máy chạy rất mượt và ổn định.",
        avatar: image1,
        rating: 5,
      },
      {
        id: 3,
        name: "Lê Văn C",
        role: "Sáng tạo nội dung",
        text: "Cửa hàng có rất nhiều mẫu mã mới và giá cả cạnh tranh. Đặc biệt là chế độ bảo hành rất minh bạch, khiến mình cực kỳ an tâm khi mua đồ tại đây.",
        avatar: image1,
        rating: 5,
      },
    ];
    setItems(mock.slice(0, limit));
  }, [limit]);

  return (
    <section className="py-20 bg-surface-50 overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col items-center mb-16 text-center">
          <motion.h3
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-3xl md:text-4xl font-display font-black text-surface-900 tracking-tight"
          >
            Khách Hàng Nói Gì Về <span className="text-primary">TienTech</span>
          </motion.h3>
          <div className="h-1.5 w-12 bg-primary mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white p-8 rounded-[32px] border border-surface-200/60 shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute top-8 right-8 text-surface-100 group-hover:text-primary/10 transition-colors">
                <FaQuoteLeft size={40} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-1 text-yellow-400 mb-6 text-xs">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <p className="text-surface-600 italic mb-8 leading-relaxed min-h-[80px]">
                  “{t.text}”
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg group-hover:border-primary transition-all p-0.5">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <div>
                    <h6 className="font-bold text-surface-900 leading-none">
                      {t.name}
                    </h6>
                    <p className="text-[11px] font-bold text-primary uppercase tracking-widest mt-1.5">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
