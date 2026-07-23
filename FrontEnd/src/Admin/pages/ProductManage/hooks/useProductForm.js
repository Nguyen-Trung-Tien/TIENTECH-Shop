import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  createProductApi,
  updateProductApi,
  getOneProductApi,
} from "../../../../api/productApi";
import { generateProductDescriptionApi } from "../../../../api/adminApi";
import { getVariantsByProduct } from "../../../../api/variantApi";

const initialFormState = {
  name: "",
  sku: "",
  description: "",
  price: "",
  discount: "0",
  stock: "0",
  categoryId: "",
  brandId: "",
  isActive: true,
  hasVariants: false,
  isFlashSale: false,
  flashSalePrice: "",
  flashSaleStart: "",
  flashSaleEnd: "",
  imageFile: null,
  specifications: {},
  attributes: {},
  options: [{ name: "Màu sắc", code: "color", values: [""] }],
  variants: [],
};

export const normalizeVariantAttributes = (v) => {
  if (!v) return {};

  if (
    v.attributeValues &&
    typeof v.attributeValues === "object" &&
    !Array.isArray(v.attributeValues)
  ) {
    return v.attributeValues;
  }

  if (
    v.attributes &&
    typeof v.attributes === "object" &&
    !Array.isArray(v.attributes)
  ) {
    return v.attributes;
  }

  const attrArr = Array.isArray(v.attributes)
    ? v.attributes
    : Array.isArray(v.attributeValues)
    ? v.attributeValues
    : [];

  const result = {};
  attrArr.forEach((item) => {
    const key =
      item.attribute?.name || item.attribute?.code || item.attributeName || "Thuộc tính";
    const val = typeof item === "object" ? item.value : item;
    if (key && val) {
      result[key] = String(val).trim();
    }
  });

  return result;
};

// Helper: Extract existing product options (Color, Storage...) from variants list
export const extractOptionsFromVariants = (variantsList = []) => {
  if (!Array.isArray(variantsList) || variantsList.length === 0) return [];

  const map = new Map(); // key: code -> { name, code, valuesSet }

  variantsList.forEach((v) => {
    let attrsObj = {};
    if (Array.isArray(v.attributes)) {
      v.attributes.forEach((attrVal) => {
        const key = attrVal.attribute?.name || attrVal.attribute?.code || "Thuộc tính";
        const val = attrVal.value || attrVal;
        if (key && val) attrsObj[key] = val;
      });
    } else if (typeof v.attributes === "object" && v.attributes !== null) {
      attrsObj = v.attributes;
    } else if (typeof v.attributeValues === "object" && v.attributeValues !== null) {
      attrsObj = v.attributeValues;
    }

    Object.entries(attrsObj).forEach(([codeOrName, val]) => {
      if (!val) return;
      const key = String(codeOrName).trim();
      const code = key.toLowerCase();
      if (!map.has(code)) {
        map.set(code, {
          name: key,
          code: code,
          valuesSet: new Set([String(val).trim()]),
        });
      } else {
        map.get(code).valuesSet.add(String(val).trim());
      }
    });
  });

  return Array.from(map.values()).map((opt) => ({
    name: opt.name,
    code: opt.code,
    values: Array.from(opt.valuesSet),
  }));
};

