import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React, { useState } from "react";
import Modal, { ConfirmModal, AlertModal } from "../components/UI/Modal";
import Input from "../components/UI/Input";
import Textarea from "../components/UI/Textarea";
import Select from "../components/UI/Select";
import AlertPopup from "../components/UI/AlertPopup";

function AddressModalTestComponent() {
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({ fullName: "", phone: "" });

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="Thêm địa chỉ mới"
    >
      <input
        placeholder="Họ và tên"
        value={formData.fullName}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, fullName: e.target.value }))
        }
      />
      <input
        placeholder="Số điện thoại"
        value={formData.phone}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, phone: e.target.value }))
        }
      />
    </Modal>
  );
}

function CustomInputTestComponent() {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  return (
    <Input
      placeholder="Nhập thông tin..."
      value={val}
      error={err}
      onChange={(e) => {
        setVal(e.target.value);
        if (e.target.value.length < 3) {
          setErr("Quá ngắn");
        } else {
          setErr("");
        }
      }}
    />
  );
}

function TicketReplyModalTestComponent() {
  const [showModal, setShowModal] = useState(true);
  const [replyText, setReplyText] = useState("");

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="Chi tiết yêu cầu hỗ trợ"
    >
      <Textarea
        label="Nội dung phản hồi / Ghi chú nội bộ"
        placeholder="Nhập câu trả lời..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
    </Modal>
  );
}

function CustomTextareaTestComponent() {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  return (
    <Textarea
      placeholder="Nhập ghi chú..."
      value={val}
      error={err}
      onChange={(e) => {
        setVal(e.target.value);
        if (e.target.value.length < 3) {
          setErr("Nội dung quá ngắn");
        } else {
          setErr("");
        }
      }}
    />
  );
}

function CustomSelectTestComponent() {
  const [val, setVal] = useState("a");
  const [err, setErr] = useState("");

  return (
    <Select
      label="Chọn tùy chọn"
      value={val}
      error={err}
      onChange={(e) => {
        setVal(e.target.value);
        if (e.target.value === "invalid") {
          setErr("Lựa chọn không hợp lệ");
        } else {
          setErr("");
        }
      }}
      options={[
        { value: "a", label: "Option A" },
        { value: "invalid", label: "Invalid Option" },
      ]}
    />
  );
}

