import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../context/ThemeContext";
import { useTheme } from "../context/useTheme";
import { DialogProvider } from "../context/DialogContext";
import { useDialog } from "../context/useDialog";

const ThemeHarness = () => {
  const { theme, themeMode, isDark, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-resolved">{theme}</span>
      <span data-testid="theme-mode">{themeMode}</span>
      <span data-testid="theme-isdark">{String(isDark)}</span>
      <button type="button" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button type="button" onClick={() => setTheme("system")}>
        Set System
      </button>
      <button type="button" onClick={() => setTheme("dark")}>
        Set Dark
      </button>
    </div>
  );
};

const DialogHarness = () => {
  const { alert, confirm } = useDialog();
  const [result, setResult] = React.useState("idle");

  return (
    <div>
      <span data-testid="dialog-result">{result}</span>
      <button
        type="button"
        onClick={async () => {
          await alert({ title: "Thông báo test", message: "Nội dung alert" });
          setResult("alert-closed");
        }}
      >
        Open Alert
      </button>
      <button
        type="button"
        onClick={async () => {
          const ok = await confirm({
            title: "Xác nhận xóa",
            message: "Bạn có chắc chắn?",
            confirmText: "Đồng ý",
            cancelText: "Hủy",
          });
          setResult(ok ? "confirmed" : "cancelled");
        }}
      >
        Open Confirm
      </button>
      <button
        type="button"
        onClick={async () => {
          const reason = await confirm({
            title: "Nhập lý do",
            requireInput: true,
            inputLabel: "Lý do",
            inputPlaceholder: "Nhập lý do...",
            inputRequiredMessage: "Cần nhập lý do",
          });
          setResult(reason ? `input:${reason}` : "cancelled");
        }}
      >
        Open Prompt
      </button>
    </div>
  );
};

describe("ThemeProvider & DialogProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("validates corrupted localStorage theme and toggles light/dark cleanly", () => {
    localStorage.setItem("theme", "invalid_value");

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-mode")).toHaveTextContent("system");

    fireEvent.click(screen.getByText("Set Dark"));
    expect(screen.getByTestId("theme-resolved")).toHaveTextContent("dark");
    expect(screen.getByTestId("theme-isdark")).toHaveTextContent("true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent.click(screen.getByText("Toggle Theme"));
    expect(screen.getByTestId("theme-resolved")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("supports imperative alert(), confirm(), and requireInput prompt via useDialog()", async () => {
    render(
      <DialogProvider>
        <DialogHarness />
      </DialogProvider>
    );

    // 1. Imperative alert()
    fireEvent.click(screen.getByText("Open Alert"));
    expect(screen.getByText("Thông báo test")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Đã hiểu"));
    await waitFor(() => {
      expect(screen.getByTestId("dialog-result")).toHaveTextContent("alert-closed");
    });

    // 2. Imperative confirm()
    fireEvent.click(screen.getByText("Open Confirm"));
    expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Đồng ý"));
    await waitFor(() => {
      expect(screen.getByTestId("dialog-result")).toHaveTextContent("confirmed");
    });

    // 3. Imperative confirm() with requireInput
    fireEvent.click(screen.getByText("Open Prompt"));
    expect(screen.getByText("Nhập lý do")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Xác nhận"));
    expect(screen.getByText("Cần nhập lý do")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Nhập lý do..."), {
      target: { value: "  Đổi sản phẩm khác  " },
    });
    fireEvent.click(screen.getByText("Xác nhận"));
    await waitFor(() => {
      expect(screen.getByTestId("dialog-result")).toHaveTextContent(
        "input:Đổi sản phẩm khác"
      );
    });
  });
});
