import React, { useState, useEffect, useCallback } from "react";
import {
  FiBox,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiTag,
  FiDollarSign,
  FiPercent,
  FiCheckCircle,
  FiLayers,
  FiX,
  FiPackage,
  FiUploadCloud,
  FiZap,
  FiChevronDown,
  FiCpu,
  FiMonitor,
  FiBattery,
  FiSmartphone,
  FiSettings,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";

import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createProductApi,
  deleteProductApi,
  updateProductApi,
  getOneProductApi,
  filterProductsApi,
} from "../../../api/productApi";
import { getVariantsByProduct } from "../../../api/variantApi";
import { getAllCategoryApi } from "../../../api/categoryApi";
import { getAllBrandApi } from "../../../api/brandApi";
import { getAllAttributesApi } from "../../../api/attributeApi";
import { syncEmbeddings } from "../../../api/adminApi";
import {
  AdminTableSkeleton,
  AdminActionLoader,
} from "../../components/AdminLoading";
import AppPagination from "../../../components/Pagination/Pagination";
import VariantManager from "./VariantManager";
import MultiSelectDropdown from "./components/MultiSelectDropdown";
import { ConfirmModal } from "../../../components/UI/Modal";

const ProductManage = () => {
  const { id: editId } = useParams();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);

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

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    discount: "0",
    stock: "0",
    categoryId: "",
    brandId: "",
    isActive: true,
    hasVariants: false,
    isFlashSale: false,
    flashSalePrice: "",
    flashSaleStart: "",
    flashSaleEnd: "",
    attributes: {}, // For new Attributes system
    variants: [],
    imageFile: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [loadingTable, setLoadingTable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSyncingAI, setIsSyncingAI] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    productId: null,
    name: "",
  });

  const [modalTab, setModalTab] = useState("basic"); // basic, attributes, variants, flashsale

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

  // Fetch Products with all filters
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

        if (res.errCode === 0) {
          setProducts(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setPage(currentPage);
        }
      } catch {
        toast.error("Lỗi tải dữ liệu sản phẩm");
      } finally {
        setLoadingTable(false);
      }
    },
    [searchTerm, filterCategories, filterBrands, flashSaleOnly, attrFilters],
  );

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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, brandRes, attrRes] = await Promise.all([
        getAllCategoryApi(),
        getAllBrandApi(),
        getAllAttributesApi(),
      ]);
      if (catRes.errCode === 0) setCategories(catRes.data || []);
      if (brandRes.errCode === 0) setBrands(brandRes.brands || []);
      if (attrRes.errCode === 0) setAttributes(attrRes.data || []);
    };
    fetchData();
  }, []);

  const handleShowModal = useCallback((product = null) => {
    if (product) {
      // Map attributes from product junction table
      const productAttrs = {};
      if (product.attributes && Array.isArray(product.attributes)) {
        product.attributes.forEach((attrVal) => {
          if (attrVal.attribute) {
            productAttrs[attrVal.attribute.code] = attrVal.value;
          }
        });
      }

      // Also merge from legacy specifications JSON field if it exists
      let legacySpecs = product.specifications || {};
      if (typeof legacySpecs === "string") {
        try {
          legacySpecs = JSON.parse(legacySpecs);
        } catch {
          legacySpecs = {};
        }
      }

      // Merge: priority to junction table attributes, then legacy specs
      const mergedAttrs = { ...legacySpecs, ...productAttrs };

      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        price: product.basePrice || product.price || "",
        discount: product.discount || "0",
        stock: product.totalStock || product.stock || "0",
        categoryId: product.categoryId || "",
        brandId: product.brandId || "",
        isActive: product.isActive ?? true,
        hasVariants: product.hasVariants ?? false,
        isFlashSale: product.isFlashSale ?? false,
        flashSalePrice: product.flashSalePrice || "",
        flashSaleStart: product.flashSaleStart
          ? new Date(product.flashSaleStart).toISOString().slice(0, 16)
          : "",
        flashSaleEnd: product.flashSaleEnd
          ? new Date(product.flashSaleEnd).toISOString().slice(0, 16)
          : "",
        attributes: mergedAttrs,
        specifications: legacySpecs,
        imageFile: null,
      });
      setImagePreview(product.image || null);
      setGalleryPreviews(product.images?.map((img) => img.imageUrl) || []);
      setGalleryFiles([]);
      setDeletedImages([]);
      setEditProduct(product);
      fetchVariants(product.id);
    } else {
      setFormData({
        name: "",
        sku: "",
        description: "",
        price: "",
        discount: "0",
        stock: "0",
        categoryId: "",
        brandId: "",
        isActive: true,
        hasVariants: false,
        isFlashSale: false,
        flashSalePrice: "",
        flashSaleStart: "",
        flashSaleEnd: "",
        attributes: {},
        imageFile: null,
      });
      setImagePreview(null);
      setGalleryPreviews([]);
      setGalleryFiles([]);
      setDeletedImages([]);
      setEditProduct(null);
      setVariants([]);
    }
    setShowModal(true);
  }, []);

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

  const handleCloseModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setImagePreview(null);
    setGalleryPreviews([]);
    setDeletedImages([]);
    if (editId) {
      navigate("/admin/products");
    }
  };

  const fetchVariants = async (productId) => {
    try {
      const res = await getVariantsByProduct(productId);
      if (res?.errCode === 0) {
        const fetchedVariants = res.data || [];
        setVariants(fetchedVariants);
        setFormData((prev) => ({ ...prev, variants: fetchedVariants }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDeleteGalleryImage = (idx) => {
    const urlToRemove = galleryPreviews[idx];

    // Nếu là ảnh cũ (đã có trong DB), lưu lại để xóa ở backend
    if (editProduct?.images?.some((img) => img.imageUrl === urlToRemove)) {
      setDeletedImages((prev) => [...prev, urlToRemove]);
    } else {
      // Nếu là ảnh mới vừa chọn (trong galleryFiles), lọc ra khỏi files
      // Ta cần tìm index tương đối trong galleryFiles
      // galleryPreviews chứa [ảnh cũ..., ảnh mới...]
      const oldImagesCount = editProduct?.images?.length || 0;
      if (idx >= oldImagesCount) {
        const fileIdx = idx - oldImagesCount;
        setGalleryFiles((prev) => prev.filter((_, i) => i !== fileIdx));
      }
    }

    // Xóa khỏi UI preview
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim())
      return toast.error("Tên sản phẩm không được trống");

    const data = new FormData();

    // 1. Chuẩn bị danh sách biến thể cuối cùng
    // Nếu là edit, dùng state variants từ VariantManager, nếu tạo mới dùng formData.variants
    const finalVariants = (editProduct ? variants : formData.variants).map(
      (v) => ({
        ...v,
        // Đảm bảo attributeValues được format đúng cho backend
        attributeValues: v.attributeValues || v.attributes || {},
      }),
    );

    // 2. Gộp thuộc tính kỹ thuật
    const finalSpecs = { ...formData.specifications, ...formData.attributes };

    // 3. Đóng gói FormData
    Object.keys(formData).forEach((key) => {
      if (key === "imageFile" && formData[key]) {
        data.append("image", formData[key]);
      } else if (
        ["attributes", "variants", "options", "specifications"].includes(key)
      ) {
        let value;
        if (key === "variants") value = finalVariants;
        else if (key === "specifications" || key === "attributes")
          value = finalSpecs;
        else value = formData[key];

        // Gửi dưới dạng chuỗi JSON
        data.append(key, JSON.stringify(value));
      } else if (
        formData[key] !== null &&
        formData[key] !== "" &&
        key !== "attributes"
      ) {
        data.append(key, formData[key]);
      }
    });

    // Thêm các file gallery
    galleryFiles.forEach((file) => data.append("images", file));

    // Thêm danh sách ảnh cần xóa
    if (deletedImages.length > 0) {
      data.append("deletedImages", JSON.stringify(deletedImages));
    }

    setSaving(true);
    try {
      let res;
      if (editProduct) {
        res = await updateProductApi(editProduct.id, data);
      } else {
        // Luôn gọi createProductApi (vì backend đã gộp logic)
        res = await createProductApi(data);
      }

      if (res.errCode === 0) {
        toast.success(
          editProduct ? "Cập nhật thành công!" : "Đăng bán thành công!",
        );
        fetchProducts(page);
        handleCloseModal();
      } else {
        toast.error(res.errMessage || "Thao tác thất bại");
      }
    } catch (err) {
      console.error("Save product error:", err);
      toast.error("Lỗi kết nối server hoặc định dạng dữ liệu không hợp lệ");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteProductApi(confirmModal.productId);
      if (res.errCode === 0) {
        toast.success("Đã xóa sản phẩm");
        fetchProducts(page);
      }
    } finally {
      setConfirmModal({ show: false, productId: null, name: "" });
    }
  };

  const handleSyncAI = async () => {
    setIsSyncingAI(true);
    try {
      const res = await syncEmbeddings();
      if (res.errCode === 0) {
        toast.success(res.message || "Đồng bộ dữ liệu AI Vector thành công!");
        fetchProducts(page);
      } else {
        toast.error(res.errMessage || "Đồng bộ thất bại");
      }
    } catch (error) {
      console.error("Sync AI error:", error);
      toast.error("Lỗi khi đồng bộ dữ liệu AI");
    } finally {
      setIsSyncingAI(false);
    }
  };

  // Helper to get Icon for Attribute
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <FiBox />
            </div>
            Quản lý Kho hàng
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary font-medium mt-2 ml-1">
            Hệ thống quản lý sản phẩm thông minh & phân loại linh hoạt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAI}
            disabled={isSyncingAI}
            className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-slate-100 dark:bg-dark-bg hover:bg-white dark:hover:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400 font-black uppercase tracking-widest text-[11px] transition-all hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-none disabled:opacity-50"
          >
            <FiCpu className={`${isSyncingAI ? "animate-spin" : ""}`} />
            {isSyncingAI ? "Đang đồng bộ..." : "Đồng bộ AI Vector"}
          </button>

          <button
            onClick={() => handleShowModal()}
            className="btn-modern-primary h-12 px-6 group"
          >
            <FiPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-bold">Đăng sản phẩm mới</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-dark-border overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-dark-bg/50 border-b border-slate-100 dark:border-dark-border">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-text-secondary" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, SKU..."
                  className="input-modern h-12 pl-12 bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border focus:ring-0 font-medium w-full text-slate-900 dark:text-dark-text-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-white dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-500 hover:text-rose-500 font-bold text-xs transition-all hover:border-rose-200"
                >
                  <FiTrash2 /> Xóa bộ lọc
                </button>
                <button
                  onClick={() => fetchProducts(1)}
                  className="size-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <FiRefreshCw className={loadingTable ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <MultiSelectDropdown
                label="Danh mục"
                options={categories}
                selected={filterCategories}
                onToggle={onToggleCategory}
                icon={<FiTag className="text-indigo-400" />}
              />

              <MultiSelectDropdown
                label="Thương hiệu"
                options={brands}
                selected={filterBrands}
                onToggle={onToggleBrand}
                icon={<FiBox className="text-indigo-400" />}
              />

              {/* Attr Filter Dropdowns */}
              {attributes.slice(0, 3).map((attr) => (
                <MultiSelectDropdown
                  key={attr.id}
                  label={attr.name}
                  options={attr.values || []}
                  selected={attrFilters[attr.code] || []}
                  onToggle={(val) => onToggleAttrFilter(attr.code, val)}
                  icon={getAttrIcon(attr.code)}
                />
              ))}

              <label className="flex items-center gap-3 px-5 h-12 bg-white dark:bg-dark-bg rounded-2xl border border-slate-200 dark:border-dark-border cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 dark:hover:border-orange-800 transition-all group shrink-0">
                <input
                  type="checkbox"
                  id="flash-sale-toggle"
                  checked={flashSaleOnly}
                  onChange={(e) => setFlashSaleOnly(e.target.checked)}
                  className="form-checkbox size-5 text-orange-500 rounded-lg border-slate-300 dark:border-dark-border dark:bg-dark-surface"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-dark-text-secondary group-hover:text-orange-600 flex items-center gap-2">
                  <FiZap
                    className={
                      flashSaleOnly
                        ? "text-orange-500 fill-orange-500"
                        : "text-slate-400 dark:text-dark-text-secondary"
                    }
                  />{" "}
                  Flash Sale
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-dark-bg/30">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                  Sản phẩm
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                  Phân loại
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary text-right">
                  Giá bán
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary text-center">
                  Tồn kho
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary text-center">
                  Trạng thái
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
              {loadingTable ? (
                <tr>
                  <td colSpan={6} className="px-8 py-8">
                    <AdminTableSkeleton rows={limit} cols={6} />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="size-16 bg-slate-50 dark:bg-dark-bg rounded-full flex items-center justify-center text-slate-300 dark:text-dark-text-secondary mx-auto mb-4">
                        <FiSearch size={32} />
                      </div>
                      <p className="text-slate-900 dark:text-dark-text-primary font-bold">
                        Không tìm thấy sản phẩm
                      </p>
                      <p className="text-xs text-slate-400 dark:text-dark-text-secondary mt-1">
                        Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/30 transition-all group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-16 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg p-2 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                          <img
                            src={p.image}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate max-w-[200px]">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                              SKU: {p.sku || "—"}
                            </p>
                            {p.embedding && (
                              <div
                                className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                                title="Sản phẩm đã được đồng bộ Vector AI cho tìm kiếm thông minh"
                              >
                                <FiCpu size={8} /> AI READY
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-dark-text-secondary">
                          <FiTag className="text-indigo-400" /> {p.brand?.name}
                        </div>
                        <div className="px-2 py-0.5 bg-slate-100 dark:bg-dark-bg text-[9px] font-black uppercase tracking-tighter text-slate-400 dark:text-dark-text-secondary rounded w-fit">
                          {p.category?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {Number(p.basePrice).toLocaleString()} đ
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        {p.discount > 0 && (
                          <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[9px] font-black rounded">
                            -{p.discount}%
                          </span>
                        )}
                        {p.isFlashSale && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase rounded animate-pulse">
                            <FiZap size={10} /> FS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border ${p.totalStock <= 5 ? "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400" : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"}`}
                        >
                          <span className="text-xs font-black">
                            {p.totalStock}
                          </span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-secondary">
                          Bán: {p.sold || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"}`}
                        >
                          {p.isActive ? "Đang bán" : "Tạm ẩn"}
                        </span>
                        {p.hasVariants && (
                          <span className="text-[8px] font-black text-indigo-500 uppercase flex items-center gap-1">
                            <FiLayers size={8} /> Biến thể
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleShowModal(p)}
                          className="size-10 rounded-xl text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-lg transition-all border border-transparent"
                        >
                          <FiEdit2 className="mx-auto" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              productId: p.id,
                              name: p.name,
                            })
                          }
                          className="size-10 rounded-xl text-slate-400 hover:bg-white hover:text-rose-500 hover:shadow-lg transition-all border border-transparent"
                        >
                          <FiTrash2 className="mx-auto" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-slate-50 dark:border-dark-border bg-slate-50/20 dark:bg-dark-bg/20">
          <AppPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchProducts(p)}
          />
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl max-h-[95vh] bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-transparent dark:border-dark-border transition-colors duration-300"
            >
              <div className="px-10 py-7 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {editProduct ? "Sửa sản phẩm" : "Đăng sản phẩm mới"}
                  </h3>
                  <p className="text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mt-1">
                    Cấu hình chi tiết & Thông số kỹ thuật chuyên sâu
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="size-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-dark-bg hover:text-slate-900 dark:hover:text-white hover:shadow-xl transition-all"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              {/* Modal Tabs Selector */}
              <div className="px-10 py-0 border-b border-slate-100 dark:border-dark-border bg-white dark:bg-dark-surface flex items-center gap-8 overflow-x-auto no-scrollbar">
                {[
                  { id: "basic", label: "Thông tin cơ bản", icon: <FiInfo /> },
                  { id: "attributes", label: "Thông số kỹ thuật", icon: <FiLayers /> },
                  { id: "variants", label: "Biến thể sản phẩm", icon: <FiPackage /> },
                  { id: "flashsale", label: "Cấu hình Sale", icon: <FiZap /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id)}
                    className={`flex items-center gap-2 py-5 border-b-2 transition-all text-xs font-black uppercase tracking-widest whitespace-nowrap ${
                      modalTab === tab.id
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/30 dark:bg-dark-bg/10">
                <form
                  id="product-form"
                  onSubmit={handleSave}
                  className="max-w-4xl mx-auto"
                >
                  <AnimatePresence mode="wait">
                    {modalTab === "basic" && (
                      <Motion.div
                        key="basic"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {/* Image Upload Area */}
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Ảnh đại diện sản phẩm
                              </label>
                              <div className="group relative w-full aspect-square rounded-[2rem] bg-white dark:bg-dark-bg border-2 border-dashed border-slate-200 dark:border-dark-border flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-400 shadow-sm hover:shadow-xl">
                                {imagePreview ? (
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-contain p-6"
                                  />
                                ) : (
                                  <>
                                    <FiUploadCloud className="text-4xl text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tải ảnh lên</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Thư viện ảnh chi tiết
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {galleryPreviews.map((url, idx) => (
                                  <div key={idx} className="relative aspect-square rounded-2xl border border-slate-100 dark:border-dark-border overflow-hidden group shadow-sm bg-white dark:bg-dark-bg">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGalleryImage(idx)}
                                      className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </div>
                                ))}
                                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border flex items-center justify-center text-slate-300 hover:border-indigo-400 hover:text-indigo-400 transition-all bg-white dark:bg-dark-bg">
                                  <FiPlus />
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleGalleryChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Basic Information */}
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên sản phẩm *</label>
                              <input
                                className="input-modern h-12 font-bold focus:ring-indigo-500 dark:bg-dark-surface dark:text-white"
                                placeholder="VD: Samsung Galaxy S24 Ultra"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mã sản phẩm (SKU)</label>
                              <input
                                className="input-modern h-12 font-mono text-indigo-600 bg-indigo-50/30 dark:bg-indigo-500/5 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30"
                                placeholder="VD: SS-S24U-512-GRY"
                                value={formData.sku}
                                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-dark-border">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá cơ bản (đ)</span>
                                <input
                                  type="number"
                                  className="input-modern h-11 font-black text-sm dark:bg-dark-surface dark:text-white"
                                  value={formData.price}
                                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giảm giá (%)</span>
                                <input
                                  type="number"
                                  className="input-modern h-11 font-black text-sm dark:bg-dark-surface dark:text-white"
                                  value={formData.discount}
                                  onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số lượng trong kho</span>
                              <input
                                type="number"
                                className="input-modern h-11 font-black text-sm dark:bg-dark-surface dark:text-white"
                                value={formData.stock}
                                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                              />
                            </div>

                            <div className="p-4 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border space-y-4">
                              <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-[10px] font-black uppercase text-slate-500">Trạng thái kinh doanh</span>
                                <div className="relative inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                </div>
                              </label>

                              <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-[10px] font-black uppercase text-slate-500">Cho phép chọn biến thể</span>
                                <div className="relative inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.hasVariants}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hasVariants: e.target.checked }))}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </Motion.div>
                    )}

                    {modalTab === "attributes" && (
                      <Motion.div
                        key="attributes"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Thương hiệu</label>
                            <select
                              className="input-modern h-12 font-bold appearance-none dark:bg-dark-surface dark:text-white"
                              value={formData.brandId}
                              onChange={(e) => setFormData(prev => ({ ...prev, brandId: e.target.value }))}
                            >
                              <option value="">Chọn hãng</option>
                              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <FiChevronDown className="absolute right-4 top-[38px] text-slate-400 pointer-events-none" />
                          </div>
                          <div className="space-y-2 relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Danh mục</label>
                            <select
                              className="input-modern h-12 font-bold appearance-none dark:bg-dark-surface dark:text-white"
                              value={formData.categoryId}
                              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                            >
                              <option value="">Chọn loại</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <FiChevronDown className="absolute right-4 top-[38px] text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="p-8 bg-white dark:bg-dark-surface rounded-[2.5rem] border border-slate-100 dark:border-dark-border shadow-sm">
                          <h4 className="text-sm font-black uppercase tracking-tighter text-indigo-600 mb-6 flex items-center gap-2">
                            <FiSettings /> Thông số kỹ thuật chi tiết
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {attributes.map((attr) => (
                              <div key={attr.id} className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                  {getAttrIcon(attr.code)} {attr.name}
                                </label>
                                <div className="relative">
                                  <input
                                    list={`list-${attr.code}`}
                                    className="input-modern h-10 font-bold text-xs focus:border-indigo-500 dark:bg-dark-bg dark:text-white"
                                    placeholder={`Nhập ${attr.name}...`}
                                    value={formData.attributes[attr.code] || ""}
                                    onChange={(e) => setFormData(prev => ({
                                      ...prev,
                                      attributes: { ...prev.attributes, [attr.code]: e.target.value }
                                    }))}
                                  />
                                  <datalist id={`list-${attr.code}`}>
                                    {attr.values?.map(v => <option key={v.id} value={v.value} />)}
                                  </datalist>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả sản phẩm</label>
                          <textarea
                            className="input-modern resize-none h-40 py-4 font-medium dark:bg-dark-surface dark:text-white"
                            placeholder="Mô tả chi tiết về sản phẩm..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </Motion.div>
                    )}

                    {modalTab === "variants" && (
                      <Motion.div
                        key="variants"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                      >
                        {!formData.hasVariants ? (
                          <div className="p-20 text-center bg-white dark:bg-dark-surface rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-dark-border">
                            <FiLayers className="text-5xl text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Vui lòng kích hoạt "Biến thể" ở tab Cơ bản để thiết lập.</p>
                          </div>
                        ) : (
                          <VariantManager
                            productId={editProduct?.id}
                            initialVariants={editProduct ? variants : formData.variants}
                            formData={formData}
                            setFormData={setFormData}
                            onRefresh={editProduct ? () => fetchVariants(editProduct.id) : null}
                          />
                        )}
                      </Motion.div>
                    )}

                    {modalTab === "flashsale" && (
                      <Motion.div
                        key="flashsale"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                      >
                        <div className="p-10 bg-orange-50/30 dark:bg-orange-900/10 rounded-[3rem] border border-orange-100 dark:border-orange-900/30">
                          <label className="flex items-center gap-4 cursor-pointer mb-8">
                            <input
                              type="checkbox"
                              checked={formData.isFlashSale}
                              onChange={(e) => setFormData(prev => ({ ...prev, isFlashSale: e.target.checked }))}
                              className="form-checkbox size-6 text-orange-500 rounded-lg"
                            />
                            <div>
                              <span className="text-lg font-black uppercase text-orange-600 flex items-center gap-2">
                                <FiZap className={formData.isFlashSale ? "fill-orange-500" : ""} /> Kích hoạt Flash Sale
                              </span>
                              <p className="text-xs text-orange-400 font-medium">Sản phẩm sẽ được hiển thị trong khu vực khuyến mãi giới hạn thời gian.</p>
                            </div>
                          </label>

                          {formData.isFlashSale && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest ml-1">Giá khuyến mãi</span>
                                <input
                                  type="number"
                                  className="input-modern h-12 bg-white dark:bg-dark-surface border-orange-200 font-black text-orange-600"
                                  placeholder="0 đ"
                                  value={formData.flashSalePrice}
                                  onChange={(e) => setFormData(prev => ({ ...prev, flashSalePrice: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bắt đầu</span>
                                <input
                                  type="datetime-local"
                                  className="input-modern h-12 dark:bg-dark-surface dark:text-white"
                                  value={formData.flashSaleStart}
                                  onChange={(e) => setFormData(prev => ({ ...prev, flashSaleStart: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kết thúc</span>
                                <input
                                  type="datetime-local"
                                  className="input-modern h-12 dark:bg-dark-surface dark:text-white"
                                  value={formData.flashSaleEnd}
                                  onChange={(e) => setFormData(prev => ({ ...prev, flashSaleEnd: e.target.value }))}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              <div className="px-10 py-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/50 flex items-center justify-between">
                <button
                  onClick={handleCloseModal}
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg transition-all"
                >
                  Đóng
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest hidden sm:inline">
                    Kiểm tra kỹ thông tin trước khi lưu
                  </span>
                  <button
                    form="product-form"
                    disabled={saving}
                    className="px-12 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 min-w-[220px] flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                        Đang lưu...
                      </>
                    ) : editProduct ? (
                      "Cập nhật sản phẩm"
                    ) : (
                      "Đăng bán sản phẩm"
                    )}
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() =>
          setConfirmModal({ show: false, productId: null, name: "" })
        }
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa?"
        message={`Bạn có chắc chắn muốn xóa ${confirmModal.name}? Hành động này không thể hoàn tác.`}
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
      />
    </div>
  );
};

export default ProductManage;
