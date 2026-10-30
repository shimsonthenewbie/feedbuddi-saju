/**
 * 명리 분야별 규칙집 (3단계)
 *
 * 연애·결혼 / 재물 / 직업 / 건강 / 인간관계·가족 각각에 대해
 * 원국에서 읽히는 근거(십신 배치, 궁위, 오행, 신살, 합충)를 규칙으로 뽑고,
 * 그 분야에 해당하는 해(연도) 후보를 찾는다.
 * AI는 이 근거를 문장으로 풀어쓰기만 한다.
 *
 * 건강 항목은 오행과 장부의 전통적 대응에 따른 "경향"이며 진단이 아니다.
 */
import type { Element, SajuResult } from '@orrery/core/types'
import { BRANCH_ELEMENT, STEM_INFO } from '@orrery/core/constants'
import { GROUP_OF, KO, hiddenStems, mainStemOf, roleOf, sipsinOf, type Analysis, type Group, type Sipsin } from './index'
import { yearLuck } from './timing'

export type DomainKey = 'love' | 'wealth' | 'career' | 'health' | 'relation'
export const DOMAIN_TITLE: Record<DomainKey, string> = {
  love: '연애·결혼', wealth: '재물', career: '직업·사회', health: '건강(경향)', relation: '인간관계·가족',
}

export interface DomainFacts {
  key: DomainKey
  title: string
  /** 원국에서 읽히는 근거 */
  facts: string[]
  /** 시기 후보 (연도별 한 줄) */
  years: string[]
}

/* ───────── 공통 ───────── */
interface Place {
  palace: '년주' | '월주' | '일주' | '시주'
  part: '천간' | '지지'
  stem: string
  sip: Sipsin | '일간'
  group: Group | null
}

function places(r: SajuResult): Place[] {
  const P = r.pillars
  const unk = !!r.input.unknownTime
  const day = P[1].pillar.stem
  const defs: { idx: number; palace: Place['palace'] }[] = [
    { idx: 3, palace: '년주' }, { idx: 2, palace: '월주' }, { idx: 1, palace: '일주' }, { idx: 0, palace: '시주' },
  ]
  const out: Place[] = []
  for (const d of defs) {
    if (unk && d.idx === 0) continue
    const { stem, branch } = P[d.idx].pillar
    if (d.idx === 1) out.push({ palace: d.palace, part: '천간', stem, sip: '일간', group: null })
    else {
      const s = sipsinOf(day, stem)
      out.push({ palace: d.palace, part: '천간', stem, sip: s, group: GROUP_OF[s] })
    }
    const ms = mainStemOf(branch)
    const bs = sipsinOf(day, ms)
    out.push({ palace: d.palace, part: '지지', stem: ms, sip: bs, group: GROUP_OF[bs] })
  }
  return out
}

/** 지장간까지 포함해 해당 그룹이 몇 군데 있는지 */
function hiddenCount(r: SajuResult, group: Group): number {
  const unk = !!r.input.unknownTime
  const day = r.pillars[1].pillar.stem
  let n = 0
  r.pillars.forEach((p, i) => {
    if (unk && i === 0) return
    for (const s of hiddenStems(p.pillar.branch)) if (GROUP_OF[sipsinOf(day, s)] === group) n++
  })
  return n
}

/** 주격조사 이/가 포함형 */
const SUBJ: Record<Element, string> = { tree: '목(木)이', fire: '화(火)가', earth: '토(土)가', metal: '금(金)이', water: '수(水)가' }
const fmt = (ps: Place[]) => ps.map((p) => `${p.palace} ${p.part}(${p.stem}${p.sip})`).join(', ')
const pct = (n: number) => `${Math.round(n * 100)}%`

/** 일지(배우자궁)가 다른 기둥과 맺는 지지 관계 */
function dayBranchRelations(r: SajuResult): string[] {
  const out: string[] = []
  const name = ['시지', '일지', '월지', '년지']
  const unk = !!r.input.unknownTime
  r.relations.pairs.forEach((v, key) => {
    const [x, y] = key.split(',').map(Number)
    if (x !== 1 && y !== 1) return
    const other = x === 1 ? y : x
    if (unk && other === 0) return
    for (const b of v.branch) out.push(`일지-${name[other]} ${b.type}`)
  })
  return out
}

