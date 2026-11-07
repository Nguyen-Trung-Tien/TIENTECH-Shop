import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiFilter, FiInfo, FiZap, FiCompass, FiLayers, FiRefreshCw, FiSliders, FiAward, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import { fetchFortuneProducts } from "../../api/productApi";
import { getAllBrandApi } from "../../api/brandApi";
import { getAllCategoryApi } from "../../api/categoryApi";
import { getFengShuiDetailApi } from "../../api/chatApi";
import ProductCard from "../ProductCard/ProductCard";
import FengShuiChat from "../ChatBot/FengShui";
import AppPagination from "../Pagination/Pagination";
import Button from "../UI/Button";
import UnifiedSpinner from "../Loading/UnifiedSpinner";

const FortuneProducts = () => {
  // User Input State
  const [birthYear, setBirthYear] = useState(1998);
  const [gender, setGender] = useState("male");

  // Dynamic Feng Shui Energy from Backend
  const [fsDetail, setFsDetail] = useState(null);
  const [allElements, setAllElements] = useState([]);
  const [loadingFengShui, setLoadingFengShui] = useState(false);

  // Filters State
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  // Filter Catalog Data
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Product Recommendation State
  const [products, setProducts] = useState([]);
  const [luckyColors, setLuckyColors] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load Brand and Category Catalogs
  useEffect(() => {
    let isMounted = true;
    const loadCatalogs = async () => {
      try {
        const [brandRes, cateRes] = await Promise.all([
          getAllBrandApi(),
          getAllCategoryApi(),
        ]);
        if (isMounted) {
          if (brandRes?.errCode === 0) setBrands(brandRes.brands || []);
          if (cateRes?.errCode === 0) setCategories(cateRes.data || []);
        }
      } catch (err) {
        console.error("Load catalogs error:", err);
      }
    };
    loadCatalogs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Feng Shui Details dynamically from Backend API (NO hardcoded dictionary)
  const fetchFengShuiDetail = useCallback(async (year, gen) => {
    if (!year) return;
    setLoadingFengShui(true);
    try {
      const res = await getFengShuiDetailApi(year, gen);
      if (res?.errCode === 0 && res.data) {
        setFsDetail(res.data);
        if (res.data.elements) {
          setAllElements(res.data.elements);
        }
      }
    } catch (err) {
      console.error("fetchFengShuiDetail error:", err);
    } finally {
      setLoadingFengShui(false);
    }
  }, []);

  useEffect(() => {
    fetchFengShuiDetail(birthYear, gender);
  }, [birthYear, gender, fetchFengShuiDetail]);

  // Fetch Recommended Products from Backend
  const fetchProducts = useCallback(async () => {
    if (!birthYear) return;
    setLoading(true);
    try {
      const res = await fetchFortuneProducts({
        birthYear,
        brandId: brandId || undefined,
        categoryId: categoryId || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        page,
        limit,
      });

      if (res?.errCode === 0) {
        let list = res.data || [];
        if (sortBy === "price_asc") {
          list = [...list].sort(
            (a, b) =>
              (a.displayPrice || a.basePrice || 0) -
              (b.displayPrice || b.basePrice || 0)
          );
        } else if (sortBy === "price_desc") {
          list = [...list].sort(
            (a, b) =>
              (b.displayPrice || b.basePrice || 0) -
              (a.displayPrice || a.basePrice || 0)
          );
        }

        setProducts(list);
        setLuckyColors(res.luckyColors || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalItems(res.pagination?.totalItems || list.length);
      } else {
        setProducts([]);
        setLuckyColors([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Fetch fortune products error:", err);
      setProducts([]);
      setLuckyColors([]);
    } finally {
      setLoading(false);
    }
  }, [birthYear, brandId, categoryId, minPrice, maxPrice, sortBy, page, limit]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Year options list for fast select
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 80 }, (_, i) => currentYear - 10 - i),
    [currentYear]
  );

  const resetFilters = () => {
    setBrandId("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("popular");
    setPage(1);
  };

  const handleGlobalYearChange = (newYear) => {
    if (newYear) {
      setBirthYear(Number(newYear));
      setPage(1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-24 relative overflow-x-hidden">
      {/* Floating Interactive Master FengShui Chatbot */}
      <FengShuiChat setGlobalBirthYear={handleGlobalYearChange} />

      {/* Decorative Aura Background Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[15%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-gradient-to-tr from-amber-500/10 to-rose-500/10 dark:from-amber-500/15 dark:to-purple-500/15 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 md:pt-10">
        {/* Navigation Breadcrumb Back */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs"
          >
            <FiArrowLeft size={16} /> Quay lại trang chủ
          </Link>
        </div>

        {/* HERO SECTION */}
        <section className="relative mb-10 overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white p-6 sm:p-10 md:p-14 border border-indigo-100 dark:border-slate-800 shadow-lg dark:shadow-2xl transition-colors duration-300">
          {/* Subtle Cyber-Fengshui Background Patterns */}
          <div className="absolute top-0 right-0 p-8 opacity-15 dark:opacity-10 select-none pointer-events-none transform translate-x-8 -translate-y-8">
            <FiCompass size={280} className="text-indigo-500/30 dark:text-blue-400 animate-spin-slow" />
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl min-w-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/30 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-md">
              <FiZap size={14} className="text-amber-500 dark:text-amber-400" />
              TienTech FengShui Intelligence
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-5 text-slate-900 dark:text-white">
              Khai Vận <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 dark:from-blue-400 dark:via-indigo-300 dark:to-amber-300">Công Nghệ</span>
              <br />
              <span className="font-serif italic font-normal text-slate-600 dark:text-slate-300 text-2xl sm:text-3xl md:text-4xl block mt-1">
                Ngũ Hành Tương Sinh • Vượng Khí Tài Lộc
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg font-normal leading-relaxed max-w-2xl min-w-0 break-words mb-8">
              Mỗi thiết bị công nghệ bạn đồng hành hằng ngày đều mang trường năng lượng riêng biệt. Thuật toán phân tích Bản Mệnh kết hợp trí tuệ nhân tạo độc quyền từ TienTech giúp bạn chọn đúng sản phẩm có màu sắc và thuộc tính tương sinh đại cát.
            </p>

            {/* Elements Quick Visual Badges */}
            {allElements.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mr-2">
                  Ngũ Hành:
                </span>
                {allElements.map((el) => {
                  const isActive = fsDetail?.element === el.key;
                  return (
                    <span
                      key={el.key}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/50 shadow-sm font-bold"
                          : "bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 shadow-xs"
                      }`}
                    >
                      <span>{el.icon}</span>
                      <span>{el.name}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* INTERACTIVE FENG SHUI CONSOLE */}
        <section className="mb-10 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FiCompass size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Thiết Lập Quẻ Mệnh Cá Nhân
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dữ liệu được đối soát trực tiếp từ động cơ Phong Thủy Bát Trạch & Can Chi chuẩn xác.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Year & Gender Selector */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Year Select */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-3">
                  Năm sinh:
                </span>
                <select
                  value={birthYear}
                  onChange={(e) => {
                    setBirthYear(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {yearOptions.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Toggle */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    gender === "male"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Nam Mạng
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    gender === "female"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Nữ Mạng
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC FENG SHUI ANALYSIS REPORT (FROM BACKEND) */}
          <div className="mt-6">
            {loadingFengShui ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <UnifiedSpinner size="md" variant="primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Đang khởi tạo quẻ mệnh từ máy chủ...
                </span>
              </div>
            ) : fsDetail ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Element Badge Card */}
                <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-slate-100/90 dark:from-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white p-6 sm:p-7 rounded-2xl relative overflow-hidden flex flex-col justify-between border border-blue-100 dark:border-slate-800 shadow-sm dark:shadow-md transition-colors duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:bg-white/10 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/20 dark:border-white/15">
                        <FiAward size={13} />
                        Cung Mệnh Chuẩn Xác
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Sinh năm {fsDetail.year} ({fsDetail.gender})
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 mb-2">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Mệnh {fsDetail.element}
                      </h3>
                      <span className="text-sm font-semibold text-primary dark:text-blue-300">
                        • Cung {fsDetail.cungPhi}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        (Mệnh Niên: {fsDetail.menhNien})
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">
                      {fsDetail.advice}
                    </p>
                  </div>

                  {/* Lucky Numbers & Advice */}
                  <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Con Số Khai Vận:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {fsDetail.luckyNumbers?.map((num) => (
                          <span
                            key={num}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 text-amber-600 dark:text-amber-300 font-black text-xs flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-xs"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Tỷ Lệ Tương Hợp AI
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        99.2% Đại Cát
                      </span>
                    </div>
                  </div>
                </div>

                {/* Energy & Color Harmony Matrix */}
                <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Main Lucky Colors */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-2.5">
                        <FiCheckCircle size={15} />
                        Màu Bản Mệnh (Đại Cát)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fsDetail.luckyColors?.map((c, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Support Colors */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-2.5">
                        <FiZap size={15} />
                        Màu Tương Sinh (Bổ Trợ)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fsDetail.supportColors?.map((c, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bad / Incompatible Colors warning */}
                  {fsDetail.badColors && fsDetail.badColors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                      <div className="flex items-center gap-1.5 font-black uppercase tracking-wider shrink-0">
                        <FiXCircle size={14} />
                        Màu Kỵ Cần Hạn Chế:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fsDetail.badColors.map((bc, idx) => (
                          <span
                            key={idx}
                            className="font-semibold text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded text-[11px]"
                          >
                            {bc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Workspace Tips */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                    <FiInfo className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <div className="min-w-0 break-words">
                      <span className="font-bold text-slate-900 dark:text-white mr-1">
                        Mẹo đặt bàn làm việc:
                      </span>
                      {fsDetail.workspaceTip}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* MAIN LAYOUT: FILTERS & PRODUCTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR FILTER PANEL */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <FiFilter className="text-blue-600 dark:text-blue-400" size={18} />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Bộ Lọc Sản Phẩm
                  </h3>
                </div>
                {(brandId || categoryId || minPrice || maxPrice || sortBy !== "popular") && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                  >
                    <FiRefreshCw size={11} /> Xoá lọc
                  </button>
                )}
              </div>

              <div className="space-y-5 pt-5">
                {/* Brand Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                    Thương Hiệu
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => {
                      setBrandId(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Tất cả thương hiệu</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                    Danh Mục
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                    Mức Giá (VNĐ)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Quick Feng Shui Helper Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1.5">
                    <FiSliders size={14} /> Trợ lý Quẻ Mệnh
                  </div>
                  <p className="leading-relaxed">
                    Bạn có thể bấm vào bong bóng chat góc phải để đối thoại trực tiếp với Master AI và nhận gợi ý thông minh nhất.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN RESULTS CONTAINER */}
          <main className="lg:col-span-9 space-y-6 min-w-0">
            {/* Top Toolbar: Result count & Sort Dropdown */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Tìm thấy{" "}
                  <strong className="text-slate-900 dark:text-white font-black">
                    {totalItems}
                  </strong>{" "}
                  thiết bị tương sinh quẻ mệnh {fsDetail?.element ? `Mệnh ${fsDetail.element}` : ""}
                </span>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sắp xếp:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="popular">Bán chạy / Nổi bật</option>
                  <option value="price_asc">Giá: Thấp đến cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>

            {/* PRODUCT GRID / SPINNER / EMPTY STATE */}
            <div className="min-h-[500px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-36 gap-4">
                  <UnifiedSpinner size="lg" variant="primary" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
                    Đang chiêm bái & quét năng lượng sản phẩm...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 sm:p-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto mb-5 flex items-center justify-center">
                    <FiLayers size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Không tìm thấy sản phẩm phù hợp bộ lọc
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto mb-6">
                    Hãy thử mở rộng khoảng giá hoặc chọn thương hiệu / danh mục khác để xem thêm nhiều quẻ cát.
                  </p>
                  <Button
                    variant="primary"
                    onClick={resetFilters}
                    icon={FiRefreshCw}
                    className="!rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Xoá bộ lọc tìm kiếm
                  </Button>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((p, idx) => (
                      <Motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                      >
                        <ProductCard
                          product={p}
                          highlightColor={
                            p.isLuckyColor ||
                            luckyColors.some((c) =>
                              (p.color || "")
                                .toLowerCase()
                                .includes(c.toLowerCase())
                            )
                          }
                        />
                      </Motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center pt-8 border-t border-slate-200/80 dark:border-slate-800">
                      <AppPagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        loading={loading}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FortuneProducts;
