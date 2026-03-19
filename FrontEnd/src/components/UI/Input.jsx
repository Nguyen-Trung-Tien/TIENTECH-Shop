import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1.5 ml-0.5">
          {label}
        </label>
      )}
      <input
        className={`input-base ${error ? 'border-danger focus:ring-danger/10 focus:border-danger' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger font-medium ml-0.5">{error}</p>}
    </div>
  );
};

export default Input;
