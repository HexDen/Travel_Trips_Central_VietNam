const path = require('path');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const Place = require('../models/Place');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-travel';

// Hàm cào ảnh từ Bing Images (Rất nhanh, không cần API Key)
async function getBingImage(query) {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });
    const $ = cheerio.load(res.data);
    const mAttr = $('a.iusc').first().attr('m');
    if (mAttr) {
      const data = JSON.parse(mAttr);
      // LUÔN DÙNG turl (thumbnail của Bing) để tránh lỗi 403 Hotlink Protection từ các website ngoài!
      return data.turl || data.murl;
    }
  } catch (err) {
    // Bỏ qua lỗi 
  }
  return null;
}

async function run() {
  console.log('🔄 Đang kết nối tới MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Kết nối MongoDB thành công!');

  // Sử dụng truy vấn MongoDB để lọc trực tiếp trên server, tránh kéo 5250 bản ghi về nodejs gây lag
  const places = await Place.find({
    $or: [
      { image: null },
      { image: { $exists: false } },
      { image: '' },
      { image: { $regex: 'unsplash.com', $options: 'i' } },
      { image: { $not: /wikimedia|googleusercontent\.com|th\.bing\.com/i } }
    ]
  }, { name: 1, destination: 1, image: 1 }).lean();

  console.log(`🔍 Tìm thấy ${places.length} địa điểm chưa có ảnh thực. Bắt đầu xử lý siêu tốc...`);

  let successCount = 0;
  const BATCH_SIZE = 10; // Xử lý song song 10 địa điểm cùng lúc

  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    const batch = places.slice(i, i + BATCH_SIZE);
    console.log(`[${i}/${places.length}] Đang quét ảnh cho ${batch.length} địa điểm...`);
    
    await Promise.all(batch.map(async (place) => {
      const imgUrl = await getBingImage(`${place.name} ${place.destination}`);
      if (imgUrl) {
        await Place.updateOne({ _id: place._id }, { $set: { image: imgUrl } });
        successCount++;
      }
    }));
    
    // Tạm nghỉ 0.5s giữa các batch để tránh bị chặn
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('=======================================');
  console.log(`🎉 HOÀN TẤT ĐỒNG BỘ ẢNH THẬT BẰNG AI CRAWLER SIÊU TỐC!`);
  console.log(`✅ Đã lấy thêm: ${successCount} ảnh thực tế.`);
  console.log('=======================================');
  process.exit(0);
}

run();
