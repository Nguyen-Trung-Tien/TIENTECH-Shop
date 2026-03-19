import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiRefreshCw } from "react-icons/fi";
import { getMeApi } from "../api/userApi";
import { setUser, removeUser, setInitializing } from "../redux/userSlice";

const PrivateRoute = ({ requiredRole }) => {
  const { user, isAuthenticated, isInitializing } = useSelector((state) => state.user);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      // Nếu đã có user trong Redux nhưng isInitializing vẫn là true, 
      // ta gọi API /me để xác nhận session (ví dụ khi F5 trang)
      if (isInitializing) {
        try {
          const res = await getMeApi();
          if (res.errCode === 0) {
            dispatch(setUser(res.data));
          } else {
            dispatch(removeUser());
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          dispatch(removeUser());
        } finally {
          dispatch(setInitializing(false));
        }
      }
    };

    checkAuth();
  }, [isInitializing, dispatch]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-soft border border-surface-100">
          <FiRefreshCw className="animate-spin text-4xl text-primary" />
          <p className="text-sm font-bold text-surface-600 uppercase tracking-widest">Đang xác thực phiên đăng nhập...</p>
        </div>
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

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
