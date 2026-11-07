import { Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

import LayoutComponent from "../components/LayoutComponent/LayoutComponent";

import React, { Suspense, lazy } from "react";
import UnifiedSpinner from "../components/Loading/UnifiedSpinner";

const HomePage = lazy(() => import("../pages/HomePage/HomePage"));
const LoginPage = lazy(() => import("../pages/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage/RegisterPage"));
const LoginSuccess = lazy(() => import("../pages/LoginSuccess/LoginSuccess"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail/VerifyEmail"));
const OTPVerification = lazy(() => import("../pages/OTPVerification/OTPVerification"));
const CartPage = lazy(() => import("../pages/CartPage/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage/CheckoutPage"));
const CheckoutSuccess = lazy(() => import("../pages/CheckoutSuccess/CheckoutSuccess"));
const CheckoutFailed = lazy(() => import("../pages/CheckoutFailed/CheckoutFailed"));
const ProductCompareHub = lazy(() => import("../pages/ProductCompare/ProductCompareHub"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Notifications = lazy(() => import("../pages/Notifications/Notifications"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage/ProductDetailPage"));
const ProductListPage = lazy(() => import("../pages/ProductListPage/ProductListPage"));
const AllProducts = lazy(() => import("../components/AllProducts/AllProduct"));
const FortuneProducts = lazy(() => import("../components/FortuneProducts/FortuneProducts"));
const OrderHistory = lazy(() => import("../pages/OrdersHistory/OrderHistory"));
const OrderPage = lazy(() => import("../pages/OrderPage/OrderPage"));
const OrderDetail = lazy(() => import("../pages/OrderDetail/OrderDetail"));
const AboutPage = lazy(() => import("../pages/AboutPage/AboutPage"));
const WishlistPage = lazy(() => import("../pages/WishlistPage/WishlistPage"));
const ContactPage = lazy(() => import("../pages/ContactPage/ContactPage"));
const SupportHub = lazy(() => import("../pages/SupportPage/SupportHub"));
const FAQPage = lazy(() => import("../pages/SupportPage/FAQPage"));
const WarrantyPage = lazy(() => import("../pages/SupportPage/WarrantyPage"));
const ShippingPage = lazy(() => import("../pages/SupportPage/ShippingPage"));
const PaymentPage = lazy(() => import("../pages/SupportPage/PaymentPage"));

const UserLoadingFallback = () => (
  <div className="min-h-[60vh] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <UnifiedSpinner size="lg" message="Đang tải dữ liệu..." />
  </div>
);


const UserRoutes = () => {
  return (
    <Suspense fallback={<UserLoadingFallback />}>
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
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
                <CheckoutSuccess />
              </Suspense>
            </LayoutComponent>
          }
        />
        <Route
          path="checkout-failed/:orderId?"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
                <CheckoutFailed />
              </Suspense>
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
          path="notifications"
          element={
            <LayoutComponent isShowHeader={true} isShowFooter={true}>
              <Notifications />
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
        path="category/:slug"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <ProductListPage />
          </LayoutComponent>
        }
      />
      <Route
        path="brand/:slug"
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
        path="compare"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải ma trận so sánh...</div>}>
              <ProductCompareHub />
            </Suspense>
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
        path="contact"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <ContactPage />
          </LayoutComponent>
        }
      />
      <Route
        path="support"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <SupportHub />
          </LayoutComponent>
        }
      />
      <Route
        path="support/faq"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <FAQPage />
          </LayoutComponent>
        }
      />
      <Route
        path="support/warranty"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <WarrantyPage />
          </LayoutComponent>
        }
      />
      <Route
        path="support/shipping-returns"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <ShippingPage />
          </LayoutComponent>
        }
      />
      <Route
        path="support/payment"
        element={
          <LayoutComponent isShowHeader={true} isShowFooter={true}>
            <PaymentPage />
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
    </Suspense>
  );
};

export default UserRoutes;
