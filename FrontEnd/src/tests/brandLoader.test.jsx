import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import BrandLoader from "../components/Loading/BrandLoader";
import Loading from "../components/Loading/Loading";

describe("BrandLoader & Loading Component", () => {
  it("renders BrandLoader with default message and brand logo text", () => {
    render(<BrandLoader />);

    expect(screen.getByText("TIEN")).toBeInTheDocument();
    expect(screen.getByText("TECH")).toBeInTheDocument();
    expect(screen.getByText(/Đang tải hệ sinh thái.../i)).toBeInTheDocument();
    expect(screen.getByText(/TIENTECH Smart Ecosystem/i)).toBeInTheDocument();
  });

  it("renders custom message and subMessage", () => {
    render(
      <BrandLoader
        message="Đang kiểm tra bảo mật..."
        subMessage="Vui lòng chờ trong giây lát"
      />
    );

    expect(screen.getByText("Đang kiểm tra bảo mật...")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng chờ trong giây lát")).toBeInTheDocument();
  });

  it("renders Loading wrapper in fullscreen mode with brand identity", () => {
    const { container } = render(
      <Loading message="Đang đăng nhập thành công..." />
    );

    expect(screen.getByText("Đang đăng nhập thành công...")).toBeInTheDocument();
    expect(screen.getByText("TIEN")).toBeInTheDocument();
    expect(screen.getByText("TECH")).toBeInTheDocument();

    const backdrop = container.querySelector(".fixed.inset-0");
    expect(backdrop).toBeInTheDocument();
  });
});
