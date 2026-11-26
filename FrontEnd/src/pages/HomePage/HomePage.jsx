import { Link } from "react-router-dom";
import { FiArrowRight, FiGrid, FiSliders, FiCpu } from "react-icons/fi";
import { ErrorBanner } from "../../components/UI";
import HeroSection from "../../components/HomePageComponent/HeroSection";
import CategorySection from "../../components/HomePageComponent/CategorySection";
import ProductSection from "../../components/HomePageComponent/ProductSection";
import SmallBanner from "../../components/SmallBanner/SmallBanner";
import TechTrustBanner from "../../components/HomePageComponent/TechTrustBanner";
import FlashSale from "../../components/FlashSale/FlashSale";
import BrandSection from "../../components/BrandSection/BrandSection";
import AISmartPicks from "../../components/HomePageComponent/AISmartPicks";
import { useDocumentMeta } from "../../features/shared/hooks/useDocumentMeta";
import {
  useHomeDataQuery,
  usePersonalizedRecsQuery,
} from "../../features/shared/queries/catalogQueries";

const HomePage = () => {
  useDocumentMeta({
    title: "Trang chủ",
    description:
      "Khám phá laptop, smartphone, gaming gear chính hãng cùng trợ lý AI Vector Search, so sánh hiệu năng và tư vấn cấu hình tại TIENTECH Shop.",
    canonicalPath: "/",
  });

  const {
    data: homeData,
    isLoading: homeLoading,
    error: homeQueryError,
    refetch: fetchHomeData,
  } = useHomeDataQuery();
  const { data: personalizedRecs = [] } = usePersonalizedRecsQuery(6);

  const homeError = homeQueryError ? homeQueryError.message : null;

  return (
    <div className="bg-slate-50 dark:bg-dark-bg transition-colors duration-300 flex-1">
      {/* Futuristic Hero Section */}
      <HeroSection />

      <div className="min-w-0">
        {homeError && (
          <div className="container-custom pt-4">
            <ErrorBanner message={homeError} onRetry={fetchHomeData} />
          </div>
        )}

        {/* Brand Showcase Carousel */}
        <BrandSection brands={homeData?.brands} parentLoading={homeLoading} />

        {/* High-energy Flash Sale Countdown */}
        <FlashSale products={homeData?.flashSale} parentLoading={homeLoading} />

        {/* Interactive Categories */}
        <CategorySection
          categories={homeData?.categories}
          parentLoading={homeLoading}
        />

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
          parentLoading={homeLoading}
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
      </div>
    </div>
  );
};

export default HomePage;
