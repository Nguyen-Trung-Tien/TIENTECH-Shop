import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiGrid, FiSliders, FiCpu } from "react-icons/fi";
import HeroSection from "../../components/HomePageComponent/HeroSection";
import CategorySection from "../../components/HomePageComponent/CategorySection";
import ProductSection from "../../components/HomePageComponent/ProductSection";
import SmallBanner from "../../components/SmallBanner/SmallBanner";
import TechTrustBanner from "../../components/HomePageComponent/TechTrustBanner";
import FlashSale from "../../components/FlashSale/FlashSale";
import Testimonials from "../../components/Testimonials/Testimonials";
import BlogSection from "../../components/BlogSection/BlogSection";
import BrandSection from "../../components/BrandSection/BrandSection";
import AISmartPicks from "../../components/HomePageComponent/AISmartPicks";
import { getPersonalizedRecommendationsApi, getHomePageDataApi } from "../../api/productApi";

const ChatBot = lazy(() => import("../../components/ChatBot/ChatBot"));

const HomePage = () => {
  const [personalizedRecs, setPersonalizedRecs] = useState([]);
  const [homeData, setHomeData] = useState(null);
  const [homeError, setHomeError] = useState(null);

  const fetchHomeData = useCallback(async () => {
    try {
      setHomeError(null);
      const res = await getHomePageDataApi();
      if (res?.errCode === 0 && res.data) {
        setHomeData(res.data);
      } else {
        setHomeError(res?.errMessage || "Không thể tải dữ liệu trang chủ.");
      }
    } catch (err) {
      console.error("Failed to load aggregated home page data", err);
      setHomeError("Kết nối đến máy chủ bị gián đoạn. Vui lòng thử lại.");
    }
  }, []);

  const fetchRecs = useCallback(async () => {
    try {
      const res = await getPersonalizedRecommendationsApi(6);
      if (res?.errCode === 0) setPersonalizedRecs(res.products || []);
    } catch (err) {
      console.error("Failed to load Personalized Recommendations", err);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
    fetchRecs();
  }, [fetchHomeData, fetchRecs]);

  return (
    <div className="bg-slate-50 dark:bg-dark-bg transition-colors duration-300 min-h-screen">
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>

      {/* Futuristic Hero Section */}
      <HeroSection />

      <main className="min-w-0">
        {homeError && (
          <div className="container-custom pt-4">
            <div
              role="alert"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger dark:text-danger-light"
            >
              <p className="text-sm font-medium min-w-0 flex-1 break-words">
                {homeError}
              </p>
              <button
                type="button"
                onClick={fetchHomeData}
                className="px-4 py-1.5 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors shrink-0 cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Brand Showcase Carousel */}
        <BrandSection brands={homeData?.brands} />

        {/* High-energy Flash Sale Countdown */}
        <FlashSale products={homeData?.flashSale} />

        {/* Interactive Categories */}
        <CategorySection categories={homeData?.categories} />

        {/* AI Smart Recommendations */}
        {personalizedRecs.length > 0 && (
          <AISmartPicks
            products={personalizedRecs}
            title="Dành Riêng Cho Bạn"
          />
        )}

        {/* Promotional Banner */}
        <div className="container-custom py-4">
          <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800/80">
            <SmallBanner />
          </div>
        </div>

        {/* Curated Featured Products */}
        <ProductSection
          products={homeData?.products}
          categories={homeData?.categories}
        />

        {/* Redesigned Catalog & Tools Gateway (Replaces heavy inline AllProducts) */}
        <section className="container-custom py-8">
          <div className="rounded-3xl bg-gradient-to-br from-surface-900 via-primary-dark to-surface-950 text-white p-6 sm:p-10 shadow-xl border border-surface-800/80 overflow-hidden relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent-light bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
                  <FiCpu className="w-3.5 h-3.5" aria-hidden="true" />
                  Hệ sinh thái phần cứng TIEN TECH
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Khám phá toàn bộ danh mục & công cụ chọn cấu hình
                </h2>
                <p className="text-sm text-surface-300 leading-relaxed">
                  Lọc chuyên sâu theo RAM, CPU, tần số quét hoặc so sánh trực tiếp thông số kỹ thuật giữa các thiết bị.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-bold shadow-lg shadow-primary/30 transition-all"
                >
                  <FiGrid className="w-4 h-4" aria-hidden="true" />
                  Xem tất cả sản phẩm
                  <FiArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/compare"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/15 backdrop-blur-sm transition-all"
                >
                  <FiSliders className="w-4 h-4" aria-hidden="true" />
                  So sánh cấu hình
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Trust & Assurance Guarantee Pillars */}
        <TechTrustBanner />

        {/* Social Proof & Tech News */}
        <div className="bg-surface-100/70 dark:bg-dark-surface/40 py-10 border-t border-surface-200 dark:border-dark-border space-y-10">
          <Testimonials />
          <BlogSection />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
