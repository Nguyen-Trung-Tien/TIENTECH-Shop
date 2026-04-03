import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { FiArrowRight, FiCalendar } from "react-icons/fi";

const BlogSection = ({ limit = 3 }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const mock = [
      {
        id: 1,
        title: "Cách chọn thiết bị công nghệ phù hợp với nhu cầu sử dụng",
        img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
        excerpt:
          "Hướng dẫn chi tiết cách chọn laptop, điện thoại phù hợp với từng nhu cầu học tập và làm việc chuyên nghiệp.",
        date: "15 Tháng 3, 2026",
        category: "Hướng dẫn",
      },
      {
        id: 2,
        title: "Mẹo bảo quản đồ điện tử đúng cách trong mùa nồm ẩm",
        img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&auto=format&fit=crop",
        excerpt:
          "Những bí quyết giúp thiết bị công nghệ của bạn luôn bền bỉ và ổn định trong mọi điều kiện thời tiết khắc nghiệt.",
        date: "12 Tháng 3, 2026",
        category: "Mẹo hay",
      },
      {
        id: 3,
        title: "Xu hướng công nghệ 2026: AI và thiết bị thông minh",
        img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop",
        excerpt:
          "Khám phá tương lai của AI, thiết bị đeo thông minh và hệ sinh thái công nghệ mới nhất đang thay đổi thế giới.",
        date: "10 Tháng 3, 2026",
        category: "Xu hướng",
      },
    ];

    setPosts(mock.slice(0, limit));
  }, [limit]);

  return (
    <section className="py-10 bg-transparent transition-colors duration-300">
      <div className="container-custom">
        <div className="flex flex-col items-center mb-10 text-center">
          <Motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-3"
          >
            <span className="w-6 h-[2px] bg-blue-600 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tin tức công nghệ</span>
          </Motion.div>
          <Motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
          >
            Kiến Thức & <span className="text-blue-600">Mẹo Hay</span>
          </Motion.h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((p, index) => (
            <Motion.article
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 overflow-hidden hover:border-blue-500/30 transition-all duration-500 shadow-sm"
            >
              {/* Image Wrap */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase rounded-full shadow-sm">
                    {p.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">
                  <FiCalendar size={12} className="text-blue-600" />
                  {p.date}
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-snug mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 uppercase tracking-tight">
                  {p.title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-8 leading-relaxed font-medium">
                  {p.excerpt}
                </p>
                <div className="mt-auto">
                  <button className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] inline-flex items-center gap-2 group/btn transition-colors hover:text-blue-600">
                    Đọc thêm
                    <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform text-blue-600" />
                  </button>
                </div>
              </div>
            </Motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
