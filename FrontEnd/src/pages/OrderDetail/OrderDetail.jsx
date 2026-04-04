import React, { useCallback, useEffect, useReducer } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Modal, ConfirmModal, Button } from "../../components/UI";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiUser,
  FiCreditCard,
  FiArrowLeft,
  FiRotateCcw,
  FiAlertTriangle,
  FiCalendar,
  FiInfo,
  FiRefreshCcw,
  FiCornerDownRight,
} from "react-icons/fi";
import { getOrderById, updateOrderStatus } from "../../api/orderApi";
import { requestReturn } from "../../api/orderItemApi";
import { createVnpayPaymentApi } from "../../api/paymentApi";
import { StatusBadge } from "../../utils/StatusBadge";
import { orderStatusMap, paymentStatusMap } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/format";
import { returnStatusMap } from "../../utils/StatusMap";

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-dark-border last:border-0">
    <div className="flex items-center gap-2 text-surface-400 dark:text-dark-text-secondary">
      {Icon && <Icon size={14} />}
      <span className="text-[13px] font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
    <span className="text-[14px] font-bold text-surface-900 dark:text-white">
      {value || "-"}
    </span>
  </div>
);

const initialState = {
  order: null,
  loading: false,
  showReturnModal: false,
  showCancelModal: false,
  selectedItems: [],
  returnReason: "",
  cancelReason: "",
  selectedCancelReason: "",
  selectedReturnReason: "",
  submitting: false,
};

const CANCEL_REASONS = [
  "Thay đổi ý định mua hàng",
  "Tìm thấy giá rẻ hơn ở nơi khác",
  "Đặt nhầm sản phẩm",
  "Phí vận chuyển quá cao",
  "Thời gian giao hàng quá lâu",
  "Lý do khác",
];

