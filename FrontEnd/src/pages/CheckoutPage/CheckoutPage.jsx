import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronRight,
  FiCheckCircle,
  FiShoppingBag,
  FiAward,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { showErrorToast, showSuccessToast, showWarningToast } from "../../utils/toastHelper";
import { createOrder } from "../../api/orderApi";
import {
  createVnpayPaymentApi,
  createPaypalOrderApi,
  capturePaypalOrderApi,
} from "../../api/paymentApi";
import { getMeApi } from "../../api/userApi";
import { removePurchasedItems, applyVoucher, removeVoucher } from "../../redux/cartSlice";
import {
  clearCheckoutSession,
  setCheckoutPointsUsed,
} from "../../redux/checkoutSlice";
import { setUser } from "../../redux/userSlice";
import { calculateFinalPrice } from "../../utils/priceHelper";
import { waitForGuestCartSync } from "../../utils/guestCart";
import {
  calculateMaxUsablePoints,
  getTierProgress,
  POINT_VALUE_VND,
} from "../../utils/loyaltyHelper";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import VoucherSelector from "../../components/Cart/VoucherSelector";
import { PageShell } from "../../components/UI";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import { useDocumentMeta } from "../../features/shared/hooks/useDocumentMeta";

const CheckoutPage = () => {
  useDocumentMeta({
    title: "Thanh toán đơn hàng",
    description: "Hoàn tất đặt hàng an toàn qua COD, VNPay hoặc PayPal tại TIENTECH Shop.",
    canonicalPath: "/checkout",
  });
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const appliedVoucher = useSelector((state) => state.cart.appliedVoucher);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const checkoutState = useSelector((state) => state.checkout);

  const selectedItems = useMemo(() => {
    if (
      Array.isArray(location.state?.selectedItems) &&
      location.state.selectedItems.length > 0
    ) {
      return location.state.selectedItems;
    }
    return Array.isArray(checkoutState?.items) ? checkoutState.items : [];
  }, [location.state?.selectedItems, checkoutState?.items]);

  const checkoutMode = location.state?.mode || checkoutState?.mode || "cart";

  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);
  const orderCompletedRef = useRef(false);
  const pendingPaypalOrderIdRef = useRef(null);
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
    !loading && !orderCompletedRef.current && Boolean(formData.shippingAddress?.trim() || formData.note?.trim())
  );

  // Redirect if no items
  useEffect(() => {
    if (orderCompletedRef.current) return;
    if (selectedItems.length === 0) {
      showWarningToast("Vui lòng chọn sản phẩm để thanh toán");
      navigate("/cart");
    }
  }, [selectedItems, navigate]);

  const subtotal = selectedItems.reduce((acc, item) => {
    if (item.finalPrice !== undefined && item.finalPrice !== null) {
      return acc + Number(item.finalPrice) * (item.quantity || 0);
    }
    const price = calculateFinalPrice(item.product, item.variant);
    return acc + price * (item.quantity || 0);
  }, 0);

  const voucherDiscount = appliedVoucher
    ? Number(appliedVoucher.discountAmount || 0)
    : 0;
  const subtotalAfterVoucher = Math.max(0, subtotal - voucherDiscount);
  const maxUsablePoints = calculateMaxUsablePoints(
    subtotalAfterVoucher,
    user?.points || 0,
  );
  const effectivePointsUsed = Math.min(
    maxUsablePoints,
    Math.max(0, Math.floor(Number(checkoutState?.pointsUsed || 0))),
  );
  const pointsDiscount = effectivePointsUsed * POINT_VALUE_VND;
  const tierProgress = getTierProgress(user?.points, user?.rank);

  const buildOrderItemsPayload = () =>
    selectedItems.map((item) => {
      const productId =
        item.productId || item.product?.id || item.product?.productId;
      const variantId = item.variantId || item.variant?.id || null;
      let resolvedCartItemId = null;

      if (checkoutMode !== "buy_now" && !String(item.id).startsWith("buynow_")) {
        if (String(item.id).startsWith("guest_")) {
          const matchedServerItem = cartItems.find(
            (c) =>
              !String(c.id).startsWith("guest_") &&
              Number(c.productId) === Number(productId) &&
              (c.variantId || null) === (variantId || null),
          );
          resolvedCartItemId = matchedServerItem?.id || null;
        } else {
          resolvedCartItemId = item.id;
        }
      }

      return {
        productId,
        variantId,
        quantity: item.quantity,
        cartItemId: resolvedCartItemId,
      };
    });

  const handleAfterOrderSuccess = async () => {
    orderCompletedRef.current = true;
    if (checkoutMode === "cart") {
      const syncedToRemove = selectedItems.map((item) => {
        if (!String(item.id).startsWith("guest_")) return item;
        const productId =
          item.productId || item.product?.id || item.product?.productId;
        const variantId = item.variantId || item.variant?.id || null;
        const matched = cartItems.find(
          (c) =>
            Number(c.productId) === Number(productId) &&
            (c.variantId || null) === (variantId || null),
        );
        return matched || item;
      });
      dispatch(removePurchasedItems(syncedToRemove));
    }
    dispatch(clearCheckoutSession());
    try {
      const meRes = await getMeApi();
      if (meRes?.errCode === 0 && meRes?.data) {
        dispatch(setUser(meRes.data));
      }
    } catch {
      // Ignore silent profile refresh errors
    }
  };

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

    if (!user?.id) {
      showWarningToast("Vui lòng đăng nhập để hoàn tất đơn hàng!");
      navigate("/login?redirect=/checkout");
      return;
    }

    isSubmitting.current = true;
    setLoading(true);
    try {
      if (checkoutMode !== "buy_now") {
        await waitForGuestCartSync();
      }
      const orderData = {
        userId: user.id,
        shippingAddress: formData.shippingAddress.trim(),
        receiverName: receiverName,
        receiverPhone: receiverPhone,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        voucherCode: appliedVoucher?.code || null,
        pointsUsed: effectivePointsUsed,
        checkoutMode,
        orderItems: buildOrderItemsPayload(),
      };

      const res = await createOrder(orderData, {
        headers: { "X-Idempotency-Key": idempotencyKeyRef.current },
      });
      if (res && res.errCode === 0) {
        await handleAfterOrderSuccess();

        // Nếu là VNPAY, gọi API lấy link thanh toán và redirect
        if (formData.paymentMethod === "VNPAY") {
          const vnpayRes = await createVnpayPaymentApi({
            amount: res.data.totalPrice,
            orderCode: res.data.orderCode,
          });

          if (vnpayRes && vnpayRes.errCode === 0 && vnpayRes.data?.zeroAmountCompleted) {
            showSuccessToast("Đơn hàng 0đ đã được xác nhận thành công!");
            navigate("/checkout-success", { state: { order: res.data } });
            return;
          } else if (vnpayRes && vnpayRes.errCode === 0 && vnpayRes.data?.paymentUrl) {
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

  const latestCheckoutContextRef = useRef(null);
  latestCheckoutContextRef.current = {
    user,
    formData,
    appliedVoucher,
    effectivePointsUsed,
    checkoutMode,
    buildOrderItemsPayload,
  };

  const handlePayPalCreateOrder = async () => {
    const ctx = latestCheckoutContextRef.current;
    const currentUser = ctx?.user;
    const currentForm = ctx?.formData || {};

    if (!currentUser?.id) {
      showWarningToast("Vui lòng đăng nhập để hoàn tất đơn hàng!");
      navigate("/login?redirect=/checkout");
      throw new Error("Vui lòng đăng nhập để thanh toán PayPal.");
    }

    const receiverName =
      currentForm.fullName?.trim() || currentUser?.username || currentUser?.fullName || "";
    const receiverPhone = currentForm.phone?.trim() || currentUser?.phone || "";

    if (!receiverName) {
      const msg = "Vui lòng nhập họ và tên người nhận hàng";
      showErrorToast(msg);
      throw new Error(msg);
    }
    if (!receiverPhone) {
      const msg = "Vui lòng nhập số điện thoại người nhận hàng";
      showErrorToast(msg);
      throw new Error(msg);
    }
    if (!currentForm.shippingAddress?.trim()) {
      const msg = "Vui lòng nhập hoặc chọn địa chỉ giao hàng";
      showErrorToast(msg);
      throw new Error(msg);
    }

    if (ctx.checkoutMode !== "buy_now") {
      await waitForGuestCartSync();
    }

    const attemptKey =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `pp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const orderData = {
      userId: currentUser.id,
      shippingAddress: currentForm.shippingAddress.trim(),
      receiverName,
      receiverPhone,
      paymentMethod: "PAYPAL",
      note: currentForm.note,
      voucherCode: ctx.appliedVoucher?.code || null,
      pointsUsed: ctx.effectivePointsUsed,
      checkoutMode: ctx.checkoutMode,
      orderItems: ctx.buildOrderItemsPayload(),
    };

    const res = await createPaypalOrderApi(orderData, {
      headers: { "X-Idempotency-Key": attemptKey },
    });

    if (res?.errCode === 0 && res?.data?.paypalOrderId && res?.data?.order?.id) {
      pendingPaypalOrderIdRef.current = res.data.order.id;
      return res.data.paypalOrderId;
    }

    const errMsg = res?.errMessage || "Không thể khởi tạo giao dịch PayPal!";
    showErrorToast(errMsg);
    throw new Error(errMsg);
  };

  const handlePayPalApprove = async (data) => {
    if (isSubmitting.current || loading) return;
    if (!user?.id) {
      showWarningToast("Vui lòng đăng nhập để hoàn tất đơn hàng!");
      navigate("/login?redirect=/checkout");
      return;
    }

    const orderId = pendingPaypalOrderIdRef.current;
    const paypalOrderId = data?.orderID;
    if (!orderId || !paypalOrderId) {
      showErrorToast("Thiếu thông tin giao dịch PayPal để xác thực.");
      return;
    }

    isSubmitting.current = true;
    setLoading(true);
    try {
      const res = await capturePaypalOrderApi(
        { orderId, paypalOrderId },
        {
          headers: {
            "X-Idempotency-Key": `capture_${orderId}_${paypalOrderId}`,
          },
        },
      );
      if (res && res.errCode === 0) {
        pendingPaypalOrderIdRef.current = null;
        await handleAfterOrderSuccess();
        showSuccessToast("Thanh toán PayPal thành công!");
        navigate("/checkout-success", { state: { order: res.data } });
      } else {
        showErrorToast(res?.errMessage || "Xác thực thanh toán PayPal thất bại!");
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
                <FiShoppingBag className="text-primary" /> Sản phẩm ({selectedItems.length})
              </h3>
              <div className="space-y-4">
                {selectedItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border min-w-0"
                  >
                    <div className="size-16 bg-white dark:bg-dark-bg rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-dark-border">
                      <img
                        src={item.variant?.imageUrl || item.variant?.image || item.product?.image}
                        alt={item.product?.name}
                        className="w-full h-full object-contain p-2 dark:mix-blend-normal"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase break-words [overflow-wrap:anywhere]">
                        {item.product?.name}
                      </h4>
                      {item.variant && (
                        <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase mt-1 break-words [overflow-wrap:anywhere]">
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
                      <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                        <p className="text-xs font-black text-primary">
                          {Number(
                            item.finalPrice ??
                              item.price ??
                              calculateFinalPrice(item.product, item.variant)
                          ).toLocaleString()}
                          ₫
                        </p>
                        <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest bg-slate-200 dark:bg-dark-surface px-2 py-1 rounded-md shrink-0">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voucher & Loyalty Points Redemption in Checkout */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] p-4 sm:p-6 md:p-8 shadow-sm border border-slate-100 dark:border-dark-border space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-primary" /> Ưu đãi của bạn
                </h3>
                <VoucherSelector
                  subtotal={subtotal}
                  appliedVoucher={appliedVoucher}
                  onApply={(v) => dispatch(applyVoucher(v))}
                  onRemove={() => dispatch(removeVoucher())}
                />
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-dark-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FiAward className="text-amber-500 shrink-0" size={18} />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                        Đổi điểm thành viên ({tierProgress.currentTier.label})
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-dark-text-secondary">
                        Hiện có <strong>{tierProgress.points.toLocaleString()} điểm</strong> • 1 điểm = {POINT_VALUE_VND.toLocaleString()}₫ (tối đa 10% giá trị đơn)
                      </p>
                    </div>
                  </div>
                  {maxUsablePoints > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          setCheckoutPointsUsed(
                            effectivePointsUsed === maxUsablePoints
                              ? 0
                              : maxUsablePoints,
                          ),
                        )
                      }
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 transition cursor-pointer shrink-0"
                    >
                      {effectivePointsUsed === maxUsablePoints
                        ? "Bỏ dùng điểm"
                        : `Dùng tối đa (${maxUsablePoints.toLocaleString()} điểm)`}
                    </button>
                  )}
                </div>

                {/* Mini Membership Tier Progress */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-slate-100 dark:bg-dark-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full transition-all duration-500"
                      style={{ width: `${tierProgress.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-dark-text-secondary">
                    {tierProgress.nextTier
                      ? `Tích thêm ${tierProgress.pointsToNext.toLocaleString()} điểm để thăng hạng ${tierProgress.nextTier.label}`
                      : "Bạn đã đạt hạng thành viên cao nhất!"}
                  </p>
                </div>

                {maxUsablePoints > 0 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <label
                      htmlFor="checkout-points-input"
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0"
                    >
                      Số điểm sử dụng:
                    </label>
                    <input
                      id="checkout-points-input"
                      type="number"
                      min={0}
                      max={maxUsablePoints}
                      value={effectivePointsUsed}
                      onChange={(e) => {
                        const raw = Math.floor(Number(e.target.value) || 0);
                        dispatch(
                          setCheckoutPointsUsed(
                            Math.min(maxUsablePoints, Math.max(0, raw)),
                          ),
                        );
                      }}
                      className="w-32 px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                    />
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      -{pointsDiscount.toLocaleString()}₫
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <aside className="lg:col-span-5">
            <div className="sticky top-10 space-y-6">
              <OrderSummary
                selectedItems={selectedItems}
                subtotal={subtotal}
                appliedVoucher={appliedVoucher}
                pointsUsed={effectivePointsUsed}
                pointsDiscount={pointsDiscount}
                loading={loading}
                paymentMethod={formData.paymentMethod}
                onPlaceOrder={handlePlaceOrder}
                onPayPalCreateOrder={handlePayPalCreateOrder}
                onPayPalApprove={handlePayPalApprove}
              />
            </div>
          </aside>
        </div>
    </PageShell>
  );
};

export default CheckoutPage;
