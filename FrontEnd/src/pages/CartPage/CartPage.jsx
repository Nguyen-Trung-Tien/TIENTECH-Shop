import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiShoppingBag, FiChevronRight } from "react-icons/fi";
import { useCart } from "../../hooks/useCart";
import CartItem from "../../components/Cart/CartItem";
import OrderSummary from "../../components/Cart/OrderSummary";
import { CartSkeleton } from "../../components/Loading";
import VoucherSelector from "../../components/Cart/VoucherSelector";
import { applyVoucher, removeVoucher } from "../../redux/cartSlice";
import { setCartCheckout } from "../../redux/checkoutSlice";
import { validateCart } from "../../api/cartApi";
import { showErrorToast, showWarningToast, showInfoToast } from "../../utils/toastHelper";
import { useSystemSettings } from "../../context/useSystemSettings";
import { ErrorBanner, PageShell, EmptyState } from "../../components/UI";

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
  const user = useSelector((state) => state.user.user);
  const isInitializing = useSelector((state) => state.user.isInitializing);

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadCart = React.useCallback(async () => {
    if (isInitializing) return;
    setLoading(true);
    setCartError(null);
    try {
      await fetchCart();
    } catch {
      setCartError("Không thể tải giỏ hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [fetchCart, isInitializing]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Sync selected items when cart first loads or transitions from guest to synced server IDs
  useEffect(() => {
    if (cartItems.length > 0 && !isInitialized) {
      setSelectedItems(cartItems.map((i) => i.id));
      setIsInitialized(true);
      return;
    }
    if (cartItems.length > 0 && user?.id) {
      const hasStaleGuestSelection = selectedItems.some((id) =>
        String(id).startsWith("guest_"),
      );
      const hasServerItems = cartItems.some(
        (i) => !String(i.id).startsWith("guest_"),
      );
      if (hasStaleGuestSelection && hasServerItems) {
        setSelectedItems(cartItems.map((i) => i.id));
      }
    }
  }, [cartItems, isInitialized, user?.id, selectedItems]);

  const subtotal = useMemo(
    () => calculateSubtotal(selectedItems),
    [selectedItems, calculateSubtotal],
  );

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
      return showWarningToast("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
    }

    // Khách vãng lai: lưu chọn lựa vào checkoutSlice (sessionStorage) và điều hướng đăng nhập -> checkout
    if (!user?.id) {
      dispatch(setCartCheckout(itemsToCheckout));
      showInfoToast("Vui lòng đăng nhập để hoàn tất đơn hàng. Giỏ hàng của bạn sẽ được tự động đồng bộ!");
      navigate("/login?redirect=/checkout");
      return;
    }

    setIsValidating(true);
    try {
      const response = await validateCart(itemsToCheckout);
      if (response.errCode === 0) {
        const { items, hasChanged, totalAmount } = response.data;

        if (hasChanged) {
          showInfoToast(
            "Một số thông tin sản phẩm (giá hoặc tồn kho) đã thay đổi. Vui lòng kiểm tra lại!",
          );
          await fetchCart();
          return;
        }

        dispatch(setCartCheckout(items));
        navigate("/checkout", {
          state: {
            selectedItems: items,
            subtotal: totalAmount,
            appliedVoucher: appliedVoucher,
            mode: "cart",
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
    <PageShell
      eyebrow="SHOPPING BAG // CHECKOUT READY"
      title="Giỏ hàng của bạn"
      subtitle={
        <span>
          Bạn đang có{" "}
          <span className="font-semibold text-primary dark:text-blue-400">
            {cartItems.length}
          </span>{" "}
          sản phẩm trong giỏ hàng
        </span>
      }
      backTo="/"
      backLabel="Quay lại trang chủ"
      maxWidthClass="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <ErrorBanner message={cartError} onRetry={loadCart} className="mb-6" />

      {!user?.id && cartItems.length > 0 && (
        <div className="mb-6 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/30 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-200">
          <span>
            Bạn đang xem <strong>Giỏ hàng Khách</strong>. Sản phẩm được lưu an toàn trên trình duyệt và sẽ tự động đồng bộ khi bạn đăng nhập.
          </span>
          <Link
            to="/login?redirect=/cart"
            className="font-black text-primary hover:underline shrink-0"
          >
            Đăng nhập ngay →
          </Link>
        </div>
      )}

      {cartItems.length === 0 ? (
        <EmptyState
          icon={FiShoppingBag}
          title="Giỏ hàng đang trống"
          description="Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá ngay hàng ngàn sản phẩm công nghệ chính hãng tại TienTech!"
          actionLabel="Tiếp tục mua sắm"
          onAction={() => navigate("/products")}
        />
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-8 space-y-5 min-w-0">
              {/* Free Shipping Progress Widget */}
              <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-dark-surface border border-slate-100 dark:border-slate-800 shadow-xs">
                {(() => {
                  const freeShipThreshold = Number(freeshipMinOrder) || 500000;
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
    </PageShell>
  );
};

export default CartPage;
