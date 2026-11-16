/** 유명인 사주 엔진: 나와 일주가 같은 유명인, 오늘 태어난 유명인 */
import { getFourPillars } from '../engine/pillars'
import { CELEBS } from './celebData'

export interface Celeb { name: string; tag: string; year: number; month: number; day: number; dayGanzi: string }
let cache: Celeb[] | null = null
function all(): Celeb[] {
  if (cache) return cache
  cache = CELEBS.map(([name, tag, ymd]) => {
    const year = +ymd.slice(0, 4), month = +ymd.slice(4, 6), day = +ymd.slice(6, 8)
    return { name, tag, year, month, day, dayGanzi: getFourPillars(year, month, day, 12, 0)[2] }
  })
  return cache
}
/** 일주(태어난 날의 간지)가 같은 유명인. 날짜 기준이라 밤 11시 이후 출생자는 다를 수 있다. */
export const sameDayPillar = (dayGanzi: string): Celeb[] => all().filter((c) => c.dayGanzi === dayGanzi)
/** 해당 월·일에 태어난 유명인 */
export const bornOn = (month: number, day: number): Celeb[] => all().filter((c) => c.month === month && c.day === day)
