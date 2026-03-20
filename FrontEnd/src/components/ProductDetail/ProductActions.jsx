import React from "react";
import { FiShoppingCart, FiCreditCard } from "react-icons/fi";
import Button from "../UI/Button";

const ProductActions = ({ 
  stock, 
  quantity, 
  setQuantity, 
  onAddToCart, 
  onBuyNow, 
  onPredict,
  addingCart,
  loadingPredict,
  isActive
}) => {
  const isOutOfStock = stock < 1 || !isActive;

  return (
    <div className="space-y-6 pt-8 border-t border-slate-100 mt-auto">
      {/* Quantity Selector */}
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold text-slate-700">Số lượng:</span>
        <div className="flex items-center bg-surface-100 rounded-2xl p-1 shadow-inner border border-slate-200">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center font-bold text-slate-500 hover:text-primary transition-colors bg-white rounded-xl shadow-sm active:scale-90"
            disabled={isOutOfStock}
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value), stock)))}
            className="w-14 text-center bg-transparent border-none text-sm font-black focus:ring-0"
            disabled={isOutOfStock}
          />
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="w-10 h-10 flex items-center justify-center font-bold text-slate-500 hover:text-primary transition-colors bg-white rounded-xl shadow-sm active:scale-90"
            disabled={isOutOfStock}
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          variant="secondary"
          size="lg"
          icon={FiShoppingCart}
          onClick={onAddToCart}
          loading={addingCart}
          disabled={isOutOfStock}
          className="h-14 !rounded-2xl border-2 !text-primary border-primary hover:bg-primary/5 font-black uppercase tracking-widest"
        >
          THÊM VÀO GIỎ
        </Button>

        <Button
          variant="primary"
          size="lg"
          icon={FiCreditCard}
          onClick={onBuyNow}
          disabled={isOutOfStock}
          className="h-14 !rounded-2xl font-black uppercase tracking-widest"
        >
          MUA NGAY
        </Button>
      </div>

      {/* AI Prediction Button */}
      <Button
        variant="ghost"
        onClick={onPredict}
        loading={loadingPredict}
        disabled={isOutOfStock}
        className="w-full h-14 bg-amber-50 text-amber-600 !rounded-2xl border border-amber-200 hover:bg-amber-100 font-bold tracking-tight"
      >
        🔮 DỰ ĐOÁN GIÁ TƯƠNG LAI BẰNG AI
      </Button>
    </div>
  );
};

export default React.memo(ProductActions);
