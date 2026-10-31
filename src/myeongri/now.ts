/**
 * 현재 시점 진단 + 과거 연도 검증 마커 (점집식 풀이용)
 *
 * 점집에서 "지금 이런 일을 겪고 계시죠", "몇 년도에 이런 일이 있었죠"라고 짚는 방식을
 * 규칙으로 만든다. 대운·세운·월운이 원국과 부딪히는 자리(궁위)와 십신 유입에서
 * "어떤 종류의 사건이 일어나기 쉬운지"를 뽑는다.
 *
 * 이 결과는 사건을 확정하는 것이 아니라 "가능성이 높은 주제"다. AI는 반드시
 * 가능성 어조로 쓰고, 사용자가 맞는지 확인할 수 있게 질문 형태로 제시해야 한다.
 */
import type { SajuResult } from '@orrery/core/types'
import { GROUP_OF, type Analysis, type Group, type Sipsin } from './index'
import { daewoonOverview, luckAt, yearLuck, type Hit, type Luck } from './timing'

export interface Theme {
  key: string
  domain: 'love' | 'wealth' | 'career' | 'health' | 'relation' | 'all'
  text: string
  weight: number
  basis: string
}

const hitPairs = (hh: Hit[]) => Array.from(new Set(hh.map((h) => `${h.pair} ${h.kind}`))).join(', ')

