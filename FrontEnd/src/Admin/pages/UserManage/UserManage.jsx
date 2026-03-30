import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiShield,
  FiMail,
  FiPhone,
  FiMapPin,
  FiX,
  FiCamera,
  FiChevronDown
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteUserApi,
  getAllUsersApi,
  registerUser,
  updateUserApi,
} from "../../../api/userApi";
import AppPagination from "../../../components/Pagination/Pagination";

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const [confirmModal, setConfirmModal] = useState({ show: false, userId: null, name: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const searchTimeoutRef = useRef(null);
  const location = useLocation();

  const fetchUsers = useCallback(async (page = 1, query = "") => {
    setLoading(true);
    try {
      const res = await getAllUsersApi(page, limit, query.trim());
      if (res.errCode === 0) {
        setUsers(res.data || []);
        setCurrentPage(res.pagination?.currentPage || 1);
        setTotalPages(res.pagination?.totalPages || 1);
        
        // Kiểm tra xem có cần mở modal edit từ URL không
        const params = new URLSearchParams(location.search);
        const editId = params.get("editId");
        if (editId) {
          const userToEdit = res.data.find(u => u.id === parseInt(editId));
          if (userToEdit) {
            setEditUser(userToEdit);
            setAvatarPreview(userToEdit.avatar || null);
            setShowModal(true);
          }
        }
      }
    } catch (err) {
      toast.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, fetchUsers]);

  const handleShowModal = (user = null) => {
    if (user) {
      setEditUser(user);
      setAvatarPreview(user.avatar || null);
    } else {
      setEditUser(null);
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.warn("Ảnh không vượt quá 2MB");
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formDataObj = new FormData(form);
    
    if (!formDataObj.get("username") || !formDataObj.get("email")) {
      return toast.error("Vui lòng điền đủ thông tin bắt buộc");
    }

    const data = new FormData();
    data.append("id", editUser?.id || "");
    data.append("username", formDataObj.get("username"));
    data.append("email", formDataObj.get("email"));
    data.append("phone", formDataObj.get("phone") || "");
    data.append("address", formDataObj.get("address") || "");
    data.append("role", formDataObj.get("role"));
    if (avatarFile) data.append("avatar", avatarFile);
    if (!editUser) data.append("password", "123456"); // Default password for new users

    setSaving(true);
    try {
      const res = editUser ? await updateUserApi(data) : await registerUser(data);
      if (res.errCode === 0) {
        toast.success(editUser ? "Cập nhật thành công!" : "Tạo tài khoản thành công!");
        fetchUsers(currentPage, searchTerm);
        handleCloseModal();
      } else toast.error(res.errMessage || "Thao tác thất bại");
    } catch (err) {
      toast.error("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    if (user.role === "admin") return toast.warn("Không thể khóa Admin!");
    try {
      const newStatus = user.isActive === false ? true : false;
      const res = await updateUserApi({ id: user.id, isActive: newStatus });
      if (res.errCode === 0) {
        toast.success("Đã cập nhật trạng thái");
        fetchUsers(currentPage, searchTerm);
      }
    } catch (err) { console.error(err); }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteUserApi(confirmModal.userId);
      if (res.errCode === 0) {
        toast.success("Đã xóa người dùng");
        fetchUsers(currentPage, searchTerm);
      }
    } finally { setConfirmModal({ show: false, userId: null, name: "" }); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FiUser />
            </div>
            Quản trị Thành viên
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2 ml-1">Quản lý tài khoản khách hàng và phân quyền hệ thống.</p>
        </div>
        
        <button onClick={() => handleShowModal()} className="btn-modern-primary h-12 px-6 group">
          <FiUserPlus className="text-xl group-hover:scale-110 transition-transform duration-300" />
          <span className="font-bold">Thêm thành viên</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-50/30">
           <div className="relative w-full md:w-96">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Tìm tên hoặc email..." className="input-modern h-12 pl-12 bg-white border-slate-200 focus:ring-4 focus:ring-indigo-50 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Hệ thống:</span>
                <span className="text-xs font-bold text-indigo-600">{users.length} Người dùng</span>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Thành viên</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Liên hệ</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Địa chỉ</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Vai trò</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? Array(limit).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={6} className="px-8 py-8"><div className="h-12 bg-slate-100 rounded-2xl w-full"></div></td></tr>
              )) : users.map((u) => (
                <tr key={u.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl"><FiUser /></div>}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{u.username}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">ID: #{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><FiMail className="text-indigo-400" /> {u.email}</p>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><FiPhone className="text-slate-300" /> {u.phone || "—"}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 max-w-[200px]">
                    <p className="text-xs font-medium text-slate-500 truncate flex items-center gap-2"><FiMapPin className="text-slate-300 flex-shrink-0" /> {u.address || "Chưa cập nhật"}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                      {u.role === 'admin' ? <FiShield size={10} /> : <FiUser size={10} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button onClick={() => toggleStatus(u)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${u.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                      {u.isActive ? "Hoạt động" : "Đã khóa"}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleShowModal(u)} className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-xl border border-transparent transition-all"><FiEdit2 /></button>
                      {u.role !== 'admin' && (
                        <button onClick={() => setConfirmModal({ show: true, userId: u.id, name: u.username })} className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-rose-500 hover:shadow-xl border border-transparent transition-all"><FiTrash2 /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-slate-50 bg-slate-50/20">
          <AppPagination page={currentPage} totalPages={totalPages} onPageChange={p => fetchUsers(p, searchTerm)} />
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
               <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                     <h3 className="text-2xl font-black text-slate-900">{editUser ? "Sửa thành viên" : "Thêm thành viên"}</h3>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Cấu hình định danh & Phân quyền</p>
                  </div>
                  <button onClick={handleCloseModal} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-xl transition-all"><FiX className="text-2xl" /></button>
               </div>

               <form onSubmit={handleSave} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                     <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                           <div className="w-36 h-36 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-indigo-400 hover:bg-indigo-50/30">
                              {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover p-1.5 rounded-[2.5rem]" /> : <FiUser className="text-5xl text-slate-200" />}
                           </div>
                           <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-indigo-600 cursor-pointer hover:bg-indigo-600 hover:text-white transition-all">
                              <FiCamera size={20} />
                              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                           </label>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ảnh đại diện</p>
                     </div>

                     <div className="md:col-span-2 space-y-6">
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Họ và tên *</label>
                           <input name="username" className="input-modern h-12 font-bold focus:ring-4 focus:ring-indigo-50" defaultValue={editUser?.username || ""} required />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ Email *</label>
                           <input name="email" type="email" className="input-modern h-12 font-bold focus:ring-4 focus:ring-indigo-50" defaultValue={editUser?.email || ""} required />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Số điện thoại</label>
                              <input name="phone" className="input-modern h-12 font-bold" defaultValue={editUser?.phone || ""} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Vai trò</label>
                              <div className="relative">
                                 <select name="role" className="input-modern h-12 font-bold appearance-none bg-white pr-10" defaultValue={editUser?.role || "customer"}>
                                    <option value="customer">Khách hàng</option>
                                    <option value="admin">Quản trị viên</option>
                                 </select>
                                 <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ thường trú</label>
                     <input name="address" className="input-modern h-12 font-medium" defaultValue={editUser?.address || ""} placeholder="Số nhà, tên đường, phường/xã..." />
                  </div>

                  <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-slate-100">
                     <button type="button" onClick={handleCloseModal} className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Hủy</button>
                     <button type="submit" disabled={saving} className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 min-w-[180px]">
                        {saving ? "Đang xử lý..." : (editUser ? "Lưu thay đổi" : "Tạo tài khoản")}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmModal({ show: false, userId: null, name: "" })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm"><FiTrash2 /></div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Xóa tài khoản?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">Bạn có chắc muốn gỡ bỏ <strong>{confirmModal.name}</strong>? Mọi dữ liệu đơn hàng và lịch sử sẽ không thể khôi phục.</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setConfirmModal({ show: false, userId: null, name: "" })} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100">Hủy</button>
                 <button onClick={handleConfirmDelete} className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all">Xác nhận</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManage;
