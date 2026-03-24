import { useState, useEffect, useRef } from "react";
import {
  FiBox, FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage, FiTag,
  FiDollarSign, FiPercent, FiCheckCircle, FiXCircle, FiLayers,
  FiX, FiChevronLeft, FiChevronRight, FiMoreHorizontal, FiPackage,
  FiUploadCloud, FiZap
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  createProductApi,
  deleteProductApi,
  getAllProductApi,
  updateProductApi,
} from "../../../api/productApi";
import {
  getVariantsByProduct,
} from "../../../api/variantApi";
import { getAllCategoryApi } from "../../../api/categoryApi";
import { getAllBrandApi } from "../../../api/brandApi";
import { getImage } from "../../../utils/decodeImage";
import AppPagination from "../../../components/Pagination/Pagination";
import VariantManager from "./VariantManager";

const ProductManage = () => {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
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
    options: [],
    variants: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variants, setVariants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [flashSaleOnly, setFlashSaleOnly] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    productId: null,
  });

  const searchTimeoutRef = useRef(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getAllCategoryApi(),
          getAllBrandApi(),
        ]);
        if (catRes.errCode === 0) setCategories(catRes.data || []);
        if (brandRes.errCode === 0) setBrands(brandRes.brands || []);
      } catch (err) {
        console.error("Fetch initial data error:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch products
  const fetchProducts = async (currentPage = 1, search = "", categoryId = "") => {
    setLoadingTable(true);
    try {
      const res = await getAllProductApi(
        currentPage,
        limit,
        search.trim(),
        flashSaleOnly,
        categoryId
      );
      if (res.errCode === 0) {
        setProducts(res.products || []);
        setTotalPages(res.totalPages || 1);
        setPage(currentPage);
      } else {
        setProducts([]);
        setTotalPages(1);
        setPage(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoadingTable(false);
    }
  };

  // Search/Filter debounce
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(1, searchTerm, filterCategory);
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, flashSaleOnly, filterCategory]);

  const handleShowModal = (product = null) => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        price: product.basePrice || product.price || "",
        discount: product.discount || "0",
        stock: product.stock || "0",
        categoryId: product.categoryId || "",
        isActive: product.isActive ?? true,
        isFlashSale: product.isFlashSale ?? false,
        flashSalePrice: product.flashSalePrice || "",
        flashSaleStart: product.flashSaleStart
          ? new Date(product.flashSaleStart).toISOString().slice(0, 16)
          : "",
        flashSaleEnd: product.flashSaleEnd
          ? new Date(product.flashSaleEnd).toISOString().slice(0, 16)
          : "",
        brandId: product.brandId || "",
        options: product.options || [],
        variants: product.variants || [],
      });
      setImagePreview(getImage(product.image));
      setEditProduct(product);
      setImages([]);
      setImagePreviews([]);
      if (product.images && Array.isArray(product.images)) {
        setImagePreviews(product.images.map(img => getImage(img.imageUrl)));
      }
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
        options: [],
        variants: [],
      });
      setImagePreview(null);
      setEditProduct(null);
      setImages([]);
      setImagePreviews([]);
      setVariants([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setLoadingModal(false);
  };

  const fetchVariants = async (productId) => {
    if (!productId) return;
    try {
      const res = await getVariantsByProduct(productId);
      if (res?.errCode === 0 && Array.isArray(res.data)) {
        setVariants(res.data);
      } else {
        setVariants([]);
      }
    } catch (err) {
      console.error("Fetch variants error:", err);
      setVariants([]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages([...images, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Vui lòng điền đủ tên, giá và danh mục!");
      return;
    }

    setLoadingModal(true);
    try {
      const data = new FormData();
      
      Object.keys(formData).forEach((key) => {
        if (key === "options" || key === "variants") {
          data.append(key, JSON.stringify(formData[key]));
          return;
        }
        if (key === "isActive") {
          data.append(key, formData[key] ? "1" : "0");
          return;
        }
        if (key === "image" && formData[key] instanceof File) {
          data.append("image", formData[key]);
          return;
        }
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      if (images.length > 0) {
        images.forEach((file) => data.append("images", file));
      }

      let res = editProduct
        ? await updateProductApi(editProduct.id, data)
        : await createProductApi(data);

      if (res.errCode === 0) {
        toast.success(editProduct ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!");
        fetchProducts(page, searchTerm, filterCategory);
        handleCloseModal();
      } else {
        toast.error(res.errMessage || "Thao tác thất bại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoadingModal(false);
    }
  };

  const handleDisableFlashSale = async (productId) => {
    try {
      const res = await updateProductApi(productId, {
        isFlashSale: false,
        flashSalePrice: null,
        flashSaleStart: null,
        flashSaleEnd: null,
      });

      if (res.errCode === 0) {
        toast.success("Flash Sale đã được tắt.");
        fetchProducts(page, searchTerm, filterCategory);
      } else {
        toast.error(res.errMessage || "Không thể tắt Flash Sale");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tắt Flash Sale");
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.productId) return;
    try {
      const res = await deleteProductApi(confirmModal.productId);
      if (res.errCode === 0) {
        toast.success("Đã xóa sản phẩm!");
        fetchProducts(
          products.length === 1 && page > 1 ? page - 1 : page,
          searchTerm,
          filterCategory
        );
      } else {
        toast.error(res.errMessage || "Không thể xóa");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi xóa sản phẩm");
    } finally {
      setConfirmModal({ show: false, productId: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
              <FiBox />
            </div>
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 ml-13">
            Quản lý kho hàng và thông tin sản phẩm công nghệ.
          </p>
        </div>

        <button
          onClick={() => handleShowModal()}
          className="btn-modern-primary group"
        >
          <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Filter & Table Area */}
      <div className="card-modern">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SKU..."
              className="input-modern pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              className="input-modern py-2 text-xs font-bold uppercase tracking-wider w-full md:w-40"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={flashSaleOnly}
                onChange={(e) => setFlashSaleOnly(e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded border-slate-300"
              />
              Chỉ Flash Sale
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Phân loại
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">
                  Giá niêm yết
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                  Tồn kho
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingTable ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                          <div className="h-3 bg-slate-50 rounded w-1/4"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl border border-slate-100 bg-white p-1.5 flex-shrink-0 group-hover:shadow-md transition-all">
                          <img
                            src={getImage(p.image)}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                            SKU: {p.sku || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <FiTag className="text-primary/60" /> {p.brand?.name || "No Brand"}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <FiLayers /> {p.category?.name || "General"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black text-slate-900">
                        {Number(p.basePrice || p.price).toLocaleString()} <span className="text-[10px] text-slate-400">VND</span>
                      </p>
                      {p.isFlashSale && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-lg inline-block mt-1">
                          Flash Sale
                        </span>
                      )}
                      {!p.isFlashSale && p.discount > 0 && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-lg inline-block mt-1">
                          -{p.discount}% OFF
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${p.stock <= 5 ? "text-amber-500" : "text-slate-700"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                        {p.isActive ? "Hoạt động" : "Tạm khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.isFlashSale && (
                          <button
                            onClick={() => handleDisableFlashSale(p.id)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-amber-50 hover:text-amber-500 transition-all"
                            title="Tắt Flash Sale"
                          >
                            <FiXCircle />
                          </button>
                        )}
                        <button
                          onClick={() => handleShowModal(p)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-primary hover:shadow-md border border-transparent hover:border-slate-100 transition-all"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ show: true, productId: p.id })}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 text-sm font-medium">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100">
            <AppPagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => fetchProducts(p, searchTerm, filterCategory)}
            />
          </div>
        )}
      </div>

      {/* Main Product Modal */}
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
              className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {editProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Thiết lập thông tin và cấu hình thiết bị
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md transition-all"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form id="product-form" onSubmit={handleSave} className="space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* LEFT COLUMN: Media & Basic Sales */}
                    <div className="lg:col-span-5 space-y-8">
                      {/* Main Image Selection */}
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Ảnh đại diện
                        </label>
                        <div className="relative group aspect-video lg:aspect-square w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/30 hover:bg-primary/5">
                          {imagePreview ? (
                            <img src={imagePreview} alt="" className="w-full h-full object-contain p-4" />
                          ) : (
                            <>
                              <FiUploadCloud className="text-4xl text-slate-300 mb-2" />
                              <p className="text-xs font-bold text-slate-400">Tải lên ảnh chính</p>
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

                      {/* Product Gallery */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Thư viện ảnh
                          </label>
                          <div className="relative">
                            <button type="button" className="text-[10px] font-black text-primary hover:underline">
                              THÊM ẢNH
                            </button>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleGalleryChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {imagePreviews.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl border border-slate-100 overflow-hidden bg-slate-50 group">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(idx)}
                                className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              >
                                <FiX size={12} />
                              </button>
                            </div>
                          ))}
                          <div className="relative aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-primary/30 hover:text-primary transition-all">
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

                      {/* Sales Info */}
                      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                              <FiDollarSign /> Giá niêm yết
                            </span>
                            <input
                              type="number"
                              className="input-modern"
                              placeholder="0"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                              <FiPercent /> Giảm giá (%)
                            </span>
                            <input
                              type="number"
                              className="input-modern"
                              placeholder="0"
                              value={formData.discount}
                              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                              <FiPackage /> Tồn kho
                            </span>
                            <input
                              type="number"
                              className="input-modern"
                              placeholder="0"
                              value={formData.stock}
                              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Trạng thái</span>
                            <div 
                              onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                              className={`h-11 px-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                formData.isActive ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-100 border-slate-200 text-slate-400"
                              }`}
                            >
                               <span className="text-xs font-bold">{formData.isActive ? "Hoạt động" : "Tạm ẩn"}</span>
                               <div className={`w-2 h-2 rounded-full ${formData.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                            </div>
                          </div>
                        </div>

                        {/* Flash Sale Control */}
                        <div className="pt-4 border-t border-slate-200 space-y-4">
                           <label className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                type="checkbox"
                                checked={formData.isFlashSale}
                                onChange={(e) => setFormData({...formData, isFlashSale: e.target.checked})}
                                className="form-checkbox h-4 w-4 text-primary rounded border-slate-300"
                              />
                              <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                                <FiZap className={formData.isFlashSale ? "text-orange-500 fill-orange-500" : "text-slate-400"} /> Cấu hình Flash Sale
                              </span>
                           </label>

                           {formData.isFlashSale && (
                             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pt-2">
                                <div className="grid grid-cols-2 gap-3">
                                   <div className="space-y-1">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Giá khuyến mãi</span>
                                      <input 
                                        type="number" className="input-modern !h-9 text-xs" 
                                        value={formData.flashSalePrice}
                                        onChange={(e) => setFormData({...formData, flashSalePrice: e.target.value})}
                                      />
                                   </div>
                                   <div className="flex items-end">
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          const base = Number(formData.price) || 0;
                                          setFormData({...formData, flashSalePrice: Math.round(base * 0.8)});
                                        }}
                                        className="w-full h-9 bg-orange-50 text-orange-600 text-[10px] font-black rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                                      >
                                        GỢI Ý GIÁ (-20%)
                                      </button>
                                   </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                   <div className="space-y-1">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Ngày bắt đầu</span>
                                      <input 
                                        type="datetime-local" className="input-modern !h-9 text-[10px]" 
                                        value={formData.flashSaleStart}
                                        onChange={(e) => setFormData({...formData, flashSaleStart: e.target.value})}
                                      />
                                   </div>
                                   <div className="space-y-1">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Ngày kết thúc</span>
                                      <input 
                                        type="datetime-local" className="input-modern !h-9 text-[10px]" 
                                        value={formData.flashSaleEnd}
                                        onChange={(e) => setFormData({...formData, flashSaleEnd: e.target.value})}
                                      />
                                   </div>
                                </div>
                             </motion.div>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Text Content & Variants */}
                    <div className="lg:col-span-7 space-y-8">
                      <div className="space-y-6">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên sản phẩm</label>
                          <input
                            type="text"
                            className="input-modern font-bold text-base"
                            placeholder="Ví dụ: Laptop Apple MacBook Air M2 2023..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">SKU Sản phẩm</label>
                            <input
                              type="text"
                              className="input-modern"
                              placeholder="MAC-M2-2023-SLV"
                              value={formData.sku}
                              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Thương hiệu</label>
                            <select
                              className="input-modern font-bold"
                              value={formData.brandId}
                              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                            >
                              <option value="">Chọn hãng</option>
                              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Danh mục</label>
                          <select
                            className="input-modern font-bold"
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          >
                            <option value="">Chọn phân loại</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả tóm tắt</label>
                          <textarea
                            rows={4}
                            className="input-modern resize-none py-3"
                            placeholder="Mô tả các đặc điểm nổi bật nhất của sản phẩm..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          ></textarea>
                        </div>
                      </div>

                      {/* Variant Manager Integration - Specifications will be handled here per variant */}
                      <div className="pt-6 border-t border-slate-100">
                        <VariantManager
                          productId={editProduct?.id}
                          initialVariants={editProduct ? variants : formData.variants}
                          formData={formData}
                          setFormData={setFormData}
                          onRefresh={editProduct ? () => fetchVariants(editProduct.id) : null}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button onClick={handleCloseModal} className="btn-modern-white">Hủy bỏ</button>
                <div className="flex items-center gap-3">
                   <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase">Vui lòng kiểm tra kỹ trước khi lưu</p>
                   <button
                    form="product-form"
                    disabled={loadingModal}
                    className="btn-modern-primary min-w-[160px]"
                  >
                    {loadingModal ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>{editProduct ? "CẬP NHẬT SẢN PHẨM" : "ĐĂNG BÁN SẢN PHẨM"}</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ show: false, productId: null })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                <FiTrash2 />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">
                Sản phẩm sẽ bị gỡ khỏi hệ thống và không thể phục hồi.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfirmModal({ show: false, productId: null })}
                  className="btn-modern-white"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="btn-modern bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManage;
