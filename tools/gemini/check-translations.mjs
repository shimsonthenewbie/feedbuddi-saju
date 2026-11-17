// 브라우저로 받은 번역이든 API로 받은 번역이든, out/<언어>/batch-*.json 을 원문과 맞춰 검사한다.
// 사용: node check-translations.mjs [--lang=en]   → 잘못됐거나 빠진 묶음을 알려 준다. (--fix: 잘못된 파일은 지워서 다시 받게 한다)
import fs from 'node:fs'
import path from 'node:path'
import { HERE } from './lib.mjs'
import { check } from './translation-rules.mjs'
const lang = (process.argv.find((a) => a.startsWith('--lang=')) || '--lang=en').slice(7)
const fix = process.argv.includes('--fix')
const dir = path.join(HERE, 'i18n'), out = path.join(HERE, 'out', lang)
let ok = 0, bad = 0, missing = []
for (const f of fs.readdirSync(dir).filter((f) => /^batch-\d+\.json$/.test(f)).sort()) {
  const p = path.join(out, f)
  if (!fs.existsSync(p)) { missing.push(f); continue }
  let why = ''
  try { why = check(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), JSON.parse(fs.readFileSync(p, 'utf8'))) } catch (e) { why = 'JSON이 아니에요: ' + e.message }
  if (why) { bad++; console.log(`✗ ${f}: ${why}`); if (fix) fs.unlinkSync(p) } else ok++
}
console.log(`\n통과 ${ok} · 잘못됨 ${bad}${fix && bad ? '(지웠어요, 다시 받으세요)' : ''} · 아직 없음 ${missing.length}`)
if (missing.length) console.log('없는 묶음:', missing.join(' '))
