
const fs = require('fs');
let userCode = fs.readFileSync('frontend/src/App.vue', 'utf8');
let namCode = fs.readFileSync('frontend/src/App_nam.vue', 'utf8');

// 1. Radar Orbs
const radarMatch = namCode.match(/<div class="radar-orb-ring">[\s\S]*?<\/div>\s*<\/div>\s*<div class="ai-gen-body">/);
if (radarMatch) {
    userCode = userCode.replace(/<div class="radar-orb-ring">[\s\S]*?<\/div>\s*<\/div>\s*<div class="ai-gen-body">/, radarMatch[0]);
}

// 2. Celeb Avatars
const celebMatch = namCode.match(/<div class="celeb-avatar-wrap celeb-2"[\s\S]*?<div class="ai-hint-bubble">/);
if (celebMatch) {
    userCode = userCode.replace(/<div class="celeb-avatar-wrap celeb-2"[\s\S]*?<div class="ai-hint-bubble">/, celebMatch[0]);
}

// 3. Square Avatars replacing emojis
userCode = userCode.replace(/<span class="sq-icon">🗣️<\/span>/g, '<img src="/avatars/friend1.png" class="sq-img" alt="Thủ quỹ">');
userCode = userCode.replace(/<span class="sq-icon">🧭<\/span>/g, '<img src="/avatars/friend4.jpg" class="sq-img sq-smirk" alt="Hoa tiêu">');
userCode = userCode.replace(/<span class="sq-icon">💤<\/span>/g, '<img src="/avatars/friend2.jpg" class="sq-img sq-cyclo" alt="Chúa tể lười">');
userCode = userCode.replace(/<span class="sq-icon">📸<\/span>/g, '<img src="/avatars/friend3.jpg" class="sq-img" alt="Thánh sống ảo">');

// 4. Update the Trip Details Modal (tdm)
const tdmMatch = namCode.match(/<!-- ==================== MODAL XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU \(PHẦN 3\) ==================== -->[\s\S]*?<!-- ==================== PLANNER FLASH TRANSITION ==================== -->/);
if (tdmMatch) {
    userCode = userCode.replace(/<!-- ==================== MODAL XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU \(PHẦN 3\) ==================== -->[\s\S]*?<!-- ==================== PLANNER FLASH TRANSITION ==================== -->/, tdmMatch[0]);
}

// 5. Append Nam's specific CSS styles (tdm classes)
const styleMatch = namCode.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    let namStyle = styleMatch[1];
    let tdmClasses = namStyle.match(/\.tdm-[\s\S]*?(?=\n\n|\n<\/style>)/g);
    if (tdmClasses) {
        let appendedCss = '\n/* TDM Styles from Nam */\n' + tdmClasses.join('\n\n') + '\n</style>';
        userCode = userCode.replace(/<\/style>/, appendedCss);
    }
}

fs.writeFileSync('frontend/src/App.vue', userCode);
console.log('Merge complete!');

