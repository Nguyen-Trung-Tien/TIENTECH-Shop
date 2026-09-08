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
    <section className="py-8 md:py-12 bg-ivory dark:bg-dark-bg/60 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="tt-eyebrow mb-2">
              <span className="size-1.5 rounded-full bg-lime-500"></span>
              <span>HARDWARE TAXONOMY</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Danh Mục Ngành Hàng
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            SELECT CATEGORY // DIRECT DEPLOYMENT
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
              <div className="tt-card tt-card-hover relative p-3 bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between h-full">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/60 mb-2.5 flex items-center justify-center p-2.5">
                  <img
                    src={
                      cat.image || cat.imageUrl || "/images/default-category.jpg"
                    }
                    alt={cat.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {cat.productCount > 0 && (
                    <span className="absolute top-2 right-2 font-mono text-[9px] font-bold bg-slate-900/85 dark:bg-slate-800/90 text-white px-1.5 py-0.5 rounded border border-slate-700/40">
                      {cat.productCount}
                    </span>
                  )}
                </div>

                <div className="text-left mt-auto min-w-0">
                  <h3 className="text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm tracking-tight truncate group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block truncate">
                    EXPLORE &rarr;
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
