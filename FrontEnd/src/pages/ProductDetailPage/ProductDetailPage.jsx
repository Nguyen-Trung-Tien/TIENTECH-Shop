import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiChevronRight, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";

// Hooks
import { useProductDetail } from "../../hooks/useProductDetail";

// Sub-components
import ProductGallery from "../../components/ProductDetail/ProductGallery";
import ProductInfo from "../../components/ProductDetail/ProductInfo";
import ProductVariants from "../../components/ProductDetail/ProductVariants";
import ProductSpecs from "../../components/ProductDetail/ProductSpecs";
import ProductActions from "../../components/ProductDetail/ProductActions";

// Shared Components
import ChatBot from "../../components/ChatBot/ChatBot";
import ProductCard from "../../components/ProductCard/ProductCard";
import ReviewForm from "../../components/ReviewComponent/ReviewForm";
import ReviewList from "../../components/ReviewComponent/ReviewList";
import ReviewSummary from "../../components/ReviewComponent/ReviewSummary";
import PricePredictionModal from "../../components/PricePredictionModal/PricePredictionModal";
import LoadMoreButton from "../../components/LoadMoreButton/LoadMoreButton";
import SkeletonCard from "../../components/SkeletonCard/SkeletonCard";
import Button from "../../components/UI/Button";

// APIs
import { predictPrice } from "../../api/chatApi";
import { createReviewApi } from "../../api/reviewApi";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    product,
    loading,
    reviews,
    pagination,
    recommended,
    loadingRecommended,
    recommendedPage,
    recommendedTotalPages,
    selectedVariantId,
    setSelectedVariantId,
    quantity,
    setQuantity,
    addingCart,
    fetchReviews,
    fetchRecommended,
    handleAddToCart,
    userId,
    user
  } = useProductDetail(id);

  const [showPredict, setShowPredict] = useState(false);
  const [predictResult, setPredictResult] = useState(null);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  const handlePricePredict = async () => {
    setLoadingPredict(true);
    try {
      const result = await predictPrice(id);
      if (result.error) return toast.error(result.error);
      setPredictResult(result);
      setShowPredict(true);
    } catch (err) {
      toast.error("Không thể dự đoán giá!");
    } finally {
      setLoadingPredict(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!userId) return toast.warning("Đăng nhập để gửi đánh giá!");
    if (!newReview.comment.trim()) return toast.info("Vui lòng nhập bình luận!");
    try {
      const res = await createReviewApi({ userId, productId: id, ...newReview });
      if (res?.errCode === 0) {
        toast.success("Gửi đánh giá thành công!");
        setNewReview({ rating: 5, comment: "" });
        fetchReviews(1);
      }
    } catch (err) {
      toast.error("Lỗi khi gửi đánh giá!");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50 gap-4">
      <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
      <p className="text-surface-400 font-bold uppercase tracking-widest text-[10px]">Đang tải thông tin sản phẩm...</p>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20 bg-surface-50">
      <h2 className="text-2xl font-bold mb-6">Không tìm thấy sản phẩm!</h2>
      <Button variant="secondary" onClick={() => navigate("/")} icon={FiArrowLeft}>Quay lại</Button>
    </div>
  );

  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;
  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const activePrice = selectedVariant?.price != null ? Number(selectedVariant.price) : product.price;
  const activeStock = selectedVariant?.stock != null ? Number(selectedVariant.stock) : product.stock;
  const selectedImage = selectedVariant?.imageUrl || product.image;

  return (
    <main className="bg-slate-50 min-h-screen pb-20">
      <PricePredictionModal show={showPredict} onHide={() => setShowPredict(false)} result={predictResult} />
      <ChatBot />

      <div className="container-custom pt-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 items-center gap-2 text-sm font-medium text-slate-400">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <FiChevronRight size={14} />
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <section className="lg:col-span-6">
            <ProductGallery 
              images={product.images} 
              primaryImage={selectedImage} 
              discount={product.discount} 
            />
          </section>

          <section className="lg:col-span-6 h-full flex flex-col">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-soft border border-slate-100 flex-1 flex flex-col">
              <ProductInfo product={{ ...product, price: activePrice, stock: activeStock }} avgRating={avgRating} totalReviews={reviews.length} />
              
              <ProductVariants 
                variants={product.variants} 
                selectedVariantId={selectedVariantId} 
                onSelect={(vid) => setSelectedVariantId(vid)} 
              />
              
              <ProductSpecs product={product} />
              
              <ProductActions 
                stock={activeStock} 
                quantity={quantity} 
                setQuantity={setQuantity}
                addingCart={addingCart}
                onAddToCart={handleAddToCart}
                onBuyNow={() => navigate("/checkout", { state: { product, quantity } })}
                onPredict={handlePricePredict}
                loadingPredict={loadingPredict}
                isActive={product.isActive}
              />
            </div>
          </section>
        </div>

        {/* Extended Info Sections */}
        <div className="mt-20 space-y-20">
          {/* Description */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-soft border border-slate-100">
            <h2 className="text-xl font-display font-bold text-slate-900 uppercase tracking-tight mb-8 border-b border-slate-100 pb-4">
              Mô tả sản phẩm
            </h2>
            <div className={`prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm ${!showFullDesc ? "line-clamp-[10]" : ""}`}>
              {product.description}
            </div>
            {product.description?.length > 500 && (
              <button onClick={() => setShowFullDesc(!showFullDesc)} className="mt-6 text-primary font-bold hover:underline text-sm">
                {showFullDesc ? "Thu gọn nội dung ▲" : "Xem toàn bộ mô tả ▼"}
              </button>
            )}
          </section>

          {/* Reviews */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-soft border border-slate-100">
            <h2 className="text-xl font-display font-bold text-slate-900 uppercase tracking-tight mb-10 border-b border-slate-100 pb-4">
              Đánh giá khách hàng
            </h2>
            <ReviewSummary reviews={reviews} avgRating={avgRating} />
            <ReviewForm newReview={newReview} setNewReview={setNewReview} onSubmit={handleSubmitReview} />
            <ReviewList reviews={reviews} page={pagination.currentPage} pagination={pagination} onPageChange={fetchReviews} user={user} />
          </section>

          {/* Recommended Products */}
          <section>
            <h2 className="text-xl font-display font-bold text-slate-900 uppercase tracking-tight mb-10 border-b border-slate-200 pb-4">
              Sản phẩm tương tự
            </h2>
            {loadingRecommended ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)}
              </div>
            ) : recommended.length > 0 ? (
              <div className="space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {recommendedPage < recommendedTotalPages && (
                  <div className="flex justify-center">
                    <LoadMoreButton page={recommendedPage} totalPages={recommendedTotalPages} onLoadMore={() => fetchRecommended(recommendedPage + 1, true)} />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-10">Không tìm thấy sản phẩm tương tự.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;
