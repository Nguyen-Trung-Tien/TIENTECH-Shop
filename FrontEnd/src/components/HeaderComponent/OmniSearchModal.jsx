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
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSuggestions({ products: [], keywords: [], brands: [], categories: [] });
    }
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
          setSuggestions({
            products: res.data?.products || [],
            keywords: res.data?.keywords || [],
            brands: res.data?.brands || [],
            categories: res.data?.categories || [],
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
    if (!searchTerm.trim()) return;
    const updated = [
      searchTerm,
      ...history.filter((item) => item !== searchTerm),
    ].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const executeSearch = (searchTerm) => {
    saveToHistory(searchTerm);
    onClose();
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 sm:px-6">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-3xl glass-modal rounded-2xl shadow-2xl overflow-hidden z-10 border border-white/20 dark:border-slate-800"
        >
          {/* Top Search Bar Input Area */}
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70"
          >
            <FiSearch className="w-5 h-5 text-primary dark:text-primary-light shrink-0 ml-1" />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Tìm sản phẩm, thương hiệu, danh mục... (Nhấn Enter để tìm)"
              className="w-full pl-3 pr-24 py-1.5 text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />

            {/* Action Tools: Voice Search, Camera (Visual Search), Clear */}
            <div className="flex items-center gap-1.5 shrink-0 pr-1">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSuggestions({ products: [], keywords: [], brands: [], categories: [] });
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Xóa tìm kiếm"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`p-2 rounded-lg transition ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
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
                className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 rounded-lg transition flex items-center gap-1"
                title="Tìm kiếm bằng hình ảnh (AI Vision)"
              >
                <FiCamera className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium text-primary">
                  Vision AI
                </span>
              </button>
            </div>
          </form>

          {/* Body Content Area */}
          <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5 custom-scrollbar">
            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center justify-center py-6 text-sm text-slate-500 gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Đang tìm kiếm dữ liệu sản phẩm...
              </div>
            )}

            {/* Results when searching */}
            {query.trim() && !loading && (
              <>
                {/* Direct Product Match */}
                {suggestions.products.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Sản Phẩm Gợi Ý ({suggestions.products.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suggestions.products.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            saveToHistory(item.name);
                            onClose();
                            navigate(`/product/${item.slug || item.id}`);
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                        >
                          <img
                            src={item.thumbnail || item.image || "/images/placeholder.png"}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition">
                              {item.name}
                            </h4>
                            <p className="text-xs font-semibold text-rose-500 dark:text-rose-400">
                              {item.price ? `${Number(item.price).toLocaleString("vi-VN")} đ` : "Liên hệ"}
                            </p>
                          </div>
                          <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories & Brands matching */}
                {(suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {suggestions.categories.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Danh mục liên quan
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestions.categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => executeSearch(cat.name)}
                              className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary transition"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.brands.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Thương hiệu
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestions.brands.map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => executeSearch(brand.name)}
                              className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary transition"
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
                    <div className="text-center py-8 text-slate-500">
                      <p className="text-sm">Không tìm thấy kết quả phù hợp cho "{query}"</p>
                      <button
                        type="button"
                        onClick={() => executeSearch(query)}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-primary-hover transition"
                      >
                        Tìm tất cả kết quả với từ khóa này <FiCornerDownLeft />
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
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5" /> Lịch sử tìm kiếm
                      </span>
                      <button
                        type="button"
                        onClick={clearHistory}
                        className="text-slate-400 hover:text-rose-500 transition text-[11px] normal-case"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {history.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => executeSearch(term)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Search Keywords */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <FiTrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    <span>Xu hướng tìm kiếm hot</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_KEYWORDS.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => executeSearch(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white dark:hover:bg-primary transition"
                      >
                        <FiZap className="w-3 h-3" />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Category Nav */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <FiTag className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Danh mục phổ biến</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {QUICK_CATEGORIES.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onClose();
                          navigate(cat.path);
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left border border-slate-100 dark:border-slate-800"
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
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
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="kbd-badge">Ctrl</span>
                <span className="kbd-badge">K</span> để bật/Tắt
              </span>
              <span className="flex items-center gap-1">
                <span className="kbd-badge">Esc</span> đóng
              </span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <FiZap className="w-3 h-3" /> TIEN TECH Omni-Search Engine
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
}
