const clampScore = (val) => Math.max(0, Math.min(100, Math.round(val)));

const scoreCpu = (rawCpu) => {
  if (!rawCpu) return 45;
  const s = String(rawCpu).toLowerCase();
  if (/m4\s*(max|ultra)/.test(s)) return 98;
  if (/m4\s*pro/.test(s)) return 94;
  if (/\bm4\b/.test(s)) return 89;
  if (/m3\s*(max|ultra)/.test(s)) return 94;
  if (/m3\s*pro/.test(s)) return 89;
  if (/\bm3\b/.test(s)) return 84;
  if (/m2\s*(max|pro)/.test(s)) return 85;
  if (/\bm2\b/.test(s)) return 79;
  if (/\bm1\b/.test(s)) return 72;

  if (/a19\s*pro/.test(s)) return 95;
  if (/a18\s*pro/.test(s)) return 91;
  if (/\ba18\b/.test(s)) return 86;
  if (/a17\s*pro/.test(s)) return 84;
  if (/\ba16\b/.test(s)) return 78;
  if (/\ba15\b/.test(s)) return 72;

  if (/core\s*ultra\s*9/.test(s)) return 92;
  if (/core\s*ultra\s*7/.test(s)) return 85;
  if (/core\s*ultra\s*5/.test(s)) return 77;
  if (/core\s*i9|i9[-\s]/.test(s)) return 91;
  if (/core\s*i7|i7[-\s]/.test(s)) return 82;
  if (/core\s*i5|i5[-\s]/.test(s)) return 72;
  if (/core\s*i3|i3[-\s]/.test(s)) return 58;

  if (/ryzen\s*9/.test(s)) return 91;
  if (/ryzen\s*7/.test(s)) return 83;
  if (/ryzen\s*5/.test(s)) return 73;
  if (/ryzen\s*3/.test(s)) return 59;

  if (/snapdragon\s*8\s*elite/.test(s)) return 92;
  if (/snapdragon\s*8\s*gen\s*3/.test(s)) return 88;
  if (/snapdragon\s*8\s*gen\s*2/.test(s)) return 81;
  if (/snapdragon\s*8s\s*gen\s*3/.test(s)) return 79;
  if (/snapdragon\s*8/.test(s)) return 76;
  if (/snapdragon\s*7/.test(s)) return 70;
  if (/snapdragon\s*6/.test(s)) return 58;

  if (/dimensity\s*9400/.test(s)) return 91;
  if (/dimensity\s*9300/.test(s)) return 86;
  if (/dimensity\s*9200/.test(s)) return 81;
  if (/dimensity\s*8300/.test(s)) return 76;
  if (/dimensity\s*8/.test(s)) return 72;
  return 60;
};

const scoreGpu = (rawGpu) => {
  if (!rawGpu) return null;
  const s = String(rawGpu).toLowerCase();
  if (/rtx\s*5090|rtx\s*4090/.test(s)) return 99;
  if (/rtx\s*4080/.test(s)) return 94;
  if (/rtx\s*4070/.test(s)) return 87;
  if (/rtx\s*4060|rtx\s*3070/.test(s)) return 80;
  if (/rtx\s*4050|rtx\s*3060/.test(s)) return 72;
  if (/rtx\s*3050|rtx\s*2050/.test(s)) return 64;
  if (/rx\s*7\d{3}/.test(s)) return 82;
  if (/apple|m[1-4]\s*gpu/.test(s)) return 80;
  if (/arc|iris|radeon|adreno/.test(s)) return 55;
  return 60;
};

const scoreRam = (gb) => {
  if (gb == null) return 45;
  if (gb >= 64) return 98;
  if (gb >= 32) return 90;
  if (gb >= 24) return 85;
  if (gb >= 16) return 78;
  if (gb >= 12) return 72;
  if (gb >= 8) return 62;
  if (gb >= 6) return 54;
  return 44;
};

const scoreStorage = (gb) => {
  if (gb == null) return 45;
  if (gb >= 2048) return 96;
  if (gb >= 1024) return 88;
  if (gb >= 512) return 76;
  if (gb >= 256) return 64;
  if (gb >= 128) return 52;
  return 42;
};