/** 한 시점(대운/세운/월운)의 Luck에서 일어나기 쉬운 주제를 뽑는다 */
export function themesOf(r: SajuResult, a: Analysis, lk: Luck): Theme[] {
  const T: Theme[] = []
  const male = r.input.gender === 'M'
  const spouse: Group = male ? '재성' : '관성'
  const unk = !!r.input.unknownTime
  const sel = (targets: string[], re: RegExp) => lk.hits.filter((h) => targets.includes(h.target) && re.test(h.kind))
  const good = [lk.stemRole, lk.branchRole].filter((x) => x === '용신' || x === '희신').length
  const bad = [lk.stemRole, lk.branchRole].filter((x) => x === '기신' || x === '구신').length
  const g1 = GROUP_OF[lk.stemSipsin as Sipsin]
  const g2 = GROUP_OF[lk.branchSipsin as Sipsin]
  const groups = new Set<Group>([g1, g2])
  const both = (g: Group) => (g1 === g && g2 === g ? 1.3 : 1)
  const tone = good > bad ? '+' : bad > good ? '-' : '0'

  const add = (key: string, domain: Theme['domain'], text: string, weight: number, basis: string) =>
    T.push({ key, domain, text, weight, basis })

  const dayClash = sel(['일지', '일간'], /충|형/)
  if (dayClash.length)
    add('dayClash', 'love', '가까운 사람과의 관계, 사는 곳, 몸의 리듬이 흔들리는 일(이사·거처 변화, 연인·가족과의 마찰이나 이별, 생활 패턴의 급변)', 3, hitPairs(dayClash))
  const monthClash = sel(['월지', '월간'], /충|형/)
  if (monthClash.length)
    add('monthClash', 'career', '직업·소속·진로의 변동(이직이나 퇴사 고민, 부서·역할 변경, 진로 전환, 윗사람과의 마찰)', 3, hitPairs(monthClash))
  const yearClash = sel(['년지', '년간'], /충|형/)
  if (yearClash.length)
    add('yearClash', 'relation', '집안일·바깥 환경·먼 곳과 관련된 변화(타지 이동, 가족 쪽 일, 사회적 환경 전환)', 2, hitPairs(yearClash))
  const hourClash = unk ? [] : sel(['시지', '시간'], /충|형/)
  if (hourClash.length) add('hourClash', 'relation', '계획·자녀·후배·말년 준비와 관련된 변동', 1.5, hitPairs(hourClash))
  const dayHap = sel(['일지', '일간'], /^합/)
  if (dayHap.length) add('dayHap', 'love', '새로운 인연이나 약속·결속(연애의 시작, 동거·결혼 이야기, 계약처럼 어딘가에 묶이는 일)', 2, hitPairs(dayHap))
  const monthHap = sel(['월지', '월간'], /^합/)
  if (monthHap.length) add('monthHap', 'career', '새로운 소속·제안·업무 연결(직무 제안, 합류, 협업 관계)', 1.5, hitPairs(monthHap))
  const big = lk.hits.filter((h) => h.kind.startsWith('천극지충'))
  if (big.length) add('big', 'all', '한 번에 환경이 뒤집히는 큰 전환(생활 터전·직업·관계 중 한두 가지가 크게 바뀜)', 3, hitPairs(big))
  const rep = lk.hits.filter((h) => h.kind.startsWith('복음'))
  if (rep.length) add('repeat', 'all', '예전에 겪은 것과 같은 주제가 다시 돌아오는 시기(같은 유형의 사람·문제·선택이 반복)', 1.5, hitPairs(rep))

  const basisOf = `${lk.ganzi} 천간 ${lk.stemSipsin}·${lk.stemRole} / 지지 ${lk.branchSipsin}·${lk.branchRole}`
  if (groups.has(spouse))
    add(tone === '-' ? 'spouse-' : 'spouse+', 'love', tone === '-' ? '이성·배우자 문제로 마음이 복잡해짐(관계 부담, 갈등, 기대와 현실의 차이)' : '이성·배우자 인연의 주제가 활발해짐(만남, 연애 고민, 결혼 이야기)', 2 * both(spouse), basisOf)
  if (groups.has('관성') && spouse !== '관성') {
    const w = (a.groups.관성 >= 0.35 ? 2.5 : 2) * both('관성')
    add(tone === '-' ? 'gwan-' : 'gwan+', 'career', tone === '-' ? '책임·압박·평가에서 오는 스트레스가 커짐(업무 과중, 윗사람의 요구, 시험·심사)' : '직책·인정·시험 통과 같은 사회적 평가가 올라감', w, basisOf)
  }
  if (groups.has('인성'))
    add(tone === '-' ? 'in-' : 'in+', 'career', tone === '-' ? '생각이 많아 결정을 미루거나 서류·계약 문제, 누군가에게 기대려는 마음이 커짐' : '공부·자격·문서·계약이 풀리고 윗사람이나 귀인의 도움을 받기 쉬움', 2 * both('인성'), basisOf)
  if (groups.has('식상'))
    add(tone === '-' ? 'sik-' : 'sik+', 'career', tone === '-' ? '에너지가 새고 말실수·구설, 일을 벌여놓고 분산되기 쉬움' : '새로운 시도·표현·부업이나 창작, 직무를 바꾸고 싶은 욕구가 커짐', 2 * both('식상'), basisOf)
  if (groups.has('재성') && spouse !== '재성')
    add(tone === '-' ? 'jae-' : 'jae+', 'wealth', tone === '-' ? '돈 문제의 부담이 커짐(지출 증가, 빚, 현실적 책임)' : '수입과 거래 기회가 열림', 2 * both('재성'), basisOf)
  if (groups.has('재성') && spouse === '재성' && tone !== '-')
    add('jae+', 'wealth', '수입과 거래 기회가 열림', 1.5, basisOf)
  if (groups.has('비겁'))
    add('bi', 'relation', '경쟁자·동료·형제나 친구와 얽힌 일, 돈이 나가는 일', 1.5 * both('비겁'), basisOf)

  if (lk.notes.some((n) => n.includes('공망'))) add('void', 'all', '기대한 만큼 결과가 늦거나 허전하게 느껴지는 일', 1, '공망')
  return T
}

/** 과거 연도 중 사건 가능성이 큰 해를 골라 "검증 가능한 문장"으로 만든다 */
export interface PastMarker {
  year: number
  age: number
  ganzi: string
  weight: number
  themes: Theme[]
  turning: boolean
}
export function pastMarkers(r: SajuResult, a: Analysis, now = new Date(), maxCount = 8): PastMarker[] {
  const by = r.input.year
  const cur = now.getFullYear()
  const all: PastMarker[] = []
  for (let y = by + 14; y <= cur; y++) {
    const lk = yearLuck(r, a, y, false)
    const themes = themesOf(r, a, lk)
    const turning = !!lk.daewoon && lk.daewoon.startYear === y
    let w = themes.reduce((s, t) => s + t.weight, 0)
    if (turning) w += 2.5
    all.push({ year: y, age: y - by, ganzi: lk.ganzi, weight: Math.round(w * 10) / 10, themes, turning })
  }
  // 가장 신호가 강한 해 + 최근 3년은 반드시 포함
  const recent = all.filter((m) => m.year >= cur - 2)
  const top = [...all].filter((m) => m.year < cur - 2).sort((p, q) => q.weight - p.weight).slice(0, maxCount)
  const set = new Map<number, PastMarker>()
  for (const m of [...top, ...recent]) set.set(m.year, m)
  return Array.from(set.values()).sort((p, q) => p.year - q.year)
}

