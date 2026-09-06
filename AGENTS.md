# Quy Chuẩn Kỹ Thuật Dự Án (Project Engineering Standards & Rules)

> **Áp dụng cho:** Tất cả Kỹ sư phần mềm và AI Coding Agents khi đọc, sửa, thêm mới hoặc refactor mã nguồn trong repository **TIENTECH-Shop**.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

1. **Monorepo Cohesion:** Mọi lệnh kiểm thử (`npm run test`) hoặc kiểm tra linter (`npm run lint`) phải có khả năng chạy thành công từ thư mục gốc của monorepo.
2. **Clean Layered Architecture:**
   - **Routers:** Chỉ khai báo đường dẫn, gắn middleware xác thực (`authenticateToken`), phân quyền (`authorizeRole`) và validator (`validate(schema)`). Tuyệt đối không chứa logic.
   - **Controllers:** Chỉ tiếp nhận request (`req.params`, `req.body`, `req.query`, `req.user`), gọi hàm nghiệp vụ tương ứng ở Service, và trả về HTTP response thông qua `handleResponse(res, result)`.
   - **Services:** Chứa 100% logic nghiệp vụ. Luôn trả về đối tượng `ServiceResult` `{ errCode, errMessage, data, meta }`.
   - **Models/Repositories:** Định nghĩa schema bảng, associations và truy vấn dữ liệu thông qua Sequelize ORM. Không xử lý HTTP request/response ở tầng này.
3. **Husky Pre-push Gate:**
   - Trước khi commit/push, luôn đảm bảo `npm run test` và `npm run lint` vượt qua 100% với mã thoát `0`.

---

## 2. Quy Chuẩn Backend (Node.js & Express 5)

### 2.1. Quản lý Kết nối Cơ sở Dữ liệu & Môi trường Test
- **Tuyệt đối không khởi tạo kết nối bất đồng bộ ở top-level khi require module:**
  Các service (ví dụ `SystemSettingService`) không được tự ý gọi các hàm `sync()` hoặc truy vấn DB ngay tại thời điểm import file nếu đang ở môi trường test (`process.env.NODE_ENV === "test"`).
- **Graceful Teardown trong Test:**
  File `BackEnd/tests/setup.js` luôn phải có hook `afterAll` đóng kết nối `db.sequelize.close()` và `redisClient.quit()` để Jest không bị lỗi `ReferenceError: You are trying to import a file after the Jest environment has been torn down`.
- **Database Transactions:**
  Mọi thao tác thay đổi nhiều bảng liên quan (như đặt đơn, hủy đơn, hoàn tiền, trừ tồn kho) **bắt buộc** phải sử dụng Sequelize Transaction có `try ... catch` với `await t.commit()` và `await t.rollback()`.

### 2.2. Quy tắc Máy trạng thái Đơn hàng (Order State Machine)
- Khách hàng (`customer`) có quyền hủy đơn trực tiếp khi đơn ở trạng thái `pending`.
- Khách hàng có quyền gửi yêu cầu hủy (`status === "cancel_requested"` hoặc `"cancelled"`) khi đơn ở trạng thái `["confirmed", "processing", "shipped", "shipping"]`.
- Khi khách gửi yêu cầu hủy, backend phải lưu lý do (`order.cancelReason`), ghi nhận lịch sử (`order.confirmationHistory`), và gửi thông báo real-time tới `admin_room`.

### 2.3. Quy tắc Thông báo (Notification Service)
- Bảng `Notifications` sử dụng trường `message` (`allowNull: false`).
- Khi tạo thông báo, luôn truyền trường `message` (hoặc đảm bảo `payload.message = data.message || data.content || ""`).

---

## 3. Quy Chuẩn Frontend (React 19, Tailwind CSS 4 & Framer Motion)

### 3.1. Phòng Chống Lỗi Tràn Hiển Thị Màn Hình (No Screen Overflow)
- **Quy tắc vàng cho Flex Containers:**
  Khi một container con nằm trong `flex`, luôn gắn class `min-w-0` và `flex-1` nếu bên trong có chứa văn bản dài (tên sản phẩm, địa chỉ, ghi chú, lý do hủy).
- **Văn bản dài (Text Wrap):**
  Áp dụng class `break-words [overflow-wrap:anywhere]` hoặc `truncate` / `line-clamp-X`. Tuyệt đối không để chuỗi ký tự dài (mã bưu vận, UUID, địa chỉ) phá vỡ khung giao diện trên màn hình nhỏ.
- **Hàng hóa trong danh sách đơn:**
  Các hàng sản phẩm trong đơn hàng phải responsive theo dạng `flex flex-col sm:flex-row gap-4 sm:gap-6 min-w-0` để đảm bảo hiển thị hoàn hảo trên màn hình điện thoại (< 400px).

### 3.2. Quy Chuẩn React Hooks & Fast Refresh
- **Dependency Arrays:**
  Tuân thủ nghiêm ngặt cảnh báo `react-hooks/exhaustive-deps`. Bọc các hàm fetch trong `useCallback` với dependencies đầy đủ trước khi truyền vào `useEffect`.
- **Fast Refresh:**
  Các file component UI (`.jsx`) chỉ được export React Components. Không export lẫn các object hằng số phụ trợ (như `buttonVariants`, `badgeVariants`) chung file component nếu chúng không thực sự cần dùng ở bên ngoài.

---

## 4. Quy Chuẩn Tích hợp AI (Gemini & Fallback)

1. **Fallback Tự động:**
   - Luôn sử dụng hàm tiện ích `generateContentWithFallback()` từ `src/config/gemini.js` thay vì gọi trực tiếp model cố định, nhằm tránh lỗi 404 khi Google cập nhật phiên bản model.
2. **Structured JSON Output:**
   - Khi yêu cầu AI phân tích (như Price Predictor, Insights), bắt buộc cấu hình `{ responseMimeType: "application/json" }` trong `generationConfig` và có `try ... catch` an toàn khi parse JSON.
3. **Fallback Khi AI Gặp Sự Cố:**
   - Luôn có logic tính toán dự phòng (heuristic/statistical algorithm) để người dùng vẫn nhận được dữ liệu hợp lý ngay cả khi API key hết hạn hoặc bị rate limit (429).
