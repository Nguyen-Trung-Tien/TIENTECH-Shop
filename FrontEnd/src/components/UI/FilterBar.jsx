import React from "react";
import { FiSearch, FiX } from "react-icons/fi";
import Input from "./Input";
import { Button } from "./Button";

/**
 * Unified search & filter toolbar for User & Admin list pages.
 */
const FilterBar = ({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  children,
  onReset,
  showReset = false,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center gap-3 min-w-0 ${className}`}
    >
      {onSearchChange && (
        <div className="relative flex-1 min-w-0">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            icon={<FiSearch className="w-4 h-4" />}
            className="w-full"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 dark:hover:text-white p-1"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {children && (
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          {children}
        </div>
      )}

      {showReset && onReset && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="shrink-0"
        >
          Đặt lại
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
