const crypto = require("crypto");
const { Op } = require("sequelize");
const db = require("../../models");
const NotificationService = require("../notification/NotificationService");
const EmailService = require("./EmailService");
const SystemSettingService = require("../system/SystemSettingService");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");

const SUBJECT_LABELS = {
  tuvansanpham: "Tư vấn sản phẩm & Góc setup",
  baohanh: "Hỗ trợ Bảo hành / Sửa chữa",
  donhang: "Kiểm tra đơn hàng",
  hoptac: "Hợp tác kinh doanh / Doanh nghiệp",
  gopy: "Góp ý dịch vụ",
};

const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const createTicket = async (payload, io = null) => {
  const {
    userId = null,
    name,
    email,
    phone = "",
    subject = "tuvansanpham",
    message,
  } = payload || {};
  const subjectLabel = SUBJECT_LABELS[subject] || subject;
  const ticketCode = `TK${Date.now()}${crypto.randomInt(100, 999)}`;

  let ticket;
  const t = await db.sequelize.transaction();
  try {
    ticket = await db.ContactTicket.create(
      {
        userId: userId || null,
        ticketCode,
        name,
        email,
        phone: phone || null,
        subject: subjectLabel,
        message,
        status: "open",
      },
      { transaction: t },
    );
    await t.commit();
  } catch (err) {
    await t.rollback();
    console.error("[ContactService.createTicket] Transaction error:", err);
    return {
      errCode: -1,
      errMessage: "Không thể ghi nhận yêu cầu liên hệ lúc này.",
    };
  }

  try {
    await NotificationService.createNotification(
      {
        userId: null,
        title: `Liên hệ mới [${ticket.ticketCode}]: ${subjectLabel}`,
        message: `${name} (${email}${phone ? ` - ${phone}` : ""}): ${message}`,
        type: "system",
        link: "/admin/contacts",
        metadata: {
          source: "contact_form",
          ticketId: ticket.id,
          ticketCode: ticket.ticketCode,
          name,
          email,
          phone,
          subject: subjectLabel,
        },
      },
      null,
      io,
    );
  } catch (notifErr) {
    console.warn(
      "[ContactService.createTicket] Notification warning:",
      notifErr?.message,
    );
  }

  setImmediate(async () => {
    try {
      const adminEmail =
        (await SystemSettingService.getSetting("ADMIN_NOTIFICATION_EMAIL", "")) ||
        (await SystemSettingService.getSetting("STORE_EMAIL", "")) ||
        process.env.EMAIL_USER ||
        "";
      if (adminEmail) {
        const safeCode = escapeHtml(ticket.ticketCode);
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safePhone = escapeHtml(phone || "Không cung cấp");
        const safeSubject = escapeHtml(subjectLabel);
        const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
        await EmailService.sendEmail(
          adminEmail,
          `[TIENTECH CONTACT #${ticket.ticketCode}] ${subjectLabel} từ ${name}`,
          `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                <h2 style="margin-top: 0; color: #0f172a;">Yêu cầu liên hệ khách hàng mới (${safeCode})</h2>
                <p><strong>Mã ticket:</strong> ${safeCode}</p>
                <p><strong>Chủ đề:</strong> ${safeSubject}</p>
                <p><strong>Khách hàng:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Số điện thoại:</strong> ${safePhone}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                <p><strong>Nội dung:</strong></p>
                <p style="color: #334155; line-height: 1.6;">${safeMessage}</p>
              </div>
            </div>
          `,
        );
      }
    } catch (emailErr) {
      if (!String(emailErr?.message || "").includes("connection manager was closed")) {
        console.warn("[ContactService] Admin email error:", emailErr?.message);
      }
    }
  });

  return {
    errCode: 0,
    errMessage: "Đã gửi yêu cầu liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.",
    data: {
      id: ticket.id,
      ticketCode: ticket.ticketCode,
      subject: subjectLabel,
      status: ticket.status,
    },
  };
};

