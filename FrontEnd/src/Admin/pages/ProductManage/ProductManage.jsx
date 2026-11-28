import React, { useState, useEffect, useCallback } from "react";
import {
  FiBox,
  FiPlus,
  FiCpu,
  FiLayers,
  FiZap,
  FiMonitor,
  FiBattery,
  FiSettings,
  FiTag,
  FiTrash2,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../../../utils/toastHelper";

import {
  deleteProductApi,
  getOneProductApi,
  filterProductsApi,
} from "../../../api/productApi";
import { getAllCategoryApi } from "../../../api/categoryApi";
import { getAllBrandApi } from "../../../api/brandApi";
import { getAllAttributesApi } from "../../../api/attributeApi";
import {
  syncEmbeddings,
  getVectorStatusApi,
  reloadVectorIndexApi,
} from "../../../api/adminApi";
import { getSocket } from "../../../utils/socket";

import AppPagination from "../../../components/Pagination/Pagination";
import { ConfirmModal } from "../../../components/UI/Modal";

import { useProductForm } from "./hooks/useProductForm";
import ProductFilterBar from "./components/ProductFilterBar";
import ProductTable from "./components/ProductTable";
import ProductFormModal from "./components/ProductFormModal";
import AdminPageShell from "../../components/AdminPageShell";

const ProductManage = () => {
  const { id: editId } = useParams();
  const navigate = useNavigate();

  // Data states
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);

  // Modal display states
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterBrands, setFilterBrands] = useState([]);
  const [flashSaleOnly, setFlashSaleOnly] = useState(false);
  const [attrFilters, setAttrFilters] = useState({
    ram: [],
    rom: [],
    os: [],
    refresh_rate: [],
  });

  // Table pagination & loading state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [loadingTable, setLoadingTable] = useState(false);
  const [isSyncingAI, setIsSyncingAI] = useState(false);
  const [vectorStatus, setVectorStatus] = useState(null);
  const [syncProgress, setSyncProgress] = useState(null);

  // Delete confirm modal state
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    productId: null,
    name: "",
  });

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterCategories([]);
    setFilterBrands([]);
    setFlashSaleOnly(false);
    setAttrFilters({
      ram: [],
      rom: [],
      os: [],
      refresh_rate: [],
    });
  }, []);

  // Fetch product list with filters
  const fetchProducts = useCallback(
    async (currentPage = 1) => {
      setLoadingTable(true);
      try {
        const res = await filterProductsApi({
          page: currentPage,
          limit,
          search: searchTerm.trim(),
          categoryId: filterCategories.join(","),
          brandId: filterBrands.join(","),
          isFlashSale: flashSaleOnly,
          isAdmin: true,
          ...Object.fromEntries(
            Object.entries(attrFilters).map(([k, v]) => [k, v.join(",")]),
          ),
        });

        if (res?.errCode === 0) {
          setProducts(res.data || res.products || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setPage(currentPage);
        } else {
          showErrorToast(res?.errMessage, "Lỗi khi tải dữ liệu sản phẩm");
        }
      } catch (err) {
        console.error(err);
        showErrorToast(err, "Lỗi khi tải dữ liệu sản phẩm");
      } finally {
        setLoadingTable(false);
      }
    },
    [searchTerm, filterCategories, filterBrands, flashSaleOnly, attrFilters],
  );

  // Custom hook for managing the product form state & API submit
  const formHook = useProductForm({
    editProduct,
    editId,
    onSuccess: () => {
      if (!editProduct) {
        clearFilters();
      }
      fetchProducts(editProduct ? page : 1);
    },
    onClose: () => handleCloseModal(),
  });

  const { initFormWithProduct, resetForm } = formHook;

  // Open modal handler
  const handleShowModal = useCallback(
    async (product = null) => {
      if (product?.id) {
        try {
          const res = await getOneProductApi(product.id);
          if (res?.errCode === 0 && res.product) {
            setEditProduct(res.product);
            initFormWithProduct(res.product);
          } else {
            setEditProduct(product);
            initFormWithProduct(product);
          }
        } catch (err) {
          console.error("Fetch full edit product error:", err);
          setEditProduct(product);
          initFormWithProduct(product);
        }
      } else {
        setEditProduct(null);
        initFormWithProduct(null);
      }
      setShowModal(true);
    },
    [initFormWithProduct],
  );

  // Close modal handler
  const handleCloseModal = () => {
    setShowModal(false);
    setEditProduct(null);
    resetForm?.();
    if (editId) {
      navigate("/admin/products");
    }
  };

  // Check URL params for editId
  useEffect(() => {
    if (editId) {
      const fetchEditProduct = async () => {
        try {
          const res = await getOneProductApi(editId);
          if (res?.errCode === 0) {
            handleShowModal(res.product);
          }
        } catch (err) {
          console.error("Fetch edit product error:", err);
        }
      };
      fetchEditProduct();
    }
  }, [editId, handleShowModal]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Initial metadata fetch (Categories, Brands, Attributes)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes, attrRes] = await Promise.all([
          getAllCategoryApi(),
          getAllBrandApi(),
          getAllAttributesApi(),
        ]);
        if (catRes?.errCode === 0)
          setCategories(catRes.data || catRes.categories || []);
        if (brandRes?.errCode === 0)
          setBrands(brandRes.brands || brandRes.data || []);
        if (attrRes?.errCode === 0)
          setAttributes(attrRes.data || attrRes.attributes || []);
      } catch (err) {
        console.error("Error fetching admin metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Filter toggles
  const onToggleCategory = useCallback((val) => {
    setFilterCategories((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val],
    );
  }, []);

  const onToggleBrand = useCallback((val) => {
    setFilterBrands((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val],
    );
  }, []);

  const onToggleAttrFilter = useCallback((code, value) => {
    setAttrFilters((prev) => {
      const current = prev[code] || [];
      return {
        ...prev,
        [code]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }, []);

  // Delete product action
  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await deleteProductApi(confirmModal.productId);
      if (res?.errCode === 0) {
        showSuccessToast("Đã xóa sản phẩm khỏi hệ thống!");
        fetchProducts(page);
      } else {
        showErrorToast(res?.errMessage, "Xóa sản phẩm thất bại");
      }
    } catch (err) {
      console.error(err);
      showErrorToast(err, "Lỗi kết nối máy chủ khi xóa");
    } finally {
      setIsDeleting(false);
      setConfirmModal({ show: false, productId: null, name: "" });
    }
  };

  const fetchVectorStatus = useCallback(async () => {
    try {
      const res = await getVectorStatusApi();
      if (res?.errCode === 0 && res.data) {
        setVectorStatus(res.data);
        if (res.data.job?.running) {
          setSyncProgress(res.data.job);
          setIsSyncingAI(true);
        }
      }
    } catch {
      // Non-blocking vector status poll
    }
  }, []);

  useEffect(() => {
    fetchVectorStatus();
    const sock = getSocket();
    const handleProgress = (payload) => {
      if (!payload) return;
      setSyncProgress(payload);
      setIsSyncingAI(Boolean(payload.running));
      if (!payload.running && payload.finishedAt) {
        fetchVectorStatus();
      }
    };
    sock.on("vector_sync_progress", handleProgress);
    return () => {
      sock.off("vector_sync_progress", handleProgress);
    };
  }, [fetchVectorStatus]);

  // Sync AI Vector Embeddings
  const handleSyncAI = async (mode = "missing") => {
    setIsSyncingAI(true);
    try {
      const res = await syncEmbeddings(mode);
      if (res?.errCode === 0) {
        showSuccessToast(
          res.message,
          "Đồng bộ dữ liệu AI Vector thành công!",
        );
        fetchProducts(page);
        fetchVectorStatus();
      } else {
        showErrorToast(res?.errMessage, "Đồng bộ thất bại");
      }
    } catch (error) {
      console.error("Sync AI error:", error);
      showErrorToast(error, "Lỗi khi đồng bộ dữ liệu Vector AI");
    } finally {
      setIsSyncingAI(false);
    }
  };

  const handleReloadVector = async () => {
    try {
      const res = await reloadVectorIndexApi();
      if (res?.errCode === 0) {
        showSuccessToast(res.errMessage || "Đã nạp lại AI Vector vào RAM!");
        fetchVectorStatus();
      } else {
        showErrorToast(res?.errMessage || "Không thể nạp lại Vector Index");
      }
    } catch (error) {
      showErrorToast(error, "Lỗi khi nạp lại AI Vector Index");
    }
  };

  const getAttrIcon = (code) => {
    switch (code) {
      case "cpu":
        return <FiCpu />;
      case "ram":
        return <FiLayers />;
      case "rom":
        return <FiBox />;
      case "os":
        return <FiSettings />;
      case "screen":
        return <FiMonitor />;
      case "refresh_rate":
        return <FiZap />;
      case "battery":
        return <FiBattery />;
      default:
        return <FiTag />;
    }
  };

  return (
    <AdminPageShell
      title={
        <span className="flex items-center gap-2.5">
          <span className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs shrink-0">
            <FiBox />
          </span>
          <span>Quản lý Sản phẩm Kho hàng</span>
        </span>
      }
      subtitle="Hệ thống tạo & phân loại sản phẩm siêu tốc tích hợp Trợ lý AI."
      actions={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSyncAI("missing")}
            disabled={isSyncingAI}
            className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:text-primary font-black uppercase tracking-wider text-[11px] transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <FiCpu className={isSyncingAI ? "animate-spin text-primary" : ""} />
            <span>{isSyncingAI ? "Đang đồng bộ..." : "Đồng bộ thiếu/cũ"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSyncAI("all")}
            disabled={isSyncingAI}
            className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:text-amber-600 font-black uppercase tracking-wider text-[11px] transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <FiZap />
            <span>Rebuild toàn bộ</span>
          </button>

          <button
            type="button"
            onClick={() => handleShowModal()}
            className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-wider text-xs shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer group"
          >
            <FiPlus className="text-base group-hover:rotate-90 transition-transform duration-300" />
            <span>Đăng sản phẩm mới</span>
          </button>
        </div>
      }
      className="pb-16"
    >
        {/* AI Vector Ops Status Bar */}
        {vectorStatus && (
          <div className="mb-4 rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white/90 dark:bg-dark-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <FiCpu /> AI Vector Index ({vectorStatus.model})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono">
                  DB: {vectorStatus.counts?.ready || 0}/{vectorStatus.totalActiveProducts || 0} ({vectorStatus.coveragePct || 0}%)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-mono">
                  RAM: {vectorStatus.indexStats?.inMemoryCount || 0} vectors ({vectorStatus.dimensions || 768}d)
                </span>
                {vectorStatus.counts?.failed > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-mono">
                    Lỗi: {vectorStatus.counts.failed}
                  </span>
                )}
              </div>
              {syncProgress?.running && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 break-words [overflow-wrap:anywhere]">
                  Tiến trình đồng bộ ({syncProgress.mode}): {syncProgress.processed}/{syncProgress.total} SP — Thành công: {syncProgress.succeeded}, Bỏ qua: {syncProgress.skipped}, Lỗi: {syncProgress.failed}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleReloadVector}
              className="shrink-0 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-600 dark:text-dark-text-secondary hover:text-primary hover:bg-slate-50 dark:hover:bg-dark-bg transition cursor-pointer"
            >
              Nạp lại RAM
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <ProductFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategories={filterCategories}
          onToggleCategory={onToggleCategory}
          filterBrands={filterBrands}
          onToggleBrand={onToggleBrand}
          categories={categories}
          brands={brands}
          attributes={attributes}
          attrFilters={attrFilters}
          onToggleAttrFilter={onToggleAttrFilter}
          flashSaleOnly={flashSaleOnly}
          setFlashSaleOnly={setFlashSaleOnly}
          clearFilters={clearFilters}
          fetchProducts={fetchProducts}
          loadingTable={loadingTable}
          getAttrIcon={getAttrIcon}
        />

        {/* Products Data Table */}
        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-dark-border overflow-hidden">
          <ProductTable
            products={products}
            loadingTable={loadingTable}
            limit={limit}
            handleShowModal={handleShowModal}
            setConfirmModal={setConfirmModal}
          />

          <div className="p-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/30 dark:bg-dark-bg/30">
            <AppPagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => fetchProducts(p)}
            />
          </div>
        </div>

        {/* Product Creation / Edit Modal */}
        <ProductFormModal
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          editProduct={editProduct}
          formHook={formHook}
          categories={categories}
          brands={brands}
          attributes={attributes}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.show}
          onClose={() =>
            setConfirmModal({ show: false, productId: null, name: "" })
          }
          onConfirm={handleConfirmDelete}
          title="Xác nhận xóa sản phẩm?"
          message={`Bạn có chắc chắn muốn xóa "${confirmModal.name}"? Hành động này sẽ loại bỏ sản phẩm khỏi cửa hàng.`}
          confirmText="Xóa sản phẩm"
          variant="danger"
          icon={FiTrash2}
          loading={isDeleting}
          iconClassName="bg-rose-50 text-rose-500"
        />
      </AdminPageShell>
  );
};

export default ProductManage;
