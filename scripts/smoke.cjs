// 화면 자동 점검: 홈에서 갈 수 있는 모든 메뉴를 한 번씩 열어 오류·빈 화면·깨진 글자(undefined, NaN)를 찾는다.
// 쓰는 법: npm run build && npx vite preview --port 4174 &  그리고  npm run smoke
const { chromium, devices } = require('playwright')
const BASE = process.env.SMOKE_URL || 'http://localhost:4174/'
const PROFILE = { y: 1996, m: 10, d: 28, hh: 9, mm: 4, gender: 'M', unk: false, lat: 35.16, lon: 126.85, place: '광주' }
;(async () => {
  const b = await chromium.launch(); let fail = 0
  for (const locale of ['ko-KR', 'en-US']) {
    const c = await b.newContext({ ...devices['Pixel 7'], locale }); const p = await c.newPage()
    let errs = []; p.on('pageerror', (e) => errs.push(e.message))
    await p.addInitScript((pr) => localStorage.setItem('fb-saju-profile', JSON.stringify(pr)), PROFILE)
    await p.goto(BASE); await p.waitForTimeout(1500)
    const modes = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-mode]')].map((e) => e.dataset.mode))])
    for (const m of modes) {
      errs = []
      await p.goto(BASE); await p.waitForTimeout(700)
      await p.evaluate((mm) => document.querySelector(`[data-mode="${mm}"]`).click(), m); await p.waitForTimeout(2600)
      const txt = await p.evaluate(() => document.getElementById('app').innerText)
      const wide = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
      const bad = []; if (errs.length) bad.push('오류: ' + errs[0].slice(0, 100)); if (txt.length < 250) bad.push('빈 화면'); if (/undefined|NaN|\[object Object\]/.test(txt)) bad.push('깨진 글자: ' + (txt.match(/.{0,25}(undefined|NaN|\[object Object\]).{0,25}/) || [''])[0].replace(/\s+/g, ' ')); if (wide) bad.push('가로로 넘침')
      if (bad.length) fail++
      console.log(`${locale.slice(0, 2)} ${m.padEnd(8)} ${bad.length ? '✗ ' + bad.join(' / ') : '✓'}`)
    }
    await c.close()
  }
  await b.close(); console.log(fail ? `실패 ${fail}건` : '모두 통과'); process.exit(fail ? 1 : 0)
})()
