import axiosClient from "../../utils/axiosClient";
import type {
  ApiResponse,
  CompareAiVerdict,
  ComparePayload,
  CompareTrayItem,
  CompareUseCase,
} from "./types";

interface RawProductCandidate {
  id?: number | string;
  slug?: string | null;
  name?: string;
  image?: string | null;
  images?: Array<{ imageUrl?: string; isPrimary?: boolean }>;
  displayPrice?: number | string;
  flashSalePrice?: number | string;
  price?: number | string;
  basePrice?: number | string;
  category?: { name?: string } | null;
  brand?: { name?: string } | null;
}

const mapCandidateToTrayItem = (raw: RawProductCandidate): CompareTrayItem | null => {
  const id = Number(raw?.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  const primaryImage =
    raw.image ||
    raw.images?.find((i) => i.isPrimary)?.imageUrl ||
    raw.images?.[0]?.imageUrl ||
    null;

  return {
    id,
    slug: raw.slug || null,
    name: String(raw.name || `Sản phẩm #${id}`),
    image: primaryImage,
    price: Number(
      raw.displayPrice ?? raw.flashSalePrice ?? raw.price ?? raw.basePrice ?? 0,
    ),
    categoryName: raw.category?.name || null,
    brandName: raw.brand?.name || null,
  };
};

export const fetchCompareProductsApi = async (
  ids: number[],
): Promise<ApiResponse<ComparePayload>> => {
  const res = (await axiosClient.get("/product/compare", {
    params: { ids: ids.join(",") },
  })) as unknown as ApiResponse<ComparePayload>;
  return res;
};

export const fetchCompareAiVerdictApi = async (
  productIds: number[],
  useCase: CompareUseCase = "general",
): Promise<ApiResponse<CompareAiVerdict>> => {
  const res = (await axiosClient.post("/product/compare/ai-verdict", {
    productIds,
    useCase,
  })) as unknown as ApiResponse<CompareAiVerdict>;
  return res;
};

export const searchCompareProductsApi = async (
  query = "",
): Promise<CompareTrayItem[]> => {
  const cleanQuery = query.trim();
  const res = (await (cleanQuery
    ? axiosClient.get("/product/search", {
        params: { q: cleanQuery, page: 1, limit: 12 },
      })
    : axiosClient.get("/product/get-all-product", {
        params: { page: 1, limit: 12 },
      }))) as unknown as {
    errCode?: number;
    products?: RawProductCandidate[];
    data?: RawProductCandidate[];
  };

  const list = Array.isArray(res?.products)
    ? res.products
    : Array.isArray(res?.data)
      ? res.data
      : [];

  return list
    .map(mapCandidateToTrayItem)
    .filter((item): item is CompareTrayItem => item !== null);
};
