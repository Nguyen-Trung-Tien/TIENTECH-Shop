import React, { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiX,
  FiCamera,
  FiMic,
  FiMicOff,
  FiTrendingUp,
  FiClock,
  FiArrowRight,
  FiTag,
  FiZap,
  FiCornerDownLeft,
} from "react-icons/fi";
import { searchSuggestionsApi } from "../../api/productApi";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import UnifiedSpinner from "../Loading/UnifiedSpinner";

const TRENDING_KEYWORDS = [
  "iPhone 15 Pro",
  "Tai nghe Bluetooth",
  "Laptop Gaming",
  "Đồng hồ thông minh",
  "Bàn phím cơ",
];

const QUICK_CATEGORIES = [
  { name: "Điện thoại", icon: "📱", path: "/products?category=dien-thoai" },
  { name: "Laptop", icon: "💻", path: "/products?category=laptop" },
  { name: "Tai nghe", icon: "🎧", path: "/products?category=tai-nghe" },
  { name: "Phụ kiện", icon: "🔌", path: "/products?category=phu-kien" },
];

export default function OmniSearchModal({
  isOpen,
  onClose,
  onOpenVisualSearch,
}) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState({
    products: [],
    keywords: [],
    brands: [],
    categories: [],
  });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recent_searches") || "[]");
    } catch {
      return [];
    }
  });

  // Keyboard listeners for Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered from parent or direct handler
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on open
  useEffect(() => {
    let timerId;
    if (isOpen) {
      timerId = setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSuggestions({ products: [], keywords: [], brands: [], categories: [] });
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isOpen]);

  // Debounced Search API call
  const fetchSuggestions = useRef(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSuggestions({ products: [], keywords: [], brands: [], categories: [] });
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await searchSuggestionsApi(searchQuery);
        if (res?.errCode === 0) {
          const suggestData = res.suggestions || res.data || {};
          setSuggestions({
            products: suggestData.products || [],
            keywords: suggestData.keywords || [],
            brands: suggestData.brands || [],
            categories: suggestData.categories || [],
          });
        }
      } catch (err) {
        console.error("Search suggestion error:", err);
      } finally {
        setLoading(false);
      }
    }, 250)
  ).current;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  const saveToHistory = (searchTerm) => {
    if (!searchTerm) return;
    const termStr = typeof searchTerm === "string" ? searchTerm : (searchTerm?.name || searchTerm?.title || String(searchTerm));
    const cleanTerm = termStr.trim();
    if (!cleanTerm) return;

    const updated = [
      cleanTerm,
      ...history.filter((item) => {
        const itemStr = typeof item === "string" ? item : (item?.name || item?.title || String(item));
        return itemStr.toLowerCase() !== cleanTerm.toLowerCase();
      }),
    ].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const executeSearch = (searchTerm) => {
    if (!searchTerm) return;
    const termStr = typeof searchTerm === "string" ? searchTerm : (searchTerm?.name || searchTerm?.title || "");
    const cleanTerm = termStr.trim();
    if (!cleanTerm) return;

    saveToHistory(cleanTerm);
    onClose();
    navigate(`/product-list?search=${encodeURIComponent(cleanTerm)}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      executeSearch(query.trim());
    }
  };

  // Voice Search Handler (Web Speech API)
  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.warning("Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Không thể nhận diện giọng nói. Vui lòng thử lại!");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        fetchSuggestions(transcript);
        toast.success(`Đã nhận diện: "${transcript}"`);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("recent_searches");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-2 sm:pt-16 px-2 sm:px-6">
          {/* Backdrop */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Window */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200/80 dark:border-slate-800"
          >
            {/* Top Search Bar Input Area */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-[0_2px_10px_rgba(15,23,42,0.03)] focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/15 transition-all duration-200"
              >
                <div className="flex items-center justify-center size-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                  <FiSearch className="w-4 h-4" />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Tìm kiếm sản phẩm, thương hiệu, linh kiện..."
                  className="w-full py-1 text-sm sm:text-base font-medium bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 border-none outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:outline-none shadow-none"
                  style={{ outline: "none", boxShadow: "none" }}
                />

                {/* Action Tools: Clear, Voice Search, Camera */}
                <div className="flex items-center gap-1 shrink-0">
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setSuggestions({ products: [], keywords: [], brands: [], categories: [] });
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
                      title="Xóa từ khóa"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}

                  {/* Voice Search Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceSearch}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      isListening
                        ? "bg-rose-500 text-white animate-pulse shadow-xs"
                        : "text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700/60 dark:text-slate-400"
                    }`}
                    title={isListening ? "Đang nghe..." : "Tìm kiếm bằng giọng nói"}
                  >
                    {isListening ? (
                      <FiMicOff className="w-4 h-4" />
                    ) : (
                      <FiMic className="w-4 h-4" />
                    )}
                  </button>

                  {/* Visual Search Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenVisualSearch) onOpenVisualSearch();
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700/60 dark:text-slate-400 rounded-xl transition cursor-pointer"
                    title="Tìm kiếm bằng hình ảnh Camera AI"
                  >
                    <FiCamera className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Body Content Area */}
            <div className="max-h-[60vh] md:max-h-[65vh] overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-center justify-center py-10 text-xs font-medium text-slate-500 dark:text-slate-400 gap-3">
                  <UnifiedSpinner size="sm" variant="primary" />
                  <span>Đang tìm kiếm sản phẩm phù hợp...</span>
                </div>
              )}

              {/* Results when searching */}
              {query.trim() && !loading && (
                <>
                  {/* Direct Product Match */}
                  {suggestions.products.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 px-1">
                        <span>Sản phẩm gợi ý ({suggestions.products.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {suggestions.products.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              saveToHistory(item.name);
                              onClose();
                              navigate(`/product-detail/${item.slug || item.id}`);
                            }}
                            className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800/60 cursor-pointer transition-all duration-200 group shadow-2xs hover:shadow-sm"
                          >
                            <div className="size-13 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                              <img
                                src={item.thumbnail || item.image || "/images/placeholder.png"}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                  {item.price ? `${Number(item.price).toLocaleString("vi-VN")}đ` : "Liên hệ"}
                                </span>
                                {item.isFlashSale && (
                                  <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                                    Hot
                                  </span>
                                )}
                              </div>
                            </div>
                            <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories & Brands matching */}
                  {(suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {suggestions.categories.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 px-1">
                            Danh mục liên quan
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.categories.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => executeSearch(cat.name)}
                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestions.brands.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 px-1">
                            Thương hiệu
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.brands.map((brand) => (
                              <button
                                key={brand.id}
                                onClick={() => executeSearch(brand.name)}
                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                              >
                                {brand.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No results state */}
                  {suggestions.products.length === 0 &&
                    suggestions.categories.length === 0 &&
                    suggestions.brands.length === 0 && (
                      <div className="text-center py-10 text-slate-500">
                        <p className="text-sm font-medium">Không tìm thấy kết quả phù hợp cho "{query}"</p>
                        <button
                          type="button"
                          onClick={() => executeSearch(query)}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs cursor-pointer"
                        >
                          <span>Tìm kiếm tất cả sản phẩm với từ khóa này</span> <FiCornerDownLeft />
                        </button>
                      </div>
                    )}
                </>
              )}

              {/* Default State (When query is empty) */}
              {!query.trim() && (
                <>
                  {/* Recent Searches */}
                  {history.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 px-1">
                        <span className="flex items-center gap-1.5">
                          <FiClock className="w-3.5 h-3.5 text-slate-400" /> Lịch sử tìm kiếm
                        </span>
                        <button
                          type="button"
                          onClick={clearHistory}
                          className="text-xs text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {history.map((term, index) => {
                          const displayTerm = typeof term === "string" ? term : (term?.name || String(term));
                          return (
                            <button
                              key={index}
                              onClick={() => executeSearch(displayTerm)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
                            >
                              {displayTerm}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Trending Search Keywords */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 px-1">
                      <FiTrendingUp className="w-3.5 h-3.5 text-rose-500" />
                      <span>Xu hướng tìm kiếm</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_KEYWORDS.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => executeSearch(item)}
                          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full bg-slate-100/90 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-800/60 transition-all duration-150 cursor-pointer shadow-2xs hover:scale-[1.02]"
                        >
                          <span className="size-1.5 rounded-full bg-blue-500"></span>
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Category Nav */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 px-1">
                      <FiTag className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Danh mục phổ biến</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {QUICK_CATEGORIES.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onClose();
                            navigate(cat.path);
                          }}
                          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800/60 hover:shadow-2xs transition-all duration-200 text-left cursor-pointer group"
                        >
                          <span className="size-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                            {cat.icon}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px]">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs">Ctrl K</kbd>
                  <span>mở</span>
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs">ESC</kbd>
                  <span>đóng</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <FiZap className="w-3 h-3 text-amber-500" />
                <span>TienTech Search</span>
              </div>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
