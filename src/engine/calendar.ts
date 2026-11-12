// 만세력 계산: 시간대 → 진태양시, 절기 기준 년주·월주, 일주, 시주, 대운 시작
// 절기 시각은 lunar-javascript(MIT)의 천문 계산을 쓰고, 나머지 규칙은 직접 작성했다.
import { Solar } from 'lunar-javascript'
import { EARTH, SKY } from './constants'
import type { BirthInput } from './types'

const MIN = 60_000
const DAY = 86_400_000
const mod = (n: number, m: number) => ((n % m) + m) % m
export const ganzi60 = (i: number) => SKY[mod(i, 10)] + EARTH[mod(i, 12)]
export const indexOf60 = (g: string) => {
  for (let i = 0; i < 60; i++) if (ganzi60(i) === g) return i
  return -1
}

/* ───────── 시간대 ───────── */
const dtfCache = new Map<string, Intl.DateTimeFormat>()
function offsetMinutes(utcMs: number, tz: string): number {
  let f = dtfCache.get(tz)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
    dtfCache.set(tz, f)
  }
  const p: Record<string, number> = {}
  for (const x of f.formatToParts(new Date(utcMs))) if (x.type !== 'literal') p[x.type] = Number(x.value)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / MIN)
}
/** 그 지역 벽시계 시각 → UTC 순간(밀리초). 서머타임 겹침은 먼저 오는 순간을 쓴다. */
export function localToUtc(y: number, mo: number, d: number, h: number, mi: number, tz: string): number {
  const naive = Date.UTC(y, mo - 1, d, h, mi)
  try {
    // 후보 두 개(전후 하루의 오프셋)를 시험해 벽시계가 맞아떨어지는 것 중 이른 쪽
    const cand = new Set<number>()
    for (const probe of [naive - DAY, naive, naive + DAY]) {
      const off = offsetMinutes(probe, tz)
      const u = naive - off * MIN
      if (offsetMinutes(u, tz) === off) cand.add(u)
    }
    if (cand.size) return Math.min(...cand)
    // 존재하지 않는 시각(서머타임 시작 틈): 전환 전 오프셋으로 해석
    return naive - offsetMinutes(naive - DAY, tz) * MIN
  } catch {
    return naive - 9 * 60 * MIN
  }
}
/** 균시차(분) */
function equationOfTime(utcMs: number): number {
  const d = new Date(utcMs)
  const n = Math.floor((utcMs - Date.UTC(d.getUTCFullYear(), 0, 0)) / DAY)
  const b = ((2 * Math.PI) / 365) * (n - 81)
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
}

export interface Clock {
  /** 절대 시각(UTC 밀리초) */
  utc: number
  /** 그 지역의 평균태양시(한국은 동경 127.5도 관례). 달력 필드는 UTC getter로 읽는다 */
  adj: number
}
export function clockOf(input: Pick<BirthInput, 'year' | 'month' | 'day' | 'hour' | 'minute' | 'longitude' | 'timezone'>): Clock {
  const tz = input.timezone || 'Asia/Seoul'
  const utc = localToUtc(input.year, input.month, input.day, input.hour, input.minute, tz)
  if (tz === 'Asia/Seoul') return { utc, adj: utc + 8.5 * 60 * MIN } // 한국 관례: 동경 127.5도
  const lon = input.longitude ?? 127.5
  return { utc, adj: utc + lon * 4 * MIN + equationOfTime(utc) * MIN }
}

/* ───────── 절기 ───────── */
const solarAt = (utcMs: number) => {
  const b = new Date(utcMs + 8 * 60 * MIN) // 절기표는 베이징 표준시
  return Solar.fromYmdHms(b.getUTCFullYear(), b.getUTCMonth() + 1, b.getUTCDate(), b.getUTCHours(), b.getUTCMinutes(), b.getUTCSeconds())
}
const solarToUtc = (s: { getYear(): number; getMonth(): number; getDay(): number; getHour(): number; getMinute(): number; getSecond(): number }) =>
  Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute(), s.getSecond()) - 8 * 60 * MIN

