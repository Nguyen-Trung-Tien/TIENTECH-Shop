const { Op } = require("sequelize");
const db = require("../../models");
const { getCache, setCache } = require("../../config/redis");
const { generateContentWithFallback } = require("../../config/gemini");
const { applyFlashSaleToProduct } = require("../product/productHelper");
const {
  SPEC_MATRIX_SECTIONS,
  normalizeProductSpecs,
} = require("./SpecNormalizerService");
const { computeCompareBenchmarks } = require("./PerformanceScoringEngine");

const AXIS_LABELS = {
  performance: "Hiệu năng xử lý",
  display: "Chất lượng hiển thị",
  battery: "Thời lượng pin & sạc",
  cameraBuild: "Camera / Hoàn thiện",
  value: "Giá trị trên tầm giá",
};

const parseCompareIds = (idsInput) => {
  const rawList = Array.isArray(idsInput)
    ? idsInput
    : typeof idsInput === "string"
      ? idsInput.split(",")
      : [];

  const seen = new Set();
  const parsed = [];
  for (const raw of rawList) {
    const id = Number(String(raw).trim());
    if (Number.isInteger(id) && id > 0 && !seen.has(id)) {
      seen.add(id);
      parsed.push(id);
    }
  }
  return parsed;
};

const formatCurrencySimple = (amount) =>
  `${Number(amount || 0).toLocaleString("vi-VN")}đ`;

const buildMatrix = (productItems = []) => {
  return SPEC_MATRIX_SECTIONS.map((section) => {
    const rows = section.rows.map((rowDef) => {
      const valuesByProductId = {};
      const comparableTexts = [];
      let bestProductId = null;
      let bestNumVal = null;

      for (const item of productItems) {
        const pid = Number(item.id);
        let cell = { display: "Đang cập nhật", raw: null, numericValue: null };

        if (rowDef.key === "brand") {
          const val = item.brand?.name || null;
          cell = { display: val || "Đang cập nhật", raw: val, numericValue: null };
        } else if (rowDef.key === "category") {
          const val = item.category?.name || null;
          cell = { display: val || "Đang cập nhật", raw: val, numericValue: null };
        } else if (rowDef.key === "price") {
          const price = Number(item.displayPrice ?? item.basePrice ?? 0);
          cell = {
            display: price > 0 ? formatCurrencySimple(price) : "Liên hệ",
            raw: price,
            numericValue: price > 0 ? price : null,
          };
        } else if (rowDef.key === "rating") {
          const rating = Number(item.avgRating || 0);
          cell = {
            display: item.reviewCount > 0 ? `${rating.toFixed(1)} ★ (${item.reviewCount})` : "Chưa có đánh giá",
            raw: rating,
            numericValue: item.reviewCount > 0 ? rating : null,
          };
        } else if (rowDef.key === "stock") {
          const stock = Number(item.totalStock || 0);
          cell = {
            display: stock > 0 ? `Còn ${stock} SP` : "Tạm hết hàng",
            raw: stock,
            numericValue: stock,
          };
        } else if (rowDef.key === "specCoverage") {
          const cov = Number(item.specCoveragePct || 0);
          cell = {
            display: `${cov}%`,
            raw: cov,
            numericValue: cov,
          };
        } else {
          const normField = item.normalizedSpecs?.[rowDef.key];
          if (normField) {
            cell = {
              display: normField.display,
              raw: normField.raw,
              numericValue: normField.numericValue,
            };
          }
        }

        valuesByProductId[pid] = cell;
        comparableTexts.push(String(cell.display || "").trim().toLowerCase());

        if (rowDef.quantifiable && productItems.length >= 2 && cell.numericValue != null) {
          const higherBetter = rowDef.higherIsBetter !== false;
          if (
            bestNumVal === null ||
            (higherBetter ? cell.numericValue > bestNumVal : cell.numericValue < bestNumVal)
          ) {
            bestNumVal = cell.numericValue;
            bestProductId = pid;
          }
        }
      }

      const isDifferent =
        productItems.length >= 2 && new Set(comparableTexts).size > 1;

      if (bestProductId !== null) {
        const allEqualNum = productItems.every(
          (p) => valuesByProductId[p.id]?.numericValue === bestNumVal,
        );
        if (allEqualNum) bestProductId = null;
      }

      return {
        key: rowDef.key,
        label: rowDef.label,
        keySpec: Boolean(rowDef.keySpec),
        quantifiable: Boolean(rowDef.quantifiable),
        higherIsBetter: rowDef.higherIsBetter,
        isDifferent,
        bestProductId,
        valuesByProductId,
      };
    });

    return {
      id: section.id,
      title: section.title,
      rows,
    };
  });
};

