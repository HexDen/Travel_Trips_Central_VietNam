const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const queries = [
    { id: 'Quảng Bình', q: 'Động Thiên Đường Quảng Bình' },
    { id: 'Quảng Trị', q: 'Thành cổ Quảng Trị' },
    { id: 'Quảng Ngãi', q: 'Đảo Lý Sơn Quảng Ngãi' },
    { id: 'Bình Định', q: 'Eo Gió Kỳ Co Quy Nhơn' },
    { id: 'Phú Yên', q: 'Gành Đá Đĩa Phú Yên' },
    { id: 'Bình Thuận', q: 'Đồi cát Mũi Né' },
    { id: 'Kon Tum', q: 'Nhà thờ gỗ Kon Tum' },
    { id: 'Gia Lai', q: 'Biển hồ Pleiku' },
    { id: 'Đắk Lắk', q: 'Bảo tàng thế giới cà phê' },
    { id: 'Đắk Nông', q: 'Hồ Tà Đùng' }
  ];
  const results = {};
  for(let {id, q} of queries) {
    try {
      await page.goto(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`);
      await page.waitForSelector('img.YQ4gaf', { timeout: 3000 });
      const src = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img.YQ4gaf');
        for (let img of imgs) {
          if (img.src && img.src.startsWith('http') && !img.src.includes('gstatic')) return img.src;
        }
        return document.querySelector('img').src;
      });
      results[id] = src;
    } catch(e) {
      results[id] = null;
    }
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}
run();