/** 년주·월주 (입춘·12절 기준, 순간 단위) */
export function yearMonthPillars(utcMs: number): { year: string; month: string } {
  const l = solarAt(utcMs).getLunar()
  return { year: l.getYearInGanZhiExact(), month: l.getMonthInGanZhiExact() }
}

/** 일주: 평균태양시 기준, 자시(23:00~) 이후는 다음 날 일진 (통자시) */
export function dayIndex(adjMs: number): number {
  const shifted = new Date(adjMs + 60 * MIN)
  const days = Math.floor(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) / DAY)
  // 1970-01-01 = 辛巳(17)
  return mod(days + 17, 60)
}
/** 시지 0~11 (子=0). 평균태양시 기준 */
export function hourBranch(adjMs: number): number {
  const m = mod(Math.floor((adjMs + 60 * MIN) / MIN), 1440)
  return Math.floor(m / 120) % 12
}
export function hourStem(dayStemIdx: number, branchIdx: number): number {
  return mod((dayStemIdx % 5) * 2 + branchIdx, 10) // 오서둔
}

export function fourPillarsAt(c: Clock, unknownTime = false): [string, string, string, string] {
  const ym = yearMonthPillars(c.utc)
  const di = dayIndex(unknownTime ? Math.floor(c.adj / DAY) * DAY + 12 * 60 * MIN : c.adj)
  const day = ganzi60(di)
  if (unknownTime) return [ym.year, ym.month, day, '??']
  const hb = hourBranch(c.adj)
  return [ym.year, ym.month, day, SKY[hourStem(mod(di, 10), hb)] + EARTH[hb]]
}

/** 한국 시계(KST) 기준 날짜·시각으로 사주 네 기둥 [년, 월, 일, 시] */
export function getFourPillars(year: number, month: number, day: number, hour: number, minute: number): [string, string, string, string] {
  return fourPillarsAt(clockOf({ year, month, day, hour, minute }))
}

/** 절기 목록: 앞뒤 절(節)·중기 */
export interface TermInfo { name: string; utc: number }
function termsAround(utcMs: number): { prevJie: TermInfo; nextJie: TermInfo; midName: string } {
  const l = solarAt(utcMs).getLunar()
  const pj = l.getPrevJie(false)
  const nj = l.getNextJie(false)
  return {
    prevJie: { name: pj.getName(), utc: solarToUtc(pj.getSolar()) },
    nextJie: { name: nj.getName(), utc: solarToUtc(nj.getSolar()) },
    midName: '',
  }
}
export const prevNextJie = termsAround

/** 대운: 순행/역행, 시작 나이와 시작일. 3일=1년 환산(1일=4개월, 2시간=10일). */
export function daewoonStart(c: Clock, forward: boolean, wallMs: number): { years: number; startAdj: number; ganziStep: 1 | -1 } {
  const t = termsAround(c.utc)
  const diffMin = forward ? (t.nextJie.utc - c.utc) / MIN : (c.utc - t.prevJie.utc) / MIN
  const years = diffMin / (3 * 1440)
  // 달력 환산: 1년 = 3일, 즉 diff 분 × (365.2425일 / 3일)
  const startMs = wallMs + (diffMin / (3 * 1440)) * 365.2425 * DAY
  return { years, startAdj: startMs, ganziStep: forward ? 1 : -1 }
}

/** 그 날짜(한국 시계)가 속한 달의 시작 절기(入氣)·중기·다음 절기(出氣) */
export function calcSolarTerms(year: number, month: number, day: number, hour: number, minute: number) {
  const utc = localToUtc(year, month, day, hour, minute, 'Asia/Seoul')
  const t = termsAround(utc)
  const kst = (ms: number) => { const d = new Date(ms + 9 * 60 * MIN); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes() } }
  const a = kst(t.prevJie.utc), c = kst(t.nextJie.utc)
  return {
    ingiName: t.prevJie.name, ingiYear: a.y, ingiMonth: a.m, ingiDay: a.d, ingiHour: a.h, ingiMin: a.mi,
    outgiName: t.nextJie.name, outgiYear: c.y, outgiMonth: c.m, outgiDay: c.d, outgiHour: c.h, outgiMin: c.mi,
  }
}
