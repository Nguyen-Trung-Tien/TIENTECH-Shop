const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-[24px] p-4 border border-slate-200/70 dark:border-slate-800/80 shadow-sm h-full flex flex-col gap-4 overflow-hidden relative">
      {/* Skeleton Image Container */}
      <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800/60 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      </div>

      {/* Skeleton Info */}
      <div className="space-y-3 pt-1 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/80 rounded-md"></div>
          </div>
          
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/80 rounded-md"></div>
          <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/80 rounded-md"></div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="h-5 w-24 bg-blue-500/15 dark:bg-blue-500/20 rounded-md"></div>
          <div className="size-8 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
