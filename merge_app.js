
const fs = require('fs');
let user = fs.readFileSync('frontend/src/App.vue', 'utf8');
let nam = fs.readFileSync('frontend/src/App_nam.vue', 'utf8');

// Thay thế radar-orb-ring
const orbRingRegex = /<div class="radar-orb-ring">[\s\S]*?<\/div>\s*<\/div>\s*<div class="ai-gen-body">/;
const namOrb = nam.match(/<div class="radar-orb-ring">[\s\S]*?<\/div>\s*<\/div>\s*<div class="ai-gen-body">/);
if (namOrb) {
    user = user.replace(/<div class="radar-orb-ring">[\s\S]*?<\/div>\s*<\/div>\s*<div class="ai-gen-body">/, namOrb[0]);
}

// Thay thế celeb avatars
const celebRegex = /<div class="celeb-avatar-wrap celeb-2"[\s\S]*?<div class="ai-hint-bubble">/;
const namCeleb = nam.match(celebRegex);
if (namCeleb) {
    user = user.replace(/<div class="celeb-avatar-wrap celeb-2"[\s\S]*?<div class="ai-hint-bubble">/, namCeleb[0]);
}

fs.writeFileSync('frontend/src/App.vue', user);

