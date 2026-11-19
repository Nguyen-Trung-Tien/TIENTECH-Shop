import { useEffect } from "react";

const DEFAULT_TITLE = "TIENTECH Shop – Cửa Hàng Công Nghệ Thông Minh Cao Cấp";
const DEFAULT_DESCRIPTION =
  "TIENTECH Shop – Hệ sinh thái thương mại điện tử cao cấp tích hợp AI: Chatbot thông minh, Visual Search, tư vấn Phong Thủy, thanh toán VNPay & PayPal.";

export interface DocumentMetaOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalPath?: string;
}

const upsertMetaTag = (
  attribute: "name" | "property",
  key: string,
  content: string,
) => {
  if (typeof document === "undefined") return;
  let element = document.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const upsertCanonicalLink = (href: string) => {
  if (typeof document === "undefined") return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

export const useDocumentMeta = ({
  title,
  description,
  ogTitle,
  ogDescription,
  canonicalPath,
}: DocumentMetaOptions): void => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const fullTitle = title ? `${title} | TIENTECH Shop` : DEFAULT_TITLE;
    const resolvedDescription = description || DEFAULT_DESCRIPTION;

    document.title = fullTitle;
    upsertMetaTag("name", "description", resolvedDescription);
    upsertMetaTag("property", "og:title", ogTitle || fullTitle);
    upsertMetaTag(
      "property",
      "og:description",
      ogDescription || resolvedDescription,
    );

    if (canonicalPath && typeof window !== "undefined") {
      const normalizedPath = canonicalPath.startsWith("/")
        ? canonicalPath
        : `/${canonicalPath}`;
      upsertCanonicalLink(`${window.location.origin}${normalizedPath}`);
    }
  }, [title, description, ogTitle, ogDescription, canonicalPath]);
};

export default useDocumentMeta;
