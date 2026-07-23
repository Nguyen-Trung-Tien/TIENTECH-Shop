import { useState, useRef, useEffect } from "react";
import { FiX, FiSend, FiZap, FiStar, FiRefreshCw } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { fengShuiChatApi } from "../../api/chatApi";
import UnifiedSpinner from "../Loading/UnifiedSpinner";

const STEP = { WELCOME: 0, BIRTH: 1, GENDER: 2, GOAL: 3 };

const FengShuiChat = ({ setGlobalBirthYear }) => {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(STEP.WELCOME);
  const [userData, setUserData] = useState({ birthYear: "", gender: "male" });
  const [loading, setLoading] = useState(false);
  const [fsData, setFsData] = useState(null);
  const messagesEndRef = useRef(null);

  const handleShow = () => {
    setShow(true);
    if (messages.length === 0) welcome();
  };

  const handleClose = () => setShow(false);

  const welcome = () => {
    setMessages([
      {
        sender: "bot",
        text: "Kính chào quý khách! 🙏 Tôi là **TienTech FengShui Master**.",
      },
      {
        sender: "bot",
        text: "Để gieo quẻ & tư vấn phong thủy đại cát, xin cho biết năm sinh của quý khách (Ví dụ: **1998**):",
      },
    ]);
    setStep(STEP.BIRTH);
  };

  const handleReset = () => {
    setFsData(null);
    setUserData({ birthYear: "", gender: "male" });
    welcome();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    processStep(text);
  };

  const processStep = async (text) => {
    switch (step) {
      case STEP.BIRTH: {
        const year = parseInt(text);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "⚠️ Năm sinh không hợp lệ. Vui lòng nhập số năm hợp lệ (Ví dụ: **1995**):",
            },
          ]);
          return;
        }
        setUserData((prev) => ({ ...prev, birthYear: year }));
        if (setGlobalBirthYear) setGlobalBirthYear(year);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "✅ Năm sinh đã nhận. Xin hãy chọn giới tính để tôi tính toán Cung Phi chính xác nhất:",
          },
        ]);
        setStep(STEP.GENDER);
        break;
      }
      case STEP.GENDER: {
        const gender = text.toLowerCase().includes("nữ") ? "female" : "male";
        setUserData((prev) => ({ ...prev, gender }));
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `✨ Đã xác nhận quý khách là ${text === "female" ? "Nữ" : text}. Quý khách đang tìm dòng sản phẩm phong thủy nào?`,
          },
        ]);
        setStep(STEP.GOAL);
        break;
      }
      case STEP.GOAL: {
        setLoading(true);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            type: "loading",
            text: "Đang gieo quẻ & phân tích thiên cơ ngũ hành...",
          },
        ]);
        try {
          const res = await fengShuiChatApi({
            birthYear: userData.birthYear,
            gender: userData.gender,
            message: text,
          });

          if (res.errCode === 0) {
            const data = res.data;
            if (data.fsData) setFsData(data.fsData);

            setMessages((prev) => [
              ...prev.filter((m) => m.type !== "loading"),
              {
                sender: "bot",
                text: data.reply,
                recommendedProducts: data.recommendedProducts,
                fsInfo: data.fsData,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev.filter((m) => m.type !== "loading"),
              {
                sender: "bot",
                text:
                  res.errMessage || "Xin lỗi, tôi chưa thể gieo quẻ lúc này.",
              },
            ]);
          }
        } catch (err) {
          setMessages((prev) => [
            ...prev.filter((m) => m.type !== "loading"),
            {
              sender: "bot",
              text: "Xin lỗi, hiện tại không thể kết nối với thiên cơ. Vui lòng thử lại sau!",
            },
          ]);
        }
        setLoading(false);
        break;
      }
    }
  };

  return (
    <>
      {/* Floating FengShui Trigger Button */}
      <button
        onClick={handleShow}
        aria-label="Mở FengShui Master Chatbot"
        className="fixed bottom-20 right-4 md:bottom-24 md:right-6 size-12 md:size-14 bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 text-white rounded-full shadow-xl shadow-indigo-900/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[999] border-2 border-white dark:border-slate-800 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <FiZap size={22} className="relative z-10 animate-pulse text-amber-300" />
      </button>

      {/* FengShui Master Drawer / Modal */}
      <AnimatePresence>
        {show && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
            {/* Backdrop */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <Motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-800"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-800 text-white shadow-md">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <FiStar size={20} className="text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-wide uppercase leading-none">
                      FengShui Master
                    </h3>
                    <p className="text-[10px] font-bold text-amber-300 tracking-wider uppercase mt-1 opacity-90">
                      TienTech Spiritual AI
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleReset}
                    title="Gieo quẻ lại"
                    className="p-2 hover:bg-white/15 rounded-xl transition-colors text-white/80 hover:text-white"
                  >
                    <FiRefreshCw size={17} />
                  </button>
                  <button
                    onClick={handleClose}
                    title="Đóng"
                    className="p-2 hover:bg-white/15 rounded-xl transition-colors text-white/80 hover:text-white"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* Status Header (Feng Shui Info Header) */}
              {fsData && (
                <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-2.5 rounded-full animate-ping"
                      style={{ backgroundColor: fsData.hex || "#3b82f6" }}
                    />
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Cung {fsData.cungPhi} • Mệnh {fsData.element}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {fsData.luckyNumbers?.map((n) => (
                      <span
                        key={n}
                        className="size-5 rounded-md bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 shadow-sm"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[90%] space-y-2.5">
                      <div
                        className={`p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none font-bold"
                            : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none font-medium"
                        }`}
                      >
                        {msg.type === "loading" ? (
                          <div className="flex items-center gap-2.5 font-bold uppercase text-[11px] tracking-wider text-indigo-600 dark:text-indigo-400">
                            <UnifiedSpinner size="xs" variant="primary" />
                            <span>{msg.text}</span>
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>

                      {/* FS INFO CARD */}
                      {msg.fsInfo && (
                        <div className="overflow-hidden rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-md">
                          <div
                            className="h-1.5"
                            style={{
                              background:
                                msg.fsInfo.gradient ||
                                "linear-gradient(to right, #4f46e5, #7c3aed)",
                            }}
                          />
                          <div className="p-3.5 bg-white dark:bg-slate-800 space-y-3">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                  Bản Mệnh
                                </p>
                                <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-200 uppercase italic">
                                  Hành {msg.fsInfo.element}
                                </h4>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                  Cung Phi
                                </p>
                                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                  {msg.fsInfo.cungPhi}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-700">
                              <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                                  Màu Đại Cát
                                </p>
                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                  {msg.fsInfo.supportColors?.join(", ")}
                                </p>
                              </div>
                              <div className="space-y-0.5 text-right">
                                <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase">
                                  Màu Bình An
                                </p>
                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                  {msg.fsInfo.luckyColors?.join(", ")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RECOMMENDED PRODUCTS */}
                      {msg.recommendedProducts &&
                        msg.recommendedProducts.length > 0 && (
                          <div className="grid gap-2 pt-1">
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider ml-1">
                              ✨ Sản phẩm hợp phong thủy:
                            </p>
                            {msg.recommendedProducts.map((prod) => (
                              <a
                                key={prod.id || prod._id}
                                href={`/product-detail/${prod.slug || prod.id || prod._id}`}
                                className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group shadow-sm"
                              >
                                <div className="size-12 rounded-lg bg-slate-50 dark:bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700 p-1">
                                  <img
                                    src={prod.image || prod.images?.[0]}
                                    alt={prod.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-[12px] font-bold text-slate-900 dark:text-white truncate">
                                    {prod.name}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[12px] font-black text-indigo-600 dark:text-indigo-400">
                                      {prod.price?.toLocaleString("vi-VN")}đ
                                    </span>
                                    {prod.discount > 0 && (
                                      <span className="text-[9px] font-black bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-1 py-0.2 rounded">
                                        -{prod.discount}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Options Selection */}
              <AnimatePresence>
                {(step === STEP.GENDER || step === STEP.GOAL) && (
                  <Motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2"
                  >
                    {(step === STEP.GENDER
                      ? ["Nam", "Nữ"]
                      : ["iPhone", "Laptop", "MacBook", "Apple Watch", "iPad"]
                    ).map((item, i) => (
                      <button
                        key={i}
                        onClick={() => processStep(item)}
                        className="px-4 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                      >
                        {item}
                      </button>
                    ))}
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Input Bar */}
              <div className="p-3 md:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative flex items-center">
                  <input
                    placeholder={
                      step === STEP.BIRTH
                        ? "Nhập năm sinh (VD: 1998)..."
                        : "Nhập câu trả lời..."
                    }
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500/40 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all pr-12"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="absolute right-1.5 size-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-900/20 hover:bg-indigo-700 active:scale-95 disabled:opacity-40 transition-all"
                  >
                    <FiSend size={16} />
                  </button>
                </div>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase text-center mt-2.5 tracking-wider">
                  Powered by TienTech AI Engine Spiritual Edition
                </p>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FengShuiChat;
