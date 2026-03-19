import React from 'react';

const StatusBadge = ({ status, type = 'default' }) => {
  const statusStyles = {
    pending: 'bg-warning-light text-warning-dark border-warning-light/50',
    success: 'bg-success-light text-success-dark border-success-light/50',
    error: 'bg-error-light text-error-dark border-error-light/50',
    delivered: 'bg-brand-50 text-brand-700 border-brand-100',
    cancelled: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    default: 'bg-neutral-50 text-neutral-600 border-neutral-200',
  };

  const styleClass = statusStyles[status?.toLowerCase()] || statusStyles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs-ui font-bold border ${styleClass} transition-colors duration-200`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60"></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
