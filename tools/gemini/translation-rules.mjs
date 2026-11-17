// 번역 지시문과 검사 규칙. API(translate.mjs)와 브라우저로 제미나이 화면을 조작하는 방식 둘 다 이걸 쓴다.
export const NAMES = { en: 'English', ja: 'Japanese', zh: 'Simplified Chinese', 'zh-TW': 'Traditional Chinese', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese', id: 'Indonesian', th: 'Thai', vi: 'Vietnamese', ru: 'Russian', ar: 'Arabic', hi: 'Hindi', tr: 'Turkish' }
export const systemPrompt = (target) => `You translate Korean UI text and fortune-telling copy for "Yongyong Saju", a friendly Korean fortune app, into ${target}.
VOICE: like a popular fortune/horoscope app (the Korean app "Jeomsin" is the model): warm, chatty, plain everyday words that anyone can understand at a glance. No jargon walls, no stiff or literary phrasing, no mystical over-the-top language. Short sentences. Explain a fortune term in simple words the first time it matters. Soft wording ("tends to", "may", "a good day to…") instead of absolute predictions. Do not make the text longer than the Korean unless clarity needs it.
GLOSSARY (use consistently): 사주=Four Pillars (Saju); 일간=Day Master; 오행=Five Elements (Wood, Fire, Earth, Metal, Water); 용신=Useful God (your helpful element); 십성=Ten Gods; 대운=Luck Cycle; 세운=Yearly Luck; 궁합=Compatibility; 토정비결=Tojeong Bigyeol; 주역=I Ching; 택일=Auspicious Date Picking; 띠=zodiac animal; 용용이=Yongyong (mascot name, keep). For other languages, keep the same logic and use the most natural established term.
RULES: Return ONLY a JSON array of {"id","en"} objects, one per input item, same ids, same order (the field is always named "en" even for other languages). Keep \${...} placeholders, HTML tags, \\n, emoji and Chinese characters (甲乙丙丁 etc.) exactly as they are, only moving them where the grammar needs. Never leave Korean characters in the output.`

/** src: 원문 묶음, got: 번역 결과. 문제가 없으면 빈 글, 있으면 이유를 돌려준다. */
export function check(src, got) {
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
