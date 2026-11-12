/** 서양 점성술 출생차트(트로피컬, 한국 표준시 가정): 태양·달·수성·금성·화성·목성·토성과 상승점 별자리. */
import * as A from 'astronomy-engine'

export const SIGNS = ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '사수자리', '염소자리', '물병자리', '물고기자리'] as const
const norm = (d: number) => ((d % 360) + 360) % 360
const signOf = (lon: number) => Math.floor(norm(lon) / 30)

export interface Placement { body: string; label: string; sign: number; deg: number }
export interface Natal { placements: Placement[]; asc: Placement | null }

const BODIES: Array<[A.Body, string, string]> = [
  [A.Body.Sun, 'sun', '태양'], [A.Body.Moon, 'moon', '달'], [A.Body.Mercury, 'mercury', '수성'], [A.Body.Venus, 'venus', '금성'],
  [A.Body.Mars, 'mars', '화성'], [A.Body.Jupiter, 'jupiter', '목성'], [A.Body.Saturn, 'saturn', '토성'],
]

export function ascendant(date: Date, lat: number, lon: number): number {
  const gst = A.SiderealTime(date) // 시간 단위
  const ramc = norm(gst * 15 + lon) * Math.PI / 180
  const eps = 23.4392911 * Math.PI / 180
  const phi = lat * Math.PI / 180
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)))
  return norm(asc * 180 / Math.PI)
}

export function natalChart(y: number, m: number, d: number, hh: number, mm: number, unknownTime: boolean, lat: number, lon: number): Natal {
  const date = new Date(Date.UTC(y, m - 1, d, unknownTime ? 12 - 9 : hh - 9, unknownTime ? 0 : mm))
  const placements: Placement[] = BODIES.map(([b, key, label]) => {
    let elon: number
    if (b === A.Body.Sun) elon = A.SunPosition(date).elon
    else if (b === A.Body.Moon) elon = A.EclipticGeoMoon(date).lon
    else elon = A.Ecliptic(A.GeoVector(b, date, true)).elon
    const l = norm(elon)
    return { body: key, label, sign: signOf(l), deg: l % 30 }
  })
  const asc = unknownTime ? null : (() => { const l = ascendant(date, lat, lon); return { body: 'asc', label: '상승점', sign: signOf(l), deg: l % 30 } })()
  return { placements, asc }
}
