/**
 * 명리 시기 모듈 (2단계)
 *
 * 대운·세운·월운이 원국과 어떻게 만나는지를 규칙으로 계산한다.
 *  1) 들어오는 간지의 오행이 내 용신/희신/기신/구신 중 무엇인지 (역할 점수)
 *  2) 원국 네 기둥·대운과의 합·충·형·해·파·원진, 복음, 천극지충, 삼합·방합 완성
 *  3) 부딪힌 자리(궁위)별 의미 — 년주: 외부환경 / 월주: 직업·사회 / 일지: 배우자·건강 / 시주: 자녀·계획
 * 점수는 "흐름의 방향"을 보여 주는 참고 지표이며, 확정 예언이 아니다.
 * 가중치는 아래 상수에서 조정한다.
 */
import type { DaewoonItem, Element, RelationResult, SajuResult } from '@orrery/core/types'
import { calcSolarTerms, getBranchRelation, getFourPillars, getStemRelation, getYearGanzi } from '@orrery/core/pillars'
import {
  BRANCH_ELEMENT, DIRECTIONAL_COMPOSES, DIRECTIONAL_COMPOSE_ELEMENTS, STEM_INFO, TRIPLE_COMPOSES, TRIPLE_COMPOSE_ELEMENTS,
} from '@orrery/core/constants'
import { KO, GROUP_OF, roleOf, sipsinOf, type Analysis, type Role } from './index'

/* ───────── 조정 가능한 상수 ───────── */
const ROLE_W: Record<Role, number> = { 용신: 2, 희신: 1, 한신: 0, 구신: -1, 기신: -2 }
const STEM_ROLE_F = 0.8
const BRANCH_ROLE_F = 1.2
const SECONDARY_BONUS = 0.5
/** 궁위 가중치(지지 기준). 천간은 STEM_HIT_F를 곱한다 */
const PALACE_W = { 시주: 0.7, 일주: 1.5, 월주: 1.0, 년주: 0.7, 대운: 1.0, 세운: 0.8 } as const
const STEM_HIT_F = 0.5
const KIND_W: Record<string, number> = { 沖: -1.0, 刑: -0.7, 害: -0.3, 破: -0.3, 怨嗔: -0.2, 鬼門: -0.2, 合: 0.6 }
/** 해·파·원진·귀문 합산 하한 (궁위 가중치 곱하기 전) */
const MINOR_CAP = 0.4
const COMPOSE_FULL = 1.0
const COMPOSE_HALF = 0.5
const BOKEUM = -0.5
const CHEONGEUK_JICHUNG = -0.8
const GONGMANG_PENALTY = -0.3
const MONTH_F = 0.7

type Palace = keyof typeof PALACE_W
const PALACE_MEANING: Record<string, string> = {
  년주: '조상·외부 환경·사회적 배경',
  월주: '부모·직업·사회 활동',
  일주: '나 자신·배우자·건강',
  시주: '자녀·후배·계획·말년',
  대운: '현재 10년 흐름',
  세운: '그해의 흐름',
}
const KIND_KO: Record<string, string> = {
  沖: '충(沖)', 合: '합(合)', 刑: '형(刑)', 害: '해(害)', 破: '파(破)', 怨嗔: '원진(怨嗔)', 鬼門: '귀문(鬼門)',
}
const DOMAIN: Record<string, string> = {
  비겁: '경쟁·동업·독립·지출',
  식상: '표현·창작·사업·이직',
  재성: '재물 기회·지출·거래',
  관성: '직장·책임·승진·압박',
  인성: '학업·자격·문서·계약',
}

/* ───────── 타입 ───────── */
export interface Hit {
  /** 부딪힌 대상: '일지', '월간', '대운지' 등 */
  target: string
  palace: Palace
  kind: string
  pair: string
  effect: number
  meaning: string
}
export interface Luck {
  label: string
  ganzi: string
  stemRole: Role
  branchRole: Role
  stemSipsin: string
  branchSipsin: string
  score: number
  tone: '좋은 흐름' | '무난·약간 좋음' | '평탄·혼재' | '주의' | '조심'
  hits: Hit[]
  domains: string[]
  notes: string[]
  /** 월운일 때 시작 날짜 */
  from?: string
}
export interface YearLuck extends Luck {
  year: number
  daewoon: { ganzi: string; ageFrom: number; startYear: number; turning: boolean } | null
  months: Luck[]
}

