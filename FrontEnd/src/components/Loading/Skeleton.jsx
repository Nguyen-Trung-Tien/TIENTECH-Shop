import React from "react";

const Skeleton = ({ className }) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-dark-surface animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-dark-surface dark:via-dark-border dark:to-dark-surface bg-[length:2000px_100%] ${className}`}
    ></div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-soft border border-gray-100 dark:border-dark-border p-3">
    <Skeleton className="h-48 w-full rounded-lg mb-4" />
    <Skeleton className="h-5 w-3/4 rounded mb-2" />
    <Skeleton className="h-4 w-1/2 rounded mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-1/4 rounded" />
      <Skeleton className="h-8 w-1/3 rounded-full" />
    </div>
  </div>
);

export default Skeleton;