describe("Modal Focus & Input Retention Fix", () => {
  it("keeps focus on input across multiple keystrokes inside Modal", () => {
    vi.useFakeTimers();
    render(<AddressModalTestComponent />);

    const input = screen.getByPlaceholderText("Họ và tên");
    input.focus();
    expect(document.activeElement).toBe(input);

    // Gõ liên tiếp nhiều ký tự
    const text = "Nguyen Van A";
    for (let i = 0; i < text.length; i++) {
      fireEvent.change(input, { target: { value: text.slice(0, i + 1) } });
      act(() => {
        vi.runAllTimers();
      });
      // Kiểm tra con trỏ chuột không bị văng ra khỏi input
      expect(document.activeElement).toBe(input);
      expect(input.value).toBe(text.slice(0, i + 1));
    }

    vi.useRealTimers();
  });

  it("allows closing Modal via Escape key with latest callback", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        <p>Modal content</p>
      </Modal>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("Input component maintains DOM node stability when error status changes dynamically", () => {
    render(<CustomInputTestComponent />);

    const input = screen.getByPlaceholderText("Nhập thông tin...");
    input.focus();
    expect(document.activeElement).toBe(input);

    // Gõ 1 chữ -> error xuất hiện ("Quá ngắn")
    fireEvent.change(input, { target: { value: "a" } });
    expect(screen.getByText("Quá ngắn")).toBeInTheDocument();
    expect(document.activeElement).toBe(input);

    // Gõ tiếp đến 3 chữ -> error biến mất
    fireEvent.change(input, { target: { value: "abc" } });
    expect(screen.queryByText("Quá ngắn")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(input);
  });

  it("keeps focus on Textarea across multiple keystrokes inside Modal (Contact ticket reply)", () => {
    vi.useFakeTimers();
    render(<TicketReplyModalTestComponent />);

    const textarea = screen.getByPlaceholderText("Nhập câu trả lời...");
    textarea.focus();
    expect(document.activeElement).toBe(textarea);

    const message = "Đã tiếp nhận yêu cầu hỗ trợ.";
    for (let i = 0; i < message.length; i++) {
      fireEvent.change(textarea, { target: { value: message.slice(0, i + 1) } });
      act(() => {
        vi.runAllTimers();
      });
      expect(document.activeElement).toBe(textarea);
      expect(textarea.value).toBe(message.slice(0, i + 1));
    }

    vi.useRealTimers();
  });

  it("Textarea maintains DOM node stability when error status changes dynamically", () => {
    render(<CustomTextareaTestComponent />);

    const textarea = screen.getByPlaceholderText("Nhập ghi chú...");
    textarea.focus();
    expect(document.activeElement).toBe(textarea);

    fireEvent.change(textarea, { target: { value: "a" } });
    expect(screen.getByText("Nội dung quá ngắn")).toBeInTheDocument();
    expect(document.activeElement).toBe(textarea);

    fireEvent.change(textarea, { target: { value: "abc" } });
    expect(screen.queryByText("Nội dung quá ngắn")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(textarea);
  });

  it("Select maintains DOM node stability when error status changes dynamically", () => {
    render(<CustomSelectTestComponent />);

    const select = screen.getByRole("combobox");
    select.focus();
    expect(document.activeElement).toBe(select);

    fireEvent.change(select, { target: { value: "invalid" } });
    expect(screen.getByText("Lựa chọn không hợp lệ")).toBeInTheDocument();
    expect(document.activeElement).toBe(select);

    fireEvent.change(select, { target: { value: "a" } });
    expect(screen.queryByText("Lựa chọn không hợp lệ")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(select);
  });

  it("ConfirmModal does not steal focus from internal Textarea when typing", () => {
    function ConfirmWithTextareaComponent() {
      const [reason, setReason] = useState("");
      return (
        <ConfirmModal
          isOpen={true}
          title="Xác nhận hủy đơn"
          message="Vui lòng nhập lý do bên dưới:"
          variant="danger"
          onConfirm={() => {}}
          onClose={() => {}}
        >
          <Textarea
            placeholder="Nhập lý do chi tiết..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </ConfirmModal>
      );
    }

    render(<ConfirmWithTextareaComponent />);
    const textarea = screen.getByPlaceholderText("Nhập lý do chi tiết...");
    textarea.focus();
    expect(document.activeElement).toBe(textarea);

    const testText = "Toi muon doi mau san pham";
    for (let i = 0; i < testText.length; i++) {
      fireEvent.change(textarea, { target: { value: testText.slice(0, i + 1) } });
      // Đảm bảo không bị cướp focus về nút confirm danger
      expect(document.activeElement).toBe(textarea);
      expect(textarea.value).toBe(testText.slice(0, i + 1));
    }
  });

  it("AlertPopup renders with popup semantics and calls onConfirm on button click", () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <AlertPopup
        isOpen={true}
        type="warning"
        title="Cảnh báo thay đổi"
        message="Hành động này sẽ cập nhật trạng thái."
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    );

    expect(screen.getByText("Cảnh báo thay đổi")).toBeInTheDocument();
    expect(screen.getByText("Hành động này sẽ cập nhật trạng thái.")).toBeInTheDocument();

    const okButton = screen.getByRole("button", { name: "Đã hiểu" });
    fireEvent.click(okButton);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("AlertModal renders standard alert and triggers dismiss callback", () => {
    const handleDismiss = vi.fn();

    render(
      <AlertModal
        isOpen={true}
        title="Thông báo thành công"
        message="Dữ liệu đã được lưu thành công vào hệ thống."
        variant="success"
        confirmText="Xác nhận"
        onConfirm={handleDismiss}
      />
    );

    expect(screen.getByText("Thông báo thành công")).toBeInTheDocument();
    expect(screen.getByText("Dữ liệu đã được lưu thành công vào hệ thống.")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Xác nhận" });
    fireEvent.click(confirmBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
