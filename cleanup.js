const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDir = 'D:\\LEARN\\Project-App\\FrontEnd\\src';

walkDir(targetDir, (filePath) => {
    if (!/\.(jsx|js|tsx|ts)$/.test(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix double id and htmlFor
    content = content.replace(/id=\{name\}\s+id=\{name\}/g, 'id={name}');
    content = content.replace(/id="shippingAddress"\s+id="shippingAddress"/g, 'id="shippingAddress"');
    content = content.replace(/id="cancelReason"\s+id="cancelReason"/g, 'id="cancelReason"');
    content = content.replace(/id="imageFile"\s+id="imageFile"/g, 'id="imageFile"');
    content = content.replace(/id="galleryFiles"\s+id="galleryFiles"/g, 'id="galleryFiles"');
    content = content.replace(/id="productName"\s+id="productName"/g, 'id="productName"');
    content = content.replace(/id="sku"\s+id="sku"/g, 'id="sku"');
    content = content.replace(/id="brandId"\s+id="brandId"/g, 'id="brandId"');
    content = content.replace(/id="categoryId"\s+id="categoryId"/g, 'id="categoryId"');
    content = content.replace(/id="description"\s+id="description"/g, 'id="description"');
    content = content.replace(/id=\{`attr-\$\{attr\.code\}`\}\s+id=\{`attr-\$\{attr\.code\}`\}/g, 'id={`attr-${attr.code}`}');

    content = content.replace(/htmlFor=\{name\}\s+htmlFor=\{name\}/g, 'htmlFor={name}');
    content = content.replace(/htmlFor="shippingAddress"\s+htmlFor="shippingAddress"/g, 'htmlFor="shippingAddress"');
    content = content.replace(/htmlFor="cancelReason"\s+htmlFor="cancelReason"/g, 'htmlFor="cancelReason"');
    content = content.replace(/htmlFor="imageFile"\s+htmlFor="imageFile"/g, 'htmlFor="imageFile"');
    content = content.replace(/htmlFor="galleryFiles"\s+htmlFor="galleryFiles"/g, 'htmlFor="galleryFiles"');
    content = content.replace(/htmlFor="productName"\s+htmlFor="productName"/g, 'htmlFor="productName"');
    content = content.replace(/htmlFor="sku"\s+htmlFor="sku"/g, 'htmlFor="sku"');
    content = content.replace(/htmlFor="brandId"\s+htmlFor="brandId"/g, 'htmlFor="brandId"');
    content = content.replace(/htmlFor="categoryId"\s+htmlFor="categoryId"/g, 'htmlFor="categoryId"');
    content = content.replace(/htmlFor="description"\s+htmlFor="description"/g, 'htmlFor="description"');
    content = content.replace(/htmlFor=\{`attr-\$\{attr\.code\}`\}\s+htmlFor=\{`attr-\$\{attr\.code\}`\}/g, 'htmlFor={`attr-${attr.code}`}');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Cleaned: ' + filePath);
    }
});
