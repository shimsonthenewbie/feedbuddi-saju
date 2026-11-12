/**
 * 한글 이름 성명학(참고용): 발음오행 흐름과 한글 획수로 본 원·형·이·정 4격.
 * 전통 성명학은 한자 획수를 쓰지만, 한글 이름만으로도 볼 수 있는 방식으로 만들었다.
 * 길흉 수 구분은 널리 쓰이는 81수리 기준을 단순화했고, 풀이 글은 새로 썼다.
 */
export type Wx = '木' | '火' | '土' | '金' | '水'
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const STROKE: Record<string, number> = {
  ㄱ: 2, ㄴ: 2, ㄷ: 3, ㄹ: 5, ㅁ: 4, ㅂ: 4, ㅅ: 2, ㅇ: 1, ㅈ: 3, ㅊ: 4, ㅋ: 3, ㅌ: 4, ㅍ: 4, ㅎ: 3, ㄲ: 4, ㄸ: 6, ㅃ: 8, ㅆ: 4, ㅉ: 6,
  ㅏ: 2, ㅑ: 3, ㅓ: 2, ㅕ: 3, ㅗ: 2, ㅛ: 3, ㅜ: 2, ㅠ: 3, ㅡ: 1, ㅣ: 1, ㅐ: 3, ㅒ: 4, ㅔ: 3, ㅖ: 4, ㅘ: 4, ㅙ: 5, ㅚ: 3, ㅝ: 4, ㅞ: 5, ㅟ: 3, ㅢ: 2,
  ㄳ: 4, ㄵ: 5, ㄶ: 5, ㄺ: 7, ㄻ: 9, ㄼ: 9, ㄽ: 7, ㄾ: 9, ㄿ: 9, ㅀ: 8, ㅄ: 6,
}
const WX_OF: Record<string, Wx> = {}
for (const c of 'ㄱㅋㄲ') WX_OF[c] = '木'
for (const c of 'ㄴㄷㄹㅌㄸ') WX_OF[c] = '火'
for (const c of 'ㅇㅎ') WX_OF[c] = '土'
for (const c of 'ㅅㅈㅊㅆㅉ') WX_OF[c] = '金'
for (const c of 'ㅁㅂㅍㅃ') WX_OF[c] = '水'
const GEN: Record<Wx, Wx> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const CTRL: Record<Wx, Wx> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
export const WX_KO: Record<Wx, string> = { 木: '목', 火: '화', 土: '토', 金: '금', 水: '수' }

export interface Syl { ch: string; strokes: number; wx: Wx }
export function syl(ch: string): Syl | null {
  const c = ch.charCodeAt(0) - 0xac00
  if (c < 0 || c > 11171) return null
  const cho = CHO[Math.floor(c / 588)]
  const jung = JUNG[Math.floor((c % 588) / 28)]
  const jong = JONG[c % 28]
  const st = (STROKE[cho] ?? 0) + (STROKE[jung] ?? 0) + (jong ? STROKE[jong] ?? 0 : 0)
  return { ch, strokes: st, wx: WX_OF[cho] }
}

/** 81수리: 대길/길/흉. 80 넘으면 80을 빼서 본다. */
const TOP = new Set([1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 21, 23, 24, 31, 32, 33, 35, 37, 41, 45, 47, 48, 52, 57, 63, 65, 67, 68, 81])
const OK = new Set([17, 18, 25, 29, 39, 61])
export type Grade = '대길' | '길' | '흉'
export const gradeOf = (n: number): Grade => { const k = n > 81 ? ((n - 1) % 80) + 1 : n; return TOP.has(k) ? '대길' : OK.has(k) ? '길' : '흉' }
export const suriWx = (n: number): Wx => (['水', '木', '木', '火', '火', '土', '土', '金', '金', '水'] as Wx[])[n % 10]

export interface Gyeok { key: '원격' | '형격' | '이격' | '정격'; label: string; n: number; grade: Grade; text: string }
const TXT: Record<Gyeok['key'], [string, string, string]> = {
  원격: ['어린 시절과 바탕의 운', '바탕이 단단하고 어린 시절 기운이 좋은 편이에요.', '바탕에서 애쓸 일이 있을 수 있어요. 기초를 차근차근 다지면 좋아요.'],
  형격: ['사회에 나가서 맞는 운', '직장·사회에서 인정받기 쉬운 흐름이에요.', '사회생활에서 부딪힘이 있을 수 있어요. 말과 태도를 다듬으면 풀려요.'],
  이격: ['사람 관계와 중년의 운', '주변 사람과 잘 어울리고 도움을 받기 좋아요.', '관계에서 오해가 생기기 쉬워서 표현을 분명히 하면 좋아요.'],
  정격: ['이름 전체의 운과 말년', '이름 전체의 기운이 좋아서 오래 갈수록 안정돼요.', '이름 전체 기운은 노력으로 보완할 부분이 있어요. 꾸준함이 열쇠예요.'],
}
export interface NameRead {
  name: string
  syls: Syl[]
  gyeok: Gyeok[]
  flow: { pair: string; rel: '상생' | '상극' | '같은 기운' | '보통'; }[]
  wxCount: Record<Wx, number>
  score: number
  summary: string
}

export function readName(family: string, given: string): NameRead | null {
  const fs = [...family].map(syl)
  const gs = [...given].map(syl)
  if (!fs.length || !gs.length || fs.some((s) => !s) || gs.some((s) => !s) || fs.length > 2 || gs.length > 3) return null
  const F = fs as Syl[], G = gs as Syl[]
  const sum = (a: Syl[]) => a.reduce((x, y) => x + y.strokes, 0)
  const fSum = sum(F), gSum = sum(G)
  const gFirst = G[0].strokes
  const gLast = G.length > 1 ? sum(G.slice(1)) : 0
  const mk = (key: Gyeok['key'], n: number): Gyeok => {
    const g = gradeOf(n)
    return { key, label: TXT[key][0], n, grade: g, text: g === '흉' ? TXT[key][2] : TXT[key][1] }
  }
  const gyeok = [mk('원격', gSum), mk('형격', fSum + gFirst), mk('이격', G.length > 1 ? fSum + gLast : fSum + gFirst), mk('정격', fSum + gSum)]
  const all = [...F, ...G]
  const flow: NameRead['flow'] = []
  for (let i = 0; i + 1 < all.length; i++) {
    const a = all[i].wx, b = all[i + 1].wx
    flow.push({ pair: `${all[i].ch}${all[i + 1].ch}(${WX_KO[a]}→${WX_KO[b]})`, rel: GEN[a] === b || GEN[b] === a ? '상생' : CTRL[a] === b || CTRL[b] === a ? '상극' : a === b ? '같은 기운' : '보통' })
  }
  const wxCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 } as Record<Wx, number>
  all.forEach((s) => wxCount[s.wx]++)
  let score = 0
  gyeok.forEach((g) => { score += g.grade === '대길' ? 2 : g.grade === '길' ? 1 : -1 })
  flow.forEach((f) => { score += f.rel === '상생' ? 1 : f.rel === '상극' ? -1 : 0 })
  const good = gyeok.filter((g) => g.grade !== '흉').length
  const summary = good >= 3 ? '전체적으로 기운이 좋은 이름이에요.' : good === 2 ? '좋은 점과 보완할 점이 섞인 이름이에요.' : '보완할 점이 많아 다른 후보도 같이 비교해 보세요.'
  return { name: family + given, syls: all, gyeok, flow, wxCount, score, summary }
}
