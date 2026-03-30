const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};

const sendForgotPasswordEmail = async (user, token) => {
  const subject = "🔐 Khôi phục mật khẩu - Xác nhận tài khoản";
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
        <div style="background-color: #0d6efd; color: white; text-align: center; padding: 16px 0;">
          <h2 style="margin: 0; font-size: 22px;">Tien-Tech Shop</h2>
        </div>

        <div style="padding: 24px;">
          <h3 style="color: #2c3e50;">Xin chào ${user.username || "bạn"},</h3>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã sau để xác nhận:</p>
          <div style="text-align: center; margin: 20px 0;">
            <div style="display: inline-block; background: #eef6ff; border: 1px solid #0d6efd; border-radius: 8px; padding: 12px 24px; font-size: 20px; font-weight: bold; color: #0d6efd;">
              ${token}
            </div>
          </div>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          <p style="margin-top: 24px;">Trân trọng,<br>Hệ thống hỗ trợ khách hàng</p>
        </div>

        <div style="background-color: #f3f4f6; text-align: center; padding: 12px;">
          <p style="font-size: 12px; color: #888; margin: 0;">Đây là email tự động, vui lòng không trả lời.</p>
        </div>
      </div>
    </div>
  `;
  return await sendEmail(user.email, subject, html);
};

const sendOrderDeliveredEmail = async (user, order) => {
  if (!user?.email) return false;

  const displayOrderCode = order.orderCode || order.id;
  const subject = `🎉 Đơn hàng ${displayOrderCode} của bạn đã được giao thành công!`;
  const clientUrl = process.env.URL_REACT;

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="background-color: #0d6efd; color: white; text-align: center; padding: 16px 0;">
        <h2 style="margin: 0; font-size: 22px;">Tien-Tech Shop</h2>
      </div>

      <div style="padding: 24px;">
        <h3 style="color: #2c3e50;">Xin chào ${
          user.username || "quý khách"
        },</h3>
        <p style="font-size: 15px; color: #333;">
          Chúng tôi xin thông báo rằng đơn hàng <strong style="color: #0d6efd;">${displayOrderCode}</strong> của bạn đã được <b>giao thành công</b>.
        </p>

        <div style="margin: 20px 0; background: #f3f4f6; border-radius: 8px; padding: 16px;">
          <h4 style="margin-bottom: 10px;">📦 Thông tin đơn hàng</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.6;">
            <li><strong>Mã đơn hàng:</strong> <span style="color: #0d6efd; font-weight: bold;">${displayOrderCode}</span></li>
            <li><strong>Địa chỉ giao hàng:</strong> ${
              order.shippingAddress
            }</li>
            <li><strong>Tổng thanh toán:</strong> <span style="color: #d32f2f; font-weight: bold;">${Number(order.totalPrice).toLocaleString()}₫</span></li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
          <a href="${clientUrl}/order-history" 
            style="display: inline-block; background-color: #0d6efd; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);">
            ⭐ Đánh giá sản phẩm ngay
          </a>
        </div>

        <p style="margin-top: 24px; color: #555; font-size: 14px;">
          Cảm ơn bạn đã tin tưởng và mua sắm tại <b>Tien-Tech Shop</b>! ❤️<br/>
          Những đánh giá của bạn sẽ giúp chúng tôi hoàn thiện dịch vụ tốt hơn.
        </p>
      </div>

      <div style="background-color: #f3f4f6; text-align: center; padding: 16px; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #888; margin: 0;">
          Đây là email tự động, vui lòng không trả lời trực tiếp.<br/>
          © ${new Date().getFullYear()} Tien-Tech Shop. All rights reserved.
        </p>
      </div>
    </div>
  </div>
  `;

  return await sendEmail(user.email, subject, html);
};

const sendVerificationEmail = async (user, token) => {
  const subject = "📧 Xác nhận tài khoản - Tien-Tech Shop";
  
  // Đảm bảo URL_REACT có dấu / ở cuối
  const baseUrl = process.env.URL_REACT.endsWith("/") 
    ? process.env.URL_REACT 
    : `${process.env.URL_REACT}/`;
    
  const verificationUrl = `${baseUrl}verify-email?email=${encodeURIComponent(user.email)}&token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
        <div style="background-color: #0d6efd; color: white; text-align: center; padding: 16px 0;">
          <h2 style="margin: 0; font-size: 22px;">Tien-Tech Shop</h2>
        </div>

        <div style="padding: 24px;">
          <h3 style="color: #2c3e50;">Chào mừng ${user.username || "bạn"} đến với Tien-Tech!</h3>
          <p>Cảm ơn bạn đã đăng ký. Vui lòng xác nhận tài khoản của bạn bằng cách nhấn vào nút bên dưới:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #0d6efd; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Xác nhận tài khoản
            </a>
          </div>
          <p>Hoặc bạn có thể sử dụng mã xác nhận này trong ứng dụng:</p>
          <div style="text-align: center; margin: 20px 0;">
             <div style="display: inline-block; background: #f8f9fa; border: 1px dashed #dee2e6; padding: 10px 20px; font-size: 18px; font-weight: bold; color: #333;">
              ${token}
            </div>
          </div>
          <p style="font-size: 14px; color: #666;">Link xác nhận này sẽ hết hạn sau 24 giờ.</p>
          <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
          <p style="margin-top: 24px;">Trân trọng,<br>Đội ngũ Tien-Tech</p>
        </div>

        <div style="background-color: #f3f4f6; text-align: center; padding: 12px;">
          <p style="font-size: 12px; color: #888; margin: 0;">© ${new Date().getFullYear()} Tien-Tech Shop. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
  return await sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendForgotPasswordEmail,
  sendOrderDeliveredEmail,
  sendVerificationEmail,
};
