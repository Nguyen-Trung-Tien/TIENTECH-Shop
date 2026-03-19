import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="card-base p-4 overflow-hidden">
      {/* Image Placeholder */}
      <div className="aspect-square w-full skeleton rounded-xl mb-4"></div>
      
      {/* Category/Brand Badge Placeholder */}
      <div className="w-1/3 h-4 skeleton rounded mb-2"></div>
      
      {/* Title Placeholder */}
      <div className="w-full h-6 skeleton rounded mb-2"></div>
      <div className="w-2/3 h-6 skeleton rounded mb-4"></div>
      
      {/* Price and Action Placeholder */}
      <div className="flex justify-between items-center mt-auto pt-2">
        <div className="w-1/2 h-7 skeleton rounded"></div>
        <div className="w-10 h-10 skeleton rounded-full"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
