import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/HeaderComponent/Header";
import HeaderAdmin from "../Admin/components/HeaderAdminComponent/HeaderAdmin";

vi.mock("../hooks/useUser", () => ({
  useCurrentUser: vi.fn(() => ({ data: null })),
}));

vi.mock("../context/useTheme", () => ({
  useTheme: vi.fn(() => ({
    theme: "light",
    toggleTheme: vi.fn(),
  })),
}));

vi.mock("../components/HeaderComponent/NotificationBell", () => ({
  default: () => <div data-testid="notification-bell-mock" />,
}));

vi.mock("../components/HeaderComponent/OmniSearchModal", () => ({
  default: () => null,
}));

vi.mock("../components/HeaderComponent/VisualSearchModal", () => ({
  default: () => null,
}));

vi.mock("../Admin/components/HeaderAdminComponent/CommandPaletteModal", () => ({
  default: () => null,
}));

const createMockStore = (user = null) => {
  return configureStore({
    reducer: {
      user: (state = { user }) => state,
      cart: (state = { cartItems: [] }) => state,
    },
  });
};

describe("Header Dropdowns (Click Outside & Escape Key)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Client Header User Profile Menu", () => {
    const testUser = {
      id: 1,
      username: "tiennguyen",
      email: "tien@example.com",
      role: "customer",
    };

    it("opens user menu on click, closes when clicking outside", () => {
      const store = createMockStore(testUser);
      render(
        <Provider store={store}>
          <MemoryRouter>
            <div data-testid="outside-area">Outside Content</div>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      const avatarBtn = screen.getByLabelText("Menu tài khoản cá nhân");
      expect(screen.queryByText("Thông tin cá nhân")).not.toBeInTheDocument();

      // Click avatar to open dropdown
      fireEvent.click(avatarBtn);
      expect(screen.getByText("Thông tin cá nhân")).toBeInTheDocument();
      expect(screen.getByText("Đơn mua của tôi")).toBeInTheDocument();

      // Click outside area
      fireEvent.mouseDown(screen.getByTestId("outside-area"));
      expect(screen.queryByText("Thông tin cá nhân")).not.toBeInTheDocument();
    });

    it("closes user menu on pressing Escape key", () => {
      const store = createMockStore(testUser);
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      const avatarBtn = screen.getByLabelText("Menu tài khoản cá nhân");
      fireEvent.click(avatarBtn);
      expect(screen.getByText("Thông tin cá nhân")).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Thông tin cá nhân")).not.toBeInTheDocument();
    });

    it("closes user menu when clicking an item link inside", () => {
      const store = createMockStore(testUser);
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      const avatarBtn = screen.getByLabelText("Menu tài khoản cá nhân");
      fireEvent.click(avatarBtn);
      expect(screen.getByText("Thông tin cá nhân")).toBeInTheDocument();

      // Click profile link
      fireEvent.click(screen.getByText("Thông tin cá nhân"));
      expect(screen.queryByText("Thông tin cá nhân")).not.toBeInTheDocument();
    });
  });

  describe("Admin Header Profile Menu", () => {
    const adminUser = {
      id: 99,
      username: "admin_boss",
      email: "admin@tientech.vn",
      role: "admin",
    };

    it("opens admin profile menu on click, closes on click outside", () => {
      const store = createMockStore(adminUser);
      render(
        <Provider store={store}>
          <MemoryRouter>
            <div data-testid="admin-outside">Admin Outside</div>
            <HeaderAdmin
              toggleSidebar={vi.fn()}
              isCollapsed={false}
              theme="light"
              toggleTheme={vi.fn()}
            />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.queryByText("Hồ sơ cá nhân")).not.toBeInTheDocument();

      // Click admin avatar
      const adminAvatarBtn = screen.getByText("admin_boss").closest("button");
      fireEvent.click(adminAvatarBtn);
      expect(screen.getByText("Hồ sơ cá nhân")).toBeInTheDocument();
      expect(screen.getByText("Đăng xuất")).toBeInTheDocument();

      // Click outside area
      fireEvent.mouseDown(screen.getByTestId("admin-outside"));
      expect(screen.queryByText("Hồ sơ cá nhân")).not.toBeInTheDocument();
    });

    it("closes admin profile menu on pressing Escape key", () => {
      const store = createMockStore(adminUser);
      render(
        <Provider store={store}>
          <MemoryRouter>
            <HeaderAdmin
              toggleSidebar={vi.fn()}
              isCollapsed={false}
              theme="light"
              toggleTheme={vi.fn()}
            />
          </MemoryRouter>
        </Provider>
      );

      const adminAvatarBtn = screen.getByText("admin_boss").closest("button");
      fireEvent.click(adminAvatarBtn);
      expect(screen.getByText("Hồ sơ cá nhân")).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Hồ sơ cá nhân")).not.toBeInTheDocument();
    });
  });
});
