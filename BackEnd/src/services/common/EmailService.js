const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Transporter SMTP Pool Configuration
 * Uses connection pooling & socket timeouts for fast non-blocking email delivery.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 10,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 15000,
});

// Verify SMTP Connection readiness on startup
if (process.env.NODE_ENV !== "test") {
  transporter.verify((error) => {
    if (error) {
      console.warn("[SMTP VERIFY] Cannot connect to Gmail SMTP:", error.message);
    } else {
      console.log("[SMTP VERIFY] Connected to Gmail SMTP server successfully!");
    }
  });
}

/**
 * Send email with automatic exponential backoff retry (up to 3 attempts)
 */
const sendMailWithRetry = async (mailOptions, retries = 3, delayMs = 500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${mailOptions.to}`);
      return true;
    } catch (error) {
      console.error(`[EMAIL ATTEMPT ${attempt}/${retries}] Failed for ${mailOptions.to}:`, error.message);
      if (attempt === retries) return false;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  return false;
};

class EmailService {
  async sendEmail(to, subject, html) {
    if (!to || !process.env.EMAIL_USER) {
      console.warn("[EMAIL SKIPPED] Missing recipient or EMAIL_USER configuration.");
      return false;
    }
    const mailOptions = {
      from: `"TIENTECH Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    return await sendMailWithRetry(mailOptions);
  }

  sendEmailAsync(emailFn, ...args) {
    setImmediate(async () => {
      try {
        await emailFn(...args);
      } catch (err) {
        console.error("[EMAIL ASYNC ERROR]:", err);
      }
    });
  }

  async sendForgotPasswordEmail(user, token) {
    if (!user?.email) return false;
    const subject = "[TIENTECH] Khoi phuc mat khau tai khoan";
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-align: center; padding: 20px 0;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TIENTECH Shop</h2>
          </div>

          <div style="padding: 28px;">
            <h3 style="color: #1e293b; margin-top: 0; font-size: 18px;">Xin chào ${user.username || "bạn"},</h3>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TIENTECH. Vui lòng sử dụng mã OTP sau đây để tiếp tục:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <div style="display: inline-block; background: #eff6ff; border: 2px solid #2563eb; border-radius: 12px; padding: 14px 28px; font-size: 22px; font-weight: 900; color: #2563eb; letter-spacing: 4px;">
                ${token}
              </div>
            </div>
            <p style="color: #64748b; font-size: 13px;">Mã xác nhận có hiệu lực trong vòng 15 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
            <p style="margin-top: 28px; color: #334155; font-size: 14px; font-weight: 600;">Trân trọng,<br>Đội ngũ hỗ trợ TIENTECH</p>
          </div>

          <div style="background-color: #f8fafc; text-align: center; padding: 14px; border-top: 1px solid #f1f5f9;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
          </div>
        </div>
      </div>
    `;
    return await this.sendEmail(user.email, subject, html);
  }

  async sendVerificationEmail(user, token) {
    if (!user?.email) return false;
    const subject = "[TIENTECH] Xac nhan tai khoan dang ky";

    const baseUrl = (process.env.URL_REACT || "http://localhost:3000").endsWith("/")
      ? process.env.URL_REACT
      : `${process.env.URL_REACT}/`;

    const verificationUrl = `${baseUrl}verify-email?email=${encodeURIComponent(user.email)}&token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-align: center; padding: 20px 0;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TIENTECH Shop</h2>
          </div>

          <div style="padding: 28px;">
            <h3 style="color: #1e293b; margin-top: 0;">Chào mừng ${user.username || "bạn"} đến với TIENTECH!</h3>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">Cảm ơn bạn đã đăng ký. Vui lòng xác nhận tài khoản của bạn bằng cách nhấn vào nút bên dưới:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                Xác nhận tài khoản
              </a>
            </div>
            <p style="font-size: 14px; color: #475569;">Hoặc bạn có thể sử dụng mã xác nhận này trong ứng dụng:</p>
            <div style="text-align: center; margin: 20px 0;">
               <div style="display: inline-block; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 12px 24px; font-size: 20px; font-weight: 800; color: #1e293b; letter-spacing: 2px;">
                ${token}
              </div>
            </div>
            <p style="font-size: 13px; color: #64748b;">Link xác nhận này sẽ hết hạn sau 24 giờ.</p>
            <p style="margin-top: 24px; color: #334155; font-size: 14px;">Trân trọng,<br>Đội ngũ TIENTECH</p>
          </div>

          <div style="background-color: #f8fafc; text-align: center; padding: 16px; border-top: 1px solid #f1f5f9;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} TIENTECH Shop. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
    return await this.sendEmail(user.email, subject, html);
  }

  async isEmailOptedIn(user) {
    if (!user || !user.email) return false;
    
    // Explicit false check (boolean, string, or number)
    if (
      user.receiveEmail === false ||
      user.receiveEmail === "false" ||
      user.receiveEmail === 0 ||
      user.receiveEmail === "0"
    ) {
      console.log(`[EMAIL SKIPPED] User #${user.id || "?"} (${user.email}) has opted out of email notifications.`);
      return false;
    }

    // Fail-safe: if receiveEmail was omitted by the caller query, check database directly
    if (user.receiveEmail === undefined && user.id) {
      try {
        const db = require("../../models");
        const dbUser = await db.User.findByPk(user.id, { attributes: ["id", "receiveEmail"] });
        if (
          dbUser &&
          (dbUser.receiveEmail === false ||
            dbUser.receiveEmail === "false" ||
            dbUser.receiveEmail === 0 ||
            dbUser.receiveEmail === "0")
        ) {
          console.log(`[EMAIL SKIPPED DB] User #${user.id} (${user.email}) has receiveEmail=false in DB.`);
          return false;
        }
      } catch (err) {
        console.warn("[EMAIL OPT-IN CHECK ERROR]", err.message);
      }
    }

    return true;
  }

  async sendOrderCreatedEmail(user, order) {
    if (!(await this.isEmailOptedIn(user))) return false;

    const displayOrderCode = order.orderCode || order.id;
    const subject = `[TIENTECH] Dat hang thanh cong - Don hang #${displayOrderCode}`;
    const clientUrl = process.env.URL_REACT || "http://localhost:3000";

    const itemsHtml = Array.isArray(order.orderItems)
      ? order.orderItems
          .map(
            (item) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-size: 13px; color: #1e293b;">
              <strong>${item.productName || "Sản phẩm"}</strong>
              ${item.variantName ? `<br><small style="color: #64748b;">Phân loại: ${item.variantName}</small>` : ""}
            </td>
            <td style="padding: 10px; font-size: 13px; color: #475569; text-align: center;">x${item.quantity}</td>
            <td style="padding: 10px 0; font-size: 13px; color: #2563eb; font-weight: 700; text-align: right;">
              ${Number(item.price || item.subtotal || 0).toLocaleString("vi-VN")}₫
            </td>
          </tr>
        `
          )
          .join("")
      : "";

    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-align: center; padding: 24px 20px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TIENTECH Shop</h2>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Cảm ơn quý khách đã đặt hàng!</p>
        </div>

        <div style="padding: 28px;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Xin chào ${user.username || order.receiverName || "Quý khách"},</h3>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Đơn hàng <strong style="color: #2563eb;">#${displayOrderCode}</strong> của bạn đã được tiếp nhận thành công vào hệ thống và đang được xử lý.
          </p>

          <div style="margin: 20px 0; background: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
            <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px;">Thông Tin Giao Hàng</h4>
            <table style="width: 100%; font-size: 13px; color: #334155; line-height: 1.8;">
              <tr><td style="width: 120px; font-weight: 700;">Người nhận:</td><td>${order.receiverName || user.username || "N/A"} (${order.receiverPhone || user.phone || "N/A"})</td></tr>
              <tr><td style="font-weight: 700;">Địa chỉ:</td><td>${order.shippingAddress || "Địa chỉ mặc định"}</td></tr>
              <tr><td style="font-weight: 700;">Thanh toán:</td><td style="text-transform: uppercase;">${order.paymentMethod || "COD"}</td></tr>
            </table>

            ${
              itemsHtml
                ? `
              <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 14px 0;" />
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
            `
                : ""
            }

            <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 14px 0;" />
            <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #0f172a;">
              <span>Tổng thanh toán:</span>
              <span style="color: #dc2626;">${Number(order.totalPrice).toLocaleString("vi-VN")}₫</span>
            </div>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${clientUrl}/orders-history" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
              Theo dõi tình trạng đơn hàng
            </a>
          </div>

          <p style="margin-top: 20px; color: #64748b; font-size: 13px; line-height: 1.6;">
            Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ hotline <b>1900 6868</b> hoặc phản hồi qua email này.
          </p>
        </div>

        <div style="background-color: #f1f5f9; text-align: center; padding: 14px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">© ${new Date().getFullYear()} TIENTECH Shop. All rights reserved.</p>
        </div>
      </div>
    </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendOrderShippingEmail(user, order) {
    if (!(await this.isEmailOptedIn(user))) return false;

    const displayOrderCode = order.orderCode || order.id;
    const subject = `[TIENTECH] Don hang #${displayOrderCode} dang tren duong giao`;
    const clientUrl = process.env.URL_REACT || "http://localhost:3000";

    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; text-align: center; padding: 24px 20px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TIENTECH Logistics</h2>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Đơn hàng của bạn đang được vận chuyển!</p>
        </div>

        <div style="padding: 28px;">
          <h3 style="color: #0f172a; margin-top: 0;">Xin chào ${user.username || order.receiverName || "Quý khách"},</h3>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Đơn hàng <strong style="color: #0284c7;">#${displayOrderCode}</strong> đã được đóng gói cẩn thận và bàn giao cho đơn vị vận chuyển. Nhân viên giao hàng sẽ sớm liên hệ với bạn.
          </p>

          <div style="margin: 20px 0; background: #f0f9ff; border-radius: 12px; padding: 18px; border: 1px solid #bae6fd;">
            <h4 style="margin: 0 0 10px 0; color: #0369a1; font-size: 15px;">Địa Chỉ Nhận Hàng</h4>
            <p style="margin: 0; font-size: 13px; color: #0c4a6e; line-height: 1.6;">
              <b>Người nhận:</b> ${order.receiverName || user.username || "Quý khách"} (${order.receiverPhone || user.phone || "N/A"})<br>
              <b>Địa chỉ:</b> ${order.shippingAddress || "Địa chỉ mặc định"}<br>
              <b>Số tiền cần thanh toán khi nhận:</b> <span style="color: #dc2626; font-weight: 800;">${order.paymentStatus === "paid" ? "0₫ (Đã thanh toán trước)" : `${Number(order.totalPrice).toLocaleString("vi-VN")}₫`}</span>
            </p>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${clientUrl}/orders-history" 
               style="display: inline-block; background: linear-gradient(135deg, #0284c7, #0369a1); color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
              Xem chi tiết tiến trình giao hàng
            </a>
          </div>

          <p style="margin-top: 20px; color: #64748b; font-size: 13px; line-height: 1.6;">
            Vui lòng giữ điện thoại luôn mở để nhân viên giao hàng liên hệ thuận tiện nhất.
          </p>
        </div>

        <div style="background-color: #f1f5f9; text-align: center; padding: 14px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">© ${new Date().getFullYear()} TIENTECH Shop. All rights reserved.</p>
        </div>
      </div>
    </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendOrderDeliveredEmail(user, order) {
    if (!(await this.isEmailOptedIn(user))) return false;

    const displayOrderCode = order.orderCode || order.id;
    const subject = `[TIENTECH] Don hang #${displayOrderCode} da duoc giao thanh cong`;
    const clientUrl = process.env.URL_REACT || "http://localhost:3000";

    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-align: center; padding: 20px 0;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TIENTECH Shop</h2>
        </div>

        <div style="padding: 28px;">
          <h3 style="color: #1e293b; margin-top: 0;">Xin chào ${user.username || order.receiverName || "Quý khách"},</h3>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">
            Đơn hàng <strong style="color: #2563eb;">#${displayOrderCode}</strong> của bạn đã được <b>giao thành công</b>.
          </p>

          <div style="margin: 20px 0; background: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #f1f5f9;">
            <h4 style="margin: 0 0 12px 0; color: #0f172a;">Thông tin đơn hàng</h4>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8; color: #334155;">
              <li><strong>Mã đơn hàng:</strong> <span style="color: #2563eb; font-weight: 700;">#${displayOrderCode}</span></li>
              <li><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress || "Địa chỉ mặc định"}</li>
              <li><strong>Tổng thanh toán:</strong> <span style="color: #dc2626; font-weight: 800;">${Number(order.totalPrice).toLocaleString("vi-VN")}₫</span></li>
            </ul>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${clientUrl}/orders-history" 
              style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
              Đánh giá sản phẩm ngay
            </a>
          </div>

          <p style="margin-top: 24px; color: #64748b; font-size: 14px; line-height: 1.6;">
            Cảm ơn bạn đã tin tưởng và mua sắm tại <b>TIENTECH Shop</b>!
          </p>
        </div>

        <div style="background-color: #f8fafc; text-align: center; padding: 16px; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            © ${new Date().getFullYear()} TIENTECH Shop. All rights reserved.
          </p>
        </div>
      </div>
    </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendOrderConfirmedEmail(user, order) {
    if (!(await this.isEmailOptedIn(user))) return false;

    const displayOrderCode = order.orderCode || order.id;
    const subject = `[TIENTECH] Don hang #${displayOrderCode} da duoc xac nhan`;
    const clientUrl = process.env.URL_REACT || "http://localhost:3000";

    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-align: center; padding: 20px 0;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TIENTECH Shop</h2>
        </div>

        <div style="padding: 28px;">
          <h3 style="color: #1e293b; margin-top: 0;">Xin chào ${user.username || order.receiverName || "Quý khách"},</h3>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">
            Đơn hàng <strong style="color: #2563eb;">#${displayOrderCode}</strong> của bạn đã được <b>xác nhận thành công</b> và đang được chuẩn bị để giao đến bạn.
          </p>

          <div style="margin: 20px 0; background: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #f1f5f9;">
            <h4 style="margin: 0 0 12px 0; color: #0f172a;">Thông tin đơn hàng</h4>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8; color: #334155;">
              <li><strong>Mã đơn hàng:</strong> <span style="color: #2563eb; font-weight: 700;">#${displayOrderCode}</span></li>
              <li><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString("vi-VN")}</li>
              <li><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress || "Mặc định"}</li>
              <li><strong>Tổng thanh toán:</strong> <span style="color: #dc2626; font-weight: 800;">${Number(order.totalPrice).toLocaleString("vi-VN")}₫</span></li>
            </ul>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${clientUrl}/orders-history" 
              style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
              Xem chi tiết đơn hàng
            </a>
          </div>

          <p style="margin-top: 24px; color: #64748b; font-size: 14px; line-height: 1.6;">
            Cảm ơn bạn đã tin tưởng và mua sắm tại <b>TIENTECH Shop</b>!
          </p>
        </div>

        <div style="background-color: #f8fafc; text-align: center; padding: 16px; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            © ${new Date().getFullYear()} TIENTECH Shop. All rights reserved.
          </p>
        </div>
      </div>
    </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendOrderCancelledEmail(user, order, cancelReason) {
    if (!(await this.isEmailOptedIn(user))) return false;

    const displayOrderCode = order.orderCode || order.id;
    const subject = `[TIENTECH] Thong bao huy don hang #${displayOrderCode}`;

    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #e11d48, #be123c); color: white; text-align: center; padding: 24px 20px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TIENTECH Shop</h2>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Thông báo đơn hàng đã bị hủy</p>
        </div>

        <div style="padding: 28px;">
          <h3 style="color: #0f172a; margin-top: 0;">Xin chào ${user.username || "Quý khách"},</h3>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Đơn hàng <strong style="color: #e11d48;">#${displayOrderCode}</strong> của bạn đã được hủy thành công.
          </p>

          <div style="margin: 20px 0; background: #fff1f2; border-radius: 12px; padding: 18px; border: 1px solid #fecdd3;">
            <h4 style="margin: 0 0 8px 0; color: #9f1239; font-size: 14px;">Lý do hủy đơn:</h4>
            <p style="margin: 0; font-size: 13px; color: #881337; font-weight: 600;">${cancelReason || "Theo yêu cầu của khách hàng hoặc sự cố vận hành."}</p>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
            Nếu bạn đã thanh toán qua cổng trực tuyến (VNPay / PayPal / MoMo), số tiền sẽ được hoàn trả tự động theo quy định của cổng thanh toán.
          </p>
        </div>

        <div style="background-color: #f1f5f9; text-align: center; padding: 14px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">© ${new Date().getFullYear()} TIENTECH Shop. All rights reserved.</p>
        </div>
      </div>
    </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendAdminNewOrderEmail(adminEmail, order, user) {
    if (!adminEmail) return false;

    const displayOrderCode = order.orderCode || order.id;
    const subject = `[TIENTECH ADMIN] Don hang moi #${displayOrderCode} - ${Number(order.totalPrice).toLocaleString("vi-VN")}d`;

    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; text-align: center; padding: 20px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 800;">THONG BAO DON HANG MOI</h2>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Khách hàng <b>${user?.username || order.receiverName || "Khách vãng lai"}</b> vừa hoàn tất đặt đơn hàng mới trên hệ thống.
          </p>

          <div style="margin: 16px 0; background: #f0fdf4; border-radius: 12px; padding: 16px; border: 1px solid #bbf7d0;">
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; line-height: 2; color: #166534;">
              <li><strong>Mã đơn hàng:</strong> #${displayOrderCode}</li>
              <li><strong>Người nhận:</strong> ${order.receiverName || user?.username || "N/A"} - ${order.receiverPhone || user?.phone || "N/A"}</li>
              <li><strong>Địa chỉ giao:</strong> ${order.shippingAddress || "N/A"}</li>
              <li><strong>Phương thức:</strong> ${order.paymentMethod || "COD"}</li>
              <li><strong>Tổng tiền:</strong> <span style="color: #dc2626; font-weight: 800; font-size: 15px;">${Number(order.totalPrice).toLocaleString("vi-VN")}₫</span></li>
            </ul>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            Vui lòng đăng nhập Admin Portal để xác nhận và đóng gói giao hàng cho khách.
          </p>
        </div>
      </div>
    </div>
    `;

    return await this.sendEmail(adminEmail, subject, html);
  }

  async sendAdminOrderCancelledEmail(adminEmail, order, user, cancelReason) {
    if (!adminEmail) return false;

    const displayOrderCode = order.orderCode || order.id;
    const subject = `[TIENTECH ADMIN] Don hang #${displayOrderCode} da bi huy`;

    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #fecdd3;">
        <div style="background: #e11d48; color: white; text-align: center; padding: 18px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">DON HANG DA BI HUY</h2>
        </div>

        <div style="padding: 24px; font-size: 14px; color: #334155;">
          <p>Đơn hàng <strong>#${displayOrderCode}</strong> của khách <b>${user?.username || order.receiverName}</b> đã chuyển sang trạng thái HỦY.</p>
          <p><strong>Lý do:</strong> ${cancelReason || "N/A"}</p>
          <p><strong>Giá trị đơn:</strong> ${Number(order.totalPrice).toLocaleString("vi-VN")}₫</p>
        </div>
      </div>
    </div>
    `;

    return await this.sendEmail(adminEmail, subject, html);
  }
}

const emailService = new EmailService();

module.exports = {
  EmailService,
  emailService,
  sendEmail: (to, subject, html) => emailService.sendEmail(to, subject, html),
  sendEmailAsync: (fn, ...args) => emailService.sendEmailAsync(fn, ...args),
  sendForgotPasswordEmail: (user, token) => emailService.sendForgotPasswordEmail(user, token),
  sendOrderCreatedEmail: (user, order) => emailService.sendOrderCreatedEmail(user, order),
  sendOrderShippingEmail: (user, order) => emailService.sendOrderShippingEmail(user, order),
  sendOrderDeliveredEmail: (user, order) => emailService.sendOrderDeliveredEmail(user, order),
  sendOrderConfirmedEmail: (user, order) => emailService.sendOrderConfirmedEmail(user, order),
  sendOrderCancelledEmail: (user, order, reason) => emailService.sendOrderCancelledEmail(user, order, reason),
  sendAdminNewOrderEmail: (adminEmail, order, user) => emailService.sendAdminNewOrderEmail(adminEmail, order, user),
  sendAdminOrderCancelledEmail: (adminEmail, order, user, reason) => emailService.sendAdminOrderCancelledEmail(adminEmail, order, user, reason),
  sendVerificationEmail: (user, token) => emailService.sendVerificationEmail(user, token),
};
