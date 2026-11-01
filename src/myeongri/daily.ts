/**
 * 오늘의 운세 엔진 (언어 무관)
 *
 * 계산 결과는 숫자·키(key)로만 돌려준다. 실제 문장은 src/i18n/daily/<언어>.ts 의 문구 풀에서 고른다.
 * 그래서 15개 언어로 늘려도 계산은 한 번만 쓰고, 문구만 추가하면 된다.
 * 별점은 "이 사람의 최근 ±30일 분포" 안에서의 상대 위치로 매겨, 사람마다 비슷하게 분포한다(항상 같은 점수가 나오지 않도록).
 */
import type { Element, SajuResult } from '@orrery/core/types'
import { STEM_INFO } from '@orrery/core/constants'
import { GROUP_OF, roleOf, type Analysis, type Group, type Role } from './index'
import { dayLuck, type Luck } from './timing'

export type CatKey = 'love' | 'money' | 'work' | 'health'
export const CATS: CatKey[] = ['love', 'money', 'work', 'health']
export type ThemeKey =
  | 'bijeon' | 'geopjae' | 'siksin' | 'sanggwan' | 'pyeonjae' | 'jeongjae' | 'pyeongwan' | 'jeonggwan' | 'pyeonin' | 'jeongin'
export type EventKey = 'clash_day' | 'harmony_day' | 'repeat' | 'clash_month' | 'compose' | null

export interface DailyFortune {
  date: string
  dayGanzi: string
  /** 총운 1~5 (이 사람 기준 상대) */
  stars: 1 | 2 | 3 | 4 | 5
  /** 분야별 1~5 */
  cats: Record<CatKey, 1 | 2 | 3 | 4 | 5>
  /** 오늘 간지가 나에게 어떤 십성인지 → 기본 주제 문구 */
  theme: ThemeKey
  /** 일지 충·합 등 특별한 일 → 있으면 주제 문구 앞에 덧붙임 */
  event: EventKey
  /** 문구 풀에서 변형을 고르는 숫자 (날짜·사람 고정) */
  seed: number
  /** 가장 좋은 분야 / 신중할 분야 (없으면 null) */
  best: CatKey | null
  care: CatKey | null
  lucky: { element: Element; number: number; direction: 'E' | 'S' | 'C' | 'W' | 'N'; color: 'green' | 'red' | 'yellow' | 'white' | 'blue' }
  /** 디버그용 근거 */
  score: number
}

const SIGN: Record<Role, number> = { 용신: 2, 희신: 1, 한신: 0, 구신: -1, 기신: -2 }
const NUM: Record<Element, number[]> = { tree: [3, 8], fire: [2, 7], earth: [5, 10], metal: [4, 9], water: [1, 6] }
const DIR: Record<Element, DailyFortune['lucky']['direction']> = { tree: 'E', fire: 'S', earth: 'C', metal: 'W', water: 'N' }
const COLOR: Record<Element, DailyFortune['lucky']['color']> = { tree: 'green', fire: 'red', earth: 'yellow', metal: 'white', water: 'blue' }
const THEME: Record<string, ThemeKey> = {
  비견: 'bijeon', 겁재: 'geopjae', 식신: 'siksin', 상관: 'sanggwan', 편재: 'pyeonjae', 정재: 'jeongjae',
  편관: 'pyeongwan', 정관: 'jeonggwan', 편인: 'pyeonin', 정인: 'jeongin',
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

interface Raw { total: number; cats: Record<CatKey, number>; luck: Luck }

function rawFor(r: SajuResult, a: Analysis, date: Date): Raw {
  const L = dayLuck(r, a, date)
  const grp = (sip: string): Group => GROUP_OF[sip as keyof typeof GROUP_OF]
  const g1 = grp(L.stemSipsin)
  const g2 = grp(L.branchSipsin)
  const w = (g: Group): number => (g1 === g ? SIGN[L.stemRole] * 0.8 : 0) + (g2 === g ? SIGN[L.branchRole] * 1.2 : 0)
  const hitSum = (palaces: string[]) => L.hits.filter((h) => palaces.includes(h.palace)).reduce((s, h) => s + h.effect, 0)
  const loveGroup: Group = r.input.gender === 'M' ? '재성' : '관성'
  const base = L.score * 0.5
  return {
    luck: L,
    total: L.score,
    cats: {
      love: base + w(loveGroup) + hitSum(['일주']) * 1.2 + (g1 === '식상' || g2 === '식상' ? 0.2 : 0),
      money: base + w('재성') + w('식상') * 0.4 + hitSum(['월주']) * 0.5,
      work: base + w('관성') + w('인성') * 0.4 + w('식상') * 0.3 + hitSum(['월주']) * 0.8,
      health: base + hitSum(['일주', '시주']) * 0.8 + (SIGN[L.stemRole] + SIGN[L.branchRole]) * 0.25,
    },
  }
}

function pct(sorted: number[], v: number): number {
  let n = 0
  for (const x of sorted) if (x < v) n++
  return n / Math.max(1, sorted.length - 1)
}
const toStar = (p: number): 1 | 2 | 3 | 4 | 5 => (p < 0.05 ? 1 : p < 0.25 ? 2 : p < 0.7 ? 3 : p < 0.92 ? 4 : 5)

const WINDOW = 30

export function dailyFortune(r: SajuResult, a: Analysis, date: Date): DailyFortune {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const raws: Raw[] = []
  let me!: Raw
  for (let i = -WINDOW; i <= WINDOW; i++) {
    const d = new Date(day)
    d.setDate(d.getDate() + i)
    const x = rawFor(r, a, d)
    raws.push(x)
    if (i === 0) me = x
  }
  const totals = raws.map((x) => x.total).sort((p, q) => p - q)
  const stars = toStar(pct(totals, me.total))
  const cats = {} as DailyFortune['cats']
  const ps = {} as Record<CatKey, number>
  for (const c of CATS) {
    const sorted = raws.map((x) => x.cats[c]).sort((p, q) => p - q)
    ps[c] = pct(sorted, me.cats[c])
    cats[c] = toStar(ps[c])
  }
  const sortedCats = [...CATS].sort((p, q) => ps[q] - ps[p])
  const best = ps[sortedCats[0]] >= 0.7 ? sortedCats[0] : null
  const care = ps[sortedCats[3]] <= 0.25 && sortedCats[3] !== best ? sortedCats[3] : null

  const L = me.luck
  const dayBranchHit = L.hits.find((h) => h.palace === '일주' && h.target === '일지')
  let event: EventKey = null
  if (L.hits.some((h) => h.kind.startsWith('복음'))) event = 'repeat'
  else if (dayBranchHit && dayBranchHit.kind.startsWith('충')) event = 'clash_day'
  else if (dayBranchHit && dayBranchHit.kind.startsWith('합')) event = 'harmony_day'
  else if (L.hits.some((h) => h.kind.startsWith('삼합') || h.kind.startsWith('방합'))) event = 'compose'
  else if (L.hits.some((h) => h.palace === '월주' && h.kind.startsWith('충'))) event = 'clash_month'

  const seed = hash(`${iso(day)}|${a.dayStem}|${r.pillars[1].pillar.branch}`)
  const el = seed % 2 === 0 ? a.yongsin.primary : a.yongsin.heesin
  const lucky = { element: el, number: NUM[el][(seed >>> 3) % 2], direction: DIR[el], color: COLOR[el] }
  void STEM_INFO; void roleOf
  return {
    date: iso(day), dayGanzi: L.ganzi, stars, cats, theme: THEME[L.stemSipsin], event, seed, best, care, lucky, score: me.total,
  }
}
