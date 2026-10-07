const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');

if (!code.includes('import UserProfile')) {
    code = code.replace(/<script setup>/, '<script setup>\nimport UserProfile from \'./components/UserProfile.vue\';');
}

const profileBlockRegex = /<div v-if="nguoiDung" class="profile-card-premium">[\s\S]*?(?=<!-- N[^\-]*?u ch[^\-]*?a [^\-]*?ng nh[^\-]*?p -->)/;

const newProfileComponent = `
          <UserProfile
            :nguoiDung="nguoiDung"
            :userLevelInfo="userLevelInfo"
            :myTripsCount="myTripsList.length"
            :favoritesCount="favoritesList.length"
            :isEditingProfile="isEditingProfile"
            :profileForm="profileForm"
            @editProfile="editProfile"
            @dangXuat="dangXuat"
            @saveProfile="saveProfile"
            @cancelEdit="isEditingProfile = false"
            @handleAvatarUpload="handleAvatarUpload"
            @updateForm="(key, value) => { profileForm[key] = value }"
          />
          
          `;

if (profileBlockRegex.test(code)) {
    code = code.replace(profileBlockRegex, newProfileComponent);
    fs.writeFileSync('frontend/src/App.vue', code);
    console.log('Successfully injected UserProfile component into App.vue!');
} else {
    console.log('Could not find the target profile-card-premium block.');
}
