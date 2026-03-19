import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiMail,
  FiPhone,
  FiMapPin,
  FiX,
  FiCamera,
  FiMoreHorizontal
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  deleteUserApi,
  getAllUsersApi,
  registerUser,
  updateUserApi,
} from "../../../api/userApi";
import { useSelector } from "react-redux";
import AppPagination from "../../../components/Pagination/Pagination";

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    userId: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const searchTimeoutRef = useRef(null);

  const fetchUsers = useCallback(
    async (page = 1, searchQuery = "") => {
      setLoading(true);
      try {
        const res = await getAllUsersApi(page, limit, searchQuery.trim());
        if (res.errCode === 0) {
          setCurrentPage(res.pagination.currentPage);
          setTotalPages(res.pagination.totalPages || 1);

          const mappedUsers = (res.data || []).map((u) => ({
            id: u.id,
            name: u.username,
            email: u.email,
            phone: u.phone || "",
            address: u.address || "",
            role: u.role,
            status: u.isActive ? "active" : "blocked",
            avatar: u.avatar || null,
          }));
          setUsers(mappedUsers);
        } else {
          toast.error(res.errMessage || "Lỗi khi tải người dùng");
        }
      } catch (err) {
        console.error("Fetch users error:", err);
        toast.error("Lỗi khi kết nối API");
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, search);
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [search, fetchUsers]);

  const handleShowModal = (user = null) => {
    setEditUser(user);
    setAvatarPreview(user?.avatar || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
    setAvatarPreview(null);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const username = formData.get("username")?.trim();
    const email = formData.get("email")?.trim();
    if (!username || !email) return toast.error("Tên và email không được trống!");

    const data = {
      id: editUser?.id,
      username,
      email,
      phone: formData.get("phone")?.trim() || "",
      address: formData.get("address")?.trim() || "",
      role: formData.get("role"),
      password: editUser ? undefined : "123456",
    };

    const avatarFile = form.querySelector('input[name="avatar"]').files[0];
    if (avatarFile) data.avatar = await fileToBase64(avatarFile);

    try {
      setLoading(true);
      const res = editUser 
        ? await updateUserApi(data) 
        : await registerUser(data);

      if (res.errCode === 0) {
        toast.success(editUser ? "Cập nhật thành công!" : "Thêm người dùng thành công!");
        fetchUsers(currentPage, search);
        handleCloseModal();
      } else toast.error(res.errMessage || "Thao tác thất bại");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.userId) return;
    try {
      const res = await deleteUserApi(confirmModal.userId);
      if (res.errCode === 0) {
        toast.success("Xóa người dùng thành công!");
        fetchUsers(currentPage, search);
      } else toast.error(res.errMessage || "Lỗi khi xóa");
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmModal({ show: false, userId: null });
    }
  };

  const toggleStatus = async (user) => {
    if (user.role === "admin") return toast.warn("Không thể khóa tài khoản Admin!");
    try {
      const newStatus = user.status === "active" ? false : true;
      const res = await updateUserApi({ id: user.id, isActive: newStatus });
      if (res.errCode === 0) {
        toast.success("Cập nhật trạng thái thành công!");
        fetchUsers(currentPage, search);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
              <FiUser />
            </div>
            Quản lý người dùng
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 ml-13">Quản trị viên, khách hàng và phân quyền hệ thống.</p>
        </div>
        
        <button 
          onClick={() => handleShowModal()}
          className="btn-modern-primary group"
        >
          <FiUserPlus className="text-lg group-hover:scale-110 transition-transform" />
          <span>Thêm thành viên mới</span>
        </button>
      </div>

      {/* Content */}
      <div className="card-modern">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
           <div className="relative w-full md:w-96">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm tên hoặc email..." 
                className="input-modern pl-11 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phân loại:</span>
              <select className="text-xs font-bold text-slate-600 bg-transparent border-none outline-none focus:ring-0 cursor-pointer">
                 <option value="">Tất cả</option>
                 <option value="admin">Quản trị viên</option>
                 <option value="customer">Khách hàng</option>
              </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thành viên</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Liên hệ</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Địa chỉ</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Vai trò</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(limit).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                             {u.avatar ? (
                               <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl"><FiUser /></div>
                             )}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">{u.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: #{u.id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><FiMail className="text-primary/60" /> {u.email}</p>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><FiPhone /> {u.phone || "—"}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                       <p className="text-xs font-medium text-slate-500 truncate flex items-center gap-2">
                          <FiMapPin className="flex-shrink-0" /> {u.address || "Chưa cập nhật"}
                       </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         u.role === 'admin' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : 'bg-primary/5 text-primary border border-primary/10'
                       }`}>
                          {u.role === 'admin' ? <FiShield /> : <FiUser />}
                          {u.role}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button 
                        onClick={() => toggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                         u.status === 'active' 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" 
                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                       }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                         {u.status === 'active' ? "Hoạt động" : "Đã khóa"}
                       </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleShowModal(u)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-primary hover:shadow-md border border-transparent hover:border-slate-100 transition-all"
                            title="Sửa"
                          >
                            <FiEdit2 />
                          </button>
                          {u.role !== 'admin' && (
                            <button 
                              onClick={() => setConfirmModal({ show: true, userId: u.id })}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                              title="Xóa"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">Không có thành viên nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/20">
           <AppPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => fetchUsers(p, search)}
           />
        </div>
      </div>

      {/* User Modal */}
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
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
               <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {editUser ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
                     </h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Quản lý định danh người dùng</p>
                  </div>
                  <button onClick={handleCloseModal} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md transition-all">
                    <FiX className="text-xl" />
                  </button>
               </div>

               <form onSubmit={handleSave} className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {/* Left: Avatar Upload */}
                     <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                           <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                              {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover p-1 rounded-3xl" />
                              ) : (
                                <FiUser className="text-4xl text-slate-300" />
                              )}
                           </div>
                           <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-all scale-90 group-hover:scale-100">
                              <FiCamera />
                              <input 
                                type="file" 
                                name="avatar" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) setAvatarPreview(URL.createObjectURL(file));
                                }}
                              />
                           </label>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase text-center">Tải lên ảnh đại diện</p>
                     </div>

                     {/* Right: Info fields */}
                     <div className="md:col-span-2 space-y-5">
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Họ và tên *</label>
                           <input 
                            name="username" 
                            className="input-modern font-bold" 
                            defaultValue={editUser?.name || ""} 
                            required 
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ Email *</label>
                           <input 
                            name="email" 
                            type="email"
                            className="input-modern font-bold" 
                            defaultValue={editUser?.email || ""} 
                            required 
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Số điện thoại</label>
                              <input name="phone" className="input-modern" defaultValue={editUser?.phone || ""} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Vai trò</label>
                              <select name="role" className="input-modern font-bold" defaultValue={editUser?.role || "customer"}>
                                 <option value="customer">Khách hàng</option>
                                 <option value="admin">Quản trị viên</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ thường trú</label>
                           <input name="address" className="input-modern" defaultValue={editUser?.address || ""} />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-10">
                     <button type="button" onClick={handleCloseModal} className="btn-modern-white px-8">Hủy bỏ</button>
                     <button type="submit" className="btn-modern-primary px-8">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (editUser ? "Cập nhật" : "Tạo tài khoản")}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ show: false, userId: null })}
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
              <h3 className="text-xl font-black text-slate-900 mb-2">Xóa thành viên?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">Bạn có chắc chắn muốn xóa thành viên này khỏi hệ thống? Dữ liệu liên quan có thể bị ảnh hưởng.</p>
              
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setConfirmModal({ show: false, userId: null })} className="btn-modern-white">Hủy</button>
                 <button onClick={handleConfirmDelete} className="btn-modern bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20">Xác nhận xóa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManage;
