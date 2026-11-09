/** 신살: 타고난 살·귀인(원국)과, 올해 들어오는 살(12신살). 이름은 그대로, 풀이는 i18n/year에서 쉬운 말로 붙인다. */
import type { SajuResult } from '@orrery/core/types'
import { getTwelveSpirit, getYearGanzi } from '@orrery/core/pillars'

export type SalKey =
  | 'dohwa' | 'yeokma' | 'hwagae' | 'geopsal' | 'jaesal' | 'mangsin' | 'jangseong' | 'banan'
  | 'goegang' | 'baekho' | 'yangin' | 'hongyeom' | 'cheonul' | 'cheonduk' | 'wolduk' | 'munchang' | 'geumyeo'

const SPIRIT: Record<string, SalKey> = { 年殺: 'dohwa', 驛馬: 'yeokma', 華蓋: 'hwagae', 劫殺: 'geopsal', 災殺: 'jaesal', 亡身: 'mangsin', 將星: 'jangseong', 攀鞍: 'banan' }

/** 원국(타고난)에 있는 살과 귀인 */
export function natalSals(r: SajuResult): SalKey[] {
  const s = r.specialSals
  const out: SalKey[] = []
  if (s.goegang) out.push('goegang')
  if (s.baekho) out.push('baekho')
  if (s.yangin.length) out.push('yangin')
  if (s.hongyeom) out.push('hongyeom')
  if (s.dohwa.length) out.push('dohwa')
  if (s.cheonul.length) out.push('cheonul')
  if (s.cheonduk.length) out.push('cheonduk')
  if (s.wolduk.length) out.push('wolduk')
  if (s.munchang.length) out.push('munchang')
  if (s.geumyeo.length) out.push('geumyeo')
  return out
}

/** 그해 지지가 내 년지·일지 기준으로 어떤 12신살이 되는지 */
export function yearSals(r: SajuResult, year: number): SalKey[] {
  const yb = getYearGanzi(year)[1]
  const bases = [r.pillars[3].pillar.branch, r.pillars[1].pillar.branch]
  const out: SalKey[] = []
  for (const b of bases) {
    const k = SPIRIT[getTwelveSpirit(b, yb)]
    if (k && !out.includes(k)) out.push(k)
  }
  return out
}
