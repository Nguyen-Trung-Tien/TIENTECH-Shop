import React from "react";

const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/70 rounded-2xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
  </div>
);

const OrderHistorySkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-dark-surface rounded-3xl border border-surface-200 dark:border-dark-border shadow-sm overflow-hidden"
        >
          {/* Top Bar Skeleton */}
          <div className="px-6 py-4 bg-surface-50/60 dark:bg-dark-bg/50 border-b border-surface-100 dark:border-dark-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Shimmer className="h-6 w-28 rounded-lg" />
              <Shimmer className="h-4 w-36 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <Shimmer className="h-6 w-24 rounded-full" />
              <Shimmer className="h-6 w-28 rounded-full" />
            </div>
          </div>

          {/* Items Skeleton */}
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <Shimmer className="size-20 md:size-24 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Shimmer className="h-5 w-4/5 rounded-lg" />
                <Shimmer className="h-4 w-1/3 rounded-md" />
                <Shimmer className="h-6 w-28 rounded-lg mt-3" />
              </div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="px-6 py-4 bg-surface-50/30 dark:bg-dark-bg/30 border-t border-surface-100 dark:border-dark-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shimmer className="h-4 w-20 rounded-md" />
              <Shimmer className="h-6 w-32 rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Shimmer className="h-10 w-28 rounded-xl" />
              <Shimmer className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistorySkeleton;
