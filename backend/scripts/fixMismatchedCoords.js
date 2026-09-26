/**
 * Fix coordinates for ALL places where the destination doesn't match the coordinate region.
 * E.g.: destination='Thanh Hóa' but lat=16.06 (Đà Nẵng region) → set to ~19.8, 105.77
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../models/Place');

// Lat/lng bounding boxes per province
const PROVINCE_BOUNDS = {
  'thanh hóa':    { latMin: 19.2, latMax: 20.6, lngMin: 104.5, lngMax: 106.5, centerLat: 19.8073, centerLng: 105.7755 },
  'nghệ an':      { latMin: 17.9, latMax: 20.0, lngMin: 103.9, lngMax: 105.9, centerLat: 18.6734, centerLng: 105.6928 },
  'hà tĩnh':      { latMin: 17.5, latMax: 18.5, lngMin: 105.3, lngMax: 106.5, centerLat: 18.3560, centerLng: 105.8874 },
  'quảng bình':   { latMin: 16.9, latMax: 18.0, lngMin: 105.8, lngMax: 107.5, centerLat: 17.4700, centerLng: 106.6000 },
  'quảng trị':    { latMin: 16.3, latMax: 17.2, lngMin: 106.4, lngMax: 107.5, centerLat: 16.7450, centerLng: 107.1850 },
  'huế':          { latMin: 15.9, latMax: 16.8, lngMin: 107.0, lngMax: 108.3, centerLat: 16.4637, centerLng: 107.5909 },
  'thừa thiên huế': { latMin: 15.9, latMax: 16.8, lngMin: 107.0, lngMax: 108.3, centerLat: 16.4637, centerLng: 107.5909 },
  'đà nẵng':      { latMin: 15.8, latMax: 16.2, lngMin: 107.8, lngMax: 108.5, centerLat: 16.0544, centerLng: 108.2022 },
  'quảng nam':    { latMin: 14.9, latMax: 16.2, lngMin: 107.6, lngMax: 108.9, centerLat: 15.5600, centerLng: 108.4800 },
  'quảng ngãi':   { latMin: 14.5, latMax: 15.5, lngMin: 108.3, lngMax: 109.4, centerLat: 15.1200, centerLng: 108.8000 },
  'bình định':    { latMin: 13.3, latMax: 14.6, lngMin: 108.6, lngMax: 109.5, centerLat: 13.7820, centerLng: 109.2190 },
  'phú yên':      { latMin: 12.5, latMax: 13.5, lngMin: 108.7, lngMax: 109.5, centerLat: 13.0880, centerLng: 109.3080 },
  'khánh hòa':    { latMin: 11.5, latMax: 12.8, lngMin: 108.5, lngMax: 109.5, centerLat: 12.2388, centerLng: 109.1967 },
  'ninh thuận':   { latMin: 11.0, latMax: 12.1, lngMin: 108.3, lngMax: 109.4, centerLat: 11.5666, centerLng: 108.9833 },
  'bình thuận':   { latMin: 10.3, latMax: 11.6, lngMin: 107.3, lngMax: 108.9, centerLat: 10.9333, centerLng: 108.1000 },
  'gia lai':      { latMin: 12.9, latMax: 14.7, lngMin: 107.3, lngMax: 108.9, centerLat: 13.9833, centerLng: 108.0000 },
  'đắk lắk':     { latMin: 11.8, latMax: 13.2, lngMin: 107.2, lngMax: 109.0, centerLat: 12.6696, centerLng: 108.0503 },
  'đắk nông':    { latMin: 11.3, latMax: 12.4, lngMin: 107.2, lngMax: 108.3, centerLat: 12.0045, centerLng: 107.6904 },
  'kon tum':      { latMin: 13.5, latMax: 15.2, lngMin: 107.1, lngMax: 108.5, centerLat: 14.3497, centerLng: 108.0004 },
  'lâm đồng':     { latMin: 11.2, latMax: 12.5, lngMin: 107.2, lngMax: 108.8, centerLat: 11.9465, centerLng: 108.4419 },
};

function isLatLngInBounds(lat, lng, bounds) {
  return lat >= bounds.latMin && lat <= bounds.latMax && lng >= bounds.lngMin && lng <= bounds.lngMax;
}

async function fixMismatchedCoords() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  const bulkOps = [];
  let fixed = 0;
  let skipped = 0;

  for (const [destName, bounds] of Object.entries(PROVINCE_BOUNDS)) {
    const places = await Place.find({
      destination: new RegExp(`^${destName}$`, 'i')
    }).lean();

    const mismatch = places.filter(p => {
      const lat = parseFloat(p.latitude);
      const lng = parseFloat(p.longitude);
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return true;
      return !isLatLngInBounds(lat, lng, bounds);
    });

    console.log(`${destName}: ${places.length} total, ${mismatch.length} coord mismatches`);

    for (const p of mismatch) {
      const lat = Number((bounds.centerLat + (Math.random() - 0.5) * 0.04).toFixed(6));
      const lng = Number((bounds.centerLng + (Math.random() - 0.5) * 0.04).toFixed(6));
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { latitude: lat, longitude: lng } }
        }
      });
      fixed++;
    }
  }

  console.log(`\nTotal to fix: ${fixed}. Executing...`);

  if (bulkOps.length > 0) {
    const BATCH = 500;
    let total = 0;
    for (let i = 0; i < bulkOps.length; i += BATCH) {
      const chunk = bulkOps.slice(i, i + BATCH);
      const res = await Place.bulkWrite(chunk, { ordered: false });
      total += res.modifiedCount || 0;
      console.log(`Updated ${Math.min(i + BATCH, bulkOps.length)}/${bulkOps.length}...`);
    }
    console.log(`\n✅ Done! Total modified: ${total}`);
  }

  // Verify Thanh Hóa
  const thanhHoaGood = await Place.countDocuments({ destination: 'Thanh Hóa', latitude: { $gte: 19.0, $lte: 21.0 } });
  const thanhHoaTotal = await Place.countDocuments({ destination: 'Thanh Hóa' });
  console.log(`\nVerify Thanh Hóa: ${thanhHoaGood}/${thanhHoaTotal} with correct coords`);

  mongoose.disconnect();
}

fixMismatchedCoords().catch(err => { console.error(err); process.exit(1); });
