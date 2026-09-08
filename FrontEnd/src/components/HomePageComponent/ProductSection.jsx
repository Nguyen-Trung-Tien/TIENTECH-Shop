import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAllProductApi } from "../../api/productApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";

const ProductSection = ({ products: propProducts }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(propProducts ? propProducts.slice(0, 6) : []);
  const [loading, setLoading] = useState(!propProducts);

  useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      setProducts(propProducts.slice(0, 6));
      setLoading(false);
      return;
    }

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
  }, [propProducts]);

  return (
    <section className="py-8 md:py-12 bg-slate-50/50 dark:bg-dark-bg border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-2xl min-w-0">
            <span className="text-xs font-semibold text-primary dark:text-blue-400 uppercase tracking-wider block mb-1">
              Tuyển chọn hàng đầu
            </span>
            <Motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight"
            >
              Sản phẩm nổi bật
            </Motion.h2>
          </div>
          <Motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => navigate("/products")}
            className="text-xs sm:text-sm font-semibold text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            Xem tất cả sản phẩm
            <span className="text-base">&rarr;</span>
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
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="min-w-0"
              >
                <ProductCard product={product} />
              </Motion.div>
            ))}
          </div>
        ) : (
          <div className="tt-card flex flex-col items-center justify-center py-16 text-center border-dashed">
            <div className="size-12 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg flex items-center justify-center mb-3">
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-wider">
              DATA VACANT // CHƯA CÓ SẢN PHẨM PHÙ HỢP
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
