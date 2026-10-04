import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiStar,
  FiGrid,
  FiRotateCcw,
  FiSliders,
  FiSearch,
  FiX,
  FiChevronDown,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiHeadphones,
  FiWatch,
  FiPackage,
  FiLayers,
  FiTrendingUp,
} from "react-icons/fi";
import { getAllProductApi } from "../../api/productApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";

const SORT_OPTIONS = [
  { id: "featured", label: "Nổi bật nhất" },
  { id: "bestseller", label: "Bán chạy nhất 🔥" },
  { id: "discount", label: "Ưu đãi sốc (%)" },
  { id: "top_rated", label: "Đánh giá cao (⭐)" },
  { id: "price_asc", label: "Giá: Thấp → Cao" },
  { id: "price_desc", label: "Giá: Cao → Thấp" },
];

const PRICE_RANGES = [
  { id: "all", label: "Mọi mức giá" },
  { id: "under_10m", label: "Dưới 10 Triệu", max: 10000000 },
  { id: "10m_25m", label: "10 - 25 Triệu", min: 10000000, max: 25000000 },
  { id: "over_25m", label: "Trên 25 Triệu", min: 25000000 },
];

const getCategoryIcon = (name = "") => {
  const s = name.toLowerCase();
  if (s.includes("thoại") || s.includes("phone") || s.includes("mobile"))
    return <FiSmartphone className="text-xs shrink-0" />;
  if (s.includes("laptop") || s.includes("máy tính") || s.includes("pc"))
    return <FiMonitor className="text-xs shrink-0" />;
  if (s.includes("tablet") || s.includes("bảng") || s.includes("ipad"))
    return <FiTablet className="text-xs shrink-0" />;
  if (
    s.includes("tai nghe") ||
    s.includes("âm thanh") ||
    s.includes("sound") ||
    s.includes("audio")
  )
    return <FiHeadphones className="text-xs shrink-0" />;
  if (s.includes("đồng hồ") || s.includes("watch"))
    return <FiWatch className="text-xs shrink-0" />;
  if (s.includes("phụ kiện") || s.includes("accessory"))
    return <FiPackage className="text-xs shrink-0" />;
  return <FiLayers className="text-xs shrink-0" />;
};

