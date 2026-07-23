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
import { LazyMotion, domAnimation } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  deleteProductApi,
  getOneProductApi,
  filterProductsApi,
} from "../../../api/productApi";
import { getAllCategoryApi } from "../../../api/categoryApi";
import { getAllBrandApi } from "../../../api/brandApi";
import { getAllAttributesApi } from "../../../api/attributeApi";
import { syncEmbeddings } from "../../../api/adminApi";

import AppPagination from "../../../components/Pagination/Pagination";
import { ConfirmModal } from "../../../components/UI/Modal";

import { useProductForm } from "./hooks/useProductForm";
import ProductFilterBar from "./components/ProductFilterBar";
import ProductTable from "./components/ProductTable";
import ProductFormModal from "./components/ProductFormModal";

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

  // Delete confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    productId: null,
    name: "",
  });

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
            Object.entries(attrFilters).map(([k, v]) => [k, v.join(",")])
          ),
        });

        if (res?.errCode === 0) {
          setProducts(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setPage(currentPage);
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi tải dữ liệu sản phẩm");
      } finally {
        setLoadingTable(false);
      }
    },
    [searchTerm, filterCategories, filterBrands, flashSaleOnly, attrFilters]
  );

  // Custom hook for managing the product form state & API submit
  const formHook = useProductForm({
    editProduct,
    editId,
    onSuccess: () => fetchProducts(page),
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
    [initFormWithProduct]
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
        if (catRes?.errCode === 0) setCategories(catRes.data || catRes.categories || []);
        if (brandRes?.errCode === 0) setBrands(brandRes.brands || brandRes.data || []);
        if (attrRes?.errCode === 0) setAttributes(attrRes.data || attrRes.attributes || []);
      } catch (err) {
        console.error("Error fetching admin metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Filter toggles
  const onToggleCategory = useCallback((val) => {
    setFilterCategories((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  }, []);

  const onToggleBrand = useCallback((val) => {
    setFilterBrands((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
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

  const clearFilters = () => {
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
  };

  // Delete product action
  const handleConfirmDelete = async () => {
    try {
      const res = await deleteProductApi(confirmModal.productId);
      if (res?.errCode === 0) {
        toast.success("Đã xóa sản phẩm khỏi hệ thống!");
        fetchProducts(page);
      } else {
        toast.error(res?.errMessage || "Xóa sản phẩm thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối server khi xóa");
    } finally {
      setConfirmModal({ show: false, productId: null, name: "" });
    }
  };

  // Sync AI Vector Embeddings
  const handleSyncAI = async () => {
    setIsSyncingAI(true);
    try {
      const res = await syncEmbeddings();
      if (res?.errCode === 0) {
        toast.success(res.message || "Đồng bộ dữ liệu AI Vector thành công! ✨");
        fetchProducts(page);
      } else {
        toast.error(res?.errMessage || "Đồng bộ thất bại");
      }
    } catch (error) {
      console.error("Sync AI error:", error);
      toast.error("Lỗi khi đồng bộ dữ liệu Vector AI");
    } finally {
      setIsSyncingAI(false);
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
    <LazyMotion features={domAnimation}>
      <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <FiBox className="text-2xl" />
              </div>
              Quản lý Sản phẩm Kho hàng
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-text-secondary font-medium mt-1">
              Hệ thống tạo & phân loại sản phẩm siêu tốc tích hợp Trợ lý AI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSyncAI}
              disabled={isSyncingAI}
              className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:text-indigo-600 font-black uppercase tracking-wider text-[11px] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <FiCpu className={isSyncingAI ? "animate-spin text-indigo-600" : ""} />
              {isSyncingAI ? "Đang đồng bộ..." : "Đồng bộ AI Vector"}
            </button>

            <button
              type="button"
              onClick={() => handleShowModal()}
              className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all cursor-pointer group"
            >
              <FiPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
              <span>Đăng sản phẩm mới</span>
            </button>
          </div>
        </div>

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
          iconClassName="bg-rose-50 text-rose-500"
        />
      </div>
    </LazyMotion>
  );
};

export default ProductManage;
