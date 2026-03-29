import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FiBox,
  FiSearch,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCcw,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiInfo,
  FiAlertTriangle,
  FiMoreHorizontal,
  FiChevronDown,
  FiTrash2,
  FiExternalLink,
  FiPackage,
  FiPhone,
  FiRefreshCw,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../../api/orderApi";
import { updatePayment } from "../../../api/paymentApi";
import {
  paymentStatusMap,
  returnStatusMap,
  statusMap,
} from "../../../utils/StatusMap";
import { StatusBadge } from "../../../utils/StatusBadge";
import AppPagination from "../../../components/Pagination/Pagination";

const TABS = [
  { id: "all", label: "Tất cả", color: "bg-slate-500" },
  { id: "pending", label: "Chờ xử lý", color: "bg-amber-500" },
  { id: "confirmed", label: "Đã xác nhận", color: "bg-blue-500" },
  { id: "processing", label: "Đang xử lý", color: "bg-indigo-500" },
  { id: "shipped", label: "Đang giao", color: "bg-sky-500" },
  { id: "delivered", label: "Đã giao", color: "bg-emerald-500" },
  { id: "cancelled", label: "Đã hủy", color: "bg-rose-500" },
];

const OrderManage = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const limit = 10;

  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const fetchOrders = useCallback(
    async (currentPage = 1, search = "", status = "all") => {
      setLoading(true);
      try {
        const filterStatus = status === "all" ? "" : status;
        const res = await getAllOrders(
          currentPage,
          limit,
          search.trim(),
          filterStatus,
        );
        if (res?.errCode === 0) {
          setOrders(res.data || []);
          setPage(res.pagination?.page || currentPage);
          setTotalPages(res.pagination?.totalPages || 1);
        } else {
          setOrders([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1, searchTerm, activeTab);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, fetchOrders]);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setLoadingId(orderId);
      const res = await updateOrderStatus(orderId, status);
      if (res?.errCode === 0) {
        toast.success(`Đã chuyển sang: ${statusMap[status]?.label}`);
        fetchOrders(page, searchTerm, activeTab);
      } else {
        toast.error(res?.errMessage);
      }
    } catch (err) {
      toast.error("Lỗi cập nhật");
    } finally {
      setLoadingId(null);
      setActiveDropdown(null);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrderId) return;
    try {
      setLoadingId(selectedOrderId);
      const res = await deleteOrder(selectedOrderId);
      if (res?.errCode === 0) {
        toast.success(`Đã xóa đơn DH${selectedOrderId}`);
        fetchOrders(page, searchTerm, activeTab);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
      setShowDeleteModal(false);
      setSelectedOrderId(null);
    }
  };

  const formatCurrency = (v) =>
    v ? Number(v).toLocaleString("vi-VN") + " ₫" : "0 ₫";
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <FiPackage />
            </div>
            Quản lý đơn hàng
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-15">
            Hệ thống xử lý & điều phối vận chuyển
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative group w-64">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Mã đơn, SĐT, Tên..."
              className="w-full h-11 bg-slate-50 border-none rounded-xl pl-11 text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => fetchOrders(1, searchTerm, activeTab)}
            className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-md shadow-indigo-600/10"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabs System */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 flex items-center gap-3 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20 scale-105 z-10"
                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {activeTab === tab.id ? orders.length : "•"}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Đơn hàng
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Khách hàng
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Tổng cộng
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Trạng thái
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="px-8 py-10 animate-pulse">
                        <div className="h-12 bg-slate-50 rounded-2xl w-full"></div>
                      </td>
                    </tr>
                  ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">
                            #DH{order.id}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5 uppercase">
                            <FiCalendar /> {formatDate(order.createdAt)}
                          </span>
                        </div>
                        {/* Mini Product Thumbnails */}
                        <div className="flex -space-x-2 overflow-hidden">
                          {order.orderItems?.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="inline-block h-8 w-8 rounded-lg ring-2 ring-white bg-slate-50 border border-slate-100 overflow-hidden"
                            >
                              <img
                                src={item.image}
                                alt="product"
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ))}
                          {order.orderItems?.length > 3 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg ring-2 ring-white bg-slate-100 text-[10px] font-black text-slate-400">
                              +{order.orderItems.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <FiUser />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                            {order.user?.username || "Ẩn danh"}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">
                            {order.user?.phone || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-sm font-black text-rose-600 tracking-tight">
                        {formatCurrency(order.totalPrice)}
                      </p>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1 inline-block">
                        {order.paymentMethod || "COD"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <StatusBadge
                          map={statusMap}
                          status={order.status}
                          className="text-[10px] px-4 py-1.5 font-black uppercase tracking-[0.1em] rounded-xl shadow-sm"
                        />
                        {order.paymentStatus === "paid" && (
                          <span className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-1">
                            <FiCheckCircle /> Đã thanh toán
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/orders-detail/${order.id}`)}
                          className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <FiInfo size={18} />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === order.id ? null : order.id,
                              )
                            }
                            className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 transition-all"
                          >
                            <FiRefreshCcw
                              size={16}
                              className={
                                loadingId === order.id ? "animate-spin" : ""
                              }
                            />
                          </button>
                          <AnimatePresence>
                            {activeDropdown === order.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-3 z-50 overflow-hidden"
                              >
                                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-xl mb-2 text-center">
                                  Chuyển trạng thái
                                </p>
                                <div className="space-y-1">
                                  {Object.keys(statusMap).map((key) => (
                                    <button
                                      key={key}
                                      onClick={() =>
                                        handleUpdateStatus(order.id, key)
                                      }
                                      className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                                        order.status === key
                                          ? "bg-indigo-600/5 text-indigo-600"
                                          : "text-slate-600 hover:bg-slate-50 hover:pl-6"
                                      }`}
                                    >
                                      {statusMap[key].label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setShowDeleteModal(true);
                          }}
                          className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-32 text-center text-slate-400 font-bold uppercase tracking-widest"
                  >
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Trang {page} trên {totalPages}
          </p>
          <AppPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchOrders(p, searchTerm, activeTab)}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-slate-100"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 border border-rose-100 shadow-lg shadow-rose-500/10">
                <FiTrash2 />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                Xóa đơn hàng?
              </h3>
              <p className="text-slate-500 font-medium mb-10 text-sm leading-relaxed">
                Hành động này sẽ gỡ bỏ đơn hàng #DH{selectedOrderId} vĩnh viễn
                khỏi hệ thống.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="flex-1 h-14 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManage;
