/**
 * 명리 구조 판단 모듈 (1단계)
 *
 * 만세력 계산은 @orrery/core가 맡고, 이 모듈은 그 결과 위에서
 * 신강·신약, 득령·득지·득세, 오행/십신 분포, 격국, 조후, 용신 후보, 구조 신호를 계산한다.
 *
 * 주의: 명리학의 판단 기준은 유파마다 다르다. 여기서는 자평명리 주류
 * (억부 + 조후 + 격국 혼합)를 따르며, 가중치·임계값은 아래 상수로 모아 두어 조정할 수 있다.
 * 결과는 "확정 사실"이 아니라 "전통 이론에 따른 후보"로 다룬다.
 */
import type { Element, SajuResult } from '@orrery/core/types'
import { BRANCH_ELEMENT, JIJANGGAN, STEM_INFO } from '@orrery/core/constants'

/* ───────── 조정 가능한 상수 ───────── */
const STEM_W = { year: 1.0, month: 1.3, hour: 1.0, day: 1.0 }
const BRANCH_W = { year: 1.0, month: 2.5, day: 1.5, hour: 1.0 }
/** 지장간 비중: 3개면 여기/중기/정기, 2개면 여기/정기 */
const HIDDEN_W3 = [0.2, 0.2, 0.6]
const HIDDEN_W2 = [0.3, 0.7]
/** 신강도 구간 (자기편 비율) */
const STRENGTH_CUTS = { veryWeak: 0.25, weak: 0.4, balanced: 0.55, strong: 0.7 }
/** 오행 과다/부족 기준 (전체 대비 비율) */
const EXCESS = 0.35
const LACK = 0.08
/** 월령 기후 점수 (음수=한랭, 양수=조열) */
const MONTH_HEAT: Record<string, number> = {
  子: -3, 丑: -2, 寅: -1, 卯: 0, 辰: 0.5, 巳: 2, 午: 3, 未: 2.5, 申: 0.5, 酉: -0.5, 戌: 0, 亥: -2.5,
}
const HEAT_URGENT = 3
const HEAT_MILD = 2

