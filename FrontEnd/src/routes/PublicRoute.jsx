import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const { user, isAuthenticated, isInitializing } = useSelector((state) => state.user);
  if (!isInitializing && isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
