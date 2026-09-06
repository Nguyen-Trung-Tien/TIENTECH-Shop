import React from "react";

const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/70 rounded-2xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 4 Stat KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border shadow-soft space-y-4"
          >
            <div className="flex items-center justify-between">
              <Shimmer className="size-12 rounded-2xl" />
              <Shimmer className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <Shimmer className="h-4 w-28 rounded-md" />
              <Shimmer className="h-8 w-40 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Shimmer className="h-6 w-48 rounded-lg" />
              <Shimmer className="h-4 w-32 rounded-md" />
            </div>
            <Shimmer className="h-10 w-36 rounded-xl" />
          </div>
          <Shimmer className="h-72 w-full rounded-2xl" />
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border shadow-soft space-y-6">
          <div className="space-y-2">
            <Shimmer className="h-6 w-40 rounded-lg" />
            <Shimmer className="h-4 w-24 rounded-md" />
          </div>
          <Shimmer className="size-60 mx-auto rounded-full" />
        </div>
      </div>

      {/* Recent Transactions Table Skeleton */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <Shimmer className="h-6 w-44 rounded-lg" />
          <Shimmer className="h-8 w-24 rounded-xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <Shimmer className="size-9 rounded-full" />
                <div className="space-y-1">
                  <Shimmer className="h-4 w-32 rounded-md" />
                  <Shimmer className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Shimmer className="h-6 w-20 rounded-full" />
              <Shimmer className="h-5 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
