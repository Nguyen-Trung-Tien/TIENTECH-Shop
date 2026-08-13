const { z } = require("zod");

const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Tên sản phẩm không được để trống" })
      .min(1, "Tên sản phẩm không được để trống"),
    brandId: z.union([z.string(), z.number()]).optional(),
    categoryId: z.union([z.string(), z.number()]).optional(),
    basePrice: z.union([z.string(), z.number()]).optional(),
    price: z.union([z.string(), z.number()]).optional(),
    stock: z.union([z.string(), z.number()]).optional(),
    description: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).optional(),
    hasVariants: z.union([z.boolean(), z.string()]).optional(),
    isFlashSale: z.union([z.boolean(), z.string()]).optional(),
    flashSalePrice: z.union([z.string(), z.number()]).optional(),
    flashSaleStart: z.string().optional(),
    flashSaleEnd: z.string().optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống").optional(),
    brandId: z.union([z.string(), z.number()]).optional(),
    categoryId: z.union([z.string(), z.number()]).optional(),
    basePrice: z.union([z.string(), z.number()]).optional(),
    price: z.union([z.string(), z.number()]).optional(),
    stock: z.union([z.string(), z.number()]).optional(),
    description: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).optional(),
    hasVariants: z.union([z.boolean(), z.string()]).optional(),
    isFlashSale: z.union([z.boolean(), z.string()]).optional(),
    flashSalePrice: z.union([z.string(), z.number()]).optional(),
    flashSaleStart: z.string().optional(),
    flashSaleEnd: z.string().optional(),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
