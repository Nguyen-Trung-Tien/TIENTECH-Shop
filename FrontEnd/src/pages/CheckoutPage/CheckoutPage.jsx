import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiChevronRight, FiCheckCircle } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createOrder } from "../../api/orderApi";
import { createPayment, createVnpayPayment } from "../../api/paymentApi";
import { checkVoucherApi } from "../../api/voucherApi";
import { removeCartItem } from "../../redux/cartSlice";
import { resetCheckout } from "../../redux/checkoutSlice";

import { useCart } from "../../hooks/useCart";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "../../components/Cart/OrderSummary";
import Button from "../../components/UI/Button";
import { motion } from "framer-motion";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const checkoutState = useSelector((state) => state.checkout);

  const { product: singleProduct, quantity: singleQuantity } = location.state || {};
  const isSingleProduct = !!singleProduct;

  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState("");

  const selectedItems = isSingleProduct
    ? [{ id: singleProduct.id, product: singleProduct, quantity: singleQuantity }]
    : cartItems.filter((item) => checkoutState.selectedIds.includes(item.id));

  const subtotal = selectedItems.reduce((acc, item) => {
    const price = item.product?.discount
      ? (item.product.price * (100 - item.product.discount)) / 100
      : item.product?.price || 0;
    return acc + price * (item.quantity || 0);
  }, 0);

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
    setLoading(true);
    try {
      const finalOrderData = { ...orderData, voucherCode: appliedVoucher || null };
      const orderRes = await createOrder(finalOrderData);
      
      if (orderRes.errCode !== 0) return toast.error(orderRes.errMessage);

      const { id: orderId, orderCode } = orderRes.data;
      const finalTotal = Math.max(0, subtotal - discount);

      if (orderData.paymentMethod === "vnpay") {
        const paymentUrl = await createVnpayPayment({ orderCode, amount: Math.round(finalTotal) });
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

      if (paymentRes.errCode === 0) {
        if (!isSingleProduct) {
          selectedItems.forEach((item) => dispatch(removeCartItem(item.id)));
        }
        dispatch(resetCheckout());
        toast.success("Đặt hàng thành công!");
        navigate(`/checkout-success/${orderId}`);
      }
    } catch (error) {
      toast.error("Thanh toán thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (selectedItems.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface-50">
      <h2 className="text-xl font-bold mb-4">Không có sản phẩm thanh toán</h2>
      <Button variant="primary" onClick={() => navigate("/cart")}>QUAY LẠI GIỎ HÀNG</Button>
    </div>
  );

  return (
    <main className="min-h-screen bg-surface-50 py-12">
      <div className="container-custom">
        <header className="mb-10">
          <div className="flex items-center gap-2 text-surface-400 mb-2 text-sm">
            <Link to="/" className="hover:text-primary">Trang chủ</Link>
            <FiChevronRight size={14} />
            <span className="text-surface-900 font-bold">Thanh toán</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-3xl font-display font-black text-surface-900">Tiến hành thanh toán</h1>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-surface-400">
               <span className="text-emerald-500 flex items-center gap-1.5"><FiCheckCircle /> Giỏ hàng</span>
               <div className="w-6 h-px bg-surface-200" />
               <span className="text-primary font-black">Thông tin</span>
               <div className="w-6 h-px bg-surface-200" />
               <span>Hoàn tất</span>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <section className="lg:col-span-8">
            <CheckoutForm 
              user={user} 
              total={subtotal - discount} 
              selectedItems={selectedItems}
              onOrderComplete={handleOrderComplete}
              loading={loading}
            />
          </section>

          <aside className="lg:col-span-4 sticky top-24">
            <OrderSummary 
              isCheckoutPage
              selectedItems={selectedItems}
              subtotal={subtotal}
              discount={discount}
              onApplyVoucher={handleApplyVoucher}
              appliedVoucher={appliedVoucher}
            />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
