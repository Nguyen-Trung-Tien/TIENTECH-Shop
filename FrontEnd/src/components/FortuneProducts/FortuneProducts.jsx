import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiLayers, FiCpu, FiFilter, FiActivity } from "react-icons/fi";
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
    <div className="min-h-screen bg-surface-50 py-12">
      <div className="container-custom">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-white rounded-[3rem] p-8 md:p-12 border border-surface-200 shadow-soft mb-10">
           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -z-0"></div>
           <div className="relative z-10">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-surface-400 hover:text-primary transition-colors mb-6 font-bold text-[13px] uppercase tracking-widest"
              >
                <FiArrowLeft size={18} /> Quay lại trang chủ
              </Link>
              <h1 className="text-3xl md:text-5xl font-display font-black text-surface-900 mb-4 tracking-tight">
                🔮 Gợi ý <span className="text-primary italic">Phong Thủy</span>
              </h1>
              <p className="text-surface-500 text-lg max-w-2xl font-medium leading-relaxed">
                Khám phá những thiết bị công nghệ phù hợp với bản mệnh và năm sinh của bạn để thu hút năng lượng tích cực và sự hanh thông trong công việc.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: AI & FILTERS */}
          <div className="lg:col-span-4 space-y-8">
            {/* AI ASSISTANT */}
            <div className="bg-surface-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -z-0"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                      <FiCpu size={20} />
                    </div>
                    <h3 className="text-lg font-display font-bold">Trợ lý Phong thủy AI</h3>
                  </div>
                  <FengShuiChat setBirthYear={setBirthYear} />
               </div>
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-surface-200 shadow-soft space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <FiFilter className="text-primary" />
                  <h3 className="text-lg font-bold text-surface-900 uppercase tracking-tight">Bộ lọc bản mệnh</h3>
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-2 block ml-1">Năm sinh của bạn</label>
                    <Select
                      options={yearOptions}
                      value={birthYear ? { value: birthYear, label: birthYear } : null}
                      onChange={(opt) => setBirthYear(opt.value)}
                      placeholder="Chọn năm sinh..."
                      className="text-sm font-medium"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: '16px',
                          padding: '4px',
                          borderColor: '#e5e7eb',
                          '&:hover': { borderColor: '#0071e3' }
                        })
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-2 block ml-1">Thương hiệu</label>
                      <select 
                        className="w-full h-12 bg-surface-50 border border-surface-200 rounded-2xl px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                        value={brandId}
                        onChange={(e) => setBrandId(e.target.value)}
                      >
                        <option value="">Tất cả thương hiệu</option>
                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-2 block ml-1">Danh mục</label>
                      <select 
                        className="w-full h-12 bg-surface-50 border border-surface-200 rounded-2xl px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                      >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-2 block ml-1">Giá từ</label>
                      <input 
                        type="number"
                        placeholder="₫ VNĐ"
                        className="w-full h-12 bg-surface-50 border border-surface-200 rounded-2xl px-4 text-sm font-bold outline-none focus:border-primary transition-all"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-2 block ml-1">Đến</label>
                      <input 
                        type="number"
                        placeholder="₫ VNĐ"
                        className="w-full h-12 bg-surface-50 border border-surface-200 rounded-2xl px-4 text-sm font-bold outline-none focus:border-primary transition-all"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full h-14 !rounded-2xl text-base shadow-lg shadow-primary/20" 
                    icon={FiSearch}
                    onClick={handleSearch}
                  >
                    TÌM SẢN PHẨM HỢP MỆNH
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
                className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm flex flex-wrap items-center gap-4"
              >
                <div className="flex items-center gap-2 text-surface-400 font-black uppercase tracking-widest text-[11px]">
                   <FiActivity className="text-amber-500" />
                   <span>Màu sắc mang lại may mắn:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {luckyColors.map((c, i) => (
                    <span key={i} className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-black uppercase tracking-widest">
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
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-surface-400 font-bold uppercase tracking-widest text-[11px]">Đang phân tích phong thủy...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-surface-200">
                   <div className="w-20 h-20 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FiLayers className="text-3xl text-surface-200" />
                   </div>
                   <h3 className="text-xl font-bold text-surface-900 mb-2">Chưa tìm thấy sản phẩm</h3>
                   <p className="text-surface-500">Vui lòng nhập năm sinh hoặc điều chỉnh bộ lọc để nhận gợi ý.</p>
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
