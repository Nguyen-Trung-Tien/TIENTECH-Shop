const DANGEROUS_TAGS = new Set([
  "SCRIPT",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "STYLE",
  "LINK",
  "META",
  "BASE",
  "FORM",
  "SVG",
  "MATH",
  "TEMPLATE",
  "APPLET",
  "FRAME",
  "FRAMESET",
]);

const URL_ATTRIBUTES = new Set(["href", "src", "xlink:href", "action", "formaction", "poster"]);
const SAFE_DATA_IMAGE_REGEX = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i;

const isUnsafeUrl = (value, attrName = "") => {
  const normalized = Array.from(String(value || ""))
    .filter((ch) => ch.charCodeAt(0) > 32)
    .join("")
    .toLowerCase();
  if (normalized.startsWith("javascript:") || normalized.startsWith("vbscript:")) {
    return true;
  }
  if (normalized.startsWith("data:")) {
    return !(attrName === "src" && SAFE_DATA_IMAGE_REGEX.test(normalized));
  }
  return false;
};

/**
 * Sanitize untrusted HTML strings before rendering via dangerouslySetInnerHTML.
 * Removes executable tags, inline event handlers, and dangerous URI schemes.
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== "string") return "";

  if (typeof DOMParser === "undefined") {
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const walk = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === 1) {
        if (DANGEROUS_TAGS.has(child.tagName.toUpperCase())) {
          child.remove();
          continue;
        }

        const attrs = Array.from(child.attributes);
        for (const attr of attrs) {
          const name = attr.name.toLowerCase();
          if (name.startsWith("on") || name === "srcdoc") {
            child.removeAttribute(attr.name);
            continue;
          }
          if (URL_ATTRIBUTES.has(name) && isUnsafeUrl(attr.value, name)) {
            child.removeAttribute(attr.name);
          }
        }

        if (child.tagName.toUpperCase() === "A" && child.getAttribute("target") === "_blank") {
          child.setAttribute("rel", "noopener noreferrer");
        }

        walk(child);
      }
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
};