const compareProducts = async (idsInput) => {
  try {
    const ids = parseCompareIds(idsInput);
    if (ids.length === 0) {
      return {
        errCode: 400,
        statusCode: 400,
        errMessage: "Vui lòng chọn ít nhất 1 sản phẩm để so sánh.",
      };
    }
    if (ids.length > 4) {
      return {
        errCode: 400,
        statusCode: 400,
        errMessage: "Chỉ hỗ trợ so sánh tối đa 4 sản phẩm cùng lúc.",
      };
    }

    const rows = await db.Product.findAll({
      where: {
        id: { [Op.in]: ids },
        isActive: true,
      },
      attributes: { exclude: ["embedding"] },
      include: [
        { model: db.Brand, as: "brand", attributes: ["id", "name", "slug"], required: false },
        { model: db.Category, as: "category", attributes: ["id", "name", "slug"], required: false },
        { model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"], required: false },
        {
          model: db.AttributeValue,
          as: "attributes",
          attributes: ["id", "value"],
          include: [
            { model: db.Attribute, as: "attribute", attributes: ["id", "name", "code"], required: false },
          ],
          required: false,
        },
        {
          model: db.ProductVariant,
          as: "variants",
          attributes: ["id", "sku", "price", "discount", "stock", "attributeValues", "specifications", "isActive"],
          include: [
            {
              model: db.AttributeValue,
              as: "attributes",
              attributes: ["id", "value"],
              include: [{ model: db.Attribute, as: "attribute", attributes: ["id", "name", "code"], required: false }],
              required: false,
            },
          ],
          where: { isActive: true },
          required: false,
        },
        {
          model: db.Review,
          as: "reviews",
          attributes: ["id", "rating"],
          required: false,
        },
      ],
    });

    if (!rows || rows.length === 0) {
      return {
        errCode: 404,
        statusCode: 404,
        errMessage: "Không tìm thấy sản phẩm khả dụng để so sánh.",
      };
    }

    const rowMap = new Map(
      rows.map((r) => {
        const plain = typeof r.toJSON === "function" ? r.toJSON() : { ...r };
        return [Number(plain.id), plain];
      }),
    );

    const orderedRaw = ids.map((id) => rowMap.get(id)).filter(Boolean);

    const normalizedPairs = orderedRaw.map((plain) => {
      const primary =
        plain.images?.find((img) => img.isPrimary)?.imageUrl ||
        plain.images?.[0]?.imageUrl ||
        null;
      const reviewList = Array.isArray(plain.reviews) ? plain.reviews : [];
      const reviewCount = reviewList.length;
      const avgRating =
        reviewCount > 0
          ? Number(
              (
                reviewList.reduce((sum, rev) => sum + Number(rev.rating || 0), 0) /
                reviewCount
              ).toFixed(1),
            )
          : 0;

      const withPricing = applyFlashSaleToProduct({
        ...plain,
        image: primary,
        avgRating,
        reviewCount,
      });

      const normalized = normalizeProductSpecs(plain);
      return {
        product: withPricing,
        normalized,
      };
    });

    const { benchmarksByProductId, winners } = computeCompareBenchmarks(normalizedPairs);

    const formattedProducts = normalizedPairs.map(({ product, normalized }) => ({
      id: Number(product.id),
      name: product.name,
      slug: product.slug,
      sku: product.sku || `TT-${product.id}`,
      image: product.image || null,
      brand: product.brand || null,
      category: product.category || null,
      basePrice: Number(product.basePrice || 0),
      displayPrice: Number(product.displayPrice ?? product.basePrice ?? 0),
      discountPercent: Number(product.discountPercent ?? product.discount ?? 0),
      flashSaleActive: Boolean(product.flashSaleActive),
      totalStock: Number(product.totalStock ?? 0),
      sold: Number(product.sold ?? 0),
      avgRating: product.avgRating,
      reviewCount: product.reviewCount,
      archetype: normalized.archetype,
      specCoveragePct: normalized.coveragePct,
      normalizedSpecs: normalized.fields,
      benchmark: benchmarksByProductId[Number(product.id)],
    }));

    const matrix = buildMatrix(formattedProducts);

    const categoryIds = new Set(
      formattedProducts.map((p) => p.category?.id).filter(Boolean),
    );
    const categoryMismatchWarning =
      categoryIds.size > 1
        ? "Các sản phẩm đang thuộc nhiều danh mục khác nhau; một số thông số chuyên biệt có thể không tương đồng trực tiếp."
        : null;

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        products: formattedProducts,
        matrix,
        benchmarks: benchmarksByProductId,
        winners,
        categoryMismatchWarning,
      },
    };
  } catch (error) {
    console.error("[CompareService.compareProducts] Error:", error);
    return {
      errCode: -1,
      statusCode: 500,
      errMessage: "Lỗi hệ thống khi phân tích so sánh sản phẩm.",
    };
  }
};

