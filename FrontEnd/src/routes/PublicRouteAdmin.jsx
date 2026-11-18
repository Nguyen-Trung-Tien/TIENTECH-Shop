import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRouteAdmin = () => {
  const { user, isAuthenticated, isInitializing } = useSelector((state) => state.user);

  if (!isInitializing && isAuthenticated && ["admin", "root"].includes(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default PublicRouteAdmin;
