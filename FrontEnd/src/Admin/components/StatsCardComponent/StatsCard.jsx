import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

const StatsCard = ({ title, value, icon, change, isIncrease }) => {
  return (
    <Motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200 dark:border-dark-border shadow-soft group cursor-pointer h-full flex flex-col justify-between relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-dark-bg flex items-center justify-center text-primary text-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100 dark:border-dark-border">
            {icon}
          </div>

          {change && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${
                isIncrease
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                  : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20"
              }`}
            >
              {isIncrease ? (
                <FiTrendingUp className="text-sm" />
              ) : (
                <FiTrendingDown className="text-sm" />
              )}
              {change}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-dark-text-secondary mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
            {value}
          </h3>
        </div>
      </div>

      {/* Progress-like accent bar */}
      <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-dark-bg rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 w-0 group-hover:w-full ${
            isIncrease ? "bg-emerald-500" : "bg-rose-500"
          } opacity-60`}
        ></div>
      </div>
    </Motion.div>
  );
};

export default StatsCard;
