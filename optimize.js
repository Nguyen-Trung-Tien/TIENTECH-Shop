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
let updatedCount = 0;

walkDir(targetDir, (filePath) => {
    if (!/\.(jsx|js|tsx|ts)$/.test(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Tailwind CSS Shorthand
    content = content.replace(/\bw-(\d+)\s+h-\1\b/g, 'size-$1');
    content = content.replace(/\bh-(\d+)\s+w-\1\b/g, 'size-$1');

    // 2. Typography: h3 font-bold -> font-semibold
    content = content.replace(/(<h3[^>]*?)\bfont-bold\b([^>]*?>)/g, '$1font-semibold$2');

    // 4. Typographic Ellipsis: ... -> … (Safe replacement)
    // Only if NOT followed by identifier chars, [ or { (which indicates spread operator)
    content = content.replace(/\.\.\.(?![a-zA-Z0-9_$\[\{])/g, '…');

    // 3. Accessibility for specific files
    const fileName = path.basename(filePath);

    if (fileName === 'CheckoutForm.jsx') {
        content = content.replace(
            /<label className="(.*?)">\{label\}<\/label>/g,
            '<label className="$1" htmlFor={name}>{label}</label>'
        );
        content = content.replace(
            /<input([\s\S]*?)name=\{name\}/g,
            '<input$1id={name} name={name}'
        );
        content = content.replace(
            /<label className="(.*?)">Chọn địa chỉ đã lưu<\/label>/g,
            '<p className="$1">Chọn địa chỉ đã lưu</p>'
        );
        content = content.replace(
            /<label className="(.*?)">Nhập địa chỉ nhận hàng<\/label>/g,
            '<label className="$1" htmlFor="shippingAddress">Nhập địa chỉ nhận hàng</label>'
        );
        content = content.replace(
            /<textarea([\s\S]*?)name="shippingAddress"/g,
            '<textarea id="shippingAddress"$1name="shippingAddress"'
        );
    }

    if (fileName === 'OrderPage.jsx') {
        content = content.replace(/<label className="(.*?)">\s*Chọn lý do hủy đơn\s*<\/label>/g, '<p className="$1">Chọn lý do hủy đơn</p>');
        content = content.replace(/<label className="(.*?)">\s*Chọn sản phẩm muốn trả\s*<\/label>/g, '<p className="$1">Chọn sản phẩm muốn trả</p>');
        content = content.replace(/<label className="(.*?)">\s*Lý do trả hàng\s*<\/label>/g, '<p className="$1">Lý do trả hàng</p>');
        
        content = content.replace(
            /<label className="(.*?)">\s*Nhập lý do chi tiết\s*<\/label>\s*<textarea/g,
            '<label className="$1" htmlFor="cancelReason">\n                Nhập lý do chi tiết\n              </label>\n              <textarea id="cancelReason"'
        );
    }

    if (fileName === 'OrderDetail.jsx') {
        content = content.replace(/<label className="(.*?)">\s*Chọn sản phẩm muốn trả\s*<\/label>/g, '<p className="$1">\n              Chọn sản phẩm muốn trả\n            </p>');
        content = content.replace(/<label className="(.*?)">\s*Lý do trả hàng\s*<\/label>/g, '<p className="$1">\n              Lý do trả hàng\n            </p>');
        content = content.replace(/<label className="(.*?)">\s*Chọn lý do hủy đơn\s*<\/label>/g, '<p className="$1">\n              Chọn lý do hủy đơn\n            </p>');
        
        content = content.replace(
            /<label className="(.*?)">\s*Nhập lý do chi tiết\s*<\/label>\s*<textarea/g,
            '<label className="$1" htmlFor="cancelReason">\n                Nhập lý do chi tiết\n              </label>\n              <textarea id="cancelReason"'
        );
    }

    if (fileName === 'ProductManage.jsx') {
        content = content.replace(
            /<label className="(.*?)">\s*Ảnh đại diện\s*<\/label>([\s\S]*?)<input([\s\S]*?)type="file"/g,
            '<label className="$1" htmlFor="imageFile">\n                        Ảnh đại diện\n                      </label>$2<input id="imageFile"$3type="file"'
        );
        content = content.replace(
            /<label className="(.*?)">\s*Thư viện ảnh\s*<\/label>([\s\S]*?)<input([\s\S]*?)type="file"/g,
            '<label className="$1" htmlFor="galleryFiles">\n                        Thư viện ảnh\n                      </label>$2<input id="galleryFiles"$3type="file"'
        );
        content = content.replace(
            /<label className="(.*?)">\s*Tên sản phẩm \*\s*<\/label>\s*<input/g,
            '<label className="$1" htmlFor="productName">\n                            Tên sản phẩm *\n                          </label>\n                          <input id="productName"'
        );
        content = content.replace(
            /<label className="(.*?)">\s*SKU \/ Mã quản lý\s*<\/label>\s*<input/g,
            '<label className="$1" htmlFor="sku">\n                            SKU / Mã quản lý\n                          </label>\n                          <input id="sku"'
        );
        content = content.replace(
            /<label className="(.*?)">\s*Thương hiệu\s*<\/label>\s*<select/g,
            '<label className="$1" htmlFor="brandId">\n                            Thương hiệu\n                          </label>\n                          <select id="brandId"'
        );
        content = content.replace(
            /<label className="(.*?)">\s*Danh mục sản phẩm\s*<\/label>\s*<select/g,
            '<label className="$1" htmlFor="categoryId">\n                            Danh mục sản phẩm\n                          </label>\n                          <select id="categoryId"'
        );
        content = content.replace(
            /<label className="(.*?)">\s*Mô tả sản phẩm\s*<\/label>\s*<textarea/g,
            '<label className="$1" htmlFor="description">\n                        Mô tả sản phẩm\n                      </label>\n                      <textarea id="description"'
        );
        content = content.replace(
            /<label className="(.*?)"([\s\S]*?)>([\s\S]*?)(\{getAttrIcon\(attr\.code\)\}\s*\{attr\.name\})([\s\S]*?)<\/label>\s*<div className="relative">\s*<input/g,
            '<label className="$1"$2 htmlFor={`attr-${attr.code}`}>$3$4$5</label>\n                            <div className="relative">\n                              <input id={`attr-${attr.code}`}'
        );
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
        updatedCount++;
    }
});
console.log('Total files updated: ' + updatedCount);
