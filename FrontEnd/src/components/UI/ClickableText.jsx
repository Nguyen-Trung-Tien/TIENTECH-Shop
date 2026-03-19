import React from 'react';

const ClickableText = ({ children, onClick, className = '', type = 'primary' }) => {
  const types = {
    primary: 'text-brand-600 hover:text-brand-700 font-semibold',
    secondary: 'text-neutral-500 hover:text-neutral-900 font-medium',
    accent: 'text-amber-600 hover:text-amber-700 font-semibold',
    danger: 'text-error-DEFAULT hover:text-error-dark font-medium',
  };

  return (
    <button
      onClick={onClick}
      className={`text-sm-ui underline-offset-4 hover:underline transition-all duration-200 ${types[type] || types.primary} ${className}`}
    >
      {children}
    </button>
  );
};

export default ClickableText;
