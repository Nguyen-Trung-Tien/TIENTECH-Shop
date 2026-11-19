import React from "react";
import { Compass, Award, CheckCircle2, Zap, XCircle, Info } from "lucide-react";
import UnifiedSpinner from "../../Loading/UnifiedSpinner";

const FortuneElementConsole = ({
  birthYear,
  onBirthYearChange,
  yearOptions,
  gender,
  onGenderChange,
  loadingFengShui,
  fsDetail,
}) => {
  return (
    <section className="mb-10 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Compass className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">
              Thiết Lập Hồ Sơ Màu Sắc &amp; Setup Cá Nhân
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gợi ý màu sắc thiết bị &amp; không gian setup được cá nhân hóa trực tiếp từ AI Tech Color &amp; Setup Advisor.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-3">
              Năm sinh:
            </span>
            <select
              value={birthYear}
              onChange={(e) => onBirthYearChange(Number(e.target.value))}
              aria-label="Chọn năm sinh"
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onGenderChange("male")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                gender === "male"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Nam Mạng
            </button>
            <button
              type="button"
              onClick={() => onGenderChange("female")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                gender === "female"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Nữ Mạng
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loadingFengShui ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <UnifiedSpinner size="md" variant="primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Đang phân tích hồ sơ màu sắc &amp; setup từ máy chủ...
            </span>
          </div>
        ) : fsDetail ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-slate-100/90 dark:from-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white p-6 sm:p-7 rounded-2xl relative overflow-hidden flex flex-col justify-between border border-blue-100 dark:border-slate-800 shadow-sm dark:shadow-md transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:bg-white/10 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/20 dark:border-white/15">
                    <Award className="size-3.5" />
                    Hồ Sơ Màu &amp; Setup Chuẩn AI
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Sinh năm {fsDetail.year} ({fsDetail.gender})
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2.5 mb-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Mệnh {fsDetail.element}
                  </h3>
                  <span className="text-sm font-semibold text-primary dark:text-blue-300">
                    • Cung {fsDetail.cungPhi}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    (Mệnh Niên: {fsDetail.menhNien})
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2 break-words [overflow-wrap:anywhere]">
                  {fsDetail.advice}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Chỉ Số Gợi Ý Setup:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {fsDetail.luckyNumbers?.map((num) => (
                      <span
                        key={num}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 text-amber-600 dark:text-amber-300 font-black text-xs flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-xs"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Bộ Lọc Ngũ Hành
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                    Màu hợp mệnh {fsDetail.element}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-2.5">
                    <CheckCircle2 className="size-4" />
                    Màu Bản Mệnh (Đại Cát)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {fsDetail.luckyColors?.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-2.5">
                    <Zap className="size-4" />
                    Màu Tương Sinh (Bổ Trợ)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {fsDetail.supportColors?.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {fsDetail.badColors && fsDetail.badColors.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                  <div className="flex items-center gap-1.5 font-black uppercase tracking-wider shrink-0">
                    <XCircle className="size-3.5" />
                    Màu Kỵ Cần Hạn Chế:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {fsDetail.badColors.map((bc, idx) => (
                      <span
                        key={idx}
                        className="font-semibold text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded text-[11px]"
                      >
                        {bc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <Info className="text-blue-500 shrink-0 mt-0.5 size-4" />
                <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                  <span className="font-bold text-slate-900 dark:text-white mr-1">
                    Mẹo đặt bàn làm việc:
                  </span>
                  {fsDetail.workspaceTip}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default FortuneElementConsole;
