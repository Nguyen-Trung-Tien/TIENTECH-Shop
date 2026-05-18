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

    // Undo all ellipsis replacements
    content = content.replace(/…/g, '...');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Restored: ' + filePath);
    }
});
