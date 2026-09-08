# TIENTECH-Shop RESTful API Reference v1

Tài liệu chi tiết toàn bộ các Endpoint API của hệ sinh thái **TIENTECH-Shop**.  
Base URL: `/api/v1`

---

## 1. Authentication & Người dùng (`/user`)

| Method | Endpoint | Quyền (Auth) | Mô tả | Payload tóm tắt |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/user/register` | Public | Đăng ký tài khoản khách hàng | `{ email, password, username, phone }` |
| `POST` | `/user/verify-otp` | Public | Xác thực mã OTP qua email | `{ email, otp }` |
| `POST` | `/user/login` | Public | Đăng nhập tài khoản | `{ email, password }` |
| `POST` | `/user/logout` | Authenticated | Đăng xuất, hủy Access Token (Redis Blacklist) | `{}` |
| `GET` | `/user/get-me` | Authenticated | Lấy thông tin user hiện tại | - |
| `PUT` | `/user/update-me` | Authenticated | Cập nhật hồ sơ cá nhân | `{ username, phone, avatar }` |
| `POST` | `/user/forgot-password` | Public (Rate limit: 5/15m) | Yêu cầu gửi link đổi mật khẩu | `{ email }` |
| `POST` | `/user/reset-password` | Public | Đặt lại mật khẩu mới qua token | `{ token, newPassword }` |
| `POST` | `/user/refresh-token` | Public | Cấp mới Access Token bằng Refresh Token | Gửi cookie `refreshToken` |

---

## 2. Sản phẩm & Danh mục (`/product`, `/category`, `/brand`)

| Method | Endpoint | Quyền (Auth) | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/product/get-all` | Public | Lấy danh sách sản phẩm có lọc, phân trang |
| `GET` | `/product/filter` | Public | Bộ lọc nâng cao: `minPrice`, `maxPrice`, `brandId`, `categoryId`, `ram`, `rom` |
| `GET` | `/product/get-by-slug/:slug`| Public | Lấy chi tiết sản phẩm theo URL slug thân thiện |
| `POST` | `/product/create-new` | Admin | Thêm sản phẩm mới kèm biến thể |
| `PUT` | `/product/update/:id` | Admin | Cập nhật thông tin sản phẩm |
| `DELETE`| `/product/delete/:id` | Admin | Xóa sản phẩm |
| `GET` | `/category/get-all` | Public | Lấy toàn bộ cây danh mục sản phẩm |
| `GET` | `/brand/get-all` | Public | Lấy danh sách thương hiệu chính hãng |

---

## 3. Giỏ hàng (`/cart`, `/cartItem`)

| Method | Endpoint | Quyền (Auth) | Mô tả | Payload tóm tắt |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/cart/get-cart` | Authenticated | Lấy giỏ hàng của user hiện tại | - |
| `POST` | `/cartItem/add-cart-item` | Authenticated | Thêm sản phẩm hoặc biến thể vào giỏ | `{ productId, variantId, quantity }` |
| `PUT` | `/cartItem/update-cart-item/:id`| Authenticated | Cập nhật số lượng sản phẩm trong giỏ | `{ quantity }` |
| `DELETE`| `/cartItem/delete-cart-item/:id`| Authenticated | Xóa sản phẩm khỏi giỏ | - |
| `DELETE`| `/cart/clear` | Authenticated | Xóa trắng giỏ hàng sau khi đặt | - |

---

## 4. Đơn hàng & Quản lý vòng đời (`/order`)

| Method | Endpoint | Quyền (Auth) | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/order/create-new-order` | Customer / Admin | Khởi tạo đơn hàng mới, giữ hàng và áp mã giảm giá |
| `GET` | `/order/user/:userId` | Customer / Admin | Danh sách lịch sử đơn hàng của người dùng |
| `GET` | `/order/get-order/:id` | Customer / Admin | Chi tiết đơn hàng, lịch sử xác nhận, mã bưu vận |
| `PUT` | `/order/update-status-order/:id/status` | Customer / Admin | Cập nhật trạng thái đơn (khách hủy/yêu cầu hủy/nhận hàng, admin duyệt) |
| `POST` | `/order/return-request` | Customer | Gửi yêu cầu trả hàng cho sản phẩm trong đơn (ủy thác `OrderItemService`) |
| `POST` | `/order/return-action` | Admin | Phê duyệt hoặc từ chối yêu cầu trả hàng (ủy thác `OrderItemService`) |
| `POST` | `/order-item/request/:id/request-return` | Customer | Yêu cầu trả hàng trực tiếp theo OrderItem ID (chỉ áp dụng cho đơn của chính mình) |
| `POST` | `/order-item/process/:id/process-return` | Admin | Admin duyệt (`approved`) hoặc từ chối (`rejected`) item đang ở trạng thái `requested` |
| `GET` | `/order/get-all-orders` | Admin | Xem toàn bộ danh sách đơn trên toàn hệ thống |

