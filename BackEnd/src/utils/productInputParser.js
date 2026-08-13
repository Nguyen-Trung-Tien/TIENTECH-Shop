const parseBoolean = (value) => {
  if (value === true || value === false) return value;
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  return value;
};

const parseJsonFields = (data, fields) => {
  fields.forEach((field) => {
    if (data[field] && typeof data[field] === "string") {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        // Keep string if parse fails
      }
    }
  });
};

const sanitizeProductInput = (rawBody) => {
  const data = { ...rawBody };

  parseJsonFields(data, ["specifications", "variants", "attributes", "options"]);

  if (data.variants && Array.isArray(data.variants)) {
    data.variants = data.variants.map((v) => {
      if (v.attributes && typeof v.attributes === "string") {
        try {
          v.attributes = JSON.parse(v.attributes);
        } catch (e) {}
      }
      return v;
    });
  }

  if (data.brandId && !isNaN(parseInt(data.brandId))) {
    data.brandId = parseInt(data.brandId);
  } else if (data.brandId === "") {
    delete data.brandId;
  }

  if (data.categoryId && !isNaN(parseInt(data.categoryId))) {
    data.categoryId = parseInt(data.categoryId);
  } else if (data.categoryId === "") {
    delete data.categoryId;
  }

  if (data.stock !== undefined) data.stock = parseInt(data.stock);
  if (data.price !== undefined && data.basePrice === undefined) data.basePrice = data.price;
  if (data.isActive !== undefined) data.isActive = parseBoolean(data.isActive);
  if (data.hasVariants !== undefined) data.hasVariants = parseBoolean(data.hasVariants);

  if (data.flashSaleStart && String(data.flashSaleStart).trim() !== "") {
    const startDate = new Date(data.flashSaleStart);
    if (!isNaN(startDate.getTime())) data.flashSaleStart = startDate;
    else delete data.flashSaleStart;
  } else {
    delete data.flashSaleStart;
  }

  if (data.flashSaleEnd && String(data.flashSaleEnd).trim() !== "") {
    const endDate = new Date(data.flashSaleEnd);
    if (!isNaN(endDate.getTime())) data.flashSaleEnd = endDate;
    else delete data.flashSaleEnd;
  } else {
    delete data.flashSaleEnd;
  }

  if (data.flashSalePrice !== undefined && data.flashSalePrice !== "" && data.flashSalePrice !== null) {
    data.flashSalePrice = Number(data.flashSalePrice);
  } else {
    delete data.flashSalePrice;
  }

  return data;
};

module.exports = {
  parseBoolean,
  sanitizeProductInput,
};
