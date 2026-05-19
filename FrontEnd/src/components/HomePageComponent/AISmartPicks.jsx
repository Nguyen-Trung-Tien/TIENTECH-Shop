import React from "react";
import { FiZap } from "react-icons/fi";
import ProductCard from "../ProductCard/ProductCard";

const AISmartPicks = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="container-custom py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <FiZap size={24} className="fill-current animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            AI Smart Picks
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Gợi ý thông minh dành riêng cho bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default AISmartPicks;
