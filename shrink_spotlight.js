const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');

// 1. .province-spotlight-card
code = code.replace(/(\.province-spotlight-card\s*\{[\s\S]*?)gap:\s*24px;(.*?padding:\s*)22px;/, '$1gap: 16px;$216px;');

// 2. .spotlight-hero-wrap
code = code.replace(/(\.spotlight-hero-wrap\s*\{[\s\S]*?height:\s*)340px;/, '$1240px;');

// 3. .spotlight-thumb-btn
code = code.replace(/(\.spotlight-thumb-btn\s*\{[\s\S]*?height:\s*)72px;/, '$154px;');

// 4. .spotlight-title
code = code.replace(/(\.spotlight-title\s*\{[\s\S]*?font-size:\s*)22px;/, '$118px;');
code = code.replace(/(\.spotlight-subtitle\s*\{[\s\S]*?font-size:\s*)13\.5px;/, '$112.5px;');
code = code.replace(/(\.spotlight-description\s*\{[\s\S]*?font-size:\s*)13px;/, '$112px;');

fs.writeFileSync('frontend/src/App.vue', code);
console.log('Shrunk spotlight');
