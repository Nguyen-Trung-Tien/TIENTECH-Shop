const NotificationService = require("../../src/services/notification/NotificationService");
const db = require("../../src/models");

describe("NotificationService Unit Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createNotification", () => {
    test("chuẩn hóa type và tự động map content sang message", async () => {
      const mockCreated = {
        id: 1,
        userId: 10,
        title: "Test Alert",
        message: "Fallback content",
        type: "system",
        isRead: false,
        createdAt: new Date(),
      };

      jest.spyOn(db.Notification, "create").mockResolvedValue(mockCreated);

      const res = await NotificationService.createNotification({
        userId: 10,
        title: "Test Alert",
        content: "Fallback content",
        type: "invalid_type_xyz",
      });

      expect(res.errCode).toBe(0);
      expect(db.Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 10,
          title: "Test Alert",
          message: "Fallback content",
          type: "system",
        }),
        expect.anything()
      );
    });

    test("phát socket tới user_X khi có userId và tới admin_room khi userId là null", async () => {
      const mockCreatedUser = {
        id: 2,
        userId: 5,
        title: "User Alert",
        message: "Order placed",
        type: "order",
        isRead: false,
        createdAt: new Date(),
      };
      const mockCreatedAdmin = {
        id: 3,
        userId: null,
        title: "Admin Alert",
        message: "New Order",
        type: "order",
        isRead: false,
        createdAt: new Date(),
      };

      const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };

      jest.spyOn(db.Notification, "create")
        .mockResolvedValueOnce(mockCreatedUser)
        .mockResolvedValueOnce(mockCreatedAdmin);

      // 1. User notification
      await NotificationService.createNotification(
        { userId: 5, title: "User Alert", message: "Order placed", type: "order" },
        null,
        mockIo
      );
      expect(mockIo.to).toHaveBeenCalledWith("user_5");
      expect(mockIo.emit).toHaveBeenCalledWith("notification", expect.objectContaining({
        id: 2,
        userId: 5,
        title: "User Alert",
      }));

      // 2. Admin notification
      await NotificationService.createNotification(
        { userId: null, title: "Admin Alert", message: "New Order", type: "order" },
        null,
        mockIo
      );
      expect(mockIo.to).toHaveBeenCalledWith("admin_room");
      expect(mockIo.emit).toHaveBeenCalledWith("notification", expect.objectContaining({
        id: 3,
        userId: null,
        title: "Admin Alert",
      }));
    });
  });

  describe("getNotifications", () => {
    test("chỉ lấy thông báo của chính user nếu vai trò là customer", async () => {
      const mockFindAndCount = {
        count: 1,
        rows: [{ id: 1, userId: 10, title: "Hello", message: "Msg", type: "system", isRead: false }],
      };
      jest.spyOn(db.Notification, "findAndCountAll").mockResolvedValue(mockFindAndCount);
      jest.spyOn(db.Notification, "count").mockResolvedValue(1);

      const res = await NotificationService.getNotifications(10, "customer", 1, 10);

      expect(res.errCode).toBe(0);
      expect(db.Notification.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 10 },
          attributes: expect.arrayContaining(["id", "userId", "title", "message", "type", "isRead"]),
        })
      );
    });

    test("lấy cả thông báo cá nhân và thông báo hệ thống/admin nếu vai trò là admin", async () => {
      const mockFindAndCount = {
        count: 2,
        rows: [],
      };
      jest.spyOn(db.Notification, "findAndCountAll").mockResolvedValue(mockFindAndCount);
      jest.spyOn(db.Notification, "count").mockResolvedValue(0);

      const res = await NotificationService.getNotifications(1, "admin", 1, 10);

      expect(res.errCode).toBe(0);
      expect(db.Notification.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: expect.any(Object),
          }),
        })
      );
    });
  });

  describe("markAsRead và deleteNotification Authorization", () => {
    test("chặn người dùng thường đánh dấu đọc thông báo của người khác hoặc thông báo admin", async () => {
      const mockNotifAdmin = {
        id: 99,
        userId: null, // Admin notif
        update: jest.fn(),
      };
      jest.spyOn(db.Notification, "findByPk").mockResolvedValue(mockNotifAdmin);

      const res = await NotificationService.markAsRead(99, 10, "customer");
      expect(res.errCode).toBe(403);
      expect(mockNotifAdmin.update).not.toHaveBeenCalled();
    });

    test("chặn người dùng thường xóa thông báo của người khác hoặc thông báo admin", async () => {
      const mockNotifOther = {
        id: 101,
        userId: 20, // Belongs to user 20
        destroy: jest.fn(),
      };
      jest.spyOn(db.Notification, "findByPk").mockResolvedValue(mockNotifOther);

      const res = await NotificationService.deleteNotification(101, 10, "customer");
      expect(res.errCode).toBe(403);
      expect(mockNotifOther.destroy).not.toHaveBeenCalled();
    });
  });
});

