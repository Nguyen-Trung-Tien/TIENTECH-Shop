import React from 'react';

const LoadMoreButton = ({ onClick, isLoading, hasMore, text = 'Xem thêm sản phẩm' }) => {
  if (!hasMore && !isLoading) return null;

  return (
    <div className="flex justify-center my-12">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="btn-ui-secondary group relative px-8 py-3 text-sm-ui"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-100"></span>
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-200"></span>
            <span className="ml-2 font-medium text-neutral-500 italic">Đang tải...</span>
          </div>
        ) : (
          <span className="flex items-center">
            {text}
            <svg 
              className="ml-2 w-4 h-4 transition-transform group-hover:translate-y-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;
