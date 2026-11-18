export const SPEC_CATEGORIES = [
  {
    id: "overview",
    title: "Thông tin chung & Giá bán",
    rows: [
      { key: "brand", label: "Thương hiệu" },
      { key: "category", label: "Danh mục" },
      { key: "stock", label: "Tình trạng kho" },
    ],
  },
  {
    id: "specs",
    title: "Cấu hình & Thông số kỹ thuật",
    rows: [
      { key: "cpu", label: "Vi xử lý / Chipset" },
      { key: "ram", label: "RAM / Bộ nhớ" },
      { key: "storage", label: "Lưu trữ" },
      { key: "display", label: "Màn hình" },
      { key: "battery", label: "Pin & Sạc" },
      { key: "warranty", label: "Bảo hành" },
    ],
  },
];

export const mapApiProductToCompare = (p) => {
  const attrs = Array.isArray(p?.attributeValues) ? p.attributeValues : [];
  const findAttr = (keywords) => {
    const match = attrs.find((a) => {
      const name = String(a?.attribute?.name || a?.attributeName || "").toLowerCase();
      return keywords.some((k) => name.includes(k));
    });
    return match?.value || "Đang cập nhật";
  };

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku || `TT-${p.id}`,
    badge: p.brand?.name || p.category?.name || "Chính hãng",
    image: p.image || p.images?.[0]?.imageUrl || "",
    price: Number(p.flashSalePrice || p.finalPrice || p.basePrice || p.price || 0),
    originalPrice: p.discount > 0 ? Number(p.basePrice || p.price || 0) : null,
    specs: {
      brand: p.brand?.name || "TienTech",
      category: p.category?.name || "Công nghệ",
      stock: Number(p.totalStock || p.stock || 0) > 0 ? `Còn ${p.totalStock || p.stock} sp` : "Hết hàng",
      cpu: findAttr(["cpu", "chip", "vi xử lý"]),
      ram: findAttr(["ram", "bộ nhớ"]),
      storage: findAttr(["ssd", "rom", "lưu trữ", "dung lượng"]),
      display: findAttr(["màn hình", "display", "screen"]),
      battery: findAttr(["pin", "battery", "sạc"]),
      warranty: "12 tháng chính hãng",
    },
  };
};
