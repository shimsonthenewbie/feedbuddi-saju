import type { SajuResult } from '@orrery/core/types'
import { ELEMENT_HANJA } from '@orrery/core/constants'

export type Lang = 'ko' | 'en'

export interface Person {
  label: string
  placeName: string
  result: SajuResult
}

const g = (r: SajuResult) => (r.input.gender === 'M' ? '男' : '女')
const pad = (n: number) => String(n).padStart(2, '0')

/** 사주 차트를 AI가 읽기 좋은 텍스트로 만든다 */
export function chartText(p: Person): string {
  const r = p.result
  const i = r.input
  const q = !!i.unknownTime
  const L: string[] = []
  const time = q ? '(time unknown / 시간 모름)' : `${pad(i.hour)}:${pad(i.minute)}`
  L.push(`[${p.label}] ${i.year}-${pad(i.month)}-${pad(i.day)} ${time}, ${g(r)}, ${p.placeName} (${i.timezone ?? 'Asia/Seoul'})`)
  const names = ['時柱', '日柱', '月柱', '年柱']
  r.pillars.forEach((d, idx) => {
    const unk = q && idx === 0
    L.push(
      `${names[idx]}: ${unk ? '??' : d.pillar.ganzi} | 천간십신 ${unk ? '?' : d.stemSipsin} | 지지십신 ${unk ? '?' : d.branchSipsin} | 12운성 ${unk ? '?' : d.unseong} | 12신살 ${unk ? '?' : d.sinsal} | 지장간 ${unk ? '?' : d.jigang}`,
    )
  })
  L.push(`일간(Day Master): ${r.pillars[1].pillar.stem}`)
  L.push(`공망: ${r.gongmang.branches.join('')}`)

  const pn: Record<string, string> = { '0,1': '時-日', '0,2': '時-月', '0,3': '時-年', '1,2': '日-月', '1,3': '日-年', '2,3': '月-年' }
  const gz = r.pillars.map((d) => d.pillar.ganzi)
  const rel: string[] = []
  r.relations.pairs.forEach((v, key) => {
    const [a, b] = key.split(',').map(Number)
    const parts: string[] = []
    for (const x of v.stem) parts.push(`${gz[a][0]}${gz[b][0]}${x.type}${x.detail ? ELEMENT_HANJA[x.detail] ?? '' : ''}`)
    for (const x of v.branch) parts.push(`${gz[a][1]}${gz[b][1]}${x.type}${x.detail ? ELEMENT_HANJA[x.detail] ?? `(${x.detail})` : ''}`)
    if (parts.length) rel.push(`${pn[key] ?? key}: ${parts.join(', ')}`)
  })
  for (const x of r.relations.triple) rel.push(`${x.type}${x.detail ? ELEMENT_HANJA[x.detail] ?? '' : ''}局`)
  for (const x of r.relations.directional) rel.push(`${x.type}${x.detail ? ELEMENT_HANJA[x.detail] ?? '' : ''}`)
  if (rel.length) L.push('간지 관계: ' + rel.join(' / '))

  const s = r.specialSals
  const sal: string[] = []
  if (s.baekho) sal.push('백호살')
  if (s.goegang) sal.push('괴강살')
  if (s.hongyeom) sal.push('홍염살')
  if (s.yangin.length) sal.push('양인살')
  if (s.dohwa.length) sal.push('도화살')
  if (s.cheonul.length) sal.push('천을귀인')
  if (s.cheonduk.length) sal.push('천덕귀인')
  if (s.wolduk.length) sal.push('월덕귀인')
  if (s.munchang.length) sal.push('문창귀인')
  if (s.geumyeo.length) sal.push('금여록')
  if (sal.length) L.push('신살: ' + sal.join(', '))

  L.push('대운: ' + r.daewoon.map((d) => `${d.age}세 ${d.ganzi}(${d.stemSipsin}/${d.branchSipsin}, ${d.unseong})`).join(' → '))
  return L.join('\n')
}

const NOW = () => new Date().getFullYear()

const INTRO: Record<Lang, string> = {
  ko: '당신은 사주명리(四柱八字)를 깊이 아는 친절한 상담가입니다. 아래는 만세력 프로그램으로 계산한 사주 차트이며, 계산은 이미 정확하니 다시 계산하지 말고 이 데이터를 근거로만 풀이해 주세요.',
  en: 'You are a friendly, knowledgeable BaZi (Four Pillars of Destiny) consultant. The chart below was already calculated by a reliable calendar program, so do not recalculate it. Base your reading only on this data.',
}

const SOLO_ASK: Record<Lang, string> = {
  ko: `풀이 요청:
1. 일간을 중심으로 한 타고난 성격과 강점·약점
2. 오행의 균형과 부족한 기운을 채우는 생활 팁
3. 연애운과 인간관계 스타일
4. 직업·재물운의 경향
5. 앞으로의 대운 흐름과 올해(${NOW()}년) 운세
말투는 따뜻하고 쉽게, 한자 용어는 짧게 풀어서 설명해 주세요. 단정적인 예언 대신 경향과 조언 위주로, 마지막에 한 줄 요약을 붙여 주세요.`,
  en: `Please cover:
1. Core personality, strengths and weaknesses based on the Day Master
2. Five-element balance and everyday tips for the weak element
3. Love and relationship style
4. Career and wealth tendencies
5. Luck-cycle flow and this year (${NOW()})
Use a warm, easy tone and briefly explain any Chinese terms. Give tendencies and advice, not absolute predictions, and end with a one-line summary.`,
}

const MATCH_ASK: Record<Lang, string> = {
  ko: `궁합 풀이 요청:
1. 두 사람의 일간 관계(오행의 생극)와 첫인상 케미
2. 서로에게 끌리는 포인트와 부딪히기 쉬운 포인트
3. 두 사주 사이의 합·충 등 간지 관계
4. 서로에게 도움이 되는 점과 함께할 때 좋은 활동
5. 궁합 점수(100점 만점)와 한 줄 총평
재미로 보는 풀이이니 유쾌하고 따뜻한 말투로, 단정적인 예언 대신 경향 위주로 설명해 주세요.`,
  en: `Please do a compatibility reading:
1. Day Master relationship (five-element generating/controlling) and first-impression chemistry
2. What attracts them and where they may clash
3. Stem/branch combinations and clashes between the two charts
4. How they help each other and good things to do together
5. A compatibility score out of 100 and a one-line summary
Keep it fun and warm, with tendencies rather than absolute predictions.`,
}

export function buildPrompt(mode: 'solo' | 'match', lang: Lang, people: Person[]): string {
  const charts = people.map(chartText).join('\n\n')
  const ask = mode === 'solo' ? SOLO_ASK[lang] : MATCH_ASK[lang]
  const tail = lang === 'ko' ? '답변은 한국어로 해주세요.' : 'Please answer in English.'
  return `${INTRO[lang]}\n\n${charts}\n\n${ask}\n${tail}`
}
