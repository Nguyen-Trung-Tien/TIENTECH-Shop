# Sử dụng Node.js bản stable mới nhất
FROM node:20-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy các file package để install trước (tận dụng cache)
COPY package*.json ./

# Cài đặt các package (bỏ qua devDependencies để giảm kích thước image)
RUN npm install --production

# Copy toàn bộ mã nguồn
COPY . .

# Mở cổng 8080 (theo cấu hình mặc định của bạn)
EXPOSE 8080

# Chạy lệnh khởi động
# Lưu ý: Bạn có thể thêm lệnh chạy migration trước khi start nếu cần
CMD ["node", "src/service.js"]
