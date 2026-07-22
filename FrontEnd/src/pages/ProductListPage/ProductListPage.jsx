import React, { useMemo } from "react";
import AllProducts from "../../components/AllProducts/AllProduct";
import ChatBot from "../../components/ChatBot/ChatBot";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { useParams, useLocation } from "react-router-dom";

const ProductListPage = () => {
  const { slug } = useParams();
  const location = useLocation();

  const isCategory = location.pathname.includes("/category/");
  const isBrand = location.pathname.includes("/brand/");

  const pageTitle = useMemo(() => {
    if (isCategory && slug) return slug.replace(/-/g, " ").toUpperCase();
    if (isBrand && slug)
      return `THƯƠNG HIỆU: ${slug.replace(/-/g, " ").toUpperCase()}`;
    return "TẤT CẢ SẢN PHẨM";
  }, [isCategory, isBrand, slug]);

  return (
    <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <ChatBot />

      {/* Page Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white pt-10 pb-12 overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500 rounded-full blur-[80px]"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <div className="mb-3 text-slate-300">
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                TienTech Shop Catalog
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 uppercase">
              {pageTitle}
            </h1>
            <p className="text-slate-300 font-medium text-xs md:text-sm leading-relaxed max-w-xl">
              Hệ thống phân phối linh kiện máy tính, smartphone, laptop & giải pháp công nghệ hàng đầu Việt Nam. Cam kết hàng chính hãng 100%.
            </p>
          </div>
        </div>
      </section>

      <div className="py-6 md:py-10">
        <AllProducts />
      </div>
    </main>
  );
};

export default ProductListPage;

