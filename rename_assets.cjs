const fs = require('fs');
const path = require('path');

const dirs = ['./src/assets', './public'];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.includes('webnovax')) {
            const oldPath = path.join(dir, file);
            const newPath = path.join(dir, file.replace(/webnovax/g, 'novaesweb'));
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed: ${oldPath} -> ${newPath}`);
        }
    });
});
console.log('Done!');