const USE_CASE_LABELS = {
  general: "Sử dụng đa năng hằng ngày",
  gaming: "Chơi game & Đồ họa nặng",
  office: "Văn phòng & Doanh nhân di động",
  creative: "Sáng tạo nội dung & Dựng phim",
  student: "Học tập, Sinh viên & Tiết kiệm",
  battery: "Ưu tiên pin bền bỉ cả ngày",
};

const buildDeterministicVerdict = (compareData, useCase = "general") => {
  const { products, benchmarks, winners, categoryMismatchWarning } = compareData;
  const byId = new Map(products.map((p) => [Number(p.id), p]));

  const pickByUseCase = () => {
    if (useCase === "gaming" || useCase === "creative") {
      return byId.get(winners.performance) || products[0];
    }
    if (useCase === "battery") {
      return byId.get(winners.battery) || products[0];
    }
    if (useCase === "student") {
      return byId.get(winners.bestValue) || products[0];
    }
    return byId.get(winners.overall) || products[0];
  };

  const recommended = pickByUseCase();
  const perfWinner = byId.get(winners.performance) || products[0];
  const battWinner = byId.get(winners.battery) || products[0];
  const valueWinner = byId.get(winners.bestValue) || products[0];

  const prosConsByProduct = {};
  for (const prod of products) {
    const scoreObj = benchmarks[prod.id] || {};
    const axes = Object.entries(AXIS_LABELS)
      .map(([axisKey, label]) => ({
        axisKey,
        label,
        score: Number(scoreObj[axisKey] || 0),
      }))
      .sort((a, b) => b.score - a.score);

    const pros = axes.slice(0, 2).map((a) => `${a.label} nổi bật (${a.score}/100)`);
    if (prod.specCoveragePct >= 60) {
      pros.push(`Thông số minh bạch (${prod.specCoveragePct}%)`);
    }

    const weakest = axes[axes.length - 1];
    const cons = [`${weakest.label} kém cạnh hơn đối thủ (${weakest.score}/100)`];
    if (prod.displayPrice > valueWinner.displayPrice * 1.15) {
      cons.push("Chi phí đầu tư cao hơn các lựa chọn cùng nhóm");
    }
    prosConsByProduct[prod.id] = { pros, cons };
  }

  const minCoverage = Math.min(...products.map((p) => p.specCoveragePct || 0));
  const noteParts = [];
  if (categoryMismatchWarning) noteParts.push(categoryMismatchWarning);
  if (minCoverage < 40) {
    noteParts.push(
      "Một số sản phẩm chưa cập nhật đầy đủ thông số gốc; điểm số dựa trên dữ liệu khả dụng hiện tại.",
    );
  }

  return {
    winnerId: recommended.id,
    headline: `${recommended.name} phù hợp nhất cho nhu cầu ${USE_CASE_LABELS[useCase] || USE_CASE_LABELS.general}`,
    summary: `Dựa trên đối chiếu thông số thực tế và điểm benchmark 5 trục, ${recommended.name} đạt ${benchmarks[recommended.id]?.overallScore || 0}/100 điểm tổng hợp với mức giá ${formatCurrencySimple(recommended.displayPrice)}.`,
    useCaseRecommendations: [
      {
        useCase: USE_CASE_LABELS[useCase] || "Nhu cầu đã chọn",
        recommendedProductId: recommended.id,
        reason: `Dẫn đầu tiêu chí trọng tâm (${benchmarks[recommended.id]?.overallScore || 0}/100 điểm tổng).`,
      },
      {
        useCase: "Hiệu năng & Xử lý tối đa",
        recommendedProductId: perfWinner.id,
        reason: `Điểm hiệu năng cao nhất nhóm (${benchmarks[perfWinner.id]?.performance || 0}/100).`,
      },
      {
        useCase: "Pin bền bỉ & Di động",
        recommendedProductId: battWinner.id,
        reason: `Điểm pin đạt ${benchmarks[battWinner.id]?.battery || 0}/100.`,
      },
      {
        useCase: "Tối ưu ngân sách (P/P)",
        recommendedProductId: valueWinner.id,
        reason: `Cân bằng hiệu năng và giá bán ${formatCurrencySimple(valueWinner.displayPrice)} (${benchmarks[valueWinner.id]?.value || 0}/100 điểm giá trị).`,
      },
    ],
    prosConsByProduct,
    note: noteParts.join(" ") || null,
    source: "deterministic_engine",
  };
};

const safeExtractJson = (text) => {
  try {
    const str = String(text || "");
    const match = str.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : str);
  } catch {
    return null;
  }
};

