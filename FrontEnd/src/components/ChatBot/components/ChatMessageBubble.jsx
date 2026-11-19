import React from "react";
import { Link } from "react-router-dom";
import { m as Motion } from "framer-motion";
import { User, Cpu, Check, Copy, ShoppingBag, ChevronRight } from "lucide-react";
import FormattedText from "./FormattedText";
import { formatChatTime } from "./chatBotHelpers";

const ChatMessageBubble = ({ msg, index, copiedIdx, onCopy }) => {
  return (
    <Motion.div
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
          {msg.role === "user" ? (
            <User className="size-3.5" />
          ) : (
            <Cpu className="size-3.5" />
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div
            className={`group relative px-4 py-3 text-sm font-medium shadow-sm transition-all ${
              msg.role === "user"
                ? "bg-blue-600 dark:bg-blue-600 text-white rounded-2xl rounded-tr-none"
                : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-tl-none"
            }`}
          >
            <FormattedText text={msg.content} />

            {msg.role === "assistant" && (
              <button
                type="button"
                onClick={() => onCopy(msg.content, index)}
                title="Sao chép câu trả lời"
                aria-label="Sao chép câu trả lời"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-blue-600 transition-all text-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedIdx === index ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-[10px] text-emerald-500">Đã chép</span>
                  </>
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            )}

            {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <ShoppingBag className="size-3" /> Sản phẩm đề xuất:
                </p>
                <div className="grid gap-2">
                  {msg.recommendedProducts.map((prod) => (
                    <Link
                      key={prod.id || prod._id}
                      to={`/product-detail/${prod.slug || prod.id || prod._id}`}
                      className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-gray-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
                    >
                      <div className="size-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 p-1">
                        <img
                          src={
                            prod.image ||
                            (typeof prod.images?.[0] === "string"
                              ? prod.images[0]
                              : prod.images?.[0]?.imageUrl) ||
                            "/images/no-image.png"
                          }
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
                            {Number(
                              prod.displayPrice ??
                                prod.finalPrice ??
                                prod.price ??
                                prod.basePrice ??
                                0,
                            ).toLocaleString("vi-VN")}
                            đ
                          </p>
                          {prod.discount > 0 && (
                            <span className="text-[9px] font-extrabold bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-1 py-0.2 rounded">
                              -{prod.discount}%
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="size-3.5 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </Link>
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
            {formatChatTime(msg.time)}
          </p>
        </div>
      </div>
    </Motion.div>
  );
};

export default ChatMessageBubble;
