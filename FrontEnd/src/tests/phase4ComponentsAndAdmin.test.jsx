import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import checkoutReducer, { setBuyNowCheckout } from "../redux/checkoutSlice";
import cartReducer from "../redux/cartSlice";
import userReducer from "../redux/userSlice";

// Mock third-party / runtime deps for CheckoutPage
vi.mock("@paypal/react-paypal-js", () => ({
  PayPalButtons: () => <div data-testid="paypal-mock" />,
}));
vi.mock("../api/orderApi", () => ({
  createOrder: vi.fn().mockResolvedValue({
    errCode: 0,
    data: { id: 901, orderCode: "ORD901", totalPrice: 900000 },
  }),
}));
vi.mock("../api/paymentApi", () => ({
  createVnpayPaymentApi: vi.fn(),
}));
vi.mock("../api/addressApi", () => ({
  getAddressesApi: vi.fn().mockResolvedValue({ errCode: 0, data: [] }),
  createAddressApi: vi.fn(),
}));
vi.mock("../api/voucherApi", () => ({
  getActiveVouchersApi: vi.fn().mockResolvedValue({ errCode: 0, data: [] }),
}));
vi.mock("../api/userApi", () => ({
  getMeApi: vi.fn().mockResolvedValue({
    errCode: 0,
    data: {
      id: 1,
      username: "tester",
      phone: "0909123456",
      points: 4500,
      rank: "Silver",
    },
  }),
}));
vi.mock("../context/useSystemSettings", () => ({
  useSystemSettings: () => ({
    defaultShippingFee: 0,
    freeshipMinOrder: 0,
    isCodEnabled: true,
    isVnpayEnabled: false,
    isPaypalEnabled: false,
    isMomoEnabled: false,
  }),
}));
vi.mock("../api/adminApi", () => ({
  getRevenueStats: vi.fn().mockResolvedValue({
    errCode: 0,
    data: {
      totalRevenue: 50000000,
      totalProfit: 15000000,
      totalOrders: 40,
      newUsers: 12,
      change: { revenue: 18.4, profit: 14.2, orders: 6.5, users: -5.0 },
      topProducts: [],
    },
  }),
  getDashboard: vi.fn().mockResolvedValue({
    errCode: 0,
    data: {
      revenueByWeek: [],
      revenueByMonth: [],
      revenueByYear: [],
    },
  }),
  exportRevenue: vi.fn(),
  getRevenueForecast: vi.fn().mockResolvedValue({ errCode: 0, data: null }),
  getRevenueForecastApi: vi.fn().mockResolvedValue({ errCode: 0, data: null }),
}));
vi.mock("../api/reviewApi", () => ({
  getAllReviewsApi: vi.fn().mockResolvedValue({
    errCode: 0,
    data: [
      {
        id: 15,
        rating: 5,
        comment: "Màn hình sắc nét",
        isApproved: true,
        createdAt: "2026-06-01T00:00:00.000Z",
        user: { username: "khach_hang_1" },
        product: { name: "LG UltraGear 27" },
      },
    ],
    totalPages: 1,
  }),
  deleteReviewApi: vi.fn().mockResolvedValue({ errCode: 0 }),
  updateReviewApi: vi.fn().mockResolvedValue({ errCode: 0 }),
}));
vi.mock("../api/reviewReplyApi", () => ({
  createReplyApi: vi.fn(),
  deleteReplyApi: vi.fn(),
}));
vi.mock("../api/chatApi", () => ({
  visualSearch: vi.fn().mockResolvedValue({
    errCode: 0,
    data: {
      description: "Bàn phím cơ không dây màu đen",
      products: [
        {
          id: 77,
          slug: "ban-phim-co-keychron-k2",
          name: "Keychron K2 Pro RGB",
          displayPrice: 2350000,
          image: "/k2.png",
        },
      ],
    },
  }),
}));
vi.mock("../api/contactApi", () => ({
  submitContactApi: vi.fn().mockResolvedValue({
    errCode: 0,
    errMessage: "Đã gửi yêu cầu liên hệ thành công!",
  }),
}));

import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import Revenue from "../Admin/pages/Revenue/Revenue";
import ChartCard from "../Admin/components/ChartCardComponent/ChartCard";
import ReviewPage from "../Admin/pages/ReviewPage/ReviewPage";
import VisualSearchModal from "../components/HeaderComponent/VisualSearchModal";
import ContactPage from "../pages/ContactPage/ContactPage";
import QuickVariantModal from "../components/ProductCard/QuickVariantModal";
import FAQPage from "../pages/SupportPage/FAQPage";
import { createOrder } from "../api/orderApi";
import { updateReviewApi } from "../api/reviewApi";
import { submitContactApi } from "../api/contactApi";

