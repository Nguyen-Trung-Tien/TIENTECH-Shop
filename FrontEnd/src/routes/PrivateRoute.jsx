import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { FiRefreshCw } from "react-icons/fi";

const PrivateRoute = ({ requiredRole }) => {
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const verifyToken = () => {
      if (!user || !token) {
        setValid(false);
        setChecking(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp < Date.now() / 1000;

        if (requiredRole && user.role !== requiredRole) {
          setValid(false);
        } else if (!isExpired) {
          setValid(true);
        } else {
          setValid(false);
        }
      } catch (err) {
        console.error("Token decode error:", err);
        setValid(false);
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [user, token, requiredRole]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-soft border border-surface-100">
          <FiRefreshCw className="animate-spin text-4xl text-primary" />
          <p className="text-sm font-bold text-surface-600 uppercase tracking-widest">Đang xác thực phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <Navigate
        to={requiredRole === "admin" ? "/admin/login" : "/login"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