const SPOUSE_PALACE: Record<string, string> = {
  비견: '대등하고 독립적인 동반자 상. 각자의 영역을 지키는 관계가 편함',
  겁재: '주도권·경쟁이 생기기 쉬운 동반자 상. 감정과 재물의 분담 약속이 중요',
  식신: '다정하고 여유로운 상. 편안한 가정 분위기를 중시',
  상관: '표현이 솔직·날카롭고 개성 강한 상. 자극과 갈등이 함께 오기 쉬움',
  편재: '활동적이고 사교적인 상. 현실 감각이 있고 관계에 변화가 잦은 편',
  정재: '성실하고 현실적인 상. 안정 지향',
  편관: '카리스마와 긴장감이 있는 상. 책임과 압박이 함께 오는 관계',
  정관: '반듯하고 책임감 있는 상. 원칙과 예의를 중시',
  편인: '독특하고 사색적인 상. 속마음을 읽기 어려워 정서적 거리감이 생길 수 있음',
  정인: '돌봄과 이해심이 있는 상. 서로 의지하는 관계',
}
const UNSEONG_NOTE: Record<string, string> = {
  長生: '새 출발의 활력', 沐浴: '감정 기복과 이성 인연(도화 기운)', 冠帶: '자기 모습을 꾸미고 드러내려는 기운',
  建祿: '자립심과 안정된 힘', 帝旺: '주관이 매우 강함', 衰: '힘을 거두고 신중해지는 기운', 病: '예민하고 섬세한 기운',
  死: '관계를 정리하고 속으로 삼키는 기운', 墓: '내면에 저장하고 닫아두는 기운', 絶: '끊고 새로 시작하는 기운(관계의 단절·재출발)',
  胎: '새로운 가능성이 싹트는 기운', 養: '보살핌 속에서 자라는 기운',
}

/* ───────── 연애·결혼 ───────── */
function loveFacts(r: SajuResult, a: Analysis): string[] {
  const F: string[] = []
  const male = r.input.gender === 'M'
  const spouse: Group = male ? '재성' : '관성'
  const pl = places(r)
  const sp = pl.filter((p) => p.group === spouse)
  F.push(`배우자성은 ${spouse}(${male ? '남성 기준 재성: 정재=아내/안정적 인연, 편재=활동적·변화 있는 인연' : '여성 기준 관성: 정관=남편/안정적 인연, 편관=강한 인연·긴장 있는 관계'}). 비중 ${pct(a.groups[spouse])}`)
  if (sp.length === 0) F.push(`겉으로 드러난 ${spouse}이 없음 → 인연이 늦게 오거나 지장간 속에 숨어 있음(지장간 ${hiddenCount(r, spouse)}곳)`)
  else F.push(`${spouse} 위치: ${fmt(sp)}`)
  if (sp.length >= 3 || a.groups[spouse] >= 0.35) F.push(`${spouse}이 많아 이성 인연이 많거나 관계 선택이 복잡해질 수 있음`)
  const names = sp.map((p) => p.sip)
  if (!male && names.includes('편관') && names.includes('정관')) F.push('관살혼잡: 정관·편관이 함께 있어 연애 상대/관계 기준이 흔들리기 쉬움')
  if (male && names.includes('편재') && names.includes('정재')) F.push('편재·정재가 함께 있어 이성 인연이 다양한 편')

  const dayBranch = places(r).find((p) => p.palace === '일주' && p.part === '지지')!
  F.push(`배우자궁(일지 ${r.pillars[1].pillar.branch}): ${dayBranch.sip} — ${SPOUSE_PALACE[dayBranch.sip]}`)
  const un = r.pillars[1].unseong
  if (UNSEONG_NOTE[un]) F.push(`일지 12운성 ${un}: ${UNSEONG_NOTE[un]}`)
  const rel = dayBranchRelations(r)
  if (rel.length) F.push(`배우자궁 관계: ${rel.join(', ')} (합은 끌림·결속, 충·형은 관계의 변동·긴장)`)
  if (r.gongmang.branches.includes(r.pillars[1].pillar.branch)) F.push('일지가 공망 → 배우자궁이 비어 보이는 구조. 인연이 늦거나 기대와 현실의 간극이 생길 수 있음')

  const s = r.specialSals
  if (s.dohwa.length) F.push('도화살 있음 → 매력과 이성 인연이 많은 편')
  if (s.hongyeom) F.push('홍염살 있음 → 이성에게 강한 인상을 주는 매력')
  if (a.signals.some((t) => t.startsWith('상관견관'))) F.push('상관견관 신호 → 말과 자존심이 관계에 영향을 줄 수 있음(특히 여성의 결혼운에서 전통적으로 주의)')
  if (a.signals.some((t) => t.startsWith('비겁탈재'))) F.push('비겁탈재 신호 → 연애·결혼에서 경쟁자나 재물 분담 이슈에 주의(남성 기준 특히)')
  return F
}

