import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("recharts", () => {
  const MockBox = ({ children }) => <div data-testid="recharts-mock">{children}</div>;
  return {
    ResponsiveContainer: MockBox,
    RadarChart: MockBox,
    PolarGrid: () => null,
    PolarAngleAxis: () => null,
    PolarRadiusAxis: () => null,
    Radar: () => null,
    BarChart: MockBox,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
  };
});

vi.mock("../features/compare/compareApi", () => ({
  fetchCompareProductsApi: vi.fn().mockResolvedValue({
    errCode: 0,
    data: {
      products: [
        {
          id: 1,
          name: "ASUS ROG Zephyrus G14",
          slug: "asus-rog-g14",
          sku: "ROG-1",
          image: "/g14.png",
          brand: { id: 1, name: "ASUS" },
          category: { id: 2, name: "Laptop Gaming" },
          basePrice: 45000000,
          displayPrice: 40500000,
          discountPercent: 10,
          flashSaleActive: false,
          totalStock: 10,
          sold: 25,
          avgRating: 4.9,
          reviewCount: 12,
          archetype: "laptop",
          specCoveragePct: 88,
          normalizedSpecs: {
            cpu: { raw: "Ryzen 9", display: "Ryzen 9", numericValue: null },
            ram: { raw: "32GB", display: "32GB", numericValue: 32 },
          },
          benchmark: {
            performance: 92,
            display: 90,
            battery: 85,
            cameraBuild: 84,
            value: 80,
            overallScore: 87,
          },
        },
        {
          id: 2,
          name: "Acer Aspire Lite 15",
          slug: "acer-aspire-15",
          sku: "ACER-2",
          image: "/acer.png",
          brand: { id: 2, name: "Acer" },
          category: { id: 2, name: "Laptop Gaming" },
          basePrice: 14000000,
          displayPrice: 14000000,
          discountPercent: 0,
          flashSaleActive: false,
          totalStock: 15,
          sold: 40,
          avgRating: 4.2,
          reviewCount: 5,
          archetype: "laptop",
          specCoveragePct: 63,
          normalizedSpecs: {
            cpu: { raw: "Core i5", display: "Core i5", numericValue: null },
            ram: { raw: "8GB", display: "8GB", numericValue: 8 },
          },
          benchmark: {
            performance: 62,
            display: 64,
            battery: 60,
            cameraBuild: 65,
            value: 88,
            overallScore: 67,
          },
        },
      ],
      matrix: [
        {
          id: "performance",
          title: "Hiệu năng & Bộ nhớ",
          rows: [
            {
              key: "cpu",
              label: "Vi xử lý (CPU / SoC)",
              keySpec: true,
              quantifiable: false,
              isDifferent: true,
              bestProductId: null,
              valuesByProductId: {
                1: { display: "Ryzen 9", raw: "Ryzen 9", numericValue: null },
                2: { display: "Core i5", raw: "Core i5", numericValue: null },
              },
            },
            {
              key: "ram",
              label: "RAM",
              keySpec: true,
              quantifiable: true,
              higherIsBetter: true,
              isDifferent: true,
              bestProductId: 1,
              valuesByProductId: {
                1: { display: "32GB", raw: "32GB", numericValue: 32 },
                2: { display: "8GB", raw: "8GB", numericValue: 8 },
              },
            },
          ],
        },
      ],
      benchmarks: {
        1: { performance: 92, display: 90, battery: 85, cameraBuild: 84, value: 80, overallScore: 87 },
        2: { performance: 62, display: 64, battery: 60, cameraBuild: 65, value: 88, overallScore: 67 },
      },
      winners: {
        performance: 1,
        display: 1,
        battery: 1,
        cameraBuild: 1,
        value: 2,
        overall: 1,
        bestValue: 2,
      },
      categoryMismatchWarning: null,
    },
  }),
  fetchCompareAiVerdictApi: vi.fn().mockResolvedValue({
    errCode: 0,
    data: {
      winnerId: 1,
      headline: "ASUS ROG Zephyrus G14 vượt trội cho hiệu năng cao",
      summary: "Điểm tổng hợp 87/100 và RAM 32GB dẫn đầu.",
      useCaseRecommendations: [
        { useCase: "Gaming & Đồ họa", recommendedProductId: 1, reason: "GPU mạnh hơn rõ rệt" },
      ],
      prosConsByProduct: {
        1: { pros: ["Hiệu năng mạnh 92/100"], cons: ["Giá cao"] },
        2: { pros: ["Giá hợp lý"], cons: ["RAM 8GB"] },
      },
      note: null,
      source: "gemini_ai",
    },
  }),
  searchCompareProductsApi: vi.fn().mockResolvedValue([]),
}));

