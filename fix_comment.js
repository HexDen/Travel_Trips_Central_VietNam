const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');
code = code.replace(/<UserProfile[\s\S]*?\/>\s*<!--.*?-->\s*<div v-else class="auth-card"/, (match) => {
    return match.replace(/<!--.*?-->\s*/, '');
});
fs.writeFileSync('frontend/src/App.vue', code);
console.log('Fixed comment');
