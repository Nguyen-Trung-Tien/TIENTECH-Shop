import React from "react";
import {
  FiPercent,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiArrowRight,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import Button from "../UI/Button";

/**
 * OrderSummary Component
 * Hiển thị tóm tắt đơn hàng, phí vận chuyển và nút thanh toán
 */
const OrderSummary = ({
  items = [],
  subtotal = 0,
  onCheckout,
  appliedVoucher = null,
  isCheckoutPage = false,
}) => {
  const shippingFee = subtotal > 5000000 ? 0 : 30000;
  const discountAmount = appliedVoucher
    ? Number(appliedVoucher.discountAmount)
    : 0;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 text-gray-900 dark:text-white shadow-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
        <FiCheckCircle className="text-primary" />
        Tóm tắt đơn hàng
      </h2>

      <div className="space-y-5 mb-8">
        <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
          <span className="text-xs font-bold uppercase tracking-wider">
            Tạm tính ({items.length} món)
          </span>
          <span className="font-black text-gray-900 dark:text-white">
            {subtotal.toLocaleString()}₫
          </span>
        </div>

        <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
          <span className="text-xs font-bold uppercase tracking-wider">
            Phí vận chuyển
          </span>
          <span className="font-black text-emerald-500">
            {shippingFee === 0
              ? "MIỄN PHÍ"
              : `${shippingFee.toLocaleString()}₫`}
          </span>
        </div>

        {appliedVoucher && (
          <div className="flex justify-between items-center text-emerald-500">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <FiPercent /> Giảm giá ({appliedVoucher.code})
            </span>
            <span className="font-black">
              -{discountAmount.toLocaleString()}₫
            </span>
          </div>
        )}

        <div className="pt-5 border-t border-gray-200 dark:border-gray-800 flex justify-between items-end">
          <div>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
              Tổng thanh toán
            </span>
            <span className="text-3xl font-black text-primary tracking-tighter">
              {total.toLocaleString()}₫
            </span>
          </div>

          {shippingFee === 0 && (
            <div className="mb-1">
              <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                Tiết kiệm{" "}
                {discountAmount > 0
                  ? (discountAmount + 30000).toLocaleString()
                  : "30.000"}
                ₫
              </span>
            </div>
          )}
        </div>
      </div>

      {!isCheckoutPage && (
        <Button
          variant="primary"
          className="w-full h-16 rounded-2xl font-black text-sm tracking-[0.2em] mb-8 group"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          TIẾP TỤC THANH TOÁN
          <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
            <FiShield size={14} />
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
            Bảo mật tuyệt đối
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
            <FiRefreshCw size={14} />
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
            Đổi trả 7 ngày
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrderSummary);
