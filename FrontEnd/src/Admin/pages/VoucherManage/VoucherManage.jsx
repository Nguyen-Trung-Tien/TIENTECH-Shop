import React from "react";
import { FiGift, FiPercent, FiCalendar, FiUsers } from "react-icons/fi";
import { voucherApi } from "../../../api/voucherApi";
import { useAdminCrud } from "../../../hooks/useAdminCrud";
import GenericAdminTable from "../../components/GenericAdminTable";
import GenericAdminModal from "../../components/GenericAdminModal";
import { ConfirmModal } from "../../../components/UI/Modal";

const VoucherManage = () => {
  const {
    data: vouchers,
    loading,
    saving,
    showModal,
    editingItem: editingVoucher,
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
  } = useAdminCrud(voucherApi, { itemName: "Voucher", initialLimit: 8 });

  const columns = [
    {
      header: "Mã & Tên",
      render: (item) => (
        <div>
          <p className="text-sm font-black text-indigo-600 tracking-wider uppercase">{item.code}</p>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">{item.name || 'Không có tên'}</p>
        </div>
      ),
    },
    {
      header: "Ưu đãi",
      render: (item) => (
        <div className="flex items-center gap-1 text-sm font-black text-rose-600">
          <FiPercent className="text-rose-400" />
          {item.type === 'percentage' 
            ? `${item.value || 0}%` 
            : `${Number(item.value || 0).toLocaleString()}đ`}
        </div>
      ),
    },
    {
        header: "Sử dụng",
        render: (item) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <FiUsers className="text-slate-400" /> {item.usedCount || 0} / {item.maxUsage || '∞'}
            </div>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, ((item.usedCount || 0) / (item.maxUsage || 100)) * 100)}%` }}
                />
            </div>
          </div>
        ),
    },
    {
      header: "Thời hạn",
      render: (item) => (
        <div className="text-[11px] font-bold text-slate-500 space-y-0.5">
          <div className="flex items-center gap-1">
            <FiCalendar className="text-indigo-400" /> 
            {item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'N/A'}
          </div>
          <div className="flex items-center gap-1 opacity-60">
            đến {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      render: (item) => {
          const now = new Date();
          const isExpired = item.endDate && new Date(item.endDate) < now;
          const isStarted = item.startDate && new Date(item.startDate) <= now;
          
          let statusLabel = "Đang chạy";
          let statusColor = "bg-emerald-50 text-emerald-600";
          
          if (isExpired) {
              statusLabel = "Hết hạn";
              statusColor = "bg-rose-50 text-rose-600";
          } else if (!isStarted) {
              statusLabel = "Chờ lịch";
              statusColor = "bg-amber-50 text-amber-600";
          } else if (!item.isActive) {
              statusLabel = "Đã khóa";
              statusColor = "bg-slate-100 text-slate-400";
          }

          return (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColor}`}>
              {statusLabel}
            </span>
          );
      },
    },
  ];

  const formFields = [
    { name: "code", label: "Mã Voucher", placeholder: "Ví dụ: KHUYENMAI2024", required: true },
    { name: "name", label: "Tên chương trình", placeholder: "Ví dụ: Giảm giá mùa hè", required: true },
    { 
      name: "type", 
      label: "Loại giảm giá", 
      type: "select", 
      options: [
        { label: "Phần trăm (%)", value: "percentage" },
        { label: "Số tiền cố định (đ)", value: "fixed" }
      ],
      required: true 
    },
    { name: "value", label: "Giá trị giảm", type: "number", placeholder: "10 hoặc 50000...", required: true },
    { name: "minOrderValue", label: "Đơn tối thiểu", type: "number", placeholder: "0", defaultValue: 0 },
    { name: "maxDiscount", label: "Giảm tối đa (đ)", type: "number", placeholder: "Ví dụ: 100000", helpText: "Chỉ dùng cho loại phần trăm" },
    { name: "maxUsage", label: "Số lượng tối đa", type: "number", placeholder: "100", defaultValue: 100 },
    { name: "perUserUsage", label: "Lượt dùng/Người", type: "number", placeholder: "1", defaultValue: 1 },
    { name: "startDate", label: "Ngày bắt đầu", type: "date", required: true },
    { name: "endDate", label: "Ngày kết thúc", type: "date", required: true },
    { name: "description", label: "Mô tả", type: "textarea", fullWidth: true },
    { name: "isActive", label: "Kích hoạt", type: "checkbox", placeholder: "Cho phép sử dụng ngay" },
  ];

  const onSave = async (formData) => {
    const payload = { ...formData };
    await handleSave(payload);
  };

  const handleEditClick = (item) => {
    const formattedItem = { ...item };
    if (formattedItem.startDate) {
      formattedItem.startDate = new Date(formattedItem.startDate).toISOString().split('T')[0];
    }
    if (formattedItem.endDate) {
      formattedItem.endDate = new Date(formattedItem.endDate).toISOString().split('T')[0];
    }
    handleShowModal(formattedItem);
  };

  return (
    <>
      <GenericAdminTable
        title="Quản lý Vouchers"
        subtitle="Chương trình ưu đãi & Mã giảm giá"
        icon={FiGift}
        columns={columns}
        data={vouchers}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleShowModal()}
        onEditClick={handleEditClick}
        onDeleteClick={handleDelete}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        addLabel="Tạo Voucher"
      />

      <GenericAdminModal
        show={showModal}
        onClose={handleCloseModal}
        title="Voucher"
        editingItem={editingVoucher}
        fields={formFields}
        onSave={onSave}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Xóa voucher "${deletingItem?.code}"? Người dùng sẽ không thể sử dụng mã này nữa.`}
      />
    </>
  );
};

export default VoucherManage;
