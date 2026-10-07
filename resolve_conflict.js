const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');

// Thay thế xung đột git bằng cách lấy phiên bản của mình (nửa dưới ======)
code = code.replace(/<<<<<<< HEAD\r?\n[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> [a-f0-9]+ \(update profile\)\r?\n/g, '$1');

// Ngoài ra, conflict trong frontend/dev-dist/sw.js (nếu có)
try {
  let swCode = fs.readFileSync('frontend/dev-dist/sw.js', 'utf8');
  swCode = swCode.replace(/<<<<<<< HEAD\r?\n[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> [a-f0-9]+ \(update profile\)\r?\n/g, '$1');
  fs.writeFileSync('frontend/dev-dist/sw.js', swCode);
} catch (e) {}

fs.writeFileSync('frontend/src/App.vue', code);
console.log('Resolved conflicts');
