import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import AccountLockedModal from "../components/UI/AccountLockedModal";
import userReducer from "../redux/userSlice";
import cartReducer from "../redux/cartSlice";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../api/userApi", () => ({
  logoutUserApi: vi.fn().mockResolvedValue({ errCode: 0 }),
}));

vi.mock("../utils/socket", () => ({
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(),
  initUserSocket: vi.fn(),
}));

describe("AccountLockedModal Component Tests", () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        user: userReducer,
        cart: cartReducer,
      },
    });
  });

  it("does not render modal initially", () => {
    render(
      <Provider store={store}>
        <AccountLockedModal />
      </Provider>
    );

    expect(screen.queryByText(/Tài Khoản Đã Bị Khóa/i)).not.toBeInTheDocument();
  });

  it("renders modal with lock reason when account_locked event is dispatched", () => {
    render(
      <Provider store={store}>
        <AccountLockedModal />
      </Provider>
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("tiêntech:account_locked", {
          detail: { reason: "Vi phạm chính sách thanh toán" },
        })
      );
    });

    expect(screen.getByText(/Tài Khoản Đã Bị Khóa/i)).toBeInTheDocument();
    expect(screen.getByText(/Vi phạm chính sách thanh toán/i)).toBeInTheDocument();
  });

  it("handles logout and redirection when clicking logout button", async () => {
    render(
      <Provider store={store}>
        <AccountLockedModal />
      </Provider>
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("tiêntech:account_locked", {
          detail: { reason: "Tài khoản bị tạm khóa" },
        })
      );
    });

    const logoutBtn = screen.getByRole("button", { name: /Đăng xuất ngay/i });
    expect(logoutBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});

