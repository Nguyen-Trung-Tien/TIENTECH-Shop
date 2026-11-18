import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import UserManage from "../Admin/pages/UserManage/UserManage";

vi.mock("../api/userApi", () => ({
  userApi: {
    getAll: vi.fn().mockResolvedValue({
      errCode: 0,
      data: [
        {
          id: 1,
          username: "admin_root",
          email: "root@tientech.vn",
          role: "root",
          status: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          username: "customer_01",
          email: "cust01@tientech.vn",
          role: "customer",
          status: "active",
          createdAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      totalPages: 1,
      totalItems: 2,
    }),
    updateStatus: vi.fn().mockResolvedValue({ errCode: 0 }),
    getMetrics: vi.fn().mockResolvedValue({
      errCode: 0,
      data: { total: 2, active: 2, pending: 0, locked: 0 },
    }),
    getAuditLogs: vi.fn().mockResolvedValue({
      errCode: 0,
      data: [],
      totalPages: 1,
      totalItems: 0,
    }),
  },
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      user: (state = { user: { id: 1, username: "admin_root", role: "root" } }) =>
        state,
    },
  });

describe("UserManage Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders UserManage without ReferenceError and displays users", async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserManage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("admin_root")).toBeInTheDocument();
      expect(screen.getByText("customer_01")).toBeInTheDocument();
    });
  });
});