const scoreDisplay = (fields) => {
  const dispText = String(fields?.display?.raw || "").toLowerCase();
  const hz = fields?.refreshRate?.numericValue;

  if (!dispText && !hz) return 45;

  let score = 45;
  if (/ltpo|mini-?led|tandem\s*oled|super\s*retina|xdr/.test(dispText)) {
    score += 22;
  } else if (/oled|amoled|retina|liquid\s*retina/.test(dispText)) {
    score += 18;
  } else if (/qled|ips|va|lcd/.test(dispText)) {
    score += 10;
  } else if (dispText) {
    score += 6;
  }

  if (/4k|uhd|3840|retina\s*5k|6k/.test(dispText)) score += 15;
  else if (/2k|qhd|1440|2\.8k|3k|2560|1\.5k/.test(dispText)) score += 12;
  else if (/fhd|1080|1920/.test(dispText)) score += 7;

  if (hz != null) {
    if (hz >= 240) score += 20;
    else if (hz >= 165) score += 17;
    else if (hz >= 144) score += 15;
    else if (hz >= 120) score += 14;
    else if (hz >= 90) score += 8;
    else score += 3;
  }

  return clampScore(score);
};

const scoreBattery = (fields) => {
  const val = fields?.battery?.numericValue;
  const unit = fields?.battery?.unit;
  const chargeW = fields?.fastCharge?.numericValue;

  if (val == null && chargeW == null) return 50;

  let score = 50;
  if (unit === "Wh" && val != null) {
    if (val >= 90) score = 90;
    else if (val >= 70) score = 82;
    else if (val >= 55) score = 70;
    else if (val >= 45) score = 60;
    else score = 52;
  } else if (unit === "mAh" && val != null) {
    if (val >= 6000) score = 92;
    else if (val >= 5000) score = 84;
    else if (val >= 4500) score = 75;
    else if (val >= 4000) score = 66;
    else if (val >= 3000) score = 56;
    else score = 48;
  }

  if (chargeW != null) {
    if (chargeW >= 100) score += 10;
    else if (chargeW >= 65) score += 7;
    else if (chargeW >= 30) score += 4;
    else if (chargeW >= 18) score += 2;
  }

  return clampScore(score);
};

const scoreCameraBuild = (product, normalized) => {
  const { archetype, fields } = normalized;
  const desc = `${product?.name || ""} ${product?.description || ""} ${fields?.connectivity?.raw || ""}`.toLowerCase();

  if (archetype === "smartphone" || archetype === "tablet") {
    const mp = fields?.camera?.numericValue;
    const camText = String(fields?.camera?.raw || "").toLowerCase();
    let score = mp == null ? 50 : mp >= 200 ? 90 : mp >= 108 ? 84 : mp >= 48 ? 77 : mp >= 12 ? 68 : 56;
    if (/ois|tele|periscope|leica|zeiss|hasselblad|proraw/.test(`${camText} ${desc}`)) {
      score += 8;
    }
    if (fields?.weight?.numericValue != null && fields.weight.numericValue <= 195) {
      score += 4;
    }
    return clampScore(score);
  }

  let score = 55;
  const weightGrams = fields?.weight?.numericValue;
  if (weightGrams != null && archetype === "laptop") {
    if (weightGrams <= 1300) score += 18;
    else if (weightGrams <= 1650) score += 12;
    else if (weightGrams <= 2100) score += 6;
  } else if (weightGrams != null && weightGrams <= 300) {
    score += 12;
  }

  if (/nhôm|aluminum|aluminium|titanium|magnesium|cnc|kim loại|carbon|unibody/.test(desc)) {
    score += 12;
  }
  if (/thunderbolt|usb4|wi-?fi\s*7|bluetooth\s*5\.[34]/.test(desc)) {
    score += 10;
  } else if (fields?.connectivity?.raw) {
    score += 5;
  }

  return clampScore(score);
};

