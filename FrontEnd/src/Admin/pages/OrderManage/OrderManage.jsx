import React from "react";
import { ShoppingCart, Search, RefreshCw } from "lucide-react";
import AppPagination from "../../../components/Pagination/Pagination";
import AdminOrderDetailModal from "./AdminOrderDetailModal";
import AdminPageShell from "../../components/AdminPageShell";
import { useAdminOrders } from "./hooks/useAdminOrders";
import OrderStatsHeader from "./components/OrderStatsHeader";
import OrderFiltersBar from "./components/OrderFiltersBar";
import OrderDesktopTable from "./components/OrderDesktopTable";
import OrderMobileList from "./components/OrderMobileList";
import OrderStatusModal from "./components/OrderStatusModal";
import OrderActionModals from "./components/OrderActionModals";

const OrderManage = () => {
  const {
    orders,
    selectedDetailOrder,
    setSelectedDetailOrder,
    confirmModal,
    setConfirmModal,
    statusModal,
    setStatusModal,
    loading,
    loadingId,
    isUpdating,
    isDeleting,
    page,
    totalPages,
    searchTerm,
    setSearchTerm,
    activeTab,
    summaryStats,
    handleTabChange,
    fetchOrders,
    openStatusModal,
    closeStatusModal,
    handleConfirmStatusModal,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmModalAction,
  } = useAdminOrders();

  return (
    <AdminPageShell
      title={
        <span className="flex items-center gap-2.5">
          <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShoppingCart className="size-4.5" />
          </span>
          <span>Quản lý Đơn hàng</span>
        </span>
      }
      subtitle="Theo dõi, xử lý và cập nhật trạng thái đơn hàng của hệ thống"
      actions={
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách, SĐT..."
              className="w-full h-10 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl pl-9 pr-3 text-xs font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => fetchOrders(1, searchTerm, activeTab)}
            title="Làm mới dữ liệu"
            aria-label="Làm mới dữ liệu đơn hàng"
            className="size-10 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary rounded-xl flex items-center justify-center hover:text-primary hover:border-primary/50 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      }
      className="text-slate-800 dark:text-dark-text-primary"
    >
      <OrderStatsHeader summaryStats={summaryStats} />

      <OrderFiltersBar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-2xs overflow-hidden">
        <OrderDesktopTable
          orders={orders}
          loading={loading}
          loadingId={loadingId}
          onSelectDetail={setSelectedDetailOrder}
          onOpenStatusModal={openStatusModal}
          onOpenConfirmModal={openConfirmModal}
        />

        <OrderMobileList
          orders={orders}
          loading={loading}
          onSelectDetail={setSelectedDetailOrder}
          onOpenStatusModal={openStatusModal}
          onOpenConfirmModal={openConfirmModal}
        />

        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400 dark:text-dark-text-secondary">
            Trang {page} / {totalPages}
          </p>
          <AppPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchOrders(p, searchTerm, activeTab)}
          />
        </div>
      </div>

      <OrderStatusModal
        statusModal={statusModal}
        setStatusModal={setStatusModal}
        isUpdating={isUpdating}
        onClose={closeStatusModal}
        onConfirm={handleConfirmStatusModal}
      />

      <OrderActionModals
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        isDeleting={isDeleting}
        onClose={closeConfirmModal}
        onConfirmAction={handleConfirmModalAction}
      />

      <AdminOrderDetailModal
        order={selectedDetailOrder}
        isOpen={Boolean(selectedDetailOrder)}
        onClose={() => setSelectedDetailOrder(null)}
        onOrderUpdated={() => fetchOrders(page, searchTerm, activeTab)}
      />
    </AdminPageShell>
  );
};

export default OrderManage;
