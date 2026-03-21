import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetail } from "../../hooks/useProductDetail";
import { useProductVariants } from "../../hooks/useProductVariants";
import { toast } from "react-toastify";
import { FiZap, FiClock, FiShield, FiTruck, FiChevronRight, FiHeart, FiShoppingCart, FiCreditCard, FiCheck } from "react-icons/fi";
import { getImage } from "../../utils/decodeImage";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { 
    product, 
    loading, 
    handleAddToCart, 
    addingCart 
  } = useProductDetail(slug);

  const {
    allAttributes,
    selectedAttributes,
    selectedVariant: hookVariant,
    displayVariant, // Added displayVariant here
    onSelectAttribute,
    checkAttributeAvailability,
  } = useProductVariants(product);

  // LOGIC SỬA LỖI: Nếu biến thể không có thuộc tính (attributeValues trống), tự động chọn nó luôn
  const selectedVariant = React.useMemo(() => {
    if (hookVariant) return hookVariant;
    
    // Nếu sản phẩm CÓ variants, bắt buộc người dùng chọn -> trả về null để khoá nút "Thêm vào giỏ"
    if (product?.variants?.length > 0) {
      return null;
    }
    
    // Nếu sản phẩm KHÔNG CÓ variants, cho phép sử dụng thông tin sản phẩm gốc
    return null;
  }, [hookVariant, product]);

  const [mainImage, setMainImage] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (product?.images?.length > 0) {
      const primary = product.images.find(img => img.isPrimary) || product.images[0];
      setMainImage(primary.imageUrl);
    }
  }, [product]);

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
    return { h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") };
  };

  useEffect(() => {
    // Nếu có displayVariant (dù là chọn 1 phần hay đã chọn đủ) -> Cập nhật ảnh tương ứng
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
    // Bắt buộc chọn variant nếu sản phẩm CÓ variants
    if (product?.variants?.length > 0 && !selectedVariant) {
      toast.error("Vui lòng chọn loại sản phẩm (Màu sắc, kích thước...)");
      return;
    }
    
    // Nếu không có variants hoặc đã chọn variant, thêm vào giỏ
    const itemId = product?.variants?.length > 0 ? selectedVariant?.id : product?.id;
    const success = await handleAddToCart(itemId);
    if (success) navigate("/cart");
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-blue-600 font-bold text-lg animate-pulse">Đang tải sản phẩm...</div>;
  if (!product) return <div className="text-center mt-20 text-gray-500 font-medium p-10 border rounded-2xl bg-gray-50 max-w-md mx-auto">Sản phẩm không tồn tại hoặc đã bị ẩn!</div>;

  const { h, m, s } = formatTime(timeLeft);
  const isFlashSale = product.flashSale?.isActive && timeLeft > 0;
  
  // SỬA LỖI GIÁ: Nếu salePrice <= 0, lấy giá gốc price
  const getDisplayPrice = (variant) => {
    if (!variant) return product.basePrice || product.price;
    return Number(variant.salePrice) > 0 ? variant.salePrice : variant.price;
  };

  const currentPrice = isFlashSale ? product.flashSale.price : getDisplayPrice(displayVariant);
  const originalPrice = displayVariant ? displayVariant.price : (product.basePrice || product.price);
  const discountPercent = displayVariant?.discount || 0;

  const onAddToCart = (e) => {
    e.preventDefault();
    if (product?.variants?.length > 0 && !selectedVariant) {
      toast.error("Vui lòng chọn loại sản phẩm (Màu sắc, kích thước...)");
      return;
    }
    const itemId = product?.variants?.length > 0 ? selectedVariant?.id : product?.id;
    handleAddToCart(itemId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen font-sans">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-8 pb-4 border-b border-gray-50 uppercase tracking-widest">
        <a href="/" className="hover:text-blue-600 transition-colors">Trang chủ</a>
        <FiChevronRight />
        <a href="/products" className="hover:text-blue-600 transition-colors">Sản phẩm</a>
        <FiChevronRight />
        <span className="text-gray-900 font-bold truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* LEFT: Image Gallery */}
        <div className="space-y-6">
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative shadow-sm hover:shadow-md transition-all">
            <img 
              src={getImage(mainImage)} 
              alt={product.name} 
              className="w-full h-full object-contain transition-transform duration-700 hover:scale-105 p-6"
            />
            { (discountPercent > 0 || isFlashSale) && (
              <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg">
                -{isFlashSale ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : discountPercent}% OFF
              </div>
            )}
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
            {displayImages.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setMainImage(img.imageUrl)}
                className={`flex-shrink-0 w-20 h-20 rounded-2xl border-2 overflow-hidden transition-all ${
                  mainImage === img.imageUrl ? "border-blue-600 scale-95 shadow-md" : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <img src={getImage(img.imageUrl)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {product.brand && (
                <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                  {product.brand.name}
                </span>
              )}
              {isFlashSale && (
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                  <FiZap className="fill-current" /> FLASH SALE
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">{product.name}</h1>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Đã bán: <b className="text-gray-900 ml-1">{product.sold}</b></span>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400 text-lg">★★★★★</div>
                <span className="text-gray-900 font-black">4.8</span>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className={`p-8 rounded-[2rem] transition-all duration-500 ${
            isFlashSale ? "bg-red-600 text-white shadow-xl shadow-red-100" : "bg-gray-50 border border-gray-100 shadow-sm"
          }`}>
             {isFlashSale && (
               <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/20">
                 <div className="flex items-center gap-2 font-black uppercase text-[11px] tracking-widest">
                   <FiClock className="text-xl" /> Kết thúc sau
                 </div>
                 <div className="flex gap-2 font-black text-xl">
                    <span className="bg-white text-red-600 w-10 h-12 rounded-xl flex items-center justify-center shadow-lg">{h}</span>
                    <span className="pt-2">:</span>
                    <span className="bg-white text-red-600 w-10 h-12 rounded-xl flex items-center justify-center shadow-lg">{m}</span>
                    <span className="pt-2">:</span>
                    <span className="bg-white text-red-600 w-10 h-12 rounded-xl flex items-center justify-center shadow-lg">{s}</span>
                 </div>
               </div>
             )}

             <div className="flex items-baseline gap-6">
               <div className="flex flex-col">
                  { (isFlashSale || discountPercent > 0) && (
                    <span className={`text-sm font-bold line-through mb-1 ${isFlashSale ? "text-white/60" : "text-gray-400"}`}>
                      {Number(originalPrice).toLocaleString('vi-VN')}₫
                    </span>
                  )}
                  <span className={`text-5xl font-black tracking-tighter ${isFlashSale ? "text-white" : "text-red-600"}`}>
                    {Number(currentPrice).toLocaleString('vi-VN')}₫
                  </span>
               </div>
               {discountPercent > 0 && !isFlashSale && (
                 <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-red-100 uppercase">
                   TIẾT KIỆM {discountPercent}%
                 </div>
               )}
             </div>
             
             <div className={`flex items-center gap-3 mt-8 pt-6 border-t ${isFlashSale ? "border-white/10" : "border-gray-200"}`}>
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${ (product.totalStock || product.stock) > 0 ? "bg-green-500" : "bg-red-500"}`}></div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isFlashSale ? "text-white/80" : "text-gray-500"}`}>
                  {(product.totalStock || product.stock) > 0 ? `Trong kho còn ${product.totalStock || product.stock} sản phẩm` : "Hết hàng tạm thời"}
                </p>
             </div>
          </div>

          {/* Variants Selection - Chỉ hiện nếu có thuộc tính để chọn */}
          {Object.keys(allAttributes).length > 0 && (
            <div className="space-y-8 py-6 border-y border-gray-100">
              {Object.entries(allAttributes).map(([attrName, values]) => (
                <div key={attrName} className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Chọn {attrName}</label>
                  <div className="flex flex-wrap gap-3">
                    {values.map((val) => {
                      const isSelected = selectedAttributes[attrName] === val;
                      const isAvailable = checkAttributeAvailability(attrName, val);
                      return (
                        <button
                          key={val}
                          onClick={() => onSelectAttribute(attrName, val)}
                          className={`px-6 py-2.5 rounded-[1.25rem] text-xs font-black transition-all border-2 flex items-center justify-center gap-2 ${
                            isSelected 
                              ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-105" 
                              : isAvailable 
                                ? "bg-white border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-600" 
                                : "bg-gray-50 border-gray-200 text-gray-400 opacity-60 hover:border-blue-300"
                          }`}
                        >
                          {val}
                          {isSelected && <FiCheck className="text-sm" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <div className="flex space-x-4">
              <button 
                onClick={onAddToCart}
                disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
                className={`flex-1 h-16 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${
                  (!selectedVariant && product.variants?.length > 0)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-slate-200" 
                    : "bg-white border-4 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white active:scale-95 shadow-xl shadow-slate-100"
                }`}
              >
                <FiShoppingCart className="text-xl" />
                THÊM GIỎ HÀNG
              </button>

              <button 
                onClick={handleBuyNow}
                disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
                className={`flex-[1.5] h-16 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl ${
                  (!selectedVariant && product.variants?.length > 0)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-95"
                }`}
              >
                <FiCreditCard className="text-xl" />
                MUA NGAY
              </button>

              <button className="w-16 h-16 rounded-[1.25rem] border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                <FiHeart size={24} />
              </button>
            </div>
            
            {(!selectedVariant && product.variants?.length > 0) && (
              <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce italic bg-red-50 py-2 rounded-xl">
                ⚠️ Vui lòng hoàn tất lựa chọn phiên bản để tiếp tục mua hàng
              </p>
            )}
          </div>

          {/* Policy Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center transition-transform group-hover:rotate-12 shadow-sm">
                <FiShield size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter leading-none mb-1">Bảo hành</span>
                <span className="text-xs font-black text-slate-800">12 THÁNG CHÍNH HÃNG</span>
              </div>
            </div>
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center transition-transform group-hover:rotate-12 shadow-sm">
                <FiTruck size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter leading-none mb-1">Vận chuyển</span>
                <span className="text-xs font-black text-slate-800">MIỄN PHÍ TOÀN QUỐC</span>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="pt-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-blue-600"></span>
              Thông số kỹ thuật
            </h3>
            <div className="space-y-1">
              {Object.entries(product.specifications || {}).map(([key, value], idx) => (
                <div key={key} className={`flex justify-between py-4 px-6 rounded-2xl hover:bg-gray-50 transition-colors text-xs font-black ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <span className="text-gray-400 uppercase tracking-tighter">{key}</span>
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
