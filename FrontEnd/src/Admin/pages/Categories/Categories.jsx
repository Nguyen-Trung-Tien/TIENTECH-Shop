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
  FiChevronLeft,
  FiChevronRight
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

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  // Modal xóa
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.warning("Tên danh mục không được để trống");
      return false;
    }
    return true;
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
    const total = categories.length;
    setTotalPages(Math.ceil(total / limit) || 1);
  }, [categories, limit]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleShowModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        image: category.image || "",
      });
      setPreview(category.image ? `data:image/jpeg;base64,${category.image}` : null);
    } else {
      setFormData({ name: "", description: "", image: "" });
      setPreview(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.warning("Ảnh không được quá 2MB");

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setFormData({ ...formData, image: base64 });
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const slug = generateSlug(formData.name);
    const payload = { ...formData, slug };

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory.id, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await createCategoryApi(payload);
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
    if (!deletingCategory) return;
    try {
      setLoading(true);
      await deleteCategoryApi(deletingCategory.id);
      toast.success("Đã xóa danh mục!");
      fetchCategories();
    } catch (err) {
      toast.error("Không thể xóa danh mục này");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const paginatedCategories = categories.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
              <FiLayers />
            </div>
            Quản lý danh mục
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 ml-13">Phân loại sản phẩm theo các nhóm chức năng.</p>
        </div>
        
        <button 
          onClick={() => handleShowModal()}
          className="btn-modern-primary group"
        >
          <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
          <span>Tạo danh mục mới</span>
        </button>
      </div>

      {/* Table Area */}
      <div className="card-modern">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thống kê:</span>
              <span className="text-xs font-bold text-primary">{categories.length} Danh mục</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hình ảnh</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thông tin danh mục</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Slug</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ngày khởi tạo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(limit).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-white p-1 flex-shrink-0 group-hover:shadow-md transition-all">
                          {cat.image ? (
                            <img src={`data:image/jpeg;base64,${cat.image}`} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-300"><FiImage /></div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-900">{cat.name}</p>
                       <p className="text-[10px] font-medium text-slate-400 mt-1 line-clamp-1 max-w-xs">{cat.description || "Chưa có mô tả"}</p>
                    </td>
                    <td className="px-6 py-4">
                       <code className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-lg text-emerald-600">/{cat.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-bold text-slate-500 flex items-center gap-2"><FiCalendar className="text-slate-400" /> {new Date(cat.createdAt).toLocaleDateString("vi-VN")}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleShowModal(cat)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-primary hover:shadow-md border border-transparent hover:border-slate-100 transition-all"
                            title="Sửa"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => { setDeletingCategory(cat); setShowDeleteModal(true); }}
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
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">Dữ liệu trống</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/20">
           <AppPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
           />
        </div>
      </div>

      {/* Form Modal */}
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
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
               <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
                     </h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cấu hình nhóm phân loại sản phẩm</p>
                  </div>
                  <button onClick={handleCloseModal} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md transition-all">
                    <FiX className="text-xl" />
                  </button>
               </div>

               <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="space-y-1.5">
                     <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên danh mục *</label>
                     <input 
                      className="input-modern font-bold" 
                      placeholder="Ví dụ: Gaming Gear, Laptop Office..."
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                     />
                     <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Slug: /{generateSlug(formData.name) || "—"}</p>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả ngắn</label>
                     <textarea 
                      className="input-modern resize-none h-24" 
                      placeholder="Thông tin giới thiệu về nhóm sản phẩm này..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Hình ảnh đại diện</label>
                     <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                           {preview ? (
                             <img src={preview} alt="Preview" className="w-full h-full object-cover p-1 rounded-2xl" />
                           ) : (
                             <FiImage className="text-2xl text-slate-300" />
                           )}
                        </div>
                        <div className="flex-1 space-y-2">
                           <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                           />
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Định dạng JPG, PNG, WEBP. Tối đa 2MB.</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-10">
                     <button type="button" onClick={handleCloseModal} className="btn-modern-white px-8">Hủy bỏ</button>
                     <button type="submit" className="btn-modern-primary px-10">
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (editingCategory ? "Cập nhật" : "Tạo mới")}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
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
              <p className="text-sm text-slate-500 mb-8 font-medium">Bạn có chắc chắn muốn xóa danh mục <strong>{deletingCategory?.name}</strong>? Toàn bộ dữ liệu liên quan sẽ bị ảnh hưởng.</p>
              
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setShowDeleteModal(false)} className="btn-modern-white">Hủy</button>
                 <button onClick={confirmDelete} className="btn-modern bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20">Xác nhận xóa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
