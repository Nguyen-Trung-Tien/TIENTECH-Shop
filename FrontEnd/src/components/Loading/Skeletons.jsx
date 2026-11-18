import React from "react";

export const Skeleton = ({ className = "" }) => (
  <div
    className={`bg-gray-200 dark:bg-dark-surface animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-dark-surface dark:via-dark-border dark:to-dark-surface bg-[length:2000px_100%] ${className}`}
  />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-[24px] p-4 border border-slate-200/70 dark:border-slate-800/80 shadow-sm h-full flex flex-col gap-4 overflow-hidden relative">
    <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800/60 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
    <div className="space-y-3 pt-1 flex-1 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/80 rounded-md" />
        </div>
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/80 rounded-md" />
        <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/80 rounded-md" />
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="h-5 w-24 bg-blue-500/15 dark:bg-blue-500/20 rounded-md" />
        <div className="size-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  </div>
);

export const CartSkeleton = () => (
  <div className="p-4 space-y-4 max-w-4xl mx-auto">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="flex items-center p-4 bg-white dark:bg-dark-surface rounded-2xl border border-surface-100 dark:border-dark-border shadow-soft animate-pulse transition-colors"
      >
        <div className="w-[80px] h-[80px] min-w-[80px] bg-surface-100 dark:bg-dark-border rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        <div className="ml-5 flex-1 space-y-3 min-w-0">
          <div className="h-4 bg-surface-100 dark:bg-dark-border rounded-full w-[70%] max-w-[240px]" />
          <div className="h-3 bg-surface-50 dark:bg-slate-800 rounded-full w-[40%] max-w-[120px]" />
          <div className="flex items-center gap-2 mt-2">
            <div className="size-6 bg-surface-50 dark:bg-slate-800 rounded-md" />
            <div className="w-8 h-4 bg-surface-50 dark:bg-slate-800 rounded-md" />
            <div className="size-6 bg-surface-50 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
        <div className="size-10 min-w-[40px] bg-surface-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <div className="size-4 bg-surface-200 dark:bg-slate-700 rounded-sm" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
