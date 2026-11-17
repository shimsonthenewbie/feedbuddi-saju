// 사용법은 README.md. i18n/batch-*.json 을 번역해서 out/<언어>/batch-*.json 에 저장한다. 끝난 묶음은 건너뛴다.
import fs from 'node:fs'
import path from 'node:path'
import { HERE, generate, log, sleep } from './lib.mjs'

const MODEL = process.env.TEXT_MODEL || 'gemini-2.5-flash'
const lang = ((process.argv.find((a) => a.startsWith('--lang=')) || '--lang=en').slice(7))
const NAMES = { en: 'English', ja: 'Japanese', zh: 'Simplified Chinese', 'zh-TW': 'Traditional Chinese', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese', id: 'Indonesian', th: 'Thai', vi: 'Vietnamese', ru: 'Russian', ar: 'Arabic', hi: 'Hindi', tr: 'Turkish' }
const target = NAMES[lang] || lang
const OUT = path.join(HERE, 'out', lang)
const dir = process.env.I18N_DIR || path.join(HERE, "i18n")
fs.mkdirSync(OUT, { recursive: true })

const SYSTEM = `You translate Korean UI text and fortune-telling copy for "Yongyong Saju", a friendly Korean fortune app, into ${target}.
VOICE: like a popular fortune/horoscope app (the Korean app "Jeomsin" is the model): warm, chatty, plain everyday words that anyone can understand at a glance. No jargon walls, no stiff or literary phrasing, no mystical over-the-top language. Short sentences. Explain a fortune term in simple words the first time it matters. Soft wording ("tends to", "may", "a good day to…") instead of absolute predictions. Do not make the text longer than the Korean unless clarity needs it.
GLOSSARY (use consistently): 사주=Four Pillars (Saju); 일간=Day Master; 오행=Five Elements (Wood, Fire, Earth, Metal, Water); 용신=Useful God (your helpful element); 십성=Ten Gods; 대운=Luck Cycle; 세운=Yearly Luck; 궁합=Compatibility; 토정비결=Tojeong Bigyeol; 주역=I Ching; 택일=Auspicious Date Picking; 띠=zodiac animal; 용용이=Yongyong (mascot name, keep). For other languages, keep the same logic and use the most natural established term.
RULES: Return ONLY a JSON array of {"id","en"} objects, one per input item, same ids, same order (the field is always named "en" even for other languages). Keep \${...} placeholders, HTML tags, \\n, emoji and Chinese characters (甲乙丙丁 etc.) exactly as they are, only moving them where the grammar needs. Never leave Korean characters in the output.`

const files = fs.readdirSync(dir).filter((f) => /^batch-\d+\.json$/.test(f)).sort()
function check(src, got) {
  if (!Array.isArray(got) || got.length !== src.length) return `개수가 달라요 (${got?.length}/${src.length})`
  for (let i = 0; i < src.length; i++) {
    const g = got[i]
    if (!g || g.id !== src[i].id || typeof g.en !== 'string' || !g.en.trim()) return `${src[i].id}: id나 내용이 이상해요`
    if (/[가-힣]/.test(g.en.replace(/\$\{[^}]*\}/g, ""))) return `${g.id}: 한글이 남았어요`
    const a = (src[i].ko.match(/\$\{[^}]*\}/g) || []).sort().join('|'), b = (g.en.match(/\$\{[^}]*\}/g) || []).sort().join('|')
    if (a !== b) return `${g.id}: \${} 부분이 달라졌어요`
    const ta = (src[i].ko.match(/<\/?\w+[^>]*>/g) || []).length, tb = (g.en.match(/<\/?\w+[^>]*>/g) || []).length
    if (ta !== tb) return `${g.id}: HTML 태그 수가 달라졌어요`
  }
  return ''
}
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
