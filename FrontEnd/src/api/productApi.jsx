import axiosClient from "../utils/axiosClient";

const SUGGEST_TTL_MS = 10000;
const suggestCache = new Map();
const suggestInflight = new Map();

export const getAllProductApi = async (page = 1, limit = 10, search = "") => {
  try {
    const res = await axiosClient.get(`/product/get-all-product`, {
      params: { page, limit, search },
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

export const searchProductsApi = async (query, page = 1, limit = 10) => {
  try {
    const res = await axiosClient.get(
      `/product/search?q=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );

    return {
      products: res.products || [],
      suggestions: res.suggestions || {},
      totalItems: res.totalItems || 0,
      currentPage: res.currentPage || 1,
      totalPages: res.totalPages || 1,
      errCode: res.errCode,
    };
  } catch (err) {
    console.error("Search products API error:", err);
    throw err;
  }
};

export const searchSuggestionsApi = async (query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    return {
      suggestions: { products: [], keywords: [], brands: [], categories: [] },
    };
  }

  const cached = suggestCache.get(q);
  if (cached && Date.now() - cached.ts < SUGGEST_TTL_MS) {
    return cached.data;
  }

  const inflight = suggestInflight.get(q);
  if (inflight) return inflight;

  const req = axiosClient
    .get(`/product/search-suggest`, { params: { q, limit: 5 } })
    .then((res) => {
      const data = res;
      suggestCache.set(q, { ts: Date.now(), data });
      suggestInflight.delete(q);
      return data;
    })
    .catch((err) => {
      suggestInflight.delete(q);
      throw err;
    });

  suggestInflight.set(q, req);
  return req;
};

export const getDiscountedProductsApi = async (page = 1, limit = 6) => {
  try {
    const res = await axiosClient.get(`/product/discounted`, {
      params: { page, limit },
    });
    return res;
  } catch (err) {
    console.error("Get discounted products API error:", err);
    throw err;
  }
};

export const filterProductsApi = async ({
  brandId = "",
  categoryId = "",
  minPrice = 0,
  maxPrice = 999999999,
  search = "",
  page = 1,
  limit = 10,
}) => {
  try {
    const res = await axiosClient.get("/product/filter", {
      params: {
        brandId,
        categoryId,
        minPrice,
        maxPrice,
        search,
        page,
        limit,
      },
    });

    return res;
  } catch (err) {
    console.error("Filter products API error:", err);
    throw err;
  }
};

export const getRecommendedProductsApi = async (
  productId,
  page = 1,
  limit = 6
) => {
  try {
    const res = await axiosClient.get(`/product/recommend/${productId}`, {
      params: { page, limit },
    });
    return res;
  } catch (err) {
    console.error("Get recommended products API error:", err);
    throw err;
  }
};

export const fetchFortuneProducts = async ({
  birthYear,
  brandId,
  minPrice,
  maxPrice,
  categoryId,
  page,
  limit,
}) => {
  const res = await axiosClient.get("/product/recommend-fortune", {
    params: { birthYear, brandId, minPrice, maxPrice, categoryId, page, limit },
  });
  return res;
};
