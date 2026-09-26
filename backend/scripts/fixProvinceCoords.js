/**
 * Fix coordinates for places that are stuck at Đà Nẵng default (16.0544, 108.2022)
 * Only updates places where lat/lng are still the fallback value.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../models/Place');

const PROVINCE_DEFAULT_COORDS = {
  'thanh hóa': { lat: 19.8073, lng: 105.7755 },
  'nghệ an': { lat: 18.6734, lng: 105.6928 },
  'hà tĩnh': { lat: 18.3560, lng: 105.8874 },
  'quảng bình': { lat: 17.4700, lng: 106.6000 },
  'quảng trị': { lat: 16.7450, lng: 107.1850 },
  'huế': { lat: 16.4637, lng: 107.5909 },
  'thừa thiên huế': { lat: 16.4637, lng: 107.5909 },
  'đà nẵng': { lat: 16.0544, lng: 108.2022 },
  'quảng nam': { lat: 15.5600, lng: 108.4800 },
  'quảng ngãi': { lat: 15.1200, lng: 108.8000 },
  'bình định': { lat: 13.7820, lng: 109.2190 },
  'phú yên': { lat: 13.0880, lng: 109.3080 },
  'khánh hòa': { lat: 12.2388, lng: 109.1967 },
  'ninh thuận': { lat: 11.5666, lng: 108.9833 },
  'bình thuận': { lat: 10.9333, lng: 108.1000 },
  'gia lai': { lat: 13.9833, lng: 108.0000 },
  'đắk lắk': { lat: 12.6696, lng: 108.0503 },
  'đắk nông': { lat: 12.0045, lng: 107.6904 },
  'kon tum': { lat: 14.3497, lng: 108.0004 },
  'lâm đồng': { lat: 11.9465, lng: 108.4419 }
};

async function fixCoords() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  // Tìm tất cả places có lat/lng là giá trị default của Đà Nẵng
  const badPlaces = await Place.find({
    latitude: { $gte: 16.053, $lte: 16.056 },
    longitude: { $gte: 108.200, $lte: 108.205 }
  });
  
  console.log(`Found ${badPlaces.length} places with Đà Nẵng default coordinates.`);

  // Group by destination để thống kê
  const byDest = {};
  for (const p of badPlaces) {
    byDest[p.destination] = (byDest[p.destination] || 0) + 1;
  }
  console.log('Breakdown by destination:', byDest);

  const bulkOps = [];
  let fixed = 0;
  let skipped = 0;

  for (const place of badPlaces) {
    const destKey = (place.destination || '').toLowerCase().trim();
    const coords = PROVINCE_DEFAULT_COORDS[destKey];
    
    if (coords) {
      // Add small random offset so places are spread out, not exactly same point
      const lat = Number((coords.lat + (Math.random() - 0.5) * 0.04).toFixed(6));
      const lng = Number((coords.lng + (Math.random() - 0.5) * 0.04).toFixed(6));
      bulkOps.push({
        updateOne: {
          filter: { _id: place._id },
          update: { $set: { latitude: lat, longitude: lng } }
        }
      });
      fixed++;
    } else {
      skipped++;
    }
  }

  console.log(`Will update ${fixed} places. Skipping ${skipped} (no province mapping).`);

  if (bulkOps.length > 0) {
    const BATCH = 500;
    let total = 0;
    for (let i = 0; i < bulkOps.length; i += BATCH) {
      const chunk = bulkOps.slice(i, i + BATCH);
      const res = await Place.bulkWrite(chunk, { ordered: false });
      total += res.modifiedCount || 0;
      console.log(`Updated ${Math.min(i + BATCH, bulkOps.length)}/${bulkOps.length}...`);
    }
    console.log(`✅ Done! Total modified: ${total}`);
  }

  // Verify
  const remaining = await Place.countDocuments({
    latitude: { $gte: 16.053, $lte: 16.056 },
    longitude: { $gte: 108.200, $lte: 108.205 }
  });
  console.log(`Remaining places with Đà Nẵng default coords: ${remaining}`);

  // Sample check for Thanh Hóa
  const sample = await Place.find({ destination: 'Thanh Hóa' }).limit(3);
  sample.forEach(p => console.log(`  ${p.name}: [${p.latitude}, ${p.longitude}]`));

  process.exit(0);
}

fixCoords().catch(err => { console.error(err); process.exit(1); });
