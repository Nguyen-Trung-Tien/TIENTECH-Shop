const CartSkeleton = () => {
  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center p-4 bg-white rounded-2xl border border-surface-100 shadow-soft animate-pulse"
        >
          {/* Skeleton Image Area */}
          <div className="w-[80px] h-[80px] min-w-[80px] bg-surface-100 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>

          {/* Skeleton Content Area */}
          <div className="ml-5 flex-1 space-y-3">
            {/* Title Skeleton */}
            <div className="h-4 bg-surface-100 rounded-full w-[70%] max-w-[240px]"></div>

            {/* Price Skeleton */}
            <div className="h-3 bg-surface-50 rounded-full w-[40%] max-w-[120px]"></div>

            {/* Quantity Controls Mockup */}
            <div className="flex items-center gap-2 mt-2">
              <div className="size-6 bg-surface-50 rounded-md"></div>
              <div className="w-8 h-4 bg-surface-50 rounded-md"></div>
              <div className="size-6 bg-surface-50 rounded-md"></div>
            </div>
          </div>

          {/* Skeleton Delete Button */}
          <div className="size-10 min-w-[40px] bg-surface-50 rounded-full flex items-center justify-center">
            <div className="size-4 bg-surface-200 rounded-sm"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartSkeleton;
