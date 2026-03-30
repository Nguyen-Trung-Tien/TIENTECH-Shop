import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetail } from "../../hooks/useProductDetail";
import { useProductVariants } from "../../hooks/useProductVariants";
import { toast } from "react-toastify";
import { 
  FiZap, FiClock, FiShield, FiTruck, FiChevronRight, 
  FiHeart, FiShoppingCart, FiCreditCard, FiCheck, FiInfo,
  FiCpu, FiMonitor, FiBattery, FiSmartphone, FiMaximize, FiMoreHorizontal
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { addToWishlistApi, removeFromWishlistApi, checkWishlistStatusApi } from "../../api/wishlistApi";

import Badge from "../../components/UI/Badge";
import ReviewComponent from "../../components/ReviewComponent/ReviewComponent";
import ReviewForm from "../../components/ReviewComponent/ReviewForm";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { 
    product, 
    loading, 
    reviews,
    handleAddToCart,
    handleReviewSubmit,
    submittingReview,
    addingCart,
    user
  } = useProductDetail(slug);

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    images: [],
  });

  const onReviewSubmit = async () => {
    const success = await handleReviewSubmit(newReview);
    if (success) {
      setNewReview({ rating: 0, comment: "", images: [] });
    }
  };

  const {
    allAttributes,
    selectedAttributes,
    selectedVariant: hookVariant,
    displayVariant,
    onSelectAttribute,
    checkAttributeAvailability,
  } = useProductVariants(product);

  const selectedVariant = React.useMemo(() => {
    if (hookVariant) return hookVariant;
    if (product?.variants?.length > 0) return null;
    return null;
  }, [hookVariant, product]);

  const [mainImage, setMainImage] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    if (product?.images?.length > 0) {
      const primary = product.images.find(img => img.isPrimary) || product.images[0];
      setMainImage(primary.imageUrl);
    }
  }, [product]);

  useEffect(() => {
    if (user && product?.id) {
      checkWishlistStatus();
    }
  }, [user, product?.id]);

  const checkWishlistStatus = async () => {
    try {
      const res = await checkWishlistStatusApi(product.id);
      if (res.errCode === 0) {
        setIsWishlisted(res.isInWishlist);
      }
    } catch (error) {
      console.error("Check wishlist error:", error);
    }
  };

  const handleWishlist = async () => {
    if (!user) return toast.warn("Vui lòng đăng nhập để lưu sản phẩm!");
    setLoadingWishlist(true);
    try {
      if (isWishlisted) {
        await removeFromWishlistApi(product.id);
        setIsWishlisted(false);
        toast.info("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlistApi(product.id);
        setIsWishlisted(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      toast.error("Không thể cập nhật danh sách yêu thích");
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    if (product?.flashSale?.isActive && product?.flashSale?.endDate) {
      const calculateTimeLeft = () => {
        const diff = new Date(product.flashSale.endDate) - new Date();
        return diff > 0 ? Math.floor(diff / 1000) : 0;
      };
      setTimeLeft(calculateTimeLeft());
      const timer = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);
        if (remaining <= 0) clearInterval(timer);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [product]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { 
      h: String(h).padStart(2, "0"), 
      m: String(m).padStart(2, "0"), 
      s: String(s).padStart(2, "0") 
    };
  };

  useEffect(() => {
    if (displayVariant) {
      const variantImg = product?.images?.find(img => img.variantId === displayVariant.id);
      if (variantImg) setMainImage(variantImg.imageUrl);
      else if (displayVariant.imageUrl) setMainImage(displayVariant.imageUrl);
    } 
  }, [displayVariant, product]);

  const displayImages = React.useMemo(() => {
    if (!product?.images) return [];
    if (!selectedVariant) return product.images;
    const variantImages = product.images.filter(img => img.variantId === selectedVariant.id);
    return variantImages.length > 0 ? variantImages : product.images;
  }, [product, selectedVariant]);

  const handleBuyNow = async () => {
    if (!user) return toast.warn("Vui lòng đăng nhập để mua hàng!");
    if (product?.variants?.length > 0 && !selectedVariant) {
      toast.error("Vui lòng chọn loại sản phẩm (Màu sắc, kích thước...)");
      return;
    }

    const itemId = product?.variants?.length > 0 ? selectedVariant?.id : null;
    const addedItem = await handleAddToCart(itemId, 1);
    
    if (addedItem) {
      navigate("/checkout", { 
        state: { 
          selectedItems: [addedItem]
        } 
      });
    }
  };

  const onAddToCart = (e) => {
    e.preventDefault();
    if (product?.variants?.length > 0 && !selectedVariant) {
      toast.error("Vui lòng chọn loại sản phẩm (Màu sắc, kích thước...)");
      return;
    }
    const itemId = product?.variants?.length > 0 ? selectedVariant?.id : null;
    handleAddToCart(itemId);
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[70vh] space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Đang tải sản phẩm...</p>
    </div>
  );

  if (!product) return (
    <div className="text-center mt-20 text-gray-500 font-medium p-8 border border-gray-100 rounded-2xl bg-gray-50 max-w-md mx-auto shadow-sm">
      <FiInfo className="mx-auto text-4xl mb-4 text-gray-300" />
      <p>Sản phẩm không tồn tại hoặc đã bị ẩn!</p>
      <button onClick={() => navigate("/")} className="mt-6 text-blue-600 hover:underline font-bold">Quay lại trang chủ</button>
    </div>
  );

  const { h, m, s } = formatTime(timeLeft);
  const isFlashSale = product.flashSale?.isActive && timeLeft > 0;
  
  const getDisplayPrice = (variant) => {
    if (!variant) return product.basePrice || product.price;
    return Number(variant.salePrice) > 0 ? variant.salePrice : variant.price;
  };

  const currentPrice = isFlashSale ? product.flashSale.price : getDisplayPrice(displayVariant);
  const originalPrice = displayVariant ? displayVariant.price : (product.basePrice || product.price);
  const discountPercent = isFlashSale 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : (displayVariant?.discount || 0);

  // Get specs from current selected/displayed variant
  const currentSpecs = displayVariant?.specifications || product.specifications || {};
  const hasSpecs = Object.values(currentSpecs).some(v => v && v !== "");

  const specIconMap = {
    screen: <FiMonitor />,
    cpu: <FiCpu />,
    ram: <FiSmartphone />,
    rom: <FiMaximize />,
    battery: <FiBattery />,
    os: <FiInfo />,
    weight: <FiMaximize />,
    connectivity: <FiMoreHorizontal />
  };

  const specLabelMap = {
    screen: "Màn hình",
    cpu: "CPU",
    ram: "RAM",
    rom: "Bộ nhớ",
    battery: "Pin/Sạc",
    os: "Hệ điều hành",
    weight: "Trọng lượng",
    connectivity: "Kết nối"
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 bg-white min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-6 pb-2 border-b border-gray-50">
        <a href="/" className="hover:text-blue-600 transition-colors">Trang chủ</a>
        <FiChevronRight className="w-3 h-3" />
        <a href="/products" className="hover:text-blue-600 transition-colors">Sản phẩm</a>
        <FiChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium truncate max-w-[200px] md:max-w-none">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT: Image Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative group">
            <img 
              src={mainImage || "/images/no-image.png"} 
              alt={product.name} 
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-4"
            />
            { (discountPercent > 0) && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm">
                -{discountPercent}%
              </div>
            )}
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {displayImages.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setMainImage(img.imageUrl)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                  mainImage === img.imageUrl ? "border-blue-500 scale-95 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="space-y-3">
            <div className="flex items-center flex-wrap gap-2">
              {product.brand && (
                <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {product.brand.name}
                </span>
              )}
              {isFlashSale && (
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <FiZap className="fill-current w-3 h-3" /> FLASH SALE
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">{product.name}</h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-500">Đã bán: <span className="text-gray-900 font-semibold">{product.sold}</span></span>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">★★★★★</div>
                <span className="text-gray-900 font-bold">4.8</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Countdown */}
          {isFlashSale && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase">
                <FiClock className="text-lg" /> Kết thúc sau:
              </div>
              <div className="flex gap-1.5 font-bold text-sm">
                 <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">{h}</span>
                 <span className="flex items-center">:</span>
                 <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">{m}</span>
                 <span className="flex items-center">:</span>
                 <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">{s}</span>
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="flex flex-col space-y-1">
             <div className="flex items-baseline gap-3">
               <span className="text-3xl font-extrabold text-red-600">
                 {Number(currentPrice).toLocaleString('vi-VN')}₫
               </span>
               { (isFlashSale || discountPercent > 0) && (
                 <span className="text-sm font-medium text-gray-400 line-through">
                   {Number(originalPrice).toLocaleString('vi-VN')}₫
                 </span>
               )}
               {discountPercent > 0 && (
                 <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                   TIẾT KIỆM {discountPercent}%
                 </span>
               )}
             </div>
             <div className="flex items-center gap-2 pt-2">
                <div className={`w-2 h-2 rounded-full ${ (product.totalStock || product.stock) > 0 ? "bg-green-500" : "bg-red-500"}`}></div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">
                  {(product.totalStock || product.stock) > 0 ? `Còn ${product.totalStock || product.stock} sản phẩm` : "Hết hàng tạm thời"}
                </p>
             </div>
          </div>

          {/* Variants Selection */}
          {Object.keys(allAttributes).length > 0 && (
            <div className="space-y-5 py-4 border-y border-gray-50">
              {Object.entries(allAttributes).map(([attrName, values]) => (
                <div key={attrName} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Chọn {attrName}</label>
                    {selectedAttributes[attrName] && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        Đã chọn: {selectedAttributes[attrName]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => {
                      const isSelected = selectedAttributes[attrName] === val;
                      const isAvailable = checkAttributeAvailability(attrName, val);
                      return (
                        <button
                          key={val}
                          disabled={!isAvailable}
                          onClick={() => onSelectAttribute(attrName, val)}
                          className={`min-w-[60px] px-4 py-2 rounded-lg text-xs font-bold transition-all border-2 flex items-center justify-center gap-1.5 ${
                            isSelected 
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" 
                              : isAvailable 
                                ? "bg-white border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-700" 
                                : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-60"
                          }`}
                        >
                          {val}
                          {isSelected && <FiCheck className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              <button 
                onClick={onAddToCart}
                disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
                className={`flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 ${
                  (!selectedVariant && product.variants?.length > 0)
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" 
                    : "bg-white border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <FiShoppingCart className="text-lg" />
                <span className="hidden sm:inline">THÊM GIỎ HÀNG</span>
                <span className="sm:hidden">THÊM GIỎ</span>
              </button>

              <button 
                onClick={handleBuyNow}
                disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
                className={`flex-[1.5] h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                  (!selectedVariant && product.variants?.length > 0)
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-100"
                }`}
              >
                <FiCreditCard className="text-lg" />
                MUA NGAY
              </button>

              <button 
                onClick={handleWishlist}
                disabled={loadingWishlist}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm ${
                  isWishlisted 
                    ? "border-red-100 bg-red-50 text-red-500" 
                    : "border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-red-500 hover:border-red-100"
                }`}
              >
                {isWishlisted ? <FaHeart className="text-xl" /> : <FiHeart className="text-xl" />}
              </button>
            </div>
            
            {(!selectedVariant && product.variants?.length > 0) && (
              <p className="text-center text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-50 py-2 rounded-lg">
                ⚠️ Vui lòng chọn phiên bản để tiếp tục mua hàng
              </p>
            )}
          </div>

          {/* Policy Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FiShield size={18} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Bảo hành</span>
                <span className="block text-[11px] font-bold text-gray-700 truncate">12 THÁNG CHÍNH HÃNG</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <FiTruck size={18} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Vận chuyển</span>
                <span className="block text-[11px] font-bold text-gray-700 truncate">MIỄN PHÍ TOÀN QUỐC</span>
              </div>
            </div>
          </div>

          {/* Specifications - Dynamically showing based on variant */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                <span className="w-6 h-[1.5px] bg-blue-500"></span>
                Thông số kỹ thuật
              </h3>
              {displayVariant && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                   Cấu hình {displayVariant.sku}
                </span>
              )}
            </div>
            
            <div className="rounded-xl border border-gray-50 overflow-hidden bg-gray-50/30">
              {hasSpecs ? (
                Object.entries(currentSpecs).map(([key, value], idx) => {
                  if (!value) return null;
                  return (
                    <div key={key} className={`flex justify-between py-3 px-5 text-xs transition-colors hover:bg-white ${idx % 2 === 0 ? "bg-white/50" : "bg-transparent"}`}>
                      <span className="text-gray-400 font-bold uppercase tracking-tight flex items-center gap-2">
                        {specIconMap[key] || <FiInfo />} {specLabelMap[key] || key}
                      </span>
                      <span className="text-gray-800 font-bold">{value}</span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  <FiCpu className="text-3xl text-gray-200" />
                  <p className="text-xs text-gray-400 font-medium italic">
                    {displayVariant ? "Phiên bản này chưa cập nhật thông số kỹ thuật chi tiết." : "Vui lòng hoàn tất lựa chọn phiên bản để xem cấu hình chi tiết."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="mt-16 space-y-12">
        <ReviewComponent reviews={reviews} user={user} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
