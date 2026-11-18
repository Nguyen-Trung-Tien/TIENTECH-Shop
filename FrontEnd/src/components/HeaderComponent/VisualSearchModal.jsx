import React, { useState, useRef, useEffect } from "react";
import { FiX, FiCamera, FiUploadCloud, FiArrowRight, FiSearch } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { visualSearch } from "../../api/chatApi";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../../utils/toastHelper";
import UnifiedSpinner from "../Loading/UnifiedSpinner";
import { formatCurrency } from "../../utils/format";

export default function VisualSearchModal({ isOpen, onClose }) {
  const [isSearching, setIsSearching] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [aiDescription, setAiDescription] = useState("");
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Clean up state when closed & support Escape key
  useEffect(() => {
    if (!isOpen) {
      setIsSearching(false);
      setPreviewImage(null);
      setAiDescription("");
      setMatchedProducts([]);
      setHasSearched(false);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSearching) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSearching, onClose]);

  const handleFile = async (file) => {
    if (!file) return;
    setIsSearching(true);
    setHasSearched(false);
    setMatchedProducts([]);
    setAiDescription("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        setPreviewImage(base64data);
        try {
          const res = await visualSearch(base64data);
          if (res?.errCode === 0 && res?.data) {
            const products = Array.isArray(res.data.products) ? res.data.products : [];
            const desc = res.data.description || "";
            setAiDescription(desc);
            setMatchedProducts(products);
            setHasSearched(true);
            showSuccessToast(
              products.length > 0
                ? `Tìm thấy ${products.length} thiết bị tương tự!`
                : "AI đã nhận diện ảnh thành công!",
            );
          } else {
            showErrorToast(res?.errMessage || "Không thể phân tích hình ảnh.");
          }
        } catch (error) {
          showErrorToast(error, "Lỗi khi phân tích hình ảnh.");
        } finally {
          setIsSearching(false);
        }
      };
      reader.onerror = () => {
        setIsSearching(false);
        showErrorToast("Không thể đọc file hình ảnh.");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsSearching(false);
      showErrorToast(err, "Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSelectProduct = (product) => {
    onClose();
    navigate(`/product-detail/${product.slug || product.id}`);
  };

  const handleSearchCatalog = () => {
    const query = aiDescription?.split(/[,\n]/)[0]?.trim() || "";
    onClose();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm"
            onClick={!isSearching ? onClose : undefined}
          />

          <div
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="visual-search-title"
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-t-[32px] sm:rounded-[32px] bg-white p-5 sm:p-7 shadow-2xl dark:bg-dark-surface border border-slate-100 dark:border-dark-border overflow-hidden pointer-events-auto overscroll-contain"
            >
              <div className="flex justify-center -mt-2 pb-3 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              <div className="flex items-center justify-between mb-5 shrink-0">
                <div className="min-w-0">
                  <h2
                    id="visual-search-title"
                    className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight"
                  >
                    <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FiCamera size={20} />
                    </div>
                    Tìm kiếm bằng hình ảnh AI
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mt-1.5">
                    Nhận diện thiết bị & gợi ý sản phẩm tương đồng ngay lập tức
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSearching}
                  aria-label="Đóng hộp thoại tìm kiếm hình ảnh"
                  className="size-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="overflow-y-auto overscroll-contain space-y-5 pr-1">
                <div
                  className={`relative flex ${hasSearched ? "h-36" : "h-52"} w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 group overflow-hidden ${
                    isSearching
                      ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 pointer-events-none"
                      : "border-slate-200 dark:border-dark-border hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-dark-bg"
                  }`}
                  onClick={() => !isSearching && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {isSearching ? (
                    <div className="text-center flex flex-col items-center justify-center gap-3 p-4">
                      <UnifiedSpinner size="lg" variant="primary" />
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          AI Vision đang phân tích hình ảnh...
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mt-1">
                          Đang đối chiếu kho thiết bị TienTech
                        </p>
                      </div>
                    </div>
                  ) : previewImage ? (
                    <div className="flex items-center gap-4 px-4 w-full">
                      <img
                        src={previewImage}
                        alt="Ảnh đã tải lên"
                        className="size-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-800 dark:text-white">
                          Chọn hoặc kéo thả ảnh khác
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 break-words">
                          {aiDescription || "Nhấn để thử lại với góc chụp rõ hơn."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center flex flex-col items-center justify-center gap-3 p-4">
                      <div className="size-14 rounded-2xl bg-slate-50 dark:bg-dark-bg text-slate-400 flex items-center justify-center group-hover:scale-110 group-hover:text-indigo-500 transition-all shadow-inner">
                        <FiUploadCloud size={26} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700 dark:text-white">
                          Kéo thả hình ảnh vào đây
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary mt-1">
                          hoặc click để chọn ảnh từ thiết bị
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {hasSearched && (
                  <div className="space-y-3">
                    {aiDescription && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
                          AI nhận diện thiết bị
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-200 break-words">
                          {aiDescription}
                        </p>
                      </div>
                    )}

                    {matchedProducts.length > 0 ? (
                      <div className="space-y-2.5">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Sản phẩm phù hợp ({matchedProducts.length})
                        </p>
                        <div className="space-y-2">
                          {matchedProducts.map((item) => {
                            const price = Number(
                              item.displayPrice ?? item.flashSalePrice ?? item.basePrice ?? item.price ?? 0,
                            );
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelectProduct(item)}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-dark-bg transition-all text-left cursor-pointer"
                              >
                                <img
                                  src={item.image || "/images/no-image.png"}
                                  alt={item.name}
                                  className="size-14 rounded-xl object-contain bg-white dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-800 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 break-words">
                                    {item.name}
                                  </p>
                                  <p className="text-xs font-black text-primary mt-0.5">
                                    {formatCurrency(price)}
                                  </p>
                                </div>
                                <FiArrowRight className="text-slate-400 shrink-0" size={16} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-bg text-center text-xs text-slate-500 dark:text-slate-400">
                        Chưa tìm thấy sản phẩm khớp chính xác trong kho. Bạn có thể tìm theo từ khóa gợi ý bên dưới.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
                {hasSearched && (
                  <button
                    type="button"
                    onClick={handleSearchCatalog}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-hover transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FiSearch size={14} />
                    Mở trong danh mục
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSearching}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-dark-bg transition-all disabled:opacity-50 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
