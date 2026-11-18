import React from "react";
import { Outlet, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

const resolveSafeRedirect = (searchParams, location) => {
  const queryRedirect = searchParams.get("redirect");
  if (
    queryRedirect &&
    queryRedirect.startsWith("/") &&
    !queryRedirect.startsWith("//")
  ) {
    return queryRedirect;
  }
  const fromPath = location.state?.from?.pathname;
  if (fromPath && fromPath.startsWith("/") && !fromPath.startsWith("//")) {
    return `${fromPath}${location.state?.from?.search || ""}`;
  }
  return "/";
};

const PublicRoute = () => {
  const { user, isAuthenticated, isInitializing } = useSelector(
    (state) => state.user,
  );
  const location = useLocation();
  const [searchParams] = useSearchParams();

  if (!isInitializing && isAuthenticated && user) {
    return <Navigate to={resolveSafeRedirect(searchParams, location)} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
