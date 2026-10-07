
const fs = require('fs');
let userCode = fs.readFileSync('frontend/src/App_user.vue', 'utf8');
let currentCode = fs.readFileSync('frontend/src/App.vue', 'utf8');

// 1. Extract Profile Dashboard HTML from App_user.vue
// We will look for <!-- PROFILE DASHBOARD -->
const profileMatch = userCode.match(/<!-- PROFILE DASHBOARD -->[\s\S]*?<!-- ==================== TAB CHUYẾN ĐI ĐÃ LƯU ==================== -->/);

if (profileMatch) {
    // In currentCode, it doesn't have Profile Dashboard. It just goes from <!-- ==================== TAB KHÁM PHÁ ==================== --> to <!-- ==================== TAB CHUYẾN ĐI ĐÃ LƯU ==================== -->.
    // Wait, the order in userCode is Profile -> Chuyến đi đã lưu. Let's insert it before TAB CHUYẾN ĐI ĐÃ LƯU.
    currentCode = currentCode.replace(/<!-- ==================== TAB CHUYẾN ĐI ĐÃ LƯU ==================== -->/, profileMatch[0]);
}

// 2. Extract My Trips Grid HTML
const myTripsUserMatch = userCode.match(/<div v-if="myTripsList\.length" class="my-trips-grid">[\s\S]*?<\/div>\s*<!-- Empty State -->/);
const myTripsCurrentMatch = currentCode.match(/<div v-if="myTripsList\.length" class="my-trips-grid">[\s\S]*?<\/div>\s*<!-- Empty State -->/);

if (myTripsUserMatch && myTripsCurrentMatch) {
    currentCode = currentCode.replace(myTripsCurrentMatch[0], myTripsUserMatch[0]);
}

// 3. Extract CSS for Profile and Trips
const userStyleMatch = userCode.match(/<style>([\s\S]*?)<\/style>/);
if (userStyleMatch) {
    let userStyle = userStyleMatch[1];
    let newCss = '\n/* User Profile & Trips CSS */\n';
    
    let profileClasses = userStyle.match(/\.profile-[\s\S]*?(?=\n\n|\n<\/style>)/g);
    if (profileClasses) newCss += profileClasses.join('\n\n') + '\n';
    
    let tripsClasses = userStyle.match(/\.my-trips-[\s\S]*?(?=\n\n|\n<\/style>)/g);
    if (tripsClasses) newCss += tripsClasses.join('\n\n') + '\n';

    let otherClasses = userStyle.match(/\.(avatar-edit|stat-card|trip-card)[\s\S]*?(?=\n\n|\n<\/style>)/g);
    if (otherClasses) newCss += otherClasses.join('\n\n') + '\n';

    currentCode = currentCode.replace(/<\/style>/, newCss + '\n</style>');
}

// 4. Extract Javascript for Profile and Trips (this is hard, we can just replace the <script setup> entirely? NO! We will lose Nam's script! Let's do it manually via patch later if needed. But wait, I can just use regex to extract the specific functions).
// Functions to extract: selectAllTrips, toggleSelectAllTrips, toggleTripSelection, promptDeleteSelected, deleteTarget, executeDeleteTrips, editProfile, isEditingProfile, profileForm, handleAvatarUpload, saveProfile.

fs.writeFileSync('frontend/src/App_merged.vue', currentCode);
console.log('Merge step 1 complete!');

