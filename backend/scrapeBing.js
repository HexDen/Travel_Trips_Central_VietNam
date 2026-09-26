const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getBingImage(query) {
  try {
    const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query) + '&form=HDRSC2&first=1';
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cookie': 'SRCHD=AF=NOFORM; SRCHUID=V=2&GUID=1234567890; SRCHUSR=DOB=20240101; _EDGE_S=F=1&SID=1234567890;'
      }
    });
    const $ = cheerio.load(res.data);
    const mAttr = $('a.iusc').first().attr('m');
    if (mAttr) {
      const data = JSON.parse(mAttr);
      return data.murl; // We'll use murl for high res!
    }
  } catch (err) {}
  return null;
}

async function run() {
  const cities = [
    { name: 'Thanh Hóa', query: 'Thanh Hóa Sầm Sơn' },
    { name: 'Nghệ An', query: 'Cửa Lò Nghệ An' },
    { name: 'Hà Tĩnh', query: 'Thiên Cầm Hà Tĩnh' },
    { name: 'Quảng Bình', query: 'Động Thiên Đường Quảng Bình' },
    { name: 'Quảng Trị', query: 'Thành cổ Quảng Trị' },
    { name: 'Thừa Thiên Huế', query: 'Đại nội Cố đô Huế' },
    { name: 'Đà Nẵng', query: 'Cầu Vàng Bà Nà Hills Đà Nẵng' },
    { name: 'Quảng Nam', query: 'Phố cổ Hội An Quảng Nam' },
    { name: 'Quảng Ngãi', query: 'Đảo Lý Sơn Quảng Ngãi' },
    { name: 'Bình Định', query: 'Eo Gió Kỳ Co Quy Nhơn Bình Định' },
    { name: 'Phú Yên', query: 'Gành Đá Đĩa Phú Yên' },
    { name: 'Khánh Hòa', query: 'Vịnh biển Nha Trang Khánh Hòa' },
    { name: 'Ninh Thuận', query: 'Vịnh Vĩnh Hy Ninh Thuận' },
    { name: 'Bình Thuận', query: 'Đồi cát Mũi Né Bình Thuận' },
    { name: 'Kon Tum', query: 'Nhà thờ gỗ Kon Tum' },
    { name: 'Gia Lai', query: 'Biển hồ T nưng Pleiku Gia Lai' },
    { name: 'Đắk Lắk', query: 'Bảo tàng thế giới cà phê Buôn Ma Thuột Đắk Lắk' },
    { name: 'Đắk Nông', query: 'Hồ Tà Đùng Đắk Nông' },
    { name: 'Lâm Đồng', query: 'Đà Lạt Lâm Đồng' }
  ];

  const results = {};
  for(let city of cities) {
    const url = await getBingImage(city.query);
    results[city.name] = url;
    console.log(city.name, '=>', url);
  }
  
  fs.writeFileSync('bing_results.json', JSON.stringify(results, null, 2));
}
run();