const getAllTickets = async ({ page = 1, limit = 15, status, search } = {}) => {
  try {
    const where = {};
    if (status && VALID_STATUSES.includes(status)) {
      where.status = status;
    }

    const trimmedSearch = typeof search === "string" ? search.trim() : "";
    if (trimmedSearch) {
      where[Op.or] = [
        { ticketCode: { [Op.like]: `%${trimmedSearch}%` } },
        { name: { [Op.like]: `%${trimmedSearch}%` } },
        { email: { [Op.like]: `%${trimmedSearch}%` } },
        { phone: { [Op.like]: `%${trimmedSearch}%` } },
        { subject: { [Op.like]: `%${trimmedSearch}%` } },
        { message: { [Op.like]: `%${trimmedSearch}%` } },
      ];
    }

    const { offset, limit: parsedLimit } = getPagination(page, limit);
    const { count, rows } = await db.ContactTicket.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          as: "replier",
          attributes: ["id", "username", "email"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit: parsedLimit,
      distinct: true,
    });

    const countRows = await db.ContactTicket.findAll({
      attributes: [
        "status",
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    const counts = {
      all: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };
    for (const row of countRows || []) {
      const c = Number(row.count || 0);
      if (row.status && Object.prototype.hasOwnProperty.call(counts, row.status)) {
        counts[row.status] = c;
      }
      counts.all += c;
    }

    const pagingData = getPagingData({ count, rows }, page, parsedLimit);
    const { items, rows: _ignoredRows, ...paginationMetadata } = pagingData;

    return {
      errCode: 0,
      errMessage: "OK",
      data: items,
      counts,
      pagination: {
        ...paginationMetadata,
        limit: parsedLimit,
      },
    };
  } catch (error) {
    console.error("[ContactService.getAllTickets] Error:", error);
    return {
      errCode: -1,
      errMessage: "Lỗi hệ thống khi lấy danh sách yêu cầu liên hệ.",
    };
  }
};

const updateTicket = async (id, payload = {}, adminUser = null, io = null) => {
  const t = await db.sequelize.transaction();
  let ticket;
  const updates = {};
  let targetUserId = null;

  try {
    ticket = await db.ContactTicket.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!ticket) {
      await t.rollback();
      return {
        errCode: 404,
        errMessage: "Không tìm thấy yêu cầu liên hệ.",
      };
    }

    if (payload.status) {
      updates.status = payload.status;
    }

    if (typeof payload.adminReply === "string") {
      const trimmedReply = payload.adminReply.trim();
      updates.adminReply = trimmedReply;
      if (trimmedReply) {
        updates.repliedBy = adminUser?.id || null;
        updates.repliedAt = new Date();
        if (!payload.status && ticket.status === "open") {
          updates.status = "resolved";
        }
      }
    }

    // Auto-link registered user by email if ticket was submitted anonymously
    targetUserId = ticket.userId;
    if (!targetUserId && ticket.email) {
      try {
        const matchedUser = await db.User.findOne({
          where: { email: ticket.email },
          attributes: ["id"],
          transaction: t,
        });
        if (matchedUser) {
          targetUserId = matchedUser.id;
          updates.userId = matchedUser.id;
        }
      } catch (_userMatchErr) {
        // Safe fallback
      }
    }

    await ticket.update(updates, { transaction: t });
    await t.commit();
  } catch (err) {
    await t.rollback();
    console.error("[ContactService.updateTicket] Transaction error:", err);
    return {
      errCode: -1,
      errMessage: "Không thể cập nhật yêu cầu liên hệ.",
    };
  }

  // Dispatch real-time in-app notification to the member if admin answered
  if (updates.adminReply && targetUserId) {
    try {
      const replySnippet =
        updates.adminReply.length > 120
          ? `${updates.adminReply.slice(0, 120)}...`
          : updates.adminReply;
      await NotificationService.createNotification(
        {
          userId: targetUserId,
          title: `Phản hồi yêu cầu hỗ trợ #${ticket.ticketCode}`,
          message: `Quản trị viên đã phản hồi yêu cầu "${ticket.subject}": ${replySnippet}`,
          type: "system",
          link: `/support-tickets?ticketId=${ticket.id}`,
          metadata: {
            source: "contact_ticket_reply",
            ticketId: ticket.id,
            ticketCode: ticket.ticketCode,
          },
        },
        null,
        io,
      );
    } catch (notifErr) {
      console.warn(
        "[ContactService.updateTicket] Member notification warning:",
        notifErr?.message,
      );
    }
  }

  let emailSent = false;
  if (payload.sendEmailReply === true && updates.adminReply && ticket.email) {
    try {
      const safeName = escapeHtml(ticket.name);
      const safeCode = escapeHtml(ticket.ticketCode);
      const safeSubject = escapeHtml(ticket.subject);
      const safeOriginalMessage = escapeHtml(ticket.message).replace(/\n/g, "<br/>");
      const safeReply = escapeHtml(updates.adminReply).replace(/\n/g, "<br/>");
      const sent = await EmailService.sendEmail(
        ticket.email,
        `[TIENTECH SUPPORT #${ticket.ticketCode}] Phản hồi: ${ticket.subject}`,
        `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
              <h2 style="margin-top: 0; color: #0f172a;">Phản hồi yêu cầu hỗ trợ #${safeCode}</h2>
              <p>Xin chào <strong>${safeName}</strong>,</p>
              <p>Đội ngũ hỗ trợ TIENTECH xin phản hồi yêu cầu của bạn về chủ đề <strong>${safeSubject}</strong>:</p>
              <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 8px; color: #1e293b; line-height: 1.6; margin: 16px 0;">
                ${safeReply}
              </div>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
              <p style="font-size: 12px; color: #64748b; margin-bottom: 6px;"><strong>Nội dung bạn đã gửi:</strong></p>
              <p style="font-size: 13px; color: #475569; line-height: 1.5;">${safeOriginalMessage}</p>
            </div>
          </div>
        `,
      );
      emailSent = Boolean(sent !== false);
    } catch (emailErr) {
      console.warn(
        "[ContactService.updateTicket] Reply email warning:",
        emailErr?.message,
      );
      emailSent = false;
    }
  }

  return {
    errCode: 0,
    errMessage: "Cập nhật yêu cầu liên hệ thành công!",
    data: ticket,
    emailSent,
  };
};

const getUserTickets = async (userId, { page = 1, limit = 10, status, search } = {}) => {
  try {
    if (!userId) {
      return {
        errCode: 400,
        errMessage: "Thiếu thông tin người dùng.",
      };
    }

    const { offset, limit: parsedLimit } = getPagination(page, limit);
    const whereClause = { userId };
    if (status && status !== "all") {
      whereClause.status = status;
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { ticketCode: { [Op.like]: q } },
        { subject: { [Op.like]: q } },
        { message: { [Op.like]: q } },
      ];
    }

    const { count, rows } = await db.ContactTicket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: "replier",
          attributes: ["id", "username", "email"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit: parsedLimit,
      distinct: true,
    });

    const pagingData = getPagingData({ count, rows }, page, parsedLimit);
    const { items, rows: _ignoredRows, ...paginationMetadata } = pagingData;

    return {
      errCode: 0,
      errMessage: "OK",
      data: items,
      pagination: {
        ...paginationMetadata,
        limit: parsedLimit,
      },
    };
  } catch (error) {
    console.error("[ContactService.getUserTickets] Error:", error);
    return {
      errCode: -1,
      errMessage: "Lỗi hệ thống khi tải danh sách yêu cầu của bạn.",
    };
  }
};

