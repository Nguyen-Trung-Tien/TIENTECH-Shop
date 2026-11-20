import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";

/**
 * Legacy ProfileTicketsTab forwarder.
 * Support tickets are now unified under /support-tickets.
 */
export const ProfileTicketsTab = () => {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticketId");
  const target = ticketId
    ? `/support-tickets?ticketId=${encodeURIComponent(ticketId)}`
    : "/support-tickets";

  return <Navigate to={target} replace />;
};

export default ProfileTicketsTab;
