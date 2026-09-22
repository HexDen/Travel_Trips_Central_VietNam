const mongoose = require('mongoose');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}
require('dotenv').config({ path: './.env' });
const Place = require('./models/Place');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const total = await Place.countDocuments();
  const noImg = await Place.countDocuments({ image: { $exists: false } });
  const nullImg = await Place.countDocuments({ image: null });
  const emptyImg = await Place.countDocuments({ image: '' });
  const defaultImg = await Place.countDocuments({ image: /default|placeholder|unsplash/i });
  console.log({ total, noImg, nullImg, emptyImg, defaultImg });
  process.exit(0);
}
run();
