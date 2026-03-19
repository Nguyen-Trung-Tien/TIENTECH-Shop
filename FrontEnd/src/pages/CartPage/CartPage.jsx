import React, { useCallback, useEffect, useRef, useState } from "react";
import { 
  FiTrash2, 
  FiArrowLeft, 
  FiShoppingBag, 
  FiMinus, 
  FiPlus, 
  FiChevronRight, 
  FiPercent, 
  FiTruck, 
  FiPhoneCall,
  FiShield,
  FiRefreshCw
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setCartItems,
  appendCartItems,
  updateCartItemQuantity,
  removeCartItem,
} from "../../redux/cartSlice";
import { toast } from "react-toastify";
import {
  getAllCartItems,
  removeCartItem as removeCartItemApi,
  updateCartItem as updateCartItemApi,
} from "../../api/cartApi";
import { getImage } from "../../utils/decodeImage";
import { setSelectedIds } from "../../redux/checkoutSlice";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";
import { motion, AnimatePresence } from "framer-motion";

const CartPage = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const observer = useRef();

  const fetchCart = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await getAllCartItems(page, 10);
        const items = Array.isArray(res?.data) ? res.data : [];

        if (items.length > 0) {
          if (page === 1) dispatch(setCartItems(items));
          else dispatch(appendCartItems(items));
        }

        setHasMore(items.length === 10);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (cartItems.length === 0) {
      fetchCart(1);
    }
  }, [cartItems.length, fetchCart]);

  useEffect(() => {
    if (page === 1) return;
    fetchCart(page);
  }, [page, fetchCart]);

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

  const handleRemove = async (id) => {
    try {
      await removeCartItemApi(id);
      dispatch(removeCartItem(id));
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const handleQtyChange = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItemApi(id, quantity);
      dispatch(updateCartItemQuantity({ id, quantity }));
    } catch {
      toast.error("Cập nhật số lượng thất bại!");
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCheckOut = () => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    dispatch(setSelectedIds(selectedItems));
    navigate("/checkout");
  };

  const total = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((acc, item) => {
      const price = item.product?.discount
        ? (item.product.price * (100 - item.product.discount)) / 100
        : item.product?.price || 0;
      return acc + price * (item.quantity || 0);
    }, 0);

  const CustomCheckbox = ({ checked, onChange, label, className = "" }) => (
    <label className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox" 
          className="peer sr-only" 
          checked={checked}
          onChange={onChange}
        />
        <div className="w-5 h-5 border-2 border-surface-200 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 group-hover:border-primary/50"></div>
        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {label && <span className="text-sm font-bold text-surface-900">{label}</span>}
    </label>
  );

  return (
    <div className="min-h-screen bg-surface-50 py-12">
      <div className="container-custom">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-surface-400 mb-3 text-sm font-medium">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <FiChevronRight size={14} />
              <span className="text-surface-900 font-bold">Giỏ hàng của bạn</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-surface-900 tracking-tight">
              Giỏ hàng
              <span className="ml-4 text-[11px] font-black text-surface-400 bg-white border border-surface-200 px-3 py-1 rounded-full uppercase tracking-[0.2em] align-middle shadow-sm">
                {cartItems.length} Sản phẩm
              </span>
            </h1>
          </div>
          
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-sm uppercase tracking-wider">
            <FiArrowLeft /> Tiếp tục mua sắm
          </Link>
        </div>

        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] shadow-soft border border-surface-100">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-6"></div>
            <p className="text-surface-500 font-bold tracking-widest uppercase text-xs">Đang tải giỏ hàng...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 px-6 bg-white rounded-[40px] shadow-soft border border-surface-100 text-center"
          >
            <div className="w-24 h-24 bg-surface-50 rounded-full flex items-center justify-center mb-8 ring-8 ring-surface-50/50">
              <FiShoppingBag size={40} className="text-surface-300" />
            </div>
            <h2 className="text-2xl font-display font-black text-surface-900 mb-3">Giỏ hàng của bạn đang trống</h2>
            <p className="text-surface-500 max-w-sm mb-10 text-sm leading-relaxed">
              Khám phá hàng ngàn sản phẩm công nghệ hấp dẫn và thêm chúng vào giỏ hàng ngay hôm nay!
            </p>
            <button 
              onClick={() => navigate("/")}
              className="px-10 py-4 bg-surface-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 active:scale-95"
            >
              BẮT ĐẦU MUA SẮM
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 space-y-6">
              {/* Select All Bar */}
              <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-sm border border-surface-200/60 flex items-center justify-between sticky top-24 z-10">
                <CustomCheckbox 
                  checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                  onChange={() => setSelectedItems(selectedItems.length === cartItems.length ? [] : cartItems.map((item) => item.id))}
                  label={`Chọn tất cả (${cartItems.length})`}
                />
                {selectedItems.length > 0 && (
                  <button 
                    onClick={() => setSelectedItems([])}
                    className="text-[11px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest px-4 py-1.5 bg-rose-50 rounded-full transition-colors"
                  >
                    Bỏ chọn ({selectedItems.length})
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="bg-white rounded-[2.5rem] shadow-soft border border-surface-100 overflow-hidden">
                <AnimatePresence initial={false}>
                  {cartItems.map((item, index) => {
                    const price = item.product?.discount
                      ? (item.product.price * (100 - item.product.discount)) / 100
                      : item.product?.price || 0;
                    const isLast = index === cartItems.length - 1;

                    return (
                      <motion.div
                        key={item.id}
                        ref={isLast ? lastItemRef : null}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-8 flex flex-col sm:flex-row items-center gap-8 ${!isLast ? 'border-b border-surface-100' : ''}`}
                      >
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                          <CustomCheckbox 
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                          />
                          <div 
                            className="w-28 h-28 flex-shrink-0 bg-surface-50 rounded-3xl border border-surface-100 p-3 overflow-hidden group cursor-pointer shadow-sm hover:border-primary/20 transition-all" 
                            onClick={() => navigate(`/product-detail/${item.product?.id}`)}
                          >
                            <img 
                              src={getImage(item.product?.image)} 
                              alt={item.product?.name} 
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                          </div>
                        </div>

                        <div className="flex-grow space-y-3 text-center sm:text-left">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                              {item.product?.category?.name || "Tech"}
                            </span>
                            {item.product?.discount > 0 && (
                              <span className="text-[10px] font-black text-white bg-accent px-2 py-0.5 rounded shadow-sm shadow-accent/20">
                                -{item.product.discount}%
                              </span>
                            )}
                          </div>
                          <h3 
                            className="text-base font-bold text-surface-900 hover:text-primary transition-colors cursor-pointer line-clamp-2 leading-snug"
                            onClick={() => navigate(`/product-detail/${item.product?.id}`)}
                          >
                            {item.product?.name}
                          </h3>
                          <div className="flex items-center justify-center sm:justify-start gap-3">
                             <span className="text-xl font-black text-surface-900 tracking-tight">{price.toLocaleString()} ₫</span>
                             {item.product?.discount > 0 && (
                               <span className="text-sm text-surface-400 line-through font-medium">{item.product.price.toLocaleString()} ₫</span>
                             )}
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-8 w-full sm:w-auto">
                          {/* Quantity Selector */}
                          <div className="flex items-center bg-surface-100 rounded-2xl border border-surface-200 overflow-hidden h-11 p-1 shadow-inner">
                            <button 
                              onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center bg-white rounded-xl text-surface-500 hover:text-primary hover:shadow-sm transition-all shadow-sm active:scale-95"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="w-10 text-center text-sm font-black text-surface-900">{item.quantity}</span>
                            <button 
                              onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center bg-white rounded-xl text-surface-500 hover:text-primary hover:shadow-sm transition-all shadow-sm active:scale-95"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-[9px] font-black text-surface-400 uppercase tracking-[0.15em] mb-1">Tạm tính</p>
                              <p className="text-lg font-black text-primary tracking-tight leading-none">{(price * item.quantity).toLocaleString()} ₫</p>
                            </div>
                            <button 
                              onClick={() => handleRemove(item.id)}
                              className="w-11 h-11 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110 active:scale-90"
                              title="Xóa khỏi giỏ"
                            >
                              <FiTrash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {loading && page > 1 && (
                <div className="flex justify-center py-6">
                  <div className="w-8 h-8 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-4 space-y-8 sticky top-24">
              <div className="bg-white rounded-[2.5rem] shadow-soft border border-surface-100 overflow-hidden">
                <div className="p-10 bg-surface-900 text-white">
                   <h2 className="text-2xl font-display font-black mb-1 leading-none">Thanh toán</h2>
                   <p className="text-surface-400 text-xs font-bold uppercase tracking-widest">
                      {selectedItems.length} sản phẩm đang được chọn
                   </p>
                </div>
                
                <div className="p-10 space-y-8">
                  {/* Coupon Box */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Mã giảm giá</label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <FiPercent className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
                        <input 
                          type="text" 
                          placeholder="Mã voucher..."
                          className="w-full h-12 pl-11 pr-4 bg-surface-50 border border-surface-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all uppercase placeholder:normal-case placeholder:font-medium"
                        />
                      </div>
                      <button className="px-5 py-3 bg-surface-100 text-surface-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-surface-200 transition-colors">
                        Áp dụng
                      </button>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-4 pt-4 border-t border-surface-100">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-surface-500">Tạm tính ({selectedItems.length} sp)</span>
                      <span className="text-surface-900 font-black">{total.toLocaleString()} ₫</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-surface-500">Phí vận chuyển</span>
                      <div className="flex items-center gap-2 text-emerald-500 font-black italic">
                        <FiTruck size={16} />
                        <span>MIỄN PHÍ</span>
                      </div>
                    </div>
                    
                    <div className="pt-8 mt-4 border-t-2 border-dashed border-surface-100 flex justify-between items-end">
                      <span className="text-surface-900 font-display font-black text-lg">Tổng cộng</span>
                      <div className="text-right">
                        <p className="text-4xl font-black text-primary tracking-tighter leading-none">{total.toLocaleString()} ₫</p>
                        <p className="text-[10px] text-surface-400 mt-2 font-black uppercase tracking-widest">Đã bao gồm VAT</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckOut}
                    disabled={selectedItems.length === 0}
                    className="w-full h-16 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-[1.25rem] hover:bg-primary-hover shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 active:scale-95"
                  >
                    TIẾN HÀNH THANH TOÁN
                  </button>

                  <div className="flex items-center justify-center gap-6 pt-4">
                    <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                       <FiShield className="text-emerald-500" />
                       <span className="text-[8px] font-black uppercase tracking-tighter">Bảo mật</span>
                    </div>
                    <div className="w-px h-6 bg-surface-100"></div>
                    <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                       <FiRefreshCw className="text-primary" />
                       <span className="text-[8px] font-black uppercase tracking-tighter">7 Ngày</span>
                    </div>
                    <div className="w-px h-6 bg-surface-100"></div>
                    <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                       <FiTruck className="text-indigo-500" />
                       <span className="text-[8px] font-black uppercase tracking-tighter">Freeship</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 flex items-start gap-5 group hover:bg-primary/10 transition-colors">
                 <div className="w-14 h-14 bg-white text-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                    <FiPhoneCall size={28} />
                 </div>
                 <div>
                    <h4 className="font-bold text-surface-900 mb-1">Cần hỗ trợ thanh toán?</h4>
                    <p className="text-xs text-surface-500 font-medium mb-3 leading-relaxed">Hãy để chuyên viên kỹ thuật của chúng tôi giúp bạn hoàn tất đơn hàng.</p>
                    <p className="text-xl font-black text-primary tracking-tight">1900 9999</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

