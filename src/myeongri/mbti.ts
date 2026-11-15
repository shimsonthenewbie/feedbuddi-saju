/**
 * 내 사주와 잘 맞는 MBTI (재미용).
 * MBTI와 사주는 서로 다른 체계라 과학적 대응 관계는 없다.
 * 여기서는 "유형의 기질을 오행으로 어림 환산한 값"을 "내 사주의 용신·희신·기신"과 견줘서 점수를 낸다.
 * 환산표와 글은 용용사주가 새로 정한 것이다.
 */
import type { Element } from '../engine/types'
import { roleOf, type Analysis, type Role } from './index'

const ELS: Element[] = ['tree', 'fire', 'earth', 'metal', 'water']
export const EL_KO: Record<Element, string> = { tree: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' }
const EL_FEEL: Record<Element, string> = { tree: '뻗어 나가는 성장', fire: '열정과 표현', earth: '안정과 현실감', metal: '원칙과 결단', water: '유연함과 깊은 생각' }

type V = Record<Element, number>
const v = (tree: number, fire: number, earth: number, metal: number, water: number): V => ({ tree, fire, earth, metal, water })
/** 글자 하나가 더하는 오행 기질(어림값) */
const LETTER: Record<string, V> = {
  E: v(0.5, 1, 0, 0, 0), I: v(0, 0, 0.5, 0, 1),
  N: v(1, 0, 0, 0, 0.5), S: v(0, 0, 1, 0.5, 0),
  T: v(0, 0, 0, 1, 0.5), F: v(0, 0.7, 0.3, 0, 0.3),
  J: v(0, 0, 0.6, 0.6, 0), P: v(0.6, 0, 0, 0, 0.6),
}
export const TYPES: Record<string, string> = {
  INTJ: '멀리 보고 계획부터 세우는 타입', INTP: '혼자 파고들며 원리를 따지는 타입', ENTJ: '목표를 정하면 밀고 나가는 타입', ENTP: '새 아이디어로 판을 흔드는 타입',
  INFJ: '조용하지만 속이 깊고 신념이 강한 타입', INFP: '가치관이 분명한 감성형 타입', ENFJ: '사람을 챙기며 이끄는 타입', ENFP: '열정과 호기심으로 사람을 끄는 타입',
  ISTJ: '약속과 원칙을 지키는 성실한 타입', ISFJ: '묵묵히 챙겨 주는 든든한 타입', ESTJ: '규칙과 실행으로 조직을 굴리는 타입', ESFJ: '분위기와 사람을 살뜰히 챙기는 타입',
  ISTP: '말보다 손으로 해결하는 담백한 타입', ISFP: '조용히 제 감각대로 사는 부드러운 타입', ESTP: '일단 부딪혀 보는 행동파', ESFP: '현장을 즐기는 분위기 메이커',
}
const profileOf = (t: string): V => {
  const o = v(0, 0, 0, 0, 0)
  for (const ch of t) for (const e of ELS) o[e] += LETTER[ch][e]
  const sum = ELS.reduce((s, e) => s + o[e], 0)
  for (const e of ELS) o[e] /= sum
  return o
}
const ROLE_W: Record<Role, number> = { 용신: 2, 희신: 1.2, 한신: 0, 구신: -0.8, 기신: -1.5 }

export interface MbtiRead { type: string; line: string; score: number; reason: string }
export interface MbtiOut { best: MbtiRead[]; worst: MbtiRead[]; yong: string; careEl: string; head: string }

export function mbtiOf(a: Analysis): MbtiOut {
  const roles = Object.fromEntries(ELS.map((e) => [e, roleOf(a, e)])) as Record<Element, Role>
  const yongEl = ELS.reduce((m, e) => (ROLE_W[roles[e]] > ROLE_W[roles[m]] ? e : m), ELS[0])
  const careEl = ELS.reduce((m, e) => (ROLE_W[roles[e]] < ROLE_W[roles[m]] ? e : m), ELS[0])
  const all = Object.keys(TYPES).map((t) => {
    const p = profileOf(t)
    const score = ELS.reduce((s, e) => s + p[e] * ROLE_W[roles[e]], 0)
    const top = ELS.reduce((m, e) => (p[e] > p[m] ? e : m), ELS[0])
    return { type: t, p, score, top }
  }).sort((x, y) => y.score - x.score)
  const mk = (x: (typeof all)[number], good: boolean): MbtiRead => {
    const give = ELS.filter((e) => ROLE_W[roles[e]] > 0).reduce((m, e) => (x.p[e] > x.p[m] ? e : m), yongEl)
    const reason = good
      ? `내 사주에 필요한 ${EL_KO[give]} 기운(${EL_FEEL[give]})이 이 유형에 넉넉해서, 같이 있으면 부족한 쪽이 채워져요.`
      : `이 유형은 ${EL_KO[x.top]} 기운(${EL_FEEL[x.top]})이 강한데, 내 사주에서는 그 기운이 부담이 되는 쪽이라 서로 힘이 들 수 있어요.`
    return { type: x.type, line: TYPES[x.type], score: x.score, reason }
  }
  return {
    best: all.slice(0, 3).map((x) => mk(x, true)),
    worst: all.slice(-2).reverse().map((x) => mk(x, false)),
    yong: EL_KO[yongEl], careEl: EL_KO[careEl],
    head: `내 사주에서 가장 필요한 기운은 ${EL_KO[yongEl]}이고, 넘치기 쉬워 조심할 기운은 ${EL_KO[careEl]}이에요.`,
  }
}

export const TYPE_LIST = Object.keys(TYPES)
const scoreOf = (a: Analysis, t: string): number => {
  const p = profileOf(t)
  return ELS.reduce((s, e) => s + p[e] * ROLE_W[roleOf(a, e)], 0)
}
const rankOf = (a: Analysis, t: string): number => {
  const sc = scoreOf(a, t)
  return TYPE_LIST.filter((x) => scoreOf(a, x) > sc + 1e-9).length + 1
}
const tierOf = (rank: number) => (rank <= 4 ? '잘 맞는 편' : rank <= 12 ? '무난한 편' : '신경 써야 하는 편')

/** 내가 고른 유형과 내 사주를 견준 글 */
export function myTypeRead(a: Analysis, t: string): { head: string; lines: string[] } {
  const rank = rankOf(a, t)
  const g = a.groups
  const out = g.식상 + g.비겁, inn = g.인성 + g.관성
  const lines: string[] = []
  const E = t[0] === 'E'
  if (E && out < 0.4) lines.push('겉으로는 활발한 편인데, 사주에는 안쪽으로 모으는 기운이 더 많아요. 사람을 만난 뒤 혼자 쉬는 시간이 꼭 필요한 사람이에요.')
  else if (!E && out > 0.55) lines.push('겉으로는 조용한 편인데, 사주에는 표현하고 내보내는 기운이 많아요. 가까운 사람 앞에서는 말이 많아지는 숨은 외향형일 수 있어요.')
  else lines.push(E ? '활발한 성향이 사주의 표현하는 기운과 잘 맞물려요. 나서는 일이 어색하지 않아요.' : '조용한 성향이 사주의 모으는 기운과 잘 맞물려요. 혼자 깊이 생각하는 시간이 힘이 돼요.')
  const J = t[3] === 'J'
  if (J && g.식상 > 0.3) lines.push('계획을 세우는 성향인데 사주에는 즉흥적으로 튀어나오는 기운도 있어요. 계획표에 여유 칸을 두면 훨씬 편해요.')
  else if (!J && g.관성 > 0.3) lines.push('자유로운 성향인데 사주에는 책임감과 규율의 기운이 있어요. 마감이 다가오면 오히려 집중력이 올라가는 타입일 수 있어요.')
  else lines.push(J ? '계획하는 성향이 사주의 질서 잡는 기운과 잘 맞아요.' : '유연한 성향이 사주의 흐름과 잘 맞아요.')
  const reads = ELS.map((e) => ({ e, p: profileOf(t)[e], r: roleOf(a, e) })).sort((x, y) => y.p - x.p)[0]
  lines.push(reads.r === '용신' || reads.r === '희신'
    ? `이 유형의 중심 기운인 ${EL_KO[reads.e]}은 내 사주에 필요한 기운이에요. 타고난 성향을 살릴수록 운이 따라오기 쉬워요.`
    : reads.r === '기신' || reads.r === '구신'
      ? `이 유형의 중심 기운인 ${EL_KO[reads.e]}은 내 사주에서 넘치기 쉬운 쪽이에요. 성향이 강하게 나올 때 한 템포 쉬어 가면 좋아요.`
      : `이 유형의 중심 기운인 ${EL_KO[reads.e]}은 내 사주에서 큰 부담도 도움도 아닌 무난한 기운이에요.`)
  return { head: `${t} (${TYPES[t]}) — 내 사주와는 16유형 중 ${rank}위, ${tierOf(rank)}이에요.`, lines }
}

/** 두 사람의 사주가 서로의 유형을 어떻게 보는지 */
export function pairRead(aA: Analysis, aB: Analysis, tA: string, tB: string): { score: number; head: string; lines: string[] } {
  const ra = rankOf(aA, tB), rb = rankOf(aB, tA)
  const raw = (17 - ra + (17 - rb)) / 32 // 0.06~1
  const score = Math.round(45 + raw * 50)
  const same = [0, 1, 2, 3].filter((i) => tA[i] === tB[i]).length
  const lines = [
    `첫 번째 사람의 사주는 두 번째 사람의 유형(${tB})을 16유형 중 ${ra}위로, ${tierOf(ra)}으로 봐요.`,
    `두 번째 사람의 사주는 첫 번째 사람의 유형(${tA})을 16유형 중 ${rb}위로, ${tierOf(rb)}으로 봐요.`,
    same === 4 ? '두 사람은 같은 유형이라 말하지 않아도 통하는 대신, 같은 부분에서 같이 넘어지기 쉬워요.'
      : same === 0 ? '네 글자가 모두 달라서 서로 다른 점이 신선하게 느껴지는 조합이에요. 대신 같은 상황을 전혀 다르게 받아들일 수 있어서 설명이 필요해요.'
        : `네 글자 중 ${same}개가 같아서 통하는 부분이 있고, 다른 글자 쪽에서 서로 배울 점이 생겨요.`,
  ]
  return { score, head: `${tA} × ${tB}`, lines }
}
