import { useEffect, useState, useMemo, useCallback } from "react";
import { 
  FiEye, 
  FiClock, 
  FiCheckCircle, 
  FiSettings, 
  FiTruck, 
  FiPackage, 
  FiXCircle, 
  FiBox,
  FiAlertTriangle,
  FiRefreshCw,
  FiList
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "../../components/UI";
import { getOrdersByUserId, updateOrderStatus } from "../../api/orderApi";
import AppPagination from "../../components/Pagination/Pagination";
import { getImage } from "../../utils/decodeImage";
import { statusMap, paymentStatusMap } from "../../utils/StatusMap";
import { StatusBadge } from "../../utils/StatusBadge";

const STATUS_TABS = [
  { key: "all", label: "Tất cả", icon: FiList },
  { key: "pending", label: "Chờ xử lý", icon: FiClock },
  { key: "confirmed", label: "Đã xác nhận", icon: FiCheckCircle },
  { key: "processing", label: "Đang xử lý", icon: FiSettings },
  { key: "shipped", label: "Đang giao", icon: FiTruck },
  { key: "delivered", label: "Đã giao", icon: FiPackage },
  { key: "cancelled", label: "Đã hủy", icon: FiXCircle },
];

const OrderPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [receivingId, setReceivingId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const limit = 5; // Reduced limit for a more compact view per page

  const fetchOrders = useCallback(async (p = page, tab = activeTab) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const filterStatus = tab === "all" ? "" : tab;
      const res = await getOrdersByUserId(user.id, p, limit, filterStatus);
      if (res?.errCode === 0) {
        setOrders(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, activeTab]);

  useEffect(() => {
    fetchOrders(page, activeTab);
  }, [page, activeTab, fetchOrders]);

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
  };

  const handleReceiveOrder = async (id) => {
    setReceivingId(id);
    try {
      const res = await updateOrderStatus(id, "delivered");
      if (res?.errCode === 0) {
        toast.success("Xác nhận đã nhận hàng!");
        fetchOrders(page, activeTab);
      }
    } catch {
      toast.error("Lỗi xác nhận");
    } finally {
      setReceivingId(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    if (!cancelReason.trim()) {
      return toast.warning("Vui lòng nhập lý do hủy đơn");
    }
    setCancelling(true);
    try {
      // Gửi trạng thái cancel_requested thay vì cancelled kèm lý do
      const res = await updateOrderStatus(orderToCancel.id, "cancel_requested", cancelReason);
      if (res?.errCode === 0) {
        toast.success("Đã gửi yêu cầu hủy đơn hàng!");
        fetchOrders(page, activeTab);
      }
    } catch {
      toast.error("Không thể gửi yêu cầu hủy");
    } finally {
      setShowCancelModal(false);
      setCancelling(false);
      setCancelReason("");
    }
  };

  const formatCurrency = (v) => (Number(v) || 0).toLocaleString("vi-VN") + " ₫";

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đơn hàng của tôi</h1>
            <p className="text-slate-500 text-sm mt-1">Theo dõi và quản lý lịch sử mua hàng của bạn.</p>
          </div>
          <button 
            onClick={() => fetchOrders(page, activeTab)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm group"
          >
            <FiRefreshCw className={`${loading ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500`} /> Làm mới
          </button>
        </div>

        {/* Compact Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabSelect(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
             ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FiBox className="text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Không có đơn hàng</h3>
            <p className="text-slate-400 text-sm">Danh sách hiện đang trống ở trạng thái này.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={o.id} 
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      #{o.orderCode || `DH${o.id}`}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <FiClock /> {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge map={statusMap} status={o.status} className="text-[10px] px-3 py-1 font-bold uppercase rounded-lg" />
                    <StatusBadge map={paymentStatusMap} status={o.paymentStatus} className="text-[10px] px-3 py-1 font-bold uppercase rounded-lg" />
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="space-y-4">
                    {o.orderItems?.map((i) => {
                      return (
                        <div key={i.id} className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 p-2 flex-shrink-0">
                            <img
                              src={getImage(i.image)}
                              alt={i.productName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 
                              className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                              onClick={() => navigate(`/orders-detail/${o.id}`)}
                            >
                              {i.productName}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-slate-400">
                              <span>Số lượng: <span className="text-slate-900 font-bold">{i.quantity}</span></span>
                              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                              <span>Đơn giá: <span className="text-slate-900 font-bold">{formatCurrency(i.price)}</span></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tổng thanh toán</p>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(o.totalPrice)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => navigate(`/orders-detail/${o.id}`)}
                        className="flex-1 sm:flex-none h-10 px-5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <FiEye size={16} /> Chi tiết
                      </button>
                      
                      {o.status === "pending" && (
                        <button
                          onClick={() => { setOrderToCancel(o); setShowCancelModal(true); }}
                          className="flex-1 sm:flex-none h-10 px-5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100"
                        >
                          <FiXCircle size={16} /> Hủy đơn
                        </button>
                      )}

                      {o.status === "shipped" && (
                        <button
                          disabled={receivingId === o.id}
                          onClick={() => handleReceiveOrder(o.id)}
                          className="flex-1 sm:flex-none h-10 px-5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                        >
                          {receivingId === o.id ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle size={16} />} Nhận hàng
                        </button>
                      )}

                      {o.status === "delivered" && (
                        <button
                          onClick={() => {
                            const product = o.orderItems[0]?.product;
                            const target = product?.slug || product?.id || o.orderItems[0]?.productId;
                            navigate(`/product-detail/${target}`);
                          }}
                          className="flex-1 sm:flex-none h-10 px-5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                          <FiCheckCircle size={16} /> Đánh giá
                        </button>
                      )}
                    </div>
                  </div>
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
              onPageChange={setPage}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        title="Yêu cầu Hủy đơn hàng?"
        confirmText="Gửi yêu cầu"
        cancelText="Quay lại"
        variant="danger"
        loading={cancelling}
        icon={FiAlertTriangle}
        iconClassName="bg-rose-50 text-rose-500 border-rose-100"
      >
        <p className="text-slate-500 text-sm mb-4">
          Bạn có chắc muốn gửi yêu cầu hủy đơn <span className="text-slate-900 font-bold">#{orderToCancel?.orderCode || orderToCancel?.id}</span>?
        </p>
        
        <div className="mb-6 text-left w-full">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
            Lý do hủy đơn
          </label>
          <textarea
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            placeholder="Vui lòng nhập lý do..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </ConfirmModal>
    </div>
  );
};

export default OrderPage;
