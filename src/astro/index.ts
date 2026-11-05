/**
 * 서양 점성술 계산(트로피컬 황도 12궁). astronomy-engine(MIT) 사용.
 * 행성 위치는 ±1각분 수준, 상승궁은 출생 시각과 위치로 직접 계산한다.
 */
import * as A from 'astronomy-engine'

export const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const
export type SignKey = (typeof SIGNS)[number]
export type AElement = 'fire' | 'earth' | 'air' | 'water'
export const SIGN_ELEMENT: AElement[] = ['fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water']
export type Body = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn'
export interface Pos { lon: number; sign: number; deg: number }
export interface AstroChart {
  planets: Record<Body, Pos>
  /** 출생 시간을 모르면 null */
  asc: Pos | null
  mc: Pos | null
  timeKnown: boolean
  /** 시간을 모를 때 달이 하루 안에 다른 별자리로 넘어갈 수 있는지 */
  moonUncertain: boolean
}
const norm = (d: number) => ((d % 360) + 360) % 360
const pos = (lon: number): Pos => { const l = norm(lon); return { lon: l, sign: Math.floor(l / 30), deg: l % 30 } }

/** 현지 날짜·시각 + IANA 시간대 → UTC 시각 */
export function localToUtc(y: number, m: number, d: number, hh: number, mm: number, tz: string): Date {
  const want = Date.UTC(y, m - 1, d, hh, mm)
  const offset = (t: number) => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date(t))
    const g = (k: string) => Number(p.find((x) => x.type === k)!.value)
    return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute')) - t
  }
  let t = want - offset(want)
  t = want - offset(t)
  return new Date(t)
}

function eclipticLon(vec: A.Vector, time: A.AstroTime): number {
  const v = A.RotateVector(A.Rotation_EQJ_ECT(time), vec)
  return A.SphereFromVector(v).lon
}

export function natal(input: { year: number; month: number; day: number; hour: number; minute: number; latitude: number; longitude: number; timezone: string; unknownTime?: boolean }): AstroChart {
  const known = !input.unknownTime
  const date = localToUtc(input.year, input.month, input.day, known ? input.hour : 12, known ? input.minute : 0, input.timezone)
  const time = A.MakeTime(date)
  const lonOf = (b: Body): number => (b === 'Moon' ? eclipticLon(A.GeoMoon(date), time) : eclipticLon(A.GeoVector(b as A.Body, date, true), time))
  const planets = {} as Record<Body, Pos>
  for (const b of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as Body[]) planets[b] = pos(lonOf(b))
  let asc: Pos | null = null, mc: Pos | null = null
  if (known) {
    const T = (time.tt) / 36525
    const eps = ((23.4392911 - 0.0130042 * T) * Math.PI) / 180
    const ramc = (norm((A.SiderealTime(time) + input.longitude / 15) * 15) * Math.PI) / 180
    const lat = (input.latitude * Math.PI) / 180
    let a = (Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))) * 180) / Math.PI
    const m = (Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) * 180) / Math.PI
    // 상승점은 천정(MC)보다 동쪽(0~180도 앞)에 있어야 한다.
    if (norm(a - m) > 180) a += 180
    asc = pos(a); mc = pos(m)
  }
  const moonUncertain = !known && (planets.Moon.deg < 7 || planets.Moon.deg > 23)
  return { planets, asc, mc, timeKnown: known, moonUncertain }
}

export type AspectKind = 'conj' | 'sextile' | 'square' | 'trine' | 'opp' | null
const ASPECTS: [Exclude<AspectKind, null>, number, number][] = [['conj', 0, 8], ['sextile', 60, 5], ['square', 90, 6], ['trine', 120, 6], ['opp', 180, 8]]
export function aspect(a: number, b: number): AspectKind {
  let d = Math.abs(norm(a) - norm(b)); if (d > 180) d = 360 - d
  for (const [k, ang, orb] of ASPECTS) if (Math.abs(d - ang) <= orb) return k
  return null
}
export type ElRel = 'same' | 'support' | 'friction' | 'neutral'
export function elementRel(a: AElement, b: AElement): ElRel {
  if (a === b) return 'same'
  const k = [a, b].sort().join('-')
  return k === 'air-fire' || k === 'earth-water' ? 'support' : k === 'fire-water' || k === 'air-earth' ? 'friction' : 'neutral'
}
