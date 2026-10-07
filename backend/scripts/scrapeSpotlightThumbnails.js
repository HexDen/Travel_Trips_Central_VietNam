const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');
const http = require('http');

async function getBingImages(query, count = 3) {
  try {
    const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query) + '&form=HDRSC2&first=1';
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cookie': 'SRCHD=AF=NOFORM; SRCHUID=V=2&GUID=1234567890; SRCHUSR=DOB=20240101; _EDGE_S=F=1&SID=1234567890;'
      },
      timeout: 6000
    });
    const $ = cheerio.load(res.data);
    const urls = [];
    $('a.iusc').each((i, el) => {
      const mAttr = $(el).attr('m');
      if (mAttr) {
        try {
          const data = JSON.parse(mAttr);
          if (data.murl && data.murl.startsWith('http')) {
            urls.push(data.murl);
          }
        } catch (e) {}
      }
    });
    return urls.slice(0, count);
  } catch (err) {
    return [];
  }
}

async function verifyImage(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 350) {
          const type = res.headers['content-type'] || '';
          if (type.includes('image') || type === '') {
            resolve(true);
            return;
          }
        }
        resolve(false);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(4000, () => { req.destroy(); resolve(false); });
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
}

async function findWorkingImage(query, fallback) {
  const candidates = await getBingImages(query, 5);
  for (const c of candidates) {
    const isLive = await verifyImage(c);
    if (isLive) return c;
  }
  return fallback;
}

