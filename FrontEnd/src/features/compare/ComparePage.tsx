import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowLeftRight,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  addToCompare,
  clearCompare,
  hydrateCompareItems,
  MAX_COMPARE_ITEMS,
  removeFromCompare,
  selectCompareItems,
} from "./compareSlice";
import { searchCompareProductsApi } from "./compareApi";
import type { CompareTrayItem } from "./types";
import BenchmarkCharts from "./components/BenchmarkCharts";
import AiVerdictPanel from "./components/AiVerdictPanel";
import CompareSpecMatrix from "./components/CompareSpecMatrix";
import AddCompareDrawer from "./components/AddCompareDrawer";
import { formatCurrency } from "../../utils/format";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../../utils/toastHelper";
import UnifiedSpinner from "../../components/Loading/UnifiedSpinner";
import { EmptyState } from "../../components/UI";
import { useDocumentMeta } from "../shared/hooks/useDocumentMeta";
import { useCompareProductsQuery } from "../shared/queries/catalogQueries";

const parseIdsParam = (raw: string | null): number[] => {
  if (!raw) return [];
  const seen = new Set<number>();
  const ids: number[] = [];
  for (const part of raw.split(",")) {
    const n = Number(part.trim());
    if (Number.isInteger(n) && n > 0 && !seen.has(n)) {
      seen.add(n);
      ids.push(n);
      if (ids.length >= MAX_COMPARE_ITEMS) break;
    }
  }
  return ids;
};

