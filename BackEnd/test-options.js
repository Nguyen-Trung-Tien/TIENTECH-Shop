const db = require("./src/models");

async function run() {
  try {
    const product = await db.Product.findOne({
      where: { slug: "pc-gaming-intel-core-i5-12400f-rtx-3060-12g-1740033190802" } || {},
      include: [
        {
          model: db.ProductOption,
          as: "options",
          include: [{ model: db.ProductOptionValue, as: "values" }],
        },
        {
          model: db.ProductVariant,
          as: "variants",
          include: [{ model: db.ProductOptionValue, as: "optionValues" }],
        },
      ],
    });
    
    if (product) {
      console.log(JSON.stringify(product.toJSON(), null, 2).substring(0, 1500));
    } else {
      console.log("No product found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
