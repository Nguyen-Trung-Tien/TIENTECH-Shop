import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchFortuneProducts } from "../../api/productApi";
import { getFengShuiDetailApi } from "../../api/chatApi";
import FengShuiChat from "../ChatBot/FengShui";
import { useDocumentMeta } from "../../features/shared/hooks/useDocumentMeta";
import {
  useBrandsQuery,
  useCategoriesQuery,
} from "../../features/shared/queries/catalogQueries";
import { getBirthYearOptions } from "./components/fortuneConstants";
import FortuneHeroBanner from "./components/FortuneHeroBanner";
import FortuneElementConsole from "./components/FortuneElementConsole";
import FortuneFilterSidebar from "./components/FortuneFilterSidebar";
import FortuneResultsGrid from "./components/FortuneResultsGrid";

const FortuneProducts = () => {
  useDocumentMeta({
    title: "Tư vấn Phong Thủy Công Nghệ",
    description:
      "Chọn màu sắc thiết bị công nghệ hợp bản mệnh Ngũ Hành và cá tính cùng trợ lý AI TIENTECH.",
    canonicalPath: "/fortune",
  });

  const [birthYear, setBirthYear] = useState(1998);
  const [gender, setGender] = useState("male");
  const [fsDetail, setFsDetail] = useState(null);
  const [allElements, setAllElements] = useState([]);
  const [loadingFengShui, setLoadingFengShui] = useState(false);

  const { data: brands = [] } = useBrandsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const [products, setProducts] = useState([]);
  const [luckyColors, setLuckyColors] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const fetchProducts = useCallback(async () => {
    if (!birthYear) return;
    setLoading(true);
    try {
      const res = await fetchFortuneProducts({
        birthYear,
        gender,
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
              (b.displayPrice || b.basePrice || 0),
          );
        } else if (sortBy === "price_desc") {
          list = [...list].sort(
            (a, b) =>
              (b.displayPrice || b.basePrice || 0) -
              (a.displayPrice || a.basePrice || 0),
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
  }, [birthYear, gender, brandId, categoryId, minPrice, maxPrice, sortBy, page, limit]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const yearOptions = useMemo(() => getBirthYearOptions(80), []);

  const resetFilters = useCallback(() => {
    setBrandId("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("popular");
    setPage(1);
  }, []);

  const handleGlobalYearChange = useCallback((newYear) => {
    if (newYear) {
      setBirthYear(Number(newYear));
      setPage(1);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-24 relative overflow-x-hidden">
      <FengShuiChat setGlobalBirthYear={handleGlobalYearChange} />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[15%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-gradient-to-tr from-amber-500/10 to-rose-500/10 dark:from-amber-500/15 dark:to-purple-500/15 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 md:pt-10">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs"
          >
            <ArrowLeft className="size-4" /> Quay lại trang chủ
          </Link>
        </div>

        <FortuneHeroBanner
          allElements={allElements}
          activeElement={fsDetail?.element}
        />

        <FortuneElementConsole
          birthYear={birthYear}
          onBirthYearChange={(yr) => {
            setBirthYear(yr);
            setPage(1);
          }}
          yearOptions={yearOptions}
          gender={gender}
          onGenderChange={setGender}
          loadingFengShui={loadingFengShui}
          fsDetail={fsDetail}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <FortuneFilterSidebar
            brands={brands}
            categories={categories}
            brandId={brandId}
            categoryId={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortBy={sortBy}
            onBrandChange={(val) => {
              setBrandId(val);
              setPage(1);
            }}
            onCategoryChange={(val) => {
              setCategoryId(val);
              setPage(1);
            }}
            onMinPriceChange={(val) => {
              setMinPrice(val);
              setPage(1);
            }}
            onMaxPriceChange={(val) => {
              setMaxPrice(val);
              setPage(1);
            }}
            onResetFilters={resetFilters}
          />

          <FortuneResultsGrid
            products={products}
            luckyColors={luckyColors}
            totalItems={totalItems}
            fsElement={fsDetail?.element}
            sortBy={sortBy}
            onSortChange={(val) => {
              setSortBy(val);
              setPage(1);
            }}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onResetFilters={resetFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default FortuneProducts;