/* ───────── 재물 ───────── */
function wealthFacts(r: SajuResult, a: Analysis): string[] {
  const F: string[] = []
  const pl = places(r)
  const jae = pl.filter((p) => p.group === '재성')
  F.push(`재성 비중 ${pct(a.groups.재성)}, 식상 ${pct(a.groups.식상)}, 비겁 ${pct(a.groups.비겁)}, 신강도 ${a.strength.label}`)
  F.push(jae.length ? `재성 위치: ${fmt(jae)}` : `겉으로 드러난 재성 없음(지장간 ${hiddenCount(r, '재성')}곳) → 재물 흐름이 눈에 띄지 않거나 늦게 오는 편`)
  const jeong = jae.filter((p) => p.sip === '정재').length
  const pyeon = jae.filter((p) => p.sip === '편재').length
  if (jeong > pyeon) F.push('정재 중심 → 꾸준한 수입·저축·안정 운용형')
  else if (pyeon > jeong) F.push('편재 중심 → 사업·투자·영업 등 큰 흐름을 다루는 형(기복도 큼)')
  else if (jeong && pyeon) F.push('정재·편재가 함께 → 월급형과 사업형 수입을 겸할 여지')
  const strongSide = a.strength.label === '신강' || a.strength.label === '극신강'
  if (strongSide && a.groups.재성 < 0.15) F.push('신강인데 재성이 약함 → 능력은 있으나 재물로 연결하는 통로(식상)를 만드는 것이 과제')
  if (!strongSide && a.groups.재성 >= 0.3) F.push('재다신약 → 기회는 많지만 감당할 체력/기반이 필요. 욕심 확장보다 기반 다지기가 유리')
  if (a.signals.some((t) => t.startsWith('식상생재'))) F.push('식상생재 구조 → 재능·표현·기술이 수입으로 이어지는 흐름')
  if (a.signals.some((t) => t.startsWith('비겁탈재'))) F.push('비겁탈재 경향 → 동업·보증·지인 관계로 새는 돈에 주의')
  // 재고: 辰戌丑未 지지의 지장간에 재성 오행이 있는지
  const day = r.pillars[1].pillar.stem
  const vault = r.pillars
    .map((p, i) => ({ b: p.pillar.branch, i }))
    .filter(({ b, i }) => '辰戌丑未'.includes(b) && !(r.input.unknownTime && i === 0))
    .filter(({ b }) => hiddenStems(b).some((s) => GROUP_OF[sipsinOf(day, s)] === '재성'))
  if (vault.length) F.push(`재고(財庫) 가능성: ${vault.map((v) => v.b).join(', ')} 지지에 재성이 저장됨 → 모으는 힘, 다만 충을 만나면 열려서 변동`)
  const gi = KO[a.yongsin.gisin]
  F.push(`재물 흐름을 해치는 오행은 기신 ${gi} 기운. 이 오행이 강한 해에는 지출·확장 결정을 보수적으로`)
  return F
}

