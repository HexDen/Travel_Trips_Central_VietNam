const axios = require('axios');
const cheerio = require('cheerio');
async function getBingImage() {
  const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent('Du lịch di sản miền Trung') + '&form=HDRSC2&first=1';
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(res.data);
  const imgs = $('a.iusc');
  for (let i = 0; i < 5; i++) {
    const m = imgs.eq(i).attr('m');
    if (m) console.log(JSON.parse(m).murl);
  }
}
getBingImage();