async function run() {
  const PROVINCES = {
    'Huế': {
      hero: { query: 'Đại Nội Huế Cố đô di tích', fallback: 'https://sacotravel.com/wp-content/uploads/2023/07/Dai-Noi-Hue.jpg' },
      items: [
        { name: 'Đại Nội Hoàng Thành', query: 'Ngọ Môn Đại Nội Huế' },
        { name: 'Lăng Khải Định', query: 'Lăng Khải Định Huế kiến trúc' },
        { name: 'Chùa Thiên Mụ', query: 'Chùa Thiên Mụ tháp Phước Duyên Huế' },
        { name: 'Sông Hương & Cầu Tràng Tiền', query: 'Cầu Tràng Tiền sông Hương Huế đêm' },
        { name: 'Đồi Vọng Cảnh', query: 'Đồi Vọng Cảnh ngắm sông Hương Huế' }
      ]
    },
    'Đà Nẵng': {
      hero: { query: 'Cầu Vàng Bà Nà Hills Đà Nẵng', fallback: 'https://www.pullman-danang.com/wp-content/uploads/sites/86/2019/05/DJI_0004.jpg' },
      items: [
        { name: 'Cầu Vàng Bà Nà Hills', query: 'Cầu Vàng Bà Nà Hills' },
        { name: 'Bãi biển Mỹ Khê', query: 'Bãi biển Mỹ Khê Đà Nẵng' },
        { name: 'Bán đảo Sơn Trà', query: 'Chùa Linh Ứng Bán đảo Sơn Trà' },
        { name: 'Cầu Rồng Sông Hàn', query: 'Cầu Rồng sông Hàn phun lửa' },
        { name: 'Phố Cổ Hội An', query: 'Phố cổ Hội An đèn lồng' }
      ]
    },
    'Phú Yên': {
      hero: { query: 'Gành Đá Đĩa Phú Yên', fallback: 'https://static.vinwonders.com/production/ganh-da-dia-phu-yen-1.jpg' },
      items: [
        { name: 'Ghềnh Đá Đĩa', query: 'Gành Đá Đĩa Phú Yên kiệt tác' },
        { name: 'Mũi Điện Hải Đăng', query: 'Mũi Điện Hải Đăng Đại Lãnh Phú Yên' },
        { name: 'Bãi Xép Hoa Vàng Cỏ Xanh', query: 'Bãi Xép Phú Yên hoa vàng trên cỏ xanh' },
        { name: 'Tháp Nghinh Phong', query: 'Tháp Nghinh Phong Tuy Hòa Phú Yên' },
        { name: 'Đầm Ô Loan', query: 'Đầm Ô Loan Phú Yên hoàng hôn' }
      ]
    },
    'Khánh Hòa': {
      hero: { query: 'Vịnh biển Nha Trang Khánh Hòa', fallback: 'https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg' },
      items: [
        { name: 'Bãi biển Nha Trang', query: 'Bãi biển Nha Trang đường Trần Phú' },
        { name: 'Tháp Bà Ponagar', query: 'Tháp Bà Ponagar Nha Trang' },
        { name: 'Vịnh Vĩnh Hy', query: 'Vịnh Vĩnh Hy biển xanh' },
        { name: 'VinWonders Hòn Tre', query: 'VinWonders Vinpearl Nha Trang' },
        { name: 'Rạn San Hô Hòn Mun', query: 'Lặn ngắm San Hô Hòn Mun Nha Trang' }
      ]
    },
    'Quảng Ngãi': {
      hero: { query: 'Đảo Lý Sơn Quảng Ngãi', fallback: 'https://statics.vinpearl.com/huyen-dao-ly-son_1742399346.jpg' },
      items: [
        { name: 'Cổng Tò Vò Lý Sơn', query: 'Cổng Tò Vò đảo Lý Sơn' },
        { name: 'Hang Câu vách đá', query: 'Hang Câu Lý Sơn Quảng Ngãi' },
        { name: 'Đỉnh Thới Lới', query: 'Đỉnh Thới Lới đảo Lý Sơn' },
        { name: 'Eo Gió Kỳ Co', query: 'Eo Gió Kỳ Co Quy Nhơn' },
        { name: 'Đảo Bé Lý Sơn', query: 'Đảo Bé Lý Sơn biển xanh' }
      ]
    },
    'Lâm Đồng': {
      hero: { query: 'Đà Lạt Lâm Đồng hoa và thông', fallback: 'https://cdn.tgdd.vn/Files/2023/10/25/1553008/top-22-dia-diem-du-lich-lam-dong-dep-nhat-dinh-khong-nen-bo-qua-202310251415581585.jpg' },
      items: [
        { name: 'Hồ Xuân Hương', query: 'Hồ Xuân Hương Đà Lạt sương sớm' },
        { name: 'Đồi chè Cầu Đất', query: 'Đồi chè Cầu Đất Đà Lạt săn mây' },
        { name: 'Thác Dambri', query: 'Thác Dambri Bảo Lộc hùng vĩ' },
        { name: 'Quảng trường Lâm Viên', query: 'Quảng trường Lâm Viên bông atiso' },
        { name: 'Đỉnh Langbiang', query: 'Đỉnh Langbiang Đà Lạt' }
      ]
    },
    'Gia Lai': {
      hero: { query: 'Biển Hồ Pleiku Gia Lai', fallback: 'https://touring.vn/wp-content/uploads/2023/12/Bien-Ho_TNung-3-768x587.jpg' },
      items: [
        { name: 'Biển Hồ T’Nưng Pleiku', query: 'Biển Hồ T Nưng Pleiku' },
        { name: 'Núi lửa Chư Đăng Ya', query: 'Núi lửa Chư Đăng Ya dã quỳ' },
        { name: 'Nhà rông Kon Klor', query: 'Nhà rông Kon Klor Kon Tum' },
        { name: 'Nhà thờ gỗ Kon Tum', query: 'Nhà thờ gỗ Kon Tum cổ' },
        { name: 'Chùa Minh Thành', query: 'Chùa Minh Thành Pleiku' }
      ]
    },
    'Đắk Lắk': {
      hero: { query: 'Bảo tàng thế giới cà phê Buôn Ma Thuột', fallback: 'https://cdn.xanhsm.com/2024/12/131980d3-bao-tang-the-gioi-ca-phe-25.jpg' },
      items: [
        { name: 'Bảo tàng Thế Giới Cà Phê', query: 'Bảo tàng Thế Giới Cà Phê Buôn Ma Thuột' },
        { name: 'Thác Dray Nur', query: 'Thác Dray Nur Đắk Lắk' },
        { name: 'Hồ Lắk', query: 'Hồ Lắk Buôn Ma Thuột' },
        { name: 'Buôn Đôn', query: 'Buôn Đôn Đắk Lắk nhà sàn' },
        { name: 'Hồ Tà Đùng', query: 'Hồ Tà Đùng Đắk Nông' }
      ]
    },
    'Quảng Trị': {
      hero: { query: 'Động Thiên Đường Quảng Bình', fallback: 'https://phongnhatourist.com/wp-content/uploads/2019/04/dong-thie-duong-2.jpg' },
      items: [
        { name: 'Động Thiên Đường', query: 'Động Thiên Đường thạch nhũ' },
        { name: 'Động Phong Nha', query: 'Động Phong Nha thuyền xuôi dòng' },
        { name: 'Địa đạo Vịnh Mốc', query: 'Địa đạo Vịnh Mốc Quảng Trị' },
        { name: 'Cầu Hiền Lương', query: 'Cầu Hiền Lương sông Bến Hải' },
        { name: 'Thành Cổ Quảng Trị', query: 'Thành cổ Quảng Trị đài tưởng niệm' }
      ]
    },
    'Thanh Hóa': {
      hero: { query: 'Bãi biển Sầm Sơn Thanh Hóa', fallback: 'https://viptrip.vn/public/upload/news/bai-bien-sam-son_23-05-2024_713782758.jpg' },
      items: [
        { name: 'Bãi biển Sầm Sơn', query: 'Bãi biển Sầm Sơn du lịch' },
        { name: 'Ruộng bậc thang Pù Luông', query: 'Ruộng bậc thang Pù Luông lúa chín' },
        { name: 'Thành Nhà Hồ UNESCO', query: 'Thành Nhà Hồ Thanh Hóa cổng đá' },
        { name: 'Suối cá thần Cẩm Lương', query: 'Suối cá thần Cẩm Lương Thanh Hóa' },
        { name: 'Biển Hải Tiến', query: 'Bãi biển Hải Tiến Thanh Hóa' }
      ]
    },
    'Nghệ An': {
      hero: { query: 'Bãi biển Cửa Lò Nghệ An', fallback: 'https://farm8.staticflickr.com/7516/15964471348_7caca4ee9b_o.jpg' },
      items: [
        { name: 'Bãi biển Cửa Lò', query: 'Bãi biển Cửa Lò Nghệ An' },
        { name: 'Làng Sen quê Bác', query: 'Làng Sen Kim Liên quê Bác' },
        { name: 'Đảo Chè Thanh Chương', query: 'Đảo chè Thanh Chương Nghệ An' },
        { name: 'Vườn quốc gia Pù Mát', query: 'Vườn quốc gia Pù Mát thác Kèm' },
        { name: 'Biển Bãi Lữ', query: 'Bãi Lữ Nghệ An' }
      ]
    },
    'Hà Tĩnh': {
      hero: { query: 'Biển Thiên Cầm Hà Tĩnh', fallback: 'https://thiencam.net/wp-content/uploads/2017/04/thien-cam-ha-tinh.jpg' },
      items: [
        { name: 'Biển Thiên Cầm', query: 'Bãi biển Thiên Cầm Hà Tĩnh' },
        { name: 'Ngã Ba Đồng Lộc', query: 'Ngã Ba Đồng Lộc linh thiêng' },
        { name: 'Chùa Hương Tích', query: 'Chùa Hương Tích Hà Tĩnh núi Hồng Lĩnh' },
        { name: 'Hồ Kẻ Gỗ', query: 'Hồ Kẻ Gỗ Hà Tĩnh' },
        { name: 'Hải Đăng Cửa Sót', query: 'Hải Đăng Cửa Sót Hà Tĩnh' }
      ]
    }
  };

  const output = {};
  for (const [prov, conf] of Object.entries(PROVINCES)) {
    console.log('Processing:', prov);
    const heroImg = await findWorkingImage(conf.hero.query, conf.hero.fallback);
    const gallery = [];
    for (const item of conf.items) {
      const img = await findWorkingImage(item.query, heroImg);
      gallery.push({ name: item.name, image: img });
      console.log('  ->', item.name, ':', img.substring(0, 60));
    }
    output[prov] = { heroImage: heroImg, gallery };
  }

  fs.writeFileSync('backend/data/spotlight_images_verified.json', JSON.stringify(output, null, 2));
  console.log('DONE! Saved to backend/data/spotlight_images_verified.json');
}

run();
