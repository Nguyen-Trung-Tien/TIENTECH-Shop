import { useEffect, useState } from "react";
import HeroSection from "../../components/HomePageComponent/HeroSection";
import CategorySection from "../../components/HomePageComponent/CategorySection";
import ProductSection from "../../components/HomePageComponent/ProductSection";
import AllProducts from "../../components/AllProducts/AllProduct";
import { getAllCategoryApi } from "../../api/categoryApi";
import ChatBot from "../../components/ChatBot/ChatBot";
import SmallBanner from "../../components/SmallBanner/SmallBanner";
import FlashSale from "../../components/FlashSale/FlashSale";
import Testimonials from "../../components/Testimonials/Testimonials";
import BlogSection from "../../components/BlogSection/BlogSection";
import Newsletter from "../../components/Newsletter/Newsletter";
import BrandSection from "../../components/BrandSection/BrandSection";

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoryApi();
        if (res.errCode === 0) setCategories(res.data);
      } catch (err) {
        console.error("Fetch categories error:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-white">
      <ChatBot />

      {/* Hero with full width */}
      <HeroSection />

      <main className="space-y-0">
        {/* Brand Logos - Subtle Divider */}
        <div className="bg-slate-50 py-10 border-y border-slate-100">
          <BrandSection />
        </div>

        {/* Categories Section */}
        <CategorySection categories={categories} loading={loadingCategories} />

        {/* Banner with high impact */}
        <div className="container-custom py-8">
          <div className="rounded-[40px] overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-500">
            <SmallBanner />
          </div>
        </div>

        {/* Flash Sale - High Energy */}
        <FlashSale />

        {/* Recommended Products */}
        <ProductSection
          categories={categories}
          loadingCategories={loadingCategories}
        />

        {/* Main Product Feed */}
        <div className="py-16 bg-white">
          <AllProducts
            categories={categories}
            loadingCategories={loadingCategories}
          />
        </div>

        {/* Social Proof & Content */}
        <div className="bg-slate-50 py-20 space-y-24">
          <Testimonials />
          <BlogSection />
        </div>

        {/* Final CTA */}
        <Newsletter />
      </main>
    </div>
  );
};

export default HomePage;
