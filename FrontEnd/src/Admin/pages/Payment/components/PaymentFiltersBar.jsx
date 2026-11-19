import React from "react";
import { ChevronDown, Search } from "lucide-react";

const PaymentFiltersBar = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  filterStatus,
  onFilterStatusChange,
  filterMethod,
  onFilterMethodChange,
  searchTerm,
  onSearchTermChange,
  onApplyFilters,
}) => {
  return (
    <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-xs flex flex-wrap items-center gap-4 print:hidden">
      <div className="flex items-center gap-2">
        <input
          type="date"
          aria-label="Từ ngày"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all text-slate-900 dark:text-dark-text-primary"
        />
        <span className="text-slate-400">-</span>
        <input
          type="date"
          aria-label="Đến ngày"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all text-slate-900 dark:text-dark-text-primary"
        />
      </div>

      <div className="relative min-w-[160px]">
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          aria-label="Lọc trạng thái thanh toán"
          className="w-full h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all appearance-none pr-10 text-slate-900 dark:text-dark-text-primary"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ xử lý</option>
          <option value="completed">Đã thanh toán</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Đã hoàn tiền</option>
        </select>
        <ChevronDown className="size-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      <div className="relative min-w-[160px]">
        <select
          value={filterMethod}
          onChange={(e) => onFilterMethodChange(e.target.value)}
          aria-label="Lọc phương thức thanh toán"
          className="w-full h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all appearance-none pr-10 text-slate-900 dark:text-dark-text-primary"
        >
          <option value="all">Phương thức</option>
          <option value="cod">COD</option>
          <option value="vnpay">VNPay</option>
          <option value="momo">Momo</option>
          <option value="paypal">Paypal</option>
          <option value="bank">Chuyển khoản</option>
        </select>
        <ChevronDown className="size-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      <div className="relative flex-1 min-w-[200px] group">
        <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
        <input
          type="text"
          placeholder="Tìm theo Mã đơn, ID..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl pl-12 pr-4 text-sm font-bold focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none text-slate-900 dark:text-dark-text-primary"
        />
      </div>

      <button
        type="button"
        onClick={onApplyFilters}
        className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap cursor-pointer"
      >
        Lọc
      </button>
    </div>
  );
};

export default PaymentFiltersBar;
