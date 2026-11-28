import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../components/ProductCard/ProductCard", () => ({
  default: ({ product }) => <div data-testid="mock-product-card">{product.name}</div>,
}));

vi.mock("recharts", () => {
  const MockBox = ({ children }) => <div data-testid="recharts-mock">{children}</div>;
  const MockSvg = ({ children }) => <svg data-testid="recharts-area-mock">{children}</svg>;
  return {
    ResponsiveContainer: MockBox,
    AreaChart: MockSvg,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
  };
});

const mockPredictPrice = vi.fn();
vi.mock("../api/chatApi", () => ({
  predictPrice: (...args) => mockPredictPrice(...args),
}));

import Carousel from "../features/shared/components/Carousel";
import { useDocumentMeta } from "../features/shared/hooks/useDocumentMeta";
import AISmartPicks from "../components/HomePageComponent/AISmartPicks";
import PricePredictionModal from "../components/PricePredictionModal/PricePredictionModal";
import { AdminPageLoader } from "../Admin/components/AdminLoading";

const MetaHarness = ({ title, description }) => {
  useDocumentMeta({ title, description, canonicalPath: "/products" });
  return <div>Meta Active</div>;
};

describe("Phase 3: UI Architecture, Carousel A11y, SEO & AI Honesty", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollTo = vi.fn();
  });

  it("Carousel renders accessible semantics, slide group labels, omits pause toggle, and shows nav controls only on overflow", () => {
    const items = [
      { id: 1, name: "ASUS" },
      { id: 2, name: "Apple" },
      { id: 3, name: "Dell" },
    ];

    render(
      <Carousel
        items={items}
        keyExtractor={(item) => item.id}
        ariaLabel="Thương hiệu nổi bật"
        autoPlayIntervalMs={3000}
        renderItem={(item) => <span>{item.name}</span>}
      />,
    );

    const root = screen.getByRole("region", { name: "Thương hiệu nổi bật" });
    expect(root).toHaveAttribute("aria-roledescription", "carousel");

    const slides = screen.getAllByRole("group");
    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveAttribute("aria-roledescription", "slide");
    expect(slides[0]).toHaveAttribute("aria-label", "1 / 3");

    expect(
      screen.queryByRole("button", { name: /tạm dừng trình chiếu/i }),
    ).not.toBeInTheDocument();

    // Without horizontal overflow (jsdom default scrollWidth === clientWidth), nav buttons stay hidden
    expect(screen.queryByRole("button", { name: "Mục trước" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mục tiếp theo" })).not.toBeInTheDocument();

    // Simulate horizontal overflow and trigger resize
    const track = screen.getByLabelText("Danh sách Thương hiệu nổi bật");
    Object.defineProperty(track, "scrollWidth", { configurable: true, value: 800 });
    Object.defineProperty(track, "clientWidth", { configurable: true, value: 320 });
    fireEvent(window, new Event("resize"));

    expect(screen.getByRole("button", { name: "Mục trước" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mục tiếp theo" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mục tiếp theo" })).toBeInTheDocument();
  });

  it("useDocumentMeta updates document title and meta description dynamically", () => {
    render(
      <MetaHarness
        title="Laptop Gaming"
        description="Bộ sưu tập laptop gaming chính hãng"
      />,
    );

    expect(document.title).toBe("Laptop Gaming | TIENTECH Shop");
    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute("content")).toBe(
      "Bộ sưu tập laptop gaming chính hãng",
    );
  });

  it("AISmartPicks renders real recommendation metadata with zero fabricated 99% claims", () => {
    const products = [
      { id: 1, name: "ROG Zephyrus", similarity: 0.88 },
      { id: 2, name: "ThinkPad X1", reason: "Phổ biến cùng phân khúc" },
      { id: 3, name: "MacBook Air" },
    ];

    render(<AISmartPicks products={products} />);

    expect(screen.getByText("Dành Riêng Cho Bạn")).toBeInTheDocument();
    expect(
      screen.queryByText("TIENTECH AI RECOMMENDATIONS"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/99% ACCURACY/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/99% Match/i)).not.toBeInTheDocument();
    expect(screen.getByText("88% Tương đồng")).toBeInTheDocument();
    expect(screen.getByText("Phổ biến cùng phân khúc")).toBeInTheDocument();
    expect(screen.getByText("Đề xuất cho bạn")).toBeInTheDocument();
  });

  it("PricePredictionModal handles fairPrice >= currentPrice safely, exposes dialog a11y, and closes on Escape", async () => {
    mockPredictPrice.mockResolvedValue({
      errCode: 0,
      data: {
        currentPrice: 10000000,
        reliability: 76,
        aiAnalysis: {
          adviceCode: "BUY_NOW",
          fairPrice: 12000000,
          reliability: 76,
          isFallback: true,
          trend: "Đang ưu đãi tốt",
          risk: "Thấp",
          chartData: [
            { name: "Hiện tại", price: 10000000 },
            { name: "30 ngày", price: 12000000 },
          ],
        },
      },
    });

    const onClose = vi.fn();
    render(<PricePredictionModal productId={12} isOpen={true} onClose={onClose} />);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");

    await waitFor(() => {
      expect(
        screen.getByText(/Giá hiện tại thấp hơn mức hợp lý 20%/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Ước tính định lượng theo chu kỳ thị trường/i),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText(/NaN%/i)).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("AdminPageLoader delegates cleanly to BrandLoader (2-loader consolidation)", () => {
    render(<AdminPageLoader />);
    expect(screen.getByText("TIEN")).toBeInTheDocument();
    expect(screen.getByText("TECH")).toBeInTheDocument();
    expect(screen.getByText(/Đang tải phân hệ quản trị/i)).toBeInTheDocument();
    expect(screen.getByText("TIENTECH Admin Console")).toBeInTheDocument();
  });
});