const deleteTicket = async (id) => {
  const t = await db.sequelize.transaction();
  try {
    const ticket = await db.ContactTicket.findByPk(id, { transaction: t });
    if (!ticket) {
      await t.rollback();
      return {
        errCode: 404,
        errMessage: "Không tìm thấy yêu cầu liên hệ cần xóa.",
      };
    }

    await ticket.destroy({ transaction: t });
    await t.commit();

    return {
      errCode: 0,
      errMessage: "Đã xóa yêu cầu liên hệ thành công!",
    };
  } catch (err) {
    await t.rollback();
    console.error("[ContactService.deleteTicket] Transaction error:", err);
    return {
      errCode: -1,
      errMessage: "Không thể xóa yêu cầu liên hệ lúc này.",
    };
  }
};

const bulkDeleteTickets = async (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return {
      errCode: 400,
      errMessage: "Vui lòng chọn ít nhất một yêu cầu để xóa.",
    };
  }

  const t = await db.sequelize.transaction();
  try {
    const deletedCount = await db.ContactTicket.destroy({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction: t,
    });
    await t.commit();

    return {
      errCode: 0,
      errMessage: `Đã xóa thành công ${deletedCount} yêu cầu liên hệ!`,
      deletedCount,
      data: { deletedCount },
    };
  } catch (err) {
    await t.rollback();
    console.error("[ContactService.bulkDeleteTickets] Transaction error:", err);
    return {
      errCode: -1,
      errMessage: "Không thể xóa các yêu cầu liên hệ lúc này.",
    };
  }
};

