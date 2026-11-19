import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CompareTrayItem } from "./types";

export const MAX_COMPARE_ITEMS = 4;
const EMPTY_COMPARE_ITEMS: CompareTrayItem[] = [];

export interface CompareState {
  items: CompareTrayItem[];
}

const initialState: CompareState = {
  items: [],
};

const normalizeTrayItem = (item: CompareTrayItem): CompareTrayItem => ({
  id: Number(item.id),
  slug: item.slug ?? null,
  name: String(item.name || `Sản phẩm #${item.id}`),
  image: item.image ?? null,
  price: Number(item.price || 0),
  categoryName: item.categoryName ?? null,
  brandName: item.brandName ?? null,
});

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<CompareTrayItem>) => {
      const normalized = normalizeTrayItem(action.payload);
      if (!Number.isInteger(normalized.id) || normalized.id <= 0) return;
      const exists = state.items.some((item) => Number(item.id) === normalized.id);
      if (exists || state.items.length >= MAX_COMPARE_ITEMS) return;
      state.items.push(normalized);
    },
    removeFromCompare: (state, action: PayloadAction<number>) => {
      const targetId = Number(action.payload);
      state.items = state.items.filter((item) => Number(item.id) !== targetId);
    },
    toggleCompareItem: (state, action: PayloadAction<CompareTrayItem>) => {
      const normalized = normalizeTrayItem(action.payload);
      if (!Number.isInteger(normalized.id) || normalized.id <= 0) return;
      const idx = state.items.findIndex((item) => Number(item.id) === normalized.id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else if (state.items.length < MAX_COMPARE_ITEMS) {
        state.items.push(normalized);
      }
    },
    clearCompare: (state) => {
      state.items = [];
    },
    hydrateCompareItems: (state, action: PayloadAction<CompareTrayItem[]>) => {
      const seen = new Set<number>();
      const next: CompareTrayItem[] = [];
      for (const raw of action.payload || []) {
        const normalized = normalizeTrayItem(raw);
        if (
          Number.isInteger(normalized.id) &&
          normalized.id > 0 &&
          !seen.has(normalized.id) &&
          next.length < MAX_COMPARE_ITEMS
        ) {
          seen.add(normalized.id);
          next.push(normalized);
        }
      }
      state.items = next;
    },
  },
});

export const {
  addToCompare,
  removeFromCompare,
  toggleCompareItem,
  clearCompare,
  hydrateCompareItems,
} = compareSlice.actions;

export const selectCompareItems = (state: unknown): CompareTrayItem[] => {
  const maybeStore = state as { compare?: CompareState } | null | undefined;
  return maybeStore?.compare?.items ?? EMPTY_COMPARE_ITEMS;
};

export const selectIsInCompare =
  (productId: number | string | undefined) =>
  (state: unknown): boolean => {
    const pid = Number(productId);
    if (!Number.isInteger(pid) || pid <= 0) return false;
    return selectCompareItems(state).some((item) => Number(item.id) === pid);
  };

export default compareSlice.reducer;
