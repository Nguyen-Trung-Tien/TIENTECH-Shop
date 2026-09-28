import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Danh mục từ đồng nghĩa hỗ trợ khớp linh hoạt giữa code và tên tiếng Việt
const ATTRIBUTE_SYNONYMS = {
  color: ["màu sắc", "màu", "color", "colour"],
  "màu sắc": ["color", "colour", "màu"],
  rom: ["dung lượng", "bộ nhớ", "bộ nhớ trong", "rom", "storage", "internal storage"],
  "dung lượng": ["rom", "storage", "bộ nhớ", "bộ nhớ trong"],
  "bộ nhớ": ["rom", "storage", "dung lượng", "bộ nhớ trong"],
  ram: ["ram", "bộ nhớ ram", "memory"],
  "bộ nhớ ram": ["ram", "memory"],
};

/**
 * Helper: Trích xuất danh sách thuộc tính chuẩn hóa [{ name, code, value }] cho 1 variant
 */
export const extractVariantAttributes = (v) => {
  if (!v) return [];
  const list = [];
  const seen = new Set();

  // 1. Kiểm tra mảng v.attributes (hệ thống relational AttributeValue)
  const rawAttrs = Array.isArray(v.attributes)
    ? v.attributes
    : typeof v.attributes === "string"
    ? (() => {
        try {
          const parsed = JSON.parse(v.attributes);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];

  if (rawAttrs.length > 0) {
    rawAttrs.forEach((item) => {
      const name =
        item.attribute?.name ||
        item.attributeName ||
        item.name ||
        item.attribute?.code ||
        "Thuộc tính";
      const code = item.attribute?.code || name.toLowerCase();
      const val = typeof item === "object" && item !== null ? item.value : item;
      if (name && val != null) {
        const strVal = String(val).trim();
        const key = `${name.toLowerCase()}:::${strVal.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ name: String(name).trim(), code: String(code).trim().toLowerCase(), value: strVal });
        }
      }
    });
  }

  // 2. Kiểm tra v.attributeValues (JSON object hoặc string)
  let attrValues = v.attributeValues;
  if (typeof attrValues === "string") {
    try {
      attrValues = JSON.parse(attrValues);
    } catch {
      attrValues = null;
    }
  }

  if (attrValues && typeof attrValues === "object" && !Array.isArray(attrValues)) {
    Object.entries(attrValues).forEach(([k, val]) => {
      if (k && val != null) {
        const strVal = String(val).trim();
        const key = `${k.toLowerCase()}:::${strVal.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ name: String(k).trim(), code: String(k).trim().toLowerCase(), value: strVal });
        }
      }
    });
  }

  // 3. Fallback nếu v.attributes là object thông thường (key-value)
  if (v.attributes && typeof v.attributes === "object" && !Array.isArray(v.attributes)) {
    Object.entries(v.attributes).forEach(([k, val]) => {
      if (k && val != null) {
        const strVal = String(val).trim();
        const key = `${k.toLowerCase()}:::${strVal.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ name: String(k).trim(), code: String(k).trim().toLowerCase(), value: strVal });
        }
      }
    });
  }

  return list;
};

/**
 * Helper: Kiểm tra xem 1 variant có khớp với cặp (tên thuộc tính, giá trị) hay không
 */
export const matchVariantAttribute = (variant, targetName, targetValue) => {
  if (!variant || !targetName || targetValue == null) return false;
  const attrs = extractVariantAttributes(variant);
  const normTargetName = String(targetName).trim().toLowerCase();
  const normTargetValue = String(targetValue).trim().toLowerCase();

  const synonyms = ATTRIBUTE_SYNONYMS[normTargetName] || [];

  return attrs.some((a) => {
    const aName = a.name.toLowerCase();
    const aCode = a.code.toLowerCase();
    const isNameMatch =
      aName === normTargetName ||
      aCode === normTargetName ||
      synonyms.includes(aName) ||
      synonyms.includes(aCode);

    if (!isNameMatch) return false;
    return a.value.toLowerCase() === normTargetValue;
  });
};

/**
 * Hook tối ưu để xử lý việc chọn Phiên bản (Variant) và Thuộc tính (Attribute)
 */
export const useProductVariants = (product, syncUrl = true) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const variants = useMemo(() => product?.variants || [], [product]);

  // 1. Tổng hợp tất cả thuộc tính có thể chọn (All Options)
  const allAttributes = useMemo(() => {
    const result = {};

    variants.forEach((v) => {
      const attrs = extractVariantAttributes(v);
      attrs.forEach(({ name, value }) => {
        if (!result[name]) result[name] = new Set();
        result[name].add(value);
      });
    });

    return Object.fromEntries(
      Object.entries(result).map(([key, set]) => [key, Array.from(set)])
    );
  }, [variants]);

  // 2. Trạng thái các thuộc tính đang được người dùng chọn
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Tự động khởi tạo hoặc khớp từ URL / Chọn variant đầu tiên khả dụng
  useEffect(() => {
    const attrKeys = Object.keys(allAttributes);
    if (attrKeys.length === 0) {
      setSelectedAttributes({});
      return;
    }

    const initial = {};
    let hasUrlMatch = false;

    if (syncUrl) {
      attrKeys.forEach((key) => {
        const urlVal = searchParams.get(key.toLowerCase());
        if (urlVal && allAttributes[key].some((v) => v.toLowerCase() === urlVal.toLowerCase())) {
          const matchedVal = allAttributes[key].find((v) => v.toLowerCase() === urlVal.toLowerCase());
          initial[key] = matchedVal;
          hasUrlMatch = true;
        }
      });
    }

    // Nếu URL có đủ thông tin thì dùng URL
    if (hasUrlMatch && attrKeys.every((k) => initial[k])) {
      setSelectedAttributes(initial);
      return;
    }

    // Nếu chưa chọn hoặc mới load product, tự động chọn biến thể khả dụng đầu tiên
    const firstActiveVariant =
      variants.find((v) => v.isActive !== false && (Number(v.stock) > 0 || v.stock == null)) ||
      variants[0];

    if (firstActiveVariant) {
      const vAttrs = extractVariantAttributes(firstActiveVariant);
      attrKeys.forEach((key) => {
        const matched = vAttrs.find(
          (a) =>
            a.name.toLowerCase() === key.toLowerCase() ||
            (ATTRIBUTE_SYNONYMS[key.toLowerCase()] || []).includes(a.name.toLowerCase())
        );
        if (matched) {
          initial[key] = matched.value;
        } else if (allAttributes[key]?.length > 0) {
          initial[key] = allAttributes[key][0];
        }
      });
      setSelectedAttributes(initial);
    }
  }, [allAttributes, variants, syncUrl, searchParams]);

  // 3. Tìm biến thể (Variant) khớp hoàn toàn với lựa chọn
  const selectedVariant = useMemo(() => {
    const attrKeys = Object.keys(allAttributes);
    if (attrKeys.length === 0) return null;

    const isFullSelection = attrKeys.every((key) => selectedAttributes[key]);
    if (!isFullSelection) return null;

    return variants.find((v) => {
      return attrKeys.every((key) => {
        return matchVariantAttribute(v, key, selectedAttributes[key]);
      });
    });
  }, [selectedAttributes, variants, allAttributes]);

  // Biến thể dùng để hiển thị (Cập nhật Ảnh/Giá ngay khi chọn 1 phần)
  const displayVariant = useMemo(() => {
    if (selectedVariant) return selectedVariant;
    if (Object.keys(selectedAttributes).length === 0) return variants[0] || null;

    return (
      variants.find((v) => {
        return Object.entries(selectedAttributes).every(([name, value]) => {
          if (!value) return true;
          return matchVariantAttribute(v, name, value);
        });
      }) || variants[0] || null
    );
  }, [selectedVariant, selectedAttributes, variants]);

  // 4. Kiểm tra xem một giá trị thuộc tính có khả dụng để chọn không
  const checkAttributeAvailability = (attrName, attrValue) => {
    const hasAnyVariantWithStock = variants.some((v) => Number(v.stock) > 0);

    return variants.some((v) => {
      if (v.isActive === false) return false;
      if (hasAnyVariantWithStock && Number(v.stock) <= 0) return false;

      // Kiểm tra xem biến thể có chứa thuộc tính đang xét không
      if (!matchVariantAttribute(v, attrName, attrValue)) return false;

      // Kiểm tra xem biến thể có tương thích với các thuộc tính KHÁC đã chọn không
      return Object.entries(selectedAttributes).every(([name, value]) => {
        if (!value || name === attrName) return true;
        return matchVariantAttribute(v, name, value);
      });
    });
  };

  const onSelectAttribute = (attrName, attrValue) => {
    let newSelection = { ...selectedAttributes };

    if (newSelection[attrName] === attrValue) {
      delete newSelection[attrName];
    } else {
      newSelection[attrName] = attrValue;

      // Nếu tổ hợp mới không có hàng, thử tìm biến thể chứa option này để auto-fill các option khác
      const hasAnyVariantWithStock = variants.some((v) => Number(v.stock) > 0);
      const isAvailableWithCurrentOther = variants.some((v) => {
        if (v.isActive === false) return false;
        if (hasAnyVariantWithStock && Number(v.stock) <= 0) return false;
        return Object.entries(newSelection).every(([k, val]) => matchVariantAttribute(v, k, val));
      });

      if (!isAvailableWithCurrentOther) {
        // Tìm biến thể có thuộc tính này để cập nhật tổ hợp phù hợp tránh Deadlock
        const fallbackVariant = variants.find((v) => {
          if (v.isActive === false) return false;
          if (hasAnyVariantWithStock && Number(v.stock) <= 0) return false;
          return matchVariantAttribute(v, attrName, attrValue);
        });

        if (fallbackVariant) {
          const fallbackAttrs = extractVariantAttributes(fallbackVariant);
          const adjusted = { [attrName]: attrValue };
          Object.keys(allAttributes).forEach((k) => {
            if (k !== attrName) {
              const matched = fallbackAttrs.find((a) => a.name.toLowerCase() === k.toLowerCase());
              if (matched) adjusted[k] = matched.value;
            }
          });
          newSelection = adjusted;
        } else {
          newSelection = { [attrName]: attrValue };
        }
      }
    }

    setSelectedAttributes(newSelection);

    if (syncUrl) {
      const newParams = new URLSearchParams(searchParams);
      if (newSelection[attrName]) newParams.set(attrName.toLowerCase(), attrValue);
      else newParams.delete(attrName.toLowerCase());
      setSearchParams(newParams);
    }
  };

  return {
    allAttributes,
    selectedAttributes,
    selectedVariant,
    displayVariant,
    onSelectAttribute,
    checkAttributeAvailability,
  };
};
