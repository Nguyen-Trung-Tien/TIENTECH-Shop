import { describe, it, expect, beforeEach } from "vitest";
import cartReducer, {
  hydrateGuestCart,
  addGuestCartItem,
  updateGuestCartQuantity,
  removeGuestCartItem,
  removePurchasedGuestItems,
  clearCart,
} from "../redux/cartSlice";
import checkoutReducer, {
  CHECKOUT_SESSION_KEY,
  loadCheckoutSession,
  setBuyNowCheckout,
  setCartCheckout,
  setCheckoutPointsUsed,
  setFormData,
  clearCheckoutSession,
  resetCheckout,
} from "../redux/checkoutSlice";
import {
  GUEST_CART_STORAGE_KEY,
  loadGuestCart,
  clearGuestCart,
  buildGuestCartItem,
  addOrMergeGuestCartItem,
  runGuestCartSync,
  waitForGuestCartSync,
} from "../utils/guestCart";
import {
  isFlashSaleActive,
  calculateFlashSaleRatio,
  calculateFinalPrice,
  calculateOriginalPrice,
  calculateDiscountPercent,
} from "../utils/priceHelper";
import {
  calculateRankFromPoints,
  calculatePointsEarned,
  calculateMaxUsablePoints,
  getTierProgress,
} from "../utils/loyaltyHelper";

