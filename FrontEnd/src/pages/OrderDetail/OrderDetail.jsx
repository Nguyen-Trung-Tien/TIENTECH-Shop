import React, { useCallback, useEffect, useReducer } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiXCircle } from "react-icons/fi";
import { Button } from "../../components/UI";
import { getOrderById, updateOrderStatus } from "../../api/orderApi";
import { requestReturn, cancelReturnRequest } from "../../api/orderItemApi";
import { createVnpayPaymentApi } from "../../api/paymentApi";
import ReviewModal from "../../components/ReviewComponent/ReviewModal";
import { printInvoice } from "./printInvoice";
import OrderDetailHeader from "./components/OrderDetailHeader";
import OrderDetailStepper from "./components/OrderDetailStepper";
import CancellationReason from "./components/CancellationReason";
import DeliveryInfo from "./components/DeliveryInfo";
import OrderItemsList from "./components/OrderItemsList";
import PaymentSummary from "./components/PaymentSummary";
import OrderActions from "./components/OrderActions";
import ReturnModal from "./components/ReturnModal";
import CancelModal from "./components/CancelModal";

const initialState = {
  order: null,
  loading: false,
  showReturnModal: false,
  showCancelModal: false,
  showReviewModal: false,
  selectedItems: [],
  returnReason: "",
  cancelReason: "",
  selectedCancelReason: "",
  selectedReturnReason: "",
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
        selectedItems: action.payload ? [action.payload] : [],
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
    case "OPEN_REVIEW_MODAL":
      return { ...state, showReviewModal: true };
    case "CLOSE_REVIEW_MODAL":
      return { ...state, showReviewModal: false };
    case "SET_SELECTED_ITEMS":
      return { ...state, selectedItems: action.payload };
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
    showReviewModal,
    selectedItems,
    returnReason,
    cancelReason,
    selectedCancelReason,
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
    } catch {
      toast.error("Lỗi khi gửi yêu cầu hủy đơn");
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  const handleConfirmReceipt = async () => {
    try {
      dispatch({ type: "SET_SUBMITTING", payload: true });
      const res = await updateOrderStatus(id, "completed");
      if (res.errCode === 0) {
        toast.success("Xác nhận đã nhận hàng thành công!");
        fetchOrderDetail();
      } else {
        toast.error(res.errMessage);
      }
    } catch {
      toast.error("Lỗi khi xác nhận nhận hàng");
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
    } catch {
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
      toast.error("Một số sản phẩm không thể trả.");
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  const isWithin12Hours = (dateString) => {
    if (!dateString) return false;
    const requestedAt = new Date(dateString);
    const now = new Date();
    const diffHours = (now - requestedAt) / (1000 * 60 * 60);
    return diffHours <= 12;
  };

  const handleCancelReturn = async (itemId) => {
    try {
      dispatch({ type: "SET_SUBMITTING", payload: true });
      const res = await cancelReturnRequest(itemId);
      if (res.errCode === 0) {
        toast.success("Đã thu hồi yêu cầu trả hàng thành công");
        fetchOrderDetail();
      } else {
        toast.error(res.errMessage);
      }
    } catch {
      toast.error("Lỗi khi thu hồi yêu cầu trả hàng");
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-dark-bg gap-4">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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

  const isCancelled =
    order.status === "cancelled" || order.status === "cancel_requested";

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg py-12 transition-colors duration-300">
      <div className="container-custom">
        <OrderDetailHeader
          orderCode={order.orderCode}
          createdAt={order.createdAt}
          status={order.status}
          paymentStatus={order.paymentStatus}
          submitting={submitting}
          onBack={() =>
            isAdmin ? navigate("/admin/orders") : window.history.back()
          }
          backText={isAdmin ? "quản lý" : "lịch sử"}
        />

        <OrderDetailStepper orderStatus={order.status} />

        <CancellationReason
          isCancelled={isCancelled}
          cancelReason={order.cancelReason}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
          <div className="lg:col-span-8 space-y-8 print:w-full print:space-y-6">
            <DeliveryInfo order={order} />
            <OrderItemsList
              order={order}
              onOpenReturnModal={(itemId) =>
                dispatch({ type: "OPEN_RETURN_MODAL", payload: itemId })
              }
              onCancelReturn={handleCancelReturn}
            />
          </div>

          <div className="lg:col-span-4 space-y-8 print:w-full print:space-y-6">
            <PaymentSummary order={order} onRepay={handleRepay} />
            <OrderActions
              order={order}
              submitting={submitting}
              onOpenCancelModal={() => dispatch({ type: "OPEN_CANCEL_MODAL" })}
              onConfirmReceipt={handleConfirmReceipt}
              onOpenReviewModal={() => dispatch({ type: "OPEN_REVIEW_MODAL" })}
              onOpenReturnModal={() => dispatch({ type: "OPEN_RETURN_MODAL" })}
              onRecallAllReturns={() => {
                const recallableItems = order.orderItems.filter(
                  (item) =>
                    item.returnStatus === "requested" &&
                    isWithin12Hours(item.returnRequestedAt),
                );
                dispatch({ type: "SET_SUBMITTING", payload: true });
                Promise.all(
                  recallableItems.map((item) => cancelReturnRequest(item.id)),
                )
                  .then(() => {
                    toast.success("Đã thu hồi các yêu cầu trả hàng");
                    fetchOrderDetail();
                  })
                  .catch(() => toast.error("Lỗi khi thu hồi yêu cầu"))
                  .finally(() =>
                    dispatch({ type: "SET_SUBMITTING", payload: false }),
                  );
              }}
              onPrintInvoice={() => printInvoice(order)}
            />
          </div>
        </div>
      </div>

      <ReturnModal
        isOpen={showReturnModal}
        onClose={() => dispatch({ type: "CLOSE_RETURN_MODAL" })}
        onConfirm={handleSubmitReturn}
        order={order}
        selectedItems={selectedItems}
        returnReason={returnReason}
        submitting={submitting}
        onToggleItem={(itemId) =>
          dispatch({ type: "TOGGLE_ITEM", payload: itemId })
        }
        onSetReturnReason={(reason) =>
          dispatch({ type: "SET_RETURN_REASON", payload: reason })
        }
      />

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => dispatch({ type: "CLOSE_CANCEL_MODAL" })}
        onConfirm={handleCancelOrder}
        selectedCancelReason={selectedCancelReason}
        cancelReason={cancelReason}
        submitting={submitting}
        onSelectReason={(reason) => {
          dispatch({ type: "SET_SELECTED_CANCEL_REASON", payload: reason });
          if (reason !== "Lý do khác") {
            dispatch({ type: "SET_CANCEL_REASON", payload: reason });
          } else {
            dispatch({ type: "SET_CANCEL_REASON", payload: "" });
          }
        }}
        onChangeCustomReason={(val) =>
          dispatch({ type: "SET_CANCEL_REASON", payload: val })
        }
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => dispatch({ type: "CLOSE_REVIEW_MODAL" })}
        order={order}
        onReviewSuccess={fetchOrderDetail}
      />
    </div>
  );
};

export default OrderDetail;
