import React, { useEffect, useState } from "react";
import { m as Motion } from "framer-motion";
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
    if (timeLeft <= 0) return;

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
  }, [timeLeft]);

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
          const firstProduct = res.products[0];
          const diffSec = Math.max(
            0,
            Math.floor(
              (new Date(firstProduct.flashSaleEnd) - new Date()) / 1000,
            ),
          );
          setTimeLeft(diffSec);
          setIsUpcoming(false);
        } else if (res.nextFlashSaleStart) {
          const diffSec = Math.max(
            0,
            Math.floor((new Date(res.nextFlashSaleStart) - new Date()) / 1000),
          );
          setTimeLeft(diffSec);
          setIsUpcoming(true);
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
    <section className="py-8 md:py-12 bg-gradient-to-b from-red-50/40 via-white to-slate-50/40 dark:from-red-950/10 dark:via-black dark:to-slate-900/20 border-y border-slate-200/60 dark:border-slate-800/80 transition-colors duration-300">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white/80 dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/25 animate-pulse shrink-0">
              <FiZap className="text-2xl fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Flash Sale
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-extrabold text-[10px] uppercase">
                  Giá Sốc
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">
                {products.length > 0
                  ? "Săn deal giảm sốc có giới hạn thời gian"
                  : isUpcoming
                    ? "Flash Sale sắp diễn ra trong ít phút nữa"
                    : "Đang cập nhật Flash Sale mới"}
              </p>
            </div>
          </div>

          {(products.length > 0 || isUpcoming) && (
            <div className="flex items-center gap-3.5 bg-slate-900 dark:bg-slate-800 p-2.5 px-4 rounded-2xl shadow-md border border-slate-800">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider hidden sm:block">
                {products.length > 0
                  ? "Kết thúc sau:"
                  : isUpcoming
                    ? "Bắt đầu sau:"
                    : ""}
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                {[
                  { val: h, label: "GIỜ" },
                  { val: m, label: "PHÚT" },
                  { val: s, label: "GIÂY" },
                ].map((item, idx) => (
                  <React.Fragment key={item.label}>
                    <div className="flex flex-col items-center">
                      <div className="min-w-[36px] h-9 px-2 bg-gradient-to-b from-red-600 to-red-700 rounded-lg flex items-center justify-center text-white font-black text-base shadow-sm">
                        {item.val}
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
                        {item.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <span className="text-lg font-black text-slate-400 self-start mt-1">
                        :
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {loading && !loadingMore ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {products.map((product, index) => (
                <Motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.05 }}
                >
                  <ProductCard product={product} />
                </Motion.div>
              ))}
            </div>

            {currentPage < totalPages && (
              <div className="flex justify-center pt-2">
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
          <div className="space-y-6">
            <div className="py-6 px-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl text-center">
              <FiClock className="mx-auto text-2xl text-blue-600 mb-2" />
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">
                Flash Sale sẽ bắt đầu sớm
              </h3>
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
                {nextFlashSaleStart
                  ? `Bắt đầu lúc ${new Date(nextFlashSaleStart).toLocaleString()}`
                  : "Flash Sale sắp diễn ra."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {upcomingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 bg-slate-50 dark:bg-gray-900/50 rounded-3xl flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-slate-200 dark:border-gray-800">
            <FiZap className="text-3xl text-slate-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Chưa có Flash Sale
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold">
              Hãy quay lại sau để săn những ưu đãi mới nhất.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FlashSale;
