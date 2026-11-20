import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import ContactManage from "../Admin/pages/ContactManage/ContactManage";
import { ProfileTicketsTab } from "../pages/Profile/components/ProfileTicketsTab";
import * as contactApi from "../api/contactApi";

vi.mock("../api/contactApi", () => ({
  getContactTicketsApi: vi.fn(),
  updateContactTicketApi: vi.fn(),
  deleteContactTicketApi: vi.fn(),
  bulkDeleteContactTicketsApi: vi.fn(),
  getMyContactTicketsApi: vi.fn(),
}));

vi.mock("../utils/toastHelper", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

const mockTickets = [
  {
    id: 101,
    ticketCode: "TK101",
    name: "Customer One",
    email: "customer1@example.com",
    phone: "0911111111",
    subject: "Hỗ trợ đơn hàng",
    message: "Tôi cần kiểm tra đơn hàng",
    status: "open",
    createdAt: new Date().toISOString(),
  },
  {
    id: 102,
    ticketCode: "TK102",
    name: "Customer Two",
    email: "customer2@example.com",
    phone: "0922222222",
    subject: "Bảo hành sản phẩm",
    message: "Sản phẩm bị lỗi nguồn",
    status: "in_progress",
    createdAt: new Date().toISOString(),
  },
];

describe("ContactManage Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contactApi.getContactTicketsApi.mockResolvedValue({
      errCode: 0,
      data: mockTickets,
      counts: { all: 2, open: 1, in_progress: 1, resolved: 0, closed: 0 },
      pagination: { totalPages: 1, totalItems: 2, currentPage: 1, limit: 12 },
    });
  });

  it("renders ticket list and pagination summary correctly", async () => {
    render(<ContactManage />);

    await waitFor(() => {
      expect(screen.getByText("#TK101")).toBeInTheDocument();
      expect(screen.getByText("#TK102")).toBeInTheDocument();
    });

    expect(
      screen.getAllByText(/Hiển thị/i).length
    ).toBeGreaterThan(0);
  });

  it("defaults 'Gửi email phản hồi đến khách hàng' to UNCHECKED when opening detail modal", async () => {
    render(<ContactManage />);

    await waitFor(() => {
      expect(screen.getByText("#TK101")).toBeInTheDocument();
    });

    const replyButtons = screen.getAllByRole("button", { name: /Xử lý & Phản hồi/i });
    fireEvent.click(replyButtons[0]);

    // Tìm checkbox gửi email phản hồi
    const emailCheckbox = await screen.findByRole("checkbox", {
      name: /Gửi email phản hồi đến khách hàng/i,
    });
    // Yêu cầu: Bỏ mặc định tick vào gửi mail cho khách hàng
    expect(emailCheckbox.checked).toBe(false);
  });

  it("allows selecting individual tickets and bulk select all on page", async () => {
    render(<ContactManage />);

    await waitFor(() => {
      expect(screen.getByText("#TK101")).toBeInTheDocument();
    });

    // Checkbox "Chọn tất cả trên trang này"
    const selectAllCheckbox = screen.getByRole("checkbox", {
      name: /Chọn tất cả trên trang này/i,
    });
    expect(selectAllCheckbox.checked).toBe(false);

    // Click select all
    fireEvent.click(selectAllCheckbox);

    // Bulk toolbar xuất hiện
    await waitFor(() => {
      expect(screen.getByText(/yêu cầu liên hệ đã được chọn/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Xóa đã chọn \(2\)/i })).toBeInTheDocument();
    });

    // Click Bỏ chọn
    const deselectBtn = screen.getByRole("button", { name: "Bỏ chọn" });
    fireEvent.click(deselectBtn);

    await waitFor(() => {
      expect(screen.queryByText(/yêu cầu liên hệ đã được chọn/i)).not.toBeInTheDocument();
    });
  });

  it("opens ConfirmModal on single ticket delete and executes deleteContactTicketApi", async () => {
    contactApi.deleteContactTicketApi.mockResolvedValue({
      errCode: 0,
      errMessage: "Đã xóa yêu cầu liên hệ thành công!",
    });

    render(<ContactManage />);

    await waitFor(() => {
      expect(screen.getByText("#TK101")).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByRole("button", { name: "Xóa" });
    fireEvent.click(deleteBtns[0]);

    // Modal xác nhận xuất hiện
    await waitFor(() => {
      expect(screen.getByText(/Xóa yêu cầu #TK101\?/i)).toBeInTheDocument();
    });

    // Bấm nút "Xóa vĩnh viễn"
    const confirmDeleteBtn = screen.getByRole("button", { name: "Xóa vĩnh viễn" });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(contactApi.deleteContactTicketApi).toHaveBeenCalledWith(101);
    });
  });

  it("ProfileTicketsTab automatically opens detail modal when ticketId searchParam is present", async () => {
    contactApi.getMyContactTicketsApi.mockResolvedValue({
      errCode: 0,
      data: [
        {
          id: 555,
          ticketCode: "TK555",
          subject: "Hỗ trợ kỹ thuật màn hình",
          message: "Màn hình bị nháy sọc khi kết nối qua DisplayPort",
          adminReply: "Bạn hãy cập nhật lại firmware mới nhất theo link này.",
          replier: { username: "Admin TienTech" },
          status: "resolved",
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { totalPages: 1, total: 1 },
    });

    render(
      <MemoryRouter initialEntries={["/profile?tab=tickets&ticketId=555"]}>
        <ProfileTicketsTab />
      </MemoryRouter>
    );

    // Modal chi tiết phản hồi tự động mở
    await waitFor(() => {
      expect(screen.getByText("Yêu cầu #TK555")).toBeInTheDocument();
      expect(screen.getByText("Phản hồi từ Ban Quản Trị TienTech:")).toBeInTheDocument();
      expect(
        screen.getByText(/Bạn hãy cập nhật lại firmware mới nhất/i)
      ).toBeInTheDocument();
    });
  });
});