const ARCHETYPE_WEIGHTS = {
  laptop: { performance: 0.34, display: 0.2, battery: 0.16, cameraBuild: 0.14, value: 0.16 },
  smartphone: { performance: 0.26, display: 0.22, battery: 0.2, cameraBuild: 0.18, value: 0.14 },
  tablet: { performance: 0.26, display: 0.24, battery: 0.2, cameraBuild: 0.16, value: 0.14 },
  monitor: { performance: 0.12, display: 0.48, battery: 0.04, cameraBuild: 0.16, value: 0.2 },
  audio: { performance: 0.14, display: 0.08, battery: 0.32, cameraBuild: 0.26, value: 0.2 },
  general: { performance: 0.28, display: 0.2, battery: 0.18, cameraBuild: 0.16, value: 0.18 },
};

const computeCompareBenchmarks = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { benchmarksByProductId: {}, winners: {} };
  }

  const prelim = items.map(({ product, normalized }) => {
    const { fields, archetype } = normalized;
    const cpuScore = scoreCpu(fields?.cpu?.raw);
    const gpuScore = scoreGpu(fields?.gpu?.raw);
    const ramScore = scoreRam(fields?.ram?.numericValue);
    const storageScore = scoreStorage(fields?.storage?.numericValue);

    const perf =
      gpuScore != null
        ? clampScore(0.4 * cpuScore + 0.25 * gpuScore + 0.2 * ramScore + 0.15 * storageScore)
        : clampScore(0.5 * cpuScore + 0.3 * ramScore + 0.2 * storageScore);
    const disp = scoreDisplay(fields);
    const batt = scoreBattery(fields);
    const cam = scoreCameraBuild(product, normalized);

    const rawPerfAvg = (perf + disp + batt + cam) / 4;
    const effectivePrice = Math.max(
      100000,
      Number(product?.displayPrice ?? product?.price ?? product?.basePrice ?? 0) || 1000000,
    );
    const priceMillions = Math.max(0.5, effectivePrice / 1_000_000);
    const rawEfficiency = rawPerfAvg / Math.sqrt(priceMillions);

    return {
      productId: Number(product.id),
      product,
      archetype,
      performance: perf,
      display: disp,
      battery: batt,
      cameraBuild: cam,
      rawEfficiency,
      effectivePrice,
    };
  });

  const maxEfficiency = Math.max(...prelim.map((p) => p.rawEfficiency), 1);
  const benchmarksByProductId = {};

  for (const item of prelim) {
    const relScore = 70 * (item.rawEfficiency / maxEfficiency) + 15;
    const avgRating = Number(item.product?.avgRating || 0);
    const ratingBonus = avgRating >= 4.5 ? 10 : avgRating >= 4.0 ? 6 : avgRating > 0 ? 3 : 5;
    const discountPct = Number(item.product?.discountPercent ?? item.product?.discount ?? 0);
    const discountBonus = Math.min(5, Math.max(0, discountPct / 5));

    const value = clampScore(Math.max(25, relScore + ratingBonus + discountBonus));
    const w = ARCHETYPE_WEIGHTS[item.archetype] || ARCHETYPE_WEIGHTS.general;
    const overallScore = clampScore(
      w.performance * item.performance +
        w.display * item.display +
        w.battery * item.battery +
        w.cameraBuild * item.cameraBuild +
        w.value * value,
    );

    benchmarksByProductId[item.productId] = {
      performance: item.performance,
      display: item.display,
      battery: item.battery,
      cameraBuild: item.cameraBuild,
      value,
      overallScore,
    };
  }

  const pickWinner = (metric) => {
    let bestId = null;
    let bestVal = -1;
    let bestOverall = -1;
    for (const item of prelim) {
      const b = benchmarksByProductId[item.productId];
      const val = b[metric];
      if (
        val > bestVal ||
        (val === bestVal && b.overallScore > bestOverall)
      ) {
        bestVal = val;
        bestOverall = b.overallScore;
        bestId = item.productId;
      }
    }
    return bestId;
  };

  const winners = {
    performance: pickWinner("performance"),
    display: pickWinner("display"),
    battery: pickWinner("battery"),
    cameraBuild: pickWinner("cameraBuild"),
    value: pickWinner("value"),
    overall: pickWinner("overallScore"),
    bestValue: pickWinner("value"),
  };

  return { benchmarksByProductId, winners };
};

module.exports = {
  scoreCpu,
  scoreGpu,
  scoreRam,
  scoreStorage,
  scoreDisplay,
  scoreBattery,
  scoreCameraBuild,
  computeCompareBenchmarks,
};
