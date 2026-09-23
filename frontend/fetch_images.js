const https = require('https');

const cities = [
  'Thanh Hóa (tỉnh)',
  'Nghệ An',
  'Hà Tĩnh',
  'Quảng Trị',
  'Thừa Thiên Huế',
  'Đà Nẵng',
  'Quảng Ngãi',
  'Gia Lai',
  'Đắk Lắk',
  'Khánh Hòa',
  'Lâm Đồng'
];

async function getWikiImage(city) {
  return new Promise(resolve => {
    const url = `https://vi.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(city)}&prop=pageimages&format=json&pithumbsize=600`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const page = Object.values(pages)[0];
          resolve({ city, img: page.thumbnail ? page.thumbnail.source : '' });
        } catch(e) {
          resolve({ city, img: '' });
        }
      });
    }).on('error', () => resolve({ city, img: '' }));
  });
}

async function run() {
  const results = await Promise.all(cities.map(getWikiImage));
  console.log(JSON.stringify(results, null, 2));
}

run();
