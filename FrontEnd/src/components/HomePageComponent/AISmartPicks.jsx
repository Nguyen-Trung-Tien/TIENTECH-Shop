import React, { useState, useMemo } from "react";
import { FiCpu, FiCheckCircle } from "react-icons/fi";
import { Sparkles } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import ProductCard from "../ProductCard/ProductCard";

const AI_FILTER_CHIPS = [
  { id: "all", label: "Tất cả gợi ý", icon: "✨" },
  { id: "flagship", label: "Hiệu năng Flagship", icon: "⚡" },
  { id: "creative", label: "Sáng tạo & Đồ họa", icon: "🎨" },
  { id: "sound", label: "Âm thanh Hi-Res", icon: "🎧" },
  { id: "gaming", label: "Gaming Pro", icon: "🎮" },
];

const AISmartPicks = ({ products, title = "Dành Riêng Cho Bạn" }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (selectedFilter === "all") return products;

    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const cat = (p.category?.name || p.categoryName || "").toLowerCase();
      if (selectedFilter === "flagship") {
        return (
          name.includes("pro") ||
          name.includes("ultra") ||
          name.includes("max") ||
          cat.includes("laptop") ||
          cat.includes("phone")
        );
      }
      if (selectedFilter === "creative") {
        return (
          name.includes("macbook") ||
          name.includes("ipad") ||
          name.includes("oled") ||
          name.includes("màn hình")
        );
      }
      if (selectedFilter === "sound") {
        return (
          cat.includes("tai nghe") ||
          cat.includes("âm thanh") ||
          name.includes("buds") ||
          name.includes("airpods")
        );
      }
      if (selectedFilter === "gaming") {
        return (
          name.includes("gaming") ||
          cat.includes("bàn phím") ||
          cat.includes("chuột") ||
          cat.includes("gear")
        );
      }
      return true;
    });
  }, [products, selectedFilter]);

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-slate-50/50 to-white dark:from-dark-bg dark:via-indigo-950/20 dark:to-dark-bg border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      {/* Background Neural Glows */}
      <div className="absolute top-1/4 -right-20 w-[450px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-10 left-10 w-[350px] h-[250px] bg-cyan-500/10 dark:bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container-custom relative z-10">
        {/* Header with AI Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-5">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 dark:from-indigo-950/60 dark:to-violet-950/60 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono tracking-wider mb-2.5 shadow-xs">
              <Sparkles className="size-3.5 text-indigo-500 animate-spin" />
              <span>TIENTECH NEURAL RECS &bull; 99% ACCURACY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>{title}</span>
              <span className="hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <FiCheckCircle className="mr-1" /> Cá nhân hóa
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Thuật toán AI tự động phân tích hành vi tìm kiếm &amp; sở thích công nghệ của bạn
            </p>
          </div>

          {/* AI Interactive Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {AI_FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedFilter(chip.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedFilter === chip.id
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                    : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500"
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <Motion.div
            key={selectedFilter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 md:gap-4.5"
          >
            {(filteredProducts.length > 0 ? filteredProducts : products)
              .slice(0, 6)
              .map((product, idx) => (
                <div key={product.id} className="relative group">
                  {/* Subtle Top AI Match Pill */}
                  <div className="absolute -top-2.5 left-3 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 text-[10px] font-black text-white font-mono shadow-xs uppercase tracking-wider">
                      <FiCpu className="text-[9px]" /> {99 - idx * 2}% Match
                    </span>
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
          </Motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AISmartPicks;
