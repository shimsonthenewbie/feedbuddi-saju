// 사용법은 README.md. i18n/batch-*.json 을 번역해서 out/<언어>/batch-*.json 에 저장한다. 끝난 묶음은 건너뛴다.
import fs from 'node:fs'
import path from 'node:path'
import { HERE, generate, log, sleep } from './lib.mjs'
import { systemPrompt, check, NAMES } from './translation-rules.mjs'

const MODEL = process.env.TEXT_MODEL || 'gemini-2.5-flash'
const lang = ((process.argv.find((a) => a.startsWith('--lang=')) || '--lang=en').slice(7))
const target = NAMES[lang] || lang
const OUT = path.join(HERE, 'out', lang)
const dir = process.env.I18N_DIR || path.join(HERE, "i18n")
fs.mkdirSync(OUT, { recursive: true })

const SYSTEM = systemPrompt(target)

const files = fs.readdirSync(dir).filter((f) => /^batch-\d+\.json$/.test(f)).sort()
let done = 0
for (const f of files) {
  const out = path.join(OUT, f)
  if (fs.existsSync(out)) { done++; continue }
  const src = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
  let ok = false
  for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
    const r = await generate(MODEL, {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(src) }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
    })
    let got; try { got = JSON.parse(r.parts.map((p) => p.text || '').join('')) } catch { got = null }
    const why = check(src, got)
    if (!why) { fs.writeFileSync(out, JSON.stringify(got)); ok = true; done++; log(`✓ ${f} (${done}/${files.length})`) }
    else { log(`⚠ ${f} 검사 실패(${attempt}/4): ${why}`); await sleep(3000) }
  }
  if (!ok) log(`✗ ${f} 는 4번 해도 안 돼서 건너뛰어요. 다시 실행하면 이것만 다시 해요.`)
  await sleep(Number(process.env.GAP_SEC || 4) * 1000)
}
log(`끝! ${done}/${files.length} 묶음 완료. 결과: tools/gemini/out/${lang}`)
