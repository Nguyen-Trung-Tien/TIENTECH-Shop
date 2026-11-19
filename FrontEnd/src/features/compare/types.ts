export type CompareUseCase =
  | "general"
  | "gaming"
  | "office"
  | "creative"
  | "student"
  | "battery";

export interface CompareTrayItem {
  id: number;
  slug?: string | null;
  name: string;
  image?: string | null;
  price: number;
  categoryName?: string | null;
  brandName?: string | null;
}

export interface NormalizedSpecField {
  raw: string | null;
  display: string;
  numericValue: number | null;
  unit?: string;
  higherIsBetter?: boolean;
}

export interface BenchmarkScores {
  performance: number;
  display: number;
  battery: number;
  cameraBuild: number;
  value: number;
  overallScore: number;
}

export interface CompareProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  brand: { id: number; name: string; slug?: string } | null;
  category: { id: number; name: string; slug?: string } | null;
  basePrice: number;
  displayPrice: number;
  discountPercent: number;
  flashSaleActive: boolean;
  totalStock: number;
  sold: number;
  avgRating: number;
  reviewCount: number;
  archetype: string;
  specCoveragePct: number;
  normalizedSpecs: Record<string, NormalizedSpecField>;
  benchmark: BenchmarkScores;
}

export interface CompareMatrixCell {
  display: string;
  raw: string | number | null;
  numericValue: number | null;
}

export interface CompareMatrixRow {
  key: string;
  label: string;
  keySpec: boolean;
  quantifiable: boolean;
  higherIsBetter?: boolean;
  isDifferent: boolean;
  bestProductId: number | null;
  valuesByProductId: Record<number, CompareMatrixCell>;
}

export interface CompareMatrixSection {
  id: string;
  title: string;
  rows: CompareMatrixRow[];
}

export interface CompareWinners {
  performance: number | null;
  display: number | null;
  battery: number | null;
  cameraBuild: number | null;
  value: number | null;
  overall: number | null;
  bestValue: number | null;
}

export interface ComparePayload {
  products: CompareProductDetail[];
  matrix: CompareMatrixSection[];
  benchmarks: Record<number, BenchmarkScores>;
  winners: CompareWinners;
  categoryMismatchWarning: string | null;
}

export interface UseCaseRecommendation {
  useCase: string;
  recommendedProductId: number;
  reason: string;
}

export interface ProsConsItem {
  pros: string[];
  cons: string[];
}

export interface CompareAiVerdict {
  winnerId: number;
  headline: string;
  summary: string;
  useCaseRecommendations: UseCaseRecommendation[];
  prosConsByProduct: Record<number, ProsConsItem>;
  note: string | null;
  source: string;
}

export interface ApiResponse<T> {
  errCode: number;
  errMessage?: string;
  message?: string;
  data?: T;
}