export const useProductForm = ({ editProduct, onSuccess, onClose }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [modalTab, setModalTab] = useState("basic"); // basic, attributes, variants, flashsale
  const [errors, setErrors] = useState({});

  // Reset form to clean state
  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setDeletedImages([]);
    setVariants([]);
    setErrors({});
    setModalTab("basic");
  }, []);

  // Fetch existing variants & extract option structure
  const fetchVariants = async (productId) => {
    try {
      const res = await getVariantsByProduct(productId);
      if (res?.errCode === 0) {
        const fetchedVariants = (res.data || []).map((v) => {
          const normalizedAttr = normalizeVariantAttributes(v);
          return {
            ...v,
            attributes: normalizedAttr,
            attributeValues: normalizedAttr,
          };
        });
        setVariants(fetchedVariants);

        const extractedOptions = extractOptionsFromVariants(fetchedVariants);
        setFormData((prev) => ({
          ...prev,
          variants: fetchedVariants,
          hasVariants: fetchedVariants.length > 0 ? true : prev.hasVariants,
          options: extractedOptions.length > 0 ? extractedOptions : prev.options,
        }));
      }
    } catch (err) {
      console.error("Fetch variants error:", err);
    }
  };

  // Initialize form when editProduct is provided
  const initFormWithProduct = useCallback((product) => {
    if (!product) {
      resetForm();
      return;
    }

    // Map attributes from product junction table & legacy specs
    const productAttrs = {};
    if (product.attributes && Array.isArray(product.attributes)) {
      product.attributes.forEach((attrVal) => {
        if (attrVal.attribute) {
          productAttrs[attrVal.attribute.code] = attrVal.value;
        }
      });
    }

    let legacySpecs = product.specifications || {};
    if (typeof legacySpecs === "string") {
      try {
        legacySpecs = JSON.parse(legacySpecs);
      } catch {
        legacySpecs = {};
      }
    }

    const normalizedSpecs = {};
    if (typeof legacySpecs === "object" && legacySpecs !== null) {
      Object.entries(legacySpecs).forEach(([k, v]) => {
        normalizedSpecs[k.toLowerCase()] = v;
      });
    }

    const mergedAttrs = { ...normalizedSpecs, ...productAttrs };

    // Extract options if explicitly stored in product
    let parsedOptions = [{ name: "Màu sắc", code: "color", values: [""] }];
    if (product.options) {
      let rawOpt = product.options;
      if (typeof rawOpt === "string") {
        try { rawOpt = JSON.parse(rawOpt); } catch { rawOpt = []; }
      }
      if (Array.isArray(rawOpt) && rawOpt.length > 0) {
        parsedOptions = rawOpt;
      }
    }

    let initialVariantsList = [];
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      initialVariantsList = product.variants.map((v) => {
        const normalizedAttr = normalizeVariantAttributes(v);
        return {
          ...v,
          attributes: normalizedAttr,
          attributeValues: normalizedAttr,
        };
      });
      setVariants(initialVariantsList);
    }

    const extractedOptsFromProduct = extractOptionsFromVariants(initialVariantsList);

    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      price: product.basePrice || product.price || "",
      discount: product.discount || "0",
      stock: product.totalStock || product.stock || "0",
      categoryId: product.categoryId || "",
      brandId: product.brandId || "",
      isActive: product.isActive ?? true,
      hasVariants: initialVariantsList.length > 0 ? true : (product.hasVariants ?? false),
      isFlashSale: product.isFlashSale ?? false,
      flashSalePrice: product.flashSalePrice || "",
      flashSaleStart: product.flashSaleStart
        ? new Date(product.flashSaleStart).toISOString().slice(0, 16)
        : "",
      flashSaleEnd: product.flashSaleEnd
        ? new Date(product.flashSaleEnd).toISOString().slice(0, 16)
        : "",
      attributes: mergedAttrs,
      specifications: legacySpecs,
      options: extractedOptsFromProduct.length > 0 ? extractedOptsFromProduct : parsedOptions,
      variants: initialVariantsList,
      imageFile: null,
    });

    const primaryImgUrl =
      product.images?.find((img) => img.isPrimary)?.imageUrl ||
      product.images?.[0]?.imageUrl ||
      product.image ||
      null;

    setImagePreview(primaryImgUrl);
    setGalleryPreviews(product.images?.map((img) => img.imageUrl) || []);
    setGalleryFiles([]);
    setDeletedImages([]);
    setErrors({});

    // Fetch existing variants from API to ensure sync
    if (product.id) {
      fetchVariants(product.id);
    }
  }, [resetForm]);

  // Handle simple input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Handle Primary Image upload
  const handleImageChange = (e) => {
    const file = e.target?.files?.[0] || e;
    if (file && file instanceof File) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  // Handle Gallery Images upload
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target?.files || []);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Handle deleting a gallery image
  const handleDeleteGalleryImage = (idx) => {
    const urlToRemove = galleryPreviews[idx];

    if (editProduct?.images?.some((img) => img.imageUrl === urlToRemove)) {
      setDeletedImages((prev) => [...prev, urlToRemove]);
    } else {
      const oldImagesCount = editProduct?.images?.length || 0;
      if (idx >= oldImagesCount) {
        const fileIdx = idx - oldImagesCount;
        setGalleryFiles((prev) => prev.filter((_, i) => i !== fileIdx));
      }
    }

    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // AI Description Generator
  const handleGenerateDesc = async () => {
    if (!formData.name.trim()) {
      toast.warning("Vui lòng nhập Tên sản phẩm trước khi tạo mô tả bằng AI!");
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const keywords = Object.values(formData.attributes || {})
        .map((v) => (typeof v === "object" ? v.value || "" : v))
        .filter(Boolean)
        .join(", ");
      const res = await generateProductDescriptionApi(formData.name, keywords);
      if (res.errCode === 0) {
        setFormData((prev) => ({ ...prev, description: res.data }));
        toast.success("✨ Đã tự động tạo mô tả sản phẩm bằng AI!");
      } else {
        toast.error(res.errMessage || "Không thể tạo mô tả bằng AI");
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi kết nối khi gọi dịch vụ AI");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống";
    }
    if (!formData.price || Number(formData.price) < 0) {
      newErrors.price = "Giá bán không hợp lệ (phải ≥ 0)";
    }

    // Variant Validation
    if (formData.hasVariants) {
      const activeVariants = (formData.variants && formData.variants.length > 0) ? formData.variants : variants;
      if (!activeVariants || activeVariants.length === 0) {
        newErrors.variants = "Cần ít nhất 1 phiên bản biến thể hoặc tắt chế độ Biến thể";
      } else {
        const invalidVariants = activeVariants.filter(
          (v) => !v.sku?.trim() || v.price === "" || Number(v.price) < 0
        );
        if (invalidVariants.length > 0) {
          newErrors.variants = "Một số phiên bản biến thể chưa nhập SKU hoặc Giá bán hợp lệ";
        }
      }
    }

    // Flash Sale Validation
    if (formData.isFlashSale) {
      if (!formData.flashSalePrice || Number(formData.flashSalePrice) <= 0) {
        newErrors.flashSalePrice = "Giá Flash Sale phải lớn hơn 0";
      }
      if (Number(formData.flashSalePrice) >= Number(formData.price)) {
        newErrors.flashSalePrice = "Giá Flash Sale phải nhỏ hơn giá cơ bản";
      }
      if (formData.flashSaleStart && formData.flashSaleEnd) {
        if (new Date(formData.flashSaleEnd) <= new Date(formData.flashSaleStart)) {
          newErrors.flashSaleEnd = "Thời gian kết thúc phải sau thời gian bắt đầu";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin bị lỗi!");
      if (errors.name || errors.price) setModalTab("basic");
      else if (errors.variants) setModalTab("variants");
      else if (errors.flashSalePrice || errors.flashSaleEnd) setModalTab("flashsale");
      return;
    }

    const data = new FormData();

    const activeVariantsList = (formData.variants && formData.variants.length > 0) ? formData.variants : variants;
    const finalVariants = activeVariantsList.map((v) => {
      const normalizedAttr = normalizeVariantAttributes(v);
      return {
        ...v,
        price: v.price !== "" && v.price != null ? Number(v.price) : Number(formData.price || 0),
        stock: v.stock !== "" && v.stock != null ? Number(v.stock) : Number(formData.stock || 0),
        attributes: normalizedAttr,
        attributeValues: normalizedAttr,
      };
    });

    if (finalVariants.length > 0) {
      formData.hasVariants = true;
    }

    const finalSpecs = { ...formData.specifications, ...formData.attributes };

    if (formData.imageFile) {
      data.append("image", formData.imageFile);
    } else if (imagePreview && typeof imagePreview === "string") {
      data.append("image", imagePreview);
    }

    Object.keys(formData).forEach((key) => {
      if (key === "imageFile") return;
      if (["attributes", "variants", "options", "specifications"].includes(key)) {
        let value;
        if (key === "variants") value = finalVariants;
        else if (key === "specifications" || key === "attributes") value = finalSpecs;
        else value = formData[key];

        data.append(key, JSON.stringify(value));
      } else if (formData[key] !== null && formData[key] !== "" && key !== "attributes") {
        data.append(key, formData[key]);
      }
    });

    galleryFiles.forEach((file) => data.append("images", file));

    if (deletedImages.length > 0) {
      data.append("deletedImages", JSON.stringify(deletedImages));
    }

    setSaving(true);
    try {
      let res;
      if (editProduct) {
        res = await updateProductApi(editProduct.id, data);
      } else {
        res = await createProductApi(data);
      }

      if (res.errCode === 0) {
        toast.success(
          editProduct ? "Đã cập nhật sản phẩm thành công!" : "Tạo sản phẩm thành công!"
        );
        resetForm();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(res.errMessage || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Submit product form error:", error);
      toast.error("Lỗi hệ thống khi lưu sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    imagePreview,
    galleryPreviews,
    saving,
    isGeneratingDesc,
    modalTab,
    setModalTab,
    errors,
    variants,
    handleChange,
    handleImageChange,
    handleGalleryChange,
    handleDeleteGalleryImage,
    handleGenerateDesc,
    handleSubmit,
    initFormWithProduct,
    fetchVariants,
    resetForm,
  };
};
