const ContactService = require("../../src/services/common/ContactService");
const SystemSettingService = require("../../src/services/system/SystemSettingService");
const EmailService = require("../../src/services/common/EmailService");
const NotificationService = require("../../src/services/notification/NotificationService");
const db = require("../../src/models");

describe("ContactService Deletion & Member Tickets Unit Tests", () => {
  let mockTx;

  beforeEach(() => {
    mockTx = {
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true),
      LOCK: { UPDATE: "UPDATE" },
    };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
    jest.spyOn(SystemSettingService, "getSetting").mockResolvedValue("");
    jest.spyOn(EmailService, "sendEmail").mockResolvedValue(true);
  });

  afterEach(async () => {
    await new Promise((resolve) => setImmediate(resolve));
    jest.restoreAllMocks();
  });

  it("creates a ticket with userId for registered member", async () => {
    const createSpy = jest.spyOn(db.ContactTicket, "create").mockResolvedValue({
      id: 99,
      ticketCode: "TK123456",
      subject: "Yêu cầu Hỗ trợ Kỹ thuật",
      status: "open",
      userId: 5,
    });

    const res = await ContactService.createTicket({
      name: "Member User",
      email: "member@example.com",
      phone: "0987654321",
      subject: "support",
      message: "Yêu cầu hỗ trợ từ thành viên",
      userId: 5,
    });

    expect(res.errCode).toBe(0);
    expect(res.data.id).toBe(99);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        email: "member@example.com",
      }),
      expect.anything()
    );
    expect(mockTx.commit).toHaveBeenCalled();
  });

  it("retrieves member tickets via getUserTickets with pagination", async () => {
    jest.spyOn(db.ContactTicket, "findAndCountAll").mockResolvedValue({
      count: 2,
      rows: [
        {
          id: 1,
          ticketCode: "TK001",
          subject: "Hỗ trợ Đơn hàng / Giao hàng",
          status: "open",
          toJSON: () => ({ id: 1, ticketCode: "TK001" }),
        },
        {
          id: 2,
          ticketCode: "TK002",
          subject: "Hỗ trợ Bảo hành",
          status: "resolved",
          toJSON: () => ({ id: 2, ticketCode: "TK002" }),
        },
      ],
    });

    const res = await ContactService.getUserTickets(5, { page: 1, limit: 10 });
    expect(res.errCode).toBe(0);
    expect(res.data).toHaveLength(2);
    expect(res.pagination.totalItems).toBe(2);
  });

  it("deletes a single ticket via deleteTicket with transaction rollback on error", async () => {
    const mockTicket = {
      id: 88,
      ticketCode: "TK8888",
      destroy: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(db.ContactTicket, "findByPk").mockResolvedValue(mockTicket);

    const deleteRes = await ContactService.deleteTicket(88);
    expect(deleteRes.errCode).toBe(0);
    expect(mockTicket.destroy).toHaveBeenCalledWith({ transaction: mockTx });
    expect(mockTx.commit).toHaveBeenCalled();

    // 404 case
    jest.spyOn(db.ContactTicket, "findByPk").mockResolvedValue(null);
    const notFoundRes = await ContactService.deleteTicket(999);
    expect(notFoundRes.errCode).toBe(404);
    expect(mockTx.rollback).toHaveBeenCalled();
  });

  it("deletes multiple tickets via bulkDeleteTickets", async () => {
    const destroySpy = jest.spyOn(db.ContactTicket, "destroy").mockResolvedValue(3);

    const bulkRes = await ContactService.bulkDeleteTickets([10, 11, 12]);
    expect(bulkRes.errCode).toBe(0);
    expect(bulkRes.deletedCount).toBe(3);
    expect(destroySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        transaction: mockTx,
      })
    );
    expect(mockTx.commit).toHaveBeenCalled();
  });

  it("returns error 400 on invalid or empty bulk deletion array", async () => {
    const emptyRes = await ContactService.bulkDeleteTickets([]);
    expect(emptyRes.errCode).toBe(400);

    const nonArrayRes = await ContactService.bulkDeleteTickets(null);
    expect(nonArrayRes.errCode).toBe(400);
  });

  it("updateTicket automatically creates notification for member when admin replies", async () => {
    const mockTicket = {
      id: 77,
      ticketCode: "TK7777",
      subject: "Bảo hành linh kiện",
      userId: 12,
      email: "member77@example.com",
      status: "open",
      update: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(db.ContactTicket, "findByPk").mockResolvedValue(mockTicket);
    const notifSpy = jest.spyOn(NotificationService, "createNotification").mockResolvedValue({
      errCode: 0,
      data: { id: 101 },
    });

    const ioMock = { to: jest.fn(() => ({ emit: jest.fn() })) };

    const updateRes = await ContactService.updateTicket(
      77,
      { adminReply: "Chúng tôi đã nhận được linh kiện và đang xử lý." },
      { id: 1, username: "admin" },
      ioMock
    );

    expect(updateRes.errCode).toBe(0);
    expect(mockTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        adminReply: "Chúng tôi đã nhận được linh kiện và đang xử lý.",
        status: "resolved",
      }),
      expect.anything()
    );
    expect(notifSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 12,
        title: expect.stringContaining("TK7777"),
        link: "/support-tickets?ticketId=77",
      }),
      null,
      ioMock
    );
  });

  describe("updateUserTicket & deleteUserTicket by Customer", () => {
    it("allows updating ticket subject/message when status is 'open'", async () => {
      const mockTicket = {
        id: 50,
        userId: 5,
        status: "open",
        subject: "Old subject",
        message: "Old message",
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(db.ContactTicket, "findOne").mockResolvedValue(mockTicket);

      const res = await ContactService.updateUserTicket(5, 50, {
        subject: "New subject",
        message: "New message updated by user",
      });

      expect(res.errCode).toBe(0);
      expect(mockTicket.subject).toBe("New subject");
      expect(mockTicket.message).toBe("New message updated by user");
      expect(mockTicket.save).toHaveBeenCalled();
    });

    it("rejects updating ticket when status is resolved or in_progress (400)", async () => {
      const mockTicket = {
        id: 51,
        userId: 5,
        status: "resolved",
      };
      jest.spyOn(db.ContactTicket, "findOne").mockResolvedValue(mockTicket);

      const res = await ContactService.updateUserTicket(5, 51, {
        subject: "Trying to modify resolved ticket",
      });

      expect(res.errCode).toBe(400);
      expect(res.errMessage).toContain("không thể chỉnh sửa");
    });

    it("allows user to delete/cancel their own ticket when status is 'open'", async () => {
      const mockTicket = {
        id: 52,
        userId: 5,
        status: "open",
        destroy: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(db.ContactTicket, "findOne").mockResolvedValue(mockTicket);

      const res = await ContactService.deleteUserTicket(5, 52);

      expect(res.errCode).toBe(0);
      expect(mockTicket.destroy).toHaveBeenCalledWith({ transaction: mockTx });
      expect(mockTx.commit).toHaveBeenCalled();
    });

    it("rejects deleting ticket when status is not open (400)", async () => {
      const mockTicket = {
        id: 53,
        userId: 5,
        status: "in_progress",
        destroy: jest.fn(),
      };
      jest.spyOn(db.ContactTicket, "findOne").mockResolvedValue(mockTicket);

      const res = await ContactService.deleteUserTicket(5, 53);

      expect(res.errCode).toBe(400);
      expect(res.errMessage).toContain("Chỉ có thể hủy hoặc xóa yêu cầu đang ở trạng thái Chờ xử lý");
      expect(mockTx.rollback).toHaveBeenCalled();
    });
  });
});