const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const trayItems = useSelector(selectCompareItems);

  const idsParamRaw = searchParams.get("ids");
  const activeIds = useMemo(() => parseIdsParam(idsParamRaw), [idsParamRaw]);

  const {
    data: queryCompareData,
    isLoading: loadingCompare,
    error: compareError,
    refetch: loadComparison,
  } = useCompareProductsQuery(activeIds);

  const compareData = activeIds.length > 0 ? (queryCompareData ?? null) : null;
  const [starterCandidates, setStarterCandidates] = useState<CompareTrayItem[]>(
    [],
  );
  const [loadingStarter, setLoadingStarter] = useState(false);

  const [viewMode, setViewMode] = useState<"all" | "diff-only" | "key-specs">(
    "all",
  );
  const [highlightDiff, setHighlightDiff] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const comparePageTitle = useMemo(() => {
    if (compareData?.products?.length) {
      return `So sánh ${compareData.products.map((p) => p.name).join(" vs ")}`;
    }
    return "So sánh thông số & hiệu năng";
  }, [compareData?.products]);

  useDocumentMeta({
    title: comparePageTitle,
    description:
      "So sánh trực tiếp thông số kỹ thuật, chấm điểm benchmark 5 trục và đánh giá AI cho từng sản phẩm tại TIENTECH Shop.",
    canonicalPath: "/compare",
  });

  // If URL has no ?ids= on landing but Redux tray already holds products, mirror tray to URL
  useEffect(() => {
    if (
      activeIds.length === 0 &&
      idsParamRaw === null &&
      trayItems.length > 0
    ) {
      const nextIds = trayItems
        .slice(0, MAX_COMPARE_ITEMS)
        .map((i) => i.id)
        .join(",");
      setSearchParams({ ids: nextIds }, { replace: true });
    }
  }, [activeIds.length, idsParamRaw, trayItems, setSearchParams]);

  useEffect(() => {
    if (!queryCompareData?.products) return;
    dispatch(
      hydrateCompareItems(
        queryCompareData.products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          image: p.image,
          price: p.displayPrice,
          categoryName: p.category?.name || null,
          brandName: p.brand?.name || null,
        })),
      ),
    );
  }, [queryCompareData, dispatch]);

  useEffect(() => {
    if (compareError) {
      showErrorToast(
        compareError,
        "Lỗi kết nối khi phân tích so sánh sản phẩm.",
      );
    }
  }, [compareError]);

  // Starter products when empty
  useEffect(() => {
    if (activeIds.length > 0) return;
    let active = true;
    const loadStarter = async () => {
      setLoadingStarter(true);
      try {
        const list = await searchCompareProductsApi("");
        if (active) setStarterCandidates(list);
      } catch {
        if (active) setStarterCandidates([]);
      } finally {
        if (active) setLoadingStarter(false);
      }
    };
    loadStarter();
    return () => {
      active = false;
    };
  }, [activeIds.length]);

  const handleAddProduct = (item: CompareTrayItem) => {
    if (activeIds.includes(item.id)) return;
    if (activeIds.length >= MAX_COMPARE_ITEMS) {
      showInfoToast("Chỉ hỗ trợ so sánh tối đa 4 sản phẩm cùng lúc.");
      return;
    }
    const nextIds = [...activeIds, item.id];
    dispatch(addToCompare(item));
    setSearchParams({ ids: nextIds.join(",") });
    showSuccessToast(`Đã thêm "${item.name}" vào bảng so sánh`);
  };

  const handleRemoveProduct = (id: number) => {
    const nextIds = activeIds.filter((x) => x !== id);
    dispatch(removeFromCompare(id));
    if (nextIds.length > 0) {
      setSearchParams({ ids: nextIds.join(",") });
    } else {
      setSearchParams({});
    }
  };

  const handleClearAll = () => {
    dispatch(clearCompare());
    setSearchParams({});
    showInfoToast("Đã xóa toàn bộ sản phẩm so sánh.");
  };

  const handleQuickComparePair = () => {
    if (starterCandidates.length < 2) return;
    const pair = starterCandidates.slice(0, 2);
    dispatch(hydrateCompareItems(pair));
    setSearchParams({ ids: pair.map((p) => p.id).join(",") });
  };

  const products = compareData?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <ArrowLeftRight className="w-4 h-4" />
            <span>TECH COMPARE &amp; BENCHMARK LAB</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight break-words [overflow-wrap:anywhere]">
            So sánh Thông số &amp; Benchmark Hiệu năng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-text-secondary break-words [overflow-wrap:anywhere]">
            Đối chiếu cấu hình chi tiết, chấm điểm 5 trục từ dữ liệu phần cứng
            thực tế và nhận tư vấn AI theo nhu cầu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={activeIds.length >= MAX_COMPARE_ITEMS}
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 h-9 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/15 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              Thêm sản phẩm ({activeIds.length}/{MAX_COMPARE_ITEMS})
            </span>
          </button>
          {activeIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-2 px-4 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa tất cả</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty Starter State */}
      {activeIds.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            icon={ArrowLeftRight}
            title="Chưa có sản phẩm nào trong bảng so sánh"
            description="Chọn tối đa 4 sản phẩm từ cửa hàng hoặc nhấn nút bên dưới để chọn nhanh 2 thiết bị tiêu biểu."
            actionText={
              starterCandidates.length >= 2
                ? "So sánh nhanh 2 sản phẩm đầu bảng"
                : "Chọn sản phẩm đầu tiên"
            }
            onAction={
              starterCandidates.length >= 2
                ? handleQuickComparePair
                : () => setIsDrawerOpen(true)
            }
            secondaryActionText="Xem tất cả sản phẩm"
            onSecondaryAction={() => setIsDrawerOpen(true)}
          />

          <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Gợi ý sản phẩm nổi bật để đối chiếu nhanh
              </h2>
              <Link
                to="/products"
                className="text-xs font-bold text-primary hover:underline shrink-0"
              >
                Khám phá kho hàng →
              </Link>
            </div>

            {loadingStarter ? (
              <div className="flex justify-center py-10">
                <UnifiedSpinner size="md" variant="primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {starterCandidates.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 dark:border-dark-border bg-slate-50/70 dark:bg-dark-bg/50 min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image || "/images/no-image.png"}
                        alt={item.name}
                        className="size-14 rounded-xl object-contain bg-white dark:bg-slate-900 p-1 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 break-words [overflow-wrap:anywhere]">
                          {item.name}
                        </p>
                        <p className="text-xs font-extrabold text-primary mt-1">
                          {formatCurrency(item.price || 0)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddProduct(item)}
                      className="w-full py-2 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border hover:border-primary text-xs font-bold text-primary transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chọn so sánh</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : loadingCompare ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-3xl">
          <UnifiedSpinner size="lg" variant="primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Đang tổng hợp thông số &amp; tính toán benchmark...
          </p>
        </div>
      ) : compareData && products.length > 0 ? (
        <>
          {compareData.categoryMismatchWarning && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                {compareData.categoryMismatchWarning}
              </span>
            </div>
          )}

          {/* Compared Product Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="relative bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-3xl p-4 flex flex-col justify-between gap-3 shadow-xs min-w-0"
              >
                <button
                  type="button"
                  aria-label={`Bỏ ${prod.name} khỏi bảng so sánh`}
                  onClick={() => handleRemoveProduct(prod.id)}
                  className="absolute top-3 right-3 size-7 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-3 min-w-0">
                  <div className="h-36 rounded-2xl bg-slate-50 dark:bg-dark-bg/70 p-3 flex items-center justify-center">
                    <img
                      src={prod.image || "/images/no-image.png"}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {prod.brand?.name && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-bg text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {prod.brand.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                        <Sparkles className="w-3 h-3" />
                        {prod.benchmark?.overallScore || 0}/100 điểm
                      </span>
                    </div>

                    <Link
                      to={`/product-detail/${prod.slug || prod.id}`}
                      className="block text-sm font-black text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-2 break-words [overflow-wrap:anywhere]"
                    >
                      {prod.name}
                    </Link>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-sm font-black text-primary">
                        {formatCurrency(prod.displayPrice)}
                      </span>
                      {prod.reviewCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          {prod.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {products.length < MAX_COMPARE_ITEMS && (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="min-h-[240px] rounded-3xl border-2 border-dashed border-slate-200 dark:border-dark-border hover:border-primary/60 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-primary transition-colors p-6 cursor-pointer"
              >
                <div className="size-11 rounded-2xl bg-slate-100 dark:bg-dark-bg flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">
                  Thêm sản phẩm đối chiếu
                </span>
              </button>
            )}
          </div>

          {/* 5-Axis Performance Benchmark */}
          <BenchmarkCharts products={products} winners={compareData.winners} />

          {/* AI Verdict Panel (only when >= 2 products) */}
          {products.length >= 2 && (
            <AiVerdictPanel
              productIds={products.map((p) => p.id)}
              products={products}
            />
          )}

          {/* Matrix Filter Controls */}
          <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-dark-bg p-1 rounded-xl">
              {[
                { key: "all", label: "Tất cả thông số" },
                { key: "diff-only", label: "Chỉ điểm khác biệt" },
                { key: "key-specs", label: "Thông số cốt lõi" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() =>
                    setViewMode(tab.key as "all" | "diff-only" | "key-specs")
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === tab.key
                      ? "bg-white dark:bg-dark-surface text-primary shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={highlightDiff}
                  onChange={(e) => setHighlightDiff(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span>Làm nổi bật điểm khác biệt</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  void loadComparison();
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Spec Comparison Matrix */}
          <CompareSpecMatrix
            products={products}
            matrix={compareData.matrix}
            viewMode={viewMode}
            highlightDiff={highlightDiff}
          />
        </>
      ) : null}

      <AddCompareDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        existingIds={activeIds}
        maxReached={activeIds.length >= MAX_COMPARE_ITEMS}
        onSelectProduct={handleAddProduct}
      />
    </div>
  );
};

export default ComparePage;
