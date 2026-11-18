import React from "react";
import {
  FiPercent,
  FiShield,
  FiRefreshCw,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "../../components/UI/Button";
import { useSystemSettings } from "../../context/useSystemSettings";
import { calculatePointsEarned } from "../../utils/loyaltyHelper";

const OrderSummary = ({
  selectedItems = [],
  subtotal = 0,
  appliedVoucher = null,
  pointsUsed = 0,
  pointsDiscount = 0,
  onPlaceOrder,
  onPayPalApprove,
  paymentMethod = "COD",
  loading = false,
}) => {
  const { defaultShippingFee, freeshipMinOrder } = useSystemSettings();
  const shippingFee = subtotal >= freeshipMinOrder ? 0 : defaultShippingFee;
  const discountAmount = appliedVoucher
    ? Number(appliedVoucher.discountAmount)
    : 0;
  const loyaltyDiscount = Math.max(0, Number(pointsDiscount) || 0);
  const total = Math.max(
    0,
    subtotal + shippingFee - discountAmount - loyaltyDiscount,
  );
  const expectedEarnedPoints = calculatePointsEarned(total);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-[32px] p-8 text-gray-900 dark:text-white shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden relative">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 size-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />

      <h2 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3 relative z-10">
        <FiCheckCircle className="text-primary" />
        Xác nhận thanh toán
      </h2>

      <div className="space-y-5 mb-8 relative z-10">
        <div className="flex justify-between items-center text-gray-500 dark:text-dark-text-secondary">
          <span className="text-xs font-bold uppercase tracking-wider">
            Tạm tính ({selectedItems.length} món)
          </span>
          <span className="font-black text-gray-900 dark:text-white">
            {subtotal.toLocaleString()}₫
          </span>
        </div>

        <div className="flex justify-between items-center text-gray-500 dark:text-dark-text-secondary">
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
          <div className="flex justify-between items-center text-emerald-500 animate-in fade-in slide-in-from-right-4">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <FiPercent /> Giảm giá ({appliedVoucher.code})
            </span>
            <span className="font-black">
              -{discountAmount.toLocaleString()}₫
            </span>
          </div>
        )}

        {pointsUsed > 0 && loyaltyDiscount > 0 && (
          <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              Đổi {pointsUsed.toLocaleString()} điểm thưởng
            </span>
            <span className="font-black">
              -{loyaltyDiscount.toLocaleString()}₫
            </span>
          </div>
        )}

        <div className="pt-6 border-t border-gray-200 dark:border-dark-border flex justify-between items-end gap-3 flex-wrap">
          <div>
            <span className="block text-[10px] font-black text-gray-400 dark:text-dark-text-secondary uppercase tracking-[0.2em] mb-1">
              Tổng cộng
            </span>
            <span className="text-4xl font-black text-primary tracking-tighter">
              {total.toLocaleString()}₫
            </span>
          </div>
          {expectedEarnedPoints > 0 && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              +{expectedEarnedPoints.toLocaleString()} điểm khi hoàn tất
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10">
        {paymentMethod === "PAYPAL" ? (
          <div className="mt-4">
            <PayPalButtons
              style={{ layout: "vertical", shape: "pill", color: "blue" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: (total / 25000).toFixed(2),
                      },
                    },
                  ],
                });
              }}
              onApprove={onPayPalApprove}
            />
          </div>
        ) : (
          <Button
            variant="default"
            className="w-full h-16 rounded-2xl font-black text-sm tracking-[0.2em] mb-8 group shadow-xl shadow-primary/20"
            onClick={onPlaceOrder}
            loading={loading}
            disabled={selectedItems.length === 0 || loading}
          >
            {paymentMethod === "VNPAY" ? "THANH TOÁN VNPAY" : "ĐẶT HÀNG NGAY"}
            <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-200 dark:border-dark-border relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center text-gray-500">
            <FiShield size={14} />
          </div>
          <span className="text-[9px] font-bold text-gray-400 dark:text-dark-text-secondary uppercase tracking-widest leading-tight">
            Bảo mật giao dịch
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center text-gray-500">
            <FiRefreshCw size={14} />
          </div>
          <span className="text-[9px] font-bold text-gray-400 dark:text-dark-text-secondary uppercase tracking-widest leading-tight">
            Chính hãng 100%
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrderSummary);
