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
            className="size-10 bg-white dark:bg-dark-surface rounded-lg shadow-xs flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-all border border-slate-200 dark:border-slate-800"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <div className="tt-eyebrow mb-1">
              <span className="size-1.5 rounded-full bg-lime-500"></span>
              <span>INVENTORY DISPATCH // CART MANIFEST</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
              Giỏ Hàng Của Bạn
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              MANIFEST STATUS: {cartItems.length} MẶT HÀNG SẴN SÀNG KIỂM TRA
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="tt-card p-12 sm:p-20 text-center border-dashed">
            <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-5 text-slate-400">
              <FiShoppingBag size={30} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
              Giỏ Hàng Trống
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-xs sm:text-sm font-normal leading-relaxed">
              Chưa có linh kiện hoặc thiết bị nào được chọn. Hãy khám phá catalog phần cứng cao cấp của TienTech.
            </p>
            <Link
              to="/products"
              className="tt-button tt-button-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wider"
            >
              TIẾP TỤC KHÁM PHÁ <FiChevronRight />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-8 space-y-5 min-w-0">
              {/* Free Shipping Progress Widget */}
              <div className="tt-card p-4 sm:p-5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800">
                {(() => {
                  const freeShipThreshold = Number(freeshipMinOrder) || 5000000;
                  const percent = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));
                  const remaining = freeShipThreshold - subtotal;
                  return (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2 min-w-0 truncate">
                          <span className="size-2 rounded-full bg-lime-500 shrink-0"></span>
                          <span className="truncate">
                            {remaining <= 0
                              ? "Bạn đã đủ điều kiện Miễn phí vận chuyển nội thành!"
                              : `Cần thêm ${(remaining).toLocaleString("vi-VN")}₫ để hưởng chuẩn FreeShip.`}
                          </span>
                        </span>
                        <span className="font-mono text-primary dark:text-blue-400 font-bold ml-2 shrink-0">{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="tt-card bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="select-all-cart"
                      className="size-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-900 cursor-pointer"
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
                    <label htmlFor="select-all-cart" className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider cursor-pointer">
                      Chọn tất cả ({cartItems.length})
                    </label>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    TIENTECH VERIFIED
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
