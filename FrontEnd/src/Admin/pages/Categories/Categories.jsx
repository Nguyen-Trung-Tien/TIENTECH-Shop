import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiTag,
  FiCalendar,
  FiAlertCircle,
  FiX,
  FiLayers,
  FiSearch,
  FiChevronDown
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  getAllCategoryApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../../../api/categoryApi";
import AppPagination from "../../../components/Pagination/Pagination";
import { ConfirmModal } from "../../../components/UI/Modal";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageFile: null,
    parentId: ""
  });
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);

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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllCategoryApi();
      if (res.errCode === 0) {
        setCategories(res.data || []);
      } else {
        toast.error(res.errMessage || "Lỗi tải danh mục");
      }
    } catch (err) {
      toast.error("Không thể kết nối server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(categories.length / limit) || 1);
  }, [categories.length]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleShowModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        imageFile: null,
        parentId: category.parentId || ""
      });
      setPreview(category.image || null);
    } else {
      setFormData({ name: "", description: "", imageFile: null, parentId: "" });
      setPreview(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
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
    if (!formData.name.trim()) return toast.warning("Tên danh mục không được trống");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("slug", generateSlug(formData.name));
    if (formData.parentId) data.append("parentId", formData.parentId);
    if (formData.imageFile) data.append("image", formData.imageFile);

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory.id, data);
        toast.success("Cập nhật thành công!");
      } else {
        await createCategoryApi(data);
        toast.success("Thêm mới thành công!");
      }
      fetchCategories();
      handleCloseModal();
    } catch (err) {
      toast.error("Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCategoryApi(deletingCategory.id);
      toast.success("Đã xóa danh mục!");
      fetchCategories();
    } catch (err) {
      toast.error("Không thể xóa danh mục này");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const paginatedCategories = categories.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FiLayers />
            </div>
            Danh mục Sản phẩm
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2 ml-1">Xây dựng cấu trúc phân loại cho cửa hàng của bạn.</p>
        </div>
        
        <button onClick={() => handleShowModal()} className="btn-modern-primary group h-12 px-6">
          <FiPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-bold">Thêm danh mục</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
             <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-indigo-600">{categories.length} Tổng số</span>
                </div>
                <div className="px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-emerald-600">{categories.filter(c => !c.parentId).length} Gốc</span>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Ảnh</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Danh mục</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Phân cấp</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Slug</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(limit).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-6"><div className="h-12 bg-slate-100 rounded-2xl w-full"></div></td>
                    </tr>
                  ))
                ) : paginatedCategories.length > 0 ? (
                  paginatedCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-6 py-4">
                         <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm group-hover:scale-105 transition-transform">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-300"><FiImage /></div>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cat.name}</p>
                         <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cat.description || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                         {cat.parentId ? (
                           <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                             <FiLayers className="text-[10px]" />
                             <span className="text-[11px] font-black uppercase tracking-tighter">Con: {cat.parent?.name}</span>
                           </div>
                         ) : (
                           <span className="text-[11px] font-black uppercase tracking-tighter text-slate-400 px-3 py-1 bg-slate-100 rounded-lg">Gốc</span>
                         )}
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-xs font-mono font-medium text-emerald-600">/{cat.slug}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleShowModal(cat)} className="p-2.5 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm bg-white border border-slate-100"><FiEdit2 /></button>
                            <button onClick={() => { setDeletingCategory(cat); setShowDeleteModal(true); }} className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm bg-white border border-slate-100"><FiTrash2 /></button>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold italic">Không tìm thấy danh mục nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-slate-50 bg-slate-50/20">
             <AppPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
               <div className="px-10 py-7 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                     <h3 className="text-2xl font-black text-slate-900">{editingCategory ? "Sửa danh mục" : "Tạo danh mục mới"}</h3>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Cấu hình thông tin chi tiết</p>
                  </div>
                  <button onClick={handleCloseModal} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-xl transition-all"><FiX className="text-2xl" /></button>
               </div>

               <form onSubmit={handleSave} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tên danh mục *</label>
                         <input className="input-modern h-12 font-bold focus:ring-4 focus:ring-indigo-50" placeholder="VD: Bàn phím cơ" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Danh mục cha</label>
                         <div className="relative">
                            <select className="input-modern h-12 font-bold appearance-none bg-white pr-10 focus:ring-4 focus:ring-indigo-50" value={formData.parentId} onChange={(e) => setFormData({...formData, parentId: e.target.value})}>
                               <option value="">— Là danh mục gốc —</option>
                               {categories.filter(c => !c.parentId && c.id !== editingCategory?.id).map(c => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                               ))}
                            </select>
                            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                         </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Hình ảnh đại diện</label>
                       <div className="group relative w-full aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-400 hover:bg-indigo-50/30">
                          {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <FiImage className="text-4xl text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chọn ảnh upload</span>
                            </>
                          )}
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-3">JPG, PNG, WEBP. Tối đa 2MB.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả danh mục</label>
                     <textarea className="input-modern resize-none h-32 focus:ring-4 focus:ring-indigo-50" placeholder="Viết mô tả ngắn về danh mục này..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>

                  <div className="flex items-center justify-end gap-4 mt-10">
                     <button type="button" onClick={handleCloseModal} className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Đóng</button>
                     <button type="submit" disabled={saving} className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">
                        {saving ? "Đang xử lý..." : (editingCategory ? "Lưu thay đổi" : "Tạo danh mục")}
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
        title="Xác nhận xóa danh mục?"
        message={`Việc xóa ${deletingCategory?.name} không thể hoàn tác. Các sản phẩm thuộc danh mục này sẽ mất phân loại.`}
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
      />
    </div>
  );
};

export default Categories;
