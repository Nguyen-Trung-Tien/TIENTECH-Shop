import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAllProductApi } from "../../api/productApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";

const ProductSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getAllProductApi(1, 6);
        if (res?.errCode === 0) {
          const featured = res.products?.filter((p) => p.isActive)?.slice(0, 6);
          setProducts(featured);
        } else {
          toast.error("Không thể tải sản phẩm!");
        }
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        toast.error("Không thể tải sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-6 md:py-8 bg-slate-50 dark:bg-gray-900/20 transition-colors duration-300">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <Motion.div
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-3"
            >
              <span className="w-6 h-[2px] bg-blue-600 shadow-lg shadow-blue-500/20"></span>
              Sản phẩm đề xuất
            </Motion.div>
            <Motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight"
            >
              ✨ Sản phẩm nổi bật ✨
            </Motion.h2>
          </div>
          <Motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => navigate("/products")}
            className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2 group uppercase tracking-widest"
          >
            Xem tất cả
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
            {products.map((product, index) => (
              <Motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </Motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-gray-800">
            <div className="w-14 h-14 bg-slate-50 dark:bg-gray-800 text-slate-300 dark:text-gray-700 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Hiện tại chưa có sản phẩm nổi bật nào!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
