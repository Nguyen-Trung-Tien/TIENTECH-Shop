import React, { useState, useEffect, useCallback, useRef } from "react";
import Select from "react-select";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSearch,
  FiLayers,
  FiCpu,
  FiFilter,
  FiActivity,
  FiInfo,
  FiZap,
} from "react-icons/fi";
import { fetchFortuneProducts } from "../../api/productApi";
import { getAllBrandApi } from "../../api/brandApi";
import { getAllCategoryApi } from "../../api/categoryApi";
import ProductCard from "../ProductCard/ProductCard";
import FengShuiChat from "../ChatBot/FengShui";
import AppPagination from "../Pagination/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../UI/Button";

const FortuneProducts = () => {
  const [birthYear, setBirthYear] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [luckyColors, setLuckyColors] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [brandRes, cateRes] = await Promise.all([
        getAllBrandApi(),
        getAllCategoryApi(),
      ]);
      if (brandRes?.errCode === 0) setBrands(brandRes.brands || []);
      if (cateRes?.errCode === 0) setCategories(cateRes.data || []);
    };
    loadData();
  }, []);

  const yearOptions = Array.from({ length: 100 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: year.toString() };
  });

  const fetchProducts = useCallback(async () => {
    if (!birthYear) return;
    setLoading(true);
    try {
      const res = await fetchFortuneProducts({
        birthYear,
        brandId,
        categoryId,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        page,
        limit,
      });
      if (res?.errCode === 0) {
        setProducts(res.data || []);
        setLuckyColors(res.luckyColors || []);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setProducts([]);
        setLuckyColors([]);
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
      setLuckyColors([]);
    } finally {
      setLoading(false);
    }
  }, [birthYear, brandId, categoryId, minPrice, maxPrice, sortBy, page, limit]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleSearch = () => {
    setPage(1);
  };

  // Custom styles for React Select to support dark mode & system colors
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "14px",
      padding: "4px",
      borderColor: state.isFocused ? "#3b82f6" : "transparent",
      backgroundColor: "rgb(249 250 251)", 
      boxShadow: "none",
      "&:hover": { borderColor: "#3b82f6" },
      ".dark &": {
        backgroundColor: "rgb(31 41 55)",
        borderColor: state.isFocused ? "#3b82f6" : "rgb(55 65 81)",
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: "inherit",
      fontWeight: "600",
    }),
    placeholder: (base) => ({
        ...base,
        color: "#94a3b8",
        fontSize: "14px",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "8px",
      border: "1px solid #e2e8f0",
      ".dark &": {
        backgroundColor: "#111827",
        borderColor: "#374151",
      }
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: "8px",
      backgroundColor: state.isFocused ? "#3b82f620" : "transparent",
      color: state.isSelected ? "#3b82f6" : "inherit",
      "&:hover": { backgroundColor: "#3b82f615", color: "#3b82f6" },
    }),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 pb-20 relative">
      
      {/* CHATBOT AI - ĐẶT Ở NGOÀI CÙNG ĐỂ KHÔNG BỊ LỖI HIỂN THỊ */}
      <FengShuiChat setGlobalBirthYear={setBirthYear} />

      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[5%] left-[-5%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-8 md:pt-12">
        {/* HERO HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 select-none pointer-events-none">
                <FiZap size={140} className="text-blue-500" />
            </div>

            <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-all mb-8 font-bold text-[11px] uppercase tracking-[0.2em]"
            >
                <FiArrowLeft size={16} /> Quay lại trang chủ
            </Link>

            <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-blue-500/20">
                    <FiActivity size={12} />
                    AI Phong Thủy v5.0
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                    Khám Phá <span className="text-blue-500">Bản Mệnh</span> <br />
                    <span className="text-slate-400 dark:text-slate-500 font-serif italic font-light">Cho Thiết Bị Công Nghệ</span>
                </h1>
                
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                    Sử dụng trí tuệ nhân tạo để phân tích quẻ mệnh, giúp bạn lựa chọn những thiết bị mang lại sự hanh thông và tài lộc.
                </p>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: FILTERS */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500">
                    <FiFilter size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Bộ lọc tinh chỉnh</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-3 block">
                    Năm sinh của bạn
                  </label>
                  <Select
                    options={yearOptions}
                    value={birthYear ? { value: birthYear, label: birthYear } : null}
                    onChange={(opt) => setBirthYear(opt.value)}
                    placeholder="Chọn năm sinh..."
                    styles={selectStyles}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-3 block">Thương hiệu</label>
                    <select
                      className="w-full h-12 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl px-5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all appearance-none"
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                    >
                      <option value="">Tất cả thương hiệu</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-3 block">Danh mục</label>
                    <select
                      className="w-full h-12 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl px-5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all appearance-none"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Mọi danh mục</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                        type="number"
                        placeholder="Giá từ"
                        className="w-full h-12 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl px-5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Đến giá"
                        className="w-full h-12 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl px-5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full h-14 !rounded-xl text-xs font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 border-none"
                  icon={FiSearch}
                  onClick={handleSearch}
                >
                  TÌM KIẾM SẢN PHẨM
                </Button>
              </div>
            </section>

            {/* INFO CARD - ĐỒNG BỘ MÀU TRẮNG SÁNG */}
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl text-slate-900 dark:text-white relative overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                <FiInfo className="mb-4 text-blue-500" size={24} />
                <h4 className="text-lg font-bold mb-2 uppercase tracking-tight">Mẹo Phong Thủy</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    Màu sắc tương sinh sẽ giúp cân bằng năng lượng và hỗ trợ công việc hiệu quả hơn. Hãy ưu tiên chọn các thiết bị có màu sắc <span className="text-blue-600 dark:text-blue-400 font-bold">Đại Cát</span> để tối ưu tài lộc.
                </p>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="lg:col-span-8 space-y-10">
            {/* ANALYSIS RESULTS BAR */}
            <AnimatePresence>
                {luckyColors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-center gap-8"
                >
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[11px]">
                        <FiActivity size={18} />
                        <span>Màu sắc đại cát:</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {luckyColors.map((c, i) => (
                            <span
                                key={i}
                                className="px-5 py-2 bg-white dark:bg-gray-800 text-slate-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm border-b-4 border-blue-500/20"
                            >
                                {c}
                            </span>
                        ))}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            <div className="min-h-[500px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">
                        Đang truy vấn thiên cơ...
                    </p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 dark:border-gray-800">
                  <FiLayers className="text-5xl text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Chưa có quẻ mệnh
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto font-medium">
                    Hãy nhập năm sinh hoặc trò chuyện với trợ lý AI để nhận gợi ý.
                  </p>
                </div>
              ) : (
                <div className="space-y-16">
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {products.map((p, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={p.id}
                      >
                        <ProductCard
                          product={p}
                          highlightColor={luckyColors.some(color => p.color?.toLowerCase().includes(color.toLowerCase()))}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center pt-10 border-t border-gray-50 dark:border-gray-800">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FortuneProducts;
