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
  }, [propCategories]);

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
    <section className="py-10 md:py-16 bg-white dark:bg-dark-bg border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 relative overflow-hidden">
      {/* Subtle ambient accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-cyan-500/5 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-2 font-mono">
              <FiGrid className="text-xs" />
              <span>Hệ sinh thái thiết bị</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Danh Mục Công Nghệ{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                Tiên Phong
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md">
            Khám phá trọn vẹn những dòng sản phẩm công nghệ cao cấp dẫn đầu xu hướng 2025
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4.5">
          {categories.map((cat, index) => (
            <Motion.div
              key={cat.id || index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group cursor-pointer min-w-0"
            >
              <div className="relative p-4 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-[0_10px_25px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_10px_25px_rgba(6,182,212,0.25)] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between h-full group-hover:-translate-y-1">
                {/* Image showcase */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-dark-card mb-3 flex items-center justify-center p-3 border border-slate-100 dark:border-slate-800/60">
                  <img
                    src={
                      cat.image || cat.imageUrl || "/images/default-category.jpg"
                    }
                    alt={cat.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {cat.productCount > 0 && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold font-mono bg-slate-900/85 dark:bg-slate-800/90 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full shadow-xs">
                      {cat.productCount}
                    </span>
                  )}
                </div>

                <div className="text-center mt-auto min-w-0 px-1">
                  <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm tracking-tight truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block truncate mt-1 group-hover:text-cyan-500 transition-colors">
                    Xem sản phẩm &rarr;
                  </span>
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
