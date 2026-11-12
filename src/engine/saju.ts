// 사주 계산 본체: 네 기둥 → 십신·12운성·12신살·지장간·대운·관계·신살·공망
import { BRANCH_ELEMENT, EARTH, JIJANGGAN, SIPSIN, SINSAL12, SKY, STEM_INFO, UNSEONG } from './constants'
import { clockOf, daewoonStart, dayIndex, fourPillarsAt, ganzi60, indexOf60, prevNextJie } from './calendar'
import { analyzeAllRelations } from './relations'
import type { BirthInput, DaewoonItem, Gongmang, PillarDetail, SajuResult, SpecialSals } from './types'

const mod = (n: number, m: number) => ((n % m) + m) % m
const GEN: Record<string, string> = { tree: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'tree' }
const CTRL: Record<string, string> = { tree: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'tree' }

/* ───────── 십신 ───────── */
export function getRelation(dayStem: string, target: string): { hanja: string; hangul: string } | null {
  const a = STEM_INFO[dayStem], b = STEM_INFO[target]
  if (!a || !b) return null
  const same = a.yinyang === b.yinyang
  let i: number
  if (a.element === b.element) i = same ? 0 : 1
  else if (GEN[a.element] === b.element) i = same ? 2 : 3
  else if (CTRL[a.element] === b.element) i = same ? 4 : 5
  else if (CTRL[b.element] === a.element) i = same ? 6 : 7
  else i = same ? 8 : 9
  return SIPSIN[i]
}
export const getHiddenStems = (branch: string) => JIJANGGAN[branch] ?? ''
export const getJeonggi = (branch: string) => (JIJANGGAN[branch] ?? '').trim().slice(-1)

/* ───────── 12운성 ───────── */
const JANGSAENG: Record<string, string> = { 甲: '亥', 乙: '午', 丙: '寅', 丁: '酉', 戊: '寅', 己: '酉', 庚: '巳', 辛: '子', 壬: '申', 癸: '卯' }
export function getTwelveMeteor(stem: string, branch: string): string {
  const start = EARTH.indexOf(JANGSAENG[stem])
  const yang = STEM_INFO[stem].yinyang === '+'
  const step = yang ? EARTH.indexOf(branch) - start : start - EARTH.indexOf(branch)
  return UNSEONG[mod(step, 12)]
}

/* ───────── 12신살 (연지 기준) ───────── */
const GEOBSAL_START: Record<string, string> = {
  寅: '亥', 午: '亥', 戌: '亥', 申: '巳', 子: '巳', 辰: '巳', 巳: '寅', 酉: '寅', 丑: '寅', 亥: '申', 卯: '申', 未: '申',
}
export function getTwelveSpirit(yearBranch: string, target: string): string {
  const start = EARTH.indexOf(GEOBSAL_START[yearBranch])
  return SINSAL12[mod(EARTH.indexOf(target) - start, 12)]
}

/* ───────── 공망 ───────── */
export function getGongmang(dayGanzi: string): [string, string] {
  const i = indexOf60(dayGanzi)
  const xunStart = i - (i % 10) // 그 순(旬)의 첫 간지
  const b0 = mod(xunStart, 12)
  return [EARTH[mod(b0 + 10, 12)], EARTH[mod(b0 + 11, 12)]]
}

export const getYearGanzi = (year: number) => ganzi60(mod(year - 4, 60))

