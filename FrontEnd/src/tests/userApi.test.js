import { describe, it, expect, vi } from "vitest";
import axiosClient from "../utils/axiosClient";
import {
  getAllUsersApi,
  updateUserStatusApi,
  bulkUpdateUserStatusApi,
  getUserMetricsApi,
  getUserAuditLogsApi,
  userApi,
} from "../api/userApi";

vi.mock("../utils/axiosClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("userApi Admin Account Activation & Management Tests", () => {
  it("getAllUsersApi passes search, page, limit, and status/role filter params", async () => {
    axiosClient.get.mockResolvedValueOnce({ errCode: 0, data: [] });

    await getAllUsersApi(1, 10, "test", { status: "active", role: "customer" });

    expect(axiosClient.get).toHaveBeenCalledWith("/user/get-all", {
      params: {
        page: 1,
        limit: 10,
        query: "test",
        status: "active",
        role: "customer",
      },
    });
  });

  it("updateUserStatusApi sends PUT request with userId, status, and reason", async () => {
    axiosClient.put.mockResolvedValueOnce({ errCode: 0, errMessage: "Success" });

    await updateUserStatusApi(42, "active", "Kích hoạt kiểm thử");

    expect(axiosClient.put).toHaveBeenCalledWith("/user/admin/status", {
      userId: 42,
      status: "active",
      reason: "Kích hoạt kiểm thử",
    });
  });

  it("bulkUpdateUserStatusApi sends POST request with userIds array, status, and reason", async () => {
    axiosClient.post.mockResolvedValueOnce({ errCode: 0, data: { successCount: 2 } });

    await bulkUpdateUserStatusApi([1, 2, 3], "suspended", "Khóa hàng loạt");

    expect(axiosClient.post).toHaveBeenCalledWith("/user/admin/bulk-status", {
      userIds: [1, 2, 3],
      status: "suspended",
      reason: "Khóa hàng loạt",
    });
  });

  it("getUserMetricsApi calls /user/admin/metrics", async () => {
    axiosClient.get.mockResolvedValueOnce({ errCode: 0, data: { totalUsers: 10 } });

    await getUserMetricsApi();

    expect(axiosClient.get).toHaveBeenCalledWith("/user/admin/metrics");
  });

  it("getUserAuditLogsApi passes targetUserId and page/limit params", async () => {
    axiosClient.get.mockResolvedValueOnce({ errCode: 0, data: [] });

    await getUserAuditLogsApi({ targetUserId: 42, page: 1, limit: 10 });

    expect(axiosClient.get).toHaveBeenCalledWith("/user/admin/audit-logs", {
      params: {
        targetUserId: 42,
        page: 1,
        limit: 10,
      },
    });
  });

  it("userApi object contains all status, bulk, metrics, and audit log methods", () => {
    expect(typeof userApi.updateStatus).toBe("function");
    expect(typeof userApi.bulkUpdateStatus).toBe("function");
    expect(typeof userApi.getMetrics).toBe("function");
    expect(typeof userApi.getAuditLogs).toBe("function");
  });
});
