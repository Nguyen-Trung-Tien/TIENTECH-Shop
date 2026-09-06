import React from "react";

const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/70 rounded-2xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
  </div>
);

const OrderDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg py-8 md:py-12 transition-colors duration-300">
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-surface p-6 rounded-3xl border border-surface-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center gap-4">
            <Shimmer className="size-10 rounded-xl" />
            <div className="space-y-2">
              <Shimmer className="h-6 w-36 rounded-lg" />
              <Shimmer className="h-4 w-48 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-7 w-28 rounded-full" />
            <Shimmer className="h-7 w-28 rounded-full" />
          </div>
        </div>

        {/* Tracking Stepper Skeleton */}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-surface-200 dark:border-dark-border shadow-sm">
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-3">
                <Shimmer className="size-10 rounded-full" />
                <Shimmer className="h-3 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Main 2-Column Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Items List Skeleton */}
          <div className="lg:col-span-8 bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl border border-surface-200 dark:border-dark-border shadow-sm space-y-6">
            <Shimmer className="h-6 w-40 rounded-lg" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="flex gap-4 md:gap-6 p-4 rounded-2xl bg-surface-50/50 dark:bg-dark-bg/40 border border-surface-100 dark:border-dark-border">
                  <Shimmer className="size-20 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <Shimmer className="h-5 w-3/4 rounded-lg" />
                    <Shimmer className="h-4 w-1/4 rounded-md" />
                    <Shimmer className="h-5 w-28 rounded-lg mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info Cards Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Delivery Info Skeleton */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-surface-200 dark:border-dark-border shadow-sm space-y-4">
              <Shimmer className="h-5 w-36 rounded-lg" />
              <div className="space-y-2">
                <Shimmer className="h-4 w-full rounded-md" />
                <Shimmer className="h-4 w-4/5 rounded-md" />
                <Shimmer className="h-4 w-2/3 rounded-md" />
              </div>
            </div>

            {/* Financial Summary Skeleton */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-surface-200 dark:border-dark-border shadow-sm space-y-4">
              <Shimmer className="h-5 w-40 rounded-lg" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Shimmer className="h-4 w-20 rounded-md" />
                  <Shimmer className="h-4 w-24 rounded-md" />
                </div>
                <div className="flex justify-between">
                  <Shimmer className="h-4 w-24 rounded-md" />
                  <Shimmer className="h-4 w-16 rounded-md" />
                </div>
                <div className="flex justify-between pt-3 border-t border-surface-100 dark:border-dark-border">
                  <Shimmer className="h-6 w-24 rounded-lg" />
                  <Shimmer className="h-6 w-32 rounded-lg" />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderDetailSkeleton;