> **Quy ước tham số khi gọi Hủy đơn hàng (`PUT /order/update-status-order/:id/status`):**
> ```json
> {
>   "status": "cancel_requested",
>   "reason": "Lý do muốn hủy đơn hàng cụ thể của khách"
> }
> ```
> - Nếu đơn hàng ở trạng thái `pending`: Đơn sẽ chuyển ngay sang `cancelled` và hoàn tồn kho.
> - Nếu đơn hàng ở trạng thái `confirmed`, `processing`, `shipping`, `shipped`: Đơn sẽ chuyển sang `cancel_requested` và thông báo tới Admin.
> - Nếu đơn hàng ở trạng thái `delivered`: Khách hàng có thể chuyển sang `completed` (xác nhận nhận hàng).

---

## 5. Thanh toán Cổng điện tử (`/payment`, `/vnpay`)

| Method | Endpoint | Quyền (Auth) | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/payment/create-payment` | Authenticated | Tạo payment pending cho đơn hàng (amount ép buộc từ Order.totalPrice) |
| `POST` | `/vnpay/create-payment-url` | Authenticated | Tạo URL chuyển hướng thanh toán qua cổng VNPay Sandbox/Live |
| `GET` | `/vnpay/vnpay_ipn` | Public | Webhook / IPN đã kiểm tra chữ ký xác nhận thanh toán tự động và lũy thừa |
| `GET` | `/vnpay/vnpay-return` | Public | Return URL nhận kết quả phản hồi từ VNPay cho khách |
| `POST` | `/payment/paypal-capture` | Authenticated | Bắt giao dịch thanh toán thành công qua PayPal SDK |

---

## 6. Trí tuệ Nhân tạo & Chatbot (`/chat`)

| Method | Endpoint | Quyền (Auth) | Mô tả | Payload |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/chat/gemini` | Public / Auth | Chatbot tư vấn thông minh (Gemini Fallback) | `{ message, history }` |
| `POST` | `/chat/visual-search` | Public | Tìm kiếm sản phẩm thông qua ảnh tải lên | `multipart/form-data: image` |
| `POST` | `/chat/price-predict` | Public | Dự báo xu hướng biến động giá sản phẩm tương lai | `{ productId }` |
| `POST` | `/chat/feng-shui` | Public | Tư vấn màu sắc & thiết bị theo năm sinh | `{ birthYear, gender }` |

---

## 7. Cấu hình Hệ thống & Dashboard (`/system-settings`, `/admin`)

| Method | Endpoint | Quyền (Auth) | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/system-settings/public` | Public | Lấy các cấu hình công khai (Tên shop, hotline, bảo trì) |
| `GET` | `/system-settings` | Admin | Lấy toàn bộ thông số cấu hình hệ thống |
| `PUT` | `/system-settings` | Admin | Cập nhật tham số cấu hình (chế độ bảo trì, model AI, email) |
| `GET` | `/system-settings/health` | Admin | Lấy báo cáo trạng thái RAM, CPU, DB latency, Redis status |
| `POST` | `/system-settings/cache/flush` | Admin | Dọn sạch toàn bộ Redis Cache tức thì |
| `GET` | `/admin/dashboard-stats` | Admin | Lấy biểu đồ doanh thu, thống kê sản phẩm, đơn chờ duyệt |