/* ───────── 도구 ───────── */
const mainStem = (b: string): string => {
  const h = (BRANCH_STEM[b] ?? '')
  return h
}
// 지지의 정기 천간 (JIJANGGAN 마지막 글자) — 간단 표
const BRANCH_STEM: Record<string, string> = {
  子: '癸', 丑: '己', 寅: '甲', 卯: '乙', 辰: '戊', 巳: '丙', 午: '丁', 未: '己', 申: '庚', 酉: '辛', 戌: '戊', 亥: '壬',
}

function union(a: RelationResult[], b: RelationResult[]): RelationResult[] {
  const seen = new Set<string>()
  const out: RelationResult[] = []
  for (const x of [...a, ...b]) {
    const k = `${x.type}|${x.detail ?? ''}`
    if (!seen.has(k)) { seen.add(k); out.push(x) }
  }
  return out
}
const stemRel = (x: string, y: string) => union(getStemRelation(x, y), getStemRelation(y, x))
const branchRel = (x: string, y: string) => union(getBranchRelation(x, y), getBranchRelation(y, x))

function roleScoreFor(a: Analysis, el: Element): number {
  let w = ROLE_W[roleOf(a, el)]
  if (a.yongsin.secondary && a.yongsin.secondary.element === el) w += SECONDARY_BONUS
  return w
}

interface Target { name: string; palace: Palace; stem?: string; branch?: string; ganzi?: string }

function natalTargets(r: SajuResult): Target[] {
  const P = r.pillars
  const unk = !!r.input.unknownTime
  const defs: { idx: number; palace: Palace; s: string; b: string }[] = [
    { idx: 3, palace: '년주', s: '년간', b: '년지' },
    { idx: 2, palace: '월주', s: '월간', b: '월지' },
    { idx: 1, palace: '일주', s: '일간', b: '일지' },
    { idx: 0, palace: '시주', s: '시간', b: '시지' },
  ]
  const out: Target[] = []
  for (const d of defs) {
    if (unk && d.idx === 0) continue
    const p = P[d.idx].pillar
    out.push({ name: d.palace, palace: d.palace, stem: p.stem, branch: p.branch, ganzi: p.ganzi })
  }
  return out
}

function targetLabel(t: Target, part: 'stem' | 'branch'): string {
  if (t.palace === '대운' || t.palace === '세운') return `${t.palace}${part === 'stem' ? '간' : '지'}`
  const base = t.palace.slice(0, 1)
  return base + (part === 'stem' ? '간' : '지')
}

