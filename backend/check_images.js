const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch(e){}
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Place = require('./models/Place');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const places = await Place.find({ name: { $in: ['Nhà hàng Nhà Gỗ Việt Đà Nẵng', 'Quốc Tự Tam Thai', 'Làng gốm Thanh Hà', 'Quán Cao Lầu Thanh'] } });
  places.forEach(p => console.log(p.name, '=>', p.image));
  
  // also let's just log 5 items with a googleusercontent image to see what they are
  const gg = await Place.find({ image: /googleusercontent/ }).limit(5);
  console.log('\n--- sample google images ---');
  gg.forEach(p => console.log(p.name, '=>', p.image));
  
  // and check unsplash
  const unsplash = await Place.find({ image: /unsplash/ }).limit(5);
  console.log('\n--- sample unsplash images ---');
  unsplash.forEach(p => console.log(p.name, '=>', p.image));

  process.exit();
}).catch(console.error);
