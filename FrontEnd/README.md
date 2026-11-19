<div align="center">

  <!-- Logo Header -->
  <a href="https://github.com/Nguyen-Trung-Tien/Project-App">
    <img src="src/assets/logo.svg" alt="TIENTECH Logo" width="240" style="margin-bottom: 15px;" />
  </a>

  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:61DAFB,100:06B6D4&height=150&section=header&text=✨%20TIENTECH%20FRONTEND&fontSize=40&fontColor=fff&animation=fadeIn" width="100%" />

  <p>
    <b>Giao diện hiện đại cho hệ sinh thái thương mại điện tử TIENTECH Shop</b><br/>
    Xây dựng với <b>React 19</b>, <b>Vite 7</b>, <b>Tailwind CSS 4</b>, <b>Redux Toolkit</b> và <b>TanStack Query</b>.
  </p>

</div>

---

## 🚀 Tổng quan

Frontend bao gồm **Storefront (Khách hàng)** và **Admin Dashboard (Quản trị viên)**.

### Công nghệ lõi
- **Framework:** React 19
- **Build Tool:** Vite 7
- **State & Data Fetching:** Redux Toolkit + Redux Persist + TanStack React Query
- **Styling:** Tailwind CSS 4 (`@tailwindcss/vite`)
- **Animation:** Framer Motion 12 (`LazyMotion`)
- **Charts:** Recharts
- **Icons:** Lucide React & React Icons

---

## ✨ Tính năng nổi bật

- **Storefront:** Light/Dark Mode, AI Chatbot & Visual Search, Tìm kiếm & Lọc đa tiêu chí, Thanh toán PayPal (Server-side Orders API) & VNPay, Theo dõi đơn hàng & Trả hàng, Tư vấn màu sắc hợp mệnh.
- **Admin Dashboard:** Phân tích doanh thu real-time, Quản lý Sản phẩm/Biến thể/Danh mục/Thương hiệu/Đơn hàng/Voucher/Thanh toán/Liên hệ (CRM Tickets)/Cấu hình hệ thống.

---

## ⚡ Cài đặt & Chạy

```bash
# Cài đặt từ thư mục gốc monorepo
npm install

# Cấu hình biến môi trường trong FrontEnd/.env (tham khảo FrontEnd/.env.example)
# VITE_API_URL=http://localhost:8080/api/v1
# VITE_SOCKET_URL=http://localhost:8080
# VITE_PAYPAL_CLIENT_ID=your_paypal_id

# Chạy dev / lint / test / build
npm run dev:frontend
npm run lint:frontend
npm run test:frontend
npm run build:frontend
```
