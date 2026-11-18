import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Select, Textarea, PageShell, PageTitle, SectionTitle, Text, Tabs, StatCard, FilterBar, AlertBanner } from "../components/UI";

describe("Unified UI Primitives", () => {
  it("renders Select with label, options, and error state", () => {
    render(
      <Select
        label="Chủ đề"
        required
        error="Vui lòng chọn chủ đề"
        options={[{ value: "a", label: "Tùy chọn A" }]}
      />
    );
    expect(screen.getByText("Chủ đề")).toBeInTheDocument();
    expect(screen.getByText("Tùy chọn A")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng chọn chủ đề");
  });

  it("renders Textarea with label and error state", () => {
    render(<Textarea label="Ghi chú" error="Không được để trống" />);
    expect(screen.getByText("Ghi chú")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Không được để trống");
  });

  it("renders PageShell and Typography primitives with zero-overflow classes", () => {
    render(
      <MemoryRouter>
        <PageShell title="Trang thử nghiệm" subtitle="Mô tả ngắn" backTo="/">
          <SectionTitle>Tiêu đề mục</SectionTitle>
          <Text variant="muted">Nội dung</Text>
        </PageShell>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Trang thử nghiệm" })).toBeInTheDocument();
    expect(screen.getByText("Tiêu đề mục").className).toContain("break-words");
    expect(screen.getByText("Nội dung").className).toContain("min-w-0");
  });

  it("renders Tabs, StatCard, FilterBar, and AlertBanner primitives", () => {
    render(
      <div>
        <Tabs
          items={[
            { key: "all", label: "Tất cả", count: 5 },
            { key: "active", label: "Hoạt động" },
          ]}
          activeKey="all"
          onChange={() => {}}
        />
        <StatCard label="Tổng đơn" value="120" subtext="+12% tuần này" />
        <FilterBar searchValue="" onSearchChange={() => {}} searchPlaceholder="Tìm..." />
        <AlertBanner
          variant="warning"
          title="Cảnh báo 402"
          message="Vui lòng hoàn tất thanh toán."
        />
      </div>
    );
    expect(screen.getByRole("tab", { name: /Tất cả/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Tổng đơn")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tìm...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Cảnh báo 402");
  });
});
