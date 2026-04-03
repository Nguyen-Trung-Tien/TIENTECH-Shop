import { useState, useRef, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { FiX, FiSend, FiZap } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { fengShuiChatApi } from "../../api/chatApi";

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
        text: "Kính chào quý khách! 🙏 Tôi là TienTech FengShui Master.",
      },
      {
        sender: "bot",
        text: "Để bắt đầu tư vấn đại cát, xin hãy cho biết năm sinh của quý khách (VD: 1995):",
      },
    ]);
    setStep(STEP.BIRTH);
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
              text: "Năm sinh không hợp lệ. Vui lòng nhập lại (VD: 1998):",
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
            text: "Năm sinh đã nhận. Xin hãy chọn giới tính để tôi tính toán Cung Phi chính xác nhất:",
          },
        ]);
        setStep(STEP.GENDER);
        break;
      }
      case STEP.GENDER: {
        const gender = text.toLowerCase() === "nữ" ? "female" : "male";
        setUserData((prev) => ({ ...prev, gender }));
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `Đã xác nhận quý khách là ${text}. Bạn đang quan tâm đến dòng sản phẩm nào?`,
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
            text: "Đang gieo quẻ & phân tích kho hàng...",
          },
        ]);
        try {
          const res = await fengShuiChatApi({
            birthYear: userData.birthYear,
            gender: userData.gender,
            message: text,
          });

          if (res.fsData) setFsData(res.fsData);

          setMessages((prev) => [
            ...prev.filter((m) => m.type !== "loading"),
            {
              sender: "bot",
              text: res.reply,
              recommendedProducts: res.recommendedProducts,
              fsInfo: res.fsData,
            },
          ]);
        } catch (err) {
          setMessages((prev) => [
            ...prev.filter((m) => m.type !== "loading"),
            {
              sender: "bot",
              text: "Xin lỗi, hiện tại tôi chưa thể kết nối với thiên cơ. Vui lòng thử lại sau!",
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
      <button
        onClick={handleShow}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-900/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[999] border-4 border-blue-100 dark:border-blue-900/30 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <FiZap size={24} className="relative z-10 animate-pulse" />
      </button>

      <AnimatePresence>
        {show && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />

            <Motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-800"
            >
              {/* Header */}
              <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-500 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                    <FiZap size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-base tracking-tight uppercase leading-none">
                      FengShui Master
                    </h3>
                    <p className="text-[10px] font-black text-blue-100 tracking-[0.2em] uppercase mt-1 opacity-80">
                      TienTech Premium AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Status Header */}
              {fsData && (
                <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full animate-ping"
                      style={{ backgroundColor: fsData.hex || "#3b82f6" }}
                    />
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Cung {fsData.cungPhi} • Hành {fsData.element}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {fsData.luckyNumbers.map((n) => (
                      <span
                        key={n}
                        className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-950">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[90%] space-y-3`}>
                      <div
                        className={`p-4 rounded-3xl text-sm shadow-sm leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-tr-none font-bold"
                            : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none font-medium"
                        }`}
                      >
                        {msg.type === "loading" ? (
                          <div className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest text-blue-600">
                            <FaSpinner className="animate-spin" />
                            {msg.text}
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>

                      {/* FS INFO CARD */}
                      {msg.fsInfo && (
                        <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                          <div
                            className="h-2"
                            style={{ background: msg.fsInfo.gradient || "linear-gradient(to right, #3b82f6, #2563eb)" }}
                          />
                          <div className="p-4 bg-white dark:bg-slate-800 space-y-4">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                  Bản mệnh quân vương
                                </p>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">
                                  Hành {msg.fsInfo.element}
                                </h4>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                  Cung Phi
                                </p>
                                <p className="text-sm font-black text-blue-600">
                                  {msg.fsInfo.cungPhi}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50 dark:border-slate-700">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                                  Màu Đại Cát
                                </p>
                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight">
                                  {msg.fsInfo.supportColors.join(", ")}
                                </p>
                              </div>
                              <div className="space-y-1 text-right">
                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">
                                  Màu Bình An
                                </p>
                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight">
                                  {msg.fsInfo.luckyColors.join(", ")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RECOMMENDED PRODUCTS */}
                      {msg.recommendedProducts &&
                        msg.recommendedProducts.length > 0 && (
                          <div className="grid gap-3">
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.2em] ml-2">
                              Sản phẩm linh ứng:
                            </p>
                            {msg.recommendedProducts.map((prod) => (
                              <a
                                key={prod.id}
                                href={`/product-detail/${prod.slug || prod.id}`}
                                className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all group shadow-sm"
                              >
                                <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-full h-full object-contain p-2"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-[12px] font-black text-slate-900 dark:text-white truncate uppercase">
                                    {prod.name}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[13px] font-black text-blue-600">
                                      {prod.price?.toLocaleString()}đ
                                    </span>
                                    {prod.discount > 0 && (
                                      <span className="text-[9px] font-black bg-rose-50 dark:bg-rose-900 text-rose-500 px-1.5 py-0.5 rounded">
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

              {/* Quick Replies Buttons */}
              <AnimatePresence>
                {(step === STEP.GENDER || step === STEP.GOAL) && (
                  <Motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2"
                  >
                    {(step === STEP.GENDER
                      ? ["Nam", "Nữ"]
                      : ["iPhone", "Laptop", "MacBook", "Apple Watch", "iPad"]
                    ).map((item, i) => (
                      <button
                        key={i}
                        onClick={() => processStep(item)}
                        className="px-5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-500 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all active:scale-95"
                      >
                        {item}
                      </button>
                    ))}
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative">
                  <input
                    placeholder={
                      step === STEP.BIRTH
                        ? "Nhập năm sinh (VD: 1998)..."
                        : "Nhập câu trả lời..."
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all pr-14"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase text-center mt-4 tracking-widest opacity-60">
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