/* ───────── 직업 ───────── */
const WORK_BY_ELEMENT: Record<Element, string> = {
  tree: '교육·출판·기획·콘텐츠·환경·섬유',
  fire: '미디어·IT·마케팅·에너지·방송·조명',
  earth: '부동산·건설·중개·농업·상담·보험',
  metal: '금융·법·기계·의료기기·정밀 기술·군경',
  water: '유통·무역·물류·연구·음료·서비스',
}
const WORK_BY_GROUP: Record<Group, string> = {
  관성: '조직·공직·관리·규율이 있는 환경에서 책임을 맡는 일',
  식상: '창작·기술·강의·표현, 프리랜서·자영 형태의 일',
  재성: '영업·금융·사업·거래, 성과가 숫자로 보이는 일',
  인성: '교육·연구·자격·문서·전문 지식 기반의 일',
  비겁: '독립 사업·경쟁이 있는 분야·팀을 이끄는 일',
}
function careerFacts(r: SajuResult, a: Analysis): string[] {
  const F: string[] = []
  const g = Object.entries(a.groups).sort((x, y) => y[1] - x[1]) as [Group, number][]
  F.push(`십신 구성 상위: ${g.slice(0, 3).map(([k, v]) => `${k} ${pct(v)}`).join(', ')}`)
  F.push(`격국 후보 ${a.gyeokguk.name} (${a.gyeokguk.basis})`)
  F.push(`강한 쪽 성향: ${g[0][0]} → ${WORK_BY_GROUP[g[0][0]]}`)
  if (g[1][1] >= 0.18) F.push(`보조 성향: ${g[1][0]} → ${WORK_BY_GROUP[g[1][0]]}`)
  F.push(`용신 오행 ${KO[a.yongsin.primary]} 방향의 업종이 에너지를 채워 줌: ${WORK_BY_ELEMENT[a.yongsin.primary]}`)
  if (a.yongsin.secondary) F.push(`보조 후보 ${KO[a.yongsin.secondary.element]} 방향: ${WORK_BY_ELEMENT[a.yongsin.secondary.element]}`)
  const month = places(r).filter((p) => p.palace === '월주')
  F.push(`직업궁(월주): ${fmt(month)}`)
  const pl = places(r)
  const gwan = pl.filter((p) => p.group === '관성')
  if (gwan.length) F.push(`관성 위치: ${fmt(gwan)} → 조직·책임과의 접점`)
  else F.push('드러난 관성 없음 → 조직 순응보다 자율·전문성 중심 길이 맞을 가능성')
  if (a.signals.some((t) => t.startsWith('상관견관'))) F.push('상관견관 신호 → 윗사람·조직과 마찰이 생기기 쉬워 표현 방식 조절이 과제')
  if (a.signals.some((t) => t.startsWith('식상생재'))) F.push('식상생재 → 재능을 상품화하는 길(프리랜서·사업·전문직)에 유리')
  if (a.signals.some((t) => t.startsWith('살인상생'))) F.push('살인상생 → 압박을 배움과 자격으로 바꿔 성장하는 구조(전문직·공부형)')
  const sals: string[] = []
  const s = r.specialSals
  if (s.munchang.length) sals.push('문창귀인(학문·문서 재능)')
  if (s.cheonul.length) sals.push('천을귀인(귀인의 도움)')
  if (s.baekho) sals.push('백호살(추진력 크지만 격한 면)')
  if (s.goegang) sals.push('괴강살(강한 리더십)')
  if (sals.length) F.push('관련 신살: ' + sals.join(', '))
  return F
}

/* ───────── 건강(경향) ───────── */
const ORGAN: Record<Element, string> = {
  tree: '간·담, 눈, 근육·인대, 신경',
  fire: '심장·소장, 혈압·혈액순환, 눈·정신적 열감',
  earth: '위·비장(소화), 입맛·체중 관리',
  metal: '폐·대장, 호흡기, 피부',
  water: '신장·방광, 생식·비뇨, 귀, 냉증·순환',
}
function healthFacts(r: SajuResult, a: Analysis): string[] {
  const F: string[] = []
  F.push('※ 전통 이론의 경향이며 의학적 진단이 아님. 증상이 있으면 의료기관 상담이 우선')
  const st = a.elementStatus
  for (const e of st.excess) F.push(`${KO[e]} 과다(${pct(a.elements[e])}) → 해당 계통(${ORGAN[e]})이 과로·과열/정체되기 쉬운 경향`)
  for (const e of st.lack) F.push(`${KO[e]} 부족(${pct(a.elements[e])}) → 해당 계통(${ORGAN[e]})이 약해지기 쉬운 경향`)
  for (const e of st.missing) F.push(`${KO[e]} 없음 → 해당 계통(${ORGAN[e]}) 관리 습관을 의식적으로 챙길 것`)
  F.push(`조후: ${a.climate.note} (한열 지수 ${a.climate.heat}) ${a.climate.need === 'fire' ? '→ 몸을 차게 두지 않는 생활' : a.climate.need === 'water' ? '→ 열을 식히고 수분·휴식 관리' : ''}`.trim())
  const gi = a.yongsin.gisin
  F.push(`기신 ${SUBJ[gi]} 강해지는 해·달에는 해당 계통(${ORGAN[gi]}) 컨디션 관리가 필요`)
  const rel = dayBranchRelations(r).filter((t) => /충|형/.test(t))
  if (rel.length) F.push(`일지(몸의 중심) 충·형: ${rel.join(', ')} → 생활 리듬의 급변, 피로 누적에 주의`)
  if (a.strength.label === '극신강' || a.strength.label === '극신약') F.push(`${a.strength.label} → 에너지의 한쪽 쏠림(과로/소진)에 주의`)
  return F
}

