/**
 * 사주 궁합 계산. 두 사람의 일간·일지·월지·년지 관계와 오행 보완만 본다.
 * 같은 두 사람이면 순서를 바꿔도 점수가 같도록 모든 항목을 양쪽 합으로 계산한다.
 * 점수는 '잘 맞는 정도의 경향'을 보여 주는 참고값이다(정답이 아님).
 */
import type { Element, SajuResult } from '@orrery/core/types'
import { getBranchRelation, getStemRelation } from '@orrery/core/pillars'
import { GEN, CTRL, ELEMENTS, sipsinOf, GROUP_OF, type Analysis, type Sipsin, type Group } from './index'
import { STEM_INFO } from '@orrery/core/constants'

export type RelKind = 'harmony' | 'half' | 'clash' | 'punish' | 'harm' | 'break' | 'none'
export type StemRel = 'combine' | 'same' | 'feed' | 'control' | 'clash' | 'plain'
export interface Cross { where: string; kind: RelKind }
export interface Fill { who: 'a' | 'b'; el: Element; level: 'rich' | 'some' }
export interface MatchCalc {
  score: number
  tier: 'top' | 'good' | 'work' | 'diff' | 'hard'
  stemRel: StemRel
  /** 일간 오행 관계에서 누가 누구를 살리는지(feed/control일 때) */
  direction: 'a' | 'b' | null
  dayBranch: RelKind
  yearBranch: RelKind
  monthBranch: RelKind
  /** a 가 보는 b / b 가 보는 a 의 십성 */
  aSeesB: Sipsin
  bSeesA: Sipsin
  fills: Fill[]
  /** 한쪽이 꺼리는 오행이 상대에게 강할 때 */
  strains: { who: 'a' | 'b'; el: Element }[]
  dayStemA: string
  dayStemB: string
  strongA: string
  strongB: string
}

const PTS: Record<RelKind, number> = { harmony: 1, half: 0.5, clash: -1, punish: -0.55, harm: -0.4, break: -0.25, none: 0 }
export function branchKind(x: string, y: string): RelKind {
  const t = new Set(getBranchRelation(x, y).map((r) => r.type))
  if (t.has('合') ) return 'harmony'
  if (t.has('沖')) return 'clash'
  if (t.has('半合')) return 'half'
  if (t.has('刑')) return 'punish'
  if (t.has('害') || t.has('怨嗔')) return 'harm'
  if (t.has('破')) return 'break'
  return 'none'
}
const el = (s: string) => STEM_INFO[s].element as Element

export function matchCalc(rA: SajuResult, aA: Analysis, rB: SajuResult, aB: Analysis): MatchCalc {
  const dA = rA.pillars[1].pillar, dB = rB.pillars[1].pillar
  const mA = rA.pillars[2].pillar, mB = rB.pillars[2].pillar
  const yA = rA.pillars[3].pillar, yB = rB.pillars[3].pillar
  let sum = 0

  // 1) 일간끼리: 합 > 서로 살림 > 같은 기운 > 극 > 충
  let stemRel: StemRel = 'plain'
  let direction: 'a' | 'b' | null = null
  const sr = new Set(getStemRelation(dA.stem, dB.stem).map((r) => r.type))
  const ea = el(dA.stem), eb = el(dB.stem)
  if (sr.has('合')) { stemRel = 'combine'; sum += 18 }
  else if (sr.has('沖')) { stemRel = 'clash'; sum -= 10 }
  else if (ea === eb) { stemRel = 'same'; sum += 6 }
  else if (GEN[ea] === eb) { stemRel = 'feed'; direction = 'a'; sum += 10 }
  else if (GEN[eb] === ea) { stemRel = 'feed'; direction = 'b'; sum += 10 }
  else if (CTRL[ea] === eb) { stemRel = 'control'; direction = 'a'; sum -= 7 }
  else if (CTRL[eb] === ea) { stemRel = 'control'; direction = 'b'; sum -= 7 }

  // 2) 일지(가까운 관계의 자리) 16, 월지(생활 방식) 7, 년지(띠) 6
  const dayBranch = branchKind(dA.branch, dB.branch)
  const monthBranch = branchKind(mA.branch, mB.branch)
  const yearBranch = branchKind(yA.branch, yB.branch)
  sum += PTS[dayBranch] * 16 + PTS[monthBranch] * 7 + PTS[yearBranch] * 6
  // 일지↔월지 엇갈림(양쪽 합)
  sum += (PTS[branchKind(dA.branch, mB.branch)] + PTS[branchKind(dB.branch, mA.branch)]) * 3

  // 3) 서로 어떤 사람으로 보이나(십성) — 가볍게만 반영
  const aSeesB = sipsinOf(dA.stem, dB.stem), bSeesA = sipsinOf(dB.stem, dA.stem)
  const SS: Partial<Record<Sipsin, number>> = { 식신: 3, 정인: 3, 정재: 3, 정관: 3, 편인: 1, 편재: 1, 비견: 1, 겁재: -2, 상관: -2, 편관: -1 }
  sum += (SS[aSeesB] ?? 0) + (SS[bSeesA] ?? 0)

  // 4) 오행 보완: 내게 필요한 기운을 상대가 갖고 있나
  const fills: Fill[] = [], strains: MatchCalc['strains'] = []
  const need = (who: 'a' | 'b', an: Analysis, other: Analysis) => {
    for (const e of [an.yongsin.primary, an.yongsin.heesin]) {
      const v = other.elements[e]
      if (v >= 0.22) { fills.push({ who, el: e, level: 'rich' }); sum += e === an.yongsin.primary ? 9 : 5 }
      else if (v >= 0.12) { fills.push({ who, el: e, level: 'some' }); sum += e === an.yongsin.primary ? 4 : 2 }
    }
    const top = ELEMENTS.reduce((m, e) => (other.elements[e] > other.elements[m] ? e : m), ELEMENTS[0])
    if (top === an.yongsin.gisin && other.elements[top] >= 0.35) { strains.push({ who, el: top }); sum -= 5 }
    else if ((top === an.yongsin.gisin || top === an.yongsin.gusin) && other.elements[top] >= 0.3) { strains.push({ who, el: top }); sum -= 3 }
  }
  need('a', aA, aB); need('b', aB, aA)

  const score = Math.max(25, Math.min(96, Math.round(44 + sum * 0.9)))
  const tier = score >= 85 ? 'top' : score >= 72 ? 'good' : score >= 58 ? 'work' : score >= 45 ? 'diff' : 'hard'
  const strongOf = (an: Analysis) => ELEMENTS.reduce((m, e) => (an.elements[e] > an.elements[m] ? e : m), ELEMENTS[0])
  return { score, tier, stemRel, direction, dayBranch, yearBranch, monthBranch, aSeesB, bSeesA, fills, strains, dayStemA: dA.stem, dayStemB: dB.stem, strongA: strongOf(aA), strongB: strongOf(aB) }
}
export { GROUP_OF }
export type { Group }
