<div align="center">

  <!-- Hero Banner -->
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:667eea,100:764ba2&height=220&section=header&text=🛒%20TIENTECH%20Shop&fontSize=42&fontColor=fff&animation=fadeIn&fontAlignY=35&desc=Premium%20E-Commerce%20Platform&descSize=18&descAlignY=55&descAlign=50" width="100%" />

  <br />

  <p>
    <img src="https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  </p>

  <p>
    <img src="https://img.shields.io/github/repo-size/Nguyen-Trung-Tien/Project-App?style=flat-square&color=orange" alt="Repo Size" />
    <img src="https://img.shields.io/github/issues/Nguyen-Trung-Tien/Project-App?style=flat-square&color=red" alt="Open Issues" />
    <img src="https://img.shields.io/github/last-commit/Nguyen-Trung-Tien/Project-App?style=flat-square&color=green" alt="Last Commit" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  </p>

  <p>
    <b>Nền tảng Thương mại điện tử Full-stack</b> — giải pháp mua sắm trực tuyến hiện đại<br/>
    tích hợp <b>AI Chatbot</b>, thanh toán <b>VNPay / PayPal</b>, và quản trị toàn diện.
  </p>

  <p>
    <a href="https://github.com/Nguyen-Trung-Tien/Project-App"><strong>📖 Xem Tài liệu »</strong></a>
    &nbsp;&nbsp;•&nbsp;&nbsp;
    <a href="https://github.com/Nguyen-Trung-Tien/Project-App/issues">🐛 Báo lỗi</a>
    &nbsp;&nbsp;•&nbsp;&nbsp;
    <a href="https://github.com/Nguyen-Trung-Tien/Project-App/issues">💡 Yêu cầu tính năng</a>
  </p>

</div>

---

## 📋 Mục lục

<details>
<summary>Nhấn để mở rộng</summary>

