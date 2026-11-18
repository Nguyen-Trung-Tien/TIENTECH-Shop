const NotificationService = require("../services/notification/NotificationService");
const EmailService = require("../services/common/EmailService");
const SystemSettingService = require("../services/system/SystemSettingService");

const SUBJECT_LABELS = {
  tuvansanpham: "Tư vấn sản phẩm & Góc setup",
  baohanh: "Hỗ trợ Bảo hành / Sửa chữa",
  donhang: "Kiểm tra đơn hàng",
  hoptac: "Hợp tác kinh doanh / Doanh nghiệp",
  gopy: "Góp ý dịch vụ",
};

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const handleSubmitContact = async (req, res) => {
  try {
    const { name, email, phone = "", subject = "tuvansanpham", message } = req.body;
    const subjectLabel = SUBJECT_LABELS[subject] || subject;
    const io = typeof req.app?.get === "function" ? req.app.get("io") : null;

    const notifResult = await NotificationService.createNotification(
      {
        userId: null,
        title: `Liên hệ mới: ${subjectLabel}`,
        message: `${name} (${email}${phone ? ` - ${phone}` : ""}): ${message}`,
        type: "system",
        link: "/admin/notifications",
        metadata: {
          source: "contact_form",
          name,
          email,
          phone,
          subject: subjectLabel,
        },
      },
      null,
      io,
    );

    if (!notifResult || notifResult.errCode !== 0) {
      return res.status(500).json({
        errCode: -1,
        errMessage: notifResult?.errMessage || "Không thể ghi nhận yêu cầu liên hệ lúc này.",
      });
    }

    setImmediate(async () => {
      try {
        const adminEmail =
          (await SystemSettingService.getSetting("ADMIN_NOTIFICATION_EMAIL", "")) ||
          (await SystemSettingService.getSetting("STORE_EMAIL", "")) ||
          process.env.EMAIL_USER ||
          "";
        if (adminEmail) {
          const safeName = escapeHtml(name);
          const safeEmail = escapeHtml(email);
          const safePhone = escapeHtml(phone || "Không cung cấp");
          const safeSubject = escapeHtml(subjectLabel);
          const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
          await EmailService.sendEmail(
            adminEmail,
            `[TIENTECH CONTACT] ${subjectLabel} từ ${name}`,
            `
              <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                  <h2 style="margin-top: 0; color: #0f172a;">Yêu cầu liên hệ khách hàng mới</h2>
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
        console.warn("[ContactController] Admin email error:", emailErr?.message);
      }
    });

    return res.status(200).json({
      errCode: 0,
      errMessage: "Đã gửi yêu cầu liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.",
      data: {
        id: notifResult.data?.id || null,
        subject: subjectLabel,
      },
    });
  } catch (error) {
    console.error("[ContactController] Error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi máy chủ khi gửi liên hệ.",
    });
  }
};

module.exports = {
  handleSubmitContact,
};