/* ───────── 인간관계·가족 ───────── */
function relationFacts(r: SajuResult, a: Analysis): string[] {
  const F: string[] = []
  const male = r.input.gender === 'M'
  const pl = places(r)
  const g = (k: Group) => pl.filter((p) => p.group === k)
  F.push(`비겁 ${pct(a.groups.비겁)}: ${a.groups.비겁 >= 0.35 ? '자기 주관·의리가 강하고 경쟁/동료 이슈가 잦은 편' : a.groups.비겁 <= 0.1 ? '혼자 해결하려는 경향, 곁의 동료가 적게 느껴질 수 있음' : '동료·친구와 균형 있는 편'}`)
  if (a.groups.인성 >= 0.3) F.push('인성이 강해 보호받고 싶은 마음, 의존이나 생각 과다로 관계 결정이 느려질 수 있음')
  if (a.groups.식상 >= 0.3) F.push('식상이 강해 말과 표현이 활발. 솔직함이 오해를 부를 수 있어 표현 온도 조절이 포인트')
  const mother = g('인성').filter((p) => p.sip === '정인')
  const father = g('재성').filter((p) => p.sip === '편재')
  F.push(`부모궁(월주): ${fmt(pl.filter((p) => p.palace === '월주'))}. 전통적으로 인성=어머니, 편재=아버지 별${mother.length || father.length ? ` (정인 ${mother.length}, 편재 ${father.length} 위치 확인)` : ' (겉으로 뚜렷하지 않음)'}`)
  const kid: Group = male ? '관성' : '식상'
  const kids = g(kid)
  const hour = pl.filter((p) => p.palace === '시주')
  F.push(`자녀궁(시주): ${hour.length ? fmt(hour) : '시간 미상으로 판단 불가'}. 자녀별(${kid}): ${kids.length ? fmt(kids) : '드러난 위치 없음'}`)
  const sibling = g('비겁')
  F.push(`형제·친구(비겁) 위치: ${sibling.length ? fmt(sibling) : '드러난 위치 없음'}`)
  const s = r.specialSals
  if (s.cheonul.length) F.push('천을귀인 있음 → 어려울 때 도움 주는 사람을 만나기 쉬움')
  const rels = a.signals.filter((t) => /관살혼잡|상관견관/.test(t))
  if (rels.length) F.push('관계 마찰 신호: ' + rels.join(' | '))
  return F
}