const RETURN_REASONS = [
  "Sản phẩm bị lỗi/hỏng",
  "Giao sai sản phẩm",
  "Sản phẩm không giống mô tả",
  "Không còn nhu cầu sử dụng",
  "Lý do khác",
];

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ORDER":
      return { ...state, order: action.payload };
    case "OPEN_RETURN_MODAL":
      return {
        ...state,
        showReturnModal: true,
        selectedItems: action.payload,
        returnReason: "",
        selectedReturnReason: "",
      };
    case "CLOSE_RETURN_MODAL":
      return { ...state, showReturnModal: false };
    case "OPEN_CANCEL_MODAL":
      return {
        ...state,
        showCancelModal: true,
        cancelReason: "",
        selectedCancelReason: "",
      };
    case "CLOSE_CANCEL_MODAL":
      return { ...state, showCancelModal: false };
    case "TOGGLE_ITEM":
      return {
        ...state,
        selectedItems: state.selectedItems.includes(action.payload)
          ? state.selectedItems.filter((id) => id !== action.payload)
          : [...state.selectedItems, action.payload],
      };
    case "SET_RETURN_REASON":
      return { ...state, returnReason: action.payload };
    case "SET_SELECTED_RETURN_REASON":
      return { ...state, selectedReturnReason: action.payload };
    case "SET_CANCEL_REASON":
      return { ...state, cancelReason: action.payload };
    case "SET_SELECTED_CANCEL_REASON":
      return { ...state, selectedCancelReason: action.payload };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };
    default:
      return state;
  }
};

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith("/admin");
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    order,
    loading,
    showReturnModal,
    showCancelModal,
    selectedItems,
    returnReason,
    cancelReason,
    submitting,
  } = state;

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      return toast.warning("Vui lòng nhập lý do hủy đơn");
    }
    try {
      dispatch({ type: "SET_SUBMITTING", payload: true });
      const res = await updateOrderStatus(id, "cancel_requested", cancelReason);
      if (res.errCode === 0) {
        toast.success("Đã gửi yêu cầu hủy đơn hàng. Vui lòng chờ Admin duyệt.");
        dispatch({ type: "CLOSE_CANCEL_MODAL" });
        fetchOrderDetail();
      } else {
        toast.error(res.errMessage);
      }
    } catch (error) {
      toast.error("Lỗi khi gửi yêu cầu hủy đơn");
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  const handleRepay = async () => {
    if (!order?.orderCode || !order?.totalPrice) {
      toast.error("Thông tin đơn hàng không hợp lệ để thanh toán lại!");
      return;
    }

    try {
      const res = await createVnpayPaymentApi({
        amount: Number(order.totalPrice),
        orderCode: order.orderCode,
      });
      if (res?.errCode === 0 && res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error(res?.message || "Không thể tạo liên kết thanh toán.");
      }
    } catch (err) {
      console.error("Repay error:", err);
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const fetchOrderDetail = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const res = await getOrderById(id);
      if (res.errCode === 0) dispatch({ type: "SET_ORDER", payload: res.data });
      else toast.error(res.errMessage || "Lỗi tải đơn hàng");
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleSubmitReturn = async () => {
    if (submitting) return;
    if (!returnReason.trim()) return toast.warning("Vui lòng nhập lý do trả hàng");
    if (!selectedItems.length) return toast.warning("Vui lòng chọn ít nhất một sản phẩm");

    dispatch({ type: "SET_SUBMITTING", payload: true });
    try {
      await Promise.all(selectedItems.map((itemId) => requestReturn(itemId, returnReason)));
      toast.success("Gửi yêu cầu trả hàng thành công");
      dispatch({ type: "CLOSE_RETURN_MODAL" });
      fetchOrderDetail();
    } catch {
      toast.error("Một số sản phẩm không thể trả.");
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-dark-bg gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-surface-400 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[11px]">
          Đang tải chi tiết đơn hàng...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-dark-bg p-6">
        <div className="bg-white dark:bg-dark-surface rounded-[32px] p-12 text-center shadow-soft max-w-md">
          <FiXCircle className="text-5xl text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <Button onClick={() => window.history.back()}>QUAY LẠI</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "pending", label: "Chờ xử lý", icon: FiClock },
    { key: "confirmed", label: "Đã xác nhận", icon: FiCheckCircle },
    { key: "processing", label: "Đang xử lý", icon: FiPackage },
    { key: "shipped", label: "Đang giao", icon: FiTruck },
    { key: "delivered", label: "Đã giao", icon: FiCheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg py-12 transition-colors duration-300">
      <div className="container-custom">
        {/* Navigation */}
        <button
          onClick={() => (isAdmin ? navigate("/admin/orders") : window.history.back())}
          className="flex items-center gap-2 text-surface-400 dark:text-dark-text-secondary hover:text-primary transition-colors mb-8 font-bold text-[13px] uppercase tracking-widest"
        >
          <FiArrowLeft size={18} /> Quay lại {isAdmin ? "quản lý" : "lịch sử"}
        </button>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white uppercase tracking-tight">
                Chi tiết Đơn hàng
              </h1>
              <span className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-500/20">
                #{order.orderCode}
              </span>
            </div>
            <p className="text-surface-500 dark:text-dark-text-secondary font-medium">
              Ngày đặt: {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge map={orderStatusMap} status={order.status} />
            <StatusBadge map={paymentStatusMap} status={order.paymentStatus} />
          </div>
        </div>

        {/* Order Stepper */}
        {!isCancelled && (
          <div className="hidden md:block bg-white dark:bg-dark-surface rounded-[32px] p-10 border border-surface-200 dark:border-dark-border shadow-sm mb-10">
            <div className="relative flex justify-between">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-dark-bg -translate-y-1/2 z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 dark:border-dark-surface transition-all duration-500 ${
                        isActive ? "bg-primary text-white scale-110 shadow-lg" : "bg-slate-100 dark:bg-dark-bg text-slate-400 dark:text-dark-text-secondary"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <span className={`absolute top-16 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${isActive ? "text-primary" : "text-slate-400 dark:text-dark-text-secondary"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-20"></div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Delivery Info */}
            <div className="bg-white dark:bg-dark-surface p-8 rounded-[32px] border border-surface-200 dark:border-dark-border shadow-sm">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-3">
                <FiMapPin className="text-primary" /> Thông tin nhận hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <div className="space-y-1">
                  <InfoRow label="Người nhận" value={order.receiverName || order.user?.username} icon={FiUser} />
                  <InfoRow label="Số điện thoại" value={order.receiverPhone || order.user?.phone} icon={FiTruck} />
                  <InfoRow label="Email" value={order.user?.email} icon={FiInfo} />
                </div>
                <div className="space-y-1">
                  <InfoRow label="Địa chỉ" value={order.shippingAddress} icon={FiMapPin} />
                  {order.note && <InfoRow label="Ghi chú" value={order.note} icon={FiInfo} />}
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-surface-200 dark:border-dark-border shadow-sm overflow-hidden">
              <div className="p-8 border-b border-surface-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/50 flex items-center gap-3">
                <FiPackage className="text-primary" size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Danh mục sản phẩm</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-dark-border">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="p-8 flex gap-6 group hover:bg-slate-50/50 dark:hover:bg-dark-bg/20 transition-all">
                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-dark-bg border border-slate-100 dark:border-dark-border p-2 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img src={item.image} alt="" className="w-full h-full object-contain dark:mix-blend-normal" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <Link to={`/product-detail/${item.productId}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-1 mb-1">
                        {item.productName}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-dark-text-secondary font-medium mb-3">
                        <span>Số lượng: {item.quantity}</span>
                        <span>•</span>
                        <span>Đơn giá: {formatCurrency(item.price)}</span>
                      </div>
                      <StatusBadge map={returnStatusMap} status={item.returnStatus} />
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Payment Summary */}
            <div className="bg-white dark:bg-dark-surface p-8 rounded-[32px] border border-surface-200 dark:border-dark-border shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <FiCreditCard className="text-primary" /> Thanh toán
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500 dark:text-dark-text-secondary">Phương thức</span>
                  <span className="text-slate-900 dark:text-white uppercase font-bold tracking-widest">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500 dark:text-dark-text-secondary">Trạng thái</span>
                  <StatusBadge map={paymentStatusMap} status={order.paymentStatus} />
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-rose-500 text-sm font-bold">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-dark-border text-center md:text-left">
                <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.2em] mb-2">Tổng thanh toán</p>
                <div className="text-3xl font-black tracking-tight text-primary">{formatCurrency(order.totalPrice)}</div>
              </div>
              {order.paymentStatus === "unpaid" && order.paymentMethod === "VNPAY" && (
                <Button variant="primary" className="w-full mt-6" icon={FiRefreshCcw} onClick={handleRepay}>THANH TOÁN LẠI</Button>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === "pending" && (
                <Button variant="danger" className="w-full" size="lg" icon={FiXCircle} onClick={() => dispatch({ type: "OPEN_CANCEL_MODAL" })}>HỦY ĐƠN HÀNG</Button>
              )}
              <Button variant="secondary" className="w-full" size="lg" icon={FiPackage} onClick={() => window.print()}>IN HÓA ĐƠN</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => dispatch({ type: "CLOSE_CANCEL_MODAL" })}
        onConfirm={handleCancelOrder}
        title="Hủy đơn hàng?"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không?"
        confirmText="Xác nhận hủy"
        variant="danger"
        loading={submitting}
      >
        <textarea
          className="w-full mt-4 p-4 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 dark:text-white"
          rows={3}
          placeholder="Lý do hủy đơn..."
          value={cancelReason}
          onChange={(e) => dispatch({ type: "SET_CANCEL_REASON", payload: e.target.value })}
        />
      </ConfirmModal>
    </div>
  );
};

export default OrderDetail;
