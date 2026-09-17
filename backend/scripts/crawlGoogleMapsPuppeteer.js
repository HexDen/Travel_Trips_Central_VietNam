const path = require('path');
const fs = require('fs');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const puppeteer = require('puppeteer-core');
const Place = require('../models/Place');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-travel';

function getBrowserPath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (p && fs.existsSync(p)) return p;
  }
  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

const DESTINATIONS = [
  'Đà Nẵng', 'Huế', 'Khánh Hòa', 'Lâm Đồng', 'Quảng Nam',
  'Quảng Ngãi', 'Quảng Bình', 'Quảng Trị', 'Gia Lai', 'Đắk Lắk', 
  'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Bình Định', 'Phú Yên', 
  'Ninh Thuận', 'Bình Thuận', 'Đắk Nông', 'Kon Tum'
];

const QUERY_TEMPLATES = [
  { q: 'khu du lịch sinh thái điểm tham quan {dest}', type: 'attraction' },
  { q: 'địa điểm check in đẹp nổi tiếng {dest}', type: 'attraction' },
  { q: 'bảo tàng di tích lịch sử {dest}', type: 'attraction' },
  { q: 'bãi biển hòn đảo đẹp {dest}', type: 'attraction' },
  { q: 'chùa đền nhà thờ linh thiêng {dest}', type: 'attraction' },
  { q: 'nhà hàng quán ăn đặc sản ngon {dest}', type: 'restaurant' },
  { q: 'quán hải sản tươi sống {dest}', type: 'restaurant' },
  { q: 'quán ăn vặt vỉa hè ngon {dest}', type: 'restaurant' },
  { q: 'quán cafe view đẹp {dest}', type: 'cafe' },
  { q: 'khách sạn 3 sao 4 sao 5 sao {dest}', type: 'hotel' },
  { q: 'homestay resort nghỉ dưỡng {dest}', type: 'hotel' }
];

function upgradeGooglePhotoResolution(url) {
  if (!url) return null;
  return url.replace(/=w\d+-h\d+[^"]*/, '=w800-h600-k-no').replace(/=s\d+[^"]*/, '=s800');
}

function extractCoordsFromUrl(url) {
  if (!url) return { lat: null, lon: null };
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) };
  const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) return { lat: parseFloat(dataMatch[1]), lon: parseFloat(dataMatch[2]) };
  return { lat: null, lon: null };
}

