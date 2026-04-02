import React from "react";
import { FiUser, FiShield, FiMail, FiPhone } from "react-icons/fi";
import { userApi } from "../../../api/userApi";
import { useAdminCrud } from "../../../hooks/useAdminCrud";
import GenericAdminTable from "../../components/GenericAdminTable";
import GenericAdminModal from "../../components/GenericAdminModal";
import { ConfirmModal } from "../../../components/UI/Modal";

const UserManage = () => {
  const {
    data: users,
    loading,
    saving,
    showModal,
    editingItem: editUser,
    searchTerm,
    setSearchTerm,
    page,
    totalPages,
    handleShowModal,
    handleCloseModal,
    handleSave,
    handleDelete,
    showDeleteModal,
    setShowDeleteModal,
    deletingItem,
    confirmDelete,
    setPage,
  } = useAdminCrud(userApi, { itemName: "Người dùng", initialLimit: 8 });

  const columns = [
    {
      header: "Thành viên",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
            {item.avatar ? (
              <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <FiUser />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">{item.username}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              ID: {item.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Liên hệ",
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <FiMail className="text-indigo-400" /> {item.email}
          </div>
          {item.phone && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <FiPhone className="text-indigo-400" /> {item.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Vai trò",
      render: (item) => (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
          item.role === 'admin' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
        }`}>
          {item.role}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
          item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {item.isActive ? 'Hoạt động' : 'Bị khóa'}
        </span>
      ),
    },
  ];

  const formFields = [
    { name: "username", label: "Tên đăng nhập", placeholder: "Nhập tên người dùng...", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "example@mail.com", required: true },
    { name: "phone", label: "Số điện thoại", placeholder: "Nhập số điện thoại..." },
    { name: "address", label: "Địa chỉ", placeholder: "Nhập địa chỉ..." },
    { 
      name: "role", 
      label: "Phân quyền", 
      type: "select", 
      options: [
        { label: "Quản trị viên", value: "admin" },
        { label: "Khách hàng", value: "customer" }
      ],
      required: true 
    },
    { name: "isActive", label: "Trạng thái tài khoản", type: "checkbox", placeholder: "Tài khoản đang hoạt động" },
    { name: "avatar", label: "Ảnh đại diện", type: "image", fullWidth: true },
  ];

  const onSave = async (formData) => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key.endsWith('File')) {
        data.append(key.replace('File', ''), formData[key]);
      } else if (formData[key] !== undefined && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });
    // Add default password for new users if not provided
    if (!editUser && !formData.password) {
        data.append("password", "123456");
    }
    await handleSave(data);
  };

  return (
    <>
      <GenericAdminTable
        title="Quản trị Thành viên"
        subtitle="Quản lý tài khoản & Phân quyền"
        icon={FiUser}
        columns={columns}
        data={users}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleShowModal()}
        onEditClick={handleShowModal}
        onDeleteClick={handleDelete}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        addLabel="Thêm thành viên"
      />

      <GenericAdminModal
        show={showModal}
        onClose={handleCloseModal}
        title="Người dùng"
        editingItem={editUser}
        fields={formFields}
        onSave={onSave}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deletingItem?.username}"? Mọi dữ liệu liên quan sẽ bị mất.`}
      />
    </>
  );
};

export default UserManage;
