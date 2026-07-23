import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiMessageSquare,
  FiX,
  FiMaximize2,
  FiMinimize2,
  FiSend,
  FiUser,
  FiCpu,
  FiChevronRight,
  FiZap,
  FiCamera,
  FiMic,
  FiMicOff,
  FiCopy,
  FiCheck,
  FiTrash2,
  FiArrowDown,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { motion as Motion, AnimatePresence } from "framer-motion";

import { sendMessage, visualSearch } from "../../api/chatApi";

// Component hiển thị văn bản định dạng Rich Text / Markdown nhẹ
const FormattedText = ({ text }) => {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        const isBullet =
          line.trim().startsWith("- ") || line.trim().startsWith("* ");
        const content = isBullet ? line.trim().substring(2) : line;

        // Xử lý in đậm **text**
        const parts = content.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong
                key={pIdx}
                className="font-extrabold text-blue-700 dark:text-blue-300"
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-blue-500 mt-1.5 text-[8px]">●</span>
              <span className="flex-1">{rendered}</span>
            </div>
          );
        }

        return <p key={idx}>{rendered}</p>;
      })}
    </div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fullMode, setFullMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const user = useSelector((state) => state.user.user);
  const userId = user?.id || null;

  const quickActions = [
    "⚡ Tìm laptop đồ họa",
    "🔥 Điện thoại giảm giá sâu",
    "📦 Tra cứu đơn hàng",
    "🛡️ Chính sách bảo hành",
  ];

  // Khởi tạo Speech Recognition (Giọng nói tiếng Việt)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "vi-VN";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói (Web Speech API).");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Cuộn xuống tin nhắn mới
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollDown(!isAtBottom);
  };

  useEffect(() => {
    let timer;
    if (isOpen) {
      setUnreadCount(0);
      timer = setTimeout(() => inputRef.current?.focus(), 200);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const formatTime = (date) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const addMessage = useCallback(
    (role, content, recommendedProducts = []) => {
      setMessages((prev) => [
        ...prev,
        { role, content, time: new Date(), recommendedProducts },
      ]);
      if (!isOpen && role === "assistant") {
        setUnreadCount((count) => count + 1);
      }
    },
    [isOpen]
  );

  // Lời chào tự động ban đầu
  useEffect(() => {
    let timer;
    if (isOpen && messages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      timer = setTimeout(() => {
        addMessage(
          "assistant",
          "👋 Xin chào! Tôi là **TienTech AI Assistant**.\nTôi có thể hỗ trợ bạn tìm kiếm sản phẩm, tư vấn cấu hình, tra cứu khuyến mãi và tìm kiếm bằng hình ảnh!"
        );
      }, 400);
    }
    return () => clearTimeout(timer);
  }, [isOpen, messages.length, hasGreeted, addMessage]);

  const streamText = useCallback(
    async (text, recommendedProducts = []) => {
      setTyping("");
      for (let i = 0; i < text.length; i++) {
        await new Promise((r) => setTimeout(r, 8));
        setTyping((prev) => prev + text[i]);
      }
      addMessage("assistant", text, recommendedProducts);
      setTyping("");
    },
    [addMessage]
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input file
  };

  const sendText = async (text, img = null) => {
    const messageContent = text.trim();
    if ((!messageContent && !img) || loading) return;

    setLoading(true);
    setInput("");
    const imageToSend = img || attachedImage;
    setAttachedImage(null);

    // Nếu có ảnh -> Thực hiện Tìm kiếm qua hình ảnh
    if (imageToSend) {
      addMessage("user", messageContent || "📷 Đã tải lên 1 hình ảnh để tìm kiếm...");
      setImagePreview(imageToSend);
      try {
        const res = await visualSearch(imageToSend);
        setImagePreview(null);
        if (res.errCode === 0) {
          await streamText(
            `🔍 **TienTech Visual AI** tìm thấy các sản phẩm tương tự (${
              res.data.description || "Phân tích hoàn tất"
            }):`,
            res.data.products || []
          );
        } else {
          await streamText(
            res.errMessage || "Không thể phân tích hình ảnh này. Bạn vui lòng thử ảnh khác nhé!"
          );
        }
      } catch (err) {
        console.error(err);
        setImagePreview(null);
        await streamText(
          "Rất tiếc, hệ thống tìm kiếm bằng hình ảnh đang gặp sự cố. Bạn vui lòng thử lại sau!"
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Gửi câu hỏi dạng văn bản thông thường
    addMessage("user", messageContent);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendMessage(messageContent, userId, history);

      if (res.errCode === 0) {
        const data = res.data;
        if (typeof data === "string") {
          await streamText(data);
        } else if (data && data.reply) {
          await streamText(data.reply, data.recommendedProducts || []);
        } else {
          await streamText("Tôi đã nhận được thông tin nhưng không có phản hồi cụ thể.");
        }
      } else {
        await streamText(
          res.errMessage || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này."
        );
      }
    } catch (err) {
      console.error(err);
      await streamText(
        "Xin lỗi, kết nối tới hệ thống AI tạm thời gián đoạn. Vui lòng thử lại sau! 😥"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendText(input);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm("Bạn có muốn xóa toàn bộ lịch sử trò chuyện không?")) {
      setMessages([]);
      setHasGreeted(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[999]">
        <Motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Mở Chatbot AI"
          className={`relative size-14 md:size-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${
            isOpen
              ? "bg-gray-900 dark:bg-gray-800 rotate-90 shadow-gray-900/30"
              : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-blue-600/40"
          }`}
        >
          {isOpen ? <FiX size={26} /> : <FiMessageSquare size={26} />}

          {/* Unread Message Counter Badge */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-6 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}

          {!isOpen && unreadCount === 0 && (
            <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25"></span>
          )}
        </Motion.button>
      </div>

      {/* Chat Windows Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed z-[998] bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300 ${
              fullMode
                ? "inset-2 md:inset-6 rounded-2xl md:rounded-[36px]"
                : "inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[420px] md:h-[660px] md:max-h-[85vh] rounded-none md:rounded-[32px]"
            }`}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-inner">
                  <FiStar size={20} className="animate-pulse text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black tracking-wide uppercase">
                      TienTech AI
                    </h3>
                    <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-bold uppercase tracking-wider">
                      v6.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-blue-100 font-semibold opacity-90">
                      Sẵn sàng hỗ trợ 24/7
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Header */}
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    title="Xóa lịch sử chat"
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                  >
                    <FiTrash2 size={17} />
                  </button>
                )}
                <button
                  onClick={() => setFullMode(!fullMode)}
                  title={fullMode ? "Thu nhỏ" : "Phóng to"}
                  className="hidden md:flex p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                >
                  {fullMode ? <FiMinimize2 size={17} /> : <FiMaximize2 size={17} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Đóng chat"
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body Messages Container */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 custom-scrollbar bg-slate-50 dark:bg-gray-950/80 relative"
            >
              {messages.map((msg, i) => (
                <Motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2.5 max-w-[88%] md:max-w-[85%] ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`size-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-tr from-gray-800 to-gray-900 text-white"
                          : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                      }`}
                    >
                      {msg.role === "user" ? <FiUser size={14} /> : <FiCpu size={14} />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div
                        className={`group relative px-4 py-3 text-sm font-medium shadow-sm transition-all ${
                          msg.role === "user"
                            ? "bg-blue-600 dark:bg-blue-600 text-white rounded-2xl rounded-tr-none"
                            : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-tl-none"
                        }`}
                      >
                        {/* Content text */}
                        <FormattedText text={msg.content} />

                        {/* Bot Message Copy Button */}
                        {msg.role === "assistant" && (
                          <button
                            onClick={() => handleCopy(msg.content, i)}
                            title="Sao chép câu trả lời"
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-blue-600 transition-all text-xs flex items-center gap-1"
                          >
                            {copiedIdx === i ? (
                              <>
                                <FiCheck size={12} className="text-emerald-500" />
                                <span className="text-[10px] text-emerald-500">Đã chép</span>
                              </>
                            ) : (
                              <FiCopy size={12} />
                            )}
                          </button>
                        )}

                        {/* Recommended Products Grid */}
                        {msg.recommendedProducts &&
                          msg.recommendedProducts.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2.5">
                              <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <FiShoppingBag size={12} /> Sản phẩm đề xuất:
                              </p>
                              <div className="grid gap-2">
                                {msg.recommendedProducts.map((prod) => (
                                  <a
                                    key={prod.id || prod._id}
                                    href={`/product-detail/${prod.slug || prod.id || prod._id}`}
                                    className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-gray-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
                                  >
                                    <div className="size-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 p-1">
                                      <img
                                        src={prod.image || prod.images?.[0]}
                                        alt={prod.name}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-[12px] font-bold text-gray-900 dark:text-white truncate">
                                        {prod.name}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[12px] font-black text-blue-600 dark:text-blue-400">
                                          {prod.price?.toLocaleString("vi-VN")}đ
                                        </p>
                                        {prod.discount > 0 && (
                                          <span className="text-[9px] font-extrabold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-1 py-0.2 rounded">
                                            -{prod.discount}%
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <FiChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform text-sm" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      <p
                        className={`text-[9px] font-semibold text-gray-400 px-1 ${
                          msg.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                </Motion.div>
              ))}

              {/* Visual Search Image Preview loading */}
              {imagePreview && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-1">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-44 object-cover rounded-xl animate-pulse"
                    />
                    <p className="text-[10px] text-center text-blue-600 dark:text-blue-400 font-semibold">
                      🔍 Đang phân tích hình ảnh...
                    </p>
                  </div>
                </div>
              )}

              {/* Bot Typing Indicator */}
              {(loading || typing) && (
                <div className="flex justify-start">
                  <div className="flex gap-2.5 max-w-[85%]">
                    <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FiCpu size={14} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm min-w-[70px]">
                      {typing ? (
                        <FormattedText text={typing} />
                      ) : (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="size-2 bg-blue-600 rounded-full animate-bounce"></span>
                          <span className="size-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="size-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll Down Floating Indicator */}
            {showScrollDown && (
              <button
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-36 right-6 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-10 animate-bounce"
              >
                <FiArrowDown size={16} />
              </button>
            )}

            {/* Quick Actions Chips */}
            <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {quickActions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendText(q.replace(/^[^\s]+\s/, ""))}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200/80 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Pre-send Attached Image Bar */}
            {attachedImage && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={attachedImage}
                    alt="Attached"
                    className="size-10 object-cover rounded-lg border border-blue-200 dark:border-blue-800"
                  />
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    Đã đính kèm ảnh (Sẵn sàng gửi)
                  </span>
                </div>
                <button
                  onClick={() => setAttachedImage(null)}
                  className="p-1 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            )}

            {/* Input Form Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0"
            >
              <div className="relative flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {/* Visual Search Image Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tìm sản phẩm bằng hình ảnh"
                  className="size-11 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <FiCamera size={20} />
                </button>

                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Đang lắng nghe..." : "Nhập bằng giọng nói"}
                  className={`size-11 flex items-center justify-center rounded-xl transition-all ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                      : "text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {isListening ? <FiMicOff size={20} /> : <FiMic size={20} />}
                </button>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening ? "Đang lắng nghe giọng nói..." : "Nhập câu hỏi hoặc đính kèm ảnh..."
                  }
                  disabled={loading}
                  className="flex-1 h-11 px-3 bg-slate-100 dark:bg-gray-800 border border-transparent rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500/40 outline-none transition-all placeholder:text-gray-400"
                />

                {/* Submit Send Button */}
                <button
                  type="submit"
                  disabled={loading || (!input.trim() && !attachedImage)}
                  className={`size-11 rounded-xl flex items-center justify-center transition-all ${
                    input.trim() || attachedImage
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 active:scale-95"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <FiSend size={18} />
                </button>
              </div>

              <p className="mt-2 text-[9px] text-center text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase">
                Powered by TienTech AI Engine v6.0 • Visual & Voice Enabled
              </p>
            </form>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
