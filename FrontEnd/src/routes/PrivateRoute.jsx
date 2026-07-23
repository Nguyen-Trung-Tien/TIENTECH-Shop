import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMeApi } from "../api/userApi";
import { setUser, removeUser, setInitializing } from "../redux/userSlice";
import UnifiedSpinner from "../components/Loading/UnifiedSpinner";

const PrivateRoute = ({ requiredRole }) => {
  const { user, isAuthenticated, isInitializing } = useSelector(
    (state) => state.user,
  );
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
          <UnifiedSpinner size="xl" variant="primary" />
          <p className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mt-2">
            Đang xác thực phiên đăng nhập...
          </p>
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