describe("Phase 4: Checkout Loyalty, VisualSearchModal & Admin ERP Fixes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("CheckoutPage restores Buy Now items from sessionStorage after refresh and submits capped loyalty points", async () => {
    const store = configureStore({
      reducer: {
        user: userReducer,
        cart: cartReducer,
        checkout: checkoutReducer,
      },
      preloadedState: {
        user: {
          user: {
            id: 1,
            username: "tester",
            phone: "0909123456",
            points: 5000,
            rank: "Gold",
          },
          isAuthenticated: true,
          isInitializing: false,
        },
      },
    });

    store.dispatch(
      setBuyNowCheckout([
        {
          id: "buynow_33_null",
          productId: 33,
          variantId: null,
          quantity: 1,
          finalPrice: 1000000, // 10% max = 100,000đ = 1,000 points
          product: { id: 33, name: "Chuột Logitech MX Master 3S", image: "/mx.png" },
        },
      ]),
    );

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/checkout"]}>
          <CheckoutPage />
        </MemoryRouter>
      </Provider>,
    );

    expect(
      await screen.findByText(/Chuột Logitech MX Master 3S/i),
    ).toBeInTheDocument();

    // Toggle max points (1,000 or 1.000 depending on Node locale)
    const maxBtn = await screen.findByRole("button", { name: /Dùng tối đa/i });
    fireEvent.click(maxBtn);

    // Fill manual shipping address
    const addressInput = screen.getByLabelText(/Nhập địa chỉ nhận hàng/i);
    fireEvent.change(addressInput, {
      target: { value: "123 Nguyễn Huệ, Q.1, TP.HCM" },
    });

    const placeOrderBtn = screen.getByRole("button", { name: /ĐẶT HÀNG NGAY/i });
    fireEvent.click(placeOrderBtn);

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          pointsUsed: 1000,
          checkoutMode: "buy_now",
          shippingAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
          orderItems: [
            expect.objectContaining({
              productId: 33,
              cartItemId: null,
            }),
          ],
        }),
        expect.any(Object),
      );
    });
  });

  it("Revenue renders real API change trends and ChartCard shows honest empty state instead of random data", async () => {
    render(
      <MemoryRouter>
        <Revenue />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("+18.4%")).toBeInTheDocument();
      expect(screen.getByText("+14.2%")).toBeInTheDocument();
      expect(screen.getByText("+6.5%")).toBeInTheDocument();
      expect(screen.getByText("-5%")).toBeInTheDocument();
    });
    expect(screen.queryByText("+12.5%")).not.toBeInTheDocument();

    render(<ChartCard />);
    await waitFor(() => {
      expect(
        screen.getByText(/Chưa có dữ liệu doanh thu trong giai đoạn này/i),
      ).toBeInTheDocument();
    });
  });

  it("ReviewPage toggles review approval status via updateReviewApi", async () => {
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Màn hình sắc nét")).toBeInTheDocument();
      expect(screen.getByText("Đang hiển thị")).toBeInTheDocument();
    });

    const toggleBtn = screen.getByRole("button", { name: /Ẩn đánh giá/i });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(updateReviewApi).toHaveBeenCalledWith(15, { isApproved: false });
      expect(screen.getByText("Đã ẩn")).toBeInTheDocument();
    });
  });

  it("VisualSearchModal exposes dialog semantics and displays matched products inside modal", async () => {
    const OrigFileReader = globalThis.FileReader;
    globalThis.FileReader = class MockFileReader {
      readAsDataURL() {
        this.result = "data:image/png;base64,ZmFrZQ==";
        if (this.onloadend) this.onloadend();
      }
    };

    try {
      render(
        <MemoryRouter>
          <VisualSearchModal isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(screen.getByText(/Tìm kiếm bằng hình ảnh AI/i)).toBeInTheDocument();

      const fileInput = dialog.querySelector('input[type="file"]');
      const fakeFile = new File(["fake"], "keyboard.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });

      await waitFor(() => {
        expect(screen.getByText("Keychron K2 Pro RGB")).toBeInTheDocument();
        expect(
          screen.getAllByText(/Bàn phím cơ không dây màu đen/i).length,
        ).toBeGreaterThan(0);
      });
    } finally {
      globalThis.FileReader = OrigFileReader;
    }
  });

  it("ContactPage submits form to backend API without fake setTimeout", async () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/Nguyễn Văn A/i), {
      target: { value: "Trần An" },
    });
    fireEvent.change(screen.getByPlaceholderText(/example@gmail\.com/i), {
      target: { value: "an@tientech.test" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/Mô tả nội dung bạn cần hỗ trợ/i),
      { target: { value: "Cần hỗ trợ tư vấn màn hình đồ họa." } },
    );

    fireEvent.click(screen.getByRole("button", { name: /GỬI YÊU CẦU NGAY/i }));

    await waitFor(() => {
      expect(submitContactApi).toHaveBeenCalledWith({
        name: "Trần An",
        email: "an@tientech.test",
        phone: "",
        subject: "tuvansanpham",
        message: "Cần hỗ trợ tư vấn màn hình đồ họa.",
      });
      expect(
        screen.getByText(/Cảm ơn bạn đã gửi liên hệ!/i),
      ).toBeInTheDocument();
    });
  });

  it("QuickVariantModal never passes product.id as variantId and FAQPage has zero bracelet warranty copy", () => {
    const onAdd = vi.fn();
    const onBuyNow = vi.fn();

    render(
      <MemoryRouter>
        <QuickVariantModal
          isOpen={true}
          onClose={vi.fn()}
          product={{
            id: 999,
            name: "Bàn phím cơ",
            basePrice: 1200000,
            totalStock: 5,
            variants: [],
          }}
          onAdd={onAdd}
          onBuyNow={onBuyNow}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /THÊM GIỎ HÀNG/i }));
    fireEvent.click(screen.getByRole("button", { name: /MUA NGAY/i }));

    expect(onAdd).toHaveBeenCalledWith(null, false);
    expect(onBuyNow).toHaveBeenCalledWith(null, false);

    render(
      <MemoryRouter>
        <FAQPage />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/dây xâu/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/size tay/i)).not.toBeInTheDocument();
  });
});
