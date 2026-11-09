/**
 * "나와 잘 맞는 사주" 추천 (태어난 해만으로 보는 가벼운 참고)
 * 태어난 해의 간지(년주)만 알 수 있으므로, 내 사주의 용신·일지·년지와의 관계만 본다.
 * 월·일·시가 빠져 있어 정확한 궁합이 아니다. 정확한 값은 생년월일시 궁합에서 본다.
 */
import type { Element, SajuResult } from '@orrery/core/types'
import { getStemRelation, getYearGanzi } from '@orrery/core/pillars'
import { BRANCH_ELEMENT, STEM_INFO } from '@orrery/core/constants'
import { roleOf, type Analysis, type Role } from './index'
import { branchKind, type RelKind } from './match'

export type PickWhy = 'fill' | 'dayHarm' | 'dayClash' | 'yearHarm' | 'yearClash' | 'strain' | 'stemCombine'
export interface Pick {
  year: number
  ganzi: string
  /** 띠 글자(지지) */
  branch: string
  score: number
  tier: 'best' | 'good' | 'mid' | 'care'
  why: { key: PickWhy; el?: Element }[]
}
const SIGN: Record<Role, number> = { 용신: 2, 희신: 1, 한신: 0, 구신: -1, 기신: -2 }
const PTS: Record<RelKind, number> = { harmony: 1, half: 0.6, clash: -1, punish: -0.5, harm: -0.4, break: -0.25, none: 0 }

export function pickCalc(r: SajuResult, a: Analysis, around = 10): { all: Pick[]; best: Pick[]; care: Pick[] } {
  const by = r.input.year
  const dayB = r.pillars[1].pillar.branch, yearB = r.pillars[3].pillar.branch, dayS = r.pillars[1].pillar.stem
  const rows: Pick[] = []
  const maxY = new Date().getFullYear() - 21 // 성인(만 20세 이상)만 추천 후보
  for (let y = by - around; y <= Math.min(by + around, maxY); y++) {
    const g = getYearGanzi(y)
    const se = STEM_INFO[g[0]].element as Element, be = BRANCH_ELEMENT[g[1]] as Element
    const why: Pick['why'] = []
    let s = 0
    for (const e of [se, be]) {
      const sg = SIGN[roleOf(a, e)] * 0.7
      s += sg
      if (sg >= 1.4 && !why.some((w) => w.key === 'fill' && w.el === e)) why.push({ key: 'fill', el: e })
      if (sg <= -1.4 && !why.some((w) => w.key === 'strain' && w.el === e)) why.push({ key: 'strain', el: e })
    }
    const dk = branchKind(g[1], dayB), yk = branchKind(g[1], yearB)
    s += PTS[dk] * 1.4 + PTS[yk] * 0.8
    if (dk === 'harmony' || dk === 'half') why.push({ key: 'dayHarm' })
    if (dk === 'clash') why.push({ key: 'dayClash' })
    if (dk !== 'clash' && (yk === 'harmony' || yk === 'half')) why.push({ key: 'yearHarm' })
    if (yk === 'clash') why.push({ key: 'yearClash' })
    if (getStemRelation(dayS, g[0]).some((x) => x.type === '合')) { s += 0.8; why.push({ key: 'stemCombine' }) }
    rows.push({ year: y, ganzi: g, branch: g[1], score: Math.round(s * 10) / 10, tier: 'mid', why })
  }
  const sorted = [...rows].sort((p, q) => q.score - p.score)
  const best = sorted.filter((x) => x.score > 0).slice(0, 4)
  const care = sorted.filter((x) => x.score < 0).slice(-3).reverse()
  for (const x of best) x.tier = 'best'
  for (const x of care) x.tier = 'care'
  rows.sort((p, q) => p.year - q.year)
  return { all: rows, best, care }
}
