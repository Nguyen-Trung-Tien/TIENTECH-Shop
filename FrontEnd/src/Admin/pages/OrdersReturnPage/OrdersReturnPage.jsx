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
} from "react-icons/fi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý trả hàng
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Duyệt và xử lý các yêu cầu trả hàng từ khách hàng.
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
              <FiPackage className="text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Không có yêu cầu trả hàng
            </h3>
            <p className="text-slate-500">
              Tất cả các yêu cầu đã được xử lý xong.
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

                  <div className="space-y-2">
                    {order.orderItems?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        <img
                          src={item.image}
                          className="w-8 h-8 object-contain"
                          alt=""
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-slate-500 italic truncate">
                            Lý do: {item.returnReason || "Không có"}
                          </p>
                        </div>
                      </div>
                    ))}
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

                <div className="p-5 pt-0 mt-auto">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setModalShow(true);
                    }}
                    className="w-full h-10 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
                  >
                    <FiEye /> Xem & Xử lý ngay
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

      {/* Modal Xử lý Trả hàng */}
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
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-indigo-600/10 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                  <FiRotateCw />
                </div>
                <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
                  Chi tiết yêu cầu trả hàng
                </h3>
                <p className="text-slate-500 text-center text-sm mb-6">
                  Đơn hàng{" "}
                  <span className="font-bold text-slate-900">
                    #{selectedOrder.orderCode}
                  </span>
                </p>

                <div className="space-y-3 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex gap-4 items-center mb-2">
                        <img
                          src={item.image}
                          className="w-12 h-12 object-contain bg-white rounded-lg p-1 border"
                          alt=""
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-500 font-bold">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Lý do trả hàng
                        </p>
                        <p className="text-sm text-slate-700 font-medium">
                          "
                          {item.returnReason ||
                            "Khách hàng không để lại lý do chi tiết"}
                          "
                        </p>
                      </div>
                    </div>
                  ))}
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
                    className="flex-1 h-12 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100"
                  >
                    <FiXCircle /> TỪ CHỐI
                  </button>
                  <button
                    onClick={() => {
                      setModalShow(false);
                      setTimeout(
                        () => setConfirmModal({ show: true, approve: true }),
                        200,
                      );
                    }}
                    className="flex-1 h-12 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle /> DUYỆT TRẢ HÀNG
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
            ? "bg-indigo-50 text-indigo-600"
            : "bg-rose-50 text-rose-500"
        }
        loading={loadingAction}
      />
    </div>
  );
};

export default OrdersReturnPage;
