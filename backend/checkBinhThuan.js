const axios = require('axios');
const cheerio = require('cheerio');

async function getBingImage(query) {
  try {
    const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query) + '&form=HDRSC2&first=1';
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    const $ = cheerio.load(res.data);
    const mAttr = $('a.iusc').eq(1).attr('m'); // Get second image
    if (mAttr) {
      return JSON.parse(mAttr).murl;
    }
  } catch (err) {}
  return null;
}

async function run() {
  const url = await getBingImage('Đồi cát Mũi Né Bình Thuận');
  console.log('URL1:', url);
  const mAttr2 = cheerio.load((await axios.get('https://www.bing.com/images/search?q=' + encodeURIComponent('Đồi cát Mũi Né Bình Thuận') + '&form=HDRSC2&first=1', { headers: { 'User-Agent': 'Mozilla/5.0' }})).data)('a.iusc').eq(2).attr('m');
  console.log('URL2:', JSON.parse(mAttr2).murl);
}
run();
