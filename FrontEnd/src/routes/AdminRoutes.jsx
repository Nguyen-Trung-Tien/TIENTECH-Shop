import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRouteAdmin from "./PublicRouteAdmin";
import AdminLayout from "../admin/AdminLayout";
import AdminLogin from "../admin/pages/LoginAdmin/AdminLogin";
import Dashboard from "../admin/pages/Dashboard/Dashboard";
import AdminSearch from "../admin/pages/Dashboard/AdminSearch";
import Categories from "../admin/pages/Categories/Categories";
import OrderManage from "../admin/pages/OrderManage/OrderManage";
import ProductManage from "../admin/pages/ProductManage/ProductManage";
import UserManage from "../admin/pages/UserManage/UserManage";
import Revenue from "../admin/pages/Revenue/Revenue";
import ReviewPage from "../admin/pages/ReviewPage/ReviewPage";
import OrdersReturnPage from "../admin/pages/OrdersReturnPage/OrdersReturnPage";
import OrdersCancelManage from "../admin/pages/OrderManage/OrdersCancelManage";
import PaymentPage from "../admin/pages/Payment/PaymentPage";
import BrandManage from "../admin/pages/BrandManage/BrandManage";
import VoucherManage from "../admin/pages/VoucherManage/VoucherManage";
import OrderDetail from "../pages/OrderDetail/OrderDetail";
import NotFound from "../pages/NotFound/NotFound";

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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;
