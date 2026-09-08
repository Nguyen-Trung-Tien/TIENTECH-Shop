import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiShoppingBag, FiChevronRight } from "react-icons/fi";
import { useCart } from "../../hooks/useCart";
import CartItem from "../../components/Cart/CartItem";
import OrderSummary from "../../components/Cart/OrderSummary";
import CartSkeleton from "../../components/CartSkeleton/CartSkeleton";
import VoucherSelector from "../../components/Cart/VoucherSelector";
import { applyVoucher, removeVoucher } from "../../redux/cartSlice";
import { validateCart } from "../../api/cartApi";
import { toast } from "react-toastify";
import { showErrorToast } from "../../utils/toastHelper";
import { useSystemSettings } from "../../context/useSystemSettings";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { freeshipMinOrder } = useSystemSettings();
  const {
    cartItems,
    fetchCart,
    handleUpdateQty,
    handleRemoveItem,
    calculateSubtotal,
  } = useCart();
  const appliedVoucher = useSelector((state) => state.cart.appliedVoucher);

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
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

  const subtotal = useMemo(
    () => calculateSubtotal(selectedItems),
    [selectedItems, calculateSubtotal],
  );

  // Tự động kiểm tra điều kiện voucher khi subtotal thay đổi
  useEffect(() => {
    if (appliedVoucher) {
      // Giả sử chúng ta không fetch lại từ server ở đây mà chỉ check đơn giản minOrderValue
      // Thực tế nên gọi API check lại để an toàn hơn
    }
  }, [subtotal, appliedVoucher]);

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleRemove = async (id) => {
    try {
      await handleRemoveItem(id);
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    } catch {
      // Error handled in useCart
    }
  };

  const handleCheckOut = async () => {
    const itemsToCheckout = cartItems.filter((i) =>
      selectedItems.includes(i.id),
    );
    if (itemsToCheckout.length === 0) {
      return toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
    }

    setIsValidating(true);
    try {
      const response = await validateCart(itemsToCheckout);
      if (response.errCode === 0) {
        const { items, hasChanged, totalAmount } = response.data;

        if (hasChanged) {
          toast.info(
            "Một số thông tin sản phẩm (giá hoặc tồn kho) đã thay đổi. Vui lòng kiểm tra lại!",
          );
          await fetchCart();
          return;
        }

        navigate("/checkout", {
          state: {
            selectedItems: items,
            subtotal: totalAmount,
            appliedVoucher: appliedVoucher,
          },
        });
      } else {
        showErrorToast(
          response?.errMessage || "Có lỗi xảy ra khi xác thực giỏ hàng",
        );
      }
    } catch (error) {
      console.error("Checkout validation error:", error);
      showErrorToast(error, "Không thể kết nối với máy chủ để xác thực giỏ hàng");
    } finally {
      setIsValidating(false);
    }
  };

  if (loading) return <CartSkeleton />;

  return (
    <main className="min-h-screen bg-ivory dark:bg-dark-bg py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-8">
          <Link
            to="/"
            aria-label="Quay lại trang chủ"
            className="size-10 bg-white dark:bg-dark-surface rounded-xl shadow-xs flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-all border border-slate-200/80 dark:border-slate-800"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              Giỏ hàng của bạn
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Bạn đang có <span className="font-semibold text-primary dark:text-blue-400">{cartItems.length}</span> sản phẩm trong giỏ hàng
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl p-12 sm:p-20 text-center bg-white dark:bg-dark-surface border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="size-20 bg-blue-50 dark:bg-blue-950/40 rounded-3xl flex items-center justify-center mx-auto mb-5 text-primary dark:text-blue-400">
              <FiShoppingBag size={36} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Giỏ hàng đang trống
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-xs sm:text-sm leading-relaxed">
              Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá ngay hàng ngàn sản phẩm công nghệ chính hãng tại TienTech!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/20 transition-all active:scale-98"
            >
              Tiếp tục mua sắm <FiChevronRight />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-8 space-y-5 min-w-0">
              {/* Free Shipping Progress Widget */}
              <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-dark-surface border border-slate-100 dark:border-slate-800 shadow-xs">
                {(() => {
                  const freeShipThreshold = Number(freeshipMinOrder) || 5000000;
                  const percent = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));
                  const remaining = freeShipThreshold - subtotal;
                  return (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-2.5">
                        <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2 min-w-0 truncate">
                          <span className="size-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="truncate">
                            {remaining <= 0
                              ? "Chúc mừng! Bạn đã đủ điều kiện nhận Miễn phí vận chuyển"
                              : `Mua thêm ${(remaining).toLocaleString("vi-VN")}₫ để được miễn phí giao hàng.`}
                          </span>
                        </span>
                        <span className="text-primary dark:text-blue-400 font-bold ml-2 shrink-0">{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="select-all-cart"
                      className="size-4 rounded-md border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-900 cursor-pointer"
                      checked={
                        selectedItems.length === cartItems.length &&
                        cartItems.length > 0
                      }
                      onChange={() =>
                        setSelectedItems(
                          selectedItems.length === cartItems.length
                            ? []
                            : cartItems.map((i) => i.id),
                        )
                      }
                    />
                    <label htmlFor="select-all-cart" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Chọn tất cả ({cartItems.length} sản phẩm)
                    </label>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                    Đảm bảo chính hãng
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
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
              <div className="bg-white dark:bg-dark-surface rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-dark-border">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">
                  Ưu đãi & Mã giảm giá
                </h3>
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
                loading={isValidating}
              />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
