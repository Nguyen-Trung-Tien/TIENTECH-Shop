import { useState, useEffect, useRef, useMemo } from "react";
import {
  FiBox,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiImage,
  FiTag,
  FiDollarSign,
  FiPercent,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiCpu,
  FiMonitor,
  FiBattery,
  FiSmartphone,
  FiMaximize,
  FiInfo,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiPackage
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
  createVariant,
  deleteVariant,
} from "../../../api/variantApi";
import { getAllCategoryApi } from "../../../api/categoryApi";
import { getAllBrandApi } from "../../../api/brandApi";
import { getImage } from "../../../utils/decodeImage";
import { useSelector } from "react-redux";
import AppPagination from "../../../components/Pagination/Pagination";

const ProductManage = () => {
  const token = useSelector((state) => state.user.token);

  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    categoryId: "",
    isActive: true,
    image: null,
    brandId: "",
    color: "",
    ram: "",
    rom: "",
    screen: "",
    cpu: "",
    battery: "",
    weight: "",
    connectivity: "",
    os: "",
    extra: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantForm, setVariantForm] = useState({
    sku: "",
    price: "",
    stock: "",
    ram: "",
    rom: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    productId: null,
  });

  const searchTimeoutRef = useRef(null);
  const tableTopRef = useRef(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getAllCategoryApi(),
          getAllBrandApi()
        ]);
        if (catRes.errCode === 0) setCategories(catRes.data || []);
        if (brandRes.errCode === 0) setBrands(brandRes.brands || []);
      } catch (err) {
        console.error("Fetch initial data error:", err);
      }
    };
    fetchData();
    fetchProducts(1);
  }, []);

  // Fetch products
  const fetchProducts = async (currentPage = 1, search = "") => {
    setLoadingTable(true);
    try {
      const res = await getAllProductApi(currentPage, limit, search.trim());
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

  // Search debounce
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(1, searchTerm);
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm]);

  const handleShowModal = (product = null) => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        price: product.price || "",
        discount: product.discount || "",
        stock: product.stock || "",
        categoryId: product.categoryId || "",
        isActive: product.isActive ?? true,
        brandId: product.brandId || "",
        image: null,
        color: product.color || "",
        ram: product.ram || "",
        rom: product.rom || "",
        screen: product.screen || "",
        cpu: product.cpu || "",
        battery: product.battery || "",
        weight: product.weight || "",
        connectivity: product.connectivity || "",
        os: product.os || "",
        extra: product.extra || "",
      });
      setImagePreview(getImage(product.image));
      setEditProduct(product);
      setImages([]);
      setImagePreviews([]);
      fetchVariants(product.id);
    } else {
      setFormData({
        name: "",
        sku: "",
        description: "",
        price: "",
        discount: "",
        stock: "",
        categoryId: "",
        brandId: "",
        isActive: true,
        image: null,
        color: "",
        ram: "",
        rom: "",
        screen: "",
        cpu: "",
        battery: "",
        weight: "",
        connectivity: "",
        os: "",
        extra: "",
      });
      setImagePreview(null);
      setEditProduct(null);
      setImages([]);
      setImagePreviews([]);
      setVariants([]);
      setVariantForm({ sku: "", price: "", stock: "", ram: "", rom: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditProduct(null);
  };

  const fetchVariants = async (productId) => {
    if (!productId) return;
    try {
      const res = await getVariantsByProduct(productId, token);
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Vui lòng điền đủ tên, giá và danh mục!");
      return;
    }

    setLoadingModal(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'isActive') data.append(key, formData[key] ? 1 : 0);
        else if (formData[key] !== null) data.append(key, formData[key]);
      });

      if (images.length) {
        images.forEach((file) => data.append("images", file));
      }

      let res = editProduct 
        ? await updateProductApi(editProduct.id, data, token)
        : await createProductApi(data, token);

      if (res.errCode === 0) {
        toast.success(editProduct ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!");
        fetchProducts(page, searchTerm);
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

  const handleConfirmDelete = async () => {
    if (!confirmModal.productId) return;
    try {
      const res = await deleteProductApi(confirmModal.productId, token);
      if (res.errCode === 0) {
        toast.success("Đã xóa sản phẩm!");
        fetchProducts(products.length === 1 && page > 1 ? page - 1 : page, searchTerm);
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
          <p className="text-sm text-slate-500 font-medium mt-1 ml-13">Quản lý kho hàng và thông tin sản phẩm công nghệ.</p>
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
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <select className="input-modern py-2 text-xs font-bold uppercase tracking-wider w-full md:w-40">
                 <option value="">Tất cả danh mục</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Sản phẩm</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Phân loại</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Giá niêm yết</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Tồn kho</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
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
                          <img src={getImage(p.image)} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">SKU: {p.sku || "—"}</p>
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
                       <p className="text-sm font-black text-slate-900">{Number(p.price).toLocaleString()} <span className="text-[10px] text-slate-400">VND</span></p>
                       {p.discount > 0 && (
                         <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-lg inline-block mt-1">
                           -{p.discount}% OFF
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`text-sm font-bold ${p.stock <= 5 ? 'text-amber-500' : 'text-slate-700'}`}>
                         {p.stock}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         p.isActive 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                       }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                         {p.isActive ? "Hoạt động" : "Tạm khóa"}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleShowModal(p)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-primary hover:shadow-md border border-transparent hover:border-slate-100 transition-all"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => setConfirmModal({ show: true, productId: p.id })}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                            title="Xóa"
                          >
                            <FiTrash2 />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-3xl">
                          <FiBox />
                       </div>
                       <p className="text-sm font-bold text-slate-400">Không tìm thấy sản phẩm nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Area */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100">
            <AppPagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => fetchProducts(p, searchTerm)}
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
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {editProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Thông tin chi tiết thiết bị</p>
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
                <form id="product-form" onSubmit={handleSave} className="space-y-8">
                   {/* Row 1: Basic Info */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Side: Images */}
                      <div className="space-y-6">
                         <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Ảnh đại diện</label>
                            <div className="relative group">
                               <div className="aspect-square w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary/30 group-hover:bg-primary/5">
                                  {imagePreview ? (
                                    <img src={imagePreview} alt="" className="w-full h-full object-contain p-4" />
                                  ) : (
                                    <>
                                      <FiImage className="text-4xl text-slate-300 mb-2" />
                                      <p className="text-xs font-bold text-slate-400">Chọn ảnh chính (Max 2MB)</p>
                                    </>
                                  )}
                               </div>
                               <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setFormData({ ...formData, image: file });
                                    setImagePreview(URL.createObjectURL(file));
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                               />
                            </div>
                         </div>
                         
                         <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Thông tin bán hàng</label>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><FiDollarSign /> Giá bán</span>
                                  <input 
                                    type="number" 
                                    className="input-modern" 
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><FiPercent /> Giảm giá (%)</span>
                                  <input 
                                    type="number" 
                                    className="input-modern" 
                                    placeholder="0"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><FiPackage /> Tồn kho</span>
                                  <input 
                                    type="number" 
                                    className="input-modern" 
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">Trạng thái</span>
                                  <div className="flex items-center h-11 px-4 bg-slate-50 rounded-xl border border-slate-200">
                                     <label className="flex items-center cursor-pointer w-full">
                                        <div className="relative">
                                           <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                           />
                                           <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-primary' : 'bg-slate-300'}`}></div>
                                           <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="ml-3 text-xs font-bold text-slate-600">{formData.isActive ? 'Hoạt động' : 'Tạm khóa'}</span>
                                     </label>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Right Side: Details */}
                      <div className="space-y-6">
                         <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên sản phẩm</label>
                            <input 
                              type="text" 
                              className="input-modern font-bold text-base" 
                              placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">SKU</label>
                               <input 
                                type="text" 
                                className="input-modern" 
                                placeholder="PROD-001"
                                value={formData.sku}
                                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                               />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Thương hiệu</label>
                               <select 
                                className="input-modern font-bold"
                                value={formData.brandId}
                                onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                               >
                                  <option value="">Chọn hãng</option>
                                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                               </select>
                            </div>
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Danh mục</label>
                            <select 
                              className="input-modern font-bold"
                              value={formData.categoryId}
                              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                            >
                               <option value="">Chọn loại sản phẩm</option>
                               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả sản phẩm</label>
                            <textarea 
                              rows={5}
                              className="input-modern resize-none" 
                              placeholder="Nhập thông tin giới thiệu sản phẩm..."
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                            ></textarea>
                         </div>
                      </div>
                   </div>

                   {/* Tech Specs Grid */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="h-px bg-slate-100 flex-1"></div>
                         <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Thông số kỹ thuật</span>
                         <div className="h-px bg-slate-100 flex-1"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {[
                           { label: "Màn hình", icon: <FiMonitor />, key: "screen" },
                           { label: "CPU", icon: <FiCpu />, key: "cpu" },
                           { label: "RAM", icon: <FiSmartphone />, key: "ram" },
                           { label: "ROM", icon: <FiMaximize />, key: "rom" },
                           { label: "Pin", icon: <FiBattery />, key: "battery" },
                           { label: "Hệ điều hành", icon: <FiInfo />, key: "os" },
                           { label: "Màu sắc", icon: <FiTag />, key: "color" },
                           { label: "Khác", icon: <FiMoreHorizontal />, key: "extra" },
                         ].map((spec) => (
                           <div key={spec.key} className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                                {spec.icon} {spec.label}
                              </span>
                              <input 
                                type="text" 
                                className="input-modern h-10 px-3" 
                                placeholder="..."
                                value={formData[spec.key]}
                                onChange={(e) => setFormData({...formData, [spec.key]: e.target.value})}
                              />
                           </div>
                         ))}
                      </div>
                   </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                 <button 
                  onClick={handleCloseModal}
                  className="btn-modern-white"
                 >
                   Hủy bỏ
                 </button>
                 <button 
                  form="product-form"
                  disabled={loadingModal}
                  className="btn-modern-primary min-w-[140px]"
                 >
                   {loadingModal ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     <>Lưu dữ liệu</>
                   )}
                 </button>
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
              <p className="text-sm text-slate-500 mb-8 font-medium">Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi kho hàng.</p>
              
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
