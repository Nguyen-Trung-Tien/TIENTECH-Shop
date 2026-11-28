import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import NotificationBell from "../components/HeaderComponent/NotificationBell";
import userReducer from "../redux/userSlice";

const socketHandlers = {};
const mockSocket = {
  on: vi.fn((event, cb) => {
    socketHandlers[event] = cb;
  }),
  off: vi.fn((event) => {
    delete socketHandlers[event];
  }),
};

vi.mock("../utils/socket", () => ({
  initUserSocket: vi.fn(() => mockSocket),
  getSocket: vi.fn(() => mockSocket),
  disconnectSocket: vi.fn(),
}));

vi.mock("../api/notificationApi", () => ({
  getNotificationsApi: vi.fn().mockResolvedValue({
    errCode: 0,
    data: [],
    unreadCount: 0,
  }),
  markAsReadApi: vi.fn().mockResolvedValue({ errCode: 0 }),
  markAllReadApi: vi.fn().mockResolvedValue({ errCode: 0 }),
  deleteNotificationApi: vi.fn().mockResolvedValue({ errCode: 0 }),
  sendBroadcastNotificationApi: vi.fn().mockResolvedValue({ errCode: 0 }),
}));

vi.mock("../utils/notificationSound", () => ({
  playNotificationChime: vi.fn(),
  isNotificationSoundEnabled: vi.fn(() => true),
  toggleNotificationSound: vi.fn(() => false),
}));

const mockShowInfoToast = vi.fn();
vi.mock("../utils/toastHelper", () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
  showWarningToast: vi.fn(),
  showInfoToast: (...args) => mockShowInfoToast(...args),
}));

vi.mock("react-toastify", () => ({
  toast: {
    info: vi.fn(),
    isActive: vi.fn(() => false),
    update: vi.fn(),
  },
}));

describe("NotificationBell Component Tests", () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(socketHandlers).forEach((k) => delete socketHandlers[k]);
    store = configureStore({
      reducer: {
        user: userReducer,
      },
      preloadedState: {
        user: {
          user: { id: 1, role: "admin", username: "admin" },
          isInitializing: false,
        },
      },
    });
  });

  it("updates unread badge and dropdown immediately when a new notification arrives via socket", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <NotificationBell />
          </MemoryRouter>
        </Provider>
      );
    });

    expect(socketHandlers.notification).toBeTypeOf("function");

    act(() => {
      socketHandlers.notification({
        id: 101,
        title: "Cập nhật đơn hàng #ORD101",
        message: "Đơn hàng #ORD101 của bạn đã được xác nhận.",
        type: "order",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(mockShowInfoToast).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle("Thông báo"));
    expect(screen.getByText("Cập nhật đơn hàng #ORD101")).toBeInTheDocument();
  });

  it("suppresses duplicate toast when order_status_updated follows notification with the same message", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <NotificationBell />
          </MemoryRouter>
        </Provider>
      );
    });

    const msg = "Đơn hàng #ORD202 của bạn đã chuyển sang trạng thái: \"Đang giao\".";

    act(() => {
      socketHandlers.notification({
        id: 202,
        title: "Cập nhật đơn hàng #ORD202",
        message: msg,
        type: "order",
      });
      socketHandlers.order_status_updated({
        orderId: 202,
        orderCode: "ORD202",
        status: "shipping",
        message: msg,
      });
    });

    expect(mockShowInfoToast).toHaveBeenCalledTimes(1);
  });

  it("opens broadcast modal with user preselected on tientech:open_send_notification event", async () => {
    const notificationApi = await import("../api/notificationApi");
    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <NotificationBell />
          </MemoryRouter>
        </Provider>
      );
    });

    const targetUser = { id: 88, username: "Khách VIP", email: "vip@example.com" };
    act(() => {
      window.dispatchEvent(
        new CustomEvent("tientech:open_send_notification", {
          detail: { targetUser },
        })
      );
    });

    // Modal xuất hiện với tiêu đề Gửi thông báo cá nhân
    expect(screen.getByText("Gửi thông báo cá nhân")).toBeInTheDocument();
    expect(screen.getByText("Khách VIP")).toBeInTheDocument();
    expect(screen.getByText("vip@example.com")).toBeInTheDocument();

    // Điền tiêu đề và nội dung
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Phản hồi yêu cầu/i), {
      target: { value: "Ưu đãi riêng dành cho bạn" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Nhập thông điệp gửi tới khách hàng/i), {
      target: { value: "Cảm ơn bạn đã luôn ủng hộ TIENTECH!" },
    });

    // Nút submit có chữ Gửi Riêng Cho Khách VIP
    const submitBtn = screen.getByRole("button", { name: /Gửi Riêng Cho Khách VIP/i });
    expect(submitBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(notificationApi.sendBroadcastNotificationApi).toHaveBeenCalledWith(
      expect.objectContaining({
        target: "user",
        targetUserId: 88,
        title: "Ưu đãi riêng dành cho bạn",
        message: "Cảm ơn bạn đã luôn ủng hộ TIENTECH!",
      })
    );
  });
});
