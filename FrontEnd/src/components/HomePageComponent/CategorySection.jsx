import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SkeletonCard from "../SkeletonCard/SkeletonCard";

const CategorySection = React.memo(({ categories = [], loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex flex-col items-center mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Khám Phá Danh Mục</h2>
            <div className="h-1 w-20 bg-primary mt-2 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col items-center mb-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase"
          >
            Danh Mục Nổi Bật
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            className="h-1.5 bg-primary mt-4 rounded-full"
          ></motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-[32px] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/20">
                <img
                  src={
                    cat.image ||
                    cat.imageUrl ||
                    "/images/default-category.jpg"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                {cat.productCount > 0 && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-slate-900 shadow-sm z-10 transition-transform group-hover:scale-110">
                    {cat.productCount} SẢN PHẨM
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                   <h3 className="text-white font-bold text-sm md:text-base tracking-wide uppercase transition-transform duration-300 group-hover:translate-y-[-4px]">
                      {cat.name}
                   </h3>
                   <div className="h-0.5 w-0 bg-primary mx-auto group-hover:w-10 transition-all duration-300 rounded-full mt-1"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default CategorySection;
