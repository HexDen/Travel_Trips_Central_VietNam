const https = require('https');

const cities = [
  'Thanh Hóa Pù Luông',
  'Nghệ An',
  'Hà Tĩnh',
  'Quảng Trị',
  'Huế',
  'Đà Nẵng',
  'Quảng Ngãi',
  'Gia Lai',
  'Đắk Lắk',
  'Khánh Hòa',
  'Đà Lạt Lâm Đồng'
];

async function getUnsplashImage(city) {
  return new Promise(resolve => {
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(city + ' vietnam')}&per_page=1`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            resolve({ city, img: json.results[0].urls.raw + '&w=600&auto=format&fit=crop&q=80' });
          } else {
            resolve({ city, img: '' });
          }
        } catch(e) {
          resolve({ city, img: '' });
        }
      });
    }).on('error', () => resolve({ city, img: '' }));
  });
}

async function run() {
  const results = await Promise.all(cities.map(getUnsplashImage));
  console.log(JSON.stringify(results, null, 2));
}

run();
