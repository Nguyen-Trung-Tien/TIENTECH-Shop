# Deploy local tu A-Z voi Minikube

Muc tieu:

- Chay `MySQL`, `backend`, `frontend` tren Kubernetes local.
- Import du lieu co san tu thu muc `BackEnd/db`.
- Demo duoc `Pod`, `Service`, `Deployment`.

## 1. Dieu kien can

Can co:

- Docker Desktop dang chay
- `kubectl`
- `minikube`

Kiem tra:

```powershell
docker version
kubectl version --client
minikube version
```

## 2. Khoi dong Minikube

```powershell
minikube start --driver=docker
kubectl config use-context minikube
kubectl get nodes
```

Neu `kubectl` bao loi connect `127.0.0.1:<port>`, thu:

```powershell
minikube stop
minikube delete
minikube start --driver=docker
kubectl config use-context minikube
```

## 3. Build image cho du an

Build vao thang image store cua Minikube:

```powershell
minikube image build -t project-app-backend:latest .\BackEnd
minikube image build -t project-app-frontend:latest .\FrontEnd
```

## 4. Tao namespace

```powershell
kubectl apply -f .\deploy\local\namespace.yaml
```

## 5. Dua file SQL co san vao MySQL

Du an da co cac file SQL trong thu muc `BackEnd/db`.

Tao `ConfigMap` tu toan bo file SQL:

```powershell
kubectl create configmap mysql-initdb `
  --from-file=.\BackEnd\db `
  -n project-app
```

Kiem tra:

```powershell
kubectl get configmap mysql-initdb -n project-app
```

Luu y:

- MySQL chi auto import file trong `/docker-entrypoint-initdb.d` khi khoi tao data dir lan dau.
- Neu ban da tung chay MySQL pod/PVC roi, can xoa PVC de import lai tu dau.

## 6. Deploy MySQL

```powershell
kubectl apply -f .\deploy\local\mysql-pvc.yaml
kubectl apply -f .\deploy\local\mysql-deployment.yaml
kubectl apply -f .\deploy\local\mysql-service.yaml
kubectl get pods -n project-app -w
```

Xem log import:

```powershell
kubectl logs deployment/mysql -n project-app
```

Kiem tra database:

```powershell
kubectl exec -it deployment/mysql -n project-app -- mysql -uroot -p123456 -e "SHOW DATABASES;"
kubectl exec -it deployment/mysql -n project-app -- mysql -uroot -p123456 -D project_app -e "SHOW TABLES;"
```

## 7. Deploy backend va frontend

```powershell
kubectl apply -f .\deploy\local\backend-deployment.yaml
kubectl apply -f .\deploy\local\backend-service.yaml
kubectl apply -f .\deploy\local\frontend-deployment.yaml
kubectl apply -f .\deploy\local\frontend-service.yaml
```

Kiem tra:

```powershell
kubectl get all -n project-app
kubectl logs deployment/backend -n project-app
kubectl logs deployment/frontend -n project-app
```

## 8. Mo ung dung

```powershell
minikube service frontend-service -n project-app
```

Neu muon test backend:

```powershell
kubectl port-forward service/backend-service 8080:8080 -n project-app
```

Sau do mo:

```text
http://localhost:8080/healthz
```

## 9. Demo de tai

Lenh de demo:

```powershell
kubectl get pods -n project-app
kubectl get svc -n project-app
kubectl get deployments -n project-app
```

Scale frontend:

```powershell
kubectl scale deployment frontend --replicas=2 -n project-app
kubectl get pods -n project-app -w
```

Rollout backend:

```powershell
kubectl rollout restart deployment/backend -n project-app
kubectl rollout status deployment/backend -n project-app
```

## 10. Khi can import lai du lieu tu SQL

Xoa deployment va PVC MySQL:

```powershell
kubectl delete deployment mysql -n project-app
kubectl delete pvc mysql-pvc -n project-app
```

Xoa `ConfigMap` cu va tao lai:

```powershell
kubectl delete configmap mysql-initdb -n project-app
kubectl create configmap mysql-initdb --from-file=.\BackEnd\db -n project-app
```

Deploy lai MySQL:

```powershell
kubectl apply -f .\deploy\local\mysql-pvc.yaml
kubectl apply -f .\deploy\local\mysql-deployment.yaml
kubectl apply -f .\deploy\local\mysql-service.yaml
```
