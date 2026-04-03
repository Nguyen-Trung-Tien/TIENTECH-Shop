import React, { useMemo } from "react";
import { motion as Motion } from "framer-motion";
import {
  FiCpu,
  FiMonitor,
  FiBattery,
  FiSmartphone,
  FiCheckCircle,
} from "react-icons/fi";

/**
 * ProductVariants Component - Bản nâng cấp (Full Config View)
 * Hiển thị cả thông số cố định (Default/Fixed) và thông số thay đổi (Variants).
 */
const ProductVariants = ({ product = {}, selectedVariantId, onSelect }) => {
  const { variants = [] } = product;

  const normalize = (val) => {
    if (val === null || val === undefined) return "";
    return String(val).normalize("NFC").trim().toLowerCase();
  };

  const getAttrs = (v) => {
    if (!v) return {};
    let attrs = v.attributeValues || v.attributes || {};
    if (typeof attrs === "string") {
      try {
        attrs = JSON.parse(attrs);
      } catch (e) {
        return {};
      }
    }
    return attrs;
  };

  // 1. Lấy thông số cố định từ Product Model (Option mặc định không đổi)
  const fixedSpecs = useMemo(() => {
    const specs = [];
    const specMap = product?.specifications || {};
    if (specMap.CPU || specMap.cpu || product.cpu)
      specs.push({
        key: "Vi xử lý",
        value: specMap.CPU || specMap.cpu || product.cpu,
        icon: FiCpu,
      });
    if (specMap.Screen || specMap.screen || product.screen)
      specs.push({
        key: "Màn hình",
        value: specMap.Screen || specMap.screen || product.screen,
        icon: FiMonitor,
      });
    if (specMap.Battery || specMap.battery || product.battery)
      specs.push({
        key: "Dung lượng Pin",
        value: specMap.Battery || specMap.battery || product.battery,
        icon: FiBattery,
      });
    if (specMap.OS || specMap.os || product.os)
      specs.push({
        key: "Hệ điều hành",
        value: specMap.OS || specMap.os || product.os,
        icon: FiSmartphone,
      });
    return specs;
  }, [product]);

  // 2. Xử lý các Key của Biến thể (RAM, ROM, Màu...)
  const attributeKeys = useMemo(() => {
    const keys = new Set();
    variants.forEach((v) => {
      Object.keys(getAttrs(v)).forEach((k) => keys.add(k));
    });
    const sortedKeys = Array.from(keys);
    const priorityKeywords = [
      "ram",
      "rom",
      "storage",
      "capacity",
      "bộ nhớ",
      "ổ cứng",
      "dung lượng",
    ];
    return sortedKeys.sort((a, b) => {
      const aL = a.toLowerCase();
      const bL = b.toLowerCase();
      const aP = priorityKeywords.some((kw) => aL.includes(kw)) ? 0 : 1;
      const bP = priorityKeywords.some((kw) => bL.includes(kw)) ? 0 : 1;
      return aP !== bP ? aP - bP : a.localeCompare(b);
    });
  }, [variants]);

  const attributeValues = useMemo(() => {
    const map = {};
    attributeKeys.forEach((k) => (map[k] = new Set()));
    variants.forEach((v) => {
      const vAttrs = getAttrs(v);
      Object.entries(vAttrs).forEach(([k, val]) => {
        if (map[k]) map[k].add(val);
      });
    });
    const result = {};
    attributeKeys.forEach((k) => (result[k] = Array.from(map[k])));
    return result;
  }, [variants, attributeKeys]);

  const selectedVariant =
    variants.find((v) => String(v.id) === String(selectedVariantId)) ||
    variants[0] ||
    {};
  const selectedAttributes = getAttrs(selectedVariant);

  const handleApplyAttribute = (key, value) => {
    const keyIndex = attributeKeys.indexOf(key);
    let baseSelection = {};
    for (let i = 0; i <= keyIndex; i++) {
      const k = attributeKeys[i];
      baseSelection[k] = k === key ? value : selectedAttributes[k];
    }
    const findVariant = (targetAttrs) => {
      return variants.find((v) => {
        if (!v.isActive) return false;
        const vAttrs = getAttrs(v);
        return Object.entries(targetAttrs).every(
          ([k, vVal]) => normalize(vAttrs[k]) === normalize(vVal),
        );
      });
    };
    let found = findVariant({ ...selectedAttributes, [key]: value });
    if (!found) found = findVariant(baseSelection);
    if (!found)
      found = variants.find(
        (v) => v.isActive && normalize(getAttrs(v)[key]) === normalize(value),
      );
    if (found) onSelect(found.id);
  };

  const getStatus = (key, val) => {
    const keyIndex = attributeKeys.indexOf(key);
    let baseSelection = {};
    for (let i = 0; i < keyIndex; i++) {
      const k = attributeKeys[i];
      baseSelection[k] = selectedAttributes[k];
    }
    const matching = variants.filter((v) => {
      if (!v.isActive) return false;
      const vAttrs = getAttrs(v);
      return (
        normalize(vAttrs[key]) === normalize(val) &&
        Object.entries(baseSelection).every(
          ([k, vV]) => normalize(vAttrs[k]) === normalize(vV),
        )
      );
    });
    if (matching.length === 0) return "disabled";
    return matching.some((v) => Number(v.stock) > 0)
      ? "available"
      : "out-of-stock";
  };

  return (
    <div className="space-y-8 pt-6 border-t border-slate-100">
      {/* 1. FIXED OPTIONS (Thông số mặc định) */}
      {fixedSpecs.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Cấu hình mặc định
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fixedSpecs.map((spec, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl"
              >
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                  <spec.icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">
                    {spec.key}
                  </p>
                  <p className="text-xs font-black text-slate-800 truncate">
                    {spec.value}
                  </p>
                </div>
                <FiCheckCircle className="ml-auto text-emerald-500" size={14} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. VARIANT OPTIONS (Thông số có thể chọn) */}
      {attributeKeys.map((key) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-4 ml-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {key}
            </p>
            {selectedAttributes[key] && (
              <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                Đã chọn: {selectedAttributes[key]}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {attributeValues[key].map((val) => {
              const active =
                normalize(selectedAttributes[key]) === normalize(val);
              const status = getStatus(key, val);
              const isDisabled =
                status === "disabled" || status === "out-of-stock";

              return (
                <button
                  key={`${key}-${val}`}
                  onClick={() => !isDisabled && handleApplyAttribute(key, val)}
                  disabled={isDisabled && !active}
                  className={`relative px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 flex items-center gap-2 ${
                    active
                      ? "border-primary text-white z-10 shadow-lg shadow-primary/20"
                      : isDisabled
                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60"
                        : "bg-white border-slate-200 text-slate-600 hover:border-primary/40 hover:bg-slate-50"
                  }`}
                >
                  <span className="relative z-10">{val}</span>
                  {status === "out-of-stock" && !active && (
                    <span className="absolute -top-2 -right-2 bg-danger text-[8px] text-white px-1.5 py-0.5 rounded-lg shadow-sm z-20 font-black">
                      HẾT
                    </span>
                  )}
                  {active && (
                    <Motion.div
                      layoutId={`active-pill-${key}`}
                      className="absolute inset-0 bg-primary rounded-[14px] z-0"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
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