function hitsAgainst(a: Analysis, stem: string, branch: string, targets: Target[], natalBranches: string[]): Hit[] {
  const out: Hit[] = []
  const ganzi = stem + branch
  for (const t of targets) {
    const pw = PALACE_W[t.palace]
    let stemClash = false
    let branchClash = false
    if (t.stem) {
      for (const rel of stemRel(stem, t.stem)) {
        const base = KIND_W[rel.type]
        if (base === undefined) continue
        let eff = base * pw * STEM_HIT_F
        if (rel.type === '合' && rel.detail) eff += (ROLE_W[roleOf(a, rel.detail as Element)] >= 1 ? 0.2 : ROLE_W[roleOf(a, rel.detail as Element)] <= -1 ? -0.2 : 0)
        if (rel.type === '沖') stemClash = true
        out.push({
          target: targetLabel(t, 'stem'), palace: t.palace, kind: KIND_KO[rel.type] ?? rel.type, pair: `${stem}↔${t.stem}`,
          effect: eff, meaning: PALACE_MEANING[t.palace],
        })
      }
    }
    if (t.branch) {
      let rels = branchRel(branch, t.branch)
      // 충이 있으면 해·파·원진·귀문은 충에 흡수되고, 형은 절반만 반영 (같은 부딪힘을 중복 계산하지 않기 위해)
      const hasClash = rels.some((x) => x.type === '沖')
      if (hasClash) rels = rels.filter((x) => !['害', '破', '怨嗔', '鬼門'].includes(x.type))
      const minor = ['害', '破', '怨嗔', '鬼門']
      const minorSum = rels.filter((x) => minor.includes(x.type)).reduce((sum, x) => sum + KIND_W[x.type] * pw, 0)
      const minorScale = minorSum < -MINOR_CAP * pw ? (-MINOR_CAP * pw) / minorSum : 1
      for (const rel of rels) {
        const base = KIND_W[rel.type]
        if (base === undefined) continue
        let eff = base * pw
        if (rel.type === '刑' && hasClash) eff *= 0.5
        if (minor.includes(rel.type)) eff *= minorScale
        if (rel.type === '合' && rel.detail) eff += (ROLE_W[roleOf(a, rel.detail as Element)] >= 1 ? 0.3 : ROLE_W[roleOf(a, rel.detail as Element)] <= -1 ? -0.3 : 0)
        if (rel.type === '沖') branchClash = true
        out.push({
          target: targetLabel(t, 'branch'), palace: t.palace, kind: KIND_KO[rel.type] ?? rel.type, pair: `${branch}↔${t.branch}`,
          effect: eff, meaning: PALACE_MEANING[t.palace],
        })
      }
    }
    if (t.ganzi && t.ganzi === ganzi) {
      out.push({ target: t.palace, palace: t.palace, kind: '복음(伏吟)', pair: ganzi, effect: BOKEUM * pw, meaning: `${PALACE_MEANING[t.palace]} — 같은 주제가 되풀이되기 쉬움` })
    }
    if (stemClash && branchClash) {
      out.push({ target: t.palace, palace: t.palace, kind: '천극지충(天剋地沖)', pair: `${ganzi}↔${t.ganzi}`, effect: CHEONGEUK_JICHUNG * pw, meaning: `${PALACE_MEANING[t.palace]} — 간지가 모두 부딪혀 변동 폭이 큼` })
    }
  }
  // 삼합·방합 (들어오는 지지가 원국 지지와 함께 완성)
  const nb = new Set(natalBranches)
  const addCompose = (list: [string, string, string][], elMap: Record<string, string>, name: string) => {
    for (const trio of list) {
      if (!trio.includes(branch)) continue
      const others = trio.filter((b) => b !== branch)
      const have = others.filter((b) => nb.has(b)).length
      if (have === 0) continue
      const el = elMap[trio.join(',')] as Element
      const rw = ROLE_W[roleOf(a, el)]
      const sign = rw >= 1 ? 1 : rw <= -1 ? -1 : 0.3
      const full = have === 2
      if (!full && (name === '방합' || !(trio[1] === branch || nb.has(trio[1])))) continue
      out.push({
        target: '원국', palace: '월주', kind: `${full ? name + ' 완성' : name + ' 반합'}(${KO[el]})`, pair: trio.join(''),
        effect: sign * (full ? COMPOSE_FULL : COMPOSE_HALF), meaning: `${KO[el]} 기운이 크게 모임 — ${roleOf(a, el)} 방향`,
      })
    }
  }
  addCompose(TRIPLE_COMPOSES, TRIPLE_COMPOSE_ELEMENTS, '삼합')
  addCompose(DIRECTIONAL_COMPOSES, DIRECTIONAL_COMPOSE_ELEMENTS, '방합')
  return out
}

function toneOf(score: number): Luck['tone'] {
  if (score >= 3) return '좋은 흐름'
  if (score >= 1) return '무난·약간 좋음'
  if (score > -1) return '평탄·혼재'
  if (score > -3) return '주의'
  return '조심'
}