import compareReducer, {
  addToCompare,
  removeFromCompare,
  toggleCompareItem,
  clearCompare,
  selectCompareItems,
  selectIsInCompare,
} from "../features/compare/compareSlice";
import FloatingCompareBar from "../features/compare/components/FloatingCompareBar";
import ComparePage from "../features/compare/ComparePage";
import {
  fetchCompareProductsApi,
  fetchCompareAiVerdictApi,
} from "../features/compare/compareApi";

describe("Phase 2: Compare & Benchmark FrontEnd Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("compareSlice caps tray at 4 items, toggles/removes cleanly, and selectors guard missing slice", () => {
    expect(selectCompareItems({})).toEqual([]);
    expect(selectIsInCompare(1)({})).toBe(false);

    let state = compareReducer(undefined, { type: "init" });
    for (let i = 1; i <= 5; i++) {
      state = compareReducer(
        state,
        addToCompare({ id: i, name: `SP ${i}`, price: i * 1000000 }),
      );
    }
    expect(state.items).toHaveLength(4);
    expect(selectIsInCompare(5)({ compare: state })).toBe(false);

    state = compareReducer(
      state,
      toggleCompareItem({ id: 2, name: "SP 2", price: 2000000 }),
    );
    expect(state.items.map((x) => x.id)).toEqual([1, 3, 4]);

    state = compareReducer(state, removeFromCompare(3));
    expect(state.items.map((x) => x.id)).toEqual([1, 4]);

    state = compareReducer(state, clearCompare());
    expect(state.items).toEqual([]);
  });

  it("FloatingCompareBar shows items on storefront routes and hides when empty or on /compare", () => {
    const store = configureStore({
      reducer: { compare: compareReducer },
      preloadedState: {
        compare: {
          items: [
            { id: 1, name: "ASUS ROG G14", price: 40500000 },
            { id: 2, name: "Acer Aspire 15", price: 14000000 },
          ],
        },
      },
    });

    const { unmount } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/products"]}>
          <FloatingCompareBar />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/So sánh ngay \(2\)/i)).toBeInTheDocument();
    unmount();

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/compare?ids=1,2"]}>
          <FloatingCompareBar />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByText(/So sánh ngay/i)).not.toBeInTheDocument();
  });

  it("ComparePage parses ?ids=1,2, fetches benchmark/matrix & AI verdict, and renders scores", async () => {
    const store = configureStore({
      reducer: { compare: compareReducer },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <MemoryRouter initialEntries={["/compare?ids=1,2"]}>
            <ComparePage />
          </MemoryRouter>
        </Provider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(fetchCompareProductsApi).toHaveBeenCalledWith([1, 2]);
      expect(fetchCompareAiVerdictApi).toHaveBeenCalledWith([1, 2], "general");
      expect(screen.getByText(/87\/100 điểm/i)).toBeInTheDocument();
      expect(
        screen.getByText(/ASUS ROG Zephyrus G14 vượt trội cho hiệu năng cao/i),
      ).toBeInTheDocument();
      expect(screen.getByText("Ryzen 9")).toBeInTheDocument();
    });
  });
});