/* ───────── 기본 표 ───────── */
export const GEN: Record<Element, Element> = { tree: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'tree' }
export const CTRL: Record<Element, Element> = { tree: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'tree' }
export const KO: Record<Element, string> = { tree: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' }
/** 조사(을/를) 포함형 */
const OBJ: Record<Element, string> = { tree: '목(木)을', fire: '화(火)를', earth: '토(土)를', metal: '금(金)을', water: '수(水)를' }
export const ELEMENTS: Element[] = ['tree', 'fire', 'earth', 'metal', 'water']

export type Sipsin =
  | '비견' | '겁재' | '식신' | '상관' | '편재' | '정재' | '편관' | '정관' | '편인' | '정인'
export type Group = '비겁' | '식상' | '재성' | '관성' | '인성'
export const GROUP_OF: Record<Sipsin, Group> = {
  비견: '비겁', 겁재: '비겁', 식신: '식상', 상관: '식상', 편재: '재성', 정재: '재성',
  편관: '관성', 정관: '관성', 편인: '인성', 정인: '인성',
}

const elOf = (stem: string): Element => STEM_INFO[stem].element
const samePol = (a: string, b: string) => STEM_INFO[a].yinyang === STEM_INFO[b].yinyang

/** 일간 기준 다른 천간의 십신 */
export function sipsinOf(dayStem: string, other: string): Sipsin {
  const d = elOf(dayStem)
  const o = elOf(other)
  const same = samePol(dayStem, other)
  if (o === d) return same ? '비견' : '겁재'
  if (GEN[d] === o) return same ? '식신' : '상관'
  if (CTRL[d] === o) return same ? '편재' : '정재'
  if (CTRL[o] === d) return same ? '편관' : '정관'
  return same ? '편인' : '정인' // GEN[o] === d
}

/** 일간 기준 오행이 어느 십신 그룹인지 */
function groupOfElement(day: Element, e: Element): Group {
  if (e === day) return '비겁'
  if (GEN[day] === e) return '식상'
  if (CTRL[day] === e) return '재성'
  if (CTRL[e] === day) return '관성'
  return '인성'
}

/** 지장간 문자열 → [여기, 중기, 정기] (정기가 마지막) */
function hiddenStems(branch: string): string[] {
  return (JIJANGGAN[branch] ?? '').replace(/ /g, '').split('')
}
const mainStemOf = (branch: string) => {
  const h = hiddenStems(branch)
  return h[h.length - 1]
}

/* ───────── 결과 타입 ───────── */
export interface Strength {
  /** 자기편(비겁+인성) 비율 0~1 */
  ratio: number
  label: '극신약' | '신약' | '중화' | '신강' | '극신강'
  deukryeong: boolean
  deukji: boolean
  deukse: boolean
  /** 일간이 지지에 뿌리(통근)를 두었는지 */
  rooted: boolean
  note: string
}
export interface Gyeokguk {
  name: string
  basis: string
  /** 종격·화격 등 특수격 의심 */
  special: string | null
}
export interface Climate {
  heat: number
  need: Element | null
  level: 'urgent' | 'mild' | 'none'
  note: string
}
export interface Yongsin {
  primary: Element
  basis: '억부' | '조후'
  heesin: Element
  gisin: Element
  gusin: Element
  hansin: Element
  secondary: { element: Element; basis: string } | null
  note: string
}
export interface Analysis {
  dayStem: string
  dayElement: Element
  monthBranch: string
  elements: Record<Element, number> // 비율
  groups: Record<Group, number> // 비율
  elementStatus: { excess: Element[]; lack: Element[]; missing: Element[] }
  strength: Strength
  gyeokguk: Gyeokguk
  climate: Climate
  yongsin: Yongsin
  signals: string[]
}

export type Role = '용신' | '희신' | '한신' | '구신' | '기신'
/** 분석 결과 기준으로 오행이 어떤 역할(용·희·한·구·기신)인지 */
export function roleOf(a: Analysis, e: Element): Role {
  const y = a.yongsin
  if (e === y.primary) return '용신'
  if (e === y.heesin) return '희신'
  if (e === y.gisin) return '기신'
  if (e === y.gusin) return '구신'
  return '한신'
}

/* ───────── 계산 ───────── */
interface Contribution {
  element: Element
  weight: number
}

function collect(r: SajuResult): Contribution[] {
  const out: Contribution[] = []
  const unk = !!r.input.unknownTime
  const P = r.pillars // [시, 일, 월, 년]
  const slots: { idx: number; key: 'hour' | 'day' | 'month' | 'year' }[] = [
    { idx: 0, key: 'hour' }, { idx: 1, key: 'day' }, { idx: 2, key: 'month' }, { idx: 3, key: 'year' },
  ]
  for (const { idx, key } of slots) {
    if (unk && idx === 0) continue
    const { stem, branch } = P[idx].pillar
    out.push({ element: elOf(stem), weight: STEM_W[key] })
    const hs = hiddenStems(branch)
    const w = hs.length === 3 ? HIDDEN_W3 : hs.length === 2 ? HIDDEN_W2 : [1]
    hs.forEach((s, i) => out.push({ element: elOf(s), weight: BRANCH_W[key] * (w[i] ?? 0) }))
  }
  return out
}

function strengthLabel(ratio: number): Strength['label'] {
  if (ratio < STRENGTH_CUTS.veryWeak) return '극신약'
  if (ratio < STRENGTH_CUTS.weak) return '신약'
  if (ratio <= STRENGTH_CUTS.balanced) return '중화'
  if (ratio <= STRENGTH_CUTS.strong) return '신강'
  return '극신강'
}

export function analyze(r: SajuResult): Analysis {
  const P = r.pillars
  const unk = !!r.input.unknownTime
  const dayStem = P[1].pillar.stem
  const dayEl = elOf(dayStem)
  const monthBranch = P[2].pillar.branch

  /* 오행·십신 분포 */
  const contrib = collect(r)
  const total = contrib.reduce((s, c) => s + c.weight, 0)
  const el: Record<Element, number> = { tree: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  for (const c of contrib) el[c.element] += c.weight / total
  const grp: Record<Group, number> = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 }
  for (const e of ELEMENTS) grp[groupOfElement(dayEl, e)] += el[e]

  const elementStatus = {
    excess: ELEMENTS.filter((e) => el[e] >= EXCESS),
    lack: ELEMENTS.filter((e) => el[e] > 0 && el[e] <= LACK),
    missing: ELEMENTS.filter((e) => el[e] <= 0.0001),
  }

  /* 신강·신약 + 삼득 */
  const selfEls = (e: Element) => e === dayEl || GEN[e] === dayEl
  const ratio = grp.비겁 + grp.인성
  const monthMain = elOf(mainStemOf(monthBranch))
  const deukryeong = selfEls(monthMain)
  const dayBranchStems = hiddenStems(P[1].pillar.branch)
  const deukji = dayBranchStems.some((s) => selfEls(elOf(s)))
  const rooted = P.some((p, i) => !(unk && i === 0) && hiddenStems(p.pillar.branch).some((s) => elOf(s) === dayEl))
  const around: Element[] = [elOf(P[3].pillar.stem), elOf(P[2].pillar.stem), elOf(mainStemOf(P[3].pillar.branch))]
  if (!unk) around.push(elOf(P[0].pillar.stem), elOf(mainStemOf(P[0].pillar.branch)))
  const deukse = around.filter(selfEls).length * 2 > around.length
  const strength: Strength = {
    ratio,
    label: strengthLabel(ratio),
    deukryeong,
    deukji,
    deukse,
    rooted,
    note: `삼득: 득령 ${deukryeong ? '○' : '×'} / 득지 ${deukji ? '○' : '×'} / 득세 ${deukse ? '○' : '×'}, 뿌리(통근) ${rooted ? '있음' : '없음'}`,
  }

  /* 격국 (월지 기준 내격) */
  const hs = hiddenStems(monthBranch)
  const visible = [P[3].pillar.stem, P[2].pillar.stem, ...(unk ? [] : [P[0].pillar.stem])]
  // 투출: 월지 지장간이 천간에 드러났는지. 정기 → 중기 → 여기 순으로 우선
  const order = [...hs].reverse()
  const chosenStem = order.find((s) => visible.includes(s)) ?? order[0]
  const monthSip = sipsinOf(dayStem, chosenStem)
  const revealed = visible.includes(chosenStem)
  let gName: string = `${monthSip}격`
  if (monthSip === '비견') gName = '건록격'
  if (monthSip === '겁재') gName = STEM_INFO[dayStem].yinyang === '+' ? '양인격' : '월겁격'
  if (monthSip === '편관') gName = '편관격(칠살격)'
  const gyeokguk: Gyeokguk = {
    name: gName,
    basis: `월지 ${monthBranch}의 지장간 ${hs.join('')} 중 ${chosenStem}(${monthSip}) 기준${revealed ? ', 천간에 투출' : ', 투출 없음(정기 기준)'}`,
    special: null,
  }
  if (ratio < 0.18 && !rooted) gyeokguk.special = '자기편이 매우 약하고 뿌리가 없어 종격(從格) 가능성이 있음 — 전문가 확인 필요'
  else if (ratio > 0.85) gyeokguk.special = '자기편이 압도적으로 많아 종강격 계열 가능성이 있음 — 전문가 확인 필요'

  /* 조후 */
  let heat = (MONTH_HEAT[monthBranch] ?? 0) + 4 * (el.fire - el.water)
  heat = Math.round(heat * 10) / 10
  let climate: Climate
  if (heat >= HEAT_URGENT) climate = { heat, need: 'water', level: 'urgent', note: '조열(燥熱): 더운 달·불 기운이 많아 수(水)로 식혀 줄 필요가 큼' }
  else if (heat >= HEAT_MILD) climate = { heat, need: 'water', level: 'mild', note: '다소 더운 구조: 수(水)가 있으면 균형에 도움' }
  else if (heat <= -HEAT_URGENT) climate = { heat, need: 'fire', level: 'urgent', note: '한습(寒濕): 추운 달·물 기운이 많아 화(火)로 데워 줄 필요가 큼' }
  else if (heat <= -HEAT_MILD) climate = { heat, need: 'fire', level: 'mild', note: '다소 차가운 구조: 화(火)가 있으면 균형에 도움' }
  else climate = { heat, need: null, level: 'none', note: '한열이 크게 치우치지 않아 조후 부담이 적음' }

  /* 용신 후보 */
  const strongSide = strength.label === '신강' || strength.label === '극신강'
  const weakSide = strength.label === '신약' || strength.label === '극신약'
  const candGroups: Group[] = strongSide ? ['식상', '재성', '관성'] : weakSide ? ['인성', '비겁'] : ['식상', '재성', '관성', '인성']
  // 이상 비율보다 얼마나 모자란가(need)가 큰 그룹을 우선
  const ideal = strongSide ? 0.5 / 3 : weakSide ? 0.25 : 0.2
  const groupToEl = (g: Group): Element =>
    g === '비겁' ? dayEl : g === '식상' ? GEN[dayEl] : g === '재성' ? CTRL[dayEl] : g === '관성' ? ELEMENTS.find((e) => CTRL[e] === dayEl)! : ELEMENTS.find((e) => GEN[e] === dayEl)!
  const ranked = candGroups
    .map((g) => ({ g, need: ideal - grp[g] }))
    .sort((a, b) => b.need - a.need)
  const eokbuEl = groupToEl(ranked[0].g)
  let primary = eokbuEl
  let basis: Yongsin['basis'] = '억부'
  let secondary: Yongsin['secondary'] = null
  let ynote = `${strength.label} 구조이므로 ${ranked[0].g} 쪽 ${OBJ[eokbuEl]} 우선 후보로 봄`
  if (climate.need && climate.level === 'urgent' && climate.need !== eokbuEl) {
    primary = climate.need
    basis = '조후'
    secondary = { element: eokbuEl, basis: '억부' }
    ynote = `조후가 급해 ${OBJ[primary]} 먼저 보고, 억부상 ${KO[eokbuEl]}은 보조 후보로 둠`
  } else if (climate.need && climate.need !== eokbuEl) {
    secondary = { element: climate.need, basis: '조후' }
    ynote += `. 조후상 ${KO[climate.need]}도 함께 고려`
  }
  const heesin = ELEMENTS.find((e) => GEN[e] === primary)!
  const gisin = ELEMENTS.find((e) => CTRL[e] === primary)!
  const gusin = ELEMENTS.find((e) => GEN[e] === gisin)!
  const hansin = ELEMENTS.find((e) => ![primary, heesin, gisin, gusin].includes(e))!
  if (secondary && (secondary.element === gisin || secondary.element === gusin)) {
    ynote += `. 다만 보조 후보 ${KO[secondary.element]}가 ${secondary.element === gisin ? '기신' : '구신'} 자리와 겹쳐 충돌하므로, 해석 시 주 용신을 우선하고 보조는 약하게 반영`
  }
  const yongsin: Yongsin = { primary, basis, heesin, gisin, gusin, hansin, secondary, note: ynote }

  /* 구조 신호 (확정이 아닌 힌트) */
  const signals: string[] = []
  const visSip = visible.map((s) => sipsinOf(dayStem, s))
  if (weakSide && grp.재성 >= 0.3) signals.push('재다신약: 재물 기운은 많은데 일간이 약해 감당이 버거울 수 있음')
  if (visSip.includes('편관') && visSip.includes('정관')) signals.push('관살혼잡: 천간에 편관·정관이 함께 드러남')
  if (visSip.includes('상관') && visSip.includes('정관')) signals.push('상관견관: 천간에 상관과 정관이 함께 드러남')
  if (grp.인성 >= EXCESS) signals.push('인성과다: 생각·보호·의존 성향이 지나치게 커질 수 있음')
  if (grp.관성 >= EXCESS) signals.push('관성과다: 책임·압박·규율의 비중이 큼')
  if (grp.식상 >= EXCESS) signals.push('식상과다: 표현·재능은 넘치나 에너지가 분산되기 쉬움')
  if (grp.비겁 >= 0.45 && grp.재성 <= 0.1) signals.push('비겁탈재 경향: 자기편이 많고 재성이 약해 재물 관리에 주의')
  if (strongSide && grp.식상 >= 0.15 && grp.재성 >= 0.15) signals.push('식상생재: 재능·표현이 재물로 이어지는 구조')
  if (grp.관성 >= 0.15 && grp.인성 >= 0.15 && weakSide) signals.push('살인상생: 압박(관성)이 배움·보호(인성)로 바뀌는 구조')
  if (elementStatus.missing.length) signals.push(`${elementStatus.missing.map((e) => KO[e]).join(', ')} 기운이 원국에 전혀 없음`)

  return {
    dayStem, dayElement: dayEl, monthBranch, elements: el, groups: grp,
    elementStatus, strength, gyeokguk, climate, yongsin, signals,
  }
}

/* ───────── AI에게 줄 "확정 사실" 텍스트 ───────── */
const pct = (n: number) => `${Math.round(n * 100)}%`

export function analysisText(a: Analysis): string {
  const L: string[] = []
  L.push('[코드가 계산한 구조 분석 — 아래 수치와 판정을 그대로 근거로 사용할 것]')
  L.push('오행 분포: ' + ELEMENTS.map((e) => `${KO[e]} ${pct(a.elements[e])}`).join(' / '))
  L.push('십신 그룹: ' + (Object.keys(a.groups) as Group[]).map((g) => `${g} ${pct(a.groups[g])}`).join(' / '))
  const st = a.elementStatus
  if (st.excess.length) L.push('과다 오행: ' + st.excess.map((e) => KO[e]).join(', '))
  if (st.lack.length) L.push('부족 오행: ' + st.lack.map((e) => KO[e]).join(', '))
  if (st.missing.length) L.push('없는 오행: ' + st.missing.map((e) => KO[e]).join(', '))
  L.push(`신강·신약: ${a.strength.label} (자기편 ${pct(a.strength.ratio)}) — ${a.strength.note}`)
  L.push(`격국 후보: ${a.gyeokguk.name} (${a.gyeokguk.basis})${a.gyeokguk.special ? ' / 주의: ' + a.gyeokguk.special : ''}`)
  L.push(`조후: ${a.climate.note} (한열 지수 ${a.climate.heat})`)
  const y = a.yongsin
  L.push(`용신 후보: ${KO[y.primary]} [${y.basis}] — ${y.note}`)
  L.push(`희신 ${KO[y.heesin]} / 기신 ${KO[y.gisin]} / 구신 ${KO[y.gusin]} / 한신 ${KO[y.hansin]}`)
  if (a.signals.length) L.push('구조 신호: ' + a.signals.join(' | '))
  L.push('※ 위 판정은 자평명리 주류(억부+조후+격국) 기준의 후보이며, 유파에 따라 달라질 수 있음을 풀이에 신뢰도로 반영할 것.')
  return L.join('\n')
}
