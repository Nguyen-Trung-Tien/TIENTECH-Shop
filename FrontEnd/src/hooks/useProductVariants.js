import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Enhanced Hook for Product Variant Selection
 * Handles normalized options/values and legacy attributeValues.
 */
export const useProductVariants = (product) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const variants = useMemo(() => product?.variants || [], [product]);
  const normalizedOptions = useMemo(() => product?.options || [], [product]);

  // 1. Prepare All Attributes (Options)
  const allAttributes = useMemo(() => {
    if (normalizedOptions.length > 0) {
      // Use normalized options if available
      const result = {};
      normalizedOptions.forEach(opt => {
        result[opt.name] = opt.values.map(v => v.value);
      });
      return result;
    } else {
      // Fallback to legacy extraction from variants
      const result = {};
      variants.forEach((v) => {
        const vAttrs = v.attributeValues || {};
        Object.entries(vAttrs).forEach(([key, value]) => {
          if (!result[key]) result[key] = new Set();
          result[key].add(value);
        });
      });
      return Object.fromEntries(
        Object.entries(result).map(([key, value]) => [key, Array.from(value)])
      );
    }
  }, [variants, normalizedOptions]);

  // 2. Initial selection from URL or first available
  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    const initial = {};
    Object.keys(allAttributes).forEach((key) => {
      const urlValue = searchParams.get(key.toLowerCase());
      if (urlValue && allAttributes[key].includes(urlValue)) {
        initial[key] = urlValue;
      }
    });
    return initial;
  });

  // 3. Find Selected Variant
  const selectedVariant = useMemo(() => {
    const isFullSelection = Object.keys(allAttributes).every((key) => selectedAttributes[key]);
    if (!isFullSelection) return null;

    return variants.find((v) => {
      // Check normalized optionValues first
      if (v.optionValues && v.optionValues.length > 0) {
        return v.optionValues.every(ov => {
          const optName = normalizedOptions.find(o => o.id === ov.productOptionId)?.name;
          return selectedAttributes[optName] === ov.value;
        });
      }
      
      // Fallback to attributeValues JSON
      const vAttrs = v.attributeValues || {};
      return Object.entries(selectedAttributes).every(
        ([key, value]) => vAttrs[key] === value
      );
    });
  }, [selectedAttributes, variants, allAttributes, normalizedOptions]);

  // Display Variant: Dùng để cập nhật Ảnh và Giá ngay khi người dùng pick 1 thuộc tính
  const displayVariant = useMemo(() => {
    if (selectedVariant) return selectedVariant;
    if (Object.keys(selectedAttributes).length === 0) return null;

    return variants.find((v) => {
      return Object.entries(selectedAttributes).every(([key, value]) => {
        if (v.optionValues && v.optionValues.length > 0) {
          return v.optionValues.some(ov => {
            const opt = normalizedOptions.find(o => o.id === ov.productOptionId);
            return opt?.name === key && ov.value === value;
          });
        }
        return v.attributeValues?.[key] === value;
      });
    });
  }, [selectedVariant, selectedAttributes, variants, normalizedOptions]);

  // 4. Availability Check
  const checkAttributeAvailability = (attrName, attrValue) => {
    return variants.some((v) => {
      // Basic stock check
      if (v.stock <= 0) return false;

      let match = false;
      if (v.optionValues && v.optionValues.length > 0) {
        // Match using normalized optionValues
        match = v.optionValues.some(ov => {
          const opt = normalizedOptions.find(o => o.id === ov.productOptionId);
          return opt?.name === attrName && ov.value === attrValue;
        });
      } else {
        // Match using attributeValues JSON
        match = v.attributeValues?.[attrName] === attrValue;
      }

      if (!match) return false;

      // Check compatibility with other ALREADY SELECTED attributes
      return Object.entries(selectedAttributes).every(([key, value]) => {
        if (key === attrName) return true; // Skip current option
        
        if (v.optionValues && v.optionValues.length > 0) {
          return v.optionValues.some(ov => {
            const opt = normalizedOptions.find(o => o.id === ov.productOptionId);
            return opt?.name === key && ov.value === value;
          });
        }
        return v.attributeValues?.[key] === value;
      });
    });
  };

  const onSelectAttribute = (attrName, attrValue) => {
    let newSelection = { ...selectedAttributes };
    
    // Toggle deselection
    if (newSelection[attrName] === attrValue) {
      delete newSelection[attrName];
    } else {
      newSelection[attrName] = attrValue;
      
      // Auto-resolve conflicts by clearing other selections if this combination is unavailable
      const isNowAvailable = checkAttributeAvailabilityForSelection(newSelection, attrName, attrValue);
      if (!isNowAvailable) {
        // Clear all other selections except the new one to reset the tree
        newSelection = { [attrName]: attrValue };
      }
    }

    setSelectedAttributes(newSelection);

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (newSelection[attrName]) {
      newParams.set(attrName.toLowerCase(), attrValue);
    } else {
      newParams.delete(attrName.toLowerCase());
    }
    setSearchParams(newParams);
  };

  // Helper cho thuật toán sửa conflict
  const checkAttributeAvailabilityForSelection = (currentSelection, attrName, attrValue) => {
    return variants.some((v) => {
      if (v.stock <= 0) return false;
      let match = false;
      if (v.optionValues && v.optionValues.length > 0) {
        match = v.optionValues.some(ov => {
          const opt = normalizedOptions.find(o => o.id === ov.productOptionId);
          return opt?.name === attrName && ov.value === attrValue;
        });
      } else {
        match = v.attributeValues?.[attrName] === attrValue;
      }
      if (!match) return false;

      return Object.entries(currentSelection).every(([key, value]) => {
        if (key === attrName) return true;
        if (v.optionValues && v.optionValues.length > 0) {
          return v.optionValues.some(ov => {
            const opt = normalizedOptions.find(o => o.id === ov.productOptionId);
            return opt?.name === key && ov.value === value;
          });
        }
        return v.attributeValues?.[key] === value;
      });
    });
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
