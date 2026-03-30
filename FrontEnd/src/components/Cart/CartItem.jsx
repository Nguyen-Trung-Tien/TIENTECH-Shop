import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/format";

/**
 * CartItem Component
 * Hiển thị thông tin chi tiết item trong giỏ hàng, bao gồm cả biến thể (Variant)
 */
const CartItem = ({ 
  item, 
  onUpdateQty, 
  onRemove, 
  onSelect, 
  isSelected, 
  isLast, 
  lastItemRef 
}) => {
  const navigate = useNavigate();

  // Logic giá: Ưu tiên giá tính sẵn từ backend (finalPrice)
  const finalPrice = useMemo(() => {
    if (item.finalPrice != null) return Number(item.finalPrice);
    
    // Fallback logic
    const base = item.variant?.price != null ? Number(item.variant.price) : Number(item.product?.basePrice || item.product?.price || 0);
    const disc = Number(item.product?.discount || 0);
    return Math.round(disc > 0 ? base * (1 - disc / 100) : base);
  }, [item]);

  const basePrice = useMemo(() => {
    return item.variant?.price != null ? Number(item.variant.price) : Number(item.product?.basePrice || item.product?.price || 0);
  }, [item]);

  const discount = Number(item.product?.discount || item.variant?.discount || item.flashSaleDiscount || 0);
  const isFlashSale = item.isFlashSaleActive;

  // Chuỗi hiển thị các option (Ví dụ: "8GB - 256GB - Titan")
  const variantOptions = useMemo(() => {
    const attrs = item.variant?.attributeValues || item.variant?.attributes;
    if (!attrs) return null;
    let processedAttrs = attrs;
    if (typeof processedAttrs === 'string') {
      try { processedAttrs = JSON.parse(processedAttrs); } catch (e) { return null; }
    }
    return Object.values(processedAttrs).join(" - ");
  }, [item.variant]);

  const itemImage = item.variant?.imageUrl || item.product?.image;

  return (
    <motion.div
      ref={lastItemRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 md:gap-8 ${!isLast ? 'border-b border-slate-100' : ''}`}
    >
      {/* Selection & Image */}
      <div className="flex items-center gap-6 w-full sm:w-auto">
        <label className="flex items-center cursor-pointer group">
          <input 
            type="checkbox" 
            className="peer sr-only" 
            checked={isSelected}
            onChange={() => onSelect(item.id)}
          />
          <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all duration-300 group-hover:border-primary/50 flex items-center justify-center">
             <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
          </div>
        </label>
        
        <div 
          className="w-28 h-28 flex-shrink-0 bg-slate-50 rounded-2xl border border-slate-100 p-4 overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all" 
          onClick={() => navigate(`/product-detail/${item.product?.id}?variant=${item.variant?.id}`)}
        >
          <img 
            src={itemImage} 
            alt={item.product?.name} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Info Content */}
      <div className="flex-grow space-y-3 text-center sm:text-left min-w-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
            {item.product?.category?.name || "Công nghệ"}
          </span>
          {isFlashSale ? (
            <span className="text-[9px] font-black text-white bg-danger px-2 py-0.5 rounded-full shadow-lg shadow-danger/20 animate-pulse">
              FLASH SALE -{discount}%
            </span>
          ) : discount > 0 && (
            <span className="text-[9px] font-black text-white bg-brand px-2 py-0.5 rounded-full shadow-lg shadow-brand/20">
              -{discount}%
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 
            className="text-base md:text-lg font-black text-slate-900 hover:text-primary transition-colors cursor-pointer line-clamp-1 leading-tight"
            onClick={() => navigate(`/product-detail/${item.product?.id}?variant=${item.variant?.id}`)}
          >
            {item.product?.name}
          </h3>
          
          {variantOptions && (
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              {variantOptions}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-3">
           <span className="text-xl font-black text-primary tracking-tighter">
             {formatCurrency(finalPrice)}
           </span>
           {discount > 0 && (
             <span className="text-xs text-slate-400 line-through decoration-danger/30 decoration-2">
               {formatCurrency(basePrice)}
             </span>
           )}
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-6 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8">
        <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 p-1 shadow-inner">
          <button 
            onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
            className="w-9 h-9 flex items-center justify-center bg-white rounded-xl text-slate-500 hover:text-primary transition-all shadow-sm active:scale-90"
          >
            <FiMinus size={14} />
          </button>
          <span className="w-10 text-center text-sm font-black text-slate-800">{item.quantity}</span>
          <button 
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            className="w-9 h-9 flex items-center justify-center bg-white rounded-xl text-slate-500 hover:text-primary transition-all shadow-sm active:scale-90"
          >
            <FiPlus size={14} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tạm tính</p>
            <p className="text-lg font-black text-slate-900 tracking-tight">
              {formatCurrency(finalPrice * item.quantity)}
            </p>
          </div>
          <button 
            onClick={() => onRemove(item.id)}
            className="w-11 h-11 flex items-center justify-center text-danger hover:bg-danger/5 rounded-2xl transition-all active:scale-90"
            title="Xóa khỏi giỏ"
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(CartItem);