async function scrapeGoogleMapsPlaces(page, query, destination, type, maxResults = 40) {
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=vi`;
  process.stdout.write(`   👉 [${type.toUpperCase()}] "${query}" ... `);

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('div[role="feed"], .hfpxzc', { timeout: 10000 }).catch(() => {});

    // Scroll to load more items
    await page.evaluate(async (maxCount) => {
      const feed = document.querySelector('div[role="feed"]') || document.body;
      let lastHeight = 0;
      let retries = 0;
      
      while (document.querySelectorAll('div.Nv2PK, div[role="article"]').length < maxCount && retries < 5) {
        feed.scrollTop = feed.scrollHeight;
        await new Promise(r => setTimeout(r, 1500));
        
        let newHeight = feed.scrollHeight;
        if (newHeight === lastHeight) {
          retries++;
          // Sometimes it shows "You've reached the end of the list."
          const endText = Array.from(document.querySelectorAll('span')).find(el => el && el.textContent && el.textContent.includes('hết danh sách'));
          if(endText) break;
        } else {
          retries = 0;
          lastHeight = newHeight;
        }
      }
    }, maxResults);

    const places = await page.evaluate(() => {
      const items = [];
      const cards = document.querySelectorAll('div.Nv2PK, div[role="article"]');

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const linkEl = card.querySelector('a.hfpxzc, a[href*="/maps/place/"]');
        const nameEl = card.querySelector('.qBF1Pd, [role="heading"]');
        const ratingEl = card.querySelector('span.MW4etd');
        const imgEl = Array.from(card.querySelectorAll('img')).find(img => img.src && img.src.includes('googleusercontent') && !img.src.includes('default_user'));
        const addressEl = card.querySelector('.W4Efsb:last-child');

        const name = nameEl ? nameEl.textContent.trim() : (linkEl ? linkEl.getAttribute('aria-label') : null);
        const href = linkEl ? linkEl.getAttribute('href') : null;
        const ratingText = ratingEl ? ratingEl.textContent.trim() : '4.5';
        const rating = parseFloat(ratingText.replace(',', '.')) || 4.5;
        const image = imgEl ? imgEl.getAttribute('src') : null;
        let address = addressEl ? addressEl.textContent.trim() : '';

        // Clean up address text (remove "·")
        if (address.includes('·')) {
            address = address.split('·').pop().trim();
        }

        if (name && name.length > 2) {
          items.push({ name, href, rating, image, address });
        }
      }
      return items;
    });

    let saved = 0;
    const finalPlaces = places.slice(0, maxResults); // cap at maxResults
    
    for (const p of finalPlaces) {
      const hdImage = upgradeGooglePhotoResolution(p.image);
      const coords = extractCoordsFromUrl(p.href);

      let cost = 50000;
      if(type === 'hotel') cost = Math.floor(Math.random() * 1000000) + 400000; // 400k-1.4tr
      if(type === 'restaurant') cost = Math.floor(Math.random() * 200000) + 50000; // 50k-250k
      if(type === 'cafe') cost = Math.floor(Math.random() * 40000) + 25000; // 25k-65k
      if(type === 'attraction') cost = Math.floor(Math.random() * 100000) + 20000;

      const doc = {
        name: p.name,
        destination: destination,
        type: type,
        rating: p.rating,
        address: p.address && p.address.length > 2 ? p.address : `${p.name}, ${destination}`,
        description: `Địa điểm ${type === 'attraction' ? 'du lịch tham quan' : type === 'restaurant' ? 'ẩm thực đặc sản' : type === 'cafe' ? 'quán cafe check-in' : 'khách sạn nghỉ dưỡng'} chất lượng cao trên Google Maps tại ${destination}.`,
        tags: [destination.toLowerCase(), type, p.name.toLowerCase()],
        estimated_cost: cost
      };

      if (hdImage) doc.image = hdImage;
      if (coords.lat && coords.lon) {
        doc.latitude = coords.lat;
        doc.longitude = coords.lon;
      }

      const existing = await Place.findOne({ name: p.name, destination: destination });
      if (existing) {
        const updateFields = { rating: p.rating };
        if (hdImage) updateFields.image = hdImage;
        if (coords.lat && coords.lon) {
          updateFields.latitude = coords.lat;
          updateFields.longitude = coords.lon;
        }
        await Place.updateOne({ _id: existing._id }, { $set: updateFields });
      } else {
        await Place.create(doc);
      }
      saved++;
    }

    console.log(`✅ Lưu mới/cập nhật: ${saved}/${finalPlaces.length} (Tổng cuộn thấy: ${places.length})`);
    return saved;
  } catch (err) {
    console.log(`⚠️ Lỗi: ${err.message}`);
    return 0;
  }
}

async function runGoogleMapsCrawler() {
  console.log('==================================================================');
  console.log('🚀 BẮT ĐẦU CÀO SÂU & RỘNG DỮ LIỆU GOOGLE MAPS (19 TỈNH MIỀN TRUNG)');
  console.log('==================================================================\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!');

    const browserPath = getBrowserPath();
    console.log(`🌐 Khởi chạy Chrome: ${browserPath}\n`);

    const browser = await puppeteer.launch({
      executablePath: browserPath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=vi-VN,vi', '--window-size=1280,800']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    let totalSynced = 0;

    for (const dest of DESTINATIONS) {
      console.log(`\n📍 [${dest.toUpperCase()}] Bắt đầu thu thập dữ liệu sâu...`);
      for (const tpl of QUERY_TEMPLATES) {
        const query = tpl.q.replace('{dest}', dest);
        const count = await scrapeGoogleMapsPlaces(page, query, dest, tpl.type, 35); // Max 35 places per query to speed up slightly
        totalSynced += count;
        await new Promise(r => setTimeout(r, 1500)); // anti-captcha delay
      }
    }

    await browser.close();
    console.log('\n==================================================================');
    console.log(`🎉 HOÀN TẤT! ĐÃ THU THẬP & CẬP NHẬT: ${totalSynced} ĐỊA ĐIỂM.`);
    console.log('==================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi tiến trình:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runGoogleMapsCrawler();
}

module.exports = { runGoogleMapsCrawler };
