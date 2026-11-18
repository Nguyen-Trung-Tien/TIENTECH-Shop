import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import BrandLoader from "../components/Loading/BrandLoader";
import { ErrorState, PageShell } from "../components/UI";
import { showErrorToast } from "../utils/toastHelper";

const PrivateRoute = ({ requiredRole }) => {
  const { user, isAuthenticated, isInitializing } = useSelector(
    (state) => state.user,
  );
  const location = useLocation();
  const navigate = useNavigate();

  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : requiredRole === "admin"
      ? ["admin", "root"]
      : requiredRole
        ? [requiredRole]
        : null;

  const isForbidden =
    !isInitializing &&
    isAuthenticated &&
    allowedRoles &&
    !allowedRoles.includes(user?.role);

  useEffect(() => {
    if (isForbidden) {
      showErrorToast("Bạn không có quyền truy cập khu vực này (403).", {
        toastId: "forbidden_route_access",
      });
    }
  }, [isForbidden]);

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

  if (isForbidden) {
    return (
      <PageShell title="Không có quyền truy cập" eyebrow="Lỗi 403 Forbidden">
        <ErrorState
          title="403 - Truy cập bị từ chối"
          description="Tài khoản hiện tại không có quyền truy cập vào trang quản trị hoặc tài nguyên này."
          actionLabel="Về trang chủ"
          onRetry={() => navigate("/", { replace: true })}
        />
      </PageShell>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
