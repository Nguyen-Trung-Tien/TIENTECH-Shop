import { useState, useEffect, useCallback } from "react";
import {
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiImage,
  FiX,
  FiExternalLink,
  FiLayers
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
  getAllBrandApi,
} from "../../../api/brandApi";
import AppPagination from "../../../components/Pagination/Pagination";
import { ConfirmModal } from "../../../components/UI/Modal";

const BrandManage = () => {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const generateSlug = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .trim();
  };

  const fetchBrands = useCallback(async (currentPage = 1, search = "") => {
    setLoadingTable(true);
    try {
      const res = await getAllBrandApi(currentPage, limit, search);
      if (res.errCode === 0) {
        setBrands(res.brands || []);
        setTotalPages(res.totalPages || 1);
        setPage(currentPage);
      }
    } catch (err) {
      toast.error("Lỗi tải dữ liệu thương hiệu!");
    } finally {
      setLoadingTable(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands(1, searchTerm);
  }, [fetchBrands, searchTerm]);

  const handleShowModal = (brand = null) => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        description: brand.description || "",
        imageFile: null,
      });
      setImagePreview(brand.image || null);
      setEditBrand(brand);
    } else {
      setFormData({ name: "", slug: "", description: "", imageFile: null });
      setImagePreview(null);
      setEditBrand(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditBrand(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.warn("Ảnh không được vượt quá 2MB");
      setFormData({ ...formData, imageFile: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Tên thương hiệu không được trống!");

    setSaving(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug || generateSlug(formData.name));
      data.append("description", formData.description);
      if (formData.imageFile) data.append("image", formData.imageFile);

      let res = editBrand 
        ? await updateBrandApi(editBrand.id, data)
        : await createBrandApi(data);

      if (res.errCode === 0) {
        toast.success(editBrand ? "Cập nhật thành công!" : "Thêm mới thành công!");
        fetchBrands(page, searchTerm);
        handleCloseModal();
      } else toast.error(res.errMessage || "Thao tác thất bại!");
    } catch (err) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setSaving(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, name: "" });

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteBrandApi(confirmModal.id);
      if (res.errCode === 0) {
        toast.success("Đã xóa thương hiệu!");
        fetchBrands(brands.length === 1 && page > 1 ? page - 1 : page, searchTerm);
      }
    } finally {
      setConfirmModal({ show: false, id: null, name: "" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FiTag />
            </div>
            Đối tác & Thương hiệu
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2 ml-1">Quản lý danh sách các nhãn hàng cung cấp sản phẩm.</p>
        </div>
        
        <button onClick={() => handleShowModal()} className="btn-modern-primary h-12 px-6 group">
          <FiPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-bold">Thêm đối tác mới</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-50/30">
           <div className="relative w-full md:w-96">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm thương hiệu..." 
                className="input-modern h-12 pl-12 bg-white border-slate-200 focus:ring-4 focus:ring-indigo-50 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Hệ thống:</span>
                <span className="text-xs font-bold text-indigo-600">{brands.length} Thương hiệu</span>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Logo nhãn hàng</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Thương hiệu</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Slug</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingTable ? (
                Array(limit).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-12 bg-slate-100 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : brands.length > 0 ? (
                brands.map((b) => (
                  <tr key={b.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-8 py-5">
                       <div className="w-28 h-12 rounded-xl border border-slate-200 bg-white p-2 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center overflow-hidden">
                          {b.image ? (
                            <img src={b.image} alt={b.name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Logo</span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{b.name}</p>
                       <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-[200px]">{b.description || "—"}</p>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-bold text-slate-600">{b.productCount || 0} Sản phẩm</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-mono font-medium text-emerald-600">/{b.slug}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleShowModal(b)} className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-xl border border-transparent transition-all"><FiEdit2 /></button>
                          <button onClick={() => setConfirmModal({ show: true, id: b.id, name: b.name })} className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-rose-500 hover:shadow-xl border border-transparent transition-all"><FiTrash2 /></button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-8 py-24 text-center text-slate-400 font-bold italic">Không tìm thấy thương hiệu nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/20">
           <AppPagination page={page} totalPages={totalPages} onPageChange={(p) => fetchBrands(p, searchTerm)} />
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
               <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                     <h3 className="text-2xl font-black text-slate-900">{editBrand ? "Cập nhật nhãn hàng" : "Thêm nhãn hàng mới"}</h3>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Hồ sơ đối tác cung ứng</p>
                  </div>
                  <button onClick={handleCloseModal} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-xl transition-all"><FiX className="text-2xl" /></button>
               </div>

               <form onSubmit={handleSave} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tên nhãn hiệu *</label>
                           <input className="input-modern h-12 font-bold focus:ring-4 focus:ring-indigo-50" placeholder="VD: Apple, ASUS..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Slug định danh</label>
                           <input className="input-modern h-12 focus:ring-4 focus:ring-indigo-50 font-mono text-emerald-600" placeholder="apple-inc" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Logo nhãn hàng</label>
                        <div className="group relative w-full aspect-[3/1] rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-400 hover:bg-indigo-50/30">
                           {imagePreview ? (
                             <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain p-4" />
                           ) : (
                             <>
                               <FiImage className="text-4xl text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Logo</span>
                             </>
                           )}
                           <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-3 leading-relaxed">Khuyên dùng logo PNG nền trong suốt.<br/>Tỉ lệ ngang 3:1.</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Thông tin giới thiệu</label>
                     <textarea className="input-modern resize-none h-32 focus:ring-4 focus:ring-indigo-50" placeholder="Viết vài dòng giới thiệu về đối tác này..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>

                  <div className="flex items-center justify-end gap-4 mt-10">
                     <button type="button" onClick={handleCloseModal} className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Hủy</button>
                     <button type="submit" disabled={saving} className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">
                        {saving ? "Đang xử lý..." : (editBrand ? "Lưu thay đổi" : "Thêm đối tác")}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, id: null, name: "" })}
        onConfirm={handleConfirmDelete}
        title="Gỡ bỏ nhãn hàng?"
        message={`Bạn có chắc chắn muốn xóa thương hiệu ${confirmModal.name}? Các sản phẩm hiện tại sẽ không còn thương hiệu liên kết.`}
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
      />
    </div>
  );
};

export default BrandManage;
