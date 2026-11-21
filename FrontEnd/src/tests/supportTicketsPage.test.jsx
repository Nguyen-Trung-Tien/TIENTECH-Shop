import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import SupportTicketsPage from "../pages/SupportTickets/SupportTicketsPage";
import * as contactApi from "../api/contactApi";

vi.mock("../api/contactApi", () => ({
  getMyContactTicketsApi: vi.fn(),
  submitContactApi: vi.fn(),
  updateMyTicketApi: vi.fn(),
  deleteMyTicketApi: vi.fn(),
}));

vi.mock("../utils/toastHelper", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
  showWarningToast: vi.fn(),
}));

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

const createMockStore = (loggedIn = true) => {
  return configureStore({
    reducer: {
      auth: (state = { user: loggedIn ? { id: 10, username: "testuser", email: "test@example.com" } : null }) => state,
      user: (state = loggedIn ? { id: 10, username: "testuser", email: "test@example.com" } : null) => state,
    },
  });
};

describe("SupportTicketsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state with login button when user is not logged in", () => {
    const store = createMockStore(false);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SupportTicketsPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Vui lòng đăng nhập")).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập ngay")).toBeInTheDocument();
  });

  it("renders ticket list, status badges, and admin response for logged-in user", async () => {
    const store = createMockStore(true);
    contactApi.getMyContactTicketsApi.mockResolvedValue({
      errCode: 0,
      data: [
        {
          id: 101,
          ticketCode: "TK101",
          subject: "Hỏi về bảo hành VGA",
          message: "Card màn hình của tôi bị quạt kêu to khi full load.",
          status: "resolved",
          adminReply: "Bạn vui lòng mang card đến trung tâm bảo hành gần nhất để được kiểm tra miễn phí.",
          createdAt: new Date().toISOString(),
          replier: { username: "Admin TienTech" },
        },
        {
          id: 102,
          ticketCode: "TK102",
          subject: "Tư vấn cấu hình PC đồ họa",
          message: "Tôi cần cấu hình máy trạm tầm 30 triệu.",
          status: "open",
          adminReply: null,
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { totalPages: 1, total: 2 },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SupportTicketsPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("#TK101")).toBeInTheDocument();
      expect(screen.getByText("Hỏi về bảo hành VGA")).toBeInTheDocument();
      expect(screen.getByText(/Bạn vui lòng mang card đến/i)).toBeInTheDocument();
      expect(screen.getByText("#TK102")).toBeInTheDocument();
      expect(screen.getByText("Tư vấn cấu hình PC đồ họa")).toBeInTheDocument();
    });
  });

  it("allows submitting a new support ticket via Create Modal", async () => {
    const store = createMockStore(true);
    contactApi.getMyContactTicketsApi.mockResolvedValue({
      errCode: 0,
      data: [],
      pagination: { totalPages: 1, total: 0 },
    });
    contactApi.submitContactApi.mockResolvedValue({
      errCode: 0,
      errMessage: "Gửi yêu cầu thành công!",
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SupportTicketsPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Gửi yêu cầu mới")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Gửi yêu cầu mới"));

    await waitFor(() => {
      expect(screen.getByText("Gửi Yêu Cầu Hỗ Trợ Mới")).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Mô tả chi tiết vấn đề/i);
    fireEvent.change(textarea, { target: { value: "Tôi cần hỗ trợ xuất hóa đơn VAT cho đơn hàng vừa đặt" } });

    fireEvent.click(screen.getByText("Gửi yêu cầu"));

    await waitFor(() => {
      expect(contactApi.submitContactApi).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 10,
          message: "Tôi cần hỗ trợ xuất hóa đơn VAT cho đơn hàng vừa đặt",
        })
      );
    });
  });

  it("allows editing an open ticket and submitting update", async () => {
    const store = createMockStore(true);
    contactApi.getMyContactTicketsApi.mockResolvedValue({
      errCode: 0,
      data: [
        {
          id: 201,
          ticketCode: "TK201",
          subject: "Tiêu đề cũ",
          message: "Nội dung cũ cần sửa",
          status: "open",
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { totalPages: 1, total: 1 },
    });
    contactApi.updateMyTicketApi.mockResolvedValue({
      errCode: 0,
      errMessage: "Cập nhật thành công!",
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SupportTicketsPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("#TK201")).toBeInTheDocument();
    });

    const editBtn = screen.getByRole("button", { name: /Sửa/i });
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText("Chỉnh Sửa Yêu Cầu #TK201")).toBeInTheDocument();
    });

    const msgInput = screen.getByDisplayValue("Nội dung cũ cần sửa");
    fireEvent.change(msgInput, { target: { value: "Nội dung đã được cập nhật mới hơn" } });

    fireEvent.click(screen.getByText("Lưu thay đổi"));

    await waitFor(() => {
      expect(contactApi.updateMyTicketApi).toHaveBeenCalledWith(
        201,
        expect.objectContaining({
          message: "Nội dung đã được cập nhật mới hơn",
        })
      );
    });
  });

  it("allows deleting an open ticket via ConfirmModal", async () => {
    const store = createMockStore(true);
    contactApi.getMyContactTicketsApi.mockResolvedValue({
      errCode: 0,
      data: [
        {
          id: 301,
          ticketCode: "TK301",
          subject: "Yêu cầu nhầm",
          message: "Tôi tạo nhầm yêu cầu này",
          status: "open",
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { totalPages: 1, total: 1 },
    });
    contactApi.deleteMyTicketApi.mockResolvedValue({
      errCode: 0,
      errMessage: "Đã hủy thành công!",
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SupportTicketsPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("#TK301")).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole("button", { name: /Hủy/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.getByText("Xác nhận hủy yêu cầu hỗ trợ")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Hủy yêu cầu" }));

    await waitFor(() => {
      expect(contactApi.deleteMyTicketApi).toHaveBeenCalledWith(301);
    });
  });

  it("automatically opens detail modal when ticketId searchParam matches", async () => {
    const store = createMockStore(true);
    contactApi.getMyContactTicketsApi.mockResolvedValue({
      errCode: 0,
      data: [
        {
          id: 401,
          ticketCode: "TK401",
          subject: "Hỏi về driver card mạng",
          message: "Lỗi kết nối Wi-Fi trên Windows 11",
          status: "resolved",
          adminReply: "Bạn tải bản driver v22.10 từ trang chủ Intel nhé.",
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { totalPages: 1, total: 1 },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/support-tickets?ticketId=401"]}>
          <SupportTicketsPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Yêu cầu #TK401")).toBeInTheDocument();
      expect(screen.getAllByText("Hỏi về driver card mạng").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Bạn tải bản driver v22.10 từ trang chủ Intel nhé/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("locks edit and delete features when ticket status is in_progress, displays lock badge and notice", async () => {
    const store = createMockStore(true);
    contactApi.getMyContactTicketsApi.mockResolvedValue({
      errCode: 0,
      data: [
        {
          id: 501,
          ticketCode: "TK501",
          subject: "Hỗ trợ lắp đặt máy bộ",
          message: "Tôi cần nhân viên hỗ trợ cài lại Windows",
          status: "in_progress",
          adminReply: null,
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { totalPages: 1, total: 1 },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SupportTicketsPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("#TK501")).toBeInTheDocument();
      expect(screen.getByText("Đang xử lý (Đã khóa)")).toBeInTheDocument();
      expect(screen.getByText(/Kỹ thuật viên đang xử lý • Đã khóa chỉnh sửa & hủy/i)).toBeInTheDocument();
      expect(screen.getByText("Đã khóa sửa/hủy")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Sửa$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Hủy$/i })).not.toBeInTheDocument();
    });

    // Open Detail Modal
    fireEvent.click(screen.getByRole("button", { name: /Chi tiết/i }));

    await waitFor(() => {
      expect(screen.getByText("Yêu cầu đang được kỹ thuật viên xử lý")).toBeInTheDocument();
      expect(screen.getByText(/Đã khóa chỉnh sửa & hủy khi đang xử lý/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Hủy yêu cầu" })).not.toBeInTheDocument();
    });
  });

  it("receives real-time support_ticket_updated socket event and updates ticket state to locked", async () => {
    const store = createMockStore(true);
    contactApi.getMyContactTicketsApi.mockResolvedValue({
      errCode: 0,
      data: [
        {
          id: 601,
          ticketCode: "TK601",
          subject: "Kiểm tra bàn phím cơ",
          message: "Bàn phím bị liệt phím space",
          status: "open",
          adminReply: null,
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { totalPages: 1, total: 1 },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SupportTicketsPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("#TK601")).toBeInTheDocument();
      expect(screen.getAllByText("Chờ xử lý").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole("button", { name: /Sửa/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Hủy/i })).toBeInTheDocument();
    });

    // Simulate Admin changing status to in_progress via socket
    expect(socketHandlers.support_ticket_updated).toBeTypeOf("function");
    act(() => {
      socketHandlers.support_ticket_updated({
        ticketId: 601,
        ticketCode: "TK601",
        status: "in_progress",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Đang xử lý (Đã khóa)")).toBeInTheDocument();
      expect(screen.getByText("Đã khóa sửa/hủy")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Sửa$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Hủy$/i })).not.toBeInTheDocument();
    });
  });
});
