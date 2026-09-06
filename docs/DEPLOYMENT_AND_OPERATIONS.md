# TIENTECH-Shop Deployment & Operations Guide

Hướng dẫn chi tiết quy trình triển khai, vận hành và duy trì hệ thống trên các môi trường Local, Docker, Kubernetes và GitHub Actions CI/CD.

---

## 1. Yêu cầu Hệ thống Cốt lõi
- **Node.js**: Phiên bản 22.x LTS trở lên.
- **Package Manager**: `npm` phiên bản 10.x trở lên.
- **MySQL**: Phiên bản 8.0 (hỗ trợ JSON column type và full-text search).
- **Redis**: Phiên bản 6.0 trở lên (tùy chọn trong dev, khuyến nghị trên prod).

---

## 2. Khởi tạo Môi trường Phát triển (Local Development)

### 2.1. Cấu hình biến môi trường
Tạo file `.env` trong thư mục `BackEnd/`:
```env
PORT=8080
NODE_ENV=development

# MySQL Database
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE_NAME=tientech_shop
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql

# Redis Cache
REDIS_URL=redis://127.0.0.1:6379

# JWT Security
JWT_ACCESS_SECRET=your_super_strong_access_secret_key_32_chars
JWT_REFRESH_SECRET=your_super_strong_refresh_secret_key_32_chars
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...

# Cloudinary Media
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# FrontEnd URL for CORS
FRONTEND_URL=http://localhost:5173
```

### 2.2. Khởi chạy toàn bộ Monorepo từ thư mục gốc
Tại thư mục gốc `TIENTECH-Shop`:
```bash
# Cài đặt dependencies toàn bộ monorepo
npm install

# Chạy Backend (cổng 8080)
npm run dev:backend

# Chạy Frontend trong terminal khác (cổng 5173)
npm run dev:frontend
```

---

## 3. Quy trình Kiểm thử & Chất lượng Mã nguồn (Quality Gate)

Hệ thống tích hợp Git Hook **Husky pre-push** tại `.husky/pre-push`. Trước mỗi lần `git push`, script tự động kích hoạt:
1. `npm run lint`: Kiểm tra tuân thủ linter của FrontEnd.
2. `npm run test`: Chạy toàn bộ test suites (Jest cho BackEnd và Vitest cho FrontEnd).

Để tự chạy kiểm tra trước khi commit:
```bash
# Kiểm tra linter
npm run lint

# Chạy kiểm thử toàn bộ
npm run test

# Kiểm tra bản build production
npm run build --prefix FrontEnd
```

---

## 4. Triển khai Cụm Cục bộ bằng Kubernetes (`deploy/local/`)

Trong thư mục `deploy/local/` cung cấp đầy đủ các file manifests để triển khai ứng dụng trên Minikube hoặc K8s cluster:
1. `namespace.yaml`: Tạo namespace `tientech-shop`.
2. `mysql-pvc.yaml` & `mysql-deployment.yaml`: Triển khai cơ sở dữ liệu có gắn Persistent Volume Claim 5Gi.
3. `mysql-service.yaml`: Cung cấp DNS nội bộ `mysql:3306` cho cụm.
4. `backend-deployment.yaml` & `backend-service.yaml`: Triển khai API Pods kèm kiểm tra `livenessProbe` và `readinessProbe` qua `/healthz`.
5. `frontend-deployment.yaml` & `frontend-service.yaml`: Triển khai Web SPA Pods qua Nginx.

Lệnh triển khai đồng loạt:
```bash
kubectl apply -f deploy/local/namespace.yaml
kubectl apply -f deploy/local/mysql-pvc.yaml
kubectl apply -f deploy/local/mysql-service.yaml
kubectl apply -f deploy/local/mysql-deployment.yaml
kubectl apply -f deploy/local/backend-service.yaml
kubectl apply -f deploy/local/backend-deployment.yaml
kubectl apply -f deploy/local/frontend-service.yaml
kubectl apply -f deploy/local/frontend-deployment.yaml
```

---

## 5. Tự động hóa CI/CD với GitHub Actions (`.github/workflows/`)

Workflow `github_only_cicd.yml` tự động chạy khi có `push` hoặc `pull_request` vào nhánh `main`:
1. **Job CI (`build-and-test`):**
   - Khởi động service container MySQL 8.0.
   - Cài đặt dependencies với cache npm.
   - Chạy `npm test` cho Backend.
   - Chạy `npm run lint`, `npm test`, và `npm run build` cho Frontend.
2. **Job Deploy Frontend:** Tự động đưa bản build `dist/` lên GitHub Pages.
3. **Job Package Backend:** Tự động build Docker Image và đẩy lên **GitHub Container Registry (GHCR)** với tag `latest` và commit SHA.
