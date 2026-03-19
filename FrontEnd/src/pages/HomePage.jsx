import React from "react";
import HeroSection from "../../components/HomePageComponent/HeroSection";
import CategorySection from "../../components/HomePageComponent/CategorySection";
import ProductSection from "../../components/HomePageComponent/ProductSection";
import BrandSection from "../../components/BrandSection/BrandSection";
import Newsletter from "../../components/Newsletter/Newsletter";
import LayoutComponent from "../../components/LayoutComponent/LayoutComponent";

const HomePage = () => {
  return (
    <LayoutComponent>
      <div className="space-y-24 pb-16">
        <HeroSection />
        
        <div className="container-custom">
          <CategorySection />
        </div>

        <div className="container-custom">
          <ProductSection title="Sản phẩm mới nhất" />
        </div>

        <div className="bg-surface-100 py-24">
          <div className="container-custom">
             <BrandSection />
          </div>
        </div>

        <div className="container-custom">
          <Newsletter />
        </div>
      </div>
    </LayoutComponent>
  );
};

export default HomePage;
