const axios = require('axios')
const dns = require('dns')
try { dns.setServers(['8.8.8.8']) } catch(e) {}
require('dotenv').config({ path: './backend/.env' })

async function test(m) {
  try {
    const t0 = Date.now()
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: 'Trích xuất 5 địa điểm Đà Nẵng: [{"name":"..."}]' }] }] },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    )
    console.log('Model', m, 'OK in', Date.now() - t0, 'ms')
  } catch(e) {
    console.log('Model', m, 'FAILED:', e?.response?.status, e?.response?.data?.error?.message || e.message)
  }
}

async function main() {
  await test('gemini-1.5-flash')
  await test('gemini-2.0-flash')
  await test('gemini-2.5-flash')
}

main()
