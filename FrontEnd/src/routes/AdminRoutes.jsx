import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRouteAdmin from "./PublicRouteAdmin";
import AdminLayout from "../Admin/AdminLayout";
import BrandLoader from "../components/Loading/BrandLoader";

const AdminLogin = lazy(() => import("../Admin/pages/LoginAdmin/AdminLogin"));
const Dashboard = lazy(() => import("../Admin/pages/Dashboard/Dashboard"));
const AdminSearch = lazy(() => import("../Admin/pages/Dashboard/AdminSearch"));
const Categories = lazy(() => import("../Admin/pages/Categories/Categories"));
const OrderManage = lazy(() => import("../Admin/pages/OrderManage/OrderManage"));
const ProductManage = lazy(() => import("../Admin/pages/ProductManage/ProductManage"));
const UserManage = lazy(() => import("../Admin/pages/UserManage/UserManage"));
const Revenue = lazy(() => import("../Admin/pages/Revenue/Revenue"));
const ReviewPage = lazy(() => import("../Admin/pages/ReviewPage/ReviewPage"));
const PaymentPage = lazy(() => import("../Admin/pages/Payment/PaymentPage"));
const BrandManage = lazy(() => import("../Admin/pages/BrandManage/BrandManage"));
const VoucherManage = lazy(() => import("../Admin/pages/VoucherManage/VoucherManage"));
const SystemSettingsPage = lazy(() => import("../Admin/pages/SystemSettings/SystemSettingsPage"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

const AdminLoadingFallback = () => (
  <BrandLoader
    minHeight="min-h-screen"
    message="Đang tải trang quản trị..."
    subMessage="TIEN TECH Admin Portal"
  />
);

const AdminRoutes = () => {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <Routes>
        <Route element={<PublicRouteAdmin />}>
          <Route path="login" element={<AdminLogin />} />
        </Route>

        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<AdminSearch />} />
            <Route path="orders" element={<OrderManage />} />
            <Route path="order/:id" element={<OrderManage />} />
            <Route path="orders-return" element={<Navigate to="/admin/orders?tab=return_requested" replace />} />
            <Route path="orders-cancel" element={<Navigate to="/admin/orders?tab=cancel_requested" replace />} />
            <Route path="products" element={<ProductManage />} />
            <Route path="product/edit/:id" element={<ProductManage />} />
            <Route path="users" element={<UserManage />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="categories" element={<Categories />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="reviews" element={<ReviewPage />} />
            <Route path="brands" element={<BrandManage />} />
            <Route path="vouchers" element={<VoucherManage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
