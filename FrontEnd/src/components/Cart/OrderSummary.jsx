import React from "react";
import { FiPercent, FiTruck, FiShield, FiRefreshCw, FiArrowRight } from "react-icons/fi";
import Button from "../UI/Button";

const OrderSummary = ({ 
  selectedItems, 
  subtotal, 
  discount = 0, 
  onApplyVoucher, 
  appliedVoucher,
  onCheckout,
  loading = false,
  isCheckoutPage = false
}) => {
  const finalTotal = Math.max(0, subtotal - discount);
  const selectedCount = selectedItems.length;

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-surface-100 overflow-hidden">
      {/* Header - Subtle for Checkout, Bold for Cart */}
      {!isCheckoutPage && (
        <div className="p-8 bg-surface-900 text-white">
          <h2 className="text-xl font-display font-bold mb-1 leading-none">Thanh toán</h2>
          <p className="text-surface-400 text-[10px] font-bold uppercase tracking-widest">
            {selectedCount} sản phẩm đã chọn
          </p>
        </div>
      )}

      <div className="p-8 space-y-6">
        {/* Voucher Input (Optional) */}
        {!isCheckoutPage && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest ml-1">Mã giảm giá</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiPercent className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
                <input 
                  type="text" 
                  placeholder="Mã voucher..."
                  className="w-full h-11 pl-11 pr-4 bg-surface-50 border border-surface-200 rounded-xl text-xs font-bold focus:bg-white focus:border-primary/40 outline-none transition-all uppercase"
                />
              </div>
              <Button variant="secondary" size="sm" className="rounded-xl h-11">
                Áp dụng
              </Button>
            </div>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-dark-border">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Tạm tính ({selectedCount} sp)</span>
            <span className="text-slate-900 dark:text-white">{subtotal.toLocaleString()} ₫</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Giảm giá</span>
              <span className="text-danger font-bold">-{discount.toLocaleString()} ₫</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Phí vận chuyển</span>
            <div className="flex items-center gap-1.5 text-success font-bold italic">
              <FiTruck size={14} />
              <span>MIỄN PHÍ</span>
            </div>
          </div>
          
          <div className="pt-6 mt-4 border-t-2 border-dashed border-slate-100 dark:border-dark-border flex justify-between items-end">
            <span className="text-slate-900 dark:text-white font-bold text-base">Tổng cộng</span>
            <div className="text-right">
              <p className="text-2xl font-black text-primary dark:text-brand tracking-tighter leading-none">
                {finalTotal.toLocaleString()} ₫
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest">Đã bao gồm VAT</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        {!isCheckoutPage && (
          <Button 
            className="w-full h-14 rounded-2xl tracking-widest"
            variant="primary"
            onClick={onCheckout}
            disabled={selectedCount === 0}
            loading={loading}
          >
            TIẾN HÀNH THANH TOÁN <FiArrowRight className="ml-2" />
          </Button>
        )}

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex flex-col items-center gap-1.5 opacity-30">
            <FiShield className="text-success" />
            <span className="text-[7px] font-bold uppercase">Bảo mật</span>
          </div>
          <div className="w-px h-4 bg-surface-100"></div>
          <div className="flex flex-col items-center gap-1.5 opacity-30">
            <FiRefreshCw className="text-primary" />
            <span className="text-[7px] font-bold uppercase">7 Ngày</span>
          </div>
          <div className="w-px h-4 bg-surface-100"></div>
          <div className="flex flex-col items-center gap-1.5 opacity-30">
            <FiTruck className="text-indigo-500" />
            <span className="text-[7px] font-bold uppercase">Freeship</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
