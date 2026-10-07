const fs = require('fs');
let userCode = fs.readFileSync('frontend/src/App.vue', 'utf8');
let namCode = fs.readFileSync('frontend/src/App_nam.vue', 'utf8');

// 1. Radar Orbs (if userCode doesn't have it, we can't replace the ring if userCode has a different ring structure)
// Let's just find the exact block in userCode and replace it.
// userCode has: <div class="radar-center"> ... </div>
// namCode has: <div class="radar-center"> ... </div> <div class="radar-orb-ring"> ... </div>
const radarBaseRegex = /<div class="radar-center">\s*<img src="\/shrek\.jpg" class="radar-center-img" alt="Leader" \/>\s*<\/div>/;
const radarNamRegex = /<div class="radar-center">[\s\S]*?<div class="radar-orb-ring">[\s\S]*?<\/div>\s*<\/div>/;
let namRadar = namCode.match(radarNamRegex);
if (namRadar) {
    userCode = userCode.replace(radarBaseRegex, namRadar[0]);
}

// 2. Celeb Avatars
// userCode has: <div class="ai-hint-bubble">
// namCode has: <div class="celeb-avatar-wrap celeb-2" title="Thủ quỹ kiêm Đòi nợ"> ... <div class="ai-hint-bubble">
const celebNamRegex = /<div class="celeb-avatar-wrap celeb-2"[\s\S]*?<div class="ai-hint-bubble">/;
let namCeleb = namCode.match(celebNamRegex);
if (namCeleb) {
    userCode = userCode.replace(/<div class="ai-hint-bubble">/, namCeleb[0]);
}

// 3. Square Avatars replacing emojis
userCode = userCode.replace(/<span class="sq-icon">🗣️<\/span>/g, '<img src="/avatars/friend1.png" class="sq-img" alt="Thủ quỹ">');
userCode = userCode.replace(/<span class="sq-icon">🧭<\/span>/g, '<img src="/avatars/friend4.jpg" class="sq-img sq-smirk" alt="Hoa tiêu">');
userCode = userCode.replace(/<span class="sq-icon">💤<\/span>/g, '<img src="/avatars/friend2.jpg" class="sq-img sq-cyclo" alt="Chúa tể lười">');
userCode = userCode.replace(/<span class="sq-icon">📸<\/span>/g, '<img src="/avatars/friend3.jpg" class="sq-img" alt="Thánh sống ảo">');

userCode = userCode.replace(/<span class="sq-chat-icon">🗣️<\/span>/g, '<img src="/avatars/friend1.png" class="sq-chat-avatar" alt="Thủ quỹ">');
userCode = userCode.replace(/<span class="sq-chat-icon">🧭<\/span>/g, '<img src="/avatars/friend4.jpg" class="sq-chat-avatar sq-smirk" alt="Hoa tiêu">');
userCode = userCode.replace(/<span class="sq-chat-icon">💤<\/span>/g, '<img src="/avatars/friend2.jpg" class="sq-chat-avatar sq-cyclo" alt="Chúa tể lười">');
userCode = userCode.replace(/<span class="sq-chat-icon">📸<\/span>/g, '<img src="/avatars/friend3.jpg" class="sq-chat-avatar" alt="Thánh sống ảo">');

// 4. Update the Trip Details Modal (tdm)
const tdmNamRegex = /<!-- ==================== MODAL XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU \(PHẦN 3\) ==================== -->[\s\S]*?<!-- ==================== PLANNER FLASH TRANSITION ==================== -->/;
const tdmUserRegex = /<!-- ==================== MODAL XEM CHI TIẾT CHUYẾN ĐI ĐÃ LƯU \(PHẦN 3\) ==================== -->[\s\S]*?<!-- ==================== PLANNER FLASH TRANSITION ==================== -->/;
let namTdm = namCode.match(tdmNamRegex);
if (namTdm) {
    userCode = userCode.replace(tdmUserRegex, namTdm[0]);
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