function markerLine(m: PastMarker): string {
  const t = [...m.themes].sort((p, q) => q.weight - p.weight).slice(0, 3)
  const body = t.map((x) => `${x.text} [근거 ${x.basis}]`).join(' / ')
  const turn = m.turning ? '10년 단위 대운이 바뀐 해(환경·역할·가치관 전환) / ' : ''
  return `${m.year}년 ${m.ganzi} (만 ${m.age}세 전후): ${turn}${body || '뚜렷한 충돌 신호는 약함'}`
}

/** 현재 시점 진단 텍스트 */
export function nowText(r: SajuResult, a: Analysis, now = new Date()): string {
  const at = luckAt(r, a, now)
  const L: string[] = []
  L.push(`[코드가 계산한 현재 시점 진단 — 기준일 ${at.date}]`)
  const agg = new Map<string, { t: Theme; w: number; from: string[] }>()
  const feed = (lk: Luck | null, scale: number, label: string) => {
    if (!lk) return
    for (const t of themesOf(r, a, lk)) {
      const cur = agg.get(t.key)
      if (cur) { cur.w += t.weight * scale; if (!cur.from.includes(label)) cur.from.push(label) }
      else agg.set(t.key, { t, w: t.weight * scale, from: [label] })
    }
  }
  if (at.daewoon) {
    const dw = daewoonOverview(r, a).find((d) => d.ganzi === at.daewoon!.ganzi)
    L.push(`현재 대운: ${at.daewoon.ganzi} (${at.daewoon.ageFrom}세~, ${at.daewoon.startYear}년 시작, ${at.daewoon.nth}년차${at.daewoon.yearsLeft !== null ? `, 다음 대운까지 약 ${at.daewoon.yearsLeft}년` : ''})`)
    if (dw) {
      L.push(`대운 성격: 천간 ${dw.stemSipsin}·${dw.stemRole} / 지지 ${dw.branchSipsin}·${dw.branchRole}, 원국과의 관계 점수 ${dw.score > 0 ? '+' : ''}${dw.score} (${dw.tone})`)
      feed(dw, 0.6, '대운')
    }
  }
  L.push(`올해 세운: ${at.year.ganzi} 천간 ${at.year.stemSipsin}·${at.year.stemRole} / 지지 ${at.year.branchSipsin}·${at.year.branchRole}, 점수 ${at.year.score > 0 ? '+' : ''}${at.year.score} (${at.year.tone})`)
  feed(at.year, 1, '올해 세운')
  L.push(`이번 달 월운: ${at.month.ganzi} 천간 ${at.month.stemSipsin}·${at.month.stemRole} / 지지 ${at.month.branchSipsin}·${at.month.branchRole}, 점수 ${at.month.score > 0 ? '+' : ''}${at.month.score} (${at.month.tone})`)
  feed(at.month, 0.7, '이번 달 월운')
  // 작년의 여파도 일부 반영
  const prev = yearLuck(r, a, now.getFullYear() - 1, false)
  feed(prev, 0.5, '작년 세운의 여파')

  const ranked = Array.from(agg.values()).sort((p, q) => q.w - p.w).slice(0, 6)
  L.push('지금 겪고 있을 가능성이 큰 상황 가설 (근거 강도순, 확정 아님):')
  ranked.forEach((h, i) => L.push(`${i + 1}. ${h.t.text} — 시점: ${h.from.join('+')}, 근거: ${h.t.basis}, 강도 ${Math.round(h.w * 10) / 10}`))
  if (!ranked.length) L.push('- 뚜렷한 충돌·합 신호가 약해 비교적 평탄한 시기')

  const marks = pastMarkers(r, a, now)
  L.push('과거 연도 검증 마커 (사용자가 직접 맞는지 확인할 수 있는 해):')
  for (const m of marks) L.push('- ' + markerLine(m))
  L.push('※ 위 가설과 마커는 대운·세운·월운이 원국과 부딪히는 자리에서 뽑은 "가능성 높은 주제"이며 사건을 확정하지 않는다. 풀이에서는 "~했을 가능성이 높습니다" 어조로 쓰고, 마지막에 맞는지 확인을 요청할 것.')
  return L.join('\n')
}
