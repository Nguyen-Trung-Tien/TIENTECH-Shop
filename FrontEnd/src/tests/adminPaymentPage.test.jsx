import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PaymentPage from "../Admin/pages/Payment/PaymentPage";
import * as paymentApi from "../api/paymentApi";

vi.mock("../api/paymentApi", () => ({
  getAllPayments: vi.fn(),
  getPaymentSummary: vi.fn(),
  deletePayment: vi.fn(),
  completePayment: vi.fn(),
  refundPayment: vi.fn(),
}));

vi.mock("../utils/toastHelper", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
  showInfoToast: vi.fn(),
}));

const mockSummary = {
  totalRevenue: 5000000,
  pendingAmount: 1200000,
  refundedAmount: 350000,
  onlineCount: 15,
  codCount: 5,
};

const mockPayments = [
  {
    id: 1,
    orderId: 101,
    userId: 2,
    amount: "350000",
    method: "vnpay",
    status: "refunded",
    transactionId: "VNP123456",
    note: "Khách hàng đổi ý trước khi giao",
    refundNote: "Khách hàng đổi ý trước khi giao",
    createdAt: "2026-11-20T10:00:00.000Z",
    order: {
      id: 101,
      orderCode: "ORD-101",
      status: "refunded",
      totalPrice: 350000,
    },
    user: {
      id: 2,
      username: "alex_user",
      email: "alex@example.com",
    },
  },
  {
    id: 2,
    orderId: 102,
    userId: 3,
    amount: "750000",
    method: "cod",
    status: "completed",
    transactionId: "TXN789",
    note: "",
    refundNote: "",
    createdAt: "2026-11-21T08:00:00.000Z",
    order: {
      id: 102,
      orderCode: "ORD-102",
      status: "completed",
      totalPrice: 750000,
    },
    user: {
      id: 3,
      username: "buyer_jane",
      email: "jane@example.com",
    },
  },
];

describe("Admin PaymentPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paymentApi.getPaymentSummary.mockResolvedValue({
      errCode: 0,
      data: mockSummary,
    });
    paymentApi.getAllPayments.mockResolvedValue({
      errCode: 0,
      data: mockPayments,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        limit: 10,
      },
    });
  });

  it("renders summary StatCards, search bar, and payment list correctly", async () => {
    render(<PaymentPage />);

    // Check header
    expect(screen.getByText("Quản lý thanh toán")).toBeInTheDocument();

    // Check StatCards loaded
    await waitFor(() => {
      expect(screen.getByText("5.000.000 ₫")).toBeInTheDocument();
      expect(screen.getByText("1.200.000 ₫")).toBeInTheDocument();
      expect(screen.getByText("350.000 ₫")).toBeInTheDocument();
      expect(screen.getByText("15 / 5")).toBeInTheDocument();
    });

    // Check payments in table after debounce
    await waitFor(
      () => {
        expect(screen.getByText("#ORD-101")).toBeInTheDocument();
        expect(screen.getByText("#ORD-102")).toBeInTheDocument();
        expect(screen.getByText("alex_user")).toBeInTheDocument();
        expect(screen.getByText("buyer_jane")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Check refund note snippet displayed in table for refunded payment
    expect(screen.getByText(/Khách hàng đổi ý trước khi giao/)).toBeInTheDocument();
  });

  it("opens Receipt Modal and correctly shows refundNote when refunded", async () => {
    render(<PaymentPage />);

    await waitFor(
      () => {
        expect(screen.getByText("#ORD-101")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const infoButtons = screen.getAllByRole("button", { name: "Xem biên lai giao dịch" });
    fireEvent.click(infoButtons[0]);

    // Modal title & content
    await waitFor(() => {
      expect(screen.getByText(/Biên Lai Giao Dịch #ORD-101/)).toBeInTheDocument();
    });

    // Verify refund note section in modal (and table preview)
    expect(screen.getByText("Ghi chú hoàn tiền")).toBeInTheDocument();
    expect(screen.getAllByText(/Khách hàng đổi ý trước khi giao/).length).toBeGreaterThanOrEqual(2);
  });

  it("opens ConfirmModal for refunding, requires note, and calls refundPayment with note", async () => {
    paymentApi.refundPayment.mockResolvedValue({
      errCode: 0,
      errMessage: "Refund successful",
    });

    render(<PaymentPage />);

    await waitFor(
      () => {
        expect(screen.getByText("#ORD-102")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click refund button on completed payment (#ORD-102, id: 2)
    const refundBtn = screen.getByRole("button", { name: "Hoàn tiền giao dịch" });
    fireEvent.click(refundBtn);

    // ConfirmModal should appear with title
    await waitFor(() => {
      expect(screen.getByText(/Xác nhận hoàn tiền/i)).toBeInTheDocument();
    });

    // Note input exists
    const noteTextarea = screen.getByPlaceholderText(/Nhập lý do hoàn tiền/);
    expect(noteTextarea).toBeInTheDocument();

    // Button should initially be disabled when note is empty
    const confirmBtn = screen.getByRole("button", { name: "Hoàn tiền" });
    expect(confirmBtn).toBeDisabled();

    // Type refund reason
    fireEvent.change(noteTextarea, {
      target: { value: "Khách hủy đơn do sản phẩm không vừa size" },
    });
    expect(confirmBtn).not.toBeDisabled();

    // Submit refund
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(paymentApi.refundPayment).toHaveBeenCalledWith(
        2,
        "Khách hủy đơn do sản phẩm không vừa size"
      );
    });
  });
});
