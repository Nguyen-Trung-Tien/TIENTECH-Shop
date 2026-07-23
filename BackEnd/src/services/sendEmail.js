const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Transporter SMTP Pool Configuration
 * Uses connection pooling & socket timeouts for 60fps fast non-blocking email delivery.
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
transporter.verify((error) => {
  if (error) {
    console.warn("⚠️ [SMTP VERIFY] Cannot connect to Gmail SMTP:", error.message);
  } else {
    console.log("✅ [SMTP VERIFY] Connected to Gmail SMTP server successfully!");
  }
});

/**
 * Send email with automatic exponential backoff retry (up to 3 attempts)
 */
const sendMailWithRetry = async (mailOptions, retries = 3, delayMs = 500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ [EMAIL SENT] MessageId: ${info.messageId} to ${mailOptions.to}`);
      return true;
    } catch (error) {
      console.error(`❌ [EMAIL ATTEMPT ${attempt}/${retries}] Failed for ${mailOptions.to}:`, error.message);
      if (attempt === retries) return false;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  return false;
};

const sendEmail = async (to, subject, html) => {
  if (!to || !process.env.EMAIL_USER) {
    console.warn("⚠️ [EMAIL SKIPPED] Missing recipient or EMAIL_USER configuration.");
    return false;
  }
  const mailOptions = {
    from: `"TienTech Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  return await sendMailWithRetry(mailOptions);
};

/**
 * Non-blocking Background Mail Dispatcher
 * Fires email sending in the background without holding HTTP response threads.
 */
const sendEmailAsync = (emailFn, ...args) => {
  setImmediate(async () => {
    try {
      await emailFn(...args);
    } catch (err) {
      console.error("❌ [EMAIL ASYNC ERROR]:", err);
    }
  });
};

