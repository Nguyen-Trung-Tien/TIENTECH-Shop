import { useQuery } from "@tanstack/react-query";
import {
  getHomePageDataApi,
  getPersonalizedRecommendationsApi,
} from "../../../api/productApi";
import { getAllBrandApi } from "../../../api/brandApi";
import { getAllCategoryApi } from "../../../api/categoryApi";
import { getAllAttributesApi } from "../../../api/attributeApi";
import { fetchCompareProductsApi } from "../../compare/compareApi";

export const catalogQueryKeys = {
  home: ["catalog", "home"] as const,
  personalizedRecs: (limit: number) =>
    ["catalog", "personalized-recs", limit] as const,
  brands: (limit?: number) => ["catalog", "brands", limit ?? "all"] as const,
  categories: (limit?: number) =>
    ["catalog", "categories", limit ?? "all"] as const,
  attributes: ["catalog", "attributes"] as const,
  compare: (ids: number[]) =>
    ["compare", "products", [...ids].sort((a, b) => a - b).join(",")] as const,
};

export interface BrandOption {
  id: number | string;
  name: string;
  slug: string;
  image?: string;
}

export interface CategoryOption {
  id: number | string;
  name: string;
  slug: string;
  image?: string;
}

export interface HomePageDataPayload {
  brands?: BrandOption[];
  categories?: CategoryOption[];
  flashSale?: unknown[];
  products?: unknown[];
}

interface UnwrappedApiResponse<T = unknown> {
  errCode?: number;
  errMessage?: string;
  data?: T;
  products?: unknown[];
  brands?: BrandOption[];
}

export const useHomeDataQuery = () =>
  useQuery({
    queryKey: catalogQueryKeys.home,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const res = (await getHomePageDataApi()) as unknown as UnwrappedApiResponse<HomePageDataPayload>;
      if (res?.errCode !== 0 || !res?.data) {
        throw new Error(res?.errMessage || "Không thể tải dữ liệu trang chủ.");
      }
      return res.data;
    },
  });

export const usePersonalizedRecsQuery = (limit = 6) =>
  useQuery({
    queryKey: catalogQueryKeys.personalizedRecs(limit),
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const res = (await getPersonalizedRecommendationsApi(limit)) as unknown as UnwrappedApiResponse;
      return res?.errCode === 0 && Array.isArray(res.products) ? res.products : [];
    },
  });

export const useBrandsQuery = (limit?: number, enabled = true) =>
  useQuery({
    queryKey: catalogQueryKeys.brands(limit),
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = (
        typeof limit === "number"
          ? await getAllBrandApi(1, limit, "")
          : await getAllBrandApi()
      ) as unknown as UnwrappedApiResponse<BrandOption[]>;
      if (res?.errCode !== 0) return [];
      return res.brands || res.data || [];
    },
  });

export const useCategoriesQuery = (limit?: number, enabled = true) =>
  useQuery({
    queryKey: catalogQueryKeys.categories(limit),
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = (
        typeof limit === "number"
          ? await getAllCategoryApi(1, limit, "")
          : await getAllCategoryApi()
      ) as unknown as UnwrappedApiResponse<CategoryOption[]>;
      return res?.data || [];
    },
  });

export const useAttributesQuery = (enabled = true) =>
  useQuery({
    queryKey: catalogQueryKeys.attributes,
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = (await getAllAttributesApi()) as unknown as UnwrappedApiResponse<unknown[]>;
      return res?.errCode === 0 && Array.isArray(res.data) ? res.data : [];
    },
  });

export const useCompareProductsQuery = (ids: number[]) =>
  useQuery({
    queryKey: catalogQueryKeys.compare(ids),
    enabled: ids.length > 0,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const res = await fetchCompareProductsApi(ids);
      if (res?.errCode !== 0 || !res?.data) {
        throw new Error(res?.errMessage || "Không thể tải dữ liệu so sánh.");
      }
      return res.data;
    },
  });
