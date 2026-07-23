import React, { useEffect, useState, useCallback } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiDollarSign,
  FiRefreshCw,
  FiRotateCw,
  FiEye,
  FiPackage,
  FiMessageSquare,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { getAllOrders } from "../../../api/orderApi";
import { processReturn } from "../../../api/orderItemApi";
import AppPagination from "../../../components/Pagination/Pagination";
import { paymentStatusMap } from "../../../utils/StatusMap";
import { StatusBadge } from "../../../utils/StatusBadge";
import { ConfirmModal } from "../../../components/UI/Modal";

const OrdersReturnPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    approve: true,
  });
  const limit = 10;

  const fetchOrders = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      try {
        const res = await getAllOrders(currentPage, limit, "", "", true, false);
        if (res.errCode === 0) {
          setOrders(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setPage(currentPage);
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi tải danh sách yêu cầu trả hàng");
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleProcessReturnAction = async () => {
    if (!selectedOrder) return;
    const { approve } = confirmModal;
    setLoadingAction(true);
    try {
      const finalStatus = approve ? "completed" : "rejected";
      const itemsToProcess = selectedOrder.orderItems.filter(
        (i) => i.returnStatus === "requested",
      );

      for (let item of itemsToProcess) {
        await processReturn(item.id, finalStatus);
      }

      toast.success(
        approve
          ? "Đã duyệt và hoàn tất trả hàng (Kho đã cập nhật)!"
          : "Đã từ chối yêu cầu!",
      );
      fetchOrders(page);
      setModalShow(false);
      setConfirmModal({ show: false, approve: true });
    } catch (err) {
      toast.error("Lỗi xử lý trả hàng");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="p-2.5 sm:p-6 bg-slate-50 dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Quản lý trả hàng
            </h1>
            <p className="text-slate-500 dark:text-dark-text-secondary text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium">
              Duyệt và xử lý các yêu cầu trả hàng từ khách hàng.
            </p>
          </div>
          <button
            onClick={() => fetchOrders(page)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm min-h-[44px] shrink-0"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Làm mới
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border animate-pulse"
              ></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-dark-border p-10 sm:p-20 text-center shadow-sm">
            <div className="size-16 sm:size-20 bg-slate-50 dark:bg-dark-bg rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-slate-300 dark:text-slate-700">
              <FiPackage className="text-3xl sm:text-4xl" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 uppercase">
              Không có yêu cầu trả hàng
            </h3>
            <p className="text-slate-500 dark:text-dark-text-secondary font-medium text-xs sm:text-sm">
              Tất cả các yêu cầu đã được xử lý xong.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {orders.map((order) => (
              <Motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id}
                className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group"
              >
                <div className="p-5 border-b border-slate-50 dark:border-dark-border bg-slate-50/30 dark:bg-dark-bg/30 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-dark-bg px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border shadow-sm uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                    #{order.orderCode}
                  </span>
                  <StatusBadge
                    map={paymentStatusMap}
                    status={order.paymentStatus}
                    className="text-[10px]"
                  />
                </div>

                <div className="p-5 flex-grow space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-indigo-600/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <FiUser />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {order.user?.username}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-dark-text-secondary font-medium">
                        {order.user?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.orderItems?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-100 dark:border-dark-border transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div className="size-10 bg-white dark:bg-dark-surface rounded-lg p-1 border border-slate-100 dark:border-dark-border shrink-0">
                          <img
                            src={item.image}
                            className="w-full h-full object-contain dark:mix-blend-normal"
                            alt=""
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-dark-text-secondary italic truncate mt-0.5">
                            Lý do: {item.returnReason || "Không có"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-50 dark:border-dark-border">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-dark-text-secondary font-bold text-[10px] uppercase tracking-widest">
                      <FiClock className="text-indigo-500" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-black">
                      <FiDollarSign className="text-indigo-600 dark:text-indigo-400" />
                      <span>{Number(order.totalPrice).toLocaleString()} ₫</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 mt-auto">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setModalShow(true);
                    }}
                    className="w-full h-11 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FiEye /> Xem & Xử lý ngay
                  </button>
                </div>
              </Motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <AppPagination
              page={page}
              totalPages={totalPages}
              onPageChange={fetchOrders}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Modal Xử lý Trả hàng */}
      <AnimatePresence>
        {modalShow && selectedOrder && (
          <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalShow(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            />
            <Motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative bg-white dark:bg-dark-surface rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full max-h-[92vh] sm:max-h-[85vh] overflow-hidden border border-slate-200/80 dark:border-dark-border flex flex-col transition-colors duration-300"
            >
              {/* Mobile Drag Indicator Pill */}
              <div className="flex justify-center pt-2.5 pb-1 sm:hidden bg-slate-50/80 dark:bg-slate-950/60">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar text-center">
                <div className="size-14 sm:size-16 bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3.5 shadow-inner">
                  <FiRotateCw />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                  Chi tiết yêu cầu
                </h3>
                <p className="text-slate-500 dark:text-dark-text-secondary text-xs mb-4 font-medium">
                  Đơn hàng{" "}
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    #{selectedOrder.orderCode}
                  </span>
                </p>

                <div className="space-y-3 mb-4 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50/80 dark:bg-dark-bg/80 rounded-2xl border border-slate-100 dark:border-dark-border text-left"
                    >
                      <div className="flex gap-3 items-center mb-2.5">
                        <div className="size-11 bg-white dark:bg-dark-surface rounded-xl p-1 border border-slate-100 dark:border-dark-border overflow-hidden shrink-0 shadow-2xs">
                          <img
                            src={item.image}
                            className="w-full h-full object-contain dark:mix-blend-normal"
                            alt=""
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.productName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest bg-white dark:bg-dark-surface px-1.5 py-0.5 rounded border border-slate-100 dark:border-dark-border">
                              SL: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2.5 border-t border-slate-200/60 dark:border-dark-border/50">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <FiMessageSquare /> Lý do trả hàng
                        </p>
                        <div className="p-2.5 bg-white dark:bg-dark-surface rounded-xl border border-slate-100 dark:border-dark-border shadow-2xs italic text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          "
                          {item.returnReason ||
                            "Khách hàng không để lại lý do chi tiết"}
                          "
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      setModalShow(false);
                      setTimeout(
                        () => setConfirmModal({ show: true, approve: false }),
                        200,
                      );
                    }}
                    className="flex-1 h-11 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-rose-100 dark:border-rose-900/30 cursor-pointer active:scale-95"
                  >
                    <FiXCircle className="text-base" /> TỪ CHỐI
                  </button>
                  <button
                    onClick={() => {
                      setModalShow(false);
                      setTimeout(
                        () => setConfirmModal({ show: true, approve: true }),
                        200,
                      );
                    }}
                    className="flex-1 h-11 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-900 dark:hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <FiCheckCircle className="text-base" /> DUYỆT TRẢ
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ ...confirmModal, show: false })}
        onConfirm={handleProcessReturnAction}
        title={
          confirmModal.approve
            ? "Xác nhận duyệt trả hàng?"
            : "Xác nhận từ chối trả hàng?"
        }
        message={
          confirmModal.approve
            ? "Hành động này sẽ xác nhận sản phẩm đã được trả về kho và hoàn tiền cho khách."
            : "Hành động này sẽ từ chối yêu cầu trả hàng của khách hàng."
        }
        confirmText="Xác nhận"
        variant={confirmModal.approve ? "primary" : "danger"}
        icon={confirmModal.approve ? FiRotateCw : FiXCircle}
        iconClassName={
          confirmModal.approve
            ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            : "bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400"
        }
        loading={loadingAction}
      />
    </div>
  );
};

export default OrdersReturnPage;
