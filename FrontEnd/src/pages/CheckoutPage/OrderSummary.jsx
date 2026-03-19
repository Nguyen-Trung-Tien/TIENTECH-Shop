import React from "react";
import { FiTruck, FiBox, FiCreditCard, FiChevronDown, FiShield } from "react-icons/fi";
import { getImage } from "../../utils/decodeImage";

const OrderSummary = ({ selectedItems, total }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-soft border border-surface-200/60 overflow-hidden">
      {/* HEADER */}
      <div className="p-8 bg-surface-900 text-white flex items-center gap-3">
        <FiBox size={20} className="text-primary" />
        <h2 className="text-xl font-display uppercase tracking-wider">Tóm tắt đơn hàng</h2>
      </div>

      {/* BODY */}
      <div className="p-8 space-y-6">
        {/* Items List */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {selectedItems.map((item) => {
            const price = item.product?.discount
              ? (item.product.price * (100 - item.product.discount)) / 100
              : item.product.price;

            return (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-16 h-16 bg-surface-50 rounded-xl border border-surface-100 p-1 flex-shrink-0">
                   <img 
                    src={getImage(item.product.image)} 
                    alt={item.product.name} 
                    className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110"
                   />
                </div>

                <div className="flex-grow min-w-0">
                  <h4 className="text-[13px] font-bold text-surface-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-surface-400 font-black mt-1 uppercase tracking-widest">
                    Số lượng: {item.quantity}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-surface-900 tracking-tight">
                    {(price * item.quantity).toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOTALS */}
        <div className="pt-6 border-t border-surface-100 space-y-3">
          <div className="flex justify-between items-center text-surface-500 font-medium text-sm">
            <span>Tạm tính</span>
            <span className="text-surface-900 font-bold">{total.toLocaleString("vi-VN")}₫</span>
          </div>

          <div className="flex justify-between items-center text-surface-500 font-medium text-sm">
            <div className="flex items-center gap-2">
               <FiTruck className="text-primary" />
               <span>Phí vận chuyển</span>
            </div>
            <span className="text-emerald-500 font-bold tracking-tight">MIỄN PHÍ</span>
          </div>

          <div className="pt-4 mt-2 border-t-2 border-dashed border-surface-100 flex justify-between items-end">
             <span className="text-surface-900 font-display text-lg">Tổng cộng</span>
             <div className="text-right">
                <p className="text-3xl font-black text-primary tracking-tighter leading-none">{total.toLocaleString("vi-VN")}₫</p>
                <p className="text-[10px] text-surface-400 mt-2 uppercase font-black tracking-widest leading-none">ĐÃ BAO GỒM THUẾ VAT</p>
             </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-8 py-5 bg-surface-50 border-t border-surface-100 flex items-center justify-center gap-2">
        <FiShield className="text-emerald-500" />
        <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest text-center">
          Thanh toán an toàn – Bảo mật 100%
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;

