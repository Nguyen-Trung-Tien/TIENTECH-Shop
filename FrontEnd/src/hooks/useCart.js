import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  setCartItems,
  appendCartItems,
  updateCartItemQuantity,
  removeCartItem as removeCartItemAction,
} from "../redux/cartSlice";
import {
  getAllCartItems,
  removeCartItem as removeCartItemApi,
  updateCartItem as updateCartItemApi,
} from "../api/cartApi";

export const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);

  const fetchCart = useCallback(
    async (page = 1, limit = 10) => {
      try {
        const res = await getAllCartItems(page, limit);
        const items = Array.isArray(res?.data) ? res.data : [];

        if (items.length > 0) {
          if (page === 1) dispatch(setCartItems(items));
          else dispatch(appendCartItems(items));
        }
        return items;
      } catch (err) {
        console.error("Fetch cart error:", err);
        throw err;
      }
    },
    [dispatch],
  );

  const handleUpdateQty = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItemApi(id, quantity);
      dispatch(updateCartItemQuantity({ id, quantity }));
    } catch (err) {
      toast.error("Cập nhật số lượng thất bại!");
      throw err;
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await removeCartItemApi(id);
      dispatch(removeCartItemAction(id));
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (err) {
      toast.error("Xóa thất bại!");
      throw err;
    }
  };

  const calculateSubtotal = (selectedIds) => {
    return cartItems
      .filter((item) => selectedIds.includes(item.id))
      .reduce((acc, item) => {
        // Use finalPrice from backend if available, otherwise fallback to old logic
        if (item.finalPrice !== undefined) {
          return acc + Number(item.finalPrice) * (item.quantity || 0);
        }

        const basePrice = item.variant?.price != null 
          ? Number(item.variant.price) 
          : Number(item.product?.basePrice || item.product?.price || 0);
        
        const discount = Number(item.product?.discount || 0);
        const price = Math.round(discount > 0 ? basePrice * (1 - discount / 100) : basePrice);
        
        return acc + price * (item.quantity || 0);
      }, 0);
  };

  return {
    cartItems,
    fetchCart,
    handleUpdateQty,
    handleRemoveItem,
    calculateSubtotal,
  };
};