function buildLuck(
  r: SajuResult, a: Analysis, label: string, ganzi: string, targets: Target[], natalBranches: string[], factor = 1,
): Luck {
  const stem = ganzi[0]
  const branch = ganzi[1]
  const stemEl = STEM_INFO[stem].element
  const branchEl = BRANCH_ELEMENT[branch]
  const stemRole = roleOf(a, stemEl)
  const branchRole = roleOf(a, branchEl)
  const dayStem = a.dayStem
  const stemSip = sipsinOf(dayStem, stem)
  const branchSip = sipsinOf(dayStem, mainStem(branch))
  const hits = hitsAgainst(a, stem, branch, targets, natalBranches)
  const base = roleScoreFor(a, stemEl) * STEM_ROLE_F + roleScoreFor(a, branchEl) * BRANCH_ROLE_F
  const notes: string[] = []
  let gm = 0
  if (r.gongmang.branches.includes(branch)) { gm = GONGMANG_PENALTY; notes.push(`지지 ${branch}가 공망에 해당 — 결과가 늦거나 허전하게 느껴질 수 있음`) }
  const score = Math.round((base + hits.reduce((s, h) => s + h.effect, 0) + gm) * factor * 10) / 10
  const g1 = GROUP_OF[stemSip]
  const g2 = GROUP_OF[branchSip]
  const domains = Array.from(new Set([g1, g2])).map((g) => `${g}: ${DOMAIN[g]}`)
  // 이성 인연 별 (남성=재성, 여성=관성)
  const loveGroup = r.input.gender === 'M' ? '재성' : '관성'
  if (g1 === loveGroup || g2 === loveGroup) notes.push(`${loveGroup}이 들어와 이성·배우자 인연의 주제가 활성화됨`)
  return { label, ganzi, stemRole, branchRole, stemSipsin: stemSip, branchSipsin: branchSip, score, tone: toneOf(score), hits, domains, notes }
}

/* ───────── 공개 API ───────── */
function currentDaewoon(r: SajuResult, year: number): { item: DaewoonItem; next?: DaewoonItem } | null {
  const t = Date.UTC(year, 6, 1)
  let cur: DaewoonItem | null = null
  let idx = -1
  r.daewoon.forEach((d, i) => { if (new Date(d.startDate).getTime() <= t) { cur = d; idx = i } })
  if (!cur) return null
  return { item: cur, next: r.daewoon[idx + 1] }
}

function daewoonTargets(d: { ganzi: string } | null): Target[] {
  return d ? [{ name: '대운', palace: '대운', stem: d.ganzi[0], branch: d.ganzi[1], ganzi: d.ganzi }] : []
}

export function yearLuck(r: SajuResult, a: Analysis, year: number, withMonths = true): YearLuck {
  const natal = natalTargets(r)
  const nb = natal.map((t) => t.branch!)
  const dw = currentDaewoon(r, year)
  const dwT = daewoonTargets(dw?.item ?? null)
  const ganzi = getYearGanzi(year)
  const base = buildLuck(r, a, `${year}년`, ganzi, [...natal, ...dwT], nb)
  let daewoon: YearLuck['daewoon'] = null
  if (dw) {
    const sy = (d: DaewoonItem) => new Date(d.startDate).getUTCFullYear()
    const turning = sy(dw.item) === year || (!!dw.next && sy(dw.next) === year) || (!!dw.next && sy(dw.next) === year + 1)
    daewoon = { ganzi: dw.item.ganzi, ageFrom: dw.item.age, startYear: sy(dw.item), turning }
    if (turning) base.notes.push('대운이 바뀌는 시기(교운기)와 가까워 환경·가치관의 변화가 커지기 쉬움')
  }
  const months: Luck[] = []
  if (withMonths) {
    const yT: Target = { name: '세운', palace: '세운', stem: ganzi[0], branch: ganzi[1], ganzi }
    for (let i = 0; i < 12; i++) {
      const y = i === 11 ? year + 1 : year
      const m = i === 11 ? 1 : i + 2 // 寅월(2월) ~ 丑월(다음해 1월)
      const mg = getFourPillars(y, m, 15, 12, 0)[1]
      const st = calcSolarTerms(y, m, 15, 12, 0)
      const lk = buildLuck(r, a, `${i + 1}번째 달`, mg, [...natal, ...dwT, yT], nb, MONTH_F)
      lk.label = `${st.ingiMonth}월 ${st.ingiDay}일~`
      lk.from = `${st.ingiYear}-${String(st.ingiMonth).padStart(2, '0')}-${String(st.ingiDay).padStart(2, '0')}`
      months.push(lk)
    }
  }
  return { ...base, year, daewoon, months }
}

