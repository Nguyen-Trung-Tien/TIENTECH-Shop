import React, { useEffect, useState, useCallback } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiClock,
  FiUser,
  FiDollarSign,
  FiRefreshCw,
  FiEye,
  FiPackage,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { getAllOrders, updateOrderStatus } from "../../../api/orderApi";
import AppPagination from "../../../components/Pagination/Pagination";
import { paymentStatusMap } from "../../../utils/StatusMap";
import { StatusBadge } from "../../../utils/StatusBadge";
import { ConfirmModal } from "../../../components/UI/Modal";

const OrdersCancelManage = () => {
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
        const res = await getAllOrders(currentPage, limit, "", "", false, true);
        if (res.errCode === 0) {
          setOrders(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setPage(currentPage);
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi tải danh sách yêu cầu hủy");
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleProcessCancel = async () => {
    if (!selectedOrder) return;
    const { approve } = confirmModal;
    setLoadingAction(true);
    try {
      const finalStatus = approve ? "cancelled" : "pending";
      const res = await updateOrderStatus(selectedOrder.id, finalStatus);

      if (res.errCode === 0) {
        toast.success(
          approve ? "Đã chấp nhận hủy đơn!" : "Đã từ chối yêu cầu hủy!",
        );
        fetchOrders(page);
        setModalShow(false);
        setConfirmModal({ show: false, approve: true });
      } else {
        toast.error(res.errMessage || "Lỗi xử lý");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Duyệt yêu cầu hủy đơn
            </h1>
            <p className="text-slate-500 dark:text-dark-text-secondary text-sm mt-1 font-medium">
              Xử lý các yêu cầu hủy đơn hàng từ khách hàng.
            </p>
          </div>
          <button
            onClick={() => fetchOrders(page)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl text-sm font-bold text-slate-600 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Làm mới
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border animate-pulse"
              ></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-dark-bg rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-700">
              <FiCheckCircle className="text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase">
              Không có yêu cầu nào
            </h3>
            <p className="text-slate-500 dark:text-dark-text-secondary font-medium">
              Tất cả các yêu cầu hủy đơn đã được xử lý xong.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id}
                className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group"
              >
                <div className="p-5 border-b border-slate-50 dark:border-dark-border bg-slate-50/30 dark:bg-dark-bg/30 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-dark-bg px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border shadow-sm uppercase group-hover:text-indigo-600 transition-colors">
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
                    <div className="w-10 h-10 bg-indigo-600/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
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

                  <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 shadow-inner">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <FiAlertTriangle className="animate-pulse" /> Lý do hủy từ khách
                    </p>
                    <p className="text-sm text-rose-700 dark:text-rose-300 font-medium italic line-clamp-3 leading-relaxed">
                      "{order.cancelReason || "Không có lý do chi tiết"}"
                    </p>
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
                    className="w-full h-11 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FiEye /> Xem chi tiết & Xử lý
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

      {/* Modal Xử lý */}
      <AnimatePresence>
        {modalShow && selectedOrder && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalShow(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <Motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-transparent dark:border-dark-border transition-colors duration-300"
            >
              <div className="p-8 md:p-10 text-center">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner border border-rose-100 dark:border-rose-900/30">
                  <FiAlertTriangle />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                  Xác nhận yêu cầu hủy
                </h3>
                <p className="text-slate-500 dark:text-dark-text-secondary text-sm mb-8 px-4 font-medium">
                  Bạn đang xử lý yêu cầu hủy cho đơn hàng{" "}
                  <span className="font-black text-rose-600 dark:text-rose-400">
                    #{selectedOrder.orderCode}
                  </span>
                  .
                </p>

                <div className="bg-slate-50 dark:bg-dark-bg rounded-[2rem] p-6 text-left mb-10 border border-slate-100 dark:border-dark-border shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FiPackage className="text-indigo-500" /> Lý do của khách hàng
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed">
                    "{selectedOrder.cancelReason || "Không có lý do chi tiết"}"
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setModalShow(false);
                      setTimeout(
                        () => setConfirmModal({ show: true, approve: false }),
                        200,
                      );
                    }}
                    className="flex-1 h-14 bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-transparent dark:border-dark-border"
                  >
                    <FiXCircle className="text-lg" /> TỪ CHỐI
                  </button>
                  <button
                    onClick={() => {
                      setModalShow(false);
                      setTimeout(
                        () => setConfirmModal({ show: true, approve: true }),
                        200,
                      );
                    }}
                    className="flex-1 h-14 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FiCheckCircle className="text-lg" /> CHẤP NHẬN
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
        onConfirm={handleProcessCancel}
        title={
          confirmModal.approve
            ? "Xác nhận chấp nhận hủy?"
            : "Xác nhận từ chối hủy?"
        }
        message={
          confirmModal.approve
            ? "Hành động này sẽ chính thức hủy đơn hàng và hoàn tiền nếu có."
            : "Hành động này sẽ giữ đơn hàng ở trạng thái chờ và tiếp tục giao dịch."
        }
        confirmText="Xác nhận"
        variant={confirmModal.approve ? "danger" : "primary"}
        icon={confirmModal.approve ? FiXCircle : FiCheckCircle}
        iconClassName={
          confirmModal.approve
            ? "bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400"
            : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
        }
        loading={loadingAction}
      />
    </div>
  );
};

export default OrdersCancelManage;
