import React, { useState } from "react";
import { FiPercent, FiTruck, FiShield, FiRefreshCw, FiArrowRight, FiCheckCircle, FiX } from "react-icons/fi";
import Button from "../UI/Button";

/**
 * OrderSummary Component
 * Hiển thị tóm tắt đơn hàng, xử lý áp mã Voucher và tính toán tổng tiền.
 */
const OrderSummary = ({ 
  selectedItems = [], 
  subtotal = 0, 
  discount = 0, 
  onApplyVoucher, 
  appliedVoucher,
  onCheckout,
  loading = false,
  isCheckoutPage = false
}) => {
  const [voucherCode, setVoucherCode] = useState("");
  const finalTotal = Math.max(0, subtotal - discount);
  const selectedCount = selectedItems.length;

  const handleApply = () => {
    if (voucherCode.trim() && onApplyVoucher) {
      onApplyVoucher(voucherCode.trim());
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden sticky top-24">
      {/* Header - Subtle for Checkout, Bold for Cart */}
      {!isCheckoutPage && (
        <div className="p-8 bg-slate-900 text-white">
          <h2 className="text-xl font-display font-black mb-1 uppercase tracking-tight">Tóm tắt đơn hàng</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            {selectedCount} sản phẩm đã chọn
          </p>
        </div>
      )}

      <div className="p-8 space-y-8">
        {/* VOUCHER SECTION */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Mã giảm giá (Voucher)
          </p>
          
          {!appliedVoucher ? (
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <FiPercent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="NHẬP MÃ GIẢM GIÁ..."
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black focus:bg-white focus:border-primary/40 outline-none transition-all uppercase placeholder:text-slate-300"
                />
              </div>
              <Button 
                variant="primary" 
                onClick={handleApply}
                disabled={!voucherCode.trim() || selectedCount === 0}
                className="rounded-2xl h-14 px-6 font-black text-[11px] uppercase tracking-widest"
              >
                ÁP DỤNG
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <FiCheckCircle size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Đã áp dụng mã</p>
                  <p className="text-xs font-black text-emerald-700 uppercase">{appliedVoucher}</p>
                </div>
              </div>
              {/* Optional: Nút hủy mã nếu cần */}
              {/* <button className="text-emerald-400 hover:text-danger transition-colors p-2"><FiX size={18} /></button> */}
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-4 pt-6 border-t border-slate-50">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-400 uppercase tracking-widest">Tạm tính ({selectedCount} sp)</span>
            <span className="text-slate-900 font-black">{subtotal.toLocaleString("vi-VN")} ₫</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-widest">Giảm giá voucher</span>
              <span className="text-danger font-black bg-danger/5 px-2 py-1 rounded-lg">-{discount.toLocaleString("vi-VN")} ₫</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-400 uppercase tracking-widest">Phí vận chuyển</span>
            <div className="flex items-center gap-2 text-emerald-600 font-black">
              <FiTruck size={16} />
              <span className="tracking-widest">MIỄN PHÍ</span>
            </div>
          </div>
          
          <div className="pt-8 mt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-slate-900 font-black text-lg uppercase tracking-tight">Tổng thanh toán</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Đã bao gồm thuế GTGT (VAT)</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-primary tracking-tighter leading-none mb-1">
                {finalTotal.toLocaleString("vi-VN")} ₫
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isCheckoutPage && (
          <Button 
            className="w-full h-16 rounded-[20px] font-black text-sm uppercase tracking-[0.15em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
            variant="primary"
            onClick={onCheckout}
            disabled={selectedCount === 0}
            loading={loading}
          >
            ĐẶT HÀNG NGAY <FiArrowRight className="ml-3" size={20} />
          </Button>
        )}

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col items-center gap-2 text-center group">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
              <FiShield size={20} />
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bảo mật</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center group border-x border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
              <FiRefreshCw size={20} />
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Đổi trả</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center group">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all">
              <FiTruck size={20} />
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Freeship</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrderSummary);
