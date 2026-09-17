const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch(e){}
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Place = require('./models/Place');

async function fixImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await Place.updateMany(
      { image: /gstatic\.com/ },
      { $unset: { image: 1 } }
    );
    console.log('Fixed places:', result.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixImages();
