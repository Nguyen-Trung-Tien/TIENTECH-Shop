import React from "react";
import { FiClock, FiCheckCircle, FiPackage, FiTruck } from "react-icons/fi";

const steps = [
  { key: "pending", label: "Chờ xử lý", icon: FiClock },
  { key: "confirmed", label: "Đã xác nhận", icon: FiCheckCircle },
  { key: "processing", label: "Đang xử lý", icon: FiPackage },
  { key: "shipped", label: "Đang giao", icon: FiTruck },
  { key: "delivered", label: "Đã giao", icon: FiCheckCircle },
  { key: "completed", label: "Hoàn tất", icon: FiCheckCircle },
];

const OrderDetailStepper = ({ orderStatus }) => {
  const currentStepIndex = steps.findIndex((s) => s.key === orderStatus);
  const isCancelled = orderStatus === "cancelled" || orderStatus === "cancel_requested";

  if (isCancelled) return null;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[32px] p-4 sm:p-6 md:p-10 border border-surface-200 dark:border-dark-border shadow-sm mb-6 sm:mb-10 print:hidden">
      {/* Mobile Compact Status */}
      <div className="md:hidden flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
            {(() => {
              const currentStep = steps[currentStepIndex] || steps[0];
              const Icon = currentStep.icon;
              return Icon && (typeof Icon === "function" ? <Icon size={18} /> : Icon);
            })()}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary block">
              Trạng thái đơn hàng (Bước {currentStepIndex + 1}/{steps.length})
            </span>
            <span className="text-sm font-black text-primary truncate block">
              {steps[currentStepIndex]?.label || "Đang xử lý"}
            </span>
          </div>
        </div>
        <div className="w-20 bg-slate-100 dark:bg-dark-bg h-2 rounded-full overflow-hidden shrink-0">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <div className="relative flex justify-between">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-dark-bg -translate-y-1/2 z-0"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          ></div>

          {steps.map((step, idx) => {
            const isActive = idx <= currentStepIndex;
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`size-12 rounded-full flex items-center justify-center border-4 dark:border-dark-surface transition-all duration-500 ${
                    isActive
                      ? "bg-primary text-white scale-110 shadow-lg"
                      : "bg-slate-100 dark:bg-dark-bg text-slate-400 dark:text-dark-text-secondary"
                  }`}
                >
                  {Icon && (typeof Icon === "function" ? <Icon size={20} /> : Icon)}
                </div>
                <span
                  className={`absolute top-16 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                    isActive ? "text-primary" : "text-slate-400 dark:text-dark-text-secondary"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-20"></div>
      </div>
    </div>
  );
};

export default OrderDetailStepper;
