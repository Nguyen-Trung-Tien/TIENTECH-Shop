import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FiXCircle,
  FiHome,
  FiRotateCw,
  FiCreditCard,
  FiTruck,
  FiCheck,
  FiPackage,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { m as Motion } from "framer-motion";
import { getOrderById, changePaymentMethod } from "../../api/orderApi";
import { createVnpayPaymentApi } from "../../api/paymentApi";
import { showErrorToast, showSuccessToast } from "../../utils/toastHelper";
import { Button } from "../../components/UI";

const CheckoutFailed = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = useRef(false);

  const fetchOrderInfo = useCallback(async (idOrCode) => {
    setFetchingOrder(true);
    try {
      const res = await getOrderById(idOrCode);
      if (res && res.errCode === 0 && res.data) {
        setOrder(res.data);
        // Nếu đơn hàng trước đó là online và thất bại, mặc định gợi ý COD
        if (
          ["vnpay", "paypal"].includes(res.data.paymentMethod?.toLowerCase())
        ) {
          setSelectedMethod("cod");
        }
      }
    } catch (err) {
      console.warn("Không thể tải thông tin đơn hàng:", err.message);
    } finally {
      setFetchingOrder(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Thanh toán thất bại - TienTech Shop";
    if (orderId) {
      fetchOrderInfo(orderId);
    }
  }, [orderId, fetchOrderInfo]);

  const handleChangeAndRetry = async () => {
    if (isSubmitting.current || submitting) return;

    if (!order) {
      showErrorToast("Không tìm thấy thông tin đơn hàng để xử lý");
      return;
    }

    if (order.paymentStatus === "paid") {
      showSuccessToast("Đơn hàng này đã được thanh toán thành công!");
      navigate(`/orders-detail/${order.id}`);
      return;
    }

    isSubmitting.current = true;
    setSubmitting(true);

    try {
      // 1. Trường hợp đổi sang COD (Thanh toán khi nhận hàng)
      if (selectedMethod === "cod") {
        const changeRes = await changePaymentMethod(order.id, "cod");
        if (changeRes && changeRes.errCode === 0) {
          showSuccessToast(
            "Đã chuyển sang phương thức Thanh toán khi nhận hàng (COD)!",
          );
          navigate("/checkout-success", { state: { order: changeRes.data } });
          return;
        } else {
          showErrorToast(
            changeRes?.errMessage || "Không thể đổi phương thức thanh toán",
          );
        }
      }

      // 2. Trường hợp thử lại bằng VNPAY
      if (selectedMethod === "vnpay") {
        if (order.paymentMethod?.toLowerCase() !== "vnpay") {
          await changePaymentMethod(order.id, "vnpay");
        }
        const vnpayRes = await createVnpayPaymentApi({
          amount: order.totalPrice,
          orderCode: order.orderCode,
        });

        if (vnpayRes && vnpayRes.errCode === 0 && vnpayRes.data?.paymentUrl) {
          window.location.href = vnpayRes.data.paymentUrl;
          return;
        } else {
          showErrorToast(
            vnpayRes?.errMessage ||
              "Không thể tạo lại liên kết thanh toán VNPAY",
          );
        }
      }
    } catch (err) {
      showErrorToast(err, "Có lỗi xảy ra khi xử lý đơn hàng");
    } finally {
      isSubmitting.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex items-center justify-center p-4 md:p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-red-500/10 dark:bg-red-600/15 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/10 dark:bg-amber-600/15 rounded-full blur-[110px]"></div>
      </div>

      <Motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 text-center"
      >
        {/* FAILED ANIMATED ICON */}
        <Motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 15,
            delay: 0.15,
          }}
          className="size-16 bg-gradient-to-tr from-rose-600 to-red-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-red-500/30"
        >
          <FiXCircle size={36} />
        </Motion.div>

        {/* TITLE */}
        <div className="space-y-1.5 mb-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Thanh Toán Chưa Thành Công
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Giao dịch bị gián đoạn hoặc đã bị hủy. Đơn hàng của bạn vẫn được giữ an toàn, bạn có thể đổi phương thức hoặc thử lại bên dưới.
          </p>
        </div>

        {/* ORDER INFO BOX */}
        {orderId && (
          <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 mb-5 border border-slate-200/80 dark:border-slate-800 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-500 to-amber-500" />
            <div className="min-w-0 flex-1 pl-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                Mã Đơn Hàng
              </span>
              <strong className="text-sm font-black text-slate-800 dark:text-white font-mono tracking-wider break-all block">
                #{order?.orderCode || orderId}
              </strong>
            </div>

            {fetchingOrder ? (
              <span className="text-xs text-slate-400 animate-pulse pl-1 sm:pl-0">Đang tải thông tin...</span>
            ) : order ? (
              <div className="text-left sm:text-right flex-shrink-0 pl-1 sm:pl-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                  Tổng Tiền
                </span>
                <span className="text-base font-black text-primary font-mono">
                  {Number(order.totalPrice || 0).toLocaleString("vi-VN")}₫
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* CHANGE PAYMENT METHOD SECTION */}
        {order && order.paymentStatus === "unpaid" && (
          <div className="mb-6 text-left space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiCreditCard className="text-primary" /> Chọn Phương Thức Thanh
              Toán Khác:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: COD */}
              <div
                onClick={() => setSelectedMethod("cod")}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                  selectedMethod === "cod"
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedMethod === "cod"
                      ? "bg-primary text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <FiTruck size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Khi nhận hàng (COD)
                    </h4>
                    {selectedMethod === "cod" && (
                      <FiCheck className="text-primary" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Thanh toán tiền mặt khi giao
                  </p>
                </div>
              </div>

              {/* Option 2: VNPAY */}
              <div
                onClick={() => setSelectedMethod("vnpay")}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                  selectedMethod === "vnpay"
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedMethod === "vnpay"
                      ? "bg-primary text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <FiCreditCard size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Cổng VNPAY (Thử lại)
                    </h4>
                    {selectedMethod === "vnpay" && (
                      <FiCheck className="text-primary" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Thẻ ATM / QR / Mobile
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {order && order.paymentStatus === "unpaid" ? (
            <Button
              type="button"
              variant="primary"
              loading={submitting}
              onClick={handleChangeAndRetry}
              icon={selectedMethod === "cod" ? FiTruck : FiRotateCw}
              className="w-full sm:flex-1 py-3.5"
            >
              {selectedMethod === "cod"
                ? "Đổi sang COD & Xác nhận"
                : "Thử lại qua VNPAY"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="danger"
              disabled={submitting}
              onClick={() => navigate("/cart")}
              icon={FiCreditCard}
              className="w-full sm:flex-1 py-3.5"
            >
              Quay lại giỏ hàng
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(order ? `/orders-detail/${order.id}` : "/orders")
            }
            icon={FiPackage}
            className="w-full sm:flex-1 py-3.5"
          >
            Xem đơn hàng của tôi
          </Button>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            icon={FiHome}
          >
            Quay về Trang chủ
          </Button>
        </div>
      </Motion.div>
    </div>
  );
};

export default CheckoutFailed;
