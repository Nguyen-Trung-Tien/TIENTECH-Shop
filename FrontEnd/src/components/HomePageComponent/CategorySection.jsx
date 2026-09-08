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
    <section className="py-8 md:py-12 bg-white dark:bg-dark-bg border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-primary dark:text-blue-400 uppercase tracking-wider block mb-1">
              Khám phá danh mục
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Danh mục nổi bật
            </h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Lựa chọn thiết bị phù hợp với nhu cầu của bạn
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
              <div className="relative p-3.5 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between h-full">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50/80 dark:bg-slate-900/60 mb-3 flex items-center justify-center p-3">
                  <img
                    src={
                      cat.image || cat.imageUrl || "/images/default-category.jpg"
                    }
                    alt={cat.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {cat.productCount > 0 && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold bg-slate-900/80 dark:bg-slate-800/90 text-white px-2 py-0.5 rounded-full shadow-xs">
                      {cat.productCount}
                    </span>
                  )}
                </div>

                <div className="text-center mt-auto min-w-0 px-1">
                  <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm tracking-tight truncate group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block truncate mt-0.5 group-hover:text-primary transition-colors">
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