describe("Phase 3: Price, Loyalty, Guest Cart & Checkout Session", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe("Multi-Variant Flash Sale Ratio Calculation (priceHelper)", () => {
    it("applies base product flash sale ratio proportionately to variants", () => {
      const product = {
        id: 1,
        basePrice: 10000000,
        flashSalePrice: 8000000, // 20% off (ratio = 0.8)
        isFlashSale: true,
        flashSaleStart: new Date(Date.now() - 60000).toISOString(),
        flashSaleEnd: new Date(Date.now() + 60000).toISOString(),
      };
      const variant256 = { id: 11, price: 12000000, discount: 0 };
      const variant512 = { id: 12, price: 15000000, discount: 5 };

      expect(isFlashSaleActive(product)).toBe(true);
      expect(calculateFlashSaleRatio(product)).toBeCloseTo(0.8, 5);
      expect(calculateFinalPrice(product)).toBe(8000000);
      expect(calculateFinalPrice(product, variant256)).toBe(9600000);
      expect(calculateFinalPrice(product, variant512)).toBe(12000000);
      expect(calculateOriginalPrice(product, variant512)).toBe(15000000);
      expect(calculateDiscountPercent(product, variant512)).toBe(20);
    });

    it("falls back to normal variant/product discount when flash sale is expired", () => {
      const product = {
        id: 2,
        basePrice: 10000000,
        flashSalePrice: 5000000,
        discount: 10,
        isFlashSale: true,
        flashSaleStart: new Date(Date.now() - 120000).toISOString(),
        flashSaleEnd: new Date(Date.now() - 60000).toISOString(),
      };
      const variant = { id: 21, price: 20000000, discount: 15 };

      expect(isFlashSaleActive(product)).toBe(false);
      expect(calculateFinalPrice(product, variant)).toBe(17000000);
      expect(calculateFinalPrice(product)).toBe(9000000);
    });
  });

  describe("Loyalty Points & Tier Progress (loyaltyHelper)", () => {
    it("computes ranks, earned points, 10% redemption cap, and progress bars accurately", () => {
      expect(calculateRankFromPoints(0)).toBe("Bronze");
      expect(calculateRankFromPoints(1000)).toBe("Silver");
      expect(calculateRankFromPoints(5000)).toBe("Gold");
      expect(calculateRankFromPoints(10000)).toBe("Platinum");

      // 10.000đ = 1 point
      expect(calculatePointsEarned(2599000)).toBe(259);

      // 1 point = 100đ, max 10% of order => 1,000,000đ => max 100,000đ => 1,000 points
      expect(calculateMaxUsablePoints(1000000, 5000)).toBe(1000);
      // Capped by user balance when lower than 10% order cap
      expect(calculateMaxUsablePoints(1000000, 320)).toBe(320);

      const silverProgress = getTierProgress(3000, "Silver");
      expect(silverProgress.currentTier.name).toBe("Silver");
      expect(silverProgress.nextTier.name).toBe("Gold");
      expect(silverProgress.pointsToNext).toBe(2000);
      expect(silverProgress.progressPercent).toBe(50);

      const maxProgress = getTierProgress(12500, "Platinum");
      expect(maxProgress.nextTier).toBeNull();
      expect(maxProgress.progressPercent).toBe(100);
    });
  });

  describe("Guest Cart Persistence & Redux Reducers (localStorage + cartSlice)", () => {
    it("adds, merges, updates, hydrates, and removes guest cart items", () => {
      const product = {
        id: 101,
        name: "Bàn phím cơ Keychron",
        basePrice: 2000000,
        flashSalePrice: 1600000,
        isFlashSale: true,
        stock: 10,
      };
      const variant = { id: 501, price: 2500000, stock: 5 };

      let state = cartReducer(undefined, { type: "@@INIT" });
      state = cartReducer(state, addGuestCartItem({ product, variant, quantity: 2 }));
      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0].id).toBe("guest_101_501");
      expect(state.cartItems[0].quantity).toBe(2);

      // Adding same product+variant merges quantity capped at variant stock (5)
      state = cartReducer(state, addGuestCartItem({ product, variant, quantity: 4 }));
      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0].quantity).toBe(5);

      // Persisted in localStorage
      const stored = loadGuestCart();
      expect(stored).toHaveLength(1);
      expect(stored[0].quantity).toBe(5);

      // Hydrate into a fresh store slice
      let freshState = cartReducer(undefined, clearCart());
      expect(freshState.cartItems).toHaveLength(0);
      freshState = cartReducer(freshState, hydrateGuestCart());
      expect(freshState.cartItems).toHaveLength(1);

      // Update & remove
      freshState = cartReducer(
        freshState,
        updateGuestCartQuantity({ id: "guest_101_501", quantity: 3 }),
      );
      expect(freshState.cartItems[0].quantity).toBe(3);

      freshState = cartReducer(
        freshState,
        removePurchasedGuestItems(["guest_101_501"]),
      );
      expect(freshState.cartItems).toHaveLength(0);
      expect(window.localStorage.getItem(GUEST_CART_STORAGE_KEY)).toBe("[]");

      clearGuestCart();
      expect(loadGuestCart()).toEqual([]);

      const emptyItem = buildGuestCartItem({ product: null });
      expect(emptyItem).toBeNull();
      expect(
        cartReducer(freshState, removeGuestCartItem("non_existent")).cartItems,
      ).toEqual([]);
    });
  });

  describe("Buy Now & Checkout Session Persistence (sessionStorage + checkoutSlice)", () => {
    it("persists Buy Now items and points across session reload without touching Cart", () => {
      const buyNowItem = {
        id: "buynow_55_88",
        productId: 55,
        variantId: 88,
        quantity: 1,
        finalPrice: 4500000,
      };

      let state = checkoutReducer(undefined, setBuyNowCheckout([buyNowItem]));
      state = checkoutReducer(state, setCheckoutPointsUsed(200));
      state = checkoutReducer(
        state,
        setFormData({ fullName: "Nguyen Van A", paymentMethod: "VNPAY" }),
      );

      expect(state.mode).toBe("buy_now");
      expect(state.items).toHaveLength(1);
      expect(state.pointsUsed).toBe(200);

      // Simulate page refresh (F5) reading sessionStorage directly
      const reloaded = loadCheckoutSession();
      expect(reloaded.mode).toBe("buy_now");
      expect(reloaded.items[0].id).toBe("buynow_55_88");
      expect(reloaded.pointsUsed).toBe(200);
      expect(reloaded.formData.fullName).toBe("Nguyen Van A");

      // Cart mode checkout
      state = checkoutReducer(state, setCartCheckout([{ id: 77, productId: 9 }]));
      expect(state.mode).toBe("cart");
      expect(state.selectedIds).toEqual([77]);

      state = checkoutReducer(state, clearCheckoutSession());
      expect(state.items).toEqual([]);
      expect(state.pointsUsed).toBe(0);

      state = checkoutReducer(state, resetCheckout());
      expect(window.sessionStorage.getItem(CHECKOUT_SESSION_KEY)).toBeNull();
    });

    it("caps guest cart quantity using product.totalStock and serializes guest cart sync", async () => {
      const items = addOrMergeGuestCartItem({
        product: { id: 202, name: "Monitor 27", basePrice: 5000000, totalStock: 2 },
        quantity: 5,
      });
      expect(items[0].quantity).toBe(2);
      expect(items[0].product.totalStock).toBe(2);

      const events = [];
      let resolveSync;
      const syncPromise = new Promise((r) => {
        resolveSync = r;
      });
      const p1 = runGuestCartSync(9, () => syncPromise);
      const waiter = waitForGuestCartSync().then(() => events.push("waiter_done"));
      events.push("before_resolve");
      resolveSync("ok");
      await Promise.all([p1, waiter]);
      expect(events).toEqual(["before_resolve", "waiter_done"]);
    });
  });
});
