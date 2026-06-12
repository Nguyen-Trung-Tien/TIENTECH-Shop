/**
 * Utility to print a premium, pixel-perfect A4 invoice receipt
 * dynamically inside an isolated iframe.
 */
export const printInvoice = (order) => {
  if (!order) return;

  // Calculate subtotal
  const subtotal = order.orderItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  // Create an iframe element
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // Build the invoice HTML content
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hóa đơn #${order.orderCode || order.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }

          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            position: relative;
          }

          /* Header Table Layout */
          .header-table {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
          }

          .company-info {
            max-width: 60%;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: -0.05em;
            margin-bottom: 5px;
          }

          .company-details {
            font-size: 11px;
            color: #475569;
            line-height: 1.4;
          }

          .invoice-meta {
            text-align: right;
          }

          .invoice-title {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.02em;
            margin-bottom: 5px;
          }

          .invoice-code {
            font-size: 14px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 3px;
          }

          .invoice-date {
            font-size: 11px;
            color: #64748b;
          }

          .divider {
            border: 0;
            border-top: 2px dashed #cbd5e1;
            margin: 20px 0;
          }

          /* Info sections */
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }

          .info-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
          }

          .info-box h3 {
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 11px;
            font-weight: 800;
            color: #475569;
            letter-spacing: 0.1em;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
          }

          .info-box table {
            width: 100%;
            border-collapse: collapse;
          }

          .info-box td {
            padding: 4px 0;
            vertical-align: top;
          }

          .info-box td:first-child {
            width: 30%;
            color: #64748b;
            font-weight: 600;
          }

          /* Items Table */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }

          .items-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 10px 12px;
          }

          .items-table th:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
          }

          .items-table th:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
          }

          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
          }

          .items-table tr:nth-child(even) td {
            background-color: #f8fafc;
          }

          /* Summary */
          .summary-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
            page-break-inside: avoid;
          }

          .summary-table {
            width: 320px;
            border-collapse: collapse;
          }

          .summary-table td {
            padding: 6px 12px;
            font-weight: 500;
          }

          .summary-table td:first-child {
            text-align: right;
            color: #64748b;
          }

          .summary-table td:last-child {
            text-align: right;
            font-weight: 700;
          }

          .discount-row td {
            color: #ef4444 !important;
          }

          .grand-total-row td {
            border-top: 2px solid #0f172a;
            font-size: 16px;
            padding: 12px;
            color: #2563eb !important;
          }

          /* Stamp */
          .stamp-container {
            position: absolute;
            bottom: 140px;
            right: 80px;
            z-index: 10;
            pointer-events: none;
            page-break-inside: avoid;
          }

          .stamp {
            width: 130px;
            height: 130px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-weight: 800;
            font-size: 11px;
            text-transform: uppercase;
            transform: rotate(-12deg);
            opacity: 0.85;
          }

          .stamp-paid {
            border: 4px double #10b981;
            color: #10b981;
            background-color: rgba(16, 185, 129, 0.05);
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.02);
          }

          .stamp-unpaid {
            border: 4px double #ef4444;
            color: #ef4444;
            background-color: rgba(239, 68, 68, 0.05);
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.02);
          }

          .stamp-inner {
            border: 1px dashed currentColor;
            border-radius: 50%;
            width: 106px;
            height: 106px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 5px;
            box-sizing: border-box;
          }

          /* Signatures */
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 50px;
            page-break-inside: avoid;
          }

          .signature-box {
            width: 200px;
            text-align: center;
          }

          .signature-box em {
            font-size: 10px;
            color: #64748b;
          }

          /* Footer notes */
          .footer-note {
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            line-height: 1.4;
            page-break-inside: avoid;
          }

          .badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 700;
            border-radius: 6px;
            text-transform: uppercase;
          }

          .badge-paid {
            background-color: #d1fae5;
            color: #065f46;
            border-color: #10b981;
          }

          .badge-unpaid {
            background-color: #fee2e2;
            color: #991b1b;
            border-color: #ef4444;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header Table Layout -->
          <div class="header-table">
            <div class="company-info">
              <div class="logo">TienTech</div>
              <div class="company-details">
                <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ TIENTECH</strong><br/>
                Địa chỉ: 123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh<br/>
                Điện thoại: (+84) 123-456-789 | Email: contact@tientech.com<br/>
                Website: www.tientech.com
              </div>
            </div>
            <div class="invoice-meta">
              <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
              <div class="invoice-code">Số: #${order.orderCode || order.id}</div>
              <div class="invoice-date">Ngày lập: ${new Date(order.createdAt).toLocaleDateString("vi-VN")} ${new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>

          <hr class="divider"/>

          <!-- Customer & Shipping Info -->
          <div class="info-section">
            <div class="info-box">
              <h3>THÔNG TIN KHÁCH HÀNG</h3>
              <table>
                <tr>
                  <td><strong>Họ tên:</strong></td>
                  <td>${order.receiverName || order.user?.username || "Khách hàng"}</td>
                </tr>
                <tr>
                  <td><strong>Điện thoại:</strong></td>
                  <td>${order.receiverPhone || order.user?.phone || "-"}</td>
                </tr>
                <tr>
                  <td><strong>Địa chỉ:</strong></td>
                  <td>${order.shippingAddress || "-"}</td>
                </tr>
                ${order.note ? `<tr><td><strong>Ghi chú:</strong></td><td>${order.note}</td></tr>` : ""}
              </table>
            </div>
            <div class="info-box">
              <h3>THÔNG TIN THANH TOÁN</h3>
              <table>
                <tr>
                  <td><strong>Phương thức:</strong></td>
                  <td>${order.paymentMethod || "Thanh toán COD"}</td>
                </tr>
                <tr>
                  <td><strong>Trạng thái:</strong></td>
                  <td>
                    <span class="badge ${order.paymentStatus === "paid" ? "badge-paid" : "badge-unpaid"}">
                      ${order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 5%;">STT</th>
                <th style="text-align: left;">Sản phẩm</th>
                <th style="width: 10%; text-align: center;">SL</th>
                <th style="width: 20%; text-align: right;">Đơn giá</th>
                <th style="width: 25%; text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems?.map((item, index) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td>
                    <strong style="color: #0f172a;">${item.productName}</strong>
                    <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Phân loại: ${item.product?.category?.name || "Thiết bị điện tử"}</div>
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${(item.price || 0).toLocaleString("vi-VN")} ₫</td>
                  <td style="text-align: right; font-weight: bold;">${((item.price || 0) * item.quantity).toLocaleString("vi-VN")} ₫</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <!-- Summary Section -->
          <div class="summary-wrapper">
            <table class="summary-table">
              <tr>
                <td>Tạm tính:</td>
                <td>${subtotal.toLocaleString("vi-VN")} ₫</td>
              </tr>
              ${order.discountAmount > 0 ? `
              <tr class="discount-row">
                <td>Voucher giảm giá:</td>
                <td>-${Number(order.discountAmount).toLocaleString("vi-VN")} ₫</td>
              </tr>
              ` : ""}
              <tr>
                <td>Phí vận chuyển:</td>
                <td>Miễn phí</td>
              </tr>
              <tr>
                <td>Thuế VAT (10%):</td>
                <td>Đã bao gồm</td>
              </tr>
              <tr class="grand-total-row">
                <td>Tổng cộng thanh toán:</td>
                <td>${Number(order.totalPrice || 0).toLocaleString("vi-VN")} ₫</td>
              </tr>
            </table>
          </div>

          <!-- Stamp Decoration -->
          <div class="stamp-container">
            <div class="stamp ${order.paymentStatus === "paid" ? "stamp-paid" : "stamp-unpaid"}">
              <div class="stamp-inner">
                <strong>${order.paymentStatus === "paid" ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}</strong>
                <span style="font-size: 8px; font-weight: 600; margin-top: 3px;">TIENTECH TECH</span>
                <span style="font-size: 7px; color: #64748b; margin-top: 1px;">${new Date().toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>

          <!-- Signatures -->
          <div class="signature-section">
            <div class="signature-box">
              <strong style="color: #0f172a;">Người mua hàng</strong><br/>
              <em>(Ký, ghi rõ họ tên)</em>
              <div style="margin-top: 60px; font-weight: bold; font-size: 13px;">
                ${order.receiverName || order.user?.username || ""}
              </div>
            </div>
            <div class="signature-box">
              <strong style="color: #0f172a;">Người lập hóa đơn</strong><br/>
              <em>(Ký, ghi rõ họ tên)</em>
              <div style="margin-top: 60px; font-weight: bold; font-size: 13px; color: #2563eb;">
                Hệ thống TienTech
              </div>
            </div>
          </div>

          <div class="footer-note">
            <p style="margin: 0 0 5px 0;">Cảm ơn quý khách đã mua sắm tại <strong>TienTech</strong>!</p>
            <p style="margin: 0;">Mọi thắc mắc về hóa đơn, vui lòng liên hệ hotline: <strong>1900-1234</strong> hoặc gửi email tới <strong>support@tientech.com</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;

  doc.write(invoiceHTML);
  doc.close();

  // Wait for the content to fully load inside the iframe, then print
  iframe.contentWindow.focus();
  iframe.contentWindow.print();

  // Remove the iframe after printing
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1500);
};
