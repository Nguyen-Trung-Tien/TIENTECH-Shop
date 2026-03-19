import React from "react";
import Header from "../HeaderComponent/Header";
import Footer from "../FooterComponent/Footer";
import { useLocation } from "react-router-dom";

const LayoutComponent = ({
  children,
  isShowHeader = true,
  isShowFooter = true,
}) => {
  const location = useLocation();

  const hideFooterPaths = [
    "/cart",
    "/checkout",
    "/checkout-success",
    "/checkout-failed",
    "/order-history",
    "/orders",
    "/orders-detail",
    "/profile",
    "/product-detail",
    "/product-list",
    "/products",
    "/fortune-products",
  ];

  const shouldHideFooter = hideFooterPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 selection:bg-primary/10 selection:text-primary">
      {isShowHeader && <Header />}
      
      <main className="flex-grow pb-20">
        <div className="animate-in fade-in duration-700">
          {children}
        </div>
      </main>

      {isShowFooter && !shouldHideFooter && <Footer />}
    </div>
  );
};

export default LayoutComponent;
