import React, { useMemo } from "react";
import { User, Mail, Phone } from "lucide-react";
import GenericAdminTable from "../../components/GenericAdminTable";
import GenericAdminModal from "../../components/GenericAdminModal";
import { ConfirmModal } from "../../../components/UI/Modal";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { getUserStatusDisplay, getUserFormFields } from "./userManageConstants";
import UserMetricsCards from "./components/UserMetricsCards";
import UserFilterToolbar from "./components/UserFilterToolbar";
import UserBulkActionsBar from "./components/UserBulkActionsBar";
import UserActionButtons from "./components/UserActionButtons";
import UserStatusModals from "./components/UserStatusModals";
import UserAuditLogsModal from "./components/UserAuditLogsModal";

const UserManage = () => {
  const {
    currentUser,
    data: users,
    loading,
    saving,
    deleting,
    showModal,
    editingItem: editUser,
    searchTerm,
    setSearchTerm,
    page,
    totalPages,
    totalItems,
    handleShowModal,
    handleCloseModal,
    handleDelete,
    showDeleteModal,
    setShowDeleteModal,
    deletingItem,
    confirmDelete,
    setPage,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    metrics,
    loadingMetrics,
    selectedIds,
    setSelectedIds,
    showBulkModal,
    setShowBulkModal,
    bulkAction,
    bulkReason,
    setBulkReason,
    bulkProcessing,
    showStatusModal,
    setShowStatusModal,
    targetUserForStatus,
    targetNextStatus,
    statusReason,
    setStatusReason,
    statusProcessing,
    showAuditModal,
    setShowAuditModal,
    auditLogs,
    auditLoading,
    selectedUserForAudit,
    auditPage,
    auditTotalPages,
    auditTotalItems,
    handleToggleSelectAll,
    handleToggleSelect,
    handleOpenStatusModal,
    handleConfirmStatusChange,
    handleOpenBulkModal,
    handleConfirmBulkAction,
    handleOpenAuditModal,
    handleAuditPageChange,
    onSaveUser,
  } = useAdminUsers();

  const selectableCount = users.filter((u) => u.id !== currentUser?.id).length;

  const columns = [
    {
      header: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectableCount > 0 && selectedIds.length === selectableCount}
            onChange={handleToggleSelectAll}
            className="rounded text-primary focus:ring-primary size-4 cursor-pointer"
            title="Chọn tất cả trang này"
            aria-label="Chọn tất cả trang này"
          />
        </div>
      ),
      className: "w-10 text-center",
      render: (item) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedIds.includes(item.id)}
            onChange={() => handleToggleSelect(item.id)}
            disabled={currentUser?.id === item.id}
            className="rounded text-primary focus:ring-primary size-4 cursor-pointer disabled:opacity-40"
            aria-label={`Chọn người dùng ${item.username}`}
          />
        </div>
      ),
    },
    {
      header: "Thành viên",
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-full bg-slate-100 dark:bg-dark-bg overflow-hidden shrink-0">
            {item.avatar ? (
              <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                <User className="size-4" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                {item.username}
              </p>
              {currentUser?.id === item.id && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-primary/10 text-primary uppercase">
                  Bạn
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400 dark:text-dark-text-secondary/60 uppercase tracking-tighter truncate">
              ID: {item.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Liên hệ",
      render: (item) => (
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-dark-text-secondary truncate">
            <Mail className="text-primary shrink-0 size-3.5" />
            <span className="truncate">{item.email}</span>
          </div>
          {item.phone && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-dark-text-secondary truncate">
              <Phone className="text-primary shrink-0 size-3.5" />
              <span className="truncate">{item.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Hạng TV",
      render: (item) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
            item.rank === "Platinum"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : item.rank === "Gold"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary"
          }`}
        >
          {item.rank || "Đồng"}
        </span>
      ),
    },
    {
      header: "Vai trò",
      render: (item) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
            item.role === "admin"
              ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
              : "bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-light"
          }`}
        >
          {item.role === "admin" ? "Quản trị" : "Khách hàng"}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      render: (item) => {
        const info = getUserStatusDisplay(item);
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${info.colorClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${info.dotClass}`} />
            {info.label}
          </span>
        );
      },
    },
  ];

  const formFields = useMemo(() => getUserFormFields(editUser), [editUser]);

  return (
    <>
      <GenericAdminTable
        title="Quản trị Thành viên & Kích hoạt"
        subtitle="Quản lý tài khoản, Kích hoạt OTP, Phân quyền & Nhật ký Audit"
        icon={User}
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
        renderActions={(item) => (
          <UserActionButtons
            item={item}
            currentUserId={currentUser?.id}
            onOpenStatusModal={handleOpenStatusModal}
            onOpenAuditModal={handleOpenAuditModal}
            onEdit={handleShowModal}
            onDelete={handleDelete}
          />
        )}
        headerExtra={
          <UserMetricsCards
            metrics={metrics}
            loadingMetrics={loadingMetrics}
            totalItems={totalItems}
          />
        }
        extraControls={
          <UserFilterToolbar
            statusFilter={statusFilter}
            roleFilter={roleFilter}
            onStatusChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            onRoleChange={(val) => {
              setRoleFilter(val);
              setPage(1);
            }}
            onResetFilters={() => {
              setStatusFilter("all");
              setRoleFilter("all");
              setPage(1);
            }}
            onOpenGlobalAudit={() => handleOpenAuditModal(null)}
          />
        }
        bulkActionsBar={
          <UserBulkActionsBar
            selectedCount={selectedIds.length}
            onOpenBulkModal={handleOpenBulkModal}
            onClearSelection={() => setSelectedIds([])}
          />
        }
      />

      <GenericAdminModal
        show={showModal}
        onClose={handleCloseModal}
        title="Người dùng"
        editingItem={editUser}
        fields={formFields}
        onSave={onSaveUser}
        saving={saving}
      />

      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa tài khoản"
        variant="danger"
        loading={deleting}
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deletingItem?.username}"? Mọi dữ liệu liên quan sẽ bị mất.`}
      />

      <UserStatusModals
        showStatusModal={showStatusModal}
        onCloseStatusModal={() => setShowStatusModal(false)}
        targetUserForStatus={targetUserForStatus}
        targetNextStatus={targetNextStatus}
        statusReason={statusReason}
        onStatusReasonChange={setStatusReason}
        statusProcessing={statusProcessing}
        onConfirmStatusChange={handleConfirmStatusChange}
        showBulkModal={showBulkModal}
        onCloseBulkModal={() => setShowBulkModal(false)}
        bulkAction={bulkAction}
        selectedCount={selectedIds.length}
        bulkReason={bulkReason}
        onBulkReasonChange={setBulkReason}
        bulkProcessing={bulkProcessing}
        onConfirmBulkAction={handleConfirmBulkAction}
      />

      <UserAuditLogsModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        selectedUserForAudit={selectedUserForAudit}
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditPage={auditPage}
        auditTotalPages={auditTotalPages}
        auditTotalItems={auditTotalItems}
        onPageChange={handleAuditPageChange}
      />
    </>
  );
};

export default UserManage;
