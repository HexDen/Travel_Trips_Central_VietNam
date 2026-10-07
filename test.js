
const fs = require('fs');
let text = fs.readFileSync('frontend/src/App_user.vue', 'utf8');
let idx = text.indexOf('CHUY');
console.log(text.substring(idx - 20, idx + 50));

