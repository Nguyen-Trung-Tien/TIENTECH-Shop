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

      {/* Page Header */}
      <section className="bg-slate-50/50 dark:bg-gray-900/20 border-b border-slate-100 dark:border-gray-800 pt-16 pb-12 overflow-hidden relative transition-colors duration-300">
        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <Breadcrumbs />
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase">
              {pageTitle}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-widest text-[10px]">
              Hệ thống phân phối linh kiện máy tính & giải pháp công nghệ hàng
              đầu Việt Nam.
            </p>
          </div>
        </div>
      </section>

      <div className="py-8">
        <AllProducts />
      </div>
    </main>
  );
};

export default ProductListPage;