/** 대운 전체 타임라인 (각 대운과 원국의 관계) */
export interface DaewoonLuck extends Luck { ageFrom: number; ageTo: number; startYear: number }
export function daewoonOverview(r: SajuResult, a: Analysis): DaewoonLuck[] {
  const natal = natalTargets(r)
  const nb = natal.map((t) => t.branch!)
  return r.daewoon.map((d, i) => {
    const lk = buildLuck(r, a, `${d.age}세 대운`, d.ganzi, natal, nb)
    const next = r.daewoon[i + 1]
    return { ...lk, ageFrom: d.age, ageTo: next ? next.age - 1 : d.age + 9, startYear: new Date(d.startDate).getUTCFullYear() }
  })
}

/* ───────── AI에게 줄 텍스트 ───────── */
const sgn = (n: number) => (n > 0 ? `+${n}` : `${n}`)
const hitStr = (h: Hit) => `${h.pair} ${h.kind}→${h.target}(${h.meaning})`

function luckLine(l: Luck, withDomains = false): string {
  const hs = l.hits.length ? ' | ' + l.hits.map(hitStr).join(', ') : ''
  const dm = withDomains && l.domains.length ? ' | 주제 ' + l.domains.join(' / ') : ''
  return `${l.label} ${l.ganzi} [천간 ${l.stemSipsin}·${l.stemRole} / 지지 ${l.branchSipsin}·${l.branchRole}] 점수 ${sgn(l.score)} (${l.tone})${hs}${dm}${l.notes.length ? ' | ' + l.notes.join('; ') : ''}`
}

export function daewoonText(r: SajuResult, a: Analysis): string {
  const L = ['[코드가 계산한 대운 분석 — 용신 기준 역할과 원국과의 합충]']
  for (const d of daewoonOverview(r, a)) {
    L.push(`${d.ageFrom}~${d.ageTo}세(${d.startYear}년~) ${luckLine({ ...d, label: d.ganzi }, true).replace(/^\S+ /, '')}`)
  }
  return L.join('\n')
}

export function yearText(r: SajuResult, a: Analysis, year: number, opts: { months?: boolean } = {}): string {
  const y = yearLuck(r, a, year, opts.months ?? true)
  const L = [`[코드가 계산한 ${year}년 시기 분석 — 세운 ${y.ganzi}]`]
  if (y.daewoon) L.push(`현재 대운: ${y.daewoon.ganzi} (${y.daewoon.ageFrom}세~, ${y.daewoon.startYear}년 시작)${y.daewoon.turning ? ' — 교운기 근처' : ''}`)
  L.push(luckLine(y, true))
  if (y.months.length) {
    L.push('월별 흐름 (절기 기준 월건):')
    for (const m of y.months) L.push('- ' + luckLine(m))
    const sorted = [...y.months].sort((p, q) => q.score - p.score)
    L.push('가장 좋은 달: ' + sorted.slice(0, 3).map((m) => `${m.label}(${m.ganzi}, ${sgn(m.score)})`).join(', '))
    L.push('조심할 달: ' + sorted.slice(-3).reverse().map((m) => `${m.label}(${m.ganzi}, ${sgn(m.score)})`).join(', '))
  }
  L.push('※ 점수는 용신 역할과 합충 규칙으로 계산한 방향성 지표이며, 확정 예언이 아니라 경향으로 풀이할 것.')
  return L.join('\n')
}

/** 여러 해를 한 줄씩 요약 (세운 핵심 연도 선정용) */
export function yearsOverviewText(r: SajuResult, a: Analysis, from: number, count: number): string {
  const L = [`[코드가 계산한 ${from}~${from + count - 1}년 세운 요약]`]
  for (let y = from; y < from + count; y++) {
    const lk = yearLuck(r, a, y, false)
    L.push(luckLine(lk))
  }
  return L.join('\n')
}
