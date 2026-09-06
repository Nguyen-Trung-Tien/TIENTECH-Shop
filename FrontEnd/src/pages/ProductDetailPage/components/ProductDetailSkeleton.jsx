import React from "react";

const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/70 rounded-2xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
  </div>
);

const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-dark-bg py-8 md:py-12 transition-colors duration-300">
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb Placeholder */}
        <div className="flex items-center gap-2">
          <Shimmer className="h-4 w-16 rounded-md" />
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Shimmer className="h-4 w-24 rounded-md" />
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Shimmer className="h-4 w-40 rounded-md" />
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery Skeleton */}
          <div className="lg:col-span-6 space-y-4">
            <Shimmer className="aspect-square w-full rounded-3xl" />
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Shimmer key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Right Column: Product Info & Buy Box Skeleton */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shimmer className="h-6 w-24 rounded-full" />
                <Shimmer className="h-6 w-20 rounded-full" />
              </div>
              <Shimmer className="h-9 w-4/5 rounded-xl" />
              <Shimmer className="h-5 w-2/5 rounded-lg" />
            </div>

            {/* Price Box Skeleton */}
            <div className="p-6 rounded-3xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border shadow-sm space-y-3">
              <div className="flex items-baseline gap-4">
                <Shimmer className="h-10 w-44 rounded-xl" />
                <Shimmer className="h-6 w-28 rounded-lg" />
              </div>
              <Shimmer className="h-4 w-56 rounded-md" />
            </div>

            {/* Variant Options Skeleton */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Shimmer className="h-4 w-24 rounded-md" />
                <div className="flex gap-3">
                  <Shimmer className="h-12 w-28 rounded-2xl" />
                  <Shimmer className="h-12 w-28 rounded-2xl" />
                  <Shimmer className="h-12 w-28 rounded-2xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Shimmer className="h-4 w-20 rounded-md" />
                <div className="flex gap-3">
                  <Shimmer className="h-12 w-32 rounded-2xl" />
                  <Shimmer className="h-12 w-32 rounded-2xl" />
                </div>
              </div>
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Shimmer className="h-14 rounded-2xl" />
              <Shimmer className="h-14 rounded-2xl" />
            </div>

            {/* Trust Badges Skeleton */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Shimmer className="h-20 rounded-2xl" />
              <Shimmer className="h-20 rounded-2xl" />
              <Shimmer className="h-20 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Specifications Section Skeleton */}
        <div className="mt-14 p-8 rounded-3xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border shadow-sm space-y-6">
          <Shimmer className="h-7 w-48 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
