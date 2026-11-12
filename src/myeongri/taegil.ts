/**
 * 택일(좋은 날 고르기). 옛 책력의 규칙(建除十二神·黃道/黑道·宜忌·손 없는 날)과
 * 내 띠·일지와의 충·합을 함께 본다. 점수는 용용사주의 간단한 합산 규칙이고, 풀이 글은 새로 썼다.
 * 달력 데이터(宜忌 등)는 lunar-javascript(MIT)의 전통 만년력 표를 쓴다.
 */
import { Solar } from 'lunar-javascript'

export type CatKey = 'move' | 'wedding' | 'open' | 'contract' | 'build' | 'trip' | 'car' | 'medical' | 'rite' | 'study' | 'burial'

interface Cat { name: string; hint: string; terms: string[]; sonUpsin?: boolean; direction?: boolean }
export const CATS: Record<CatKey, Cat> = {
  move:     { name: '이사·입주', hint: '새 집에 들어가는 날', terms: ['移徙', '入宅', '出火', '安床'], sonUpsin: true, direction: true },
  wedding:  { name: '결혼·상견례', hint: '결혼식, 약혼, 상견례', terms: ['嫁娶', '纳采', '订盟', '问名', '会亲友'], sonUpsin: true },
  open:     { name: '개업·오픈', hint: '가게 문을 열거나 간판을 거는 날', terms: ['开市', '挂匾', '立券', '交易'] },
  contract: { name: '계약·거래', hint: '계약, 부동산·큰 거래, 돈 들어오는 날', terms: ['立券', '交易', '纳财', '置产'] },
  build:    { name: '공사·인테리어', hint: '착공, 수리, 상량', terms: ['动土', '修造', '上梁', '竖柱', '起基'] },
  trip:     { name: '여행·출장', hint: '먼 길을 떠나는 날', terms: ['出行'] },
  car:      { name: '차·큰 물건 구입', hint: '차, 가전 같은 큰 물건 사거나 받는 날', terms: ['交易', '纳财', '出行'] },
  medical:  { name: '수술·치료 시작', hint: '큰 치료나 시술을 시작하는 날', terms: ['治病', '求医', '针灸', '经络'] },
  rite:     { name: '제사·고사·기도', hint: '제사, 고사, 기도하는 날', terms: ['祭祀', '祈福', '谢土', '斋醮'] },
  study:    { name: '입학·새 배움', hint: '입학, 새로운 공부·기술 시작', terms: ['入学', '习艺'] },
  burial:   { name: '장례·이장', hint: '장례, 이장, 묘 관련 일', terms: ['安葬', '破土', '启钻', '移柩', '入殓'] },
}

const BR = '子丑寅卯辰巳午未申酉戌亥'
const CHONG: Record<string, string> = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' }
const HAP6: Record<string, string> = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' }
const SAMHAP = ['申子辰', '巳酉丑', '寅午戌', '亥卯未']
const WONJIN: Record<string, string> = { 子: '未', 未: '子', 丑: '午', 午: '丑', 寅: '酉', 酉: '寅', 卯: '申', 申: '卯', 辰: '亥', 亥: '辰', 巳: '戌', 戌: '巳' }
const ZODIAC: Record<string, string> = { 子: '쥐', 丑: '소', 寅: '호랑이', 卯: '토끼', 辰: '용', 巳: '뱀', 午: '말', 未: '양', 申: '원숭이', 酉: '닭', 戌: '개', 亥: '돼지' }
const DIR: Record<string, string> = { 东: '동쪽', 南: '남쪽', 西: '서쪽', 北: '북쪽' }
const ZX_KO: Record<string, string> = { 建: '건(세우는 날)', 除: '제(덜어 내는 날)', 满: '만(가득 찬 날)', 平: '평(평평한 날)', 定: '정(정하는 날)', 执: '집(붙드는 날)', 破: '파(깨지는 날)', 危: '위(위태로운 날)', 成: '성(이루는 날)', 收: '수(거두는 날)', 开: '개(여는 날)', 闭: '폐(닫는 날)' }
const ZX_SCORE: Record<string, number> = { 成: 1, 开: 1, 满: 1, 定: 1, 破: -2, 危: -1, 闭: -1 }

export const yearBranch = (y: number) => BR[(((y - 4) % 12) + 12) % 12]
export const zodiacOf = (b: string) => ZODIAC[b]

