const fs = require('fs');
const path = require('path');

// 1x1 PNG (transparent) base64 placeholder
const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
const outPath = path.join(process.cwd(), 'wallpaper.png');
fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
console.log('Generated placeholder', outPath);