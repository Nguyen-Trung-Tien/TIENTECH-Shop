import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import SkeletonCard from "../SkeletonCard/SkeletonCard";

const CategorySection = React.memo(({ categories = [], loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="py-10 bg-white dark:bg-black transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col items-center mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Khám Phá Danh Mục
            </h2>
            <div className="h-1 w-16 bg-blue-600 mt-2 rounded-full shadow-lg shadow-blue-500/20"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 md:py-6 bg-white dark:bg-black overflow-hidden transition-colors duration-300">
      <div className="container-custom">
        <div className="flex flex-col items-center mb-10 text-center">
          <Motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase"
          >
            Danh Mục Nổi Bật
          </Motion.h2>
          <Motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            className="h-1.5 bg-blue-600 mt-3 rounded-full shadow-lg shadow-blue-500/20"
          ></Motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat, index) => (
            <Motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-blue-500/30">
                <img
                  src={
                    cat.image || cat.imageUrl || "/images/default-category.jpg"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                {cat.productCount > 0 && (
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold text-slate-900 dark:text-white shadow-sm z-10 transition-transform group-hover:scale-105 uppercase tracking-tighter">
                    {cat.productCount} SP
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 text-center">
                  <h3 className="text-white font-bold text-xs md:text-sm tracking-wide uppercase transition-transform duration-300 group-hover:translate-y-[-2px]">
                    {cat.name}
                  </h3>
                  <div className="h-0.5 w-0 bg-blue-500 mx-auto group-hover:w-8 transition-all duration-300 rounded-full mt-1.5"></div>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default CategorySection;
