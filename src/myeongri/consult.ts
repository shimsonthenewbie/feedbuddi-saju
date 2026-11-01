/**
 * 상담용 시기 계산 (언어 무관)
 * 고민 카테고리별로 앞으로 24개월을 훑어 "좋은 달"과 "신중할 달"을 고르고, 그 근거(간지·십성·부딪힘)를 돌려준다.
 * 문장은 src/i18n/consult/ 의 문구 풀(또는 AI)이 만든다.
 */
import type { SajuResult } from '@orrery/core/types'
import { GROUP_OF, type Analysis, type Group, type Role } from './index'
import { yearLuck, type Luck } from './timing'

export type AskCat = 'love' | 'work' | 'money' | 'health' | 'family' | 'etc'
export const ASK_CATS: AskCat[] = ['love', 'work', 'money', 'health', 'family', 'etc']

export interface Win {
  from: string
  year: number
  month: number
  ganzi: string
  stemSip: string
  branchSip: string
  score: number
  tier: 'best' | 'mid' | 'care'
  /** 부딪힘 종류(충·형·합 등) */
  hitKinds: string[]
  groups: Group[]
}
export interface ConsultCalc {
  cat: AskCat
  timeline: Win[]
  best: Win[]
  care: Win[]
  /** 사용자가 적은 날짜가 속한 달 */
  event: Win | null
  yearGanzi: Record<number, string>
}

const SIGN: Record<Role, number> = { 용신: 2, 희신: 1, 한신: 0, 구신: -1, 기신: -2 }

function catScore(r: SajuResult, L: Luck, cat: AskCat): number {
  const g1 = GROUP_OF[L.stemSipsin as keyof typeof GROUP_OF]
  const g2 = GROUP_OF[L.branchSipsin as keyof typeof GROUP_OF]
  const w = (g: Group) => (g1 === g ? SIGN[L.stemRole] * 0.8 : 0) + (g2 === g ? SIGN[L.branchRole] * 1.2 : 0)
  const hit = (ps: string[]) => L.hits.filter((h) => ps.includes(h.palace)).reduce((s, h) => s + h.effect, 0)
  const base = L.score * 0.5
  const loveG: Group = r.input.gender === 'M' ? '재성' : '관성'
  switch (cat) {
    case 'money': return base + w('재성') + w('식상') * 0.4 + hit(['월주']) * 0.5
    case 'work': return base + w('관성') + w('인성') * 0.4 + w('식상') * 0.3 + hit(['월주']) * 0.8
    case 'love': return base + w(loveG) + hit(['일주']) * 1.2
    case 'health': return base + hit(['일주', '시주']) * 0.8 + (SIGN[L.stemRole] + SIGN[L.branchRole]) * 0.25
    case 'family': return base + w('인성') * 0.6 + w('비겁') * 0.4 + hit(['년주', '월주']) * 0.6
    default: return L.score
  }
}

export function consultCalc(r: SajuResult, a: Analysis, cat: AskCat, now = new Date(), months = 24, eventDate?: Date | null): ConsultCalc {
  const y0 = now.getFullYear()
  const yearGanzi: Record<number, string> = {}
  type Row = { L: Luck; s: number; year: number; month: number; date: Date }
  const rows: Row[] = []
  for (const y of [y0, y0 + 1, y0 + 2]) {
    const yl = yearLuck(r, a, y, true)
    yearGanzi[y] = yl.ganzi
    for (const L of yl.months) {
      const [yy, mm, dd] = L.from!.split('-').map(Number)
      rows.push({ L, s: catScore(r, L, cat), year: yy, month: mm, date: new Date(yy, mm - 1, dd) })
    }
  }
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const win = rows.filter((x) => x.date >= new Date(startMonth.getFullYear(), startMonth.getMonth() - 1, 1)).slice(0, months + 1)
  const sorted = [...win].sort((p, q) => q.s - p.s)
  const n = win.length
  const bestSet = new Set(sorted.slice(0, Math.max(2, Math.round(n * 0.2))))
  const careSet = new Set(sorted.slice(-Math.max(2, Math.round(n * 0.2))))
  const toWin = (x: Row): Win => ({
    from: x.L.from!, year: x.year, month: x.month, ganzi: x.L.ganzi, stemSip: x.L.stemSipsin, branchSip: x.L.branchSipsin,
    score: Math.round(x.s * 10) / 10,
    tier: bestSet.has(x) ? 'best' : careSet.has(x) ? 'care' : 'mid',
    hitKinds: Array.from(new Set(x.L.hits.map((h) => h.kind.replace(/\(.*\)/, '')))),
    groups: Array.from(new Set([GROUP_OF[x.L.stemSipsin as keyof typeof GROUP_OF], GROUP_OF[x.L.branchSipsin as keyof typeof GROUP_OF]])),
  })
  const timeline = win.map(toWin)
  const best = sorted.slice(0, 3).filter((x) => bestSet.has(x)).map(toWin).sort((p, q) => p.from.localeCompare(q.from))
  const care = sorted.slice(-3).filter((x) => careSet.has(x)).map(toWin).sort((p, q) => p.from.localeCompare(q.from))
  let event: Win | null = null
  if (eventDate) {
    const hit = rows.filter((x) => x.date <= eventDate).pop()
    if (hit) event = timeline.find((w) => w.from === hit.L.from) ?? toWin(hit)
  }
  return { cat, timeline, best, care, event, yearGanzi }
}
