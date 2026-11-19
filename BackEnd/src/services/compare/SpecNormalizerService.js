const SPEC_MATRIX_SECTIONS = [
  {
    id: "overview",
    title: "Tổng quan & Giá trị",
    rows: [
      { key: "brand", label: "Thương hiệu", quantifiable: false, keySpec: true },
      { key: "category", label: "Danh mục", quantifiable: false, keySpec: false },
      { key: "price", label: "Giá bán hiện tại", quantifiable: true, higherIsBetter: false, keySpec: true },
      { key: "rating", label: "Đánh giá người dùng", quantifiable: true, higherIsBetter: true, keySpec: true },
      { key: "stock", label: "Tồn kho", quantifiable: true, higherIsBetter: true, keySpec: false },
      { key: "specCoverage", label: "Độ đầy đủ thông số", quantifiable: true, higherIsBetter: true, keySpec: false },
    ],
  },
  {
    id: "performance",
    title: "Hiệu năng & Bộ nhớ",
    rows: [
      { key: "cpu", label: "Vi xử lý (CPU / SoC)", quantifiable: false, keySpec: true },
      { key: "gpu", label: "Đồ họa (GPU)", quantifiable: false, keySpec: true },
      { key: "ram", label: "RAM", quantifiable: true, higherIsBetter: true, keySpec: true },
      { key: "storage", label: "Lưu trữ (SSD / ROM)", quantifiable: true, higherIsBetter: true, keySpec: true },
      { key: "os", label: "Hệ điều hành", quantifiable: false, keySpec: false },
    ],
  },
  {
    id: "display",
    title: "Màn hình & Hiển thị",
    rows: [
      { key: "display", label: "Màn hình & Độ phân giải", quantifiable: false, keySpec: true },
      { key: "refreshRate", label: "Tần số quét", quantifiable: true, higherIsBetter: true, keySpec: true },
    ],
  },
  {
    id: "battery_connectivity",
    title: "Pin, Sạc & Kết nối",
    rows: [
      { key: "battery", label: "Dung lượng Pin", quantifiable: true, higherIsBetter: true, keySpec: true },
      { key: "fastCharge", label: "Công suất sạc", quantifiable: true, higherIsBetter: true, keySpec: false },
      { key: "connectivity", label: "Kết nối & Cổng", quantifiable: false, keySpec: false },
    ],
  },
  {
    id: "design_camera",
    title: "Camera, Thiết kế & Bảo hành",
    rows: [
      { key: "camera", label: "Hệ thống Camera", quantifiable: true, higherIsBetter: true, keySpec: true },
      { key: "weight", label: "Trọng lượng", quantifiable: true, higherIsBetter: false, keySpec: false },
      { key: "colors", label: "Tùy chọn màu sắc", quantifiable: false, keySpec: false },
      { key: "warranty", label: "Bảo hành", quantifiable: false, keySpec: false },
    ],
  },
];

const CORE_FIELDS_BY_ARCHETYPE = {
  laptop: ["cpu", "ram", "storage", "display", "battery", "gpu", "weight", "os"],
  smartphone: ["cpu", "ram", "storage", "display", "refreshRate", "battery", "camera", "os"],
  tablet: ["cpu", "ram", "storage", "display", "battery", "camera", "os"],
  monitor: ["display", "refreshRate", "connectivity"],
  audio: ["battery", "connectivity", "weight"],
  peripheral: ["connectivity", "battery", "weight"],
  smartwatch: ["display", "battery", "connectivity"],
  general: ["cpu", "ram", "storage", "display", "battery", "connectivity"],
};

