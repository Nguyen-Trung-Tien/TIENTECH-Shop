import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiArrowLeft, FiShoppingBag } from "react-icons/fi";
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
        // Map data to match ProductCard structure
        const formattedData = res.data.map(item => ({
          ...item.product,
          image: item.product.images?.find(img => img.isPrimary)?.imageUrl || item.product.images?.[0]?.imageUrl,
          wishlists: [{ userId: item.userId }] // To keep heart icon red
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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-primary transition-all">
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Danh sách yêu thích</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                Lưu giữ những sản phẩm bạn quan tâm
              </p>
            </div>
          </div>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-16 text-center shadow-sm border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart size={40} className="text-slate-200" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Danh sách trống</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Hãy thêm những sản phẩm bạn yêu thích để dễ dàng theo dõi và mua sắm sau này.
            </p>
            <Link to="/products">
              <button className="h-14 px-8 bg-primary text-white font-black rounded-2xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-3 mx-auto">
                <FiShoppingBag />
                TIẾP TỤC MUA SẮM
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
