// 사용법은 README.md. 그림을 하나씩 만들어 out/images 에 저장한다. 이미 있는 그림은 건너뛰므로 언제 꺼도, 다시 켜도 이어진다.
import fs from 'node:fs'
import path from 'node:path'
import { HERE, generate, log, sleep } from './lib.mjs'

const MODELS = process.env.IMAGE_MODEL ? process.env.IMAGE_MODEL.split(',') : ['gemini-2.5-flash-image', 'gemini-2.0-flash-preview-image-generation', 'gemini-2.0-flash-exp-image-generation']
let MODEL = MODELS[0]
const OUT = path.join(HERE, 'out', 'images')
const BASEDIR = path.join(HERE, 'out', 'base')
const REF = path.join(HERE, 'ref')
const args = process.argv.slice(2)
const cmd = args[0] && !args[0].startsWith('--') ? args[0] : 'all'
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean)
const dry = args.includes('--dry')
const pauseMs = Number(process.env.GAP_SEC || 8) * 1000   // 호출 사이 간격: 분당 한도를 덜 건드리려고

const P = JSON.parse(fs.readFileSync(path.join(HERE, 'prompts.json'), 'utf8'))
const refs = (names) => names.filter((n) => fs.existsSync(path.join(REF, n))).map((n) => ({ inlineData: { mimeType: 'image/png', data: fs.readFileSync(path.join(REF, n)).toString('base64') } }))

async function draw(prompt, refParts, file, aspect = '1:1') {
  if (dry) { console.log('\n──', path.basename(file), aspect, '\n' + prompt); return true }
  let r
  for (;;) {
    try {
      const is25 = /2\.5|3/.test(MODEL)
      r = await generate(MODEL, {
        contents: [{ role: 'user', parts: [...refParts, { text: prompt + (is25 || aspect === '1:1' ? '' : ' Wide 16:9 composition.') }] }],
        generationConfig: is25 ? { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } } : { responseModalities: ['TEXT', 'IMAGE'] },
      })
      break
    } catch (e) {
      if (!e.noQuota) throw e
      log(`⚠ ${MODEL}: ${e.message}`)
      const next = MODELS[MODELS.indexOf(MODEL) + 1]
      if (!next) { console.error('\n쓸 수 있는 그림 모델이 없어요. 무료 키로는 API 그림 만들기가 막혀 있는 거예요. README의 "대안"을 보세요.'); process.exit(2) }
      MODEL = next; log(`→ ${MODEL} 로 바꿔서 해 봐요`)
    }
  }
  const img = r.parts.find((p) => p.inlineData?.data)
  if (!img) { log(`⚠ ${path.basename(file)}: 그림이 안 나왔어요${r.blocked ? ` (막힘: ${r.blocked})` : ''} — 건너뛰어요. 나중에 다시 켜면 이 그림만 다시 시도해요`); return false }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, Buffer.from(img.inlineData.data, 'base64'))
  log(`✓ ${path.basename(file)}`)
  return true
}

if (cmd === 'base') {
  // 1단계: 램프 없이 짧은 꼬리와 발이 있는 새 용용이 후보 4장
  const old = refs(['dragon-old.png'])
  if (!old.length && !dry) { console.error('ref/dragon-old.png (지금 램프 타는 용용이 그림)를 넣어 주세요.'); process.exit(1) }
  const prompt = "Redraw the attached dragon mascot with the exact same face, colors, horns and cute sticker style, but remove the lamp and the smoke completely. Give it a chubby standing body, two short legs with small round feet, and one SHORT short tail (not long). Full body, front-facing, friendly smile, arms relaxed. Plain pure white background, generous margin, no text, no letters, no frame, no drop shadow."
  for (let i = 1; i <= 4; i++) { const f = path.join(BASEDIR, `base-${i}.png`); if (!fs.existsSync(f)) { await draw(prompt, old, f); await sleep(pauseMs) } }
  console.log('\n후보가 out/base 에 있어요. 마음에 드는 한 장을 tools/gemini/ref/dragon-ref.png 로 복사해 두고 `node gen-images.mjs` 를 실행하세요.')
  process.exit(0)
}

if (!fs.existsSync(path.join(REF, 'dragon-ref.png')) && !dry) { console.error('먼저 `node gen-images.mjs base` 로 새 용용이를 만들고, 고른 한 장을 ref/dragon-ref.png 로 복사해 주세요.'); process.exit(1) }
const ref = refs(['dragon-ref.png'])
let todo = []
for (const g of P.groups) for (const it of g.items) {
  if (only.length && !only.includes(it.id) && !only.includes(g.id)) continue
  const file = path.join(OUT, it.id + '.png')
  if (fs.existsSync(file)) continue
  const mascot = g.id === 'pose' || g.id === 'time'
  const style = mascot ? P.style.replace('Each subject sits on a soft pastel circle badge. ', '').replace('outside the badge', '') : P.style
  const aspect = g.id === 'time' ? '16:9' : '1:1'
  todo.push({ it, file, aspect, prompt: `${style}\n\nSubject: ${it.desc}.${aspect === '16:9' ? ' Wide 16:9 scene composition.' : ''}` })
}
todo.sort((a, b) => 0)
log(`만들 그림 ${todo.length}장 (이미 있는 건 건너뛰었어요). 모델: ${MODEL}`)
let ok = 0
for (const t of todo) { if (await draw(t.prompt, ref, t.file, t.aspect)) ok++; if (!dry) await sleep(pauseMs) }
log(`끝! ${ok}/${todo.length}장 만들었어요.${ok < todo.length ? ' 못 만든 그림은 다시 실행하면 그것만 다시 해요.' : ''}`)
