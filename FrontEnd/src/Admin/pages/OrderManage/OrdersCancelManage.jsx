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
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { getAllOrders, updateOrderStatus } from "../../../api/orderApi";
import AppPagination from "../../../components/Pagination/Pagination";
import { statusMap, paymentStatusMap } from "../../../utils/StatusMap";
import { StatusBadge } from "../../../utils/StatusBadge";
import { ConfirmModal } from "../../../components/UI/Modal";

const OrdersCancelManage = () => {
  const navigate = useNavigate();
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
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Duyệt yêu cầu hủy đơn
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xử lý các yêu cầu hủy đơn hàng từ khách hàng.
            </p>
          </div>
          <button
            onClick={() => fetchOrders(page)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all shadow-sm"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Làm mới
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse"
              ></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FiCheckCircle className="text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Không có yêu cầu nào
            </h3>
            <p className="text-slate-500">
              Tất cả các yêu cầu hủy đơn đã được xử lý xong.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    #{order.orderCode}
                  </span>
                  <StatusBadge
                    map={paymentStatusMap}
                    status={order.paymentStatus}
                    className="text-[10px]"
                  />
                </div>

                <div className="p-5 flex-grow space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-600">
                      <FiUser />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {order.user?.username}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {order.user?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <FiAlertTriangle /> Lý do hủy từ khách
                    </p>
                    <p className="text-sm text-rose-700 font-medium italic line-clamp-3">
                      "{order.cancelReason || "Không có lý do chi tiết"}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FiClock className="text-xs" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                      <FiDollarSign className="text-indigo-600" />
                      <span>{Number(order.totalPrice).toLocaleString()} ₫</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setModalShow(true);
                    }}
                    className="col-span-2 h-10 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 mb-2"
                  >
                    <FiEye /> Xem chi tiết & Xử lý
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalShow(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 border border-rose-100">
                  <FiAlertTriangle />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Xác nhận yêu cầu hủy
                </h3>
                <p className="text-slate-500 text-sm mb-6 px-4">
                  Bạn đang xử lý yêu cầu hủy cho đơn hàng{" "}
                  <span className="font-bold text-slate-900">
                    #{selectedOrder.orderCode}
                  </span>
                  .
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 text-left mb-8 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Lý do của khách hàng
                  </p>
                  <p className="text-sm text-slate-700 font-medium">
                    "{selectedOrder.cancelReason || "Không có lý do chi tiết"}"
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setModalShow(false);
                      setTimeout(
                        () => setConfirmModal({ show: true, approve: false }),
                        200,
                      );
                    }}
                    className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <FiXCircle /> TỪ CHỐI HỦY
                  </button>
                  <button
                    onClick={() => {
                      setModalShow(false);
                      setTimeout(
                        () => setConfirmModal({ show: true, approve: true }),
                        200,
                      );
                    }}
                    className="flex-1 h-12 bg-rose-500 text-white rounded-2xl text-xs font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle /> CHẤP NHẬN HỦY
                  </button>
                </div>
              </div>
            </motion.div>
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
            ? "bg-rose-50 text-rose-500"
            : "bg-indigo-50 text-indigo-600"
        }
        loading={loadingAction}
      />
    </div>
  );
};

export default OrdersCancelManage;
