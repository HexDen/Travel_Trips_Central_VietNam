
const fs = require('fs');

let userCode = fs.readFileSync('frontend/src/App_user.vue', 'utf8');
let namCode = fs.readFileSync('frontend/src/App.vue', 'utf8');

// EXTRACT FROM USER
let tripsUser = userCode.substring(
  userCode.indexOf('<!-- ==================== TAB 3: CHUYẾN ĐI CỦA TÔI (MY TRIPS) ==================== -->'),
  userCode.indexOf('<!-- ==================== TAB 5: TÀI KHOẢN & YÊU THÍCH (PROFILE) ==================== -->')
);

let profileUser = userCode.substring(
  userCode.indexOf('<!-- ==================== TAB 5: TÀI KHOẢN & YÊU THÍCH (PROFILE) ==================== -->'),
  userCode.indexOf('</main>')
);
// Remove </main> if it was matched accidentally
profileUser = profileUser.substring(0, profileUser.lastIndexOf('</section>') + 10) + '\n';


// REPLACE IN NAM
let tripsNamStart = namCode.indexOf('<!-- ==================== TAB 3: CHUY?N DI C?A TOI (MY TRIPS) ==================== -->');
let tripsNamEnd = namCode.indexOf('<!-- ==================== TAB 5: TAI KHO?N & YEU THICH (PROFILE) ==================== -->');

let profileNamStart = namCode.indexOf('<!-- ==================== TAB 5: TAI KHO?N & YEU THICH (PROFILE) ==================== -->');
let profileNamEnd = namCode.indexOf('</main>');

if (tripsNamStart > -1 && tripsNamEnd > -1) {
  namCode = namCode.substring(0, tripsNamStart) + tripsUser + namCode.substring(tripsNamEnd);
} else {
  console.log('Could not find Trips in Nam');
}

// Re-calculate after string mutation
profileNamStart = namCode.indexOf('<!-- ==================== TAB 5: TAI KHO?N & YEU THICH (PROFILE) ==================== -->');
profileNamEnd = namCode.indexOf('</main>');

if (profileNamStart > -1 && profileNamEnd > -1) {
  // We need to keep the </main> tag from namCode
  namCode = namCode.substring(0, profileNamStart) + profileUser + '\n      ' + namCode.substring(profileNamEnd);
} else {
  console.log('Could not find Profile in Nam');
}

// INJECT CSS
const userStyleMatch = userCode.match(/<style>([\\s\\S]*?)<\\/style>/);
if (userStyleMatch) {
    let userStyle = userStyleMatch[1];
    let newCss = '\\n/* User Profile & Trips CSS */\\n';
    
    let profileClasses = userStyle.match(/\\.profile-[\\s\\S]*?(?=\\n\\n|\\n<\\/style>)/g);
    if (profileClasses) newCss += profileClasses.join('\\n\\n') + '\\n';
    
    let tripsClasses = userStyle.match(/\\.my-trips-[\\s\\S]*?(?=\\n\\n|\\n<\\/style>)/g);
    if (tripsClasses) newCss += tripsClasses.join('\\n\\n') + '\\n';

    let otherClasses = userStyle.match(/\\.(avatar-edit|stat-card|trip-card)[\\s\\S]*?(?=\\n\\n|\\n<\\/style>)/g);
    if (otherClasses) newCss += otherClasses.join('\\n\\n') + '\\n';

    namCode = namCode.replace(/<\\/style>/, newCss + '\\n</style>');
}

fs.writeFileSync('frontend/src/App.vue', namCode);
console.log('HTML injected successfully!');

