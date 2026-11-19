import React from "react";
import { Check, Cpu } from "lucide-react";
import type { CompareMatrixSection, CompareProductDetail } from "../types";

interface CompareSpecMatrixProps {
  products: CompareProductDetail[];
  matrix: CompareMatrixSection[];
  viewMode: "all" | "diff-only" | "key-specs";
  highlightDiff: boolean;
}

const CompareSpecMatrix: React.FC<CompareSpecMatrixProps> = ({
  products,
  matrix,
  viewMode,
  highlightDiff,
}) => {
  if (!products.length || !matrix.length) return null;

  return (
    <div className="space-y-5">
      {matrix.map((section) => {
        const visibleRows = section.rows.filter((row) => {
          if (viewMode === "diff-only") return row.isDifferent;
          if (viewMode === "key-specs") return row.keySpec;
          return true;
        });

        if (visibleRows.length === 0) return null;

        return (
          <section
            key={section.id}
            className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-3xl overflow-hidden shadow-xs"
          >
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-dark-bg border-b border-slate-200/80 dark:border-dark-border flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary shrink-0" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
                {section.title}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[600px]">
                <tbody>
                  {visibleRows.map((row) => {
                    const rowHighlight =
                      highlightDiff && row.isDifferent
                        ? "bg-amber-50/40 dark:bg-amber-950/15"
                        : "";

                    return (
                      <tr
                        key={row.key}
                        className={`border-b last:border-b-0 border-slate-100 dark:border-dark-border/60 ${rowHighlight}`}
                      >
                        <th
                          scope="row"
                          className="w-44 sm:w-56 px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-300 align-top bg-slate-50/60 dark:bg-dark-bg/40"
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span>{row.label}</span>
                            {highlightDiff && row.isDifferent && (
                              <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                        </th>

                        {products.map((prod) => {
                          const cell = row.valuesByProductId?.[prod.id];
                          const isBest =
                            row.bestProductId !== null &&
                            Number(row.bestProductId) === Number(prod.id);

                          return (
                            <td
                              key={prod.id}
                              className="px-4 py-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 align-top border-l border-slate-100 dark:border-dark-border/60"
                            >
                              <div className="flex flex-col gap-1 min-w-0">
                                <span
                                  className={`break-words [overflow-wrap:anywhere] ${
                                    isBest ? "font-black text-emerald-700 dark:text-emerald-400" : "font-medium"
                                  }`}
                                >
                                  {cell?.display || "Đang cập nhật"}
                                </span>
                                {isBest && (
                                  <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                    <Check className="w-3 h-3" />
                                    Tốt nhất
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default CompareSpecMatrix;
