import React, { useCallback, useEffect, useReducer } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
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
  FiX,
} from "react-icons/fi";
import { getOrderById, updateOrderStatus } from "../../api/orderApi";
import { requestReturn } from "../../api/orderItemApi";
import { createVnpayPaymentApi } from "../../api/paymentApi";
import { getImage } from "../../utils/decodeImage";
import { StatusBadge } from "../../utils/StatusBadge";
import {
  paymentStatusMap,
  returnStatusMap,
  statusMap,
} from "../../utils/StatusMap";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-surface-100 last:border-0">
    <div className="flex items-center gap-2 text-surface-400">
      {Icon && <Icon size={14} />}
      <span className="text-[13px] font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
    <span className="text-[14px] font-bold text-surface-900">
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
  submitting: false,
};

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
      };
    case "CLOSE_RETURN_MODAL":
      return { ...state, showReturnModal: false };
    case "OPEN_CANCEL_MODAL":
      return { ...state, showCancelModal: true, cancelReason: "" };
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
    case "SET_CANCEL_REASON":
      return { ...state, cancelReason: action.payload };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };
    default:
      return state;
  }
};

const OrderDetail = () => {
  const { id } = useParams();
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
      // Gửi yêu cầu hủy kèm lý do
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
        toast.error(res?.message || "Không thể tạo liên kết thanh toán. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Repay error:", err);
      toast.error("Lỗi kết nối máy chủ hoặc yêu cầu không hợp lệ");
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
    if (!returnReason.trim())
      return toast.warning("Vui lòng nhập lý do trả hàng");
    if (!selectedItems.length)
      return toast.warning("Vui lòng chọn ít nhất một sản phẩm");

    dispatch({ type: "SET_SUBMITTING", payload: true });
    try {
      await Promise.all(
        selectedItems.map((itemId) => requestReturn(itemId, returnReason)),
      );
      toast.success("Gửi yêu cầu trả hàng thành công");
      dispatch({ type: "CLOSE_RETURN_MODAL" });
      fetchOrderDetail();
    } catch {
      toast.error("Một số sản phẩm không thể trả. Vui lòng thử lại.");
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-surface-400 font-bold uppercase tracking-widest text-[11px]">
          Đang tải chi tiết đơn hàng...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-6">
        <div className="bg-white rounded-[32px] p-12 text-center shadow-soft max-w-md">
          <FiXCircle className="text-5xl text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-surface-900 mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-surface-500 mb-8">
            Có lỗi xảy ra hoặc bạn không có quyền truy cập đơn hàng này.
          </p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      {" "}
      <div className="container-custom">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-surface-400 hover:text-primary transition-colors mb-8 font-bold text-[13px] uppercase tracking-widest"
        >
          <FiArrowLeft size={18} /> Quay lại lịch sử đơn hàng
        </button>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold text-surface-900">
                Chi tiết Đơn hàng
              </h1>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-black rounded-lg">
                #DH{order.id}
              </span>
            </div>
            <p className="text-surface-500 font-medium">
              Đặt ngày {new Date(order.createdAt).toLocaleDateString("vi-VN")}{" "}
              lúc {new Date(order.createdAt).toLocaleTimeString("vi-VN")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge map={statusMap} status={order.status} />
            <StatusBadge map={paymentStatusMap} status={order.paymentStatus} />
          </div>
        </div>

        {/* Order Stepper (Desktop) */}
        {!isCancelled && (
          <div className="hidden md:block bg-white rounded-[32px] p-10 border border-surface-200 shadow-sm mb-8">
            <div className="relative flex justify-between">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-100 -translate-y-1/2 z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000"
                style={{
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                }}
              ></div>

              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div
                    key={step.key}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white transition-all duration-500 ${
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-surface-100 text-surface-300"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className={`absolute top-16 text-[11px] font-black uppercase tracking-wider whitespace-nowrap ${
                        isCurrent
                          ? "text-primary"
                          : isActive
                            ? "text-surface-900"
                            : "text-surface-300"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-20"></div> {/* Spacer for absolute labels */}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery & Shipping Info */}
            <div className="bg-white rounded-[32px] p-8 border border-surface-200 shadow-sm">
              <h3 className="text-xl font-display font-bold text-surface-900 mb-6 flex items-center gap-2">
                <FiMapPin className="text-primary" /> Thông tin Giao hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <div className="space-y-1">
                  <InfoRow
                    label="Người nhận"
                    value={order.user?.username || "Khách"}
                    icon={FiUser}
                  />
                  <InfoRow label="Số điện thoại" value={order.user?.phone} />
                  <InfoRow label="Email" value={order.user?.email} />
                </div>
                <div className="space-y-1">
                  <InfoRow
                    label="Địa chỉ nhận hàng"
                    value={order.shippingAddress}
                  />
                  {order.note && (
                    <InfoRow label="Ghi chú đơn hàng" value={order.note} />
                  )}
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-[32px] p-8 border border-surface-200 shadow-sm">
              <h3 className="text-xl font-display font-bold text-surface-900 mb-6 flex items-center gap-2">
                <FiPackage className="text-primary" /> Danh sách Sản phẩm
              </h3>
              <div className="divide-y divide-surface-100">
                {order.orderItems?.map((item) => {
                  const product = item.product || {};
                  return (
                    <div
                      key={item.id}
                      className="py-6 first:pt-0 last:pb-0 flex gap-6"
                    >
                      <div className="w-24 h-24 bg-surface-50 rounded-2xl border border-surface-100 p-2 flex-shrink-0">
                        <img
                          src={getImage(product.image)}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <Link
                          to={`/product-detail/${product.id}`}
                          className="text-lg font-bold text-surface-900 hover:text-primary transition-colors line-clamp-1 mb-1"
                        >
                          {product.name || item.productName}
                        </Link>
                        <div className="flex items-center gap-3 text-sm text-surface-500 font-medium mb-3">
                          <span>Số lượng: {item.quantity}</span>
                          <div className="w-1 h-1 bg-surface-300 rounded-full"></div>
                          <span>Đơn giá: {item.price.toLocaleString()} ₫</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge
                            map={returnStatusMap}
                            status={item.returnStatus}
                          />
                          {item.returnReason && (
                            <span className="text-[11px] text-surface-400 italic font-medium">
                              Lý do: {item.returnReason}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-1">
                          Thành tiền
                        </p>
                        <p className="text-lg font-black text-surface-900">
                          {(item.price * item.quantity).toLocaleString()} ₫
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Summary Column */}
          <div className="space-y-8">
            {/* Payment Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 shadow-xl">
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <FiCreditCard className="text-primary" /> Thanh toán
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                  <span>Hình thức</span>
                  <span className="text-gray-900 dark:text-white uppercase font-bold tracking-wider">
                    {order.paymentMethod || "COD"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                  <span>Trạng thái</span>
                  <StatusBadge
                    map={paymentStatusMap}
                    status={order.paymentStatus}
                  />
                </div>

                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-500 font-bold tracking-wider uppercase text-[11px]">
                    Miễn phí
                  </span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-rose-500 text-sm font-medium">
                    <span>Giảm giá {order.voucherCode ? `(${order.voucherCode})` : ""}</span>
                    <span className="font-bold">
                      -{Number(order.discountAmount).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Tổng số tiền thanh toán
                </p>
                <div className="text-3xl font-black tracking-tight text-primary">
                  {Number(order.totalPrice).toLocaleString("vi-VN")} ₫
                </div>
              </div>

              {order.paymentStatus === "unpaid" && order.paymentMethod === "VNPAY" && order.status !== "cancelled" && (
                <Button
                  variant="primary"
                  className="w-full mt-6 shadow-lg shadow-primary/20"
                  size="lg"
                  icon={FiCreditCard}
                  onClick={handleRepay}
                >
                  THANH TOÁN NGAY
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === "pending" && (
                <Button
                  variant="danger"
                  className="w-full"
                  size="lg"
                  icon={FiXCircle}
                  onClick={() => dispatch({ type: "OPEN_CANCEL_MODAL" })}
                >
                  HỦY ĐƠN HÀNG
                </Button>
              )}

              {order.status === "delivered" &&
                order.orderItems?.some((i) => i.returnStatus === "none") && (
                  <Button
                    variant="brand"
                    className="w-full"
                    size="lg"
                    icon={FiRotateCcw}
                    onClick={() => {
                      const items =
                        order.orderItems?.filter(
                          (i) => i.returnStatus === "none",
                        ) || [];
                      dispatch({
                        type: "OPEN_RETURN_MODAL",
                        payload: items.map((i) => i.id),
                      });
                    }}
                  >
                    YÊU CẦU TRẢ HÀNG
                  </Button>
                )}

              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                icon={FiPackage}
                onClick={() => window.print()}
              >
                IN HÓA ĐƠN
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Modern Return Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch({ type: "CLOSE_RETURN_MODAL" })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-display font-bold text-surface-900">
                    Yêu cầu Trả hàng
                  </h3>
                  <button
                    onClick={() => dispatch({ type: "CLOSE_RETURN_MODAL" })}
                    className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Reason Input */}
                  <div>
                    <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-2 block">
                      Lý do trả hàng
                    </label>
                    <textarea
                      rows={4}
                      className="w-full bg-surface-50 border border-surface-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Mô tả chi tiết lý do bạn muốn trả sản phẩm này..."
                      value={returnReason}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_RETURN_REASON",
                          payload: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-3 block">
                      Chọn sản phẩm muốn trả
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {order.orderItems
                        ?.filter((item) => item.returnStatus === "none")
                        .map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                              selectedItems.includes(item.id)
                                ? "border-primary bg-primary/5"
                                : "border-surface-100 bg-white hover:border-surface-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg text-primary focus:ring-primary border-surface-300"
                              checked={selectedItems.includes(item.id)}
                              onChange={() =>
                                dispatch({
                                  type: "TOGGLE_ITEM",
                                  payload: item.id,
                                })
                              }
                            />
                            <div className="flex-grow">
                              <p className="text-sm font-bold text-surface-900 line-clamp-1">
                                {item.productName}
                              </p>
                              <p className="text-xs text-surface-500">
                                Số lượng: {item.quantity}
                              </p>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => dispatch({ type: "CLOSE_RETURN_MODAL" })}
                  >
                    HỦY BỎ
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    loading={submitting}
                    onClick={handleSubmitReturn}
                  >
                    GỬI YÊU CẦU
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch({ type: "CLOSE_CANCEL_MODAL" })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
                <FiXCircle />
              </div>
              <h3 className="text-2xl font-display font-bold text-surface-900 mb-4">
                Yêu cầu Hủy đơn hàng?
              </h3>
              <p className="text-surface-500 mb-6 leading-relaxed">
                Bạn có chắc chắn muốn gửi yêu cầu hủy đơn hàng <strong>#DH{order.id}</strong> không?
              </p>
              
              <div className="mb-8 text-left">
                <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest mb-2 block">
                  Lý do hủy đơn
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Vui lòng nhập lý do hủy đơn hàng..."
                  value={cancelReason}
                  onChange={(e) => dispatch({ type: "SET_CANCEL_REASON", payload: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => dispatch({ type: "CLOSE_CANCEL_MODAL" })}
                >
                  QUAY LẠI
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  loading={submitting}
                  onClick={handleCancelOrder}
                >
                  GỬI YÊU CẦU HỦY
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetail;
