// 토정비결 작괘(괘 만들기) 계산. 표는 원전의 육갑 조견표(일진수·월건수·태세수)와
// 같은 값을 규칙으로 만들어 쓴다. (60간지 전부를 원전 사진과 대조해 일치 확인)
// 괘 풀이 글은 여기 없음 — 별도로 쉬운 말로 새로 쓴다.
const STEMS = '甲乙丙丁戊己庚辛壬癸'
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'

const group = (pairs: Array<[string, number]>) => {
  const m: Record<string, number> = {}
  for (const [k, v] of pairs) for (const c of k) m[c] = v
  return m
}
// 선천수
const SEON = group([['甲己子午', 9], ['乙庚丑未', 8], ['丙辛寅申', 7], ['丁壬卯酉', 6], ['戊癸辰戌', 5], ['巳亥', 4]])
// 중천수
const JUNG = group([['甲己辰戌丑未', 11], ['乙庚申酉', 10], ['丙辛亥子', 9], ['丁壬寅卯', 8], ['戊癸巳午', 7]])

export type Ganji = { stem: string; branch: string }
export const ganjiOfYear = (y: number): Ganji => ({
  stem: STEMS[(((y - 4) % 10) + 10) % 10],
  branch: BRANCHES[(((y - 4) % 12) + 12) % 12],
})
/** 태세수 = 중천(천간)+중천(지지) */ export const taese = (g: Ganji) => JUNG[g.stem] + JUNG[g.branch]
/** 월건수 = 선천(천간)+선천(지지) */ export const wolgeon = (g: Ganji) => SEON[g.stem] + SEON[g.branch]
/** 일진수 = 선천(천간)+중천(지지) */ export const iljin = (g: Ganji) => SEON[g.stem] + JUNG[g.branch]

const wrap = (n: number, d: number) => n % d || d

export interface TojeongInput {
  /** 보려는 해(양력 연도) */ year: number
  /** 음력 출생연도 */ birthLunarYear: number
  /** 올해 기준 음력 생월이 대월이면 true(30일), 소월이면 false(29일) */ monthIsBig: boolean
  /** 보려는 해의 생월 월건 간지 */ monthGanji: Ganji
  /** 음력 생일(1~30) */ lunarDay: number
  /** 생일 날짜의 일진 간지 */ dayGanji: Ganji
}
export function tojeongKwae(i: TojeongInput) {
  const age = i.year - i.birthLunarYear + 1
  const up = wrap(age + taese(ganjiOfYear(i.year)), 8)
  const mid = wrap((i.monthIsBig ? 30 : 29) + wolgeon(i.monthGanji), 6)
  const low = wrap(i.lunarDay + iljin(i.dayGanji), 3)
  return { up, mid, low, code: `${up}${mid}${low}` }
}
