const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');
code = code.replace(/<!-- N[^\>]*?ch[^\>]*?a [^\>]*?ng nh[^\>]*?p -->\s*<div v-else class="auth-card"/, '<div v-else class="auth-card"');
fs.writeFileSync('frontend/src/App.vue', code);
console.log('Fixed comment 2');
