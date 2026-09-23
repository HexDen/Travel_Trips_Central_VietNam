const https = require('https');

const cities = [
  'Pù Luông',
  'Cửa Lò',
  'Hà Tĩnh',
  'Quảng Trị',
  'Hoàng thành Huế',
  'Cầu Vàng',
  'Đảo Lý Sơn',
  'Gia Lai',
  'Buôn Ma Thuột',
  'Nha Trang',
  'Đà Lạt'
];

async function getWikiImage(title) {
  return new Promise(resolve => {
    const url = `https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    https.get(url, { headers: { 'User-Agent': 'TravelBot/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.thumbnail ? json.thumbnail.source : '');
        } catch(e) {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
}

async function run() {
  for (let city of cities) {
    const img = await getWikiImage(city);
    console.log(city + ':', img);
  }
}

run();
