const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.vue', 'utf8');

const regex = /<FavoritePlaces\s*[\s\S]*?\/>/;
code = code.replace(regex, '<FavoritePlaces :favoritesList="favoritesList" @doiYeuThich="doiYeuThich" :getPlaceImage="getPlaceImage" />');

fs.writeFileSync('frontend/src/App.vue', code);
console.log('Injected prop successfully');
