import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import HeroSection from "../../components/HomePageComponent/HeroSection";
import CategorySection from "../../components/HomePageComponent/CategorySection";
import ProductSection from "../../components/HomePageComponent/ProductSection";
import AllProducts from "../../components/AllProducts/AllProduct";
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

  const fetchHomeData = useCallback(async () => {
    try {
      const res = await getHomePageDataApi();
      if (res?.errCode === 0 && res.data) {
        setHomeData(res.data);
      }
    } catch (err) {
      console.error("Failed to load aggregated home page data", err);
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

        {/* All Products Catalog */}
        <AllProducts />

        {/* Tech Trust & Assurance Guarantee Pillars */}
        <TechTrustBanner />

        {/* Social Proof & Tech News */}
        <div className="bg-slate-50/80 dark:bg-gray-900/30 py-10 border-t border-slate-200/60 dark:border-gray-800 space-y-10">
          <Testimonials />
          <BlogSection />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
