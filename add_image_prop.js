const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/FavoritePlaces.vue', 'utf8');

// Thêm prop getPlaceImage
code = code.replace(/favoritesList: \{[^}]+\}/, $&,\n  getPlaceImage: {\n    type: Function,\n    default: (place) => place.image || 'https://images.unsplash.com/photo-1544254146-24e030219662?w=600&auto=format&fit=crop&q=80'\n  });

// S?a card-image-placeholder
code = code.replace(/<div class="card-image-placeholder" :class="'bg-' \+ \(place\.type \|\| 'default'\)">/, 
  '<div class="card-image-placeholder" :style="{ backgroundImage: \\'url(\\' + getPlaceImage(place) + \\')\\' }">');

fs.writeFileSync('frontend/src/components/FavoritePlaces.vue', code);
console.log('Fixed component');
