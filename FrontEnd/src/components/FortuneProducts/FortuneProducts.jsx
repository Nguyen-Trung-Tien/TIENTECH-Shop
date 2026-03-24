import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSearch,
  FiLayers,
  FiCpu,
  FiFilter,
  FiActivity,
} from "react-icons/fi";
import { fetchFortuneProducts } from "../../api/productApi";
import { getAllBrandApi } from "../../api/brandApi";
import { getAllCategoryApi } from "../../api/categoryApi";
import ProductCard from "../ProductCard/ProductCard";
import FengShuiChat from "../ChatBot/FengShui";
import AppPagination from "../Pagination/Pagination";
import { motion } from "framer-motion";
import Button from "../UI/Button";
import Badge from "../UI/Badge";

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

  const handleSearch = () => setPage(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container-custom">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-800 shadow-soft mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -z-0"></div>
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-6 font-bold text-[11px] uppercase tracking-widest"
            >
              <FiArrowLeft size={16} /> Quay lại trang chủ
            </Link>
            <h1 className="text-2xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              🔮 Gợi ý <span className="text-primary italic">Phong Thủy</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl font-medium leading-relaxed">
              Khám phá những thiết bị công nghệ phù hợp với bản mệnh và năm sinh
              của bạn để thu hút năng lượng tích cực và sự hanh thông trong công
              việc.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: AI & FILTERS */}
          <div className="lg:col-span-4 space-y-8">
            {/* AI ASSISTANT */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-xl border border-slate-200 dark:border-gray-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px]"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-white/10 rounded-xl flex items-center justify-center text-primary dark:text-white">
                    <FiCpu size={20} />
                  </div>

                  <h3 className="text-lg font-display font-bold uppercase tracking-tight">
                    Trợ lý Phong thủy AI
                  </h3>
                </div>

                <FengShuiChat setBirthYear={setBirthYear} />
              </div>
            </div>

            {/* FILTERS */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-slate-200 dark:border-dark-border shadow-soft space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <FiFilter className="text-primary" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  Bộ lọc bản mệnh
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                    Năm sinh của bạn
                  </label>
                  <Select
                    options={yearOptions}
                    value={
                      birthYear ? { value: birthYear, label: birthYear } : null
                    }
                    onChange={(opt) => setBirthYear(opt.value)}
                    placeholder="Chọn năm sinh..."
                    className="text-sm font-medium"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "12px",
                        padding: "2px",
                        borderColor: "#e5e7eb",
                        backgroundColor: "transparent",
                        "&:hover": { borderColor: "#2563eb" },
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "inherit",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "var(--bg-card)",
                        borderRadius: "12px",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? "var(--color-primary-light)"
                          : "transparent",
                        color: state.isFocused ? "white" : "inherit",
                      }),
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                      Thương hiệu
                    </label>
                    <select
                      className="w-full h-11 bg-gray-50 dark:bg-gray-800 border border-slate-200 dark:border-dark-border rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                    >
                      <option value="">Tất cả thương hiệu</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                      Danh mục
                    </label>
                    <select
                      className="w-full h-11 bg-gray-50 dark:bg-gray-800 border border-slate-200 dark:border-dark-border rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                      Giá từ
                    </label>
                    <input
                      type="number"
                      placeholder="₫ VNĐ"
                      className="w-full h-11 bg-gray-50 dark:bg-gray-800 border border-slate-200 dark:border-dark-border rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                      Đến
                    </label>
                    <input
                      type="number"
                      placeholder="₫ VNĐ"
                      className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full h-12 !rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                  icon={FiSearch}
                  onClick={handleSearch}
                >
                  TÌM KIẾM
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="lg:col-span-8 space-y-8">
            {/* LUCKY COLORS DISPLAY */}
            {luckyColors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm flex flex-wrap items-center gap-4"
              >
                <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                  <FiActivity className="text-amber-500" />
                  <span>Màu sắc may mắn:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {luckyColors.map((c, i) => (
                    <span
                      key={i}
                      className="px-4 py-1 bg-primary/10 text-primary dark:text-primary-light border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PRODUCT GRID */}
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    Phân tích phong thủy...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-20 text-center border-2 border-dashed border-slate-200 dark:border-dark-border">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiLayers className="text-2xl text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Chưa tìm thấy sản phẩm
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Vui lòng nhập năm sinh hoặc điều chỉnh bộ lọc để nhận gợi ý.
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        highlightColor={luckyColors.includes(p.color)}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center">
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
