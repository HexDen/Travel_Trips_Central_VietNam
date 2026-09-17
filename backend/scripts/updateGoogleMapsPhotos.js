const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../models/Place');
const { getRealImageFromGoogleMaps } = require('../services/googleMapsService');

const MONGODB_URI = process.env.MONGODB_URI;

async function updateAllPhotos() {
  if (!process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
    console.error('❌ LỖI: Chưa cấu hình GOOGLE_MAPS_API_KEY trong file .env');
    console.log('Vui lòng thêm API Key của Google Maps vào file .env và thử lại.');
    process.exit(1);
  }

  console.log('🔄 Đang kết nối tới MongoDB Atlas...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!\n');

    // Lấy tất cả các địa điểm đang dùng ảnh Unsplash (hoặc lấy tất cả để cập nhật lại)
    // Chúng ta có thể filter bằng cách kiểm tra chữ 'unsplash' trong URL
    const placesToUpdate = await Place.find({
      image: { $regex: 'unsplash.com', $options: 'i' }
    });

    console.log(`Tìm thấy ${placesToUpdate.length} địa điểm đang dùng ảnh giả lập (Unsplash). Bắt đầu lấy ảnh chân thật từ Google Maps...`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < placesToUpdate.length; i++) {
      const place = placesToUpdate[i];
      console.log(`[${i + 1}/${placesToUpdate.length}] Đang xử lý: ${place.name} (${place.destination})...`);
      
      const realPhotoUrl = await getRealImageFromGoogleMaps(place.name, place.destination);
      
      if (realPhotoUrl) {
        place.image = realPhotoUrl;
        await place.save();
        successCount++;
        console.log(`   ✅ Cập nhật ảnh thành công!`);
      } else {
        failCount++;
        console.log(`   ⚠️ Không tìm thấy ảnh thực tế.`);
      }

      // Đợi một chút để tránh vượt quá giới hạn rate limit của Google Maps API (nếu cần)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=======================================');
    console.log(`🎉 HOÀN TẤT CẬP NHẬT ẢNH CHÂN THẬT!`);
    console.log(`✅ Thành công: ${successCount} địa điểm`);
    console.log(`⚠️ Không tìm thấy ảnh: ${failCount} địa điểm`);
    console.log('=======================================');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi hệ thống:', err.message);
    process.exit(1);
  }
}

updateAllPhotos();
