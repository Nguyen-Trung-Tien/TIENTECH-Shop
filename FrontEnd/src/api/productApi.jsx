import axiosClient from "../utils/axiosClient";

const SUGGEST_TTL_MS = 10000;
const suggestCache = new Map();
const suggestInflight = new Map();

export const getHomePageDataApi = async () => {
  try {
    const res = await axiosClient.get("/product/home-data");
    return res;
  } catch (err) {
    console.error("Get Home Page Data API error:", err);
    throw err;
  }
};

export const getAllProductApi = async (
  page = 1,
  limit = 10,
  search = "",
  isFlashSale = false,
  isAdmin = false,
) => {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    if (isFlashSale) params.isFlashSale = true;
    if (isAdmin) params.isAdmin = true;

    const res = await axiosClient.get(`/product/get-all-product`, {
      params,
    });
    return res;
  } catch (err) {
    console.error("Get All Product API error:", err);
    throw err;
  }
};

export const getProductByIdApi = async (id) => {
  try {
    const res = await axiosClient.get(`/product/get-product/${id}`);
    return res;
  } catch (err) {
    console.error("Get product by ID API error:", err);
    throw err;
  }
};

export const getProductBySlugApi = async (slug) => {
  try {
    const res = await axiosClient.get(`/product/get-product-by-slug/${slug}`);
    return res;
  } catch (err) {
    console.error("Get product by slug API error:", err);
    throw err;
  }
};

export const createProductApi = async (data) => {
  try {
    const res = await axiosClient.post(`/product/create-new-product`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  } catch (err) {
    console.error("Create product API error:", err);
    throw err;
  }
};

export const updateProductApi = async (id, data) => {
  try {
    const res = await axiosClient.put(`/product/update-product/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  } catch (err) {
    console.error("Update product API error:", err);
    throw err;
  }
};

export const deleteProductApi = async (id) => {
  try {
    const res = await axiosClient.delete(`/product/delete-product/${id}`);
    return res;
  } catch (err) {
    console.error("Delete product API error:", err);
    throw err;
  }
};

export const searchSuggestionsApi = async (query) => {
  const q = (query || "").trim();
  if (!q) {
    return {
      suggestions: { products: [], keywords: [], brands: [], categories: [] },
    };
  }

  const cached = suggestCache.get(q.toLowerCase());
  if (cached && Date.now() - cached.ts < SUGGEST_TTL_MS) {
    return cached.data;
  }

  const inflight = suggestInflight.get(q.toLowerCase());
  if (inflight) return inflight;

  const req = axiosClient
    .get(`/product/search-suggest`, { params: { q, limit: 8 } })
    .then((res) => {
      // Đảm bảo res chứa key suggestions
      const data = res.suggestions ? res : { suggestions: res };
      suggestCache.set(q.toLowerCase(), { ts: Date.now(), data });
      suggestInflight.delete(q.toLowerCase());
      return data;
    })
    .catch((err) => {
      suggestInflight.delete(q.toLowerCase());
      throw err;
    });

  suggestInflight.set(q.toLowerCase(), req);
  return req;
};

export const getFlashSaleProductsApi = async (page = 1, limit = 6) => {
  try {
    const res = await axiosClient.get(`/product/flash-sale`, {
      params: { page, limit },
    });
    return res;
  } catch (err) {
    console.error("Get flash sale products API error:", err);
    throw err;
  }
};

export const filterProductsApi = async ({
  brandId = "",
  categoryId = "",
  brand = "",
  category = "",
  minPrice = "",
  maxPrice = "",
  search = "",
  ram = "",
  rom = "",
  screen = "",
  battery = "",
  os = "",
  refresh_rate = "",
  sort = "newest",
  page = 1,
  limit = 10,
  isAdmin = false,
  isFlashSale = false,
  flashSale = false,
} = {}) => {
  try {
    const params = {
      brandId,
      categoryId,
      brand,
      category,
      search,
      ram,
      rom,
      screen,
      battery,
      os,
      refresh_rate,
      sort,
      page,
      limit,
      isAdmin,
    };

    if (
      isFlashSale === true ||
      isFlashSale === "true" ||
      flashSale === true ||
      flashSale === "true"
    ) {
      params.isFlashSale = true;
    }

    if (minPrice !== "" && minPrice !== undefined && minPrice !== null) {
      params.minPrice = minPrice;
    }
    if (maxPrice !== "" && maxPrice !== undefined && maxPrice !== null) {
      params.maxPrice = maxPrice;
    }

    const res = await axiosClient.get("/product/filter", { params });

    return res;
  } catch (err) {
    console.error("Filter products API error:", err);
    throw err;
  }
};

export const getSmartRecommendationsApi = async (id, limit = 6) => {
  try {
    const res = await axiosClient.get(`/product/smart-recommendations/${id}?limit=${limit}`);
    return res;
  } catch (error) {
    console.error("Error fetching smart recommendations:", error);
    throw error;
  }
};

export const getPersonalizedRecommendationsApi = async (limit = 6) => {
  try {
    const res = await axiosClient.get(`/product/personalized`, { params: { limit } });
    return res;
  } catch (error) {
    console.error("Error fetching personalized recommendations:", error);
    throw error;
  }
};

export const fetchFortuneProducts = async ({
  birthYear,
  gender,
  brandId,
  minPrice,
  maxPrice,
  categoryId,
  sortBy,
  page,
  limit,
}) => {
  const res = await axiosClient.get("/product/recommend-fortune", {
    params: {
      birthYear,
      gender,
      brandId,
      minPrice,
      maxPrice,
      categoryId,
      sortBy,
      page,
      limit,
    },
  });
  return res;
};

export const getOneProductApi = async (id) => {
  return getProductByIdApi(id);
};
