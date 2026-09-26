const dns = require('dns')
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch(e){}
const puppeteer = require('puppeteer-core');

async function testGmaps() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=vi-VN,vi']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  console.log('Navigating to Google Maps search...');
  await page.goto('https://www.google.com/maps/search/%C4%91%E1%BB%8Ba+%C4%91i%E1%BB%83m+du+l%E1%BB%8Bch+%C4%90%C3%A0+N%E1%BA%B5ng?hl=vi', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('div[role="feed"], .Nv2PK', { timeout: 10000 }).catch(() => {});

  const places = await page.evaluate(() => {
    const items = [];
    const cards = document.querySelectorAll('div.Nv2PK');
    cards.forEach(card => {
      const nameEl = card.querySelector('.qBF1Pd');
      const ratingEl = card.querySelector('span.MW4etd');
      const reviewEl = card.querySelector('span.UY7F9');
      const imgEl = card.querySelector('img[src*="googleusercontent"]');
      const linkEl = card.querySelector('a.hfpxzc');
      
      const name = nameEl ? nameEl.textContent.trim() : null;
      const rating = ratingEl ? ratingEl.textContent.trim() : null;
      const reviews = reviewEl ? reviewEl.textContent.trim() : null;
      const image = imgEl ? imgEl.src : null;
      const href = linkEl ? linkEl.href : null;
      
      if (name) items.push({ name, rating, reviews, image, href });
    });
    return items;
  });

  console.log(`Found ${places.length} places from Google Maps:`);
  console.log(places.slice(0, 5));
  await browser.close();
}

testGmaps().catch(console.error);
