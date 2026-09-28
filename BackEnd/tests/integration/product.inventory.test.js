const ProductService = require("../../src/services/product/ProductService");
const db = require("../../src/models");

describe("Product Inventory Without Variants Tests", () => {
  let createdProductId;

  afterAll(async () => {
    if (createdProductId) {
      await db.ProductVariant.destroy({ where: { productId: createdProductId } });
      await db.Product.destroy({ where: { id: createdProductId } });
    }
  });

  test("createProduct: correctly sets totalStock and hasVariants=false when variants disabled", async () => {
    const timestamp = Date.now();
    const result = await ProductService.createProduct({
      name: `Simple Laptop ${timestamp}`,
      sku: `SKU-SIMPLE-${timestamp}`,
      basePrice: 15000000,
      stock: 35,
      hasVariants: false,
      variants: [],
    });

    expect(result.errCode).toBe(0);
    expect(result.product).toBeDefined();
    createdProductId = result.product.id;

    const savedProduct = await db.Product.findByPk(createdProductId);
    expect(savedProduct).toBeDefined();
    expect(savedProduct.hasVariants).toBe(false);
    expect(savedProduct.totalStock).toBe(35);

    const variantsInDb = await db.ProductVariant.findAll({ where: { productId: createdProductId } });
    expect(variantsInDb.length).toBe(0);
  });

  test("updateProduct: correctly updates totalStock when hasVariants=false", async () => {
    expect(createdProductId).toBeDefined();

    const updateRes = await ProductService.updateProduct(createdProductId, {
      stock: 88,
      hasVariants: false,
      variants: [],
    });

    expect(updateRes.errCode).toBe(0);
    expect(updateRes.product.totalStock).toBe(88);

    const refreshedProduct = await db.Product.findByPk(createdProductId);
    expect(refreshedProduct.totalStock).toBe(88);
    expect(refreshedProduct.hasVariants).toBe(false);
  });

  test("updateProduct: toggling hasVariants from true to false removes old variants and updates totalStock", async () => {
    const timestamp = Date.now();
    // First, create a product with variants
    const productWithVariantsRes = await ProductService.createProduct({
      name: `Variant Phone ${timestamp}`,
      sku: `SKU-VAR-${timestamp}`,
      basePrice: 20000000,
      hasVariants: true,
      variants: [
        { sku: `VAR-A-${timestamp}`, price: 20000000, stock: 10 },
        { sku: `VAR-B-${timestamp}`, price: 22000000, stock: 15 },
      ],
    });

    expect(productWithVariantsRes.errCode).toBe(0);
    const varProdId = productWithVariantsRes.product.id;

    let varProd = await db.Product.findByPk(varProdId);
    expect(varProd.hasVariants).toBe(true);
    expect(varProd.totalStock).toBe(25);

    const initialVariants = await db.ProductVariant.findAll({ where: { productId: varProdId } });
    expect(initialVariants.length).toBe(2);

    // Now update: turn OFF variants and set stock to 50
    const updateNoVarRes = await ProductService.updateProduct(varProdId, {
      hasVariants: false,
      stock: 50,
      variants: [],
    });

    expect(updateNoVarRes.errCode).toBe(0);
    expect(updateNoVarRes.product.totalStock).toBe(50);
    expect(updateNoVarRes.product.hasVariants).toBe(false);

    const refreshedVarProd = await db.Product.findByPk(varProdId);
    expect(refreshedVarProd.hasVariants).toBe(false);
    expect(refreshedVarProd.totalStock).toBe(50);

    const remainingVariants = await db.ProductVariant.findAll({ where: { productId: varProdId } });
    expect(remainingVariants.length).toBe(0);

    // Clean up
    await db.Product.destroy({ where: { id: varProdId } });
  });

  test("getProductBySlug: returns correct totalStock for product without variants", async () => {
    const product = await db.Product.findByPk(createdProductId);
    expect(product).toBeDefined();

    const slugRes = await ProductService.getProductBySlug(product.slug);
    expect(slugRes.errCode).toBe(0);
    expect(slugRes.product).toBeDefined();
    expect(slugRes.product.totalStock).toBe(88);
  });
});
