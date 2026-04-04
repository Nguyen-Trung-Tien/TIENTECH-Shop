import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronRight,
  FiCheckCircle,
  FiShoppingBag,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createOrder } from "../../api/orderApi";
import { createVnpayPaymentApi } from "../../api/paymentApi";
import { clearCart, applyVoucher, removeVoucher } from "../../redux/cartSlice";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import VoucherSelector from "../../components/Cart/VoucherSelector";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const appliedVoucher = useSelector((state) => state.cart.appliedVoucher);

  const { selectedItems = [] } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [formData, setCheckoutData] = useState({
    shippingAddress: "",
    paymentMethod: "COD",
    note: "",
    fullName: "",
    phone: "",
  });

  // Redirect if no items
  useEffect(() => {
    if (selectedItems.length === 0) {
      toast.warn("Vui lòng chọn sản phẩm để thanh toán");
      navigate("/cart");
    }
  }, [selectedItems, navigate]);

  const subtotal = selectedItems.reduce((acc, item) => {
    if (item.finalPrice !== undefined) {
      return acc + Number(item.finalPrice) * (item.quantity || 0);
    }
    const basePrice =
      item.variant?.price != null
        ? Number(item.variant.price)
        : Number(item.product?.basePrice || item.product?.price || 0);
    const discount = Number(item.product?.discount || 0);
    const price = Math.round(
      discount > 0 ? basePrice * (1 - discount / 100) : basePrice,
    );
    return acc + price * (item.quantity || 0);
  }, 0);

  const handlePlaceOrder = async () => {
    if (!formData.shippingAddress) {
      return toast.error("Vui lòng nhập địa chỉ giao hàng");
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        shippingAddress: formData.shippingAddress,
        receiverName: formData.fullName || user.username,
        receiverPhone: formData.phone || user.phone,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        voucherCode: appliedVoucher?.code || null,
        orderItems: selectedItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          cartItemId: item.id,
        })),
      };

      const res = await createOrder(orderData, user.accessToken);
      if (res.errCode === 0) {
        dispatch(clearCart());

        // Nếu là VNPAY, gọi API lấy link thanh toán và redirect
        if (formData.paymentMethod === "VNPAY") {
          const vnpayRes = await createVnpayPaymentApi({
            amount: res.data.totalPrice,
            orderCode: res.data.orderCode,
          });

          if (vnpayRes.errCode === 0 && vnpayRes.data.paymentUrl) {
            window.location.href = vnpayRes.data.paymentUrl;
            return;
          } else {
            toast.error("Không thể khởi tạo thanh toán VNPAY");
          }
        }

        toast.success("Đặt hàng thành công!");
        navigate("/checkout-success", { state: { order: res.data } });
      } else {
        toast.error(res.errMessage);
      }
    } catch (err) {
      toast.error("Lỗi đặt hàng, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalApprove = async (data, actions) => {
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
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          cartItemId: item.id,
        })),
        paymentStatus: "paid", // Đánh dấu đã thanh toán
        paypalDetails: details,
      };

      const res = await createOrder(orderData, user.accessToken);
      if (res.errCode === 0) {
        dispatch(clearCart());
        toast.success("Thanh toán PayPal thành công!");
        navigate("/checkout-success", { state: { order: res.data } });
      } else {
        toast.error(res.errMessage);
      }
    } catch (err) {
      toast.error("Lỗi xử lý PayPal");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-dark-bg py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="p-3 bg-white dark:bg-dark-surface rounded-2xl shadow-sm text-slate-400 dark:text-dark-text-secondary hover:text-primary transition-all border border-transparent dark:border-dark-border"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Thanh toán
              </h1>
              <div className="flex items-center gap-2 text-slate-400 dark:text-dark-text-secondary text-xs font-bold uppercase tracking-widest mt-1">
                <span>Giỏ hàng</span>
                <FiChevronRight />
                <span className="text-primary">Thanh toán</span>
                <FiChevronRight />
                <span>Hoàn tất</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Info */}
          <div className="lg:col-span-7 space-y-8">
            <CheckoutForm
              formData={formData}
              setFormData={setCheckoutData}
              user={user}
            />

            {/* List items section */}
            <div className="bg-white dark:bg-dark-surface rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-dark-border">
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
                    <div className="w-16 h-16 bg-white dark:bg-dark-bg rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-dark-border">
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
                          {Object.values(item.variant.attributes || {}).join(
                            " / ",
                          )}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-black text-primary">
                          {Number(
                            item.finalPrice ||
                              item.variant?.price ||
                              item.product?.basePrice,
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
            <div className="bg-white dark:bg-dark-surface rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-dark-border">
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
      </div>
    </main>
  );
};

export default CheckoutPage;
