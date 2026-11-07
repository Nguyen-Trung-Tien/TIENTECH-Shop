import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

const StatsCard = ({ title, value, icon, change, isIncrease }) => {
  return (
    <Motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-dark-surface p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-dark-border/80 shadow-2xs hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40 dark:hover:border-primary/40 group cursor-pointer h-full flex flex-col justify-between relative overflow-hidden transition-all duration-200 min-w-0"
    >
      {/* Background subtle radial glow */}
      <div className="absolute -right-6 -top-6 size-24 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/15 transition-colors pointer-events-none" />

      <div className="relative z-10 min-w-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-dark-bg flex items-center justify-center text-primary dark:text-blue-400 text-lg sm:text-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-2xs border border-slate-100 dark:border-dark-border shrink-0">
            {icon}
          </div>

          {change && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold tracking-tight shrink-0 ${
                isIncrease
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                  : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20"
              }`}
            >
              {isIncrease ? (
                <FiTrendingUp className="text-xs" />
              ) : (
                <FiTrendingDown className="text-xs" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary mb-1 truncate">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary dark:group-hover:text-blue-400 transition-colors truncate">
            {value}
          </h3>
        </div>
      </div>

      {/* Modern Accent Indicator */}
      <div className="mt-3 sm:mt-4 h-1 w-full bg-slate-100 dark:bg-dark-bg rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 w-1/4 group-hover:w-full ${
            isIncrease ? "bg-emerald-500" : "bg-rose-500"
          } opacity-80`}
        />
      </div>
    </Motion.div>
  );
};

export default StatsCard;