/* ───────── 신살 ───────── */
const YANGIN: Record<string, string> = { 甲: '卯', 丙: '午', 戊: '午', 庚: '酉', 壬: '子' }
const DOHWA: Record<string, string> = {
  寅: '卯', 午: '卯', 戌: '卯', 申: '酉', 子: '酉', 辰: '酉', 巳: '午', 酉: '午', 丑: '午', 亥: '子', 卯: '子', 未: '子',
}
const CHEONUL: Record<string, string[]> = {
  甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'], 乙: ['子', '申'], 己: ['子', '申'],
  丙: ['亥', '酉'], 丁: ['亥', '酉'], 壬: ['巳', '卯'], 癸: ['巳', '卯'], 辛: ['午', '寅'],
}
// 천덕귀인: 월지 기준 (간 또는 지)
const CHEONDUK: Record<string, string> = {
  寅: '丁', 卯: '申', 辰: '壬', 巳: '辛', 午: '亥', 未: '甲', 申: '癸', 酉: '寅', 戌: '丙', 亥: '乙', 子: '巳', 丑: '庚',
}
// 월덕귀인: 월지 삼합 기준 천간
const WOLDUK: Record<string, string> = {
  寅: '丙', 午: '丙', 戌: '丙', 申: '壬', 子: '壬', 辰: '壬', 亥: '甲', 卯: '甲', 未: '甲', 巳: '庚', 酉: '庚', 丑: '庚',
}
const MUNCHANG: Record<string, string> = { 甲: '巳', 乙: '午', 丙: '申', 丁: '酉', 戊: '申', 己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯' }
const GEUMYEO: Record<string, string> = { 甲: '辰', 乙: '巳', 丙: '未', 丁: '申', 戊: '未', 己: '申', 庚: '戌', 辛: '亥', 壬: '丑', 癸: '寅' }
const HONGYEOM: Record<string, string> = { 甲: '午', 乙: '午', 丙: '寅', 丁: '未', 戊: '辰', 己: '辰', 庚: '戌', 辛: '酉', 壬: '子', 癸: '申' }
const BAEKHO = new Set(['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'])
const GOEGANG = new Set(['庚辰', '庚戌', '壬辰', '戊戌'])

/**
 * 신살. stems·branches는 [시, 일, 월, 년] 순서. 모르는 칸은 '?'.
 * 돌려주는 숫자 배열은 해당하는 기둥의 자리(0=시,1=일,2=월,3=년).
 */
export function getSpecialSals(stems: string[], branches: string[], dayPillar: string): SpecialSals {
  const ds = stems[1], db = branches[1], ys = stems[3], yb = branches[3], mb = branches[2]
  const at = (pred: (i: number) => boolean) => [0, 1, 2, 3].filter((i) => stems[i] !== '?' && branches[i] !== '?' && pred(i))
  const pillars = [0, 1, 2, 3].map((i) => (stems[i] === '?' ? '??' : stems[i] + branches[i]))
  const dohwaBases = [db, yb].filter((b) => b && b !== '?')
  const dohwaSet = new Set(dohwaBases.map((b) => DOHWA[b]))
  const cheonulSet = new Set([ds, ys].filter((s) => s && s !== '?').flatMap((s) => CHEONUL[s] ?? []))
  return {
    yangin: at((i) => branches[i] === YANGIN[ds]),
    baekho: BAEKHO.has(pillars[1]) || BAEKHO.has(pillars[2]),
    goegang: GOEGANG.has(dayPillar) || GOEGANG.has(pillars[2]),
    dohwa: at((i) => dohwaSet.has(branches[i])),
    cheonul: at((i) => cheonulSet.has(branches[i])),
    cheonduk: at((i) => stems[i] === CHEONDUK[mb] || branches[i] === CHEONDUK[mb]),
    wolduk: at((i) => stems[i] === WOLDUK[mb]),
    munchang: at((i) => branches[i] === MUNCHANG[ds]),
    hongyeom: pillars.some((p, i) => p !== '??' && p[1] === HONGYEOM[ds] && i >= 0),
    geumyeo: at((i) => branches[i] === GEUMYEO[ds]),
  }
}

/* ───────── 본체 ───────── */
const emptyDetail = (): PillarDetail => ({ pillar: { ganzi: '??', stem: '?', branch: '?' }, stemSipsin: '?', branchSipsin: '?', unseong: '?', sinsal: '?', jigang: '?' })

export function calculateSaju(input: BirthInput): SajuResult {
  const unk = !!input.unknownTime
  const c = clockOf(input)
  const [yg, mg, dg, hg] = fourPillarsAt(c, unk)
  const dayStem = dg[0]
  const yearBranch = yg[1]

  const detail = (g: string, isDay: boolean): PillarDetail => {
    if (g.includes('?')) return emptyDetail()
    const stem = g[0], branch = g[1]
    return {
      pillar: { ganzi: g, stem, branch },
      stemSipsin: isDay ? '本元' : getRelation(dayStem, stem)!.hanja,
      branchSipsin: getRelation(dayStem, getJeonggi(branch))!.hanja,
      unseong: getTwelveMeteor(dayStem, branch),
      sinsal: getTwelveSpirit(yearBranch, branch),
      jigang: JIJANGGAN[branch],
    }
  }
  const pillars = [detail(hg, false), detail(dg, true), detail(mg, false), detail(yg, false)]
  const stems = [hg, dg, mg, yg].map((g) => g[0])
  const branches = [hg, dg, mg, yg].map((g) => g[1])

  // 대운
  const male = input.gender === 'M'
  const yangYear = STEM_INFO[yg[0]].yinyang === '+'
  const forward = male === yangYear
  const ds = daewoonStart(c, forward, Date.UTC(input.year, input.month - 1, input.day, unk ? 12 : input.hour, unk ? 0 : input.minute))
  const gong = getGongmang(dg)
  const mi = indexOf60(mg)
  // 시작 나이: 시작하는 해 − 태어난 해 (연 나이). 최소 1.
  const startAge = Math.max(1, new Date(ds.startAdj).getUTCFullYear() - input.year)
  const daewoon: DaewoonItem[] = []
  for (let n = 1; n <= 10; n++) {
    const g = ganzi60(mi + ds.ganziStep * n)
    daewoon.push({
      index: n,
      ganzi: g,
      startDate: new Date(ds.startAdj + (n - 1) * 10 * 365.2425 * 86_400_000),
      age: startAge + (n - 1) * 10,
      stemSipsin: getRelation(dayStem, g[0])!.hanja,
      branchSipsin: getRelation(dayStem, getJeonggi(g[1]))!.hanja,
      unseong: getTwelveMeteor(dayStem, g[1]),
      sinsal: getTwelveSpirit(yearBranch, g[1]),
      isGongmang: gong.includes(g[1]),
    })
  }

  const known = (g: string) => (g.includes('?') ? '' : g)
  const rel = analyzeAllRelations([known(hg), dg, mg, yg])
  const sals = getSpecialSals(unk ? ['?', ...stems.slice(1)] : stems, unk ? ['?', ...branches.slice(1)] : branches, dg)
  const gongmang: Gongmang = {
    branches: gong,
    pillarIndices: [0, 1, 2, 3].filter((i) => !(unk && i === 0) && gong.includes(branches[i])),
  }
  return { input, pillars, daewoon, relations: rel, specialSals: sals, gongmang }
}

export { prevNextJie, dayIndex, SKY, BRANCH_ELEMENT }
