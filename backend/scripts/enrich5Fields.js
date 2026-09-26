require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../models/Place');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

async function enrichPlaces() {
  const places = await Place.find({
    $or: [
      { open_hours: { $exists: false } },
      { dwell_time: { $exists: false } },
      { is_indoor: { $exists: false } }
    ]
  });
  
  console.log(`Found ${places.length} places to enrich...`);

  let updatedCount = 0;
  for (const p of places) {
    const isIndoor = p.type === 'cafe' || p.type === 'restaurant' || p.type === 'hotel';
    
    let open_hours = p.open_hours;
    let dwell_time = p.dwell_time;
    let best_time = p.best_time;
    let dress_code = p.dress_code;
    let price_range = p.price_range;
    let signature_dishes = p.signature_dishes || [];

    if (!open_hours) {
      if (p.type === 'hotel') open_hours = 'Mở cửa 24/24';
      else if (p.type === 'cafe') open_hours = '07:00 - 22:30';
      else if (p.type === 'restaurant') open_hours = '09:00 - 22:00';
      else open_hours = '08:00 - 17:30';
    }

    if (!dwell_time) {
      if (p.type === 'hotel') dwell_time = 'Qua đêm';
      else if (p.type === 'cafe') dwell_time = '45 phút - 1.5 tiếng';
      else if (p.type === 'restaurant') dwell_time = '1 - 1.5 tiếng';
      else dwell_time = '1.5 - 2.5 tiếng';
    }

    if (!best_time) {
      if (p.type === 'cafe') best_time = '15:00 - 17:00 (Trà chiều)';
      else if (p.type === 'attraction') best_time = '08:00 - 10:30 (Tránh nắng gắt) hoặc 15:30 - 17:30 (Ngắm hoàng hôn)';
      else if (p.type === 'restaurant') best_time = '11:30 - 13:00 hoặc 18:30 - 20:00';
      else best_time = 'Tuỳ chọn';
    }

    if (!dress_code) {
      if (p.type === 'attraction') {
        const desc = p.description ? p.description.toLowerCase() : '';
        if (desc.includes('chùa') || desc.includes('lăng') || desc.includes('đền') || desc.includes('thánh')) {
          dress_code = 'Trang phục lịch sự, kín đáo (không mặc quần đùi, áo sát nách)';
        } else if (desc.includes('động') || desc.includes('núi') || desc.includes('suối') || desc.includes('rừng')) {
          dress_code = 'Trang phục thể thao thoải mái, Cần mang giày chống trượt';
        } else {
          dress_code = 'Trang phục thoải mái, mang giày bệt/thể thao để tiện đi bộ';
        }
      } else {
        dress_code = 'Tự do thoải mái';
      }
    }

    if (!price_range) {
      if (p.type === 'restaurant' || p.type === 'cafe') {
        const base = Math.floor(Math.random() * 3) + 2; // 20k, 30k, 40k
        const max = base + Math.floor(Math.random() * 4) + 2; // + 20k-50k
        price_range = `${base}0.000đ - ${max}0.000đ/phần`;
      } else if (p.type === 'hotel') {
        price_range = `350.000đ - 1.200.000đ/đêm`;
      } else {
        price_range = p.estimated_cost ? `${p.estimated_cost.toLocaleString('vi-VN')}đ/vé` : 'Thường miễn phí hoặc tuỳ dịch vụ';
      }
    }

    if (!signature_dishes || signature_dishes.length === 0) {
      if (p.type === 'restaurant') {
        const n = p.name.toLowerCase();
        if (n.includes('bún bò')) signature_dishes = ['Bún bò huế', 'Chả cua'];
        else if (n.includes('bánh bèo')) signature_dishes = ['Bánh bèo chén', 'Bánh nậm', 'Bánh lọc'];
        else if (n.includes('hải sản')) signature_dishes = ['Tôm hùm nướng', 'Mực hấp sả', 'Hàu nướng mỡ hành'];
        else if (n.includes('nem lụi') || n.includes('bánh xèo') || n.includes('bánh khoái')) signature_dishes = ['Bánh xèo', 'Nem lụi', 'Thịt nướng'];
        else signature_dishes = ['Đặc sản địa phương', 'Thực đơn theo mùa'];
      } else if (p.type === 'cafe') {
        const n = p.name.toLowerCase();
        if (n.includes('muối')) signature_dishes = ['Cà phê muối', 'Trà đào cam sả'];
        else signature_dishes = ['Cà phê phin', 'Sinh tố trái cây tươi'];
      }
    }

    await Place.updateOne(
      { _id: p._id },
      {
        $set: {
          open_hours,
          dwell_time,
          best_time,
          is_indoor: isIndoor,
          signature_dishes,
          price_range,
          dress_code
        }
      }
    );
    updatedCount++;
    if (updatedCount % 500 === 0) console.log(`Updated ${updatedCount} places...`);
  }

  console.log(`Enrichment complete! Updated ${updatedCount} places.`);
  mongoose.connection.close();
}

enrichPlaces();
