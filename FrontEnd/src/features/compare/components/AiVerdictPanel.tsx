import React, { useCallback, useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { fetchCompareAiVerdictApi } from "../compareApi";
import type {
  CompareAiVerdict,
  CompareProductDetail,
  CompareUseCase,
} from "../types";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";

const USE_CASES: Array<{ key: CompareUseCase; label: string }> = [
  { key: "general", label: "Đa năng" },
  { key: "gaming", label: "Gaming & Đồ họa" },
  { key: "office", label: "Văn phòng" },
  { key: "creative", label: "Sáng tạo nội dung" },
  { key: "student", label: "Sinh viên / P-P" },
  { key: "battery", label: "Pin bền bỉ" },
];

interface AiVerdictPanelProps {
  productIds: number[];
  products: CompareProductDetail[];
}

const AiVerdictPanel: React.FC<AiVerdictPanelProps> = ({
  productIds,
  products,
}) => {
  const [useCase, setUseCase] = useState<CompareUseCase>("general");
  const [verdict, setVerdict] = useState<CompareAiVerdict | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const idsKey = productIds.join(",");

  const loadVerdict = useCallback(async () => {
    if (productIds.length < 2) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchCompareAiVerdictApi(productIds, useCase);
      if (res?.errCode === 0 && res.data) {
        setVerdict(res.data);
      } else {
        setError(res?.errMessage || "Không thể tạo nhận định AI.");
      }
    } catch {
      setError("Hệ thống AI tạm thời bận, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, useCase]);

  useEffect(() => {
    loadVerdict();
  }, [loadVerdict]);

  if (productIds.length < 2) {
    return null;
  }

  const getProductName = (id: number): string =>
    products.find((p) => p.id === id)?.name || `Sản phẩm #${id}`;

  return (
    <section className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:from-slate-900 dark:via-dark-surface dark:to-indigo-950/30 border border-blue-200/80 dark:border-dark-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
            <Bot className="w-4 h-4" />
            <span>TienTech AI Verdict — Tư vấn theo nhu cầu</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words [overflow-wrap:anywhere]">
            Chọn mục đích sử dụng để nhận đánh giá ưu/nhược điểm và khuyến nghị chuẩn xác.
          </p>
        </div>

        <button
          type="button"
          onClick={loadVerdict}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-primary/60 transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Phân tích lại</span>
        </button>
      </div>

      {/* Use case chips */}
      <div className="flex flex-wrap gap-2">
        {USE_CASES.map((uc) => {
          const active = useCase === uc.key;
          return (
            <button
              key={uc.key}
              type="button"
              onClick={() => setUseCase(uc.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                active
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "bg-white dark:bg-dark-bg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border hover:border-primary/50"
              }`}
            >
              {uc.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-10">
          <UnifiedSpinner size="md" variant="primary" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            AI đang phân tích thông số &amp; đối chiếu benchmark...
          </span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : verdict ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-surface border border-blue-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-black">
                <Sparkles className="w-3.5 h-3.5" />
                Khuyến nghị: {getProductName(verdict.winnerId)}
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                {verdict.source === "gemini_ai" ? "Gemini AI" : "Benchmark Engine"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">
              {verdict.headline}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words [overflow-wrap:anywhere]">
              {verdict.summary}
            </p>
            {verdict.note && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-2 break-words [overflow-wrap:anywhere]">
                Lưu ý: {verdict.note}
              </p>
            )}
          </div>

          {verdict.useCaseRecommendations?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {verdict.useCaseRecommendations.map((rec, idx) => (
                <div
                  key={`${rec.useCase}-${idx}`}
                  className="bg-white/90 dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-3.5 space-y-1 min-w-0"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {rec.useCase}
                  </span>
                  <p className="text-xs font-bold text-primary break-words [overflow-wrap:anywhere]">
                    {getProductName(rec.recommendedProductId)}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 break-words [overflow-wrap:anywhere]">
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.map((prod) => {
              const pc = verdict.prosConsByProduct?.[prod.id];
              if (!pc) return null;
              return (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-4 space-y-2.5 min-w-0"
                >
                  <h4 className="text-xs font-black text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">
                    {prod.name}
                  </h4>
                  <div className="space-y-1">
                    {(pc.pros || []).map((pro, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 min-w-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                          {pro}
                        </span>
                      </div>
                    ))}
                    {(pc.cons || []).map((con, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-400 min-w-0"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                          {con}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AiVerdictPanel;