const sendForgotPasswordEmail = async (user, token) => {
  if (!user?.email) return false;
  const subject = "🔐 Khôi phục mật khẩu - Xác nhận tài khoản TienTech";
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-align: center; padding: 20px 0;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">TienTech Shop</h2>
        </div>

        <div style="padding: 28px;">
          <h3 style="color: #1e293b; margin-top: 0; font-size: 18px;">Xin chào ${user.username || "bạn"},</h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TienTech. Vui lòng sử dụng mã OTP sau đây để tiếp tục:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: #eff6ff; border: 2px stroke #2563eb; border-radius: 12px; padding: 14px 28px; font-size: 22px; font-weight: 900; color: #2563eb; letter-spacing: 4px;">
              ${token}
            </div>
          </div>
          <p style="color: #64748b; font-size: 13px;">Mã xác nhận có hiệu lực trong vòng 15 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          <p style="margin-top: 28px; color: #334155; font-size: 14px; font-weight: 600;">Trân trọng,<br>Đội ngũ hỗ trợ TienTech</p>
        </div>

        <div style="background-color: #f8fafc; text-align: center; padding: 14px; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
        </div>
      </div>
    </div>
  `;
  return await sendEmail(user.email, subject, html);
};

const sendOrderDeliveredEmail = async (user, order) => {
  if (!user?.email) return false;

  const displayOrderCode = order.orderCode || order.id;
  const subject = `🎉 Đơn hàng #${displayOrderCode} đã được giao thành công!`;
  const clientUrl = process.env.URL_REACT || "http://localhost:3000";

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-align: center; padding: 20px 0;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TienTech Shop</h2>
      </div>

      <div style="padding: 28px;">
        <h3 style="color: #1e293b; margin-top: 0;">Xin chào ${user.username || "quý khách"},</h3>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">
          Đơn hàng <strong style="color: #2563eb;">#${displayOrderCode}</strong> của bạn đã được <b>giao thành công</b>.
        </p>

        <div style="margin: 20px 0; background: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #f1f5f9;">
          <h4 style="margin: 0 0 12px 0; color: #0f172a;">📦 Thông tin đơn hàng</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8; color: #334155;">
            <li><strong>Mã đơn hàng:</strong> <span style="color: #2563eb; font-weight: 700;">#${displayOrderCode}</span></li>
            <li><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress || "Địa chỉ mặc định"}</li>
            <li><strong>Tổng thanh toán:</strong> <span style="color: #dc2626; font-weight: 800;">${Number(order.totalPrice).toLocaleString("vi-VN")}₫</span></li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${clientUrl}/order-history" 
            style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
            ⭐ Đánh giá sản phẩm ngay
          </a>
        </div>

        <p style="margin-top: 24px; color: #64748b; font-size: 14px; line-height: 1.6;">
          Cảm ơn bạn đã tin tưởng và mua sắm tại <b>TienTech Shop</b>! ❤️
        </p>
      </div>

      <div style="background-color: #f8fafc; text-align: center; padding: 16px; border-top: 1px solid #f1f5f9;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          © ${new Date().getFullYear()} TienTech Shop. All rights reserved.
        </p>
      </div>
    </div>
  </div>
  `;

  return await sendEmail(user.email, subject, html);
};

const sendOrderConfirmedEmail = async (user, order) => {
  if (!user?.email) return false;

  const displayOrderCode = order.orderCode || order.id;
  const subject = `✅ Đơn hàng #${displayOrderCode} đã được xác nhận!`;
  const clientUrl = process.env.URL_REACT || "http://localhost:3000";

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-align: center; padding: 20px 0;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TienTech Shop</h2>
      </div>

      <div style="padding: 28px;">
        <h3 style="color: #1e293b; margin-top: 0;">Xin chào ${user.username || "quý khách"},</h3>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">
          Đơn hàng <strong style="color: #2563eb;">#${displayOrderCode}</strong> của bạn đã được <b>xác nhận thành công</b> và đang được chuẩn bị để giao đến bạn.
        </p>

        <div style="margin: 20px 0; background: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #f1f5f9;">
          <h4 style="margin: 0 0 12px 0; color: #0f172a;">📦 Thông tin đơn hàng</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8; color: #334155;">
            <li><strong>Mã đơn hàng:</strong> <span style="color: #2563eb; font-weight: 700;">#${displayOrderCode}</span></li>
            <li><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString("vi-VN")}</li>
            <li><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress || "Mặc định"}</li>
            <li><strong>Tổng thanh toán:</strong> <span style="color: #dc2626; font-weight: 800;">${Number(order.totalPrice).toLocaleString("vi-VN")}₫</span></li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${clientUrl}/order-detail/${order.id}" 
            style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
            Xem chi tiết đơn hàng
          </a>
        </div>

        <p style="margin-top: 24px; color: #64748b; font-size: 14px; line-height: 1.6;">
          Cảm ơn bạn đã tin tưởng và mua sắm tại <b>TienTech Shop</b>! ❤️
        </p>
      </div>

      <div style="background-color: #f8fafc; text-align: center; padding: 16px; border-top: 1px solid #f1f5f9;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          © ${new Date().getFullYear()} TienTech Shop. All rights reserved.
        </p>
      </div>
    </div>
  </div>
  `;

  return await sendEmail(user.email, subject, html);
};

const sendVerificationEmail = async (user, token) => {
  if (!user?.email) return false;
  const subject = "📧 Xác nhận tài khoản - TienTech Shop";

  const baseUrl = (process.env.URL_REACT || "http://localhost:3000").endsWith("/")
    ? process.env.URL_REACT
    : `${process.env.URL_REACT}/`;

  const verificationUrl = `${baseUrl}verify-email?email=${encodeURIComponent(user.email)}&token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-align: center; padding: 20px 0;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">TienTech Shop</h2>
        </div>

        <div style="padding: 28px;">
          <h3 style="color: #1e293b; margin-top: 0;">Chào mừng ${user.username || "bạn"} đến với TienTech!</h3>
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
          <p style="margin-top: 24px; color: #334155; font-size: 14px;">Trân trọng,<br>Đội ngũ TienTech</p>
        </div>

        <div style="background-color: #f8fafc; text-align: center; padding: 16px; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} TienTech Shop. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
  return await sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendEmailAsync,
  sendForgotPasswordEmail,
  sendOrderDeliveredEmail,
  sendOrderConfirmedEmail,
  sendVerificationEmail,
};
