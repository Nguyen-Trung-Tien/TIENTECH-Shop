import React, { useMemo } from "react";
import { FiLayers } from "react-icons/fi";
import { categoryApi } from "../../../api/categoryApi";
import { useAdminCrud } from "../../../hooks/useAdminCrud";
import GenericAdminTable from "../../components/GenericAdminTable";
import GenericAdminModal from "../../components/GenericAdminModal";
import { ConfirmModal } from "../../../components/UI/Modal";
import { generateSlug } from "../../../utils/slugHelper";

const Categories = () => {
  const {
    data: categories,
    loading,
    saving,
    showModal,
    editingItem: editingCategory,
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
  } = useAdminCrud(categoryApi, { itemName: "Danh mục" });

  const columns = [
    {
      header: "Hình ảnh",
      render: (item) => (
        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <FiLayers />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Tên Danh Mục",
      render: (item) => (
        <div>
          <p className="text-sm font-black text-slate-900">{item.name}</p>
          {item.parent && (
            <p className="text-[10px] font-bold text-indigo-500 uppercase mt-0.5">
              Con của: {item.parent.name}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Slug",
      accessor: "slug",
      className: "hidden md:table-cell text-xs font-mono text-slate-400",
    },
    {
      header: "Số sản phẩm",
      render: (item) => (
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black">
          {item.productCount || 0} SP
        </span>
      ),
    },
  ];

  // Prepare parent category options for the select field
  const parentOptions = useMemo(() => {
    return categories
      .filter(c => !c.parentId && (!editingCategory || c.id !== editingCategory.id))
      .map(c => ({ label: c.name, value: c.id }));
  }, [categories, editingCategory]);

  const formFields = [
    { name: "name", label: "Tên danh mục", placeholder: "Ví dụ: Điện thoại, Laptop...", required: true },
    { 
      name: "parentId", 
      label: "Danh mục cha", 
      type: "select", 
      options: parentOptions,
      placeholder: "Chọn nếu là danh mục con" 
    },
    { name: "description", label: "Mô tả", type: "textarea", fullWidth: true },
    { name: "image", label: "Ảnh đại diện", type: "image", fullWidth: true },
  ];

  const onSave = async (formData) => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description || "");
    data.append("slug", generateSlug(formData.name));
    if (formData.parentId) data.append("parentId", formData.parentId);
    if (formData.imageFile) data.append("image", formData.imageFile);

    await handleSave(data);
  };

  return (
    <>
      <GenericAdminTable
        title="Danh mục Sản phẩm"
        subtitle="Xây dựng cấu trúc phân loại"
        icon={FiLayers}
        columns={columns}
        data={categories}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleShowModal()}
        onEditClick={handleShowModal}
        onDeleteClick={handleDelete}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        addLabel="Thêm danh mục"
      />

      <GenericAdminModal
        show={showModal}
        onClose={handleCloseModal}
        title="Danh mục"
        editingItem={editingCategory}
        fields={formFields}
        onSave={onSave}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Xóa danh mục "${deletingItem?.name}" sẽ ảnh hưởng đến các sản phẩm thuộc danh mục này. Bạn có chắc chắn?`}
      />
    </>
  );
};

export default Categories;
