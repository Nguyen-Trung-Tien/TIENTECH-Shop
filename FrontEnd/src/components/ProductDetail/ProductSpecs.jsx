import React from "react";

const labelMap = {
  cpu: "Vi xử lý (CPU)",
  ram: "Bộ nhớ RAM",
  rom: "Bộ nhớ trong (ROM)",
  screen: "Màn hình",
  battery: "Pin & Sạc",
  os: "Hệ điều hành",
  refresh_rate: "Tần số quét",
};

const SpecItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mb-2 ml-1">
        {label}
      </p>
      <div className="text-sm font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-dark-bg/50 px-4 py-3 rounded-2xl border border-slate-100 dark:border-dark-border shadow-inner transition-colors">
        {value}
      </div>
    </div>
  );
};

const ProductSpecs = ({ product }) => {
  if (!product) return null;

  let rawSpecs = product.specifications || {};
  if (typeof rawSpecs === "string") {
    try {
      rawSpecs = JSON.parse(rawSpecs);
    } catch {
      rawSpecs = {};
    }
  }

  const specsMap = new Map();

  // 1. From Relational product.attributes
  if (Array.isArray(product.attributes)) {
    product.attributes.forEach((a) => {
      if (a.attribute && a.value) {
        const code = (a.attribute.code || "").toLowerCase();
        specsMap.set(code, {
          label: a.attribute.name || labelMap[code] || code.toUpperCase(),
          value: String(a.value).trim(),
        });
      }
    });
  }

  // 2. From product.specifications JSON field
  if (typeof rawSpecs === "object" && rawSpecs !== null) {
    Object.entries(rawSpecs).forEach(([key, val]) => {
      if (!val || String(val).trim() === "") return;
      const normalizedKey = key.toLowerCase();
      if (!specsMap.has(normalizedKey)) {
        specsMap.set(normalizedKey, {
          label: labelMap[normalizedKey] || key,
          value: String(val).trim(),
        });
      }
    });
  }

  const list = Array.from(specsMap.values());
  if (list.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100 dark:border-dark-border transition-colors">
      {list.map((spec, idx) => (
        <SpecItem key={idx} label={spec.label} value={spec.value} />
      ))}
    </div>
  );
};

export default React.memo(ProductSpecs);
