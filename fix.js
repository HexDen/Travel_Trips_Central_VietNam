const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');
code = code.replace('<UserProfile', '<UserProfile v-if=\"nguoiDung\"');
fs.writeFileSync('frontend/src/App.vue', code);
console.log('Fixed');
