const axios = require('axios');
const cheerio = require('cheerio');

async function getWikiImage(url) {
  try {
    const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const $ = cheerio.load(res.data);
    let img = $('.infobox img').first().attr('src');
    if (!img) img = $('.thumbimage').first().attr('src');
    if (!img) img = $('img').first().attr('src');
    if (img && img.startsWith('//')) img = 'https:' + img;
    return img;
  } catch(e) { return null; }
}

async function run() {
  const pages = {
    'Quảng Bình': 'https://vi.wikipedia.org/wiki/V%C6%B0%E1%BB%9Dn_qu%E1%BB%91c_gia_Phong_Nha_-_K%E1%BA%BB_B%C3%A0ng',
    'Quảng Trị': 'https://vi.wikipedia.org/wiki/Th%C3%A0nh_c%E1%BB%95_Qu%E1%BA%A3ng_Tr%E1%BB%8B',
    'Quảng Ngãi': 'https://vi.wikipedia.org/wiki/L%C3%BD_S%C6%A1n',
    'Bình Định': 'https://vi.wikipedia.org/wiki/Eo_Gi%C3%B3',
    'Phú Yên': 'https://vi.wikipedia.org/wiki/G%C3%A0nh_%C4%90%C3%A1_%C4%90%C4%A9a',
    'Bình Thuận': 'https://vi.wikipedia.org/wiki/M%C5%A9i_N%C3%A9',
    'Kon Tum': 'https://vi.wikipedia.org/wiki/Nh%C3%A0_th%E1%BB%9D_g%E1%BB%97_Kon_Tum',
    'Gia Lai': 'https://vi.wikipedia.org/wiki/Bi%E1%BB%83n_H%E1%BB%93',
    'Đắk Lắk': 'https://vi.wikipedia.org/wiki/B%E1%BA%A3o_t%C3%A0ng_th%E1%BA%BF_gi%E1%BB%9Bi_c%C3%A0_ph%C3%AA',
    'Đắk Nông': 'https://vi.wikipedia.org/wiki/H%E1%BB%93_T%C3%A0_%C4%90%C3%B9ng'
  };
  const results = {};
  for(let [id, url] of Object.entries(pages)) {
    results[id] = await getWikiImage(url);
  }
  console.log(JSON.stringify(results, null, 2));
}
run();
