import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiArrowLeft, FiShoppingBag, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { setSelectedIds } from "../../redux/checkoutSlice";

import { useCart } from "../../hooks/useCart";
import CartItem from "../../components/Cart/CartItem";
import OrderSummary from "../../components/Cart/OrderSummary";
import Button from "../../components/UI/Button";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, fetchCart, handleUpdateQty, handleRemoveItem, calculateSubtotal } = useCart();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const observer = useRef();

  const loadData = useCallback(async (p) => {
    setLoading(true);
    try {
      const items = await fetchCart(p);
      setHasMore(items.length === 10);
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  useEffect(() => {
    if (cartItems.length === 0) loadData(1);
  }, [cartItems.length, loadData]);

  useEffect(() => {
    if (page > 1) loadData(page);
  }, [page, loadData]);

  const lastItemRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loading],
  );

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCheckOut = () => {
    dispatch(setSelectedIds(selectedItems));
    navigate("/checkout");
  };

  const subtotal = calculateSubtotal(selectedItems);

  return (
    <main className="min-h-screen bg-[var(--bg-main)] py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-3 text-sm font-medium">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <FiChevronRight size={14} />
              <span className="text-slate-900 dark:text-white font-bold">Giỏ hàng</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Giỏ hàng
              <span className="ml-4 text-[10px] font-bold text-slate-400 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border px-3 py-1 rounded-full uppercase tracking-widest align-middle">
                {cartItems.length} Sản phẩm
              </span>
            </h1>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-xs uppercase tracking-widest">
            <FiArrowLeft /> Tiếp tục mua sắm
          </Link>
        </div>

        {cartItems.length === 0 && !loading ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 px-6 bg-white dark:bg-dark-surface rounded-2xl shadow-soft border border-slate-100 dark:border-dark-border text-center"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-dark-bg rounded-full flex items-center justify-center mb-6">
              <FiShoppingBag size={32} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Giỏ hàng trống</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 text-sm">Khám phá công nghệ mới và thêm vào giỏ hàng ngay!</p>
            <Button variant="primary" onClick={() => navigate("/")}>BẮT ĐẦU MUA SẮM</Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 space-y-6">
              {/* Select All Bar */}
              <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-dark-border flex items-center justify-between sticky top-24 z-10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                    onChange={() => setSelectedItems(selectedItems.length === cartItems.length ? [] : cartItems.map(i => i.id))}
                  />
                  <div className="w-5 h-5 border-2 border-slate-200 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all duration-200"></div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Chọn tất cả ({cartItems.length})</span>
                </label>
              </div>

              {/* Items List */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-soft border border-slate-100 dark:border-dark-border overflow-hidden">
                <AnimatePresence initial={false}>
                  {cartItems.map((item, index) => (
                    <CartItem 
                      key={item.id}
                      item={item}
                      isSelected={selectedItems.includes(item.id)}
                      onSelect={handleSelectItem}
                      onUpdateQty={handleUpdateQty}
                      onRemove={handleRemoveItem}
                      isLast={index === cartItems.length - 1}
                      lastItemRef={index === cartItems.length - 1 ? lastItemRef : null}
                    />
                  ))}
                </AnimatePresence>
                {loading && (
                   <div className="p-8 flex justify-center border-t border-slate-100 dark:border-dark-border">
                     <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                   </div>
                )}
              </div>
            </div>

            <aside className="lg:col-span-4 sticky top-24">
              <OrderSummary 
                selectedItems={cartItems.filter(i => selectedItems.includes(i.id))}
                subtotal={subtotal}
                onCheckout={handleCheckOut}
              />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
