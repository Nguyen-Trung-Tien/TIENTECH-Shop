import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiArrowLeft, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { getWishlistApi } from "../../api/wishlistApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import Loading from "../../components/Loading/Loading";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await getWishlistApi();
      if (res.errCode === 0) {
        const formattedData = res.data.map(item => ({
          ...item.product,
          image: item.product.images?.find(img => img.isPrimary)?.imageUrl || item.product.images?.[0]?.imageUrl,
          wishlists: [{ userId: item.userId }] 
        }));
        setWishlist(formattedData);
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 pb-20">
      
      {/* HEADER SECTION - MODERN CARD */}
      <section className="bg-gray-50 dark:bg-gray-950 py-10 md:py-16 border-b border-slate-100 dark:border-gray-900 mb-8 md:mb-12">
        <div className="container-custom">
            <Motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div className="flex items-center gap-5">
                    <Link to="/" className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95">
                        <FiArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-1">
                            <FiHeart className="fill-current" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Bộ sưu tập cá nhân</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sản phẩm yêu thích</h1>
                    </div>
                </div>

                {wishlist.length > 0 && (
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-600/10 border border-blue-600/20 rounded-2xl">
                        <span className="text-blue-600 dark:text-blue-400 font-black text-sm">{wishlist.length}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Sản phẩm lưu trữ</span>
                    </div>
                )}
            </Motion.div>
        </div>
      </section>

      <div className="container-custom">
        <AnimatePresence mode="wait">
            {wishlist.length > 0 ? (
            <Motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6 lg:gap-8"
            >
                {wishlist.map((product, index) => (
                <Motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <ProductCard product={product} />
                </Motion.div>
                ))}
            </Motion.div>
            ) : (
            <Motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-gray-50 dark:bg-gray-950 rounded-[3rem] p-12 md:p-20 text-center border border-slate-100 dark:border-gray-900 shadow-sm"
            >
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <Motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-blue-600/10 rounded-full blur-xl"
                    ></Motion.div>
                    <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-slate-100 dark:border-gray-800 flex items-center justify-center text-slate-200 dark:text-gray-700">
                        <FiHeart size={40} />
                    </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Danh sách đang trống</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                    Đừng để những "siêu phẩm" lỡ mất! Hãy thêm các thiết bị bạn yêu thích vào đây để theo dõi giá và khuyến mãi.
                </p>
                
                <Link to="/products" className="inline-block">
                    <button className="h-14 px-10 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-3 uppercase tracking-widest active:scale-95">
                        <FiShoppingBag size={18} />
                        Khám phá sản phẩm ngay
                    </button>
                </Link>
            </Motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WishlistPage;