- [Giới thiệu](#-giới-thiệu)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Tính năng chi tiết](#-tính-năng-chi-tiết)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cơ sở dữ liệu (ERD)](#-cơ-sở-dữ-liệu-erd)
- [Cài đặt & Triển khai](#-cài-đặt--triển-khai)
- [Biến môi trường](#-biến-môi-trường)
- [API Reference](#-api-reference)
- [WebSocket Events](#-websocket-events)
- [Testing](#-testing)
- [Ảnh chụp màn hình](#-ảnh-chụp-màn-hình)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)
- [Liên hệ](#-liên-hệ)

</details>

---

## 🚀 Giới thiệu

**TIENTECH ** là hệ thống thương mại điện tử hoàn chỉnh (Full-stack E-Commerce), mô phỏng toàn bộ quy trình mua sắm trực tuyến — từ giao diện khách hàng (Storefront) cho đến bảng quản trị viên (Admin Dashboard).

### Điểm nổi bật

|     | Tính năng                     | Mô tả                                                                            |
| --- | ----------------------------- | -------------------------------------------------------------------------------- |
| 🤖  | **AI-Powered**                | Chatbot tư vấn sản phẩm tích hợp OpenAI & Gemini, dự đoán giá, tư vấn phong thuỷ |
| 💳  | **Đa phương thức thanh toán** | COD, VNPay, PayPal — hỗ trợ cả nội địa lẫn quốc tế                               |
| ⚡  | **Real-time**                 | Thông báo đơn hàng & cập nhật trạng thái tức thời qua Socket.IO                  |
| 🔒  | **Bảo mật**                   | JWT (Access + Refresh Token), Google OAuth 2.0, Rate Limiting, RBAC              |
| 🎯  | **Flash Sale**                | Hệ thống khuyến mãi flash sale tự động tắt khi hết hạn (Cron job)                |
| 🌙  | **Dark Mode**                 | Giao diện hỗ trợ chuyển đổi Light / Dark theme                                   |
| ☁️  | **Cloud Storage**             | Quản lý hình ảnh sản phẩm & avatar qua Cloudinary                                |

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │   🛍 Storefront (SPA)   │  │  📊 Admin Dashboard (SPA)    │  │
│  │  React 19 + Vite + Redux│  │  React 19 + Recharts + TW    │  │
│  └────────────┬────────────┘  └──────────────┬───────────────┘  │
│               │         Axios / Socket.IO    │                  │
└───────────────┼──────────────────────────────┼──────────────────┘
                │              ▼               │
┌───────────────┼──────────────────────────────┼──────────────────┐
│               ▼      API GATEWAY (REST)      ▼                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Express 5 + Socket.IO Server                │   │
│  │   ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐    │   │
│  │   │  Auth  │ │ Products │ │  Orders  │ │  Payments  │    │   │
│  │   │Middleware│ │Controller│ │Controller│ │ Controlle│    │   │
│  │   └────┬───┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘    │   │
│  │        ▼          ▼            ▼              ▼          │   │
│  │   ┌──────────────────────────────────────────────────┐   │   │
│  │   │              Service Layer (Business Logic)      │   │   │
│  │   └───────────────────────┬──────────────────────────┘   │   │
│  └───────────────────────────┼──────────────────────────────┘   │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Sequelize ORM + MySQL Database                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │  Cloudinary  │  │  VNPay API   │  │  OpenAI / Gemini   │     │
│  │  (Images)    │  │  (Payment)   │  │  (AI Chatbot)      │     │
│  └──────────────┘  └──────────────┘  └────────────────────┘     │
│                        BACKEND SERVER                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Công nghệ sử dụng

### Frontend

| Công nghệ                                                                                                                            | Phiên bản | Vai trò                  |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------------------------ |
| ![React](https://img.shields.io/badge/React-20232a?style=flat-square&logo=react&logoColor=61DAFB) React                              | 19.2      | UI Library               |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) Vite                                   | 7.x       | Build tool & Dev server  |
| ![Redux](https://img.shields.io/badge/Redux-593d88?style=flat-square&logo=redux&logoColor=white) Redux Toolkit                       | 2.9       | State Management         |
| ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) TailwindCSS       | 4.2       | Utility-first CSS        |
| ![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) Framer Motion             | 12.x      | Animations               |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white) React Router   | 7.x       | Client-side routing      |
| ![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=flat-square&logo=chart.js&logoColor=white) Recharts                   | 3.x       | Admin charts & analytics |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) Axios                               | 1.x       | HTTP Client              |
| ![Socket.IO](https://img.shields.io/badge/Socket.IO_Client-010101?style=flat-square&logo=socket.io&logoColor=white) Socket.IO Client | 4.8       | Real-time communication  |
| ![SASS](https://img.shields.io/badge/SASS-CC6699?style=flat-square&logo=sass&logoColor=white) SASS                                   | 1.x       | CSS Preprocessor         |

### Backend

| Công nghệ                                                                                                                  | Phiên bản | Vai trò              |
| -------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------- |
| ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white) Node.js              | 22+       | Runtime              |
| ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) Express             | 5.1       | Web framework        |
| ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=flat-square&logo=sequelize&logoColor=white) Sequelize     | 6.x       | ORM                  |
| ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat-square&logo=mysql&logoColor=white) MySQL                     | 8.x       | Database             |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white) JWT                 | —         | Authentication       |
| ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white) Socket.IO     | 4.8       | Real-time events     |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white) Cloudinary | 2.8       | Image hosting        |
| ![Passport](https://img.shields.io/badge/Passport.js-34E27A?style=flat-square&logo=passport&logoColor=white) Passport.js   | 0.7       | Google OAuth 2.0     |
| ![Nodemailer](https://img.shields.io/badge/Nodemailer-339933?style=flat-square&logo=gmail&logoColor=white) Nodemailer      | 7.x       | Transactional emails |

### AI & Payment

| Công nghệ                                                                                                         | Vai trò                 |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------- |
| ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white) OpenAI API    | AI Chatbot, dự đoán giá |
| ![Google](https://img.shields.io/badge/Gemini-4285F4?style=flat-square&logo=google&logoColor=white) Google Gemini | AI tư vấn phong thuỷ    |
| ![VNPay](https://img.shields.io/badge/VNPay-0060AF?style=flat-square&logoColor=white) VNPay                       | Thanh toán nội địa      |
| ![PayPal](https://img.shields.io/badge/PayPal-003087?style=flat-square&logo=paypal&logoColor=white) PayPal        | Thanh toán quốc tế      |

### DevOps & Testing

| Công nghệ                                                                                                      | Vai trò                 |
| -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| ![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white) Jest             | Unit testing            |
| ![Supertest](https://img.shields.io/badge/Supertest-009688?style=flat-square&logoColor=white) Supertest        | API integration testing |
| ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) ESLint     | Code linting            |
| ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=flat-square&logo=nodemon&logoColor=white) Nodemon | Auto-restart dev server |

---

## ✨ Tính năng chi tiết

### 🛍 Phân hệ Khách hàng (Storefront)

<table>
<tr>
<td width="50%">

**🔐 Xác thực & Tài khoản**

- Đăng ký / Đăng nhập (Email & Password)
- Đăng nhập nhanh Google OAuth 2.0
- Xác minh email qua OTP
- Quên mật khẩu / Đặt lại mật khẩu
- Quản lý hồ sơ & avatar
- Quản lý sổ địa chỉ giao hàng

</td>
<td width="50%">

**🔍 Tìm kiếm & Duyệt sản phẩm**

- Tìm kiếm thông minh với gợi ý từ khóa
- Lọc theo danh mục, thương hiệu, giá
- Sản phẩm giảm giá & Flash Sale
- Chi tiết sản phẩm (biến thể, gallery ảnh)
- Sản phẩm gợi ý & liên quan
- Gợi ý sản phẩm phong thuỷ theo tuổi

</td>
</tr>
<tr>
<td width="50%">

**🛒 Giỏ hàng & Thanh toán**

- Thêm / Cập nhật / Xóa sản phẩm trong giỏ
- Chọn biến thể sản phẩm (màu sắc, dung lượng...)
- Áp mã giảm giá Voucher
- Thanh toán COD / VNPay / PayPal
- Trang xác nhận thành công / thất bại

</td>
<td width="50%">

**📦 Đơn hàng & Tương tác**

- Theo dõi trạng thái đơn hàng real-time
- Lịch sử mua hàng chi tiết
- Đánh giá sản phẩm (kèm ảnh)
- Danh sách yêu thích (Wishlist)
- Nhận thông báo đẩy qua Socket.IO
- AI Chatbot tư vấn mua sắm

</td>
</tr>
</table>

### 📊 Phân hệ Quản trị (Admin Dashboard)

<table>
<tr>
<td width="50%">

**📈 Dashboard & Thống kê**

- Tổng quan doanh thu, đơn hàng, khách hàng
- Biểu đồ doanh thu theo thời gian (Recharts)
- AI Insights — phân tích xu hướng kinh doanh
- Thống kê thanh toán & hoàn tiền

</td>
<td width="50%">

**📦 Quản lý Sản phẩm**

- CRUD sản phẩm (kèm gallery ảnh Cloudinary)
- Quản lý biến thể sản phẩm
- Quản lý danh mục & thương hiệu
- Thiết lập Flash Sale & giảm giá

</td>
</tr>
<tr>
<td width="50%">

**🚚 Quản lý Đơn hàng**

- Duyệt & cập nhật trạng thái đơn
- Quản lý đơn hoàn trả & huỷ
- Xử lý thanh toán & hoàn tiền
- Thông báo real-time khi có đơn mới

</td>
<td width="50%">

**👥 Quản lý Người dùng & Khuyến mãi**

- CRUD người dùng & phân quyền
- Quản lý đánh giá sản phẩm
- Tạo & quản lý mã Voucher
- Xuất báo cáo Excel (ExcelJS)

</td>
</tr>
</table>

---

## 📂 Cấu trúc dự án

```
Project-App/
│
├── 📁 BackEnd/                          # ── Express API Server ──
│   ├── .env.example                     # Mẫu biến môi trường
│   ├── .sequelizerc                     # Cấu hình Sequelize CLI
│   ├── package.json
│   └── 📁 src/
│       ├── service.js                   # ★ Entry point (Express + Socket.IO)
│       │
│       ├── 📁 config/
│       │   ├── cloudinaryConfig.js      # Cấu hình Cloudinary SDK
│       │   ├── config.js               # DB config (development/test/production)
│       │   ├── connectDB.js            # Kết nối MySQL qua Sequelize
│       │   └── passport.js             # Cấu hình Google OAuth 2.0
│       │
│       ├── 📁 middleware/
│       │   └── authMiddleware.js        # JWT verify + Role-based access control
│       │
│       ├── 📁 models/                   # Sequelize Models (20 models)
│       │   ├── user.js                  # Người dùng
│       │   ├── product.js              # Sản phẩm
│       │   ├── productvariant.js       # Biến thể sản phẩm
│       │   ├── productimage.js         # Ảnh sản phẩm
│       │   ├── category.js             # Danh mục
│       │   ├── brand.js                # Thương hiệu
│       │   ├── cart.js / cartItem.js   # Giỏ hàng
│       │   ├── order.js / orderItem.js # Đơn hàng
│       │   ├── payment.js              # Thanh toán
│       │   ├── review.js              # Đánh giá
│       │   ├── voucher.js             # Mã giảm giá
│       │   ├── wishlist.js            # Yêu thích
│       │   ├── notification.js        # Thông báo
│       │   └── ...
│       │
│       ├── 📁 controller/              # Request handlers (20 controllers)
│       │   ├── UserController.js
│       │   ├── ProductController.js
│       │   ├── OrderController.js
│       │   ├── chatController.js        # AI Chatbot (OpenAI)
│       │   ├── fengShuiChatController.js # Tư vấn phong thuỷ (Gemini)
│       │   ├── pricePredictorController.js # Dự đoán giá
│       │   ├── VNpay.js                # Xử lý thanh toán VNPay
│       │   └── ...
│       │
│       ├── 📁 services/                 # Business logic layer (20 services)
│       │   ├── UserService.js
│       │   ├── ProductService.js        # Bao gồm Flash Sale cron
│       │   ├── OrderService.js
│       │   ├── PaymentService.js
│       │   ├── VoucherService.js
│       │   ├── AdminAIService.js        # AI insights cho admin
│       │   ├── sendEmail.js             # Gửi email (xác nhận, OTP, ...)
│       │   ├── jwtService.js            # JWT token utilities
│       │   └── ...
│       │
│       ├── 📁 routers/                  # Express route definitions
│       │   ├── index.js                 # ★ Route aggregator (19 route modules)
│       │   ├── UserRouter.js
│       │   ├── ProductRoutes.js
│       │   ├── OrderRouter.js
│       │   ├── PaymentRouter.js
│       │   ├── VNpayRouter.js
│       │   ├── chatRoutes.js
│       │   ├── VoucherRouter.js
│       │   └── ...
│       │
│       ├── 📁 migrations/              # Sequelize migrations (19 files)
│       │
│       └── 📁 utils/
│           ├── fortuneUtils.js          # Tiện ích tính phong thuỷ
│           └── paginationHelper.js      # Phân trang
│
├── 📁 FrontEnd/                         # ── React SPA Client ──
│   ├── index.html                       # HTML entry
│   ├── vite.config.js                   # Vite configuration
│   ├── tailwind.config.js              # TailwindCSS config
│   ├── eslint.config.js               # ESLint config
│   ├── package.json
│   └── 📁 src/
│       ├── App.jsx                      # ★ Root component + Auth check
│       ├── main.jsx                     # React DOM mount + Redux Provider
│       ├── tailwind.css                # Global styles
│       │
│       ├── 📁 api/                      # API client modules (17 files)
│       │   ├── userApi.jsx
│       │   ├── productApi.jsx
│       │   ├── cartApi.jsx
│       │   ├── orderApi.jsx
│       │   ├── chatApi.jsx
│       │   ├── voucherApi.jsx
│       │   └── ...
│       │
│       ├── 📁 redux/                    # Redux Toolkit store
│       │   ├── store.js                 # Store config + Redux Persist
│       │   ├── userSlice.js
│       │   ├── cartSlice.js
│       │   ├── productSlice.js
│       │   └── checkoutSlice.js
│       │
│       ├── 📁 routes/                   # Route definitions
│       │   ├── UserRoutes.jsx           # 21 trang khách hàng
│       │   ├── AdminRoutes.jsx          # 14 trang quản trị
│       │   ├── PrivateRoute.jsx         # Auth guard + Role check
│       │   ├── PublicRoute.jsx
│       │   └── PublicRouteAdmin.jsx
│       │
│       ├── 📁 hooks/                    # Custom React hooks
│       │   ├── useCart.js
│       │   ├── useProductDetail.js
│       │   ├── useProductList.js
│       │   ├── useProductVariants.js
│       │   └── useUser.js
│       │
│       ├── 📁 pages/                    # Page components (21 pages)
│       │   ├── HomePage/
│       │   ├── LoginPage/ & RegisterPage/
│       │   ├── ProductDetailPage/ & ProductListPage/
│       │   ├── CartPage/ & CheckoutPage/
│       │   ├── OrderPage/ & OrderDetail/ & OrdersHistory/
│       │   ├── Profile/ & WishlistPage/
│       │   ├── Notifications/
│       │   └── AboutPage/
│       │
│       ├── 📁 components/               # Reusable components (29 components)
│       │   ├── HeaderComponent/         # Navbar + Search + Cart icon
│       │   ├── FooterComponent/
│       │   ├── LayoutComponent/         # Page layout wrapper
│       │   ├── ProductCard/
│       │   ├── ProductDetail/
│       │   ├── ProductFilter/
│       │   ├── ChatBot/                 # AI Chatbot widget
│       │   ├── FlashSale/
│       │   ├── FortuneProducts/         # Gợi ý phong thuỷ
│       │   ├── PricePredictionModal/    # Dự đoán giá
│       │   ├── ReviewComponent/
│       │   ├── Loading/ & skeletons/    # Loading states
│       │   └── ...
│       │
│       ├── 📁 Admin/                    # Admin Dashboard module
│       │   ├── AdminLayout.jsx          # Sidebar + Header layout
│       │   ├── 📁 components/
│       │   │   ├── SidebarComponent/
│       │   │   ├── HeaderAdminComponent/
│       │   │   ├── StatsCardComponent/
│       │   │   ├── ChartCardComponent/
│       │   │   └── AIInsightsWidget/
│       │   └── 📁 pages/               # 12 trang quản trị
│       │       ├── Dashboard/
│       │       ├── ProductManage/
│       │       ├── OrderManage/
│       │       ├── UserManage/
│       │       ├── Revenue/
│       │       ├── Categories/
│       │       ├── BrandManage/
│       │       ├── VoucherManage/
│       │       ├── Payment/
│       │       ├── ReviewPage/
│       │       └── OrdersReturnPage/
│       │
│       ├── 📁 assets/                   # Static assets (images, icons)
│       └── 📁 utils/                    # Frontend utilities
│
└── README.md                            # ★ Bạn đang đọc file này
```

---

## 🗄 Cơ sở dữ liệu (ERD)

Hệ thống bao gồm **20 bảng** được quản lý bởi Sequelize ORM:

```
┌───────────┐     ┌──────────────┐     ┌──────────────┐
│   Users   │────<│   Orders     │────<│ OrderItems   │
│           │     │              │     │              │
│ id        │     │ id           │     │ id           │
│ email     │     │ userId       │     │ orderId      │
│ password  │     │ totalAmount  │     │ productId    │
│ role      │     │ status       │     │ quantity     │
│ avatar    │     │ shippingAddr │     │ price        │
└─────┬─────┘     └──────┬───────┘     └──────────────┘
      │                  │
      │           ┌──────┴───────┐     ┌──────────────┐
      │           │  Payments    │     │  Categories  │
      │           │              │     │              │
      │           │ orderId      │     │ id           │
      │           │ method       │     │ name         │
      │           │ status       │     │ image        │
      │           └──────────────┘     └──────┬───────┘
      │                                       │
┌─────┴─────┐     ┌──────────────┐     ┌──────┴───────┐
│UserAddress│     │   Reviews    │────>│  Products    │
│           │     │              │     │              │
│ userId    │     │ userId       │     │ id           │
│ address   │     │ productId    │     │ name / slug  │
│ phone     │     │ rating       │     │ categoryId   │
│ isDefault │     │ comment      │     │ brandId      │
└───────────┘     └──────────────┘     │ price        │
                                       │ discount     │
┌───────────┐     ┌──────────────┐     │ stock        │
│   Carts   │────<│  CartItems   │     └──────┬───────┘
│           │     │              │            │
│ userId    │     │ cartId       │     ┌──────┴───────┐
│           │     │ productId    │     │ProductVariant│
└───────────┘     │ variantId    │     │ ProductImage │
                  │ quantity     │     │ Brands       │
                  └──────────────┘     └──────────────┘

Bảng phụ: Voucher, VoucherUsage, Wishlist, Notification, ReviewReply, ReviewImage
```

<details>
<summary>📸 Xem sơ đồ ERD đầy đủ</summary>

<img width="100%" alt="ERD Diagram" src="https://github.com/user-attachments/assets/458ef7a0-d078-48a6-9ec2-8b9b6de5abda" />

</details>

---

## ⚡ Cài đặt & Triển khai

### Yêu cầu hệ thống

| Phần mềm     | Phiên bản tối thiểu |
| ------------ | ------------------- |
| Node.js      | >= 22.x             |
| npm          | >= 10.x             |
| MySQL Server | >= 8.0              |
| Git          | >= 2.x              |

### Bước 1 — Clone dự án

```bash
git clone https://github.com/Nguyen-Trung-Tien/Project-App.git
cd Project-App
```

### Bước 2 — Cài đặt Backend

```bash
cd BackEnd
npm install

# Sao chép và cấu hình biến môi trường
cp .env.example .env
# → Chỉnh sửa file .env theo hướng dẫn bên dưới

# Chạy migration tạo bảng
npx sequelize-cli db:migrate

# Khởi động server (development)
npm run dev
```

> ✅ Backend chạy tại **http://localhost:8080**

### Bước 3 — Cài đặt Frontend

```bash
cd ../FrontEnd
npm install

# Sao chép và cấu hình biến môi trường
cp .env.example .env
# → Chỉnh sửa file .env

# Khởi động dev server
npm run dev
```

> ✅ Frontend chạy tại **http://localhost:5173**

### Bước 4 — Tạo cơ sở dữ liệu

```sql
-- Kết nối MySQL và tạo database
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🔐 Biến môi trường

### Backend (`BackEnd/.env`)

```env
# ═══════════════════════════════════════
# Server
# ═══════════════════════════════════════
PORT=8080
NODE_ENV=development
URL_REACT=http://localhost:5173/
FRONTEND_URL=http://localhost:5173

# ═══════════════════════════════════════
# Database (MySQL)
# ═══════════════════════════════════════
DB_DATABASE_NAME=ecommerce_db
DB_USERNAME=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

# ═══════════════════════════════════════
# Authentication (JWT)
# ═══════════════════════════════════════
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# ═══════════════════════════════════════
# Google OAuth 2.0
# ═══════════════════════════════════════
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ═══════════════════════════════════════
# Cloudinary (Image Upload)
# ═══════════════════════════════════════
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ═══════════════════════════════════════
# Email (Nodemailer)
# ═══════════════════════════════════════
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ═══════════════════════════════════════
# VNPay Payment Gateway
# ═══════════════════════════════════════
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_TMN_CODE=your_terminal_code
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:8080/api/v1/vnpay/return

# ═══════════════════════════════════════
# AI Services
# ═══════════════════════════════════════
OPENAI_API_KEY=your_openai_key
```

### Frontend (`FrontEnd/.env`)

```env
URL_BACKEND=http://localhost:8080
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_PAYPAL_CURRENCY=USD
```

---

## 🔌 API Reference

> Base URL: `http://localhost:8080/api/v1`

### 🔐 Authentication & Users

| Method   | Endpoint                | Auth | Mô tả                        |
| -------- | ----------------------- | ---- | ---------------------------- |
| `POST`   | `/user/login`           | ❌   | Đăng nhập (email + password) |
| `POST`   | `/user/create-new-user` | ❌   | Đăng ký tài khoản mới        |
| `GET`    | `/user/auth/google`     | ❌   | Đăng nhập qua Google OAuth   |
| `POST`   | `/user/refresh-token`   | ❌   | Làm mới access token         |
| `GET`    | `/user/me`              | 🔑   | Lấy thông tin user hiện tại  |
| `PUT`    | `/user/update-user`     | 🔑   | Cập nhật hồ sơ (kèm avatar)  |
| `PUT`    | `/user/change-password` | 🔑   | Đổi mật khẩu                 |
| `POST`   | `/user/forgot-password` | ❌   | Gửi email đặt lại mật khẩu   |
| `POST`   | `/user/verify-email`    | ❌   | Xác minh email qua OTP       |
| `POST`   | `/user/logout`          | ❌   | Đăng xuất                    |
| `GET`    | `/user/get-all-user`    | 🛡️   | [Admin] Danh sách người dùng |
| `DELETE` | `/user/delete/:id`      | 🛡️   | [Admin] Xoá người dùng       |

### 📦 Products

| Method   | Endpoint                             | Auth | Mô tả                        |
| -------- | ------------------------------------ | ---- | ---------------------------- |
| `GET`    | `/product/get-all-product`           | ❌   | Tất cả sản phẩm (phân trang) |
| `GET`    | `/product/get-product/:id`           | ❌   | Chi tiết sản phẩm theo ID    |
| `GET`    | `/product/get-product-by-slug/:slug` | ❌   | Chi tiết sản phẩm theo slug  |
| `GET`    | `/product/search`                    | ❌   | Tìm kiếm sản phẩm            |
| `GET`    | `/product/search-suggest`            | ❌   | Gợi ý tìm kiếm               |
| `GET`    | `/product/discounted`                | ❌   | Sản phẩm đang giảm giá       |
| `GET`    | `/product/flash-sale`                | ❌   | Sản phẩm Flash Sale          |
| `GET`    | `/product/filter`                    | ❌   | Lọc sản phẩm nâng cao        |
| `GET`    | `/product/recommend/:id`             | ❌   | Sản phẩm gợi ý               |
| `GET`    | `/product/recommend-fortune`         | ❌   | Gợi ý phong thuỷ             |
| `POST`   | `/product/create-new-product`        | 🛡️   | [Admin] Thêm sản phẩm mới    |
| `PUT`    | `/product/update-product/:id`        | 🛡️   | [Admin] Sửa sản phẩm         |
| `DELETE` | `/product/delete-product/:id`        | 🛡️   | [Admin] Xoá sản phẩm         |

### 🛒 Cart

| Method   | Endpoint      | Auth | Mô tả                 |
| -------- | ------------- | ---- | --------------------- |
| `GET`    | `/cart/*`     | 🔑   | Xem giỏ hàng          |
| `POST`   | `/cartItem/*` | 🔑   | Thêm sản phẩm vào giỏ |
| `PUT`    | `/cartItem/*` | 🔑   | Cập nhật số lượng     |
| `DELETE` | `/cartItem/*` | 🔑   | Xoá sản phẩm khỏi giỏ |

### 📋 Orders

| Method   | Endpoint                                | Auth | Mô tả                       |
| -------- | --------------------------------------- | ---- | --------------------------- |
| `POST`   | `/order/create-new-order`               | 🔑   | Tạo đơn hàng mới            |
| `GET`    | `/order/user/:userId`                   | 🔑   | Đơn hàng của user           |
| `GET`    | `/order/active/:userId`                 | 🔑   | Đơn hàng đang xử lý         |
| `GET`    | `/order/get-order/:id`                  | 🔑   | Chi tiết đơn hàng           |
| `GET`    | `/order/get-all-orders`                 | 🛡️   | [Admin] Tất cả đơn hàng     |
| `PUT`    | `/order/update-status-order/:id/status` | 🛡️   | [Admin] Cập nhật trạng thái |
| `DELETE` | `/order/delete-order/:id`               | 🛡️   | [Admin] Xoá đơn hàng        |

### 💳 Payments

| Method | Endpoint                                 | Auth | Mô tả                        |
| ------ | ---------------------------------------- | ---- | ---------------------------- |
| `POST` | `/payment/create-payment`                | 🔑   | Tạo thanh toán               |
| `GET`  | `/payment/get-all-payment`               | 🛡️   | [Admin] Danh sách thanh toán |
| `PUT`  | `/payment/payment-complete/:id/complete` | 🛡️   | [Admin] Xác nhận hoàn tất    |
| `PUT`  | `/payment/payment-refund/:id/refund`     | 🛡️   | [Admin] Hoàn tiền            |

### 🎟️ Vouchers

| Method   | Endpoint              | Auth | Mô tả                  |
| -------- | --------------------- | ---- | ---------------------- |
| `GET`    | `/voucher/active`     | ❌   | Voucher đang hoạt động |
| `POST`   | `/voucher/check`      | ❌   | Kiểm tra mã giảm giá   |
| `POST`   | `/voucher/create`     | 🛡️   | [Admin] Tạo voucher    |
| `PUT`    | `/voucher/update/:id` | 🛡️   | [Admin] Sửa voucher    |
| `DELETE` | `/voucher/delete/:id` | 🛡️   | [Admin] Xoá voucher    |

### 🤖 AI & Chat

| Method | Endpoint         | Auth | Mô tả                      |
| ------ | ---------------- | ---- | -------------------------- |
| `POST` | `/chat/ask`      | ❌   | Hỏi AI Chatbot (OpenAI)    |
| `POST` | `/chat/predict`  | ❌   | Dự đoán giá sản phẩm       |
| `POST` | `/chat/fengshui` | ❌   | Tư vấn phong thuỷ (Gemini) |

### 📍 Others

| Method | Endpoint          | Auth | Mô tả                       |
| ------ | ----------------- | ---- | --------------------------- |
| `*`    | `/address/*`      | 🔑   | CRUD địa chỉ giao hàng      |
| `*`    | `/wishlist/*`     | 🔑   | Danh sách yêu thích         |
| `*`    | `/review/*`       | 🔑   | Đánh giá sản phẩm           |
| `*`    | `/review-reply/*` | 🔑   | Trả lời đánh giá            |
| `*`    | `/notification/*` | 🔑   | Thông báo                   |
| `*`    | `/brand/*`        | 🛡️   | [Admin] Quản lý thương hiệu |
| `*`    | `/category/*`     | 🛡️   | [Admin] Quản lý danh mục    |
| `*`    | `/variant/*`      | 🛡️   | [Admin] Biến thể sản phẩm   |
| `*`    | `/admin/*`        | 🛡️   | [Admin] Thống kê & quản trị |

> **Chú thích:** ❌ Public • 🔑 Yêu cầu đăng nhập • 🛡️ Yêu cầu quyền Admin

---

## 📡 WebSocket Events

Hệ thống sử dụng **Socket.IO** để truyền tải thông báo real-time:

| Event                 | Hướng               | Mô tả                               |
| --------------------- | ------------------- | ----------------------------------- |
| `connection`          | Client → Server     | Kết nối WebSocket                   |
| `join_admin`          | Client → Server     | Admin tham gia phòng nhận thông báo |
| `new_order`           | Server → Admin Room | Thông báo khi có đơn hàng mới       |
| `order_status_update` | Server → Client     | Cập nhật trạng thái đơn hàng        |
| `disconnect`          | Client → Server     | Ngắt kết nối                        |

---

## 🧪 Testing

### Chạy Unit Tests (Backend)

```bash
cd BackEnd

# Chạy toàn bộ test suite
npm test

# Chạy với verbose output
npx jest --verbose --testTimeout=10000
```

> **Lưu ý:** Tests sử dụng `NODE_ENV=test` và bỏ qua kết nối database thật.

### Linting (Frontend)

```bash
cd FrontEnd
npm run lint
```

---

## 🖼 Ảnh chụp màn hình

<details>
<summary>📸 Nhấn để xem ảnh giao diện</summary>

> _Sẽ được cập nhật — bạn có thể chạy dự án tại `http://localhost:5173` để xem trực tiếp._

**Trang chủ** — Giao diện mua sắm hiện đại, hỗ trợ Dark Mode

**Chi tiết sản phẩm** — Gallery ảnh, biến thể, đánh giá

**Giỏ hàng & Thanh toán** — Quy trình mua hàng mượt mà

**Admin Dashboard** — Thống kê doanh thu, quản lý toàn diện

</details>

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy làm theo các bước sau:

1. **Fork** dự án
2. Tạo nhánh mới: `git checkout -b feature/TinhNangMoi`
3. Commit thay đổi: `git commit -m "feat: thêm tính năng XYZ"`
4. Push lên nhánh: `git push origin feature/TinhNangMoi`
5. Mở **Pull Request**

### Quy ước Commit Message

```
feat:     Tính năng mới
fix:      Sửa lỗi
docs:     Cập nhật tài liệu
style:    Format code (không ảnh hưởng logic)
refactor: Tái cấu trúc code
test:     Thêm / sửa test
chore:    Công việc bảo trì
```

---

## 📄 Giấy phép

Dự án được phân phối dưới giấy phép **MIT**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 📞 Liên hệ

<div align="center">

|     | Thông tin                                                                  |
| --- | -------------------------------------------------------------------------- |
| 👤  | **Nguyễn Trung Tiến**                                                      |
| 🐙  | GitHub: [@Nguyen-Trung-Tien](https://github.com/Nguyen-Trung-Tien)         |
| 📧  | Email: [trungtiennguyen910@gmail.com](mailto:trungtiennguyen910@gmail.com) |

</div>

---

<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:667eea,100:764ba2&height=120&section=footer" width="100%" />

  <p>
    ⭐ Nếu dự án hữu ích, hãy cho mình một <b>Star</b> nhé!
  </p>

</div>
