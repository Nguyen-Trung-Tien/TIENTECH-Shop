import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRouteAdmin from "./PublicRouteAdmin";
import AdminLayout from "../Admin/AdminLayout";
import UnifiedSpinner from "../components/Loading/UnifiedSpinner";

const AdminLogin = lazy(() => import("../Admin/pages/LoginAdmin/AdminLogin"));
const Dashboard = lazy(() => import("../Admin/pages/Dashboard/Dashboard"));
const AdminSearch = lazy(() => import("../Admin/pages/Dashboard/AdminSearch"));
const Categories = lazy(() => import("../Admin/pages/Categories/Categories"));
const OrderManage = lazy(() => import("../Admin/pages/OrderManage/OrderManage"));
const ProductManage = lazy(() => import("../Admin/pages/ProductManage/ProductManage"));
const UserManage = lazy(() => import("../Admin/pages/UserManage/UserManage"));
const Revenue = lazy(() => import("../Admin/pages/Revenue/Revenue"));
const ReviewPage = lazy(() => import("../Admin/pages/ReviewPage/ReviewPage"));
const OrdersReturnPage = lazy(() => import("../Admin/pages/OrdersReturnPage/OrdersReturnPage"));
const OrdersCancelManage = lazy(() => import("../Admin/pages/OrderManage/OrdersCancelManage"));
const PaymentPage = lazy(() => import("../Admin/pages/Payment/PaymentPage"));
const BrandManage = lazy(() => import("../Admin/pages/BrandManage/BrandManage"));
const VoucherManage = lazy(() => import("../Admin/pages/VoucherManage/VoucherManage"));
const SystemSettingsPage = lazy(() => import("../Admin/pages/SystemSettings/SystemSettingsPage"));
const OrderDetail = lazy(() => import("../pages/OrderDetail/OrderDetail"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

const AdminLoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-slate-900">
    <UnifiedSpinner size="lg" message="Đang tải trang quản trị..." />
  </div>
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
          <Route path="order/:id" element={<OrderDetail />} />
          <Route path="orders-return" element={<OrdersReturnPage />} />
          <Route path="orders-cancel" element={<OrdersCancelManage />} />
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
