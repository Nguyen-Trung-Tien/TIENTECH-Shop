import React from "react";
import { TABS } from "../orderConstants";

const OrderFiltersBar = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white dark:bg-dark-surface p-2 rounded-2xl border border-slate-100 dark:border-dark-border shadow-2xs overflow-x-auto custom-scrollbar">
      <div className="flex items-center gap-1 min-w-max">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-500 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderFiltersBar;
