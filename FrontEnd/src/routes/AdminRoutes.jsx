import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRouteAdmin from "./PublicRouteAdmin";
import AdminLayout from "../Admin/AdminLayout";

import AdminLogin from "../Admin/pages/LoginAdmin/AdminLogin";
import Dashboard from "../Admin/pages/Dashboard/Dashboard";
import AdminSearch from "../Admin/pages/Dashboard/AdminSearch";
import Categories from "../Admin/pages/Categories/Categories";
import OrderManage from "../Admin/pages/OrderManage/OrderManage";
import ProductManage from "../Admin/pages/ProductManage/ProductManage";
import UserManage from "../Admin/pages/UserManage/UserManage";
import Revenue from "../Admin/pages/Revenue/Revenue";
import ReviewPage from "../Admin/pages/ReviewPage/ReviewPage";
import OrdersReturnPage from "../Admin/pages/OrdersReturnPage/OrdersReturnPage";
import OrdersCancelManage from "../Admin/pages/OrderManage/OrdersCancelManage";
import PaymentPage from "../Admin/pages/Payment/PaymentPage";
import BrandManage from "../Admin/pages/BrandManage/BrandManage";
import VoucherManage from "../Admin/pages/VoucherManage/VoucherManage";
import OrderDetail from "../pages/OrderDetail/OrderDetail";

const AdminRoutes = () => {
  return (
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
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
