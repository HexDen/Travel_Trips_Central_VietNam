const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');
code = code.replace(/const userLevelInfo = computed\(\(\) => \{\s*const points = nguoiDung\.value\?\.points \|\| 0\s*if \(points >= 1000\)[\s\S]*?\}\)/, '/* removed dup userLevelInfo */');
fs.writeFileSync('frontend/src/App.vue', code);
console.log('Fixed dup');
