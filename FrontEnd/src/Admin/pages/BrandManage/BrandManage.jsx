import React from "react";
import { FiTag } from "react-icons/fi";
import { brandApi } from "../../../api/brandApi";
import { useAdminCrud } from "../../../hooks/useAdminCrud";
import GenericAdminTable from "../../components/GenericAdminTable";
import GenericAdminModal from "../../components/GenericAdminModal";
import { ConfirmModal } from "../../../components/UI/Modal";
import { generateSlug } from "../../../utils/slugHelper";

const BrandManage = () => {
  const {
    data: brands,
    loading,
    saving,
    showModal,
    editingItem: editingBrand,
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
  } = useAdminCrud(brandApi, { itemName: "Thương hiệu" });

  const columns = [
    {
      header: "Logo",
      render: (item) => (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shadow-inner">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <FiTag className="text-xl" />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Tên Thương Hiệu",
      render: (item) => (
        <div>
          <p className="text-sm font-black text-slate-900 leading-tight">{item.name}</p>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-tight uppercase">
            ID: {item.id}
          </p>
        </div>
      ),
    },
    {
      header: "Mô tả",
      render: (item) => (
        <p className="text-xs font-medium text-slate-500 max-w-xs line-clamp-2">
          {item.description || "Chưa có mô tả"}
        </p>
      ),
    },
    {
      header: "Sản phẩm",
      render: (item) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-black">
          {item.productCount || 0} ITEMS
        </span>
      ),
    },
  ];

  const formFields = [
    { name: "name", label: "Tên thương hiệu", placeholder: "Nhập tên nhãn hàng...", required: true },
    { name: "description", label: "Mô tả chi tiết", type: "textarea", placeholder: "Thông tin về thương hiệu...", fullWidth: true },
    { name: "image", label: "Logo thương hiệu", type: "image", fullWidth: true },
  ];

  const onSave = async (formData) => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description || "");
    data.append("slug", generateSlug(formData.name));
    if (formData.imageFile) {
      data.append("image", formData.imageFile);
    }
    await handleSave(data);
  };

  return (
    <>
      <GenericAdminTable
        title="Quản lý Thương hiệu"
        subtitle="Đối tác & Nhãn hàng liên kết"
        icon={FiTag}
        columns={columns}
        data={brands}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleShowModal()}
        onEditClick={handleShowModal}
        onDeleteClick={handleDelete}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        addLabel="Thêm Brand"
        searchPlaceholder="Tìm thương hiệu..."
      />

      <GenericAdminModal
        show={showModal}
        onClose={handleCloseModal}
        title="Thương hiệu"
        editingItem={editingBrand}
        fields={formFields}
        onSave={onSave}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa thương hiệu "${deletingItem?.name}"? Hành động này không thể hoàn tác.`}
      />
    </>
  );
};

export default BrandManage;
