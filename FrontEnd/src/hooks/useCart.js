import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showErrorToast, showSuccessToast } from "../utils/toastHelper";
import {
  setCartItems,
  appendCartItems,
  updateCartItemQuantity,
  removeCartItem as removeCartItemAction,
  hydrateGuestCart,
  updateGuestCartQuantity,
  removeGuestCartItem,
} from "../redux/cartSlice";
import {
  getAllCartItems,
  removeCartItem as removeCartItemApi,
  updateCartItem as updateCartItemApi,
} from "../api/cartApi";
import { loadGuestCart } from "../utils/guestCart";
import { calculateFinalPrice } from "../utils/priceHelper";

export const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const userId = useSelector((state) => state.user.user?.id);

  const fetchCart = useCallback(
    async (page = 1, limit = 100) => {
      if (!userId) {
        dispatch(hydrateGuestCart());
        return loadGuestCart();
      }
      try {
        const res = await getAllCartItems(page, limit);
        const items = Array.isArray(res?.data) ? res.data : [];

        if (page === 1) {
          dispatch(setCartItems(items));
        } else if (items.length > 0) {
          dispatch(appendCartItems(items));
        }
        return items;
      } catch (err) {
        console.error("Fetch cart error:", err);
        throw err;
      }
    },
    [dispatch, userId],
  );

  const handleUpdateQty = useCallback(
    async (id, quantity) => {
      if (quantity < 1) return;
      if (!userId || String(id).startsWith("guest_")) {
        dispatch(updateGuestCartQuantity({ id, quantity }));
        return;
      }
      try {
        const res = await updateCartItemApi(id, quantity);
        if (res && res.errCode !== undefined && res.errCode !== 0) {
          showErrorToast(res.errMessage, "Cập nhật số lượng thất bại!");
          return;
        }
        dispatch(updateCartItemQuantity({ id, quantity }));
      } catch (err) {
        showErrorToast(err, "Cập nhật số lượng thất bại!");
        throw err;
      }
    },
    [dispatch, userId],
  );

  const handleRemoveItem = useCallback(
    async (id) => {
      if (!userId || String(id).startsWith("guest_")) {
        dispatch(removeGuestCartItem(id));
        showSuccessToast("Đã xóa sản phẩm khỏi giỏ hàng!");
        return;
      }
      try {
        const res = await removeCartItemApi(id);
        if (res && res.errCode !== undefined && res.errCode !== 0) {
          showErrorToast(res.errMessage, "Xóa sản phẩm thất bại!");
          return;
        }
        dispatch(removeCartItemAction(id));
        showSuccessToast("Đã xóa sản phẩm khỏi giỏ hàng!");
      } catch (err) {
        showErrorToast(err, "Xóa sản phẩm thất bại!");
        throw err;
      }
    },
    [dispatch, userId],
  );

  const calculateSubtotal = useCallback(
    (selectedIds) => {
      return cartItems
        .filter((item) => selectedIds.includes(item.id))
        .reduce((acc, item) => {
          if (item.finalPrice !== undefined && item.finalPrice !== null) {
            return acc + Number(item.finalPrice) * (item.quantity || 0);
          }

          const price = calculateFinalPrice(item.product, item.variant);
          return acc + price * (item.quantity || 0);
        }, 0);
    },
    [cartItems],
  );

  return {
    cartItems,
    fetchCart,
    handleUpdateQty,
    handleRemoveItem,
    calculateSubtotal,
  };
};
