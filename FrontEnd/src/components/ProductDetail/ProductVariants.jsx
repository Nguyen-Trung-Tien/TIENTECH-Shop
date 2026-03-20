import React from "react";

const ProductVariants = ({ variants = [], selectedVariantId, onSelect }) => {
  if (variants.length === 0) return null;

  // Extract all possible attributes
  const variantAttributes = (() => {
    const map = {};
    variants.forEach((v) => {
      const attrs = v.attributes || {};
      Object.keys(attrs).forEach((key) => {
        if (!map[key]) map[key] = new Set();
        map[key].add(attrs[key]);
      });
    });
    const result = {};
    Object.keys(map).forEach((k) => {
      result[k] = Array.from(map[k]);
    });
    return result;
  })();

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || {};
  const selectedAttributes = selectedVariant.attributes || {};

  const handleApplyAttribute = (key, value) => {
    const next = { ...selectedAttributes, [key]: value };
    const found = variants.find((v) => {
      const attrs = v.attributes || {};
      return Object.keys(next).every((k) => attrs[k] === next[k]);
    });
    if (found) onSelect(found.id, found.imageUrl);
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-100">
      {Object.entries(variantAttributes).map(([key, values]) => (
        <div key={key}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
            {key}
          </p>
          <div className="flex flex-wrap gap-2">
            {values.map((val) => {
              const active = selectedAttributes?.[key] === val;
              return (
                <button
                  key={`${key}-${val}`}
                  onClick={() => handleApplyAttribute(key, val)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-primary text-white shadow-lg shadow-primary/20 ring-2 ring-primary ring-offset-2"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:bg-slate-50"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(ProductVariants);
