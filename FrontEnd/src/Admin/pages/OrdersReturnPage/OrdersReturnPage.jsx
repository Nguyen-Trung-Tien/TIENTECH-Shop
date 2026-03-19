import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiTruck,
  FiInfo,
  FiRefreshCw,
  FiX
} from "react-icons/fi";
import { getAllOrders } from "../../../api/orderApi";
import { processReturn } from "../../../api/orderItemApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AppPagination from "../../../components/Pagination/Pagination";
import { motion, AnimatePresence } from "framer-motion";

const OrdersReturnPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const navigate = useNavigate();
  const tableTopRef = useRef(null);

  const fetchOrders = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      try {
        const res = await getAllOrders(currentPage, limit);
        if (res.errCode === 0) {
          const allOrders = res.data || [];
          const filteredOrders = allOrders.filter((order) =>
            order.orderItems?.some((item) => item.returnStatus === "requested"),
          );
          setOrders(filteredOrders);
          setTotalPages(Math.ceil(filteredOrders.length / limit) || 1);
          setPage(currentPage);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleProcessReturn = async (orderId, status) => {
    if (!selectedOrder) return;
    setLoadingAction(true);
    try {
      const itemsToProcess = selectedOrder.orderItems.filter(
        (i) => i.returnStatus === "requested",
      );
      for (let item of itemsToProcess) {
        await processReturn(item.id, status);
      }
      toast.success(status === "approved" ? "Đã duyệt trả hàng!" : "Đã từ chối yêu cầu!");
      await fetchOrders(page);
      setModalShow(false);
    } catch (err) {
      toast.error("Lỗi xử lý trả hàng");
    } finally {
      setLoadingAction(false);
    }
  };

  const formatCurrency = (value) =>
    value ? Number(value).toLocaleString("vi-VN") + " ₫" : "0 ₫";

  return (
    <div className="space-y-10 p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
                <FiTruck />
             </div>
             Quản lý trả hàng
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-15">
             Xử lý yêu cầu đổi trả & Hoàn tiền khách hàng
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm"
        >
          <FiArrowLeft /> Quay lại đơn hàng
        </button>
      </div>

      {/* Stats Summary */}
      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
               <FiAlertTriangle />
            </div>
            <p className="text-sm font-bold text-amber-800">Hệ thống đang có <span className="text-xl font-black">{orders.length}</span> yêu cầu trả hàng cần được xử lý ngay.</p>
         </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden" ref={tableTopRef}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã đơn</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Khách hàng</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày đặt</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Tổng tiền</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Yêu cầu</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center"><FiRefreshCw className="animate-spin inline-block text-2xl text-slate-200" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" className="py-20 text-center text-slate-400 font-bold">Hiện không có yêu cầu trả hàng nào.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-sm font-black text-slate-900">DH{order.id}</td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><FiUser size={14} /></div>
                          <span className="text-sm font-bold text-slate-700">{order.user?.username || "—"}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">
                       <FiCalendar className="inline mr-2" />
                       {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-rose-600 text-right">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-8 py-5 text-center">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <FiAlertTriangle size={12} /> Đã yêu cầu
                       </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <button 
                         onClick={() => { setSelectedOrder(order); setModalShow(true); }}
                         className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md shadow-primary/10 flex items-center gap-2 mx-auto"
                       >
                          <FiInfo /> Xử lý ngay
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-slate-50/50 flex justify-center">
           <AppPagination page={page} totalPages={totalPages} loading={loading} onPageChange={handlePageChange} />
        </div>
      </div>

      {/* Process Modal */}
      <AnimatePresence>
        {modalShow && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalShow(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
             >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <FiTruck className="text-amber-500" /> Xử lý trả hàng DH{selectedOrder?.id}
                   </h3>
                   <button onClick={() => setModalShow(false)} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                      <FiX size={24} />
                   </button>
                </div>
                <div className="p-10 space-y-8">
                   <div className="flex flex-wrap gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <div>Khách hàng: <span className="text-slate-900 ml-2">{selectedOrder?.user?.username}</span></div>
                      <div>SĐT: <span className="text-slate-900 ml-2">{selectedOrder?.user?.phone}</span></div>
                   </div>

                   <div className="overflow-hidden border border-slate-100 rounded-3xl">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50">
                            <tr>
                               <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</th>
                               <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">SL</th>
                               <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Lý do</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {selectedOrder?.orderItems.filter(i => i.returnStatus === 'requested').map(item => (
                               <tr key={item.id}>
                                  <td className="px-6 py-4 font-bold text-slate-700">{item.productName}</td>
                                  <td className="px-6 py-4 text-center font-black">{item.quantity}</td>
                                  <td className="px-6 py-4 text-slate-500 text-xs italic">"{item.returnReason || "Không rõ lý do"}"</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
                <div className="p-8 bg-slate-50 flex justify-end gap-4">
                   <button 
                     disabled={loadingAction}
                     onClick={() => handleProcessReturn(selectedOrder?.id, 'approved')}
                     className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                   >
                      {loadingAction ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle />} Duyệt trả hàng
                   </button>
                   <button 
                     disabled={loadingAction}
                     onClick={() => handleProcessReturn(selectedOrder?.id, 'rejected')}
                     className="px-8 py-3 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
                   >
                      {loadingAction ? <FiRefreshCw className="animate-spin" /> : <FiXCircle />} Từ chối
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersReturnPage;
