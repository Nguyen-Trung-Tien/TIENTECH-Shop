import { useState, useEffect, useCallback, useMemo } from "react";
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
  FiXCircle,
  FiLayers,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiPackage,
  FiUploadCloud,
  FiZap,
  FiChevronDown,
  FiCpu,
  FiMonitor,
  FiBattery,
  FiSmartphone,
  FiSettings,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createProductApi,
  deleteProductApi,
  getAllProductApi,
  updateProductApi,
  getOneProductApi,
  filterProductsApi,
} from "../../../api/productApi";
import { getVariantsByProduct } from "../../../api/variantApi";
import { getAllCategoryApi } from "../../../api/categoryApi";
import { getAllBrandApi } from "../../../api/brandApi";
import { getAllAttributesApi } from "../../../api/attributeApi";
import { syncEmbeddings } from "../../../api/adminApi";
import AppPagination from "../../../components/Pagination/Pagination";
import VariantManager from "./VariantManager";
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
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [flashSaleOnly, setFlashSaleOnly] = useState(false);
  const [attrFilters, setAttrFilters] = useState({
    ram: "",
    rom: "",
    os: "",
    refresh_rate: "",
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

  // Fetch Products with all filters
  const fetchProducts = useCallback(
    async (currentPage = 1) => {
      setLoadingTable(true);
      try {
        const res = await filterProductsApi({
          page: currentPage,
          limit,
          search: searchTerm.trim(),
          categoryId: filterCategory,
          brandId: filterBrand,
          isFlashSale: flashSaleOnly,
          ...attrFilters,
        });

        if (res.errCode === 0) {
          setProducts(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setPage(currentPage);
        }
      } catch (err) {
        toast.error("Lỗi tải dữ liệu sản phẩm");
      } finally {
        setLoadingTable(false);
      }
    },
    [searchTerm, filterCategory, filterBrand, flashSaleOnly, attrFilters],
  );

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
        } catch (e) {
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
    if (editId) {
      navigate("/admin/products");
    }
  };

  const fetchVariants = async (productId) => {
    try {
      const res = await getVariantsByProduct(productId);
      if (res?.errCode === 0) setVariants(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles([...galleryFiles, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim())
      return toast.error("Tên sản phẩm không được trống");

    const data = new FormData();

    // Sync variants from state to formData before saving
    const finalVariants = editProduct ? variants : formData.variants;

    // Ensure specifications is synced with attributes for legacy support
    const finalSpecs = { ...formData.specifications, ...formData.attributes };

    Object.keys(formData).forEach((key) => {
      if (key === "imageFile" && formData[key]) {
        data.append("image", formData[key]);
      } else if (
        ["attributes", "variants", "options", "specifications"].includes(key)
      ) {
        let value;
        if (key === "variants") value = finalVariants;
        else if (key === "specifications") value = finalSpecs;
        else value = formData[key];

        data.append(
          key,
          JSON.stringify(value || (key === "attributes" ? {} : [])),
        );
      } else if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });
    galleryFiles.forEach((file) => data.append("images", file));

    setSaving(true);
    try {
      let res = editProduct
        ? await updateProductApi(editProduct.id, data)
        : await createProductApi(data);
      if (res.errCode === 0) {
        toast.success(
          editProduct ? "Cập nhật thành công!" : "Đăng bán thành công!",
        );
        fetchProducts(page);
        handleCloseModal();
      } else toast.error(res.errMessage || "Thao tác thất bại");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối server");
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
        toast.success("Đồng bộ dữ liệu AI Vector thành công!");
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FiBox />
            </div>
            Quản lý Kho hàng
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2 ml-1">
            Hệ thống quản lý sản phẩm thông minh & phân loại linh hoạt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAI}
            disabled={isSyncingAI}
            className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-slate-100 hover:bg-white border border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 font-black uppercase tracking-widest text-[11px] transition-all hover:shadow-xl hover:shadow-indigo-100 disabled:opacity-50"
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
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, SKU..."
                className="input-modern h-12 pl-12 bg-white border-slate-200 focus:ring-4 focus:ring-indigo-50 font-medium w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="lg:col-span-8 flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[140px]">
                <select
                  className="input-modern h-12 pr-10 appearance-none bg-white font-bold text-[11px] uppercase tracking-widest"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 min-w-[140px]">
                <select
                  className="input-modern h-12 pr-10 appearance-none bg-white font-bold text-[11px] uppercase tracking-widest"
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                >
                  <option value="">Thương hiệu</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Attr Filter Dropdowns */}
              {attributes.slice(0, 3).map((attr) => (
                <div key={attr.id} className="relative flex-1 min-w-[120px]">
                  <select
                    className="input-modern h-12 pr-10 appearance-none bg-white font-bold text-[11px] uppercase tracking-widest"
                    value={attrFilters[attr.code] || ""}
                    onChange={(e) =>
                      setAttrFilters({
                        ...attrFilters,
                        [attr.code]: e.target.value,
                      })
                    }
                  >
                    <option value="">{attr.name}</option>
                    {attr.values?.map((v) => (
                      <option key={v.id} value={v.value}>
                        {v.value}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              ))}

              <label className="flex items-center gap-3 px-5 h-12 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-all group shrink-0">
                <input
                  type="checkbox"
                  checked={flashSaleOnly}
                  onChange={(e) => setFlashSaleOnly(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-orange-500 rounded-lg border-slate-300"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-orange-600 flex items-center gap-2">
                  <FiZap
                    className={
                      flashSaleOnly
                        ? "text-orange-500 fill-orange-500"
                        : "text-slate-400"
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
              <tr className="bg-slate-50/30">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Sản phẩm
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Phân loại
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Giá & Giảm giá
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Kho / Đã bán
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Trạng thái
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingTable ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-8">
                        <div className="h-14 bg-slate-100 rounded-2xl w-full"></div>
                      </td>
                    </tr>
                  ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                        <FiSearch size={32} />
                      </div>
                      <p className="text-slate-900 font-bold">
                        Không tìm thấy sản phẩm
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-indigo-50/20 transition-all group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm group-hover:scale-105 transition-transform">
                          <img
                            src={p.image}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[200px]">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              SKU: {p.sku || "—"}
                            </p>
                            {p.embedding && (
                              <div
                                className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"
                                title="Đã có Vector AI"
                              ></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <FiTag className="text-indigo-400" /> {p.brand?.name}
                        </div>
                        <div className="px-2 py-0.5 bg-slate-100 text-[9px] font-black uppercase tracking-tighter text-slate-500 rounded-md w-fit">
                          {p.category?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-base font-black text-slate-900">
                        {Number(p.basePrice).toLocaleString()}{" "}
                        <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">
                          VND
                        </span>
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        {p.discount > 0 && (
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black rounded">
                            -{p.discount}%
                          </span>
                        )}
                        {p.isFlashSale && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-black uppercase rounded">
                            <FiZap size={10} /> FS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border ${p.totalStock <= 5 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"}`}
                        >
                          <FiPackage size={12} />
                          <span className="text-xs font-bold">
                            {p.totalStock}
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400">
                          Đã bán: {p.sold || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${p.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"}`}
                        >
                          {p.isActive ? "Đang bán" : "Tạm ẩn"}
                        </span>
                        {p.hasVariants && (
                          <span className="text-[9px] font-black text-indigo-500 uppercase flex items-center gap-1">
                            <FiLayers size={10} /> Có biến thể
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleShowModal(p)}
                          className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-xl border border-transparent transition-all"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              productId: p.id,
                              name: p.name,
                            })
                          }
                          className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-rose-500 hover:shadow-xl border border-transparent transition-all"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-slate-50 bg-slate-50/20">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-10 py-7 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {editProduct ? "Sửa sản phẩm" : "Đăng sản phẩm mới"}
                  </h3>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Cấu hình chi tiết & Thông số kỹ thuật chuyên sâu
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-xl transition-all"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <form
                  id="product-form"
                  onSubmit={handleSave}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                >
                  <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Ảnh đại diện
                      </label>
                      <div className="group relative w-full aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-400 hover:bg-indigo-50/30 shadow-inner">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <>
                            <FiUploadCloud className="text-4xl text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Chọn ảnh chính
                            </span>
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

                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Thư viện ảnh
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {galleryPreviews.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-2xl border border-slate-100 overflow-hidden group shadow-sm"
                          >
                            <img
                              src={url}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                        <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-indigo-400 hover:text-indigo-400 transition-all bg-slate-50/50">
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

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6 shadow-inner">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Giá cơ bản
                          </span>
                          <div className="relative">
                            <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                              type="number"
                              className="input-modern h-11 pl-8 font-black text-sm"
                              value={formData.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  price: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Giảm giá (%)
                          </span>
                          <div className="relative">
                            <FiPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                              type="number"
                              className="input-modern h-11 pl-8 font-black text-sm"
                              value={formData.discount}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  discount: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Số lượng kho
                          </span>
                          <div className="relative">
                            <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                              type="number"
                              className="input-modern h-11 pl-8 font-black text-sm"
                              value={formData.stock}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stock: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Đã bán
                          </span>
                          <div className="relative">
                            <FiCheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                              type="number"
                              disabled
                              className="input-modern h-11 pl-8 font-black text-sm cursor-not-allowed"
                              value={editProduct?.sold || 0}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 space-y-4">
                        <label className="flex items-center justify-between cursor-pointer group">
                          <span className="text-xs font-black uppercase text-slate-700 group-hover:text-indigo-600 transition-colors">
                            Trạng thái kinh doanh
                          </span>
                          <div className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  isActive: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                          <span className="text-xs font-black uppercase text-slate-700 group-hover:text-indigo-600 transition-colors">
                            Kích hoạt Biến thể
                          </span>
                          <div className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.hasVariants}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  hasVariants: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          </div>
                        </label>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.isFlashSale}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isFlashSale: e.target.checked,
                              })
                            }
                            className="form-checkbox h-5 w-5 text-orange-500 rounded-lg border-slate-300 focus:ring-orange-200"
                          />
                          <span className="text-xs font-black uppercase text-slate-700 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                            <FiZap
                              className={
                                formData.isFlashSale
                                  ? "text-orange-500 fill-orange-500"
                                  : "text-slate-400"
                              }
                            />
                            Thiết lập Flash Sale
                          </span>
                        </label>
                        {formData.isFlashSale && (
                          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-orange-400 uppercase ml-1">
                                Giá khuyến mãi
                              </span>
                              <input
                                type="number"
                                className="input-modern h-10 text-xs font-black bg-orange-50/30 border-orange-100 focus:border-orange-500 focus:ring-orange-50"
                                placeholder="Nhập giá sale..."
                                value={formData.flashSalePrice}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    flashSalePrice: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase ml-1">
                                  Thời gian bắt đầu
                                </span>
                                <input
                                  type="datetime-local"
                                  className="input-modern h-10 text-[10px] font-bold"
                                  value={formData.flashSaleStart}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      flashSaleStart: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase ml-1">
                                  Thời gian kết thúc
                                </span>
                                <input
                                  type="datetime-local"
                                  className="input-modern h-10 text-[10px] font-bold"
                                  value={formData.flashSaleEnd}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      flashSaleEnd: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-8">
                    <section className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <FiSmartphone className="text-indigo-600" />
                        <h4 className="text-xs font-black uppercase tracking-tighter text-slate-900">
                          Thông tin cơ bản
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            Tên sản phẩm *
                          </label>
                          <input
                            className="input-modern h-12 font-bold focus:ring-4 focus:ring-indigo-50"
                            placeholder="VD: iPhone 15 Pro Max 256GB"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            SKU / Mã quản lý
                          </label>
                          <input
                            className="input-modern h-12 font-mono text-indigo-600 bg-indigo-50/20 border-indigo-100"
                            placeholder="VD: IP15PM-256-BLK"
                            value={formData.sku}
                            onChange={(e) =>
                              setFormData({ ...formData, sku: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            Thương hiệu
                          </label>
                          <select
                            className="input-modern h-12 font-bold appearance-none pr-10"
                            value={formData.brandId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brandId: e.target.value,
                              })
                            }
                          >
                            <option value="">Chọn hãng</option>
                            {brands.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                          <FiChevronDown className="absolute right-4 top-[42px] text-slate-400 pointer-events-none" />
                        </div>
                        <div className="space-y-2 relative">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            Danh mục sản phẩm
                          </label>
                          <select
                            className="input-modern h-12 font-bold appearance-none pr-10"
                            value={formData.categoryId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                categoryId: e.target.value,
                              })
                            }
                          >
                            <option value="">Chọn loại sản phẩm</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <FiChevronDown className="absolute right-4 top-[42px] text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </section>

                    {/* New Attributes Section */}
                    <section className="space-y-6 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <FiLayers className="text-indigo-600" />
                        <h4 className="text-xs font-black uppercase tracking-tighter text-slate-900">
                          Thông số kỹ thuật (Dropdown/Manual)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                        {attributes.map((attr) => (
                          <div key={attr.id} className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                              {getAttrIcon(attr.code)} {attr.name}
                            </label>
                            <div className="relative">
                              <input
                                list={`list-${attr.code}`}
                                className="input-modern h-11 font-bold text-xs bg-white border-slate-200 focus:ring-4 focus:ring-indigo-50"
                                placeholder={`Chọn hoặc nhập ${attr.name}...`}
                                value={formData.attributes[attr.code] || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    attributes: {
                                      ...formData.attributes,
                                      [attr.code]: e.target.value,
                                    },
                                  })
                                }
                              />
                              <datalist id={`list-${attr.code}`}>
                                {attr.values?.map((v) => (
                                  <option key={v.id} value={v.value} />
                                ))}
                              </datalist>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Mô tả sản phẩm
                      </label>
                      <textarea
                        className="input-modern resize-none h-40 py-4 focus:ring-4 focus:ring-indigo-50 font-medium"
                        placeholder="Nhập mô tả chi tiết về sản phẩm, tính năng nổi bật..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <VariantManager
                        productId={editProduct?.id}
                        initialVariants={
                          editProduct ? variants : formData.variants
                        }
                        formData={formData}
                        setFormData={setFormData}
                        onRefresh={
                          editProduct
                            ? () => fetchVariants(editProduct.id)
                            : null
                        }
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button
                  onClick={handleCloseModal}
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Đóng
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">
                    Kiểm tra kỹ thông tin trước khi lưu
                  </span>
                  <button
                    form="product-form"
                    disabled={saving}
                    className="px-12 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 min-w-[220px] flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
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
            </motion.div>
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