/* ───────── 시기 후보 ───────── */
function yearCandidates(r: SajuResult, a: Analysis, key: DomainKey, from: number, count: number): string[] {
  const out: string[] = []
  const male = r.input.gender === 'M'
  const spouse: Group = male ? '재성' : '관성'
  for (let y = from; y < from + count; y++) {
    const lk = yearLuck(r, a, y, false)
    const gs = new Set([lk.stemSipsin, lk.branchSipsin].map((s) => GROUP_OF[s as Sipsin]))
    const stemEl = STEM_INFO[lk.ganzi[0]].element
    const branchEl = BRANCH_ELEMENT[lk.ganzi[1]]
    const goodEl = [roleOf(a, stemEl), roleOf(a, branchEl)].filter((x) => x === '용신' || x === '희신').length
    const badEl = [roleOf(a, stemEl), roleOf(a, branchEl)].filter((x) => x === '기신' || x === '구신').length
    const dayHits = lk.hits.filter((h) => h.target === '일지' || h.target === '일간')
    const monthHits = lk.hits.filter((h) => h.target === '월지' || h.target === '월간')
    const dayClash = dayHits.some((h) => /충|형/.test(h.kind))
    const dayHap = dayHits.some((h) => h.kind.startsWith('합'))
    const monthClash = monthHits.some((h) => /충|형/.test(h.kind))
    const tag: string[] = []
    if (key === 'love') {
      if (gs.has(spouse)) tag.push(`${spouse} 유입 → 인연·관계 주제 활성`)
      if (dayHap) tag.push('일지/일간 합 → 끌림·결속의 계기')
      if (dayClash) tag.push('일지 충·형 → 관계 변동·이사·갈등 주의')
    } else if (key === 'wealth') {
      if (gs.has('재성') && goodEl) tag.push('재성 + 용희신 → 재물 기회')
      else if (gs.has('재성') && badEl) tag.push('재성 + 기구신 → 큰 수입·지출 변동, 무리한 확장 주의')
      if (gs.has('비겁') && a.groups.재성 < 0.15) tag.push('비겁 유입 → 경쟁·지출로 새는 돈 주의')
      if (gs.has('식상') && goodEl) tag.push('식상 + 용희신 → 재능·기술이 수입으로 이어질 여지')
    } else if (key === 'career') {
      if (gs.has('관성') && goodEl) tag.push('관성 + 용희신 → 직책·인정·승진 주제')
      if (gs.has('식상') && goodEl) tag.push('식상 + 용희신 → 새 시도·이직·사업 주제')
      if (gs.has('인성') && goodEl) tag.push('인성 + 용희신 → 자격·학업·문서 유리')
      if (monthClash) tag.push('월지/월간 충·형 → 직무·환경 변동, 이직·부서 이동 가능성')
    } else if (key === 'health') {
      if (dayClash) tag.push('일지 충·형 → 생활 리듬 급변·피로 주의')
      if (badEl === 2) tag.push(`기구신이 천간·지지 모두 → 컨디션 관리 필요(${ORGAN[branchEl]})`)
      if (lk.score <= -2.5) tag.push('전반 점수 낮음 → 무리한 일정 줄이기')
    } else {
      if (gs.has('비겁')) tag.push('비겁 유입 → 동료·친구·형제 이슈 활성')
      if (monthClash) tag.push('월주 충·형 → 부모·윗사람·조직과의 관계 변동')
      if (dayClash) tag.push('일지 충·형 → 가까운 사람과의 거리 조정')
    }
    if (tag.length) out.push(`${y}년 ${lk.ganzi}: ${tag.join(' / ')} (전체 ${lk.score > 0 ? '+' : ''}${lk.score}, ${lk.tone})`)
  }
  return out
}

/* ───────── 공개 API ───────── */
export function domainFacts(r: SajuResult, a: Analysis, key: DomainKey, from = new Date().getFullYear(), count = 8): DomainFacts {
  const facts =
    key === 'love' ? loveFacts(r, a) : key === 'wealth' ? wealthFacts(r, a) : key === 'career' ? careerFacts(r, a)
      : key === 'health' ? healthFacts(r, a) : relationFacts(r, a)
  return { key, title: DOMAIN_TITLE[key], facts, years: yearCandidates(r, a, key, from, count) }
}

export function domainsText(r: SajuResult, a: Analysis, keys: DomainKey[], from = new Date().getFullYear(), count = 8): string {
  const L: string[] = []
  for (const k of keys) {
    const d = domainFacts(r, a, k, from, count)
    L.push(`[코드가 정리한 분야별 근거 — ${d.title}]`)
    for (const f of d.facts) L.push('- ' + f)
    L.push(d.years.length ? `시기 후보(${from}~${from + count - 1}):` : `시기 후보(${from}~${from + count - 1}): 뚜렷한 신호 없음`)
    for (const y of d.years) L.push('- ' + y)
  }
  return L.join('\n')
}
