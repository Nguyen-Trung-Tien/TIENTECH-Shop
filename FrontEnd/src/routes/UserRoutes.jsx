import { Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

import LayoutComponent from "../components/LayoutComponent/LayoutComponent";

import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import LoginSuccess from "../pages/LoginSuccess/LoginSuccess";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
import OTPVerification from "../pages/OTPVerification/OTPVerification";
import CartPage from "../pages/CartPage/CartPage";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import CheckoutSuccess from "../pages/CheckoutSuccess/CheckoutSuccess";
import CheckoutFailed from "../pages/CheckoutFailed/CheckoutFailed";
import Profile from "../pages/Profile/Profile";
import NotFound from "../pages/NotFound/NotFound";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import ProductListPage from "../pages/ProductListPage/ProductListPage";
import AllProducts from "../components/AllProducts/AllProduct";
import FortuneProducts from "../components/FortuneProducts/FortuneProducts";
import OrderHistory from "../pages/OrdersHistory/OrderHistory";
import OrderPage from "../pages/OrderPage/OrderPage";
import OrderDetail from "../pages/OrderDetail/OrderDetail";
import AboutPage from "../pages/AboutPage/AboutPage";
import WishlistPage from "../pages/WishlistPage/WishlistPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route
          path="login"
          element={
            <LayoutComponent isShowHeader={false} isShowFooter={false}>
              <LoginPage />
            </LayoutComponent>
          }
        />
        <Route
          path="register"
          element={
            <LayoutComponent isShowHeader={false} isShowFooter={false}>
              <RegisterPage />
            </LayoutComponent>
          }
        />
        <Route
          path="verify-email"
          element={<VerifyEmail />}
        />
        <Route
          path="verify-account"
          element={<OTPVerification />}
        />
      </Route>

      <Route path="login-success" element={<LoginSuccess />} />

      <Route element={<PrivateRoute />}>
        <Route
          path="cart"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <CartPage />
            </LayoutComponent>
          }
        />
        <Route
          path="checkout"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <CheckoutPage />
            </LayoutComponent>
          }
        />
        <Route
          path="checkout-success/:orderId?"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <CheckoutSuccess />
            </LayoutComponent>
          }
        />
        <Route
          path="checkout-failed/:orderId?"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <CheckoutFailed />
            </LayoutComponent>
          }
        />
        <Route
          path="order-history"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <OrderHistory />
            </LayoutComponent>
          }
        />
        <Route
          path="orders"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <OrderPage />
            </LayoutComponent>
          }
        />
        <Route
          path="orders-detail/:id"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <OrderDetail />
            </LayoutComponent>
          }
        />
        <Route
          path="profile"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <Profile />
            </LayoutComponent>
          }
        />
        <Route
          path="fortune-products"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <FortuneProducts />
            </LayoutComponent>
          }
        />
        <Route
          path="wishlist"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <WishlistPage />
            </LayoutComponent>
          }
        />
      </Route>

      <Route
        index
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <HomePage />
          </LayoutComponent>
        }
      />
      <Route
        path="product-detail/:slug"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <ProductDetailPage />
          </LayoutComponent>
        }
      />
      <Route
        path="product-list"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <ProductListPage />
          </LayoutComponent>
        }
      />
      <Route
        path="products"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <AllProducts />
          </LayoutComponent>
        }
      />
      <Route
        path="about"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <AboutPage />
          </LayoutComponent>
        }
      />
      <Route
        path="*"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <NotFound />
          </LayoutComponent>
        }
      />
    </Routes>
  );
};

export default UserRoutes;