export interface DayPick {
  date: Date
  lunar: string
  ganji: string
  score: number
  grade: '대길' | '길' | '보통' | '조심' | '피하세요'
  reasons: string[]
  cautions: string[]
  note?: string
}
export interface Me { yearBranch?: string; dayBranch?: string }

const pairRel = (me: string | undefined, day: string, label: string, reasons: string[], cautions: string[], w: number): number => {
  if (!me) return 0
  if (CHONG[me] === day) { cautions.push(`${label}와 충이 되는 날`); return -3 * w }
  if (WONJIN[me] === day) { cautions.push(`${label}와 원진이 되는 날`); return -1 * w }
  if (HAP6[me] === day || SAMHAP.some((g) => g.includes(me) && g.includes(day) && me !== day)) { reasons.push(`${label}와 합이 되는 날`); return 1 * w }
  return 0
}

export function scoreDay(date: Date, cat: CatKey, me: Me = {}): DayPick {
  const c = CATS[cat]
  const lu = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunar()
  const yi: string[] = lu.getDayYi()
  const ji: string[] = lu.getDayJi()
  const reasons: string[] = []
  const cautions: string[] = []
  let sc = 0
  const goods = c.terms.filter((t) => yi.includes(t))
  const bads = c.terms.filter((t) => ji.includes(t))
  if (goods.length) { sc += Math.min(3, goods.length) * 2; reasons.push(`전통 책력에서 ${c.name.split('·')[0]} 일에 맞다고 보는 날`) }
  if (bads.length) { sc -= 4; cautions.push(`전통 책력에서 ${c.name.split('·')[0]} 일을 꺼리는 날`) }
  if (yi.includes('诸事不宜') || ji.includes('诸事不宜')) { sc -= 4; cautions.push('모든 일에 좋지 않다고 보는 날') }
  const lk = lu.getDayTianShenType() === '黄道'
  if (lk) { sc += 1; reasons.push('황도일(길한 신이 드는 날)') } else { sc -= 1; cautions.push('흑도일(흉한 신이 드는 날)') }
  const zx: string = lu.getZhiXing()
  const zs = ZX_SCORE[zx] ?? 0
  if (cat === 'burial') { /* 장례는 건제 가점 없음 */ } else if (zs) { sc += zs; (zs > 0 ? reasons : cautions).push(`건제 12신: ${ZX_KO[zx]}`) }
  if (c.sonUpsin) {
    const d = lu.getDay()
    if (d % 10 === 9 || d % 10 === 0) { sc += 2; reasons.push('손 없는 날(음력 9·10·19·20·29·30일)') }
  }
  const dayBr: string = lu.getDayZhi()
  sc += pairRel(me.yearBranch, dayBr, `내 띠(${ZODIAC[me.yearBranch ?? ''] ?? ''})`, reasons, cautions, 1)
  sc += pairRel(me.dayBranch, dayBr, '내 일지', reasons, cautions, 1)
  const grade: DayPick['grade'] = sc >= 6 ? '대길' : sc >= 3 ? '길' : sc >= 1 ? '보통' : sc >= -2 ? '조심' : '피하세요'
  const sha = DIR[lu.getDaySha()]
  return {
    date: new Date(date), lunar: `음력 ${Math.abs(lu.getMonth())}월 ${lu.getDay()}일`, ganji: lu.getDayInGanZhi(),
    score: sc, grade, reasons: reasons.slice(0, 4), cautions: cautions.slice(0, 3),
    note: c.direction && sha ? `이날은 ${sha} 방향에서 살이 낀다고 보니, 가능하면 그쪽으로 이사하는 길은 피하세요.` : undefined,
  }
}

/** 기간 안에서 좋은 날 순위와 피할 날을 고른다 */
export function pickDays(cat: CatKey, from: Date, days: number, me: Me = {}, onlyWeekend = false) {
  const all: DayPick[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    if (onlyWeekend && ![0, 6].includes(d.getDay())) continue
    all.push(scoreDay(d, cat, me))
  }
  const best = [...all].filter((p) => p.score >= 1).sort((a, b) => b.score - a.score || +a.date - +b.date).slice(0, 10).sort((a, b) => +a.date - +b.date)
  const worst = [...all].filter((p) => p.score <= -3).sort((a, b) => a.score - b.score || +a.date - +b.date).slice(0, 6).sort((a, b) => +a.date - +b.date)
  return { best, worst, total: all.length }
}
