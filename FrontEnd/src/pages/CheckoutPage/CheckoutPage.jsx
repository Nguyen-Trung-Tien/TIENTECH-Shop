import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronRight,
  FiCheckCircle,
  FiShoppingBag,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { showErrorToast, showSuccessToast, showWarningToast } from "../../utils/toastHelper";
import { createOrder } from "../../api/orderApi";
import { createVnpayPaymentApi } from "../../api/paymentApi";
import { removePurchasedItems, applyVoucher, removeVoucher } from "../../redux/cartSlice";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import VoucherSelector from "../../components/Cart/VoucherSelector";
import { PageShell } from "../../components/UI";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const appliedVoucher = useSelector((state) => state.cart.appliedVoucher);

  const { selectedItems = [] } = location.state || {};

  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);
  const idempotencyKeyRef = useRef(
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  );
  const [formData, setCheckoutData] = useState({
    shippingAddress: "",
    paymentMethod: "COD",
    note: "",
    fullName: user?.username || user?.fullName || "",
    phone: user?.phone || "",
  });

  useUnsavedChangesGuard(
    !loading && Boolean(formData.shippingAddress?.trim() || formData.note?.trim())
  );

  // Redirect if no items
  useEffect(() => {
    if (selectedItems.length === 0) {
      showWarningToast("Vui lòng chọn sản phẩm để thanh toán");
      navigate("/cart");
    }
  }, [selectedItems, navigate]);

  const subtotal = selectedItems.reduce((acc, item) => {
    if (item.finalPrice !== undefined && item.finalPrice !== null) {
      return acc + Number(item.finalPrice) * (item.quantity || 0);
    }
    if (item.isFlashSaleActive && item.product?.flashSalePrice) {
      return acc + Math.round(Number(item.product.flashSalePrice)) * (item.quantity || 0);
    }
    const basePrice =
      item.variant?.price != null
        ? Number(item.variant.price)
        : Number(item.product?.basePrice || item.product?.price || 0);
    const discount = Number(
      item.variant?.discount != null && item.variant?.discount !== 0
        ? item.variant.discount
        : (item.product?.discount || 0)
    );
    const price = Math.round(
      discount > 0 ? basePrice * (1 - discount / 100) : basePrice,
    );
    return acc + price * (item.quantity || 0);
  }, 0);

  const handlePlaceOrder = async () => {
    if (isSubmitting.current || loading) return;
    const receiverName = formData.fullName?.trim() || user?.username || user?.fullName || "";
    const receiverPhone = formData.phone?.trim() || user?.phone || "";

    if (!receiverName) {
      return showErrorToast("Vui lòng nhập họ và tên người nhận hàng");
    }
    if (!receiverPhone) {
      return showErrorToast("Vui lòng nhập số điện thoại người nhận hàng");
    }
    if (!formData.shippingAddress?.trim()) {
      return showErrorToast("Vui lòng nhập hoặc chọn địa chỉ giao hàng");
    }

    isSubmitting.current = true;
    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        shippingAddress: formData.shippingAddress.trim(),
        receiverName: receiverName,
        receiverPhone: receiverPhone,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        voucherCode: appliedVoucher?.code || null,
        orderItems: selectedItems.map((item) => ({
          productId: item.productId || item.product?.id || item.product?.productId,
          variantId: item.variantId || item.variant?.id || null,
          quantity: item.quantity,
          cartItemId: item.id,
        })),
      };

      const res = await createOrder(orderData, {
        headers: { "X-Idempotency-Key": idempotencyKeyRef.current },
      });
      if (res && res.errCode === 0) {
        dispatch(removePurchasedItems(selectedItems));

        // Nếu là VNPAY, gọi API lấy link thanh toán và redirect
        if (formData.paymentMethod === "VNPAY") {
          const vnpayRes = await createVnpayPaymentApi({
            amount: res.data.totalPrice,
            orderCode: res.data.orderCode,
          });

          if (vnpayRes && vnpayRes.errCode === 0 && vnpayRes.data?.paymentUrl) {
            window.location.href = vnpayRes.data.paymentUrl;
            return;
          } else {
            showErrorToast(vnpayRes?.errMessage || "Không thể khởi tạo thanh toán VNPAY");
            navigate(`/checkout-failed/${res.data.orderCode}`);
            return;
          }
        }

        showSuccessToast("Đặt hàng thành công!");
        navigate("/checkout-success", { state: { order: res.data } });
      } else {
        showErrorToast(res?.errMessage || "Đặt hàng thất bại!");
      }
    } catch (error) {
      showErrorToast(error, "Lỗi đặt hàng, vui lòng thử lại");
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  const handlePayPalApprove = async (data, actions) => {
    if (isSubmitting.current || loading) return;
    isSubmitting.current = true;
    setLoading(true);
    try {
      const details = await actions.order.capture();
      // Sau khi PayPal capture thành công, tạo đơn hàng với paymentMethod là PAYPAL và status là paid
      const orderData = {
        userId: user.id,
        shippingAddress: formData.shippingAddress || user.address,
        receiverName: formData.fullName || user.username,
        receiverPhone: formData.phone || user.phone,
        paymentMethod: "PAYPAL",
        note: formData.note,
        voucherCode: appliedVoucher?.code || null,
        orderItems: selectedItems.map((item) => ({
          productId: item.productId || item.product?.id || item.product?.productId,
          variantId: item.variantId || item.variant?.id || null,
          quantity: item.quantity,
          cartItemId: item.id,
        })),
        paymentStatus: "paid", // Đánh dấu đã thanh toán
        paypalDetails: details,
      };

      const res = await createOrder(orderData, {
        headers: { "X-Idempotency-Key": idempotencyKeyRef.current },
      });
      if (res && res.errCode === 0) {
        dispatch(removePurchasedItems(selectedItems));
        showSuccessToast("Thanh toán PayPal thành công!");
        navigate("/checkout-success", { state: { order: res.data } });
      } else {
        showErrorToast(res?.errMessage || "Đặt hàng thất bại!");
      }
    } catch (error) {
      showErrorToast(error, "Lỗi xử lý PayPal");
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="CHECKOUT // SECURE PAYMENT"
      title="Thanh toán"
      subtitle={
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <span>Giỏ hàng</span>
          <FiChevronRight />
          <span className="text-primary">Thanh toán</span>
          <FiChevronRight />
          <span>Hoàn tất</span>
        </span>
      }
      backTo="/cart"
      backLabel="Quay lại giỏ hàng"
      maxWidthClass="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Info */}
          <div className="lg:col-span-7 space-y-8">
            <CheckoutForm
              formData={formData}
              setFormData={setCheckoutData}
              user={user}
            />

            {/* List items section */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] p-4 sm:p-6 md:p-8 shadow-sm border border-slate-100 dark:border-dark-border">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <FiShoppingBag className="text-primary" /> Sản phẩm (
                {selectedItems.length})
              </h3>
              <div className="space-y-4">
                {selectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border"
                  >
                    <div className="size-16 bg-white dark:bg-dark-bg rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-dark-border">
                      <img
                        src={item.variant?.imageUrl || item.product?.image}
                        alt={item.product?.name}
                        className="w-full h-full object-contain p-2 dark:mix-blend-normal"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                        {item.product?.name}
                      </h4>
                      {item.variant && (
                        <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase mt-1">
                          Loại:{" "}
                          {Object.values(item.variant.attributes || {})
                            .flatMap((v) => {
                              const val =
                                typeof v === "object" ? v.value || "" : v;
                              return val ? [val] : [];
                            })
                            .join(" / ")}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-black text-primary">
                          {Number(
                            item.finalPrice ??
                              item.price ??
                              (item.isFlashSaleActive && item.product?.flashSalePrice
                                ? item.product.flashSalePrice
                                : item.variant?.price ?? item.product?.basePrice ?? 0)
                          ).toLocaleString()}
                          ₫
                        </p>
                        <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest bg-slate-200 dark:bg-dark-surface px-2 py-1 rounded-md">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voucher Selection in Checkout */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] p-4 sm:p-6 md:p-8 shadow-sm border border-slate-100 dark:border-dark-border">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <FiCheckCircle className="text-primary" /> Ưu đãi của bạn
              </h3>
              <VoucherSelector
                subtotal={subtotal}
                appliedVoucher={appliedVoucher}
                onApply={(v) => dispatch(applyVoucher(v))}
                onRemove={() => dispatch(removeVoucher())}
              />
            </div>
          </div>

          {/* Right: Summary */}
          <aside className="lg:col-span-5">
            <div className="sticky top-10 space-y-6">
              <OrderSummary
                selectedItems={selectedItems}
                subtotal={subtotal}
                appliedVoucher={appliedVoucher}
                loading={loading}
                paymentMethod={formData.paymentMethod}
                onPlaceOrder={handlePlaceOrder}
                onPayPalApprove={handlePayPalApprove}
              />
            </div>
          </aside>
        </div>
    </PageShell>
  );
};

export default CheckoutPage;
