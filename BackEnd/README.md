<div align="center">

  <!-- Logo Header -->
  <a href="https://github.com/Nguyen-Trung-Tien/Project-App">
    <img src="../FrontEnd/src/assets/logo.svg" alt="TIENTECH Logo" width="240" style="margin-bottom: 15px;" />
  </a>

  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:339933,100:000000&height=150&section=header&text=⚡%20TIENTECH%20BACKEND&fontSize=40&fontColor=fff&animation=fadeIn" width="100%" />

  <p>
    <b>Hệ thống API mạnh mẽ cho hệ sinh thái thương mại điện tử TIENTECH Shop</b><br/>
    Xây dựng với <b>Node.js 22</b>, <b>Express 5</b>, <b>Sequelize</b>, và <b>AI Integration</b>.
  </p>

</div>

---

## 🚀 Tổng quan

Backend của TIENTECH đóng vai trò là "bộ não" của toàn bộ hệ thống, xử lý từ logic nghiệp vụ TMĐT phức tạp đến các tác vụ Trí tuệ nhân tạo (AI) tiên tiến. Hệ thống được xây dựng theo mô hình **Service-Repository** giúp code dễ đọc, dễ test và bảo trì.

### Công nghệ lõi
- **Runtime:** Node.js 22 (LTS)
- **Framework:** Express 5.x (Next-gen Express)
- **Database:** MySQL 8.0 (Quản lý dữ liệu quan hệ)
- **ORM:** Sequelize 6.x (Quản lý Schema và Migrations)
- **Caching:** Redis (Tối ưu truy xuất dữ liệu sản phẩm)
- **Real-time:** Socket.IO (Thông báo đơn hàng & trạng thái)
- **Validation:** Zod & Express Validator
- **Security:** JWT, Passport.js (Google OAuth), bcryptjs, Rate Limiting

---

## 🤖 AI Ecosystem Integration

Backend tích hợp sâu với các mô hình AI hàng đầu để mang lại các tính năng đột phá:

- **Gemini AI (Google):** Sử dụng cho tư vấn phong thuỷ, phân tích kinh doanh (Admin Insights) và hỗ trợ trả lời chatbot.
- **OpenAI (GPT):** Hỗ trợ xử lý ngôn ngữ tự nhiên trong chatbot và các tác vụ hiểu ngữ cảnh người dùng.
- **Vision AI:** Xử lý tìm kiếm bằng hình ảnh (Visual Search).
- **Predictive Analytics:** Thuật toán dự đoán biến động giá sản phẩm.

---

## 🛠 Tính năng chính

- **Quản lý Đơn hàng:** Quy trình tự động từ khi đặt hàng đến khi thanh toán và giao hàng.
- **Thanh toán:** Tích hợp cổng thanh toán nội địa **VNPay** và quốc tế **PayPal**.
- **Quản lý Voucher:** Hệ thống mã giảm giá linh hoạt (theo %, theo số tiền, giới hạn số lượng).
- **Flash Sale:** Cơ chế tự động kích hoạt và kết thúc sự kiện giảm giá thông qua **Cron Jobs**.
- **Thông báo:** Hệ thống thông báo đẩy real-time cho cả người dùng và quản trị viên.
- **Bảo mật:** Cơ chế Refresh Token giúp duy trì phiên đăng nhập an toàn, phân quyền RBAC (Admin/User).

---

## 📂 Cấu trúc thư mục

```text
src/
├── 📁 config/          # Cấu hình kết nối DB, Redis, Cloudinary, Passport
├── 📁 controller/      # Tiếp nhận Request, điều phối Logic và trả về Response
├── 📁 services/        # Nơi xử lý Business Logic chính (Nghiệp vụ TMĐT & AI)
├── 📁 models/          # Định nghĩa cấu trúc các bảng trong Database (Sequelize)
├── 📁 routers/         # Định nghĩa các Route API (v1)
├── 📁 middleware/      # Kiểm tra Auth, phân quyền, validate dữ liệu đầu vào
├── 📁 cron/            # Các tác vụ chạy ngầm định kỳ (Flash sale, đơn hàng hết hạn)
├── 📁 utils/           # Các hàm bổ trợ (Gửi mail, format data, AI helpers)
└── service.js          # File khởi tạo Server Express và Socket.IO
```

---

## ⚡ Cài đặt nhanh

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường
Sao chép `.env.example` thành `.env` và điền đầy đủ các thông tin:
- Database credentials (MySQL)
- API Keys (Google Gemini, OpenAI, Cloudinary)
- Payment Keys (VNPay, PayPal)
- JWT Secret keys

### 3. Khởi tạo Database
```bash
# Chạy migration để tạo bảng
npx sequelize-cli db:migrate

# (Tùy chọn) Chạy seed để có dữ liệu mẫu
npx sequelize-cli db:seed:all
```

### 4. Chạy Server
```bash
# Chế độ Development (với Nodemon)
npm run dev

# Chế độ Production
npm run start:prod
```

---

## 🧪 Testing
```bash
# Chạy các bản kiểm thử tự động với Jest
npm test
```

---

<div align="center">
  <p>Tự hào được xây dựng bởi đội ngũ <b>TIENTECH</b></p>
</div>
