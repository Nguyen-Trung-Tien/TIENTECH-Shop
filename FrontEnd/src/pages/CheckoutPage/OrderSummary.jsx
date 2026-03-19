import React, { useState } from "react";
import { FiTruck, FiBox, FiShield, FiTag, FiCheck } from "react-icons/fi";
import { getImage } from "../../utils/decodeImage";

const OrderSummary = ({ 
  selectedItems, 
  subtotal, 
  discount, 
  finalTotal, 
  onApplyVoucher, 
  appliedVoucher 
}) => {
  const [voucherInput, setVoucherInput] = useState("");

  return (
    <div className="bg-white dark:bg-dark-surface rounded-[2rem] shadow-soft border border-surface-200/60 dark:border-dark-border overflow-hidden transition-colors">
      {/* HEADER */}
      <div className="p-8 bg-surface-900 text-white flex items-center gap-3">
        <FiBox size={20} className="text-primary" />
        <h2 className="text-xl font-display uppercase tracking-wider">Tóm tắt đơn hàng</h2>
      </div>

      {/* BODY */}
      <div className="p-8 space-y-6">
        {/* Items List */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {selectedItems.map((item) => {
            const price = item.product?.discount
              ? (item.product.price * (100 - item.product.discount)) / 100
              : item.product.price;

            return (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-16 h-16 bg-surface-50 dark:bg-dark-bg rounded-xl border border-surface-100 dark:border-dark-border p-1 flex-shrink-0">
                   <img 
                    src={getImage(item.product.image)} 
                    alt={item.product.name} 
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform group-hover:scale-110"
                   />
                </div>

                <div className="flex-grow min-w-0">
                  <h4 className="text-[13px] font-bold text-surface-900 dark:text-dark-text-primary line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-surface-400 font-black mt-1 uppercase tracking-widest">
                    Số lượng: {item.quantity}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-surface-900 dark:text-dark-text-primary tracking-tight">
                    {(price * item.quantity).toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* VOUCHER INPUT */}
        <div className="pt-6 border-t border-surface-100 dark:border-dark-border">
          <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-3 block">
            Mã giảm giá
          </label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Nhập mã..."
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                disabled={!!appliedVoucher}
                className="w-full pl-11 pr-4 py-3 bg-surface-50 dark:bg-dark-bg border border-surface-200 dark:border-dark-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
              />
            </div>
            {appliedVoucher ? (
              <button 
                className="px-4 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs transition-all flex items-center gap-2"
                disabled
              >
                <FiCheck /> OK
              </button>
            ) : (
              <button
                onClick={() => onApplyVoucher(voucherInput)}
                className="px-6 py-3 bg-surface-900 dark:bg-brand text-white rounded-xl font-black text-xs hover:bg-primary transition-all shadow-lg shadow-surface-900/10"
              >
                ÁP DỤNG
              </button>
            )}
          </div>
          {appliedVoucher && (
            <p className="text-[11px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
              <FiCheck /> Đã áp dụng mã: <span className="underline">{appliedVoucher}</span>
            </p>
          )}
        </div>

        {/* TOTALS */}
        <div className="pt-6 border-t border-surface-100 dark:border-dark-border space-y-3">
          <div className="flex justify-between items-center text-surface-500 dark:text-dark-text-secondary font-medium text-sm">
            <span>Tạm tính</span>
            <span className="text-surface-900 dark:text-dark-text-primary font-bold">{subtotal.toLocaleString("vi-VN")}₫</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-emerald-500 font-medium text-sm">
              <span>Giảm giá</span>
              <span className="font-bold">-{discount.toLocaleString("vi-VN")}₫</span>
            </div>
          )}

          <div className="flex justify-between items-center text-surface-500 dark:text-dark-text-secondary font-medium text-sm">
            <div className="flex items-center gap-2">
               <FiTruck className="text-primary" />
               <span>Phí vận chuyển</span>
            </div>
            <span className="text-emerald-500 font-bold tracking-tight">MIỄN PHÍ</span>
          </div>

          <div className="pt-4 mt-2 border-t-2 border-dashed border-surface-100 dark:border-dark-border flex justify-between items-end">
             <span className="text-surface-900 dark:text-dark-text-primary font-display text-lg">Tổng cộng</span>
             <div className="text-right">
                <p className="text-3xl font-black text-primary dark:text-brand tracking-tighter leading-none">
                  {finalTotal.toLocaleString("vi-VN")}₫
                </p>
                <p className="text-[10px] text-surface-400 mt-2 uppercase font-black tracking-widest leading-none">ĐÃ BAO GỒM THUẾ VAT</p>
             </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-8 py-5 bg-surface-50 dark:bg-dark-bg/50 border-t border-surface-100 dark:border-dark-border flex items-center justify-center gap-2">
        <FiShield className="text-emerald-500" />
        <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest text-center">
          Thanh toán an toàn – Bảo mật 100%
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;

