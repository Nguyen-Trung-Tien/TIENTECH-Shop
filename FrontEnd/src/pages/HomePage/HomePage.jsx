import { useEffect, useState } from "react";
import HeroSection from "../../components/HomePageComponent/HeroSection";
import CategorySection from "../../components/HomePageComponent/CategorySection";
import ProductSection from "../../components/HomePageComponent/ProductSection";
import AllProducts from "../../components/AllProducts/AllProduct";
import ChatBot from "../../components/ChatBot/ChatBot";
import SmallBanner from "../../components/SmallBanner/SmallBanner";
import FlashSale from "../../components/FlashSale/FlashSale";
import Testimonials from "../../components/Testimonials/Testimonials";
import BlogSection from "../../components/BlogSection/BlogSection";
import BrandSection from "../../components/BrandSection/BrandSection";
import AISmartPicks from "../../components/HomePageComponent/AISmartPicks";
import { getPersonalizedRecommendationsApi } from "../../api/productApi";

const HomePage = () => {
  const [personalizedRecs, setPersonalizedRecs] = useState([]);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await getPersonalizedRecommendationsApi(6);
        if (res?.errCode === 0) setPersonalizedRecs(res.products);
      } catch {
        console.error("Failed to load Personalized Recommendations");
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="bg-white dark:bg-black transition-colors duration-300">
      <ChatBot />
      <HeroSection />

      <main>
        {/* Sections are now stacked tightly */}
        <BrandSection />

        <CategorySection />

        {personalizedRecs.length > 0 && (
          <AISmartPicks
            products={personalizedRecs}
            title="Dành Riêng Cho Bạn"
          />
        )}

        <div className="container-custom py-2">
          <div className="rounded-[2rem] overflow-hidden shadow-md">
            <SmallBanner />
          </div>
        </div>

        <FlashSale />

        <ProductSection />

        <AllProducts />

        <div className="bg-slate-50 dark:bg-gray-900/20 py-8 border-t border-slate-100 dark:border-gray-800 space-y-8">
          <Testimonials />
          <BlogSection />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
