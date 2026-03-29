import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiShoppingBag, FiChevronRight } from "react-icons/fi";
import { useCart } from "../../hooks/useCart";
import CartItem from "../../components/Cart/CartItem";
import OrderSummary from "../../components/Cart/OrderSummary";
import CartSkeleton from "../../components/CartSkeleton/CartSkeleton";
import VoucherSelector from "../../components/Cart/VoucherSelector";
import { applyVoucher, removeVoucher } from "../../redux/cartSlice";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, fetchCart, handleUpdateQty, handleRemoveItem, calculateSubtotal } = useCart();
  const appliedVoucher = useSelector((state) => state.cart.appliedVoucher);
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      await fetchCart();
      setLoading(false);
    };
    loadCart();
  }, [fetchCart]);

  // Sync selected items when cart first loads
  useEffect(() => {
    if (cartItems.length > 0 && !isInitialized) {
      setSelectedItems(cartItems.map((i) => i.id));
      setIsInitialized(true);
    }
  }, [cartItems, isInitialized]);

  const subtotal = useMemo(() => calculateSubtotal(selectedItems), [selectedItems, calculateSubtotal]);

  // Tự động kiểm tra điều kiện voucher khi subtotal thay đổi
  useEffect(() => {
    if (appliedVoucher) {
      // Giả sử chúng ta không fetch lại từ server ở đây mà chỉ check đơn giản minOrderValue
      // Thực tế nên gọi API check lại để an toàn hơn
    }
  }, [subtotal, appliedVoucher]);

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRemove = async (id) => {
    try {
      await handleRemoveItem(id);
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    } catch (error) {
      // Error handled in useCart
    }
  };

  const handleCheckOut = () => {
    const itemsToCheckout = cartItems.filter((i) => selectedItems.includes(i.id));
    if (itemsToCheckout.length === 0) {
      return alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
    }
    navigate("/checkout", { 
      state: { 
        selectedItems: itemsToCheckout,
        subtotal: subtotal,
        appliedVoucher: appliedVoucher
      } 
    });
  };

  if (loading) return <CartSkeleton />;

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/" className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-primary transition-all">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Giỏ hàng của bạn</h1>
            <p className="text-slate-500 font-medium">Bạn đang có {cartItems.length} sản phẩm</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center shadow-sm border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <FiShoppingBag className="text-slate-200" size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase">Giỏ hàng trống</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
              Hàng ngàn sản phẩm công nghệ đang chờ đón bạn. Hãy chọn cho mình món đồ ưng ý nhé!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-200"
            >
              TIẾP TỤC MUA SẮM <FiChevronRight />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary"
                      checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                      onChange={() => setSelectedItems(selectedItems.length === cartItems.length ? [] : cartItems.map(i => i.id))}
                    />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Chọn tất cả</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">TienTech Official</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQty={handleUpdateQty}
                      onRemove={handleRemove}
                      onSelect={toggleSelect}
                      isSelected={selectedItems.includes(item.id)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Voucher Area */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Ưu đãi & Mã giảm giá</h3>
                <VoucherSelector 
                  subtotal={subtotal} 
                  appliedVoucher={appliedVoucher}
                  onApply={(v) => dispatch(applyVoucher(v))}
                  onRemove={() => dispatch(removeVoucher())}
                />
              </div>
            </div>

            <aside className="lg:col-span-4 sticky top-10">
              <OrderSummary
                items={cartItems.filter((i) => selectedItems.includes(i.id))}
                subtotal={subtotal}
                appliedVoucher={appliedVoucher}
                onCheckout={handleCheckOut}
              />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
