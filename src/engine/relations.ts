// 합·충·형·파·해 등 글자 사이의 관계 (고전 명리의 공통 규칙으로 직접 작성)
import type { AllRelations, PairRelation, RelationResult } from './types'
import { DIRECTIONAL_COMPOSES, DIRECTIONAL_COMPOSE_ELEMENTS, TRIPLE_COMPOSES, TRIPLE_COMPOSE_ELEMENTS } from './constants'

const pairKey = (a: string, b: string) => [a, b].sort().join('')
const mk = (list: Array<[string, string, string?]>) => {
  const m = new Map<string, string | null>()
  for (const [a, b, d] of list) m.set(pairKey(a, b), d ?? null)
  return m
}

// 천간
const STEM_HAP = mk([['甲', '己', 'earth'], ['乙', '庚', 'metal'], ['丙', '辛', 'water'], ['丁', '壬', 'tree'], ['戊', '癸', 'fire']])
const STEM_CHUNG = mk([['甲', '庚'], ['乙', '辛'], ['丙', '壬'], ['丁', '癸']])

export function getStemRelation(a: string, b: string): RelationResult[] {
  const out: RelationResult[] = []
  const k = pairKey(a, b)
  if (STEM_HAP.has(k)) out.push({ type: '合', detail: STEM_HAP.get(k)! })
  if (STEM_CHUNG.has(k)) out.push({ type: '沖', detail: null })
  return out
}

// 지지
const YUKHAP = mk([['子', '丑', 'earth'], ['寅', '亥', 'tree'], ['卯', '戌', 'fire'], ['辰', '酉', 'metal'], ['巳', '申', 'water'], ['午', '未', 'fire']])
const CHUNG = mk([['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']])
const PA = mk([['子', '酉'], ['丑', '辰'], ['寅', '亥'], ['卯', '午'], ['巳', '申'], ['未', '戌']])
const HAE = mk([['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌']])
const WONJIN = mk([['子', '未'], ['丑', '午'], ['寅', '酉'], ['卯', '申'], ['辰', '亥'], ['巳', '戌']])
const GWIMUN = mk([['子', '酉'], ['丑', '午'], ['寅', '未'], ['卯', '申'], ['辰', '亥'], ['巳', '戌']])
// 형: 寅巳申(무은지형) 丑戌未(지세지형=무례) 子卯(상형=무례?) — 이름은 아래에서 붙인다
const HYUNG_MUEUN = ['寅', '巳', '申']
const HYUNG_MURYE = ['丑', '戌', '未']
const SELF = new Set(['辰', '午', '酉', '亥'])
// 반합: 왕지(子午卯酉)와 생지·묘지가 만난 것
const BANHAP: Array<[string, string, string]> = [
  ['子', '申', 'water'], ['子', '辰', 'water'], ['午', '寅', 'fire'], ['午', '戌', 'fire'],
  ['卯', '亥', 'tree'], ['卯', '未', 'tree'], ['酉', '巳', 'metal'], ['酉', '丑', 'metal'],
]

export function getBranchRelation(a: string, b: string): RelationResult[] {
  const out: RelationResult[] = []
  const k = pairKey(a, b)
  if (YUKHAP.has(k)) out.push({ type: '合', detail: YUKHAP.get(k)! })
  const bh = BANHAP.find(([x, y]) => pairKey(x, y) === k)
  if (bh) out.push({ type: '半合', detail: bh[2] })
  if (CHUNG.has(k)) out.push({ type: '沖', detail: null })
  if (PA.has(k)) out.push({ type: '破', detail: null })
  if (HAE.has(k)) out.push({ type: '害', detail: null })
  if (WONJIN.has(k)) out.push({ type: '怨嗔', detail: null })
  if (GWIMUN.has(k)) out.push({ type: '鬼門', detail: null })
  if (a !== b) {
    if (HYUNG_MUEUN.includes(a) && HYUNG_MUEUN.includes(b)) out.push({ type: '刑', detail: '無恩' })
    else if (HYUNG_MURYE.includes(a) && HYUNG_MURYE.includes(b)) out.push({ type: '刑', detail: '無禮' })
    else if (k === pairKey('子', '卯')) out.push({ type: '刑', detail: '相刑' })
  } else if (SELF.has(a)) out.push({ type: '刑', detail: '自刑' })
  return out
}

export function analyzePillarRelations(p1: string, p2: string): PairRelation {
  return { stem: getStemRelation(p1[0], p2[0]), branch: getBranchRelation(p1[1], p2[1]) }
}

const subsetOf = (group: readonly string[], have: string[]) => group.every((g) => have.includes(g))

export function checkTripleCompose(branches: string[]): RelationResult[] {
  return TRIPLE_COMPOSES.filter((g) => subsetOf(g, branches)).map((g) => ({ type: '三合', detail: TRIPLE_COMPOSE_ELEMENTS[g.join()] }))
}
export function checkDirectionalCompose(branches: string[]): RelationResult[] {
  return DIRECTIONAL_COMPOSES.filter((g) => subsetOf(g, branches)).map((g) => ({ type: '方合', detail: DIRECTIONAL_COMPOSE_ELEMENTS[g.join()] }))
}

/** 팔자 전체 관계. pillars는 [시, 일, 월, 년] 순서의 간지 문자열 4개. */
export function analyzeAllRelations(pillars: string[]): AllRelations {
  const pairs = new Map<string, PairRelation>()
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      if (!pillars[i] || !pillars[j] || pillars[i].includes('?') || pillars[j].includes('?')) continue
      const r = analyzePillarRelations(pillars[i], pillars[j])
      if (r.stem.length || r.branch.length) pairs.set(`${i},${j}`, r)
    }
  }
  const branches = pillars.filter((p) => p && !p.includes('?')).map((p) => p[1])
  return { pairs, triple: checkTripleCompose(branches), directional: checkDirectionalCompose(branches) }
}
