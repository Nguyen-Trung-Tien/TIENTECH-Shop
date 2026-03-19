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
  FiX,
  FiAlertTriangle,
  FiRefreshCw,
  FiList
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { getOrdersByUserId, updateOrderStatus } from "../../api/orderApi";
import AppPagination from "../../components/Pagination/Pagination";
import { getImage } from "../../utils/decodeImage";
import { statusMap, paymentStatusMap } from "../../utils/StatusMap";
import { StatusBadge } from "../../utils/StatusBadge";
import ClickableText from "../../components/ClickableText/ClickableText";
import Button from "../../components/UI/Button";

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

  const limit = 10;

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
    setPage(1); // Reset về trang 1 khi đổi tab
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
    setCancelling(true);
    try {
      const res = await updateOrderStatus(orderToCancel.id, "cancelled");
      if (res?.errCode === 0) {
        toast.success("Hủy đơn hàng thành công!");
        fetchOrders(page, activeTab);
      }
    } catch {
      toast.error("Không thể hủy đơn");
    } finally {
      setShowCancelModal(false);
      setCancelling(false);
    }
  };

  const formatCurrency = (v) => (Number(v) || 0).toLocaleString("vi-VN") + " ₫";

  return (
    <div className="min-h-screen bg-surface-50 py-12">
      <div className="container-custom">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Đơn hàng của tôi</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Theo dõi và quản lý các đơn hàng của bạn.</p>
          </div>
          <button 
            onClick={() => fetchOrders(page, activeTab)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:text-primary transition-all shadow-sm"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Làm mới
          </button>
        </div>

        {/* Modern Tabs */}
        <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-soft mb-10 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabSelect(tab.key)}
                  className={`flex items-center gap-2 px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${
                    isActive 
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105 z-10" 
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-100 animate-pulse"></div>
             ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-slate-100 p-32 text-center shadow-soft">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-200">
              <FiBox className="text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Không có đơn hàng nào</h3>
            <p className="text-slate-400 font-medium">Danh sách này hiện đang trống ở trạng thái bạn chọn.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((o) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={o.id} 
                className="group bg-white rounded-[40px] border border-slate-100 shadow-soft hover:shadow-xl hover:border-primary/10 transition-all duration-500 overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                      #DH{o.id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <FiClock /> {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge map={statusMap} status={o.status} className="text-[10px] px-4 py-1.5 font-black uppercase tracking-widest rounded-xl" />
                    <StatusBadge map={paymentStatusMap} status={o.paymentStatus} className="text-[10px] px-4 py-1.5 font-black uppercase tracking-widest rounded-xl" />
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-8">
                  <div className="space-y-6">
                    {o.orderItems?.map((i) => {
                      const p = i.product;
                      return (
                        <div key={i.id} className="flex gap-8 items-center group/item">
                          <div className="w-24 h-24 bg-slate-50 rounded-3xl border border-slate-100 p-3 flex-shrink-0 group-hover/item:scale-105 transition-transform duration-500">
                            <img
                              src={getImage(p?.image)}
                              alt={p?.name}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 
                              className="text-lg font-black text-slate-900 line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                              onClick={() => navigate(`/orders-detail/${o.id}`)}
                            >
                              {p?.name || i.productName}
                            </h4>
                            <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <span>Số lượng: <span className="text-slate-900 font-black">{i.quantity}</span></span>
                              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                              <span>Đơn giá: <span className="text-slate-900 font-black">{formatCurrency(i.price)}</span></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tổng giá trị đơn hàng</p>
                      <span className="text-3xl font-black text-primary tracking-tighter leading-none">
                        {formatCurrency(o.totalPrice)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <button
                        onClick={() => navigate(`/orders-detail/${o.id}`)}
                        className="flex-1 md:flex-none h-14 px-8 bg-slate-100 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <FiEye size={18} /> CHI TIẾT
                      </button>
                      
                      {o.status === "pending" && (
                        <button
                          onClick={() => { setOrderToCancel(o); setShowCancelModal(true); }}
                          className="flex-1 md:flex-none h-14 px-8 bg-rose-50 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100"
                        >
                          <FiXCircle size={18} /> HỦY ĐƠN
                        </button>
                      )}

                      {o.status === "shipped" && (
                        <button
                          disabled={receivingId === o.id}
                          onClick={() => handleReceiveOrder(o.id)}
                          className="flex-1 md:flex-none h-14 px-8 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                        >
                          {receivingId === o.id ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle size={18} />} XÁC NHẬN NHẬN HÀNG
                        </button>
                      )}

                      {o.status === "delivered" && (
                        <button
                          onClick={() => navigate(`/product-detail/${o.orderItems[0]?.product?.id}`)}
                          className="flex-1 md:flex-none h-14 px-8 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                          <FiCheckCircle size={18} /> ĐÁNH GIÁ NGAY
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
          <div className="mt-16 flex justify-center">
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
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-slate-100">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 border border-rose-100 shadow-lg shadow-rose-500/10"><FiAlertTriangle /></div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">Hủy đơn hàng?</h3>
              <p className="text-slate-500 font-medium mb-10 text-sm leading-relaxed">Bạn có chắc muốn hủy đơn <span className="text-slate-900 font-black">#DH{orderToCancel?.id}</span>? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-4">
                 <button onClick={() => setShowCancelModal(false)} className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Quay lại</button>
                 <button onClick={handleCancelOrder} className="flex-1 h-14 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20">Xác nhận hủy</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderPage;
