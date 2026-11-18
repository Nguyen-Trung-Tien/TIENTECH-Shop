import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import BrandLoader from "../components/Loading/BrandLoader";

const PrivateRoute = ({ requiredRole }) => {
  const { user, isAuthenticated, isInitializing } = useSelector(
    (state) => state.user,
  );
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
        <BrandLoader
          message="Đang xác thực phiên đăng nhập..."
          subMessage="Bảo mật tài khoản TIEN TECH"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={requiredRole === "admin" ? "/admin/login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : requiredRole === "admin"
      ? ["admin", "root"]
      : requiredRole
        ? [requiredRole]
        : null;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