const updateUserTicket = async (userId, id, { subject, message, phone }) => {
  try {
    const ticket = await db.ContactTicket.findOne({
      where: { id, userId },
    });

    if (!ticket) {
      return {
        errCode: 404,
        errMessage: "Không tìm thấy yêu cầu hỗ trợ hoặc bạn không có quyền chỉnh sửa.",
      };
    }

    if (ticket.status !== "open") {
      return {
        errCode: 400,
        errMessage: "Yêu cầu đã được tiếp nhận hoặc phản hồi, không thể chỉnh sửa.",
      };
    }

    if (subject !== undefined) ticket.subject = subject;
    if (message !== undefined) ticket.message = message;
    if (phone !== undefined) ticket.phone = phone;

    await ticket.save();

    return {
      errCode: 0,
      errMessage: "Cập nhật yêu cầu hỗ trợ thành công!",
      data: ticket,
    };
  } catch (error) {
    console.error("[ContactService.updateUserTicket] Error:", error);
    return {
      errCode: -1,
      errMessage: "Lỗi hệ thống khi cập nhật yêu cầu hỗ trợ.",
    };
  }
};

const deleteUserTicket = async (userId, id) => {
  const t = await db.sequelize.transaction();
  try {
    const ticket = await db.ContactTicket.findOne({
      where: { id, userId },
      transaction: t,
    });

    if (!ticket) {
      await t.rollback();
      return {
        errCode: 404,
        errMessage: "Không tìm thấy yêu cầu hỗ trợ hoặc bạn không có quyền xóa.",
      };
    }

    if (ticket.status !== "open") {
      await t.rollback();
      return {
        errCode: 400,
        errMessage: "Chỉ có thể hủy hoặc xóa yêu cầu đang ở trạng thái Chờ xử lý.",
      };
    }

    await ticket.destroy({ transaction: t });
    await t.commit();

    return {
      errCode: 0,
      errMessage: "Đã hủy yêu cầu hỗ trợ thành công!",
    };
  } catch (err) {
    await t.rollback();
    console.error("[ContactService.deleteUserTicket] Transaction error:", err);
    return {
      errCode: -1,
      errMessage: "Không thể hủy yêu cầu hỗ trợ lúc này.",
    };
  }
};

module.exports = {
  SUBJECT_LABELS,
  createTicket,
  getAllTickets,
  updateTicket,
  getUserTickets,
  updateUserTicket,
  deleteUserTicket,
  deleteTicket,
  bulkDeleteTickets,
};
