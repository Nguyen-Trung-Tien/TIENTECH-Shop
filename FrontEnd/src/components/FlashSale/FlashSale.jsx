import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { getFlashSaleProductsApi } from "../../api/productApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";
import LoadMoreButton from "../LoadMoreButton/LoadMoreButton";
import { FiZap, FiClock } from "react-icons/fi";

const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [products, setProducts] = useState([]);
  const [upcomingProducts, setUpcomingProducts] = useState([]);
  const [nextFlashSaleStart, setNextFlashSaleStart] = useState(null);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Countdown
  useEffect(() => {
    if (!isUpcoming || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchFlashSale(1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isUpcoming, timeLeft]);

  const formatTimeParts = (t) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return {
      h: String(h).padStart(2, "0"),
      m: String(m).padStart(2, "0"),
      s: String(s).padStart(2, "0"),
    };
  };

  const { h, m, s } = formatTimeParts(timeLeft);

  const fetchFlashSale = async (page = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await getFlashSaleProductsApi(page, 12);
      if (res?.errCode === 0) {
        const hasActive = res.products?.length > 0;
        setProducts((prev) =>
          append ? [...prev, ...res.products] : res.products,
        );
        setUpcomingProducts(res.upcomingProducts || []);
        setNextFlashSaleStart(res.nextFlashSaleStart || null);
        setIsUpcoming(!hasActive && Boolean(res.nextFlashSaleStart));

        if (hasActive) {
          setTimeLeft(0);
        } else if (res.nextFlashSaleStart) {
          const diffSec = Math.max(
            0,
            Math.floor((new Date(res.nextFlashSaleStart) - new Date()) / 1000),
          );
          setTimeLeft(diffSec);
        } else {
          setTimeLeft(0);
          setIsUpcoming(false);
        }

        setCurrentPage(res.currentPage);
        setTotalPages(res.totalPages);
      } else {
        if (!append) {
          setProducts([]);
          setUpcomingProducts([]);
          setNextFlashSaleStart(null);
          setIsUpcoming(false);
          setTimeLeft(0);
        }
      }
    } catch (error) {
      console.error("Lỗi tải Flash Sale:", error);
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
    <section className="py-16 bg-white dark:bg-dark-bg border-y border-slate-100 dark:border-dark-border">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20 animate-pulse">
              <FiZap className="text-xl fill-current" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Flash Sale
              </h2>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                {products.length > 0
                  ? "Săn deal hời mỗi ngày"
                  : isUpcoming
                    ? "Flash Sale sắp diễn ra"
                    : "Chưa có Flash Sale"}
              </p>
            </div>
          </div>

          {(products.length > 0 || isUpcoming) && (
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-dark-surface p-2 pr-4 rounded-2xl border border-slate-100 dark:border-dark-border">
              <div className="flex gap-1.5">
                {[h, m, s].map((unit, idx) => (
                  <React.Fragment key={idx}>
                    <div className="w-10 h-10 bg-slate-900 dark:bg-brand rounded-lg flex items-center justify-center text-white font-black text-lg">
                      {unit}
                    </div>
                    {idx < 2 && (
                      <span className="text-xl font-black text-slate-300 dark:text-slate-700 self-center">
                        :
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
                {products.length > 0
                  ? "Kết thúc sau"
                  : isUpcoming
                    ? "Bắt đầu sau"
                    : ""}
              </span>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {loading && !loadingMore ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {currentPage < totalPages && (
              <div className="flex justify-center">
                <LoadMoreButton
                  page={currentPage}
                  totalPages={totalPages}
                  loadingMore={loadingMore}
                  onLoadMore={handleLoadMore}
                />
              </div>
            )}
          </div>
        ) : upcomingProducts.length > 0 ? (
          <div className="space-y-5">
            <div className="py-8 px-6 bg-yellow-50 border border-yellow-100 rounded-2xl text-center">
              <FiClock className="mx-auto text-2xl text-yellow-600 mb-2" />
              <h3 className="text-lg font-bold text-yellow-800">
                Flash Sale sẽ bắt đầu sớm
              </h3>
              <p className="text-sm text-yellow-600">
                {nextFlashSaleStart
                  ? `Bắt đầu lúc ${new Date(nextFlashSaleStart).toLocaleString()}`
                  : "Flash Sale sắp diễn ra."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {upcomingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-16 bg-slate-50 dark:bg-dark-surface rounded-2xl flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-slate-200 dark:border-dark-border">
            <FiZap className="text-3xl text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Chưa có Flash Sale
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Hãy quay lại sau để săn những ưu đãi mới nhất.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FlashSale;