const getCompareAiVerdict = async (productIdsInput, useCase = "general") => {
  const ids = parseCompareIds(productIdsInput);
  if (ids.length < 2 || ids.length > 4) {
    return {
      errCode: 400,
      statusCode: 400,
      errMessage: "Cần chọn từ 2 đến 4 sản phẩm hợp lệ để AI phân tích.",
    };
  }

  const cacheKey = `compare_ai_verdict:${[...ids].sort((a, b) => a - b).join("_")}:${useCase}`;
  const cached = await getCache(cacheKey);
  if (cached && cached.winnerId) {
    return { errCode: 0, errMessage: "OK", data: cached };
  }

  const compareRes = await compareProducts(ids);
  if (compareRes.errCode !== 0 || !compareRes.data) {
    return compareRes;
  }
  if ((compareRes.data.products || []).length < 2) {
    return {
      errCode: 400,
      statusCode: 400,
      errMessage: "Cần ít nhất 2 sản phẩm khả dụng để AI đưa ra nhận định.",
    };
  }

  const fallback = buildDeterministicVerdict(compareRes.data, useCase);
  const validIdSet = new Set(compareRes.data.products.map((p) => Number(p.id)));

  const compactContext = compareRes.data.products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.name,
    priceVND: p.displayPrice,
    avgRating: p.avgRating,
    benchmark: p.benchmark,
    specs: {
      cpu: p.normalizedSpecs?.cpu?.display,
      gpu: p.normalizedSpecs?.gpu?.display,
      ram: p.normalizedSpecs?.ram?.display,
      storage: p.normalizedSpecs?.storage?.display,
      display: p.normalizedSpecs?.display?.display,
      refreshRate: p.normalizedSpecs?.refreshRate?.display,
      battery: p.normalizedSpecs?.battery?.display,
      camera: p.normalizedSpecs?.camera?.display,
      weight: p.normalizedSpecs?.weight?.display,
    },
  }));

  const systemInstruction = `Bạn là chuyên gia đánh giá phần cứng công nghệ của TIENTECH Shop.
Phân tích danh sách sản phẩm và điểm benchmark được cung cấp để tư vấn cho nhu cầu: "${USE_CASE_LABELS[useCase] || useCase}".
Chỉ sử dụng ID sản phẩm có thật trong dữ liệu đầu vào, không bịa đặt thông số ngoài dữ liệu.
Trả về JSON thuần đúng cấu trúc:
{
  "headline": "Tiêu đề kết luận ngắn gọn",
  "winnerId": number,
  "summary": "Nhận xét tổng quan 2-3 câu",
  "useCaseRecommendations": [{ "useCase": "Tên tình huống", "recommendedProductId": number, "reason": "Lý do ngắn gọn" }],
  "prosConsByProduct": { "<id>": { "pros": ["điểm mạnh 1", "điểm mạnh 2"], "cons": ["hạn chế 1"] } },
  "note": "Lưu ý thêm hoặc null"
}`;

  try {
    const aiRes = await generateContentWithFallback(
      {
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify(compactContext) }],
          },
        ],
      },
      {
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      },
    );

    const parsed = safeExtractJson(aiRes?.response?.text?.());
    if (parsed && typeof parsed === "object" && parsed.headline && parsed.summary) {
      const winnerId = validIdSet.has(Number(parsed.winnerId))
        ? Number(parsed.winnerId)
        : fallback.winnerId;

      const verdict = {
        winnerId,
        headline: String(parsed.headline),
        summary: String(parsed.summary),
        useCaseRecommendations:
          Array.isArray(parsed.useCaseRecommendations) &&
          parsed.useCaseRecommendations.length > 0
            ? parsed.useCaseRecommendations.map((rec) => ({
                useCase: String(rec.useCase || ""),
                recommendedProductId: validIdSet.has(Number(rec.recommendedProductId))
                  ? Number(rec.recommendedProductId)
                  : winnerId,
                reason: String(rec.reason || ""),
              }))
            : fallback.useCaseRecommendations,
        prosConsByProduct:
          parsed.prosConsByProduct && typeof parsed.prosConsByProduct === "object"
            ? {
                ...fallback.prosConsByProduct,
                ...parsed.prosConsByProduct,
              }
            : fallback.prosConsByProduct,
        note: parsed.note || fallback.note,
        source: "gemini_ai",
      };

      await setCache(cacheKey, verdict, 1800);
      return { errCode: 0, errMessage: "OK", data: verdict };
    }
  } catch (aiErr) {
    console.warn("[CompareService.getCompareAiVerdict] AI fallback:", aiErr?.message);
  }

  return {
    errCode: 0,
    errMessage: "OK",
    data: fallback,
  };
};

module.exports = {
  parseCompareIds,
  compareProducts,
  getCompareAiVerdict,
};
