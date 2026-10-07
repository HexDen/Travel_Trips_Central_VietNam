const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');

// Thêm import nếu chưa có
if (!code.includes('import FavoritePlaces')) {
    code = code.replace(/<script setup>/, '<script setup>\nimport FavoritePlaces from \'./components/FavoritePlaces.vue\';');
}

// Xoá cái danh sách địa điểm cũ và thay bằng Component
const favBlockRegex = /<!-- Danh s[^\-]*?a [^\-]*?i[^\-]*?m y[^\-]*?u th[^\-]*?ch -->[\s\S]*?(?=<\/section>)/;
const newFavComponent = `
          <!-- Danh sách địa điểm yêu thích (Mới) -->
          <FavoritePlaces 
            :favoritesList="favoritesList"
            @doiYeuThich="doiYeuThich"
          />
        `;

if (favBlockRegex.test(code)) {
    code = code.replace(favBlockRegex, newFavComponent);
    fs.writeFileSync('frontend/src/App.vue', code);
    console.log('Successfully injected FavoritePlaces component into App.vue!');
} else {
    console.log('Could not find the target favorites block.');
}
