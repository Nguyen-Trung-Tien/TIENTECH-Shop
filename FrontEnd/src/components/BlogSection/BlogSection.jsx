import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BlogSection = ({ limit = 3 }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const mock = [
      {
        id: 1,
        title: "Cách chọn thiết bị công nghệ phù hợp với nhu cầu sử dụng",
        img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
        excerpt: "Hướng dẫn chi tiết cách chọn laptop, điện thoại phù hợp với từng nhu cầu học tập và làm việc.",
        date: "15 Tháng 3, 2026",
        category: "Hướng dẫn"
      },
      {
        id: 2,
        title: "Mẹo bảo quản đồ điện tử đúng cách trong mùa nồm ẩm",
        img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&auto=format&fit=crop",
        excerpt: "Những bí quyết giúp thiết bị công nghệ của bạn luôn bền bỉ và ổn định trong mọi điều kiện thời tiết.",
        date: "12 Tháng 3, 2026",
        category: "Mẹo hay"
      },
      {
        id: 3,
        title: "Xu hướng công nghệ 2026: AI và thiết bị thông minh",
        img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop",
        excerpt: "Khám phá tương lai của AI, thiết bị đeo thông minh và hệ sinh thái công nghệ mới nhất.",
        date: "10 Tháng 3, 2026",
        category: "Xu hướng"
      },
    ];

    setPosts(mock.slice(0, limit));
  }, [limit]);

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="flex flex-col items-center mb-16 text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4"
          >
            Tin tức công nghệ
          </motion.span>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-display font-bold text-surface-900"
          >
            Kiến Thức & Mẹo Hay
          </motion.h3>
          <div className="h-1.5 w-16 bg-primary mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((p, index) => (
            <motion.article 
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col bg-white rounded-3xl border border-surface-200/60 overflow-hidden hover:shadow-soft transition-all duration-500"
            >
              {/* Image Wrap */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={p.img} 
                  alt={p.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                   <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-black uppercase rounded-full shadow-sm">
                      {p.category}
                   </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[11px] font-bold text-surface-400 mb-3">{p.date}</p>
                <h4 className="text-lg font-bold text-surface-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {p.title}
                </h4>
                <p className="text-sm text-surface-500 line-clamp-2 mb-6 leading-relaxed">
                  {p.excerpt}
                </p>
                <div className="mt-auto">
                   <button className="text-xs font-black text-surface-900 uppercase tracking-wider inline-flex items-center gap-2 group/btn transition-colors hover:text-primary">
                      Xem chi tiết 
                      <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                   </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
