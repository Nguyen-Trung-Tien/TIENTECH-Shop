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

---

## 5. Chiến Lược Tối Ưu Hóa Token Cho AI Gemini (Token Efficiency Guidelines)

### 5.1. Định vị và Đọc mã nguồn có trọng tâm (Targeted Inspection)
- **Tuyệt đối không đọc toàn bộ file dài (> 100 dòng):** Sử dụng `grep_search` để định vị vị trí hàm/biến cần xử lý, sau đó gọi `view_file` với `StartLine` và `EndLine` trong phạm vi hẹp (khoảng 30 - 80 dòng liên quan).
- **Tránh xa các thư mục rác và build artifacts:** Không bao giờ liệt kê (`list_dir`) hoặc tìm kiếm trong `node_modules`, `dist`, `build`, `coverage`, `.git`.
- **Đọc schema/types trước:** Khi làm việc với database hoặc API, chỉ cần xem định nghĩa model hoặc file route tương ứng thay vì đọc lan man cả controller và service khác.

### 5.2. Chỉnh sửa mã nguồn vi phẫu (Surgical Edits)
- **Ưu tiên công cụ thay thế cục bộ:** Luôn sử dụng `replace_file_content` hoặc `multi_replace_file_content` cho các khối lệnh cần thay đổi.
- **Cấm ghi đè toàn bộ file lớn bằng `write_to_file`:** Ghi đè toàn bộ file đã tồn tại gây lãng phí hàng nghìn output token không cần thiết và tiềm ẩn rủi ro làm mất code cũ.

### 5.3. Tiết kiệm Token Giao tiếp & Trả lời (Concise Communication)
- **Không in lại mã nguồn hoàn chỉnh trong chat:** Chỉ trình bày tóm tắt bản chất thay đổi, điểm mấu chốt và code diff ngắn gọn.
- **Sử dụng liên kết file dạng clickable:** Dẫn chiếu trực tiếp `[filename](file:///...)` hoặc `[ClassName](file:///path#L10-L20)` thay vì trích dẫn lại đoạn code dài vào phản hồi.

### 5.4. Chạy Test & Debug có phạm vi hẹp (Scoped Testing)
- **Test từng phần trước khi test toàn bộ:** Khi phát triển hoặc sửa lỗi, chạy lệnh kiểm thử nhắm trực tiếp vào file test liên quan (ví dụ: `npm test -- OrderService.test.js`) để log output ngắn gọn, không làm tràn context window của model.
- **Chỉ chạy full-suite ở bước cuối cùng:** Sau khi đã pass unit test cục bộ, mới chạy `npm run test` và `npm run lint` từ root để xác nhận vượt qua gate.

---

## 6. Quy Trình 5 Bước Code Chức Năng Chính Xác (Precision Execution Protocol)

### Bước 1: Khảo sát định vị & Đọc Data Contract
- Dùng `grep_search` tìm router, controller, service và Sequelize Model liên quan.
- Xác định rõ các trường trong bảng (kiểu dữ liệu, `allowNull`, `defaultValue`, foreign keys) để tránh lỗi runtime Sequelize ValidationError.

### Bước 2: Tuân thủ Kiến trúc 4 tầng (Layered Architecture)
- **Router:** Chỉ định tuyến + middleware (`authenticateToken`, `authorizeRole`, `validate(schema)`). Không đặt logic tại đây.
- **Controller:** Tiếp nhận `req`, gọi Service và trả lời qua `handleResponse(res, result)` / `handleError(res, error)`.
- **Service:** Xử lý 100% nghiệp vụ, trả về `ServiceResult.success(data, message, meta)` hoặc `ServiceResult.error(message, errCode)`.
- **Model:** Khai báo schema và quan hệ associations chuẩn xác.

### Bước 3: Bảo toàn Tính toàn vẹn dữ liệu với Transaction
- Mọi thao tác ghi/sửa từ 2 bảng trở lên (ví dụ: Đơn hàng + Chi tiết đơn + Trừ kho + Hoàn tiền + Thông báo) **bắt buộc** phải bọc trong `const t = await db.sequelize.transaction()`.
- Luôn có đầy đủ `await t.commit()` trong nhánh thành công và `await t.rollback()` trong khối `catch`.

### Bước 4: Chuẩn hóa Giao diện Frontend (Zero-Overflow & Stable React)
- Mọi component hiển thị chuỗi ký tự động (địa chỉ, mã đơn, tên sản phẩm, lý do hủy) phải có:
  `min-w-0 flex-1 break-words [overflow-wrap:anywhere]` kết hợp responsive `flex flex-col sm:flex-row`.
- Hook fetch dữ liệu phải bọc trong `useCallback` với danh sách dependencies chuẩn mực trước khi truyền vào `useEffect`.
- Không export các object hằng số phụ trợ (như `buttonVariants`) chung trong file `.jsx` để đảm bảo Fast Refresh hoạt động trơn tru.

### Bước 5: Tự Động Kiểm Chứng Trước Khi Hoàn Tất (Self-Verification)
- Kiểm tra tính đúng đắn bằng cách chạy test cục bộ hoặc linter.
- Đảm bảo mã thoát `0` cho lệnh `npm run test` và `npm run lint` ở root monorepo trước khi báo cáo hoàn thành cho người dùng.

