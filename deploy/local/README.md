# Deploy local từ A-Z với Minikube

Mục tiêu:

- Chạy `MySQL`, `Redis`, `backend`, `frontend` trên Kubernetes local.
- Khởi tạo schema & dữ liệu mẫu bằng Sequelize CLI (`db:migrate` và `db:seed:all`).
- Kiểm tra `Pod`, `Service`, `Deployment` qua `/healthz` và `/readyz`.

## 1. Điều kiện cần

- Docker Desktop đang chạy
- `kubectl`
- `minikube`

## 2. Khởi động Minikube

```powershell
minikube start --driver=docker
kubectl config use-context minikube
kubectl get nodes
```

## 3. Build image từ thư mục gốc monorepo

Do dự án sử dụng npm workspaces (`package-lock.json` tại root), build image từ thư mục gốc:

```powershell
minikube image build -t project-app-backend:latest -f .\BackEnd\Dockerfile .
minikube image build -t project-app-frontend:latest -f .\FrontEnd\Dockerfile .
```

## 4. Tạo namespace & secret

```powershell
kubectl apply -f .\deploy\local\namespace.yaml
Copy-Item .\deploy\local\backend-secrets.example.yaml .\deploy\local\backend-secrets.yaml
# Điền thông tin DB, JWT, Gemini, PayPal, VNPay, Cloudinary vào backend-secrets.yaml
kubectl apply -f .\deploy\local\backend-secrets.yaml
```

## 5. Deploy MySQL & Redis

```powershell
kubectl apply -f .\deploy\local\mysql-pvc.yaml
kubectl apply -f .\deploy\local\mysql-deployment.yaml
kubectl apply -f .\deploy\local\mysql-service.yaml
kubectl apply -f .\deploy\local\redis-deployment.yaml
kubectl apply -f .\deploy\local\redis-service.yaml
kubectl get pods -n project-app -w
```

## 6. Deploy Backend & Frontend

```powershell
kubectl apply -f .\deploy\local\backend-deployment.yaml
kubectl apply -f .\deploy\local\backend-service.yaml
kubectl apply -f .\deploy\local\frontend-deployment.yaml
kubectl apply -f .\deploy\local\frontend-service.yaml
```

## 7. Chạy Migrations & Seeders trên Backend Pod

```powershell
kubectl exec -it deployment/backend -n project-app -- npx sequelize-cli db:migrate
kubectl exec -it deployment/backend -n project-app -- npx sequelize-cli db:seed:all
```

## 8. Kiểm tra & Mở ứng dụng

```powershell
kubectl get all -n project-app
kubectl port-forward service/backend-service 8080:8080 -n project-app
# Readiness: http://localhost:8080/readyz
# Liveness:  http://localhost:8080/healthz
minikube service frontend-service -n project-app
```
