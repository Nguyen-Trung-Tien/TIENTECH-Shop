import React from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { Input, Select, Button } from "../../../../components/UI";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "completed", label: "Đã thanh toán" },
  { value: "failed", label: "Thất bại" },
  { value: "refunded", label: "Đã hoàn tiền" },
];

const METHOD_OPTIONS = [
  { value: "all", label: "Tất cả phương thức" },
  { value: "cod", label: "COD" },
  { value: "vnpay", label: "VNPay" },
  { value: "momo", label: "Momo" },
  { value: "paypal", label: "Paypal" },
  { value: "bank", label: "Chuyển khoản" },
];

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
    <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-xs flex flex-wrap items-center gap-3 sm:gap-4 print:hidden">
      <div className="flex items-center gap-2">
        <div className="w-36 sm:w-40">
          <Input
            type="date"
            aria-label="Từ ngày"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="text-xs font-bold"
          />
        </div>
        <span className="text-slate-400 font-bold">-</span>
        <div className="w-36 sm:w-40">
          <Input
            type="date"
            aria-label="Đến ngày"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="text-xs font-bold"
          />
        </div>
      </div>

      <div className="w-full sm:w-44">
        <Select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          options={STATUS_OPTIONS}
          aria-label="Lọc trạng thái thanh toán"
          className="text-xs font-bold"
        />
      </div>

      <div className="w-full sm:w-44">
        <Select
          value={filterMethod}
          onChange={(e) => onFilterMethodChange(e.target.value)}
          options={METHOD_OPTIONS}
          aria-label="Lọc phương thức thanh toán"
          className="text-xs font-bold"
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Input
          type="text"
          placeholder="Tìm theo Mã đơn, ID..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          icon={<Search size={16} />}
          className="text-xs font-bold"
        />
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={onApplyFilters}
        icon={<Filter className="size-4" />}
        className="h-11 px-6 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap"
      >
        Lọc
      </Button>
    </div>
  );
};

export default PaymentFiltersBar;
