import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { getDiscountedProductsApi } from "../../api/productApi";
import { getImage } from "../../utils/decodeImage";
import ProductCard from "../../components/ProductCard/ProductCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";
import LoadMoreButton from "../LoadMoreButton/LoadMoreButton";
import { FiZap, FiClock } from "react-icons/fi";

const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState(3600);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Countdown
  useEffect(() => {
    const timer = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 3600)),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  const formatTimeParts = (t) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return {
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0")
    };
  };

  const { h, m, s } = formatTimeParts(timeLeft);

  const fetchFlashSale = async (page = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await getDiscountedProductsApi(page, 12);
      if (res?.errCode === 0) {
        setProducts((prev) => (append ? [...prev, ...res.products] : res.products));
        setCurrentPage(res.currentPage);
        setTotalPages(res.totalPages);
      } else {
        if (!append) setProducts([]);
      }
    } catch (error) {
      console.error("Lỗi tải Flash Sale:", error);
      toast.error("Không thể tải sản phẩm!");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFlashSale(1);
  }, []);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchFlashSale(currentPage + 1, true);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20 animate-pulse">
               <FiZap className="text-2xl fill-current" />
            </div>
            <div>
               <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Flash Sale</h2>
               <p className="text-slate-400 text-sm font-medium">Ưu đãi cực hời, săn ngay kẻo lỡ!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FiClock /> Kết thúc sau
             </span>
             <div className="flex gap-2">
                {[h, m, s].map((unit, idx) => (
                    <React.Fragment key={idx}>
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl">
                            {unit}
                        </div>
                        {idx < 2 && <span className="text-2xl font-black text-slate-300 self-center">:</span>}
                    </React.Fragment>
                ))}
             </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading && !loadingMore ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index % 6 * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {currentPage < totalPages && (
              <div className="flex justify-center pt-8">
                <LoadMoreButton
                  currentPage={currentPage}
                  totalPages={totalPages}
                  loading={loadingMore}
                  onLoadMore={handleLoadMore}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 bg-slate-50 rounded-[40px] flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <FiZap className="text-3xl text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có chương trình Flash Sale</h3>
            <p className="text-slate-500 max-w-sm">Hãy quay lại sau để săn những deal công nghệ cực hời từ Tien-Tech Shop nhé!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FlashSale;
