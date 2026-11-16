import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../utils/sanitizeHtml";

describe("sanitizeHtml", () => {
  it("removes script tags and inline event handlers", () => {
    const dirty =
      '<p>Hello <strong>World</strong></p><script>alert(1)</script><img src="x" onerror="alert(2)" />';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain("<p>Hello <strong>World</strong></p>");
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("onerror");
  });

  it("removes dangerous tags like iframe and svg", () => {
    const dirty = '<iframe src="https://evil.com"></iframe><svg onload="alert(1)"></svg><div>Safe</div>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<iframe");
    expect(clean).not.toContain("<svg");
    expect(clean).toContain("<div>Safe</div>");
  });

  it("strips javascript: URLs and preserves safe https links with rel", () => {
    const dirty =
      '<a href="javascript:alert(1)">Bad</a><a href="https://tientech.com" target="_blank">Good</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("javascript:");
    expect(clean).toContain('href="https://tientech.com"');
    expect(clean).toContain('rel="noopener noreferrer"');
  });

  it("removes template tags and dangerous data:image/svg+xml URLs", () => {
    const dirty =
      '<template><script>alert(1)</script></template><img src="data:image/svg+xml;base64,PHN2Zy8+" alt="bad" /><p>Safe</p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<template");
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("data:image/svg+xml");
    expect(clean).toContain("<p>Safe</p>");
  });
});
