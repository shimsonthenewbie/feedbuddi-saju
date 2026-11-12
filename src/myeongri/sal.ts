/** 신살: 타고난 살·귀인(원국)과, 올해 들어오는 살(12신살). 이름은 그대로, 풀이는 i18n/year에서 쉬운 말로 붙인다. */
import type { SajuResult } from '@orrery/core/types'
import { getTwelveSpirit, getYearGanzi } from '@orrery/core/pillars'

export type SalKey =
  | 'dohwa' | 'yeokma' | 'hwagae' | 'geopsal' | 'jaesal' | 'mangsin' | 'jangseong' | 'banan'
  | 'hakdang' | 'amrok' | 'hyeonchim' | 'cheonra' | 'wonjin' | 'gwimun'
  | 'goegang' | 'baekho' | 'yangin' | 'hongyeom' | 'cheonul' | 'cheonduk' | 'wolduk' | 'munchang' | 'geumyeo'

const SPIRIT: Record<string, SalKey> = { 年殺: 'dohwa', 驛馬: 'yeokma', 華蓋: 'hwagae', 劫殺: 'geopsal', 災殺: 'jaesal', 亡身: 'mangsin', 將星: 'jangseong', 攀鞍: 'banan' }

const PAIR = (list: string[]) => list.map((p) => [p[0], p[1]] as const)
const WONJIN = PAIR(['子未', '丑午', '寅酉', '卯申', '辰亥', '巳戌'])
const GWIMUN = PAIR(['子酉', '丑午', '寅未', '卯申', '辰亥', '巳戌'])
const HAKDANG: Record<string, string> = { 甲: '亥', 乙: '午', 丙: '寅', 丁: '酉', 戊: '寅', 己: '酉', 庚: '巳', 辛: '子', 壬: '申', 癸: '卯' }
const AMROK: Record<string, string> = { 甲: '亥', 乙: '戌', 丙: '申', 丁: '未', 戊: '申', 己: '未', 庚: '巳', 辛: '辰', 壬: '寅', 癸: '丑' }

/** 삼명통회 계열의 규칙으로 더 찾는 살·귀인 (태어난 시간을 모르면 시주는 뺀다) */
export function extraSals(r: SajuResult): SalKey[] {
  const ps = r.pillars.filter((_, i) => !(r.input.unknownTime && i === 0)).map((p) => p.pillar)
  const dayStem = r.pillars[1].pillar.stem
  const dayBr = r.pillars[1].pillar.branch
  const brs = ps.map((p) => p.branch)
  const chars = ps.flatMap((p) => [p.stem, p.branch])
  const out: SalKey[] = []
  if (brs.includes(HAKDANG[dayStem])) out.push('hakdang')
  if (brs.includes(AMROK[dayStem])) out.push('amrok')
  if (chars.filter((c) => '甲辛卯午申'.includes(c)).length >= 3) out.push('hyeonchim')
  if ((brs.includes('戌') && brs.includes('亥')) || (brs.includes('辰') && brs.includes('巳'))) out.push('cheonra')
  const has = (list: ReadonlyArray<readonly [string, string]>) => list.some(([a, b]) => (dayBr === a && brs.includes(b)) || (dayBr === b && brs.includes(a)))
  if (has(WONJIN)) out.push('wonjin')
  if (has(GWIMUN)) out.push('gwimun')
  return out
}

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
  out.push(...extraSals(r))
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
