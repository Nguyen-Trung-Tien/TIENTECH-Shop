const db = require("./src/models");
const { Op } = require("sequelize");

async function test() {
  try {
    const allLuckyColors = ['Đen', 'Tím', 'Cam'];
    const colorConditions = allLuckyColors.map(color => `av.value LIKE '%${color.replace(/'/g, "''")}%'`).join(" OR ");
    const subquery = `(
      SELECT pav.productId 
      FROM ProductAttributeValues AS pav
      JOIN AttributeValues AS av ON pav.attributeValueId = av.id
      JOIN Attributes AS a ON av.attributeId = a.id
      WHERE a.code = 'color' AND (${colorConditions})
    )`;

    const products = await db.Product.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          ...allLuckyColors.map((color) => ({
            specifications: { [Op.like]: `%${color}%` },
          })),
          {
            id: {
              [Op.in]: db.sequelize.literal(subquery)
            }
          }
        ]
      },
      include: [
        {
          model: db.AttributeValue,
          as: 'attributes',
          include: [{ model: db.Attribute, as: 'attribute' }]
        }
      ],
      limit: 10
    });

    console.log(`Found ${products.length} products:`);
    for (const p of products) {
      const colorAttr = p.attributes?.find(a => a.attribute?.code === 'color')?.value;
      console.log(`- ID: ${p.id}, Name: ${p.name}, Color: ${colorAttr}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
