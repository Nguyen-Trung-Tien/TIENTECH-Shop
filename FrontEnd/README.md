<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:61DAFB,100:06B6D4&height=150&section=header&text=✨%20TIENTECH%20FRONTEND&fontSize=40&fontColor=fff&animation=fadeIn" width="100%" />

  <p>
    <b>Giao diện hiện đại cho hệ sinh thái thương mại điện tử TIENTECH Shop</b><br/>
    Xây dựng với <b>React 19</b>, <b>Vite 7</b>, và <b>Tailwind CSS 4</b>.
  </p>

</div>

---

## 🚀 Tổng quan

Frontend của TIENTECH được thiết kế để mang lại trải nghiệm mua sắm mượt mà, tốc độ cao và thân thiện với người dùng. Hệ thống bao gồm hai phân hệ chính: **Storefront (Dành cho khách hàng)** và **Admin Dashboard (Dành cho quản trị viên)**.

### Công nghệ lõi
- **Framework:** React 19 (Latest Stable)
- **Build Tool:** Vite 7 (Hot Module Replacement cực nhanh)
- **State Management:** Redux Toolkit + Redux Persist (Lưu trữ trạng thái đăng nhập & giỏ hàng)
- **Styling:** Tailwind CSS 4 (Engine mới nhất), SASS
- **Animation:** Framer Motion 12 (Hiệu ứng chuyển trang và micro-interactions)
- **Charts:** Recharts (Báo cáo doanh thu cho Admin)
- **Icons:** React Icons, Lucide React, Bootstrap Icons

---

## ✨ Tính năng nổi bật

### 🛍 Storefront (Khách hàng)
- **Giao diện đa chế độ:** Hỗ trợ Light / Dark Mode.
- **AI Chatbot Widget:** Trò chuyện trực tiếp với AI để tìm sản phẩm.
- **Tìm kiếm thông minh:** Gợi ý từ khóa ngay khi gõ và lọc sản phẩm đa năng.
- **Thanh toán linh hoạt:** Tích hợp SDK PayPal và quy trình điều hướng VNPay.
- **Quản lý tài khoản:** Dashboard cá nhân, theo dõi đơn hàng, quản lý địa chỉ.
- **Tư vấn phong thuỷ:** UI riêng biệt để người dùng nhập năm sinh và xem gợi ý.

### 📊 Admin Dashboard (Quản trị)
- **Real-time Analytics:** Biểu đồ doanh thu và tăng trưởng khách hàng.
- **Hệ thống Quản lý (CRUD):** Sản phẩm, Biến thể, Danh mục, Thương hiệu, Đơn hàng, Voucher.
- **AI Business Assistant:** Hiển thị các lời khuyên chiến lược từ AI ngay trên Dashboard.
- **Quản lý Media:** Upload ảnh trực tiếp lên Cloudinary thông qua giao diện kéo thả.

---

## 📂 Cấu trúc thư mục

```text
src/
├── 📁 Admin/           # Giao diện và logic cho Quản trị viên
├── 📁 api/             # Cấu hình Axios và các hàm gọi API
├── 📁 assets/          # Hình ảnh, font, icons tĩnh
├── 📁 components/      # Các UI components tái sử dụng (Header, Footer, Cards...)
├── 📁 config/          # Cấu hình Firebase, Google OAuth, PayPal...
├── 📁 hooks/           # Custom React hooks (useCart, useAuth, useProduct...)
├── 📁 pages/           # Các trang chính của ứng dụng (Home, Product, Cart...)
├── 📁 redux/           # Cấu hình Store, Slices (User, Cart, Checkout)
├── 📁 routes/          # Định nghĩa Route cho User và Admin (Auth Guard)
└── 📁 utils/           # Các hàm tiện ích (Format price, date...)
```

---

## ⚡ Cài đặt nhanh

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```env
VITE_BACKEND_URL=http://localhost:8080
VITE_PAYPAL_CLIENT_ID=your_paypal_id
```

### 3. Chạy môi trường Development
```bash
npm run dev
```

### 4. Build Production
```bash
npm run build
```

---

## 🎨 Quy chuẩn Code
- Sử dụng **Functional Components** và **Hooks**.
- Tuân thủ **ESLint** (Chạy `npm run lint` trước khi commit).
- Đặt tên component theo **PascalCase** (ví dụ: `ProductCard.jsx`).
- Logic gọi API nên được tách riêng vào thư mục `api/`.

---

<div align="center">
  <p>Tự hào được xây dựng bởi đội ngũ <b>TIENTECH</b></p>
</div>
