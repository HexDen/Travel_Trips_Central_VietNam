const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');

// shrink .city-card-btn
code = code.replace(/(\.city-card-btn\s*\{[\s\S]*?min-width:\s*)180px;/, '$1130px;');
code = code.replace(/(\.city-card-btn\s*\{[\s\S]*?max-width:\s*)210px;/, '$1150px;');
code = code.replace(/(\.city-card-btn\s*\{[\s\S]*?height:\s*)200px;/, '$1140px;');
code = code.replace(/(\.city-card-btn\s*\{[\s\S]*?padding:\s*)16px 12px;/, '$112px 10px;');

// shrink .city-name
code = code.replace(/(\.city-name\s*\{[\s\S]*?font-size:\s*)16px;/, '$114px;');

// shrink .city-tag
code = code.replace(/(\.city-tag\s*\{[\s\S]*?font-size:\s*)11\.5px;/, '$110px;');

fs.writeFileSync('frontend/src/App.vue', code);
console.log('Shrunk carousel cards');
