import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ErrorBanner, PageShell } from "../../components/UI";
import { getWishlistApi } from "../../api/wishlistApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import { ProductCardSkeleton as SkeletonCard } from "../../components/Loading";
import { toast } from "react-toastify";
import { showErrorToast } from "../../utils/toastHelper";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingAll, setAddingAll] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWishlistApi();
      if (res.errCode === 0) {
        const formattedData = (res.data || [])
          .filter((item) => item?.product)
          .map((item) => ({
            ...item.product,
            image:
              item.product.images?.find((img) => img.isPrimary)?.imageUrl ||
              item.product.images?.[0]?.imageUrl,
            wishlists: [{ userId: item.userId }],
          }));
        setWishlist(formattedData);
      } else {
        setError(res?.errMessage || "Không thể tải danh sách yêu thích.");
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const wishlistActions = wishlist.length > 0 ? (
    <>
      <button
        type="button"
        disabled={addingAll}
        onClick={async () => {
          if (addingAll) return;
          setAddingAll(true);
          const { addCart } = await import("../../api/cartApi");
          try {
            const inStockItems = wishlist.filter((item) => (item.totalStock ?? item.stock ?? 1) > 0);
            if (inStockItems.length === 0) {
              toast.warning("Các sản phẩm yêu thích hiện đã tạm hết hàng.");
              return;
            }
            for (const item of inStockItems) {
              await addCart({ productId: item.id, quantity: 1 });
            }
            toast.success(`Đã thêm ${inStockItems.length} sản phẩm vào giỏ hàng!`);
          } catch (err) {
            showErrorToast(err, "Một số sản phẩm không thể thêm vào giỏ hàng");
          } finally {
            setAddingAll(false);
          }
        }}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FiShoppingBag size={14} /> {addingAll ? "Đang thêm..." : "Thêm tất cả vào giỏ hàng"}
      </button>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-2xl">
        <span className="text-primary dark:text-primary-light font-black text-sm">{wishlist.length}</span>
        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Món đồ</span>
      </div>
    </>
  ) : null;

  return (
    <PageShell
      eyebrow="Bộ sưu tập cá nhân"
      title="Sản phẩm yêu thích"
      backTo="/"
      backLabel="Quay lại trang chủ"
      actions={wishlistActions}
    >
      <ErrorBanner message={error} onRetry={fetchWishlist} className="mb-6" />
      <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6 lg:gap-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : wishlist.length > 0 ? (
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
                <div className="relative size-24 mx-auto mb-8">
                    <Motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-primary/10 rounded-full blur-xl"
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
                    <button className="h-14 px-10 bg-primary text-white font-black text-sm rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center gap-3 uppercase tracking-widest active:scale-95 cursor-pointer">
                        <FiShoppingBag size={18} />
                        Khám phá sản phẩm ngay
                    </button>
                </Link>
            </Motion.div>
            )}
        </AnimatePresence>
    </PageShell>
  );
};

export default WishlistPage;
