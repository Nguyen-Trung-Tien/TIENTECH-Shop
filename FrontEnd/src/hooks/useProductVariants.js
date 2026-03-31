import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Hook tối ưu để xử lý việc chọn Phiên bản (Variant) và Thuộc tính (Attribute)
 */
export const useProductVariants = (product, syncUrl = true) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const variants = useMemo(() => product?.variants || [], [product]);

  // 1. Tổng hợp tất cả thuộc tính có thể chọn (All Options)
  const allAttributes = useMemo(() => {
    const result = {};

    // Duyệt qua tất cả các biến thể để lấy tập hợp các giá trị thuộc tính
    variants.forEach((v) => {
      // Ưu tiên hệ thống attributes mới (array of objects)
      if (Array.isArray(v.attributes)) {
        v.attributes.forEach(attrVal => {
          const name = attrVal.attribute?.name;
          if (name) {
            if (!result[name]) result[name] = new Set();
            result[name].add(attrVal.value);
          }
        });
      } 
      // Fallback legacy (JSON attributeValues)
      else if (v.attributeValues) {
        Object.entries(v.attributeValues).forEach(([key, value]) => {
          if (!result[key]) result[key] = new Set();
          result[key].add(value);
        });
      }
    });

    return Object.fromEntries(
      Object.entries(result).map(([key, set]) => [key, Array.from(set)])
    );
  }, [variants]);

  // 2. Trạng thái các thuộc tính đang được người dùng chọn
  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    const initial = {};
    if (syncUrl) {
      Object.keys(allAttributes).forEach((key) => {
        const urlValue = searchParams.get(key.toLowerCase());
        if (urlValue && allAttributes[key].includes(urlValue)) {
          initial[key] = urlValue;
        }
      });
    }
    return initial;
  });

  // 3. Tìm biến thể (Variant) khớp hoàn toàn với lựa chọn
  const selectedVariant = useMemo(() => {
    const isFullSelection = Object.keys(allAttributes).every((key) => selectedAttributes[key]);
    if (!isFullSelection) return null;

    return variants.find((v) => {
      // So khớp với hệ thống mới
      if (Array.isArray(v.attributes)) {
        return Object.entries(selectedAttributes).every(([name, value]) => {
          return v.attributes.some(av => av.attribute?.name === name && av.value === value);
        });
      }
      // So khớp legacy
      const vAttrs = v.attributeValues || {};
      return Object.entries(selectedAttributes).every(([key, value]) => vAttrs[key] === value);
    });
  }, [selectedAttributes, variants, allAttributes]);

  // Biến thể dùng để hiển thị (Cập nhật Ảnh/Giá ngay khi chọn 1 phần)
  const displayVariant = useMemo(() => {
    if (selectedVariant) return selectedVariant;
    if (Object.keys(selectedAttributes).length === 0) return null;

    // Tìm biến thể đầu tiên khớp với các thuộc tính ĐANG chọn
    return variants.find((v) => {
      return Object.entries(selectedAttributes).every(([name, value]) => {
        if (Array.isArray(v.attributes)) {
          return v.attributes.some(av => av.attribute?.name === name && av.value === value);
        }
        return v.attributeValues?.[name] === value;
      });
    });
  }, [selectedVariant, selectedAttributes, variants]);

  // 4. Kiểm tra xem một giá trị thuộc tính có khả dụng để chọn không (dựa trên các option khác đã chọn)
  const checkAttributeAvailability = (attrName, attrValue) => {
    return variants.some((v) => {
      if (v.stock <= 0) return false;

      // Kiểm tra xem biến thể này có chứa thuộc tính đang xét không
      let match = false;
      if (Array.isArray(v.attributes)) {
        match = v.attributes.some(av => av.attribute?.name === attrName && av.value === attrValue);
      } else {
        match = v.attributeValues?.[attrName] === attrValue;
      }
      if (!match) return false;

      // Kiểm tra xem biến thể này có tương thích với các thuộc tính KHÁC đã chọn không
      return Object.entries(selectedAttributes).every(([name, value]) => {
        if (name === attrName) return true;
        if (Array.isArray(v.attributes)) {
          return v.attributes.some(av => av.attribute?.name === name && av.value === value);
        }
        return v.attributeValues?.[name] === value;
      });
    });
  };

  const onSelectAttribute = (attrName, attrValue) => {
    let newSelection = { ...selectedAttributes };
    
    if (newSelection[attrName] === attrValue) {
      delete newSelection[attrName];
    } else {
      newSelection[attrName] = attrValue;
      
      // Nếu tổ hợp mới không có hàng, reset các cái khác để tránh bị kẹt (Deadlock)
      const isAvailable = variants.some(v => {
        if (Array.isArray(v.attributes)) {
          return v.attributes.some(av => av.attribute?.name === attrName && av.value === attrValue);
        }
        return v.attributeValues?.[attrName] === attrValue;
      });

      if (!isAvailable) newSelection = { [attrName]: attrValue };
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
