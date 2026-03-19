const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-[32px] p-6 border border-surface-200 shadow-sm animate-pulse h-full flex flex-col gap-4">
      {/* Skeleton Image */}
      <div className="relative aspect-square w-full bg-surface-100 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
      </div>

      {/* Skeleton Info */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
           <div className="h-3 w-16 bg-surface-100 rounded-lg"></div>
           <div className="h-3 w-12 bg-surface-50 rounded-lg ml-auto"></div>
        </div>
        
        <div className="space-y-2">
           <div className="h-4 w-full bg-surface-100 rounded-lg"></div>
           <div className="h-4 w-2/3 bg-surface-100 rounded-lg"></div>
        </div>

        <div className="pt-4 flex items-center justify-between">
           <div className="h-6 w-24 bg-primary/10 rounded-lg"></div>
           <div className="h-8 w-8 bg-surface-50 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
