import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Award, BatteryCharging, Cpu, Sparkles, TrendingUp } from "lucide-react";
import type { CompareProductDetail, CompareWinners } from "../types";

const SERIES_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ec4899"];

interface BenchmarkChartsProps {
  products: CompareProductDetail[];
  winners: CompareWinners;
}

const BenchmarkCharts: React.FC<BenchmarkChartsProps> = ({ products, winners }) => {
  if (!products.length) return null;

  const findName = (id: number | null): string =>
    products.find((p) => p.id === id)?.name || "—";

  const radarData = [
    {
      axis: "Hiệu năng",
      ...Object.fromEntries(products.map((p) => [`p_${p.id}`, p.benchmark?.performance || 0])),
    },
    {
      axis: "Màn hình",
      ...Object.fromEntries(products.map((p) => [`p_${p.id}`, p.benchmark?.display || 0])),
    },
    {
      axis: "Pin & Sạc",
      ...Object.fromEntries(products.map((p) => [`p_${p.id}`, p.benchmark?.battery || 0])),
    },
    {
      axis: "Camera/Build",
      ...Object.fromEntries(products.map((p) => [`p_${p.id}`, p.benchmark?.cameraBuild || 0])),
    },
    {
      axis: "Giá trị P/P",
      ...Object.fromEntries(products.map((p) => [`p_${p.id}`, p.benchmark?.value || 0])),
    },
  ];

  const barData = products.map((p) => ({
    name: p.name.length > 22 ? `${p.name.slice(0, 20)}…` : p.name,
    "Tổng hợp": p.benchmark?.overallScore || 0,
    "Giá trị P/P": p.benchmark?.value || 0,
  }));

  const winnerCards = [
    {
      label: "Tổng thể tốt nhất",
      productId: winners.overall,
      icon: <Award className="w-4 h-4 text-amber-500 shrink-0" />,
      tone: "border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20",
    },
    {
      label: "Hiệu năng mạnh nhất",
      productId: winners.performance,
      icon: <Cpu className="w-4 h-4 text-blue-600 shrink-0" />,
      tone: "border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/20",
    },
    {
      label: "Pin bền bỉ nhất",
      productId: winners.battery,
      icon: <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0" />,
      tone: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20",
    },
    {
      label: "Tối ưu giá trị (P/P)",
      productId: winners.bestValue,
      icon: <TrendingUp className="w-4 h-4 text-purple-600 shrink-0" />,
      tone: "border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/20",
    },
  ];

  return (
    <section className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
            <Sparkles className="w-4 h-4" />
            <span>Benchmark 5 Trục (Thang điểm 0 – 100)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words [overflow-wrap:anywhere]">
            Chấm điểm tất định từ thông số phần cứng thực tế, dung lượng pin, công nghệ hiển thị và hiệu quả trên giá bán.
          </p>
        </div>
      </div>

      {products.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {winnerCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border p-3.5 flex items-start gap-2.5 min-w-0 ${card.tone}`}
            >
              {card.icon}
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 break-words [overflow-wrap:anywhere]">
                  {findName(card.productId)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke="#cbd5e1" strokeOpacity={0.5} />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              {products.map((prod, idx) => (
                <Radar
                  key={prod.id}
                  name={prod.name}
                  dataKey={`p_${prod.id}`}
                  stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
                  fill={SERIES_COLORS[idx % SERIES_COLORS.length]}
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} margin={{ top: 12, right: 16, left: -12, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Tổng hợp" fill="#2563eb" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Giá trị P/P" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transparency spec coverage strip */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {products.map((prod, idx) => (
          <div
            key={prod.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border text-xs min-w-0"
          >
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }}
            />
            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
              {prod.name}
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {prod.benchmark?.overallScore || 0}đ • Phủ TS: {prod.specCoveragePct}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenchmarkCharts;
