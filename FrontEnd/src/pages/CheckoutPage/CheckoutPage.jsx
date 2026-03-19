import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCreditCard,
  FiChevronRight,
  FiCheckCircle,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createOrder } from "../../api/orderApi";
import { createPayment } from "../../api/paymentApi";
import { getAllCartItems } from "../../api/cartApi";
import { createVnpayPayment } from "../../api/paymentApi";
import { checkVoucherApi } from "../../api/voucherApi";
import { setCartItems, removeCartItem } from "../../redux/cartSlice";
import { resetCheckout } from "../../redux/checkoutSlice";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import { motion } from "framer-motion";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const cartItems = useSelector((state) => state.cart.cartItems);
  const checkoutState = useSelector((state) => state.checkout);

  const { product: singleProduct, quantity: singleQuantity } =
    location.state || {};
  const isSingleProduct = !!singleProduct;

  const [loading, setLoading] = useState(
    !isSingleProduct && cartItems.length === 0,
  );
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      if (!isSingleProduct && cartItems.length === 0) {
        setLoading(true);
        try {
          const res = await getAllCartItems();
          const items = res.data || [];
          dispatch(setCartItems(items));
        } catch (err) {
          console.error("Error fetching cart:", err);
          toast.error("Không thể tải giỏ hàng. Vui lòng thử lại!");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCart();
  }, [isSingleProduct, cartItems.length, dispatch]);

  const selectedItems = isSingleProduct
    ? [
        {
          id: singleProduct.id,
          product: singleProduct,
          quantity: singleQuantity,
        },
      ]
    : cartItems.filter((item) => checkoutState.selectedIds.includes(item.id));

  const subtotal = selectedItems.reduce((acc, item) => {
    const price = item.product?.discount
      ? (item.product.price * (100 - item.product.discount)) / 100
      : item.product?.price || 0;
    return acc + price * (item.quantity || 0);
  }, 0);

  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyVoucher = async (code) => {
    try {
      const res = await checkVoucherApi(code, subtotal);
      if (res.errCode === 0) {
        setDiscount(res.data.discountAmount);
        setAppliedVoucher(res.data.code);
        toast.success(res.message);
      } else {
        setDiscount(0);
        setAppliedVoucher("");
        toast.error(res.errMessage);
      }
    } catch (error) {
      toast.error("Lỗi áp dụng mã giảm giá");
    }
  };

  const handleOrderComplete = async (orderData, paypalDetails = null) => {
    try {
      const finalOrderData = {
        ...orderData,
        voucherCode: appliedVoucher || null,
      };

      const orderRes = await createOrder(finalOrderData);
      if (orderRes.errCode !== 0) {
        toast.error(orderRes.errMessage || "Lỗi khi tạo đơn hàng!");
        return;
      }

      const { id: orderId, orderCode } = orderRes.data;

      if (orderData.paymentMethod === "vnpay") {
        const paymentUrl = await createVnpayPayment({
          orderCode,
          amount: Math.round(finalTotal),
        });

        window.location.href = paymentUrl;
        return;
      }

      const paymentRes = await createPayment({
        orderId,
        userId: user.id,
        amount: finalTotal,
        method: orderData.paymentMethod,
        paymentStatus: paypalDetails ? "paid" : "unpaid",
        status: paypalDetails ? "completed" : "pending",
        paypalInfo: paypalDetails,
      });

      if (paymentRes.errCode !== 0) {
        toast.error(paymentRes.errMessage || "Thanh toán thất bại!");
        return;
      }

      if (!isSingleProduct) {
        selectedItems.forEach((item) => dispatch(removeCartItem(item.id)));
      }

      dispatch(resetCheckout());
      toast.success("Đặt hàng thành công!");
      navigate(`/checkout-success/${orderId}`);
    } catch (error) {
      console.error(error);
      toast.error("Thanh toán thất bại, vui lòng thử lại!");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-surface-500 font-medium">
          Đang chuẩn bị đơn hàng của bạn...
        </p>
      </div>
    );

  if (!selectedItems.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-6 text-center">
        <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mb-6">
          <FiCreditCard size={32} className="text-surface-300" />
        </div>
        <h2 className="text-2xl font-display text-surface-900 mb-2">
          Không có sản phẩm thanh toán
        </h2>
        <p className="text-surface-500 max-w-sm mb-8">
          Vui lòng quay lại giỏ hàng và chọn ít nhất một sản phẩm để tiến hành
          thanh toán.
        </p>
        <Link
          to={isSingleProduct ? "/" : "/cart"}
          className="inline-flex items-center gap-2 px-8 py-3 bg-surface-900 text-white font-bold rounded-2xl hover:bg-primary transition-all shadow-xl shadow-surface-900/10"
        >
          <FiArrowLeft /> QUAY LẠI
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-custom">
        {/* Breadcrumbs & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-surface-400 mb-2">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <FiChevronRight size={14} />
            <Link to="/cart" className="hover:text-primary transition-colors">
              Giỏ hàng
            </Link>
            <FiChevronRight size={14} />
            <span className="text-surface-900 font-bold">Thanh toán</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-display text-surface-900">
              Tiến hành thanh toán
            </h1>
            <div className="flex items-center gap-4 text-sm font-black text-surface-400 uppercase tracking-widest">
              <span className="flex items-center gap-2 text-emerald-500">
                <FiCheckCircle /> Giỏ hàng
              </span>
              <span className="w-8 h-[2px] bg-emerald-500/20"></span>
              <span className="text-primary font-black">Thông tin</span>
              <span className="w-8 h-[2px] bg-surface-200"></span>
              <span>Hoàn tất</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Section */}
          <div className="lg:col-span-8">
            <CheckoutForm
              user={user}
              total={finalTotal}
              selectedItems={selectedItems}
              onOrderComplete={handleOrderComplete}
              isSingleProduct={isSingleProduct}
            />
          </div>

          {/* Sidebar Section */}
          <aside className="lg:col-span-4 sticky top-24">
            <OrderSummary
              selectedItems={selectedItems}
              subtotal={subtotal}
              discount={discount}
              finalTotal={finalTotal}
              onApplyVoucher={handleApplyVoucher}
              appliedVoucher={appliedVoucher}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
