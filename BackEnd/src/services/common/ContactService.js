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
      console.warn("[ContactService] Admin email error:", emailErr?.message);
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

const updateTicket = async (id, payload = {}, adminUser = null) => {
  const t = await db.sequelize.transaction();
  let ticket;
  const updates = {};

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

module.exports = {
  SUBJECT_LABELS,
  createTicket,
  getAllTickets,
  updateTicket,
};
