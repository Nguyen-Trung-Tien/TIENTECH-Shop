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
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessage } from "../../api/chatApi";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fullMode, setFullMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState("");

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [hasGreeted, setHasGreeted] = useState(false);

  const user = useSelector((state) => state.user.user);
  const userId = user?.id || null;

  const quickActions = [
    "Tìm laptop văn phòng",
    "Sản phẩm đang giảm giá",
    "Tra cứu đơn hàng",
    "Chính sách bảo hành",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const formatTime = (date) =>
    `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content, time: new Date() }]);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        addMessage(
          "assistant",
          "👋 Xin chào! Tôi là TienTech AI. Tôi có thể giúp gì cho bạn hôm nay?",
        );
      }, 600);
    }
  }, [isOpen, messages.length, hasGreeted]);

  const streamText = useCallback(async (text) => {
    setTyping("");
    for (let i = 0; i < text.length; i++) {
      await new Promise((r) => setTimeout(r, 10));
      setTyping((prev) => prev + text[i]);
    }
    addMessage("assistant", text);
    setTyping("");
  }, []);

  const sendText = async (text) => {
    if (!text.trim() || loading) return;

    setLoading(true);
    addMessage("user", text);

    try {
      const reply = await sendMessage(text, userId);
      await streamText(reply);
    } catch (err) {
      console.error(err);
      await streamText(
        "Xin lỗi, tôi đang gặp một chút sự cố kỹ thuật. Vui lòng thử lại sau nhé! 😥",
      );
    }

    setLoading(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendText(input);
    setInput("");
  };

  return (
    <>
      {/* ===== FLOATING BUTTON ===== */}
      <div className="fixed bottom-6 right-6 z-[999]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${
            isOpen ? "bg-surface-900 rotate-90" : "bg-primary"
          }`}
        >
          {isOpen ? <FiX size={28} /> : <FiMessageSquare size={28} />}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></span>
          )}
        </motion.button>
      </div>

      {/* ===== CHAT WINDOW ===== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95,
              transformOrigin: "bottom right",
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-[998] bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-500 ${
              fullMode
                ? "inset-4 md:inset-10 rounded-[40px]"
                : "bottom-24 right-6 w-[90vw] md:w-[400px] h-[70vh] max-h-[600px] rounded-[32px]"
            }`}
          >
            {/* HEADER */}
            <div className="px-6 py-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                  <FiCpu size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">
                    TienTech AI
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>

                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                      Đang trực tuyến
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFullMode(!fullMode)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-surface-400"
                >
                  {fullMode ? (
                    <FiMinimize2 size={18} />
                  ) : (
                    <FiMaximize2 size={18} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-surface-400"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50 dark:bg-gray-950">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                        msg.role === "user"
                          ? "bg-white dark:bg-gray-900 text-surface-400"
                          : "bg-primary text-white"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <FiUser size={14} />
                      ) : (
                        <FiCpu size={14} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`px-4 py-3 text-sm font-medium shadow-sm ${
                          msg.role === "user"
                            ? "bg-gray-900 dark:bg-primary text-white rounded-2xl rounded-tr-none"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-surface-900 dark:text-white rounded-2xl rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p
                        className={`text-[10px] font-bold text-surface-400 dark:text-dark-text-muted px-1 ${msg.role === "user" ? "text-right" : "text-left"}`}
                      >
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {(loading || typing) && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FiCpu size={14} />
                    </div>
                    <div className="bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm min-w-[60px]">
                      {typing ? (
                        <p className="text-sm font-medium text-surface-900 dark:text-white">
                          {typing}
                        </p>
                      ) : (
                        <div className="flex gap-1 py-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* QUICK ACTIONS */}
            <div className="px-6 py-4 bg-white dark:bg-dark-card border-t border-surface-100 dark:border-dark-border flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {quickActions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendText(q)}
                  className="px-4 py-2 bg-surface-50 dark:bg-dark-bg hover:bg-primary/10 dark:hover:bg-primary/20 border border-surface-200 dark:border-dark-border hover:border-primary/30 rounded-full text-[12px] font-bold text-surface-600 dark:text-dark-text-muted hover:text-primary dark:hover:text-primary transition-all whitespace-nowrap flex items-center gap-1.5 group"
                >
                  <FiZap
                    size={12}
                    className="text-amber-500 group-hover:scale-125 transition-transform"
                  />
                  {q}
                </button>
              ))}
            </div>

            {/* INPUT BOX */}
            <form
              onSubmit={handleSend}
              className="p-6 bg-white dark:bg-gray-900 border-t border-surface-100 dark:border-dark-border shrink-0"
            >
              <div className="relative flex items-center gap-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi tôi bất cứ điều gì..."
                  disabled={loading}
                  className="flex-1 h-14 pl-6 pr-14 bg-surface-50 dark:bg-dark-bg border-2 border-transparent rounded-2xl text-[15px] font-bold dark:text-white focus:bg-white dark:focus:bg-dark-bg focus:border-primary/20 outline-none transition-all placeholder:text-surface-300 dark:placeholder:text-dark-text-muted"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    input.trim()
                      ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105"
                      : "text-surface-300 dark:text-dark-text-muted"
                  }`}
                >
                  <FiSend size={18} />
                </button>
              </div>
              <p className="mt-3 text-[10px] text-center text-surface-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">
                Được hỗ trợ bởi TienTech AI Engine v4.0
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