const ProductSection = ({
  products: propProducts,
  categories: propCategories,
}) => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState(
    propProducts ? propProducts.slice(0, 36) : [],
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(
    !propProducts || propProducts.length === 0,
  );

  useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      setAllProducts(propProducts.slice(0, 36));
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await getAllProductApi(1, 36);
        if (res?.errCode === 0) {
          const featured = res.products
            ?.filter((p) => p.isActive)
            ?.slice(0, 36);
          setAllProducts(featured || []);
        } else {
          toast.error("Không thể tải sản phẩm!");
        }
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        toast.error("Không thể tải sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [propProducts]);

  // Nhóm danh mục khả dụng kèm đếm số lượng
  const availableCategories = useMemo(() => {
    const catMap = new Map();
    (allProducts || []).forEach((p) => {
      const catObj = p.category || p.Category;
      const id = catObj?.id || p.categoryId;
      const name =
        catObj?.name ||
        p.categoryName ||
        (typeof p.category === "string" ? p.category : null);
      if (id && name) {
        const key = String(id);
        if (!catMap.has(key)) {
          catMap.set(key, { id: key, name, count: 1 });
        } else {
          catMap.get(key).count += 1;
        }
      }
    });

    if (catMap.size === 0 && propCategories && propCategories.length > 0) {
      propCategories.forEach((c) => {
        catMap.set(String(c.id), { id: String(c.id), name: c.name, count: 0 });
      });
    }

    return Array.from(catMap.values());
  }, [allProducts, propCategories]);

  const isFiltering =
    selectedCategory !== "all" ||
    selectedPrice !== "all" ||
    sortBy !== "featured" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedPrice("all");
    setSortBy("featured");
    setSearchQuery("");
  };

  const displayProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    let list = [...allProducts];

    // 1. Lọc theo danh mục
    if (selectedCategory !== "all") {
      list = list.filter((p) => {
        const catObj = p.category || p.Category;
        const id = String(catObj?.id || p.categoryId || "");
        const name = (
          catObj?.name ||
          p.categoryName ||
          (typeof p.category === "string" ? p.category : "")
        ).toLowerCase();
        return (
          id === String(selectedCategory) ||
          name === String(selectedCategory).toLowerCase()
        );
      });
    }

    // 2. Tìm kiếm nhanh theo tên hoặc thương hiệu
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const brand = (p.brand?.name || p.Brand?.name || "").toLowerCase();
        return name.includes(q) || brand.includes(q);
      });
    }

    // 3. Lọc theo khoảng giá
    if (selectedPrice !== "all") {
      const range = PRICE_RANGES.find((r) => r.id === selectedPrice);
      if (range) {
        list = list.filter((p) => {
          const price = Number(p.displayPrice ?? p.price ?? p.basePrice ?? 0);
          if (range.min != null && range.max != null) {
            return price >= range.min && price <= range.max;
          }
          if (range.min != null) return price >= range.min;
          if (range.max != null) return price <= range.max;
          return true;
        });
      }
    }

    // 4. Sắp xếp
    if (sortBy === "bestseller") {
      list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else if (sortBy === "discount") {
      list.sort((a, b) => {
        const discA = Number(a.discount || a.flashSaleDiscount || 0);
        const discB = Number(b.discount || b.flashSaleDiscount || 0);
        return discB - discA;
      });
    } else if (sortBy === "top_rated") {
      list.sort((a, b) => {
        const ratingA =
          a.reviews && a.reviews.length > 0
            ? a.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
              a.reviews.length
            : a.rating || 0;
        const ratingB =
          b.reviews && b.reviews.length > 0
            ? b.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
              b.reviews.length
            : b.rating || 0;
        return ratingB - ratingA;
      });
    } else if (sortBy === "price_asc") {
      list.sort((a, b) => {
        const priceA = Number(a.displayPrice ?? a.price ?? a.basePrice ?? 0);
        const priceB = Number(b.displayPrice ?? b.price ?? b.basePrice ?? 0);
        return priceA - priceB;
      });
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => {
        const priceA = Number(a.displayPrice ?? a.price ?? a.basePrice ?? 0);
        const priceB = Number(b.displayPrice ?? b.price ?? b.basePrice ?? 0);
        return priceB - priceA;
      });
    }

    return list.slice(0, 18);
  }, [allProducts, selectedCategory, searchQuery, selectedPrice, sortBy]);

  // Danh sách các chip bộ lọc đang active
  const activeChips = useMemo(() => {
    const chips = [];
    if (selectedCategory !== "all") {
      const cat = availableCategories.find((c) => c.id === selectedCategory);
      chips.push({
        id: "category",
        label: `${cat ? cat.name : selectedCategory}`,
        onRemove: () => setSelectedCategory("all"),
      });
    }
    if (selectedPrice !== "all") {
      const pr = PRICE_RANGES.find((p) => p.id === selectedPrice);
      chips.push({
        id: "price",
        label: `${pr ? pr.label : selectedPrice}`,
        onRemove: () => setSelectedPrice("all"),
      });
    }
    if (sortBy !== "featured") {
      const s = SORT_OPTIONS.find((o) => o.id === sortBy);
      chips.push({
        id: "sort",
        label: `${s ? s.label : sortBy}`,
        onRemove: () => setSortBy("featured"),
      });
    }
    if (searchQuery.trim()) {
      chips.push({
        id: "search",
        label: `"${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(""),
      });
    }
    return chips;
  }, [
    selectedCategory,
    selectedPrice,
    sortBy,
    searchQuery,
    availableCategories,
  ]);

  return (
    <section className="py-8 md:py-12 bg-slate-50/60 dark:bg-dark-bg/60 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 relative overflow-hidden">
      <div className="container-custom relative z-10">
        {/* Unified Modern Filter & Navigation Command Header */}
        <div className="mb-6 space-y-3.5">
          {/* Row 1: Section Title + Quick Tool Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title & Live Counter Badge */}
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
                <FiStar className="text-[10px]" />
                <span>Tuyển chọn flagship</span>
                <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-slate-400 dark:text-slate-500 font-mono">
                  {displayProducts.length}/{allProducts.length} SP
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                Sản Phẩm Công Nghệ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
                  Nổi Bật
                </span>
              </h2>
            </div>

            {/* Right Tools Bar: Search, Price Select, Sort Select, Reset, View All */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Compact Search Input */}
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm nhanh..."
                  className="w-28 sm:w-36 focus:w-44 transition-all duration-200 pl-7 pr-6 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Xóa từ khóa"
                  >
                    <FiX className="text-xs" />
                  </button>
                )}
              </div>

              {/* Price Range Selector Pill */}
              <div className="relative">
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className={`pl-7 pr-7 py-1.5 rounded-xl text-xs font-semibold appearance-none cursor-pointer transition-all border shadow-2xs focus:outline-none ${
                    selectedPrice !== "all"
                      ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-500/50"
                      : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {PRICE_RANGES.map((range) => (
                    <option
                      key={range.id}
                      value={range.id}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      {range.id === "all" ? "Mọi mức giá" : range.label}
                    </option>
                  ))}
                </select>
                <FiSliders className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
              </div>

              {/* Sort Selector Pill */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`pl-7 pr-7 py-1.5 rounded-xl text-xs font-semibold appearance-none cursor-pointer transition-all border shadow-2xs focus:outline-none ${
                    sortBy !== "featured"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-500/50"
                      : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option
                      key={opt.id}
                      value={opt.id}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FiTrendingUp className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
              </div>

              {/* Reset Button (Visible when filtering) */}
              {isFiltering && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer shadow-2xs"
                  title="Đặt lại toàn bộ bộ lọc"
                >
                  <FiRotateCcw className="text-xs" />
                  <span className="hidden sm:inline">Đặt lại</span>
                </button>
              )}

              {/* View All Products Link */}
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <span>Xem tất cả</span>
                <FiArrowRight className="text-xs" />
              </button>
            </div>
          </div>

          {/* Row 2: Category Segmented Navigation Dock + Inline Active Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Category Segmented Control Dock */}
            {availableCategories.length > 0 && (
              <div className="p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 inline-flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs scale-[1.01]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <FiGrid className="text-xs" />
                  <span>Tất cả</span>
                  <span className="text-[10px] opacity-70 font-mono">
                    ({allProducts.length})
                  </span>
                </button>

                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs scale-[1.01]"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {getCategoryIcon(cat.name)}
                    <span>{cat.name}</span>
                    {cat.count > 0 && (
                      <span className="text-[10px] opacity-70 font-mono">
                        ({cat.count})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Inline Active Badges */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
                  Đang lọc:
                </span>
                {activeChips.map((chip) => (
                  <span
                    key={chip.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-[11px] font-medium"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <FiX className="text-[10px]" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Xóa lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <AnimatePresence mode="wait">
            <Motion.div
              key={`${selectedCategory}-${selectedPrice}-${sortBy}-${searchQuery}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 md:gap-4"
            >
              {displayProducts.map((product, index) => (
                <Motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.04 }}
                  className="min-w-0"
                >
                  <ProductCard product={product} />
                </Motion.div>
              ))}
            </Motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800">
            <div className="size-12 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mb-3">
              <FiGrid className="size-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Không tìm thấy sản phẩm phù hợp
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
              Không có sản phẩm nào khớp với bộ lọc &amp; tầm giá hiện tại. Bạn hãy
              thử bỏ bớt điều kiện lọc nhé.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm cursor-pointer"
            >
              Xóa bộ lọc &bull; Xem tất cả
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;



