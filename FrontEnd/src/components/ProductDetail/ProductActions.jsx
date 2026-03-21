import React from "react";
import { FiShoppingCart, FiCreditCard, FiClock } from "react-icons/fi";
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
  const isOutOfStock = stock < 1;
  const isPreOrder = isOutOfStock && isActive;
  const isDisabled = !isActive || (isOutOfStock && !isPreOrder); // Currently, we allow pre-order if isActive

  // If we want to strictly follow "disable if out of stock", then:
  // const isDisabled = isOutOfStock || !isActive;
  // But the user mentioned "Đặt trước", so let's allow it if it's "Đặt trước".
  // For now, let's stick to allowing it if it's active.
  
  const canAction = isActive; 

  return (
    <div className="space-y-6 pt-8 border-t border-slate-100 mt-auto">
      {/* Quantity Selector */}
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold text-slate-700">Số lượng:</span>
        <div className="flex items-center bg-surface-100 rounded-2xl p-1 shadow-inner border border-slate-200">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center font-bold text-slate-500 hover:text-primary transition-colors bg-white rounded-xl shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canAction}
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={stock > 0 ? stock : 99}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value), stock > 0 ? stock : 99)))}
            className="w-14 text-center bg-transparent border-none text-sm font-black focus:ring-0"
            disabled={!canAction}
          />
          <button
            onClick={() => setQuantity(stock > 0 ? Math.min(stock, quantity + 1) : quantity + 1)}
            className="w-10 h-10 flex items-center justify-center font-bold text-slate-500 hover:text-primary transition-colors bg-white rounded-xl shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canAction}
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
          icon={isPreOrder ? FiClock : FiShoppingCart}
          onClick={onAddToCart}
          loading={addingCart}
          disabled={!canAction}
          className={`h-14 !rounded-2xl border-2 font-black uppercase tracking-widest ${
            isPreOrder 
              ? "!text-amber-600 border-amber-200 hover:bg-amber-50" 
              : "!text-primary border-primary hover:bg-primary/5"
          }`}
        >
          {isPreOrder ? "ĐẶT TRƯỚC" : "THÊM VÀO GIỎ"}
        </Button>

        <Button
          variant={isPreOrder ? "secondary" : "primary"}
          size="lg"
          icon={FiCreditCard}
          onClick={onBuyNow}
          disabled={!canAction}
          className={`h-14 !rounded-2xl font-black uppercase tracking-widest ${
            isPreOrder ? "bg-amber-500 hover:bg-amber-600 text-white border-none" : ""
          }`}
        >
          {isPreOrder ? "ĐẶT TRƯỚC NGAY" : "MUA NGAY"}
        </Button>
      </div>

      {/* AI Prediction Button */}
      <Button
        variant="ghost"
        onClick={onPredict}
        loading={loadingPredict}
        disabled={!isActive}
        className="w-full h-14 bg-slate-50 text-slate-600 !rounded-2xl border border-slate-200 hover:bg-slate-100 font-bold tracking-tight"
      >
        🔮 DỰ ĐOÁN GIÁ TƯƠNG LAI BẰNG AI
      </Button>
    </div>
  );
};

export default React.memo(ProductActions);