const safeParseObject = (val) => {
  if (!val) return {};
  if (typeof val === "object" && !Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

const detectArchetype = (product, mergedRaw) => {
  const haystack = `${product?.category?.slug || ""} ${product?.category?.name || ""} ${product?.name || ""}`.toLowerCase();

  if (/(laptop|macbook|notebook|ultrabook|thinkpad|vivobook|zenbook|ideapad|rog|legion)/i.test(haystack)) {
    return "laptop";
  }
  if (/(điện thoại|smartphone|iphone|samsung galaxy s|galaxy z|pixel|xiaomi|oppo|vivo|realme)/i.test(haystack)) {
    return "smartphone";
  }
  if (/(máy tính bảng|tablet|ipad|galaxy tab)/i.test(haystack)) {
    return "tablet";
  }
  if (/(màn hình|monitor|ultrawide)/i.test(haystack)) {
    return "monitor";
  }
  if (/(tai nghe|loa|headphone|earphone|earbud|airpods|speaker|audio)/i.test(haystack)) {
    return "audio";
  }
  if (/(đồng hồ|smartwatch|apple watch|galaxy watch|band)/i.test(haystack)) {
    return "smartwatch";
  }
  if (/(bàn phím|chuột|keyboard|mouse|phụ kiện|keycap|dock|hub|webcam)/i.test(haystack)) {
    return "peripheral";
  }
  if (mergedRaw.gpu || /rtx|gtx|ryzen|core\s*i[3579]|core\s*ultra/i.test(haystack)) {
    return "laptop";
  }
  return "general";
};

const collectRawMap = (product) => {
  const rawEntries = [];
  const pushEntry = (key, value) => {
    if (value === undefined || value === null || value === "") return;
    const strVal =
      typeof value === "object" ? JSON.stringify(value) : String(value).trim();
    if (!strVal || strVal === "{}" || strVal === "[]") return;
    rawEntries.push({ key: String(key || "").trim().toLowerCase(), value: strVal });
  };

  if (Array.isArray(product?.attributes)) {
    for (const attr of product.attributes) {
      pushEntry(attr?.attribute?.code || attr?.attribute?.name || attr?.attributeName, attr?.value);
    }
  }

  const specs = safeParseObject(product?.specifications);
  for (const [k, v] of Object.entries(specs)) {
    pushEntry(k, v);
  }

  if (Array.isArray(product?.variants)) {
    for (const variant of product.variants) {
      if (variant?.isActive === false) continue;
      const vAttrVals = safeParseObject(variant.attributeValues);
      for (const [k, v] of Object.entries(vAttrVals)) {
        pushEntry(k, v);
      }
      const vSpecs = safeParseObject(variant.specifications);
      for (const [k, v] of Object.entries(vSpecs)) {
        pushEntry(k, v);
      }
      if (Array.isArray(variant.attributes)) {
        for (const vAttr of variant.attributes) {
          pushEntry(vAttr?.attribute?.code || vAttr?.attribute?.name, vAttr?.value);
        }
      }
    }
  }

  return rawEntries;
};

const findByKeys = (entries, keyPatterns) => {
  const matches = [];
  for (const entry of entries) {
    if (keyPatterns.some((re) => re.test(entry.key))) {
      matches.push(entry.value);
    }
  }
  return Array.from(new Set(matches));
};

const parseStorageGb = (text) => {
  if (!text) return null;
  const tbMatches = [...String(text).matchAll(/(\d+(?:\.\d+)?)\s*TB/gi)].map(
    (m) => Math.round(Number(m[1]) * 1024),
  );
  const gbMatches = [...String(text).matchAll(/(\d+(?:\.\d+)?)\s*GB/gi)].map(
    (m) => Math.round(Number(m[1])),
  );
  const all = [...tbMatches, ...gbMatches].filter((n) => n >= 16);
  if (all.length === 0) return null;
  return Math.max(...all);
};

const parseRamGb = (text) => {
  if (!text) return null;
  const gbMatches = [...String(text).matchAll(/(\d+(?:\.\d+)?)\s*GB/gi)]
    .map((m) => Math.round(Number(m[1])))
    .filter((n) => n > 0 && n <= 256);
  if (gbMatches.length === 0) return null;
  return Math.max(...gbMatches);
};

const parseWeightGrams = (text) => {
  if (!text) return null;
  const kgMatch = String(text).match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (kgMatch) {
    return Math.round(Number(kgMatch[1].replace(",", ".")) * 1000);
  }
  const gMatch = String(text).match(/(\d+(?:[.,]\d+)?)\s*g\b/i);
  if (gMatch) {
    return Math.round(Number(gMatch[1].replace(",", ".")));
  }
  return null;
};

const normalizeProductSpecs = (product) => {
  const rawEntries = collectRawMap(product);
  const textFallback = `${product?.name || ""} ${product?.description || ""}`;

  // CPU
  let cpuVals = findByKeys(rawEntries, [/^cpu$/, /chip/, /vi xử lý/, /processor/, /soc/]);
  if (cpuVals.length === 0) {
    const m = textFallback.match(
      /(Apple\s+M[1-4](?:\s+(?:Pro|Max|Ultra))?|Apple\s+A\d{2}(?:\s+Pro(?:\s+Max)?)?|Intel\s+Core\s+(?:Ultra\s+[579]|i[3579])(?:\s*-?\s*\d{3,5}[A-Z]{0,2})?|AMD\s+Ryzen\s+[3579](?:\s+\d{4}[A-Z]{0,2})?|Snapdragon\s+[678](?:\s+Gen\s+\d|\s+Elite)?|Dimensity\s+\d{3,4}[A-Z+]*)/i,
    );
    if (m) cpuVals = [m[1].trim()];
  }
  const cpuRaw = cpuVals[0] || null;

  // GPU
  let gpuVals = findByKeys(rawEntries, [/^gpu$/, /đồ họa/, /graphics/, /^vga$/]);
  if (gpuVals.length === 0) {
    const m = textFallback.match(
      /((?:NVIDIA\s+GeForce\s+)?RTX\s*\d{4}(?:\s*(?:Ti|Super))?|(?:AMD\s+)?Radeon\s+(?:RX\s*\d{4}[A-Z]*|\d+M)|Intel\s+(?:Arc|Iris\s+Xe))/i,
    );
    if (m) gpuVals = [m[1].trim()];
  }
  const gpuRaw = gpuVals[0] || null;

  // RAM
  let ramVals = findByKeys(rawEntries, [/^ram$/, /bộ nhớ\s*ram/, /^memory$/]);
  let ramNum = parseRamGb(ramVals.join(" "));
  if (ramNum == null) {
    const m = textFallback.match(/(?:RAM\s*(\d+)\s*GB|(\d+)\s*GB\s*RAM)/i);
    if (m) {
      ramNum = Number(m[1] || m[2]);
      ramVals = [`${ramNum}GB`];
    }
  }
  const ramRaw = ramVals.length > 0 ? ramVals.join(" / ") : null;

  // Storage
  let storageVals = findByKeys(rawEntries, [/^rom$/, /^ssd$/, /storage/, /lưu trữ/, /ổ cứng/, /dung lượng/]);
  let storageNum = parseStorageGb(storageVals.join(" "));
  if (storageNum == null) {
    const m = textFallback.match(/(?:SSD|ROM|NVMe)\s*(\d+(?:\.\d+)?\s*(?:TB|GB))|(\d+\s*TB)/i);
    if (m) {
      const token = (m[1] || m[2]).trim();
      storageNum = parseStorageGb(token);
      storageVals = [token];
    }
  }
  const storageRaw = storageVals.length > 0 ? storageVals.join(" / ") : null;

  // Display
  const displayVals = findByKeys(rawEntries, [/^screen$/, /^display$/, /màn hình/]);
  let displayRaw = displayVals[0] || null;
  if (!displayRaw) {
    const m = textFallback.match(/(\d{1,2}(?:[.,]\d)?\s*(?:inch|")(?:\s+(?:OLED|AMOLED|LTPO|Retina|IPS|Mini-?LED))?)/i);
    if (m) displayRaw = m[1].trim();
  }
  const displaySizeMatch = displayRaw ? String(displayRaw).match(/(\d{1,2}(?:[.,]\d)?)\s*(?:inch|")/i) : null;
  const displayNum = displaySizeMatch ? Number(displaySizeMatch[1].replace(",", ".")) : null;

  // Refresh Rate
  const hzVals = findByKeys(rawEntries, [/refresh_rate/, /tần số/, /refresh/]);
  let hzRaw = hzVals[0] || null;
  let hzNum = null;
  if (hzRaw) {
    const m = String(hzRaw).match(/(\d{2,3})/);
    if (m) hzNum = Number(m[1]);
  } else if (displayRaw) {
    const m = String(displayRaw).match(/(\d{2,3})\s*Hz/i);
    if (m) {
      hzNum = Number(m[1]);
      hzRaw = `${hzNum}Hz`;
    }
  } else {
    const m = textFallback.match(/(\d{2,3})\s*Hz/i);
    if (m) {
      hzNum = Number(m[1]);
      hzRaw = `${hzNum}Hz`;
    }
  }

  // Battery & Fast Charge
  let batteryVals = findByKeys(rawEntries, [/^battery$/, /^pin/, /dung lượng pin/]);
  let batteryRaw = batteryVals[0] || null;
  let batteryNum = null;
  let batteryUnit = null;
  if (!batteryRaw) {
    const m = textFallback.match(/(\d{3,5}\s*mAh|\d{2,3}(?:[.,]\d)?\s*Wh)/i);
    if (m) batteryRaw = m[1].trim();
  }
  if (batteryRaw) {
    const whM = String(batteryRaw).match(/(\d{2,3}(?:[.,]\d)?)\s*Wh/i);
    const mahM = String(batteryRaw).match(/(\d{3,5})\s*mAh/i);
    if (whM) {
      batteryNum = Number(whM[1].replace(",", "."));
      batteryUnit = "Wh";
    } else if (mahM) {
      batteryNum = Number(mahM[1]);
      batteryUnit = "mAh";
    }
  }

  let chargeVals = findByKeys(rawEntries, [/charge/, /sạc/]);
  let chargeRaw = chargeVals[0] || null;
  let chargeNum = null;
  if (!chargeRaw && batteryRaw) {
    const m = String(batteryRaw).match(/(\d{2,3})\s*W\b/i);
    if (m) chargeRaw = `${m[1]}W`;
  }
  if (!chargeRaw) {
    const m = textFallback.match(/(?:sạc\s*(?:nhanh)?\s*)(\d{2,3})\s*W\b/i);
    if (m) chargeRaw = `${m[1]}W`;
  }
  if (chargeRaw) {
    const m = String(chargeRaw).match(/(\d{2,3})/);
    if (m) chargeNum = Number(m[1]);
  }

  // Camera
  let cameraVals = findByKeys(rawEntries, [/^camera/, /máy ảnh/]);
  let cameraRaw = cameraVals[0] || null;
  if (!cameraRaw) {
    const m = textFallback.match(/Camera\s+(?:chính\s+)?(\d{2,3}\s*MP[^,.]*)/i);
    if (m) cameraRaw = m[1].trim();
  }
  let cameraNum = null;
  if (cameraRaw) {
    const mpMatches = [...String(cameraRaw).matchAll(/(\d{2,3})\s*MP/gi)].map((m) => Number(m[1]));
    if (mpMatches.length > 0) cameraNum = Math.max(...mpMatches);
  }

  // Connectivity
  let connVals = findByKeys(rawEntries, [/connectivity/, /kết nối/, /cổng/, /^port/, /wifi/, /bluetooth/]);
  let connRaw = connVals.length > 0 ? connVals.join(", ") : null;
  if (!connRaw) {
    const tokens = textFallback.match(/(?:Wi-?Fi\s*\d[E]?|Bluetooth\s*5\.\d|Thunderbolt\s*\d|USB-C|5G)/gi);
    if (tokens && tokens.length > 0) {
      connRaw = Array.from(new Set(tokens)).join(", ");
    }
  }

  // Weight
  let weightVals = findByKeys(rawEntries, [/^weight$/, /trọng lượng/, /khối lượng/]);
  let weightRaw = weightVals[0] || null;
  if (!weightRaw) {
    const m = textFallback.match(/(?:nặng|trọng lượng|khối lượng)\s*(\d+(?:[.,]\d+)?\s*(?:kg|g))/i);
    if (m) weightRaw = m[1].trim();
  }
  const weightNum = parseWeightGrams(weightRaw);

  // OS
  const osVals = findByKeys(rawEntries, [/^os$/, /hệ điều hành/]);
  let osRaw = osVals[0] || null;
  if (!osRaw) {
    const m = textFallback.match(/(Windows\s*1[01]|macOS(?:\s+[A-Za-z]+)?|iOS\s*\d*|iPadOS\s*\d*|Android\s*\d*)/i);
    if (m) osRaw = m[1].trim();
  }

  // Warranty
  const warrantyVals = findByKeys(rawEntries, [/warranty/, /bảo hành/]);
  const warrantyRaw = warrantyVals[0] || null;

  // Colors
  const colorVals = findByKeys(rawEntries, [/^color$/, /^màu/, /màu sắc/]);
  const colorsRaw =
    colorVals.length > 0
      ? Array.from(new Set(colorVals)).join(", ")
      : null;

  const archetype = detectArchetype(product, { gpu: gpuRaw });

  const fields = {
    cpu: { raw: cpuRaw, display: cpuRaw || "Đang cập nhật", numericValue: null, higherIsBetter: false },
    gpu: { raw: gpuRaw, display: gpuRaw || "Đang cập nhật", numericValue: null, higherIsBetter: false },
    ram: { raw: ramRaw, display: ramRaw || "Đang cập nhật", numericValue: ramNum, unit: "GB", higherIsBetter: true },
    storage: { raw: storageRaw, display: storageRaw || "Đang cập nhật", numericValue: storageNum, unit: "GB", higherIsBetter: true },
    display: { raw: displayRaw, display: displayRaw || "Đang cập nhật", numericValue: displayNum, unit: "inch", higherIsBetter: false },
    refreshRate: { raw: hzRaw, display: hzRaw || "Đang cập nhật", numericValue: hzNum, unit: "Hz", higherIsBetter: true },
    battery: { raw: batteryRaw, display: batteryRaw || "Đang cập nhật", numericValue: batteryNum, unit: batteryUnit || undefined, higherIsBetter: true },
    fastCharge: { raw: chargeRaw, display: chargeRaw || "Đang cập nhật", numericValue: chargeNum, unit: "W", higherIsBetter: true },
    camera: { raw: cameraRaw, display: cameraRaw || "Đang cập nhật", numericValue: cameraNum, unit: "MP", higherIsBetter: true },
    connectivity: { raw: connRaw, display: connRaw || "Đang cập nhật", numericValue: null, higherIsBetter: false },
    weight: { raw: weightRaw, display: weightRaw || "Đang cập nhật", numericValue: weightNum, unit: "g", higherIsBetter: false },
    os: { raw: osRaw, display: osRaw || "Đang cập nhật", numericValue: null, higherIsBetter: false },
    warranty: { raw: warrantyRaw, display: warrantyRaw || "Đang cập nhật", numericValue: null, higherIsBetter: false },
    colors: { raw: colorsRaw, display: colorsRaw || "Đang cập nhật", numericValue: null, higherIsBetter: false },
  };

  const coreKeys = CORE_FIELDS_BY_ARCHETYPE[archetype] || CORE_FIELDS_BY_ARCHETYPE.general;
  const filledCore = coreKeys.filter((k) => Boolean(fields[k]?.raw)).length;
  const coveragePct =
    coreKeys.length > 0 ? Math.round((filledCore / coreKeys.length) * 100) : 0;

  return {
    archetype,
    fields,
    coveragePct,
  };
};

module.exports = {
  SPEC_MATRIX_SECTIONS,
  CORE_FIELDS_BY_ARCHETYPE,
  normalizeProductSpecs,
  parseStorageGb,
  parseRamGb,
  parseWeightGrams,
};
