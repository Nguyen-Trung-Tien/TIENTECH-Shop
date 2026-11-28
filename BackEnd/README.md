<div align="center">

  <!-- Logo Header -->
  <a href="https://github.com/Nguyen-Trung-Tien/Project-App">
    <img src="../FrontEnd/src/assets/logo.svg" alt="TIENTECH Logo" width="240" style="margin-bottom: 15px;" />
  </a>

  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:339933,100:000000&height=150&section=header&text=⚡%20TIENTECH%20BACKEND&fontSize=40&fontColor=fff&animation=fadeIn" width="100%" />

  <p>
    <b>Hệ thống API cho hệ sinh thái thương mại điện tử TIENTECH Shop</b><br/>
    Xây dựng với <b>Node.js 22</b>, <b>Express 5</b>, <b>Sequelize</b>, <b>Redis</b> và <b>Google Gemini (@google/genai)</b>.
  </p>

</div>

---

## Tổng quan

Backend của TIENTECH được tổ chức theo kiến trúc 4 tầng (**Router → Controller → Service → Model/Repository**), bảo đảm toàn vẹn giao dịch qua Sequelize Transactions và sẵn sàng mở rộng ngang với Redis + Socket.IO Adapter.

### Công nghệ lõi

- **Runtime:** Node.js 22 (LTS)
- **Framework:** Express 5.x
- **Database:** MySQL 8.0 / TiDB Cloud Serverless
- **ORM:** Sequelize 6.x (Idempotent Migrations & Seeders)
- **Caching & Scaling:** Redis v5 (`node-redis`), `@socket.io/redis-adapter`, Distributed Locks
- **Real-time:** Socket.IO 4.x
- **Validation:** Zod v4
- **Security:** JWT (Access/Refresh + Token Versioning + Blacklist), Passport.js (Google OAuth), bcryptjs, CSRF & Rate Limiting

---

## Hệ sinh thái AI (Google Gemini)

- **Official SDK:** `@google/genai` (`gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-embedding-2`)
- **AI ChatBot & Setup Advisor:** Trợ lý mua sắm RAG + tư vấn màu sắc hợp mệnh (`FengShuiService`).
- **Visual & Semantic Search:** Tìm kiếm bằng hình ảnh và ngữ nghĩa.
- **Analytics & Forecasting:** Phân tích kinh doanh (`AdminAIService`), dự báo doanh thu & biến động giá.

---

## 📂 Cấu trúc thư mục

```text
src/
├── 📁 config/          # DB, Redis, Gemini, Cloudinary, Passport, CORS
├── 📁 controllers/     # Tiếp nhận Request, gọi Service và trả response chuẩn
├── 📁 services/        # Business Logic (Order, Product, Payment, AI, System, Common)
├── 📁 repositories/    # Truy vấn dữ liệu tối ưu
├── 📁 models/          # Định nghĩa Sequelize Models & Associations
├── 📁 migrations/      # Database Migrations theo thứ tự FK & idempotent
├── 📁 routes/          # Định nghĩa API Routes (/api/v1/*)
├── 📁 middleware/      # Auth, RBAC, Zod Validation, Idempotency, Rate Limiter
├── 📁 cron/            # Tác vụ định kỳ có distributed lock (Order, Inventory)
├── 📁 utils/           # Helpers (JWT, Migrations, Loyalty, Controller, Email)
└── server.js           # Khởi tạo HTTP Server, Socket.IO & Graceful Shutdown
```

---

## Cài đặt & Chạy (Monorepo Root)

```bash
# 1. Cài đặt dependencies từ thư mục gốc monorepo
npm install

# 2. Chạy database migrations & seeders
cd BackEnd
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# 3. Chạy server / kiểm thử / lint
npm run dev
npm run lint
npm test
```
