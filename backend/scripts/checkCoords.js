require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../models/Place');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Check if 'HB' places with Đà Nẵng coords are really Thanh Hóa
  const r = await Place.find({
    destination: 'Thanh Hóa',
    latitude: { $gte: 15.5, $lte: 17.0 }
  }).limit(5).lean();
  console.log('Thanh Hóa places with Đà Nẵng lat range:');
  r.forEach(p => console.log(`  ${p.name}|${p.latitude}|${p.destination}`));
  
  // Also count how many Thanh Hóa places are in the right lat range
  const total = await Place.countDocuments({ destination: 'Thanh Hóa' });
  const good = await Place.countDocuments({ destination: 'Thanh Hóa', latitude: { $gte: 19.0, $lte: 21.0 } });
  console.log(`Total Thanh Hóa: ${total}, with correct coords (19-21): ${good}`);
  
  mongoose.disconnect();
});
