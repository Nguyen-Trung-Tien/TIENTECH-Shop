import { useState, useEffect, useCallback } from "react";
import {
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiImage,
  FiX,
  FiRefreshCw
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  getAllBrandApi,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
} from "../../../api/brandApi";
import AppPagination from "../../../components/Pagination/Pagination";
import { ConfirmModal } from "../../../components/UI/Modal";

const BrandManage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageFile: null,
  });
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState(null);

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
    setLoading(true);
    try {
      const res = await getAllBrandApi(currentPage, limit, search);
      if (res.errCode === 0) {
        setBrands(res.brands || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setPage(res.pagination.currentPage || 1);
        }
      } else {
        toast.error(res.errMessage || "Lỗi tải thương hiệu");
      }
    } catch (err) {
      toast.error("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBrands(1, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchBrands, searchTerm]);

  const handleShowModal = (brand = null) => {
    setEditingBrand(brand);
    if (brand) {
      setFormData({
        name: brand.name || "",
        description: brand.description || "",
        imageFile: null,
      });
      setPreview(brand.image || null);
    } else {
      setFormData({ name: "", description: "", imageFile: null });
      setPreview(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setPreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.warning("Ảnh không được quá 2MB");

    setFormData({ ...formData, imageFile: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warning("Tên thương hiệu không được trống");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("slug", generateSlug(formData.name));
    if (formData.imageFile) data.append("image", formData.imageFile);

    setSaving(true);
    try {
      let res;
      if (editingBrand) {
        res = await updateBrandApi(editingBrand.id, data);
      } else {
        res = await createBrandApi(data);
      }

      if (res.errCode === 0) {
        toast.success(editingBrand ? "Cập nhật thành công!" : "Thêm mới thành công!");
        fetchBrands(page, searchTerm);
        handleCloseModal();
      } else {
        toast.error(res.errMessage || "Thao tác thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await deleteBrandApi(deletingBrand.id);
      if (res.errCode === 0) {
        toast.success("Đã xóa thương hiệu!");
        fetchBrands(brands.length === 1 && page > 1 ? page - 1 : page, searchTerm);
      } else {
        toast.error(res.errMessage || "Không thể xóa");
      }
    } catch (err) {
      toast.error("Lỗi khi xóa");
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <FiTag />
            </div>
            Quản lý Thương hiệu
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-15">
            Đối tác & Nhãn hàng liên kết
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group w-64">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Tìm thương hiệu..."
              className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-11 text-sm font-bold focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => handleShowModal()} className="btn-modern-primary group h-12 px-6">
            <FiPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-bold">Thêm Brand</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Logo</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Thương hiệu</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Slug</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : brands.length > 0 ? (
                brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="w-16 h-10 rounded-lg border border-slate-100 bg-white p-1.5 flex items-center justify-center">
                        {brand.image ? (
                          <img src={brand.image} alt={brand.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <FiImage className="text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{brand.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-xs">{brand.description || "Chưa có mô tả"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-black text-slate-600">{brand.productCount || 0} Sản phẩm</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-mono font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">/{brand.slug}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleShowModal(brand)} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"><FiEdit2 size={16} /></button>
                        <button onClick={() => { setDeletingBrand(brand); setShowDeleteModal(true); }} className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 font-black uppercase tracking-widest italic">Không tìm thấy dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-slate-50 bg-slate-50/30">
          <AppPagination page={page} totalPages={totalPages} onPageChange={(p) => fetchBrands(p, searchTerm)} />
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{editingBrand ? "Sửa thương hiệu" : "Thương hiệu mới"}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Thông tin nhận diện nhãn hàng</p>
                </div>
                <button onClick={handleCloseModal} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-xl transition-all"><FiX className="text-2xl" /></button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-8">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="w-full md:w-40 flex-shrink-0">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block text-center">Logo nhãn hàng</label>
                    <div className="group relative aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-400 hover:bg-indigo-50/30">
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
                      ) : (
                        <FiImage className="text-4xl text-slate-200 group-hover:text-indigo-400 transition-colors" />
                      )}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="flex-grow space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên thương hiệu *</label>
                      <input className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-4 focus:ring-indigo-50 transition-all outline-none" placeholder="VD: Apple, Samsung..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả ngắn</label>
                      <textarea className="w-full h-32 bg-slate-50 border-none rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 transition-all outline-none resize-none" placeholder="Đặc điểm nổi bật của thương hiệu..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-4">
                  <button type="button" onClick={handleCloseModal} className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Đóng</button>
                  <button type="submit" disabled={saving} className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50">
                    {saving ? <FiRefreshCw className="animate-spin" /> : (editingBrand ? "Lưu thay đổi" : "Tạo Brand")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa?"
        message={`Việc xóa ${deletingBrand?.name} có thể ảnh hưởng đến hiển thị sản phẩm liên quan. Bạn chắc chắn?`}
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
      />
    </div>
  );
};

export default BrandManage;
