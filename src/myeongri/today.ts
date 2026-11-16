/**
 * 오늘의 운세 2.0 엔진 (점수·6축·시간대·5일 흐름)
 *
 * 기준은 기존 일운(dayLuck)과 같다: 일진이 용신/희신이면 좋고, 기신/구신이면 부담, 일지 충·합과 궁위 가중치를 더한다.
 * 점수는 "이 사람의 최근·앞으로 ±32일" 안에서의 상대 위치(백분위)를 40~94로 펴서 매긴다.
 * 그래서 사람마다, 날마다 골고루 나오고, 매번 비슷한 점수로 쏠리지 않는다.
 */
import type { Element, SajuResult } from '../engine/types'
import { GROUP_OF, type Analysis, type Group, type Role } from './index'
import { dailyFortune, hash, iso, pct, rawFor, type DailyFortune } from './daily'
import { hourLuck, type Luck } from './timing'

export type AxisKey = 'total' | 'money' | 'love' | 'work' | 'health' | 'study'
export const AXES: AxisKey[] = ['total', 'money', 'love', 'work', 'health', 'study']
export type SlotKey = 'morning' | 'afternoon' | 'night'
export const SLOTS: { key: SlotKey; hour: number }[] = [{ key: 'morning', hour: 9 }, { key: 'afternoon', hour: 15 }, { key: 'night', hour: 21 }]

const SIGN: Record<Role, number> = { 용신: 2, 희신: 1, 한신: 0, 구신: -1, 기신: -2 }
const WIN = 32
const SLOT_WIN = 15

export interface TodayData {
  date: string
  dayGanzi: string
  /** 0~100 */
  score: number
  axes: Record<AxisKey, number>
  slots: { key: SlotKey; score: number; ganzi: string }[]
  bestSlot: SlotKey
  /** 그제~모레 총운 점수 */
  flow: { offset: number; date: string; score: number }[]
  base: DailyFortune
  luck: Luck
  /** 가장 높은 영역, 가장 낮은 영역 (총운 제외) */
  top: Exclude<AxisKey, 'total'>
  low: Exclude<AxisKey, 'total'>
  /** 어제 대비 오늘 점수 차 */
  deltaYesterday: number
  /** 오늘부터 7일 총운 */
  week: { date: string; score: number }[]
  /** 프로필·근거용 */
  who: { dayStem: string; dayBranch: string; yearBranch: string; strength: string; gyeok: string; yongEl: Element; avoidEl: Element; missing: Element[]; lack: Element[] }
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const toScore = (p: number, jit: number) => clamp(Math.round(40 + 54 * p + jit), 35, 98)

export function todayData(r: SajuResult, a: Analysis, date: Date): TodayData {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const base = dailyFortune(r, a, day)
  const raws = [] as ReturnType<typeof rawFor>[]
  for (let i = -WIN; i <= WIN; i++) { const d = new Date(day); d.setDate(d.getDate() + i); raws.push(rawFor(r, a, d)) }
  const grp = (sip: string): Group => GROUP_OF[sip as keyof typeof GROUP_OF]
  const studyOf = (x: (typeof raws)[number]) => {
    const L = x.luck
    const g1 = grp(L.stemSipsin); const g2 = grp(L.branchSipsin)
    const w = (g: Group) => (g1 === g ? SIGN[L.stemRole] * 0.8 : 0) + (g2 === g ? SIGN[L.branchRole] * 1.2 : 0)
    const hit = L.hits.filter((h) => h.palace === '월주' || h.palace === '시주').reduce((s, h) => s + h.effect, 0)
    return L.score * 0.5 + w('인성') * 1.0 + w('식상') * 0.3 + hit * 0.4
  }
  const rawOf: Record<AxisKey, (x: (typeof raws)[number]) => number> = {
    total: (x) => x.total, money: (x) => x.cats.money, love: (x) => x.cats.love, work: (x) => x.cats.work, health: (x) => x.cats.health, study: studyOf,
  }
  const sortedBy = {} as Record<AxisKey, number[]>
  for (const k of AXES) sortedBy[k] = raws.map(rawOf[k]).sort((p, q) => p - q)
  const dateAt = (idx: number) => { const d = new Date(day); d.setDate(d.getDate() + idx - WIN); return d }
  const axesAt = (idx: number): Record<AxisKey, number> => {
    const ds = iso(dateAt(idx))
    const o = {} as Record<AxisKey, number>
    for (const k of AXES) {
      const p = pct(sortedBy[k], rawOf[k](raws[idx]))
      o[k] = toScore(p, ((hash(`${a.dayStem}|${ds}|${k}`) % 5) - 2) * (k === 'total' ? 0.4 : 1))
    }
    const avg = (o.money + o.love + o.work + o.health + o.study) / 5
    o.total = clamp(Math.round(o.total * 0.75 + avg * 0.25), 35, 98)
    return o
  }
  const seed = hash(`${iso(day)}|${a.dayStem}|t2`)
  const mid = WIN
  const axes = axesAt(mid)
  const flow = [-2, -1, 0, 1, 2].map((o) => ({ offset: o, date: iso(dateAt(mid + o)), score: axesAt(mid + o).total }))
  const yScore = flow[1].score

  const slotsRaw = SLOTS.map((s) => {
    const arr: number[] = []
    for (let i = -SLOT_WIN; i <= SLOT_WIN; i++) { const d = new Date(day); d.setDate(d.getDate() + i); arr.push(hourLuck(r, a, d, s.hour).score) }
    const me = hourLuck(r, a, day, s.hour)
    return { key: s.key, ganzi: me.ganzi, p: pct([...arr].sort((p, q) => p - q), me.score) }
  })
  const slots = slotsRaw.map((s, i) => ({ key: s.key, ganzi: s.ganzi, score: clamp(Math.round(axes.total + (s.p - 0.5) * 26 + (((hash(`${seed}|slot${i}`) % 5) - 2) * 0.6)), 35, 98) }))
  const bestSlot = [...slots].sort((p, q) => q.score - p.score)[0].key

  const sub = AXES.filter((k) => k !== 'total') as Exclude<AxisKey, 'total'>[]
  const order = [...sub].sort((p, q) => axes[q] - axes[p] || hash(`${seed}${p}`) - hash(`${seed}${q}`))
  const week = [0, 1, 2, 3, 4, 5, 6].map((o) => ({ date: iso(dateAt(mid + o)), score: axesAt(mid + o).total }))
  const who = { dayStem: a.dayStem, dayBranch: r.pillars[1].pillar.branch, yearBranch: r.pillars[3].pillar.branch, strength: a.strength.label, gyeok: a.gyeokguk.name, yongEl: a.yongsin.primary, avoidEl: a.yongsin.gisin, missing: a.elementStatus.missing, lack: a.elementStatus.lack }
  return { week, who, date: iso(day), dayGanzi: base.dayGanzi, score: axes.total, axes, slots, bestSlot, flow, base, luck: raws[mid].luck, top: order[0], low: order[order.length - 1], deltaYesterday: axes.total - yScore }
}
