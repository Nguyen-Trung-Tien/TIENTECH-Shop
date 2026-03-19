import { useState, useEffect, useRef } from "react";
import {
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiInfo
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
  getAllBrandApi,
} from "../../../api/brandApi";
import { getImage } from "../../../utils/decodeImage";
import AppPagination from "../../../components/Pagination/Pagination";

const BrandManage = () => {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const fetchBrands = async (currentPage = 1, search = "") => {
    setLoadingTable(true);
    try {
      const res = await getAllBrandApi(currentPage, limit, search);
      if (res.errCode === 0) {
        setBrands(res.brands || []);
        setTotalPages(res.totalPages || 1);
        setPage(currentPage);
      } else {
        setBrands([]);
        setTotalPages(1);
        setPage(1);
      }
    } catch (err) {
      console.log(err);
      toast.error("Lỗi tải dữ liệu thương hiệu!");
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchBrands(1);
  }, []);

  const handleShowModal = (brand = null) => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        description: brand.description || "",
        image: null,
      });
      setImagePreview(brand.image || null);
      setEditBrand(brand);
    } else {
      setFormData({ name: "", slug: "", description: "", image: null });
      setImagePreview(null);
      setEditBrand(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditBrand(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.warn("Ảnh không được vượt quá 2MB");
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return toast.error("Tên và slug không được trống!");

    setLoadingModal(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append("description", formData.description);
      if (formData.image) data.append("image", formData.image);

      let res = editBrand 
        ? await updateBrandApi(editBrand.id, data)
        : await createBrandApi(data);

      if (res.errCode === 0) {
        toast.success(editBrand ? "Cập nhật thành công!" : "Tạo mới thành công!");
        fetchBrands(page, searchTerm);
        handleCloseModal();
      } else toast.error(res.errMessage || "Thao tác thất bại!");
    } catch (err) {
      console.log(err);
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoadingModal(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteBrandApi(confirmModal.id);
      if (res.errCode === 0) {
        toast.success("Đã xóa thương hiệu!");
        fetchBrands(brands.length === 1 && page > 1 ? page - 1 : page, searchTerm);
      } else toast.error(res.errMessage || "Không thể xóa");
    } catch (e) {
      toast.error("Lỗi khi xóa thương hiệu!");
    } finally {
      setConfirmModal({ show: false, id: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
              <FiTag />
            </div>
            Quản lý thương hiệu
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 ml-13">Hệ thống đối tác và các nhãn hàng công nghệ.</p>
        </div>
        
        <button 
          onClick={() => handleShowModal()}
          className="btn-modern-primary group"
        >
          <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
          <span>Thêm thương hiệu mới</span>
        </button>
      </div>

      {/* Table Area */}
      <div className="card-modern">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
           <div className="relative w-full md:w-96">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm tên thương hiệu..." 
                className="input-modern pl-11 shadow-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  fetchBrands(1, e.target.value);
                }}
              />
           </div>
           
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng cộng:</span>
              <span className="text-xs font-bold text-primary">{brands.length} Hãng</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Logo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tên thương hiệu</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Slug</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mô tả</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingTable ? (
                Array(limit).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : brands.length > 0 ? (
                brands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <div className="w-24 h-10 rounded-lg border border-slate-100 bg-white p-1 flex-shrink-0 group-hover:shadow-sm transition-all flex items-center justify-center overflow-hidden">
                            {b.image ? (
                              <img src={getImage(b.image)} alt={b.name} className="max-w-full max-h-full object-contain" />
                            ) : (
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Logo</span>
                            )}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-900">{b.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: #{b.id}</p>
                    </td>
                    <td className="px-6 py-4">
                       <code className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-lg text-emerald-600">/{b.slug}</code>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                       <p className="text-xs font-medium text-slate-500 truncate" title={b.description}>{b.description || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleShowModal(b)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-primary hover:shadow-md border border-transparent hover:border-slate-100 transition-all"
                            title="Sửa"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => setConfirmModal({ show: true, id: b.id })}
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
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">Không có thương hiệu nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/20">
           <AppPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchBrands(p, searchTerm)}
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
                        {editBrand ? "Cập nhật nhãn hàng" : "Thêm nhãn hàng mới"}
                     </h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Thông tin đối tác sản xuất</p>
                  </div>
                  <button onClick={handleCloseModal} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md transition-all">
                    <FiX className="text-xl" />
                  </button>
               </div>

               <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên nhãn hiệu *</label>
                        <input 
                          className="input-modern font-bold" 
                          placeholder="Ví dụ: Apple, Samsung..."
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Slug định danh *</label>
                        <input 
                          className="input-modern" 
                          placeholder="apple"
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          required 
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả đối tác</label>
                     <textarea 
                      className="input-modern resize-none h-24" 
                      placeholder="Thông tin giới thiệu về thương hiệu này..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Logo thương hiệu</label>
                     <div className="flex items-center gap-6">
                        <div className="w-32 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                           {imagePreview ? (
                             <img 
                               src={typeof imagePreview === "string" ? imagePreview : getImage(imagePreview)} 
                               alt="Preview" 
                               className="max-w-full max-h-full object-contain p-2" 
                             />
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
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Khuyến nghị tỉ lệ 3:1 hoặc Logo nền trong suốt.</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-10">
                     <button type="button" onClick={handleCloseModal} className="btn-modern-white px-8">Hủy bỏ</button>
                     <button type="submit" className="btn-modern-primary px-10">
                        {loadingModal ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (editBrand ? "Cập nhật" : "Thêm mới")}
                     </button>
                  </div>
               </form>
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
              onClick={() => setConfirmModal({ show: false, id: null })}
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
              <h3 className="text-xl font-black text-slate-900 mb-2">Xóa thương hiệu?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">Hành động này sẽ gỡ bỏ nhãn hàng khỏi hệ thống. Các sản phẩm liên kết vẫn sẽ được giữ lại.</p>
              
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setConfirmModal({ show: false, id: null })} className="btn-modern-white">Hủy</button>
                 <button onClick={handleConfirmDelete} className="btn-modern bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20">Xác nhận xóa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandManage;
