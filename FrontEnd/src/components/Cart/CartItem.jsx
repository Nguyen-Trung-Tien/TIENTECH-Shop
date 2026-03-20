import React from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { getImage } from "../../utils/decodeImage";
import { useNavigate } from "react-router-dom";

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
  const price = item.product?.discount
    ? (item.product.price * (100 - item.product.discount)) / 100
    : item.product?.price || 0;

  return (
    <motion.div
      ref={lastItemRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 md:gap-8 ${!isLast ? 'border-b border-surface-100' : ''}`}
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
          <div className="w-5 h-5 border-2 border-surface-200 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 group-hover:border-primary/50"></div>
        </label>
        
        <div 
          className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-surface-50 rounded-2xl border border-surface-100 p-3 overflow-hidden group cursor-pointer shadow-sm hover:border-primary/20 transition-all" 
          onClick={() => navigate(`/product-detail/${item.product?.id}`)}
        >
          <img 
            src={getImage(item.product?.image)} 
            alt={item.product?.name} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-grow space-y-2 text-center sm:text-left min-w-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
            {item.product?.category?.name || "Tech"}
          </span>
          {item.product?.discount > 0 && (
            <span className="text-[10px] font-bold text-white bg-brand px-2 py-0.5 rounded shadow-sm">
              -{item.product.discount}%
            </span>
          )}
        </div>
        <h3 
          className="text-sm md:text-base font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer line-clamp-2 leading-snug"
          onClick={() => navigate(`/product-detail/${item.product?.id}`)}
        >
          {item.product?.name}
        </h3>
        <div className="flex items-center justify-center sm:justify-start gap-3">
           <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{price.toLocaleString()} ₫</span>
           {item.product?.discount > 0 && (
             <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">{item.product.price.toLocaleString()} ₫</span>
           )}
        </div>
      </div>

      {/* Quantity & Actions */}
      <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-6 w-full sm:w-auto">
        <div className="flex items-center bg-slate-100 dark:bg-dark-bg rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden h-10 p-1">
          <button 
            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-dark-surface rounded-lg text-slate-500 hover:text-primary transition-all shadow-sm"
          >
            <FiMinus size={12} />
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
          <button 
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-dark-surface rounded-lg text-slate-500 hover:text-primary transition-all shadow-sm"
          >
            <FiPlus size={12} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tạm tính</p>
            <p className="text-base font-black text-primary dark:text-brand leading-none">{(price * item.quantity).toLocaleString()} ₫</p>
          </div>
          <button 
            onClick={() => onRemove(item.id)}
            className="w-10 h-10 flex items-center justify-center text-danger hover:bg-danger/10 rounded-xl transition-all"
            title="Xóa khỏi giỏ"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(CartItem);
