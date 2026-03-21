const db = require("./src/models");
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const updateSlugs = async () => {
  try {
    const products = await db.Product.findAll();
    console.log(`Found ${products.length} products. Updating slugs...`);
    
    for (const product of products) {
      if (!product.slug) {
        const newSlug = `${slugify(product.name)}-${product.id}`;
        await product.update({ slug: newSlug });
        console.log(`Updated product ${product.id}: ${newSlug}`);
      }
    }
    console.log("Slug update complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating slugs:", error);
    process.exit(1);
  }
};

updateSlugs();
