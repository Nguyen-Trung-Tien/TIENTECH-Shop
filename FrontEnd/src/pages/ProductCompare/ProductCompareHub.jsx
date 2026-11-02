// FrontEnd/src/pages/ProductCompare/ProductCompareHub.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Plus,
  Trash2,
  Cpu,
  Monitor,
  BatteryCharging,
  ShieldCheck,
  Info,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import {
  INITIAL_COMPARE_PRODUCTS,
  AVAILABLE_CANDIDATES,
  SPEC_CATEGORIES,
} from "./mockData";

import {
  WaffleMenu,
  ProductOverflowMenu,
} from "./components/CompareNavigationControls";

import {
  ComboButton,
  SegmentedViewToggle,
  HighlightSwitch,
} from "./components/CompareInteractionControls";

import {
  AddProductDrawer,
  ClearCompareModal,
  CoachMarks,
} from "./components/CompareDrawersAndModals";

const ProductCompareHub = () => {
  // State quản lý danh sách sản phẩm đem so sánh
  const [products, setProducts] = useState(INITIAL_COMPARE_PRODUCTS);
  const [candidates, setCandidates] = useState(AVAILABLE_CANDIDATES);

  // Chế độ xem & bộ lọc
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'diff-only' | 'key-specs'
  const [highlightDiff, setHighlightDiff] = useState(true);
  const [hoveredRowKey, setHoveredRowKey] = useState(null);

  // Trạng thái Overlays
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [showCoachMarks, setShowCoachMarks] = useState(true);

  // Hide on scroll state
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Scrollspy state
  const [activeCategory, setActiveCategory] = useState("performance");

  // Xử lý Hide on Scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 180 && currentScrollY > lastScrollY.current) {
        setIsHeaderHidden(true); // Đang cuộn xuống -> Ẩn thanh tiêu đề
      } else if (currentScrollY < lastScrollY.current) {
        setIsHeaderHidden(false); // Cuộn ngược lên -> Hiện lại
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Xóa 1 sản phẩm khỏi bảng
  const handleRemoveProduct = useCallback((id) => {
    setProducts((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) {
        setCandidates((cand) => [...cand, removed]);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  // Thêm sản phẩm từ Drawer
  const handleSelectProduct = useCallback((product) => {
    if (products.length >= 4) return;
    setProducts((prev) => [...prev, product]);
    setCandidates((prev) => prev.filter((c) => c.id !== product.id));
  }, [products.length]);

  // Xóa trắng bảng
  const handleClearAll = useCallback(() => {
    setCandidates((cand) => [...cand, ...products]);
    setProducts([]);
  }, [products]);

  // Cuộn Scrollspy mượt tới danh mục
  const scrollToCategory = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`spec-section-${categoryId}`);
    if (element) {
      const yOffset = -140; // Trừ hao chiều cao của sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  // Kiểm tra điểm khác biệt giữa các sản phẩm ở 1 field cụ thể
  const isFieldDifferent = useCallback((fieldKey) => {
    if (products.length < 2) return false;
    const firstVal = products[0]?.specs?.[fieldKey];
    return products.some((p) => p?.specs?.[fieldKey] !== firstVal);
  }, [products]);

  // Icon mapping cho các cụm category
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case "Cpu": return <Cpu className="w-4 h-4 text-blue-500" />;
      case "Monitor": return <Monitor className="w-4 h-4 text-purple-500" />;
      case "BatteryCharging": return <BatteryCharging className="w-4 h-4 text-amber-500" />;
      case "ShieldCheck": return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default: return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      {/* 1. TOP SYSTEM BANNER (Toàn Trang) */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-4 py-2.5 text-xs text-center font-medium shadow-sm">
        <span>🎉 Khách hàng mua Laptop Gaming tại TienTech: <strong>Miễn phí vệ sinh trọn đời + Tặng Balo ROG Ranger trị giá 1.890.000 ₫</strong>.</span>
      </div>

      {/* 2. HIDE-ON-SCROLL SITE SUB-HEADER */}
      <header
        className={`sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-transform duration-300 ${
          isHeaderHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/products" className="hover:text-blue-600 transition-colors">Laptop</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">Ma Trận So Sánh</span>
            </nav>
          </div>

          {/* Controls bên phải: Waffle Menu + Reset */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-xs font-medium text-slate-500">
              Chế độ so sánh nâng cao:
            </span>
            <WaffleMenu />
            {products.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa tất cả</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. NỘI DUNG CHÍNH (CONTENT AREA) */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Thanh công cụ lọc & Điều khiển tương tác */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              So Sánh Cấu Hình Chuyên Sâu
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {products.length}/4 Máy
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Đối chiếu thông số kỹ thuật, khả năng nâng cấp và chính sách bảo hành chính hãng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <SegmentedViewToggle value={viewMode} onChange={setViewMode} />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <HighlightSwitch enabled={highlightDiff} onChange={setHighlightDiff} />
            {products.length < 4 && (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm máy so sánh</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. TRẠNG THÁI EMPTY STATE (Khi không có sản phẩm nào) */}
        {products.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <RotateCcw className="w-10 h-10 animate-spin-slow" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Bảng So Sánh Chưa Có Sản Phẩm Nào
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              Hãy chọn tối thiểu 2 thiết bị từ danh mục Laptop Gaming hoặc click nút dưới đây để nạp nhanh danh sách các sản phẩm đang được quan tâm nhất.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setProducts(INITIAL_COMPARE_PRODUCTS.slice(0, 2))}
                className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                Nạp 2 Máy So Sánh Tiêu Biểu
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              >
                Mở Kho Tra Cứu Sản Phẩm
              </button>
            </div>
          </div>
        ) : (
          /* 5. SPLIT VIEW & MASTER-DETAIL LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CỘT TRÁI (3/12): OUTLINE VIEW / SCROLLSPY NAVIGATION & CALLOUTS */}
            <aside className="lg:col-span-3 lg:sticky lg:top-20 space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Cấu Trúc Danh Mục Thông Số
                </h3>
                <nav className="space-y-1">
                  {SPEC_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => scrollToCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs border-l-4 border-blue-600"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <span className="truncate">{cat.title}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* INLINE ALERT / CALLOUT TIÊU CHUẨN */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold">Lưu ý chênh lệch điện năng:</span> Các máy trang bị card đồ họa RTX 4070 yêu cầu củ sạc 300W - 330W, kích thước adapter sẽ nặng hơn khoảng 300g so với RTX 4060.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-blue-900 dark:text-blue-200">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold">Chính sách TienTech VIP:</span> Cả 3 dòng laptop trên đều được hỗ trợ bảo hành tận nhà bởi hãng và cam kết 1-đổi-1 trong 30 ngày nếu phát hiện lỗi phần cứng.
                  </div>
                </div>
              </div>
            </aside>

            {/* CỘT PHẢI (9/12): MA TRẬN SO SÁNH ĐA CỘT (TABLE MATRIX VIEW) */}
            <div className="lg:col-span-9 space-y-6 min-w-0">
              {/* PHẦN ĐẦU BẢNG: PRODUCT CARDS VỚI HOVER LIFT */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto custom-scrollbar">
                <div
                  className="grid gap-4 sm:gap-6 min-w-[720px]"
                  style={{ gridTemplateColumns: `repeat(${products.length}, minmax(220px, 1fr))` }}
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group flex flex-col justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-200 min-w-0"
                    >
                      <div>
                        {/* Top action row */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            {product.badge}
                          </span>
                          <ProductOverflowMenu
                            onRemove={() => handleRemoveProduct(product.id)}
                            onShare={() => alert(`Đã sao chép link so sánh ${product.name}`)}
                            onPrint={() => window.print()}
                          />
                        </div>

                        {/* Image with zero CLS aspect ratio */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        {/* Product Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[36px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h4>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          SKU: {product.sku}
                        </div>

                        {/* Price Tag */}
                        <div className="mt-2.5 mb-4">
                          <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">
                            {Number(product.price).toLocaleString("vi-VN")} ₫
                          </div>
                          {product.originalPrice && (
                            <div className="text-xs text-slate-400 line-through">
                              {Number(product.originalPrice).toLocaleString("vi-VN")} ₫
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Combo Button CTA */}
                      <ComboButton
                        onPrimaryAction={() => alert(`Đã thêm ${product.name} vào giỏ hàng!`)}
                        onExportQuote={() => alert(`Đang xuất file báo giá cho ${product.sku}...`)}
                        onConsult={() => alert(`Nhân viên tư vấn TienTech sẽ liên hệ hỗ trợ ${product.name}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* BẢNG CHI TIẾT THÔNG SỐ (ACCORDION & ROW HIGHLIGHT) */}
              <div className="space-y-6">
                {SPEC_CATEGORIES.map((cat) => (
                  <section
                    key={cat.id}
                    id={`spec-section-${cat.id}`}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
                  >
                    {/* Category Sticky Title Header */}
                    <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                      {getCategoryIcon(cat.iconName)}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {cat.title}
                      </h3>
                    </div>

                    {/* Spec rows */}
                    <div className="overflow-x-auto custom-scrollbar">
                      <div className="min-w-[720px] divide-y divide-slate-100 dark:divide-slate-800/60">
                        {cat.fields.map((field) => {
                          const isDiff = isFieldDifferent(field.key);

                          // Nếu người dùng chọn 'Chỉ xem điểm khác biệt' mà field này giống nhau -> Ẩn đi
                          if (viewMode === "diff-only" && !isDiff) return null;

                          const isRowHovered = hoveredRowKey === field.key;

                          return (
                            <div
                              key={field.key}
                              onMouseEnter={() => setHoveredRowKey(field.key)}
                              onMouseLeave={() => setHoveredRowKey(null)}
                              className={`transition-colors duration-150 ${
                                isRowHovered
                                  ? "bg-blue-50/60 dark:bg-blue-950/30"
                                  : highlightDiff && isDiff
                                  ? "bg-amber-50/30 dark:bg-amber-950/15"
                                  : "hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                              }`}
                            >
                              {/* Label Hàng */}
                              <div className="px-6 pt-3 pb-1 flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  {field.label}
                                </span>
                                {highlightDiff && isDiff && (
                                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                                    Có chênh lệch
                                  </span>
                                )}
                              </div>

                              {/* Giá trị tương ứng trên từng cột sản phẩm */}
                              <div
                                className="grid px-6 pb-4 pt-1 gap-4 sm:gap-6"
                                style={{ gridTemplateColumns: `repeat(${products.length}, minmax(220px, 1fr))` }}
                              >
                                {products.map((p) => (
                                  <div
                                    key={p.id}
                                    className={`text-xs leading-relaxed min-w-0 break-words ${
                                      highlightDiff && isDiff
                                        ? "font-medium text-slate-900 dark:text-slate-100"
                                        : "text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    {p.specs?.[field.key] || "—"}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                ))}

                {/* 6. MỤC TIẾN TRÌNH & BẢO HÀNH (STEPS & TIMELINE) */}
                <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto custom-scrollbar">
                  <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Tiến Trình & Cam Kết Dịch Vụ Hậu Mãi
                    </h3>
                  </div>

                  <div
                    className="grid gap-6 min-w-[720px]"
                    style={{ gridTemplateColumns: `repeat(${products.length}, minmax(220px, 1fr))` }}
                  >
                    {products.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-3 truncate">
                          {p.name}
                        </div>
                        <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                          {p.warrantySteps?.map((w, idx) => (
                            <div key={idx} className="relative flex items-start gap-3 pl-1">
                              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold z-10 shrink-0">
                                {idx + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  {w.step}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                  {w.title}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* OVERLAY COMPONENTS */}
      <AddProductDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        candidates={candidates}
        onSelectProduct={handleSelectProduct}
        currentCount={products.length}
        maxLimit={4}
      />

      <ClearCompareModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearAll}
      />

      <CoachMarks
        isVisible={showCoachMarks && products.length > 0}
        onClose={() => setShowCoachMarks(false)}
      />
    </div>
  );
};

export default ProductCompareHub;

