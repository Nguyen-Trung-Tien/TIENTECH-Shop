import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import SkeletonCard from "../SkeletonCard/SkeletonCard";
import { getAllCategoryApi } from "../../api/categoryApi";
import { FiGrid } from "react-icons/fi";

const CategorySection = React.memo(({ categories: propCategories = [], loading: propLoading }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(propCategories);
  const [loading, setLoading] = useState(propLoading ?? false);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await getAllCategoryApi();
        if (isMounted && res?.errCode === 0) {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [propCategories?.length]);

  if (loading) {
    return (
      <section className="py-8 bg-slate-50/50 dark:bg-black/50 transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col items-center mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Danh Mục Nổi Bật
            </h2>
            <div className="h-1.5 w-16 bg-blue-600 mt-2 rounded-full shadow-lg shadow-blue-500/20"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-slate-50/40 dark:bg-black/40 border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="container-custom">
        <div className="flex flex-col items-center mb-8 md:mb-10 text-center">
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          >
            <FiGrid className="text-sm" />
            Khám phá theo nhu cầu
          </Motion.div>
          <Motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase"
          >
            Danh Mục Nổi Bật
          </Motion.h2>
          <Motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            style={{ originX: 0 }}
            viewport={{ once: true }}
            className="h-1.5 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 mt-3 rounded-full shadow-lg shadow-blue-500/20"
          ></Motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <Motion.div
              key={cat.id || index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-[22px] overflow-hidden bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 group-hover:-translate-y-1.5 p-3 flex flex-col justify-between">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/60 mb-2 flex items-center justify-center p-2">
                  <img
                    src={
                      cat.image || cat.imageUrl || "/images/default-category.jpg"
                    }
                    alt={cat.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {cat.productCount > 0 && (
                    <span className="absolute top-2 right-2 bg-slate-900/80 dark:bg-blue-600/90 text-white backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider">
                      {cat.productCount} SP
                    </span>
                  )}
                </div>

                <div className="text-center mt-auto">
                  <h3 className="text-slate-800 dark:text-slate-100 font-bold text-xs md:text-sm tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
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
